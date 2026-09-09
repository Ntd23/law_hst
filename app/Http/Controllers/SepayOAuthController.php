<?php

namespace App\Http\Controllers;

use App\Models\PaymentSetting;
use App\Services\SepayClient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class SepayOAuthController extends Controller
{
    public function connect(Request $request)
    {
        $settingsUserId = getPaymentSettingsUserId() ?: auth()->id();
        $validated = $request->validate([
            'sepay_api_key' => 'required|string|min:10|max:500',
        ]);
        $apiKey = trim($validated['sepay_api_key']);

        if ($this->apiKeyBelongsToAnotherSettingsUser($apiKey, (int) $settingsUserId)) {
            return response()->json([
                'success' => false,
                'message' => __('This SePay API key is already connected to another account. Please use a separate SePay API key for this account.'),
                'sepay' => $this->statusPayload((int) $settingsUserId),
            ], 422);
        }

        $this->save((int) $settingsUserId, 'sepay_api_key', $apiKey);
        $this->save((int) $settingsUserId, 'sepay_access_token', '');
        $this->save((int) $settingsUserId, 'sepay_refresh_token', '');
        $this->save((int) $settingsUserId, 'sepay_token_type', 'ApiKey');
        $this->ensureWebhookApiKey((int) $settingsUserId);
        $this->save((int) $settingsUserId, 'sepay_connection_status', 'connecting');

        if (!(new SepayClient((int) $settingsUserId))->syncProfileAndAccounts()) {
            $sepay = $this->statusPayload((int) $settingsUserId);

            return response()->json([
                'success' => false,
                'message' => $this->failureMessage((string) ($sepay['status'] ?? '')),
                'sepay' => $sepay,
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => __('SePay connected successfully.'),
            'sepay' => $this->statusPayload((int) $settingsUserId),
        ]);
    }

    public function sync(Request $request)
    {
        $settingsUserId = getPaymentSettingsUserId() ?: auth()->id();

        try {
            if (!(new SepayClient((int) $settingsUserId))->syncProfileAndAccounts()) {
                $sepay = $this->statusPayload((int) $settingsUserId);
                $message = $this->failureMessage((string) ($sepay['status'] ?? ''));

                if ($request->expectsJson()) {
                    return response()->json([
                        'success' => false,
                        'message' => $message,
                        'sepay' => $sepay,
                    ]);
                }

                return back()->with('error', $message);
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
            Log::warning('SePay API key sync failed', [
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
            'sepay_api_key',
            'sepay_access_token',
            'sepay_refresh_token',
            'sepay_token_type',
            'sepay_scope',
            'sepay_expired_at',
            'sepay_connected_at',
            'sepay_connection_status',
            'sepay_webhook_api_key',
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
        $this->ensureWebhookApiKey($settingsUserId);
        $settings = PaymentSetting::getUserSettings($settingsUserId);
        $bankAccounts = json_decode((string) ($settings['sepay_bank_accounts'] ?? '[]'), true);

        if (!is_array($bankAccounts)) {
            $bankAccounts = [];
        }

        $hasBankAccounts = count($bankAccounts) > 0;
        $status = (string) ($settings['sepay_connection_status'] ?? 'disconnected');
        $connected = !empty($settings['sepay_api_key'])
            && !empty($settings['sepay_connected_at'])
            && $status === 'connected'
            && $hasBankAccounts;

        return [
            'connected' => $connected,
            'status' => $status,
            'connected_at' => $settings['sepay_connected_at'] ?? '',
            'has_bank_accounts' => $hasBankAccounts,
            'sepay_oauth_connected' => in_array($settings['sepay_oauth_connected'] ?? false, [true, 1, '1'], true),
            'sepay_is_connected' => $connected,
            'sepay_api_key_configured' => !empty($settings['sepay_api_key']),
            'sepay_has_bank_accounts' => $hasBankAccounts,
            'sepay_connection_status' => $status,
            'sepay_webhook_api_key' => $settings['sepay_webhook_api_key'] ?? '',
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

    private function save(int $settingsUserId, string $key, mixed $value): void
    {
        PaymentSetting::updateOrCreateSetting($settingsUserId, $key, $value);
    }

    private function ensureWebhookApiKey(int $settingsUserId): void
    {
        $settings = PaymentSetting::getUserSettings($settingsUserId);

        if (!empty($settings['sepay_api_key']) && empty($settings['sepay_webhook_api_key'])) {
            $this->save($settingsUserId, 'sepay_webhook_api_key', bin2hex(random_bytes(24)));
        }
    }

    private function failureMessage(string $status): string
    {
        return match ($status) {
            'invalid_api_key' => __('SePay API key is invalid or disabled. Please copy the full active API token from SePay API Access and connect again.'),
            'missing_bank_accounts' => __('SePay account synced, but no receiving bank account was found. Please link a bank account in SePay and sync again.'),
            default => __('Could not sync SePay account. Please check your API key and try again.'),
        };
    }

    private function apiKeyBelongsToAnotherSettingsUser(string $apiKey, int $settingsUserId): bool
    {
        return collect(PaymentSetting::userIdsForDecryptedValue('sepay_api_key', $apiKey))
            ->contains(fn (int $userId) => $userId !== $settingsUserId);
    }
}
