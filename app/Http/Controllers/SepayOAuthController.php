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

        session(['sepay_oauth_state' => $state, 'sepay_oauth_user_id' => $settingsUserId]);
        Cache::put($this->stateCacheKey($state), $settingsUserId, now()->addMinutes(10));

        $callbackUrl = config('services.sepay.redirect_uri') ?: route('sepay.oauth.callback');
        $url = 'https://friendsofbotble.com/oauth/sepay/init?' . http_build_query([
            'callback_url' => $callbackUrl,
            'state' => $state,
        ]);

        return redirect()->away($url);
    }

    public function callback(Request $request)
    {
        $validated = $request->validate([
            'access_token' => 'required|string',
            'refresh_token' => 'nullable|string',
            'expires_in' => 'nullable|integer',
            'state' => 'required|string',
            'signature' => 'required|string',
        ]);

        if (!$this->verifySignature($validated['access_token'], $validated['state'], $validated['signature'])) {
            Log::warning('SePay OAuth callback rejected: invalid RSA signature', [
                'state' => $validated['state'],
            ]);

            return response()->json(['success' => false, 'message' => 'Invalid signature'], 401);
        }

        $settingsUserId = Cache::pull($this->stateCacheKey($validated['state']))
            ?: ((string) session('sepay_oauth_state') === (string) $validated['state'] ? session('sepay_oauth_user_id') : null);

        if (!$settingsUserId) {
            return response()->json(['success' => false, 'message' => 'Invalid state'], 419);
        }

        $this->save($settingsUserId, 'sepay_oauth_connected', true);
        $this->save($settingsUserId, 'sepay_access_token', $validated['access_token']);
        $this->save($settingsUserId, 'sepay_refresh_token', $validated['refresh_token'] ?? '');
        $this->save($settingsUserId, 'sepay_expired_at', isset($validated['expires_in']) ? now()->addSeconds((int) $validated['expires_in'])->toDateTimeString() : '');
        $this->save($settingsUserId, 'sepay_connected_at', now()->toDateTimeString());
        $this->save($settingsUserId, 'sepay_connection_status', 'connected');

        session()->forget(['sepay_oauth_state', 'sepay_oauth_user_id']);

        (new SepayClient((int) $settingsUserId))->syncProfileAndAccounts();

        if ($request->expectsJson()) {
            return response()->json(['success' => true]);
        }

        return $this->popupComplete();
    }

    public function popupComplete()
    {
        return response(
            '<!doctype html><html><body><script>if(window.opener){window.opener.location.reload();}window.close();</script></body></html>'
        )->header('Content-Type', 'text/html');
    }

    public function sync()
    {
        $settingsUserId = getPaymentSettingsUserId() ?: auth()->id();

        try {
            if (!(new SepayClient((int) $settingsUserId))->syncProfileAndAccounts()) {
                return back()->with('error', __('Could not sync SePay account. Please disconnect and connect SePay again.'));
            }

            return back()->with('success', __('SePay account synced successfully.'));
        } catch (\Throwable $e) {
            Log::warning('SePay OAuth sync failed', [
                'settings_user_id' => $settingsUserId,
                'message' => $e->getMessage(),
            ]);

            return back()->with('error', __('Could not sync SePay account. Please try again.'));
        }
    }

    public function disconnect()
    {
        $settingsUserId = getPaymentSettingsUserId() ?: auth()->id();

        foreach ([
            'sepay_oauth_connected',
            'sepay_access_token',
            'sepay_refresh_token',
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
            $this->save($settingsUserId, $key, '');
        }

        return back()->with('success', __('SePay disconnected successfully.'));
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

    private function save(int $settingsUserId, string $key, mixed $value): void
    {
        PaymentSetting::updateOrCreateSetting($settingsUserId, $key, $value);
    }

    private function stateCacheKey(string $state): string
    {
        return 'sepay_oauth_state:' . $state;
    }
}
