<?php

namespace App\Http\Controllers;

use App\Models\PaymentSetting;
use App\Services\SepayClient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class SepayOAuthController extends Controller
{
    private const PUBLIC_KEY = <<<KEY
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA43b0YkO8A81+fLdTYnjz
0Dj0TeS0QJYebk7QsFeCL47yk1pMrheYKG+vIyuZvc50ZSFUwHDTr20zndxXySCY
r9P7cfPhG6pzgx1FbIsnl7SfUwICFnyNryzdezR/YwwKbmH0meThofLbOngBWmTH
pItU/ufUQprwBjrQcMfqXm8EAeYmY4oQkMEgp4lUcis0LLFscSnXGEAPZrSC7xV+
Xp3dNxvYHM6c7G6tFMkrrYhBLzBUBIvGK3T39YE7WmEHDPhoXKt4H9CoM0k7XoL1
XKOQryqIw9P+uSzTy/pKIIYmHtlAtiga6AqqXJAnnkbI3wtABFEzIWx3XOp2IEVU
FQIDAQAB
-----END PUBLIC KEY-----
KEY;

    public function connect()
    {
        $state = bin2hex(random_bytes(16));
        $settingsUserId = getPaymentSettingsUserId() ?: auth()->id();

        session([
            'sepay_oauth_state' => $state,
            'sepay_oauth_user_id' => $settingsUserId,
        ]);

        Cache::put($this->stateCacheKey($state), $settingsUserId, now()->addMinutes(10));
        $this->save((int) $settingsUserId, 'sepay_connection_status', 'connecting');

        return redirect()->away($this->proxyInitUrl($state));
    }

    public function callback(Request $request)
    {
        $state = (string) $request->query('state', $request->input('state', ''));
        $settingsUserId = $this->resolveSettingsUserId($state);

        if ($request->filled('error')) {
            $this->markConnectionFailed($settingsUserId, 'failed');

            Log::warning('SePay OAuth authorization failed', [
                'settings_user_id' => $settingsUserId,
                'error' => $request->query('error', $request->input('error')),
            ]);

            return $this->popupComplete(false, __('SePay authorization failed. Please try again.'));
        }

        $accessToken = (string) $request->query('access_token', $request->input('access_token', ''));
        $refreshToken = (string) $request->query('refresh_token', $request->input('refresh_token', ''));
        $signature = (string) $request->query('signature', $request->input('signature', ''));
        $expiresIn = $request->query('expires_in', $request->input('expires_in'));

        if ($accessToken === '' || $state === '' || $signature === '') {
            $this->markConnectionFailed($settingsUserId, 'failed');

            return $this->popupComplete(false, __('Missing SePay token, state or signature.'));
        }

        if (!$settingsUserId) {
            Log::warning('SePay OAuth callback rejected: invalid state', ['state' => $state]);

            return $this->popupComplete(false, __('Invalid SePay connection state. Please start the connection again.'));
        }

        try {
            if (!$this->verifySignature($accessToken, $state, $signature)) {
                Log::warning('SePay OAuth callback rejected: invalid RSA signature', [
                    'settings_user_id' => $settingsUserId,
                    'state' => $state,
                ]);

                $this->markConnectionFailed($settingsUserId, 'failed');

                return $this->popupComplete(false, __('Invalid SePay callback signature.'));
            }

            $this->saveProxyTokens((int) $settingsUserId, $accessToken, $refreshToken, $expiresIn);

            if (!(new SepayClient((int) $settingsUserId))->syncProfileAndAccounts()) {
                return $this->popupComplete(false, __('SePay was authorized, but no bank account could be synced. Please add a bank account in SePay and sync again.'));
            }

            session()->forget(['sepay_oauth_state', 'sepay_oauth_user_id']);

            return $this->popupComplete(true, __('SePay connected successfully.'));
        } catch (\Throwable $e) {
            $this->markConnectionFailed($settingsUserId, 'failed');

            Log::warning('SePay OAuth callback failed', [
                'settings_user_id' => $settingsUserId,
                'message' => $e->getMessage(),
            ]);

            return $this->popupComplete(false, __('Could not connect SePay. Please check your OAuth configuration and try again.'));
        }
    }

    public function sync(Request $request)
    {
        $settingsUserId = getPaymentSettingsUserId() ?: auth()->id();

        try {
            if (!(new SepayClient((int) $settingsUserId))->syncProfileAndAccounts()) {
                if ($request->expectsJson()) {
                    return response()->json([
                        'success' => false,
                        'message' => __('SePay account synced, but no receiving bank account was found.'),
                        'sepay' => $this->statusPayload((int) $settingsUserId),
                    ]);
                }

                return back()->with('error', __('SePay account synced, but no receiving bank account was found.'));
            }

            if ($request->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => __('SePay account synced successfully.'),
                    'sepay' => $this->statusPayload((int) $settingsUserId),
                ]);
            }

            return back()->with('success', __('SePay account synced successfully.'));
        } catch (\Throwable $e) {
            Log::warning('SePay OAuth sync failed', [
                'settings_user_id' => $settingsUserId,
                'message' => $e->getMessage(),
            ]);

            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => __('Could not sync SePay account. Please try again.'),
                    'sepay' => $this->statusPayload((int) $settingsUserId),
                ], 422);
            }

            return back()->with('error', __('Could not sync SePay account. Please try again.'));
        }
    }

    public function status()
    {
        $settingsUserId = getPaymentSettingsUserId() ?: auth()->id();

        return response()->json($this->statusPayload((int) $settingsUserId));
    }

    public function disconnect(Request $request)
    {
        $settingsUserId = getPaymentSettingsUserId() ?: auth()->id();

        foreach ([
            'sepay_oauth_connected',
            'sepay_access_token',
            'sepay_refresh_token',
            'sepay_token_type',
            'sepay_scope',
            'sepay_expired_at',
            'sepay_connected_at',
            'sepay_connection_status',
            'sepay_account_email',
            'sepay_account_display_name',
            'sepay_account_avatar',
            'sepay_bank_accounts',
            'sepay_bank_account_id',
            'sepay_webhook_id',
            'sepay_last_synced_at',
        ] as $key) {
            $this->save((int) $settingsUserId, $key, '');
        }

        Cache::forget("sepay:{$settingsUserId}:profile");
        Cache::forget("sepay:{$settingsUserId}:bank_accounts");

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => __('SePay disconnected successfully.'),
                'sepay' => $this->statusPayload((int) $settingsUserId),
            ]);
        }

        return back()->with('success', __('SePay disconnected successfully.'));
    }

    private function statusPayload(int $settingsUserId): array
    {
        $settings = PaymentSetting::getUserSettings($settingsUserId);
        $bankAccounts = json_decode((string) ($settings['sepay_bank_accounts'] ?? '[]'), true);

        if (!is_array($bankAccounts)) {
            $bankAccounts = [];
        }

        $hasBankAccounts = count($bankAccounts) > 0;
        $status = (string) ($settings['sepay_connection_status'] ?? 'disconnected');
        $connected = !empty($settings['sepay_access_token'])
            && !empty($settings['sepay_connected_at'])
            && $status === 'connected'
            && $hasBankAccounts;

        return [
            'connected' => $connected,
            'status' => $status,
            'connected_at' => $settings['sepay_connected_at'] ?? '',
            'has_bank_accounts' => $hasBankAccounts,
            'sepay_oauth_connected' => (bool) ($settings['sepay_oauth_connected'] ?? false),
            'sepay_is_connected' => $connected,
            'sepay_has_bank_accounts' => $hasBankAccounts,
            'sepay_connection_status' => $status,
            'sepay_connected_at' => $settings['sepay_connected_at'] ?? '',
            'sepay_last_synced_at' => $settings['sepay_last_synced_at'] ?? '',
            'sepay_account_email' => $settings['sepay_account_email'] ?? '',
            'sepay_account_display_name' => $settings['sepay_account_display_name'] ?? '',
            'sepay_account_avatar' => $settings['sepay_account_avatar'] ?? '',
            'sepay_bank_accounts' => json_encode($bankAccounts, JSON_UNESCAPED_UNICODE),
            'sepay_bank_account_id' => $settings['sepay_bank_account_id'] ?? '',
            'sepay_bank_code' => $settings['sepay_bank_code'] ?? '',
            'sepay_account_number' => $settings['sepay_account_number'] ?? '',
            'sepay_account_name' => $settings['sepay_account_name'] ?? '',
        ];
    }

    private function proxyInitUrl(string $state): string
    {
        return rtrim((string) config('services.sepay.oauth_proxy_url'), '?') . '?' . http_build_query([
            'callback_url' => $this->redirectUri(),
            'state' => $state,
        ]);
    }

    private function popupComplete(bool $success, string $message)
    {
        $payload = json_encode([
            'type' => 'sepay-oauth-complete',
            'success' => $success,
            'message' => $message,
        ], JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_AMP | JSON_HEX_QUOT);

        return response(
            '<!doctype html><html><body><script>
                const payload = ' . $payload . ';
                if (window.opener) {
                    try { window.opener.postMessage(payload, "*"); } catch (e) {}
                }
                window.close();
            </script></body></html>'
        )->header('Content-Type', 'text/html');
    }

    private function resolveSettingsUserId(string $state): ?int
    {
        if ($state === '') {
            return null;
        }

        $settingsUserId = Cache::pull($this->stateCacheKey($state));

        if (!$settingsUserId && (string) session('sepay_oauth_state') === $state) {
            $settingsUserId = session('sepay_oauth_user_id');
        }

        return $settingsUserId ? (int) $settingsUserId : null;
    }

    private function redirectUri(): string
    {
        return (string) (config('services.sepay.redirect_uri') ?: route('sepay.oauth.callback'));
    }

    private function saveProxyTokens(int $settingsUserId, string $accessToken, string $refreshToken, mixed $expiresIn): void
    {
        $this->save($settingsUserId, 'sepay_access_token', $accessToken);
        $this->save($settingsUserId, 'sepay_refresh_token', $refreshToken);
        $this->save($settingsUserId, 'sepay_token_type', 'Bearer');
        $this->save($settingsUserId, 'sepay_expired_at', is_numeric($expiresIn) ? now()->addSeconds((int) $expiresIn)->toDateTimeString() : '');
        $this->save($settingsUserId, 'sepay_oauth_connected', true);
        $this->save($settingsUserId, 'sepay_connected_at', now()->toDateTimeString());
        $this->save($settingsUserId, 'sepay_connection_status', 'syncing');
    }

    private function markConnectionFailed(?int $settingsUserId, string $status): void
    {
        if (!$settingsUserId) {
            return;
        }

        $this->save($settingsUserId, 'sepay_oauth_connected', false);
        $this->save($settingsUserId, 'sepay_connected_at', '');
        $this->save($settingsUserId, 'sepay_connection_status', $status);
    }

    private function save(int $settingsUserId, string $key, mixed $value): void
    {
        PaymentSetting::updateOrCreateSetting($settingsUserId, $key, $value);
    }

    private function verifySignature(string $accessToken, string $state, string $signature): bool
    {
        $normalizedSignature = strtr($signature, '-_', '+/');
        $normalizedSignature .= str_repeat('=', (4 - strlen($normalizedSignature) % 4) % 4);
        $decodedSignature = base64_decode($normalizedSignature, true);

        if ($decodedSignature === false) {
            $decodedSignature = hex2bin($signature) ?: '';
        }

        if ($decodedSignature === '') {
            return false;
        }

        return openssl_verify($accessToken . '.' . $state, $decodedSignature, self::PUBLIC_KEY, OPENSSL_ALGO_SHA256) === 1;
    }

    private function stateCacheKey(string $state): string
    {
        return 'sepay_oauth_state:' . $state;
    }
}
