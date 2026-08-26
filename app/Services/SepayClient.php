<?php

namespace App\Services;

use App\Models\PaymentSetting;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SepayClient
{
    private array $settings;

    public function __construct(private readonly int $settingsUserId)
    {
        $this->settings = PaymentSetting::getUserSettings($settingsUserId);
    }

    public function isConnected(): bool
    {
        return !empty($this->settings['sepay_access_token']) && !empty($this->settings['sepay_connected_at']);
    }

    public function profile(): array
    {
        $data = $this->request('GET', (string) config('services.sepay.profile_endpoint', '/user/profile'))->json() ?? [];

        return $data['data'] ?? $data['user'] ?? $data;
    }

    public function bankAccounts(): array
    {
        $data = $this->request('GET', (string) config('services.sepay.bank_accounts_endpoint', '/bank-accounts'))->json() ?? [];

        return $data['data'] ?? $data['bank_accounts'] ?? $data['bankAccounts'] ?? $data['accounts'] ?? $data;
    }

    public function bankAccount(string|int $id): array
    {
        $endpoint = rtrim((string) config('services.sepay.bank_accounts_endpoint', '/bank-accounts'), '/');
        $data = $this->request('GET', $endpoint . '/' . urlencode((string) $id))->json() ?? [];

        return $data['data'] ?? $data;
    }

    public function createWebhook(array $data): array
    {
        $response = $this->request('POST', '/webhooks', $data)->json() ?? [];

        return $response['data'] ?? $response;
    }

    public function updateWebhook(string|int $id, array $data): array
    {
        $response = $this->request('PATCH', '/webhooks/' . urlencode((string) $id), $data)->json() ?? [];

        return $response['data'] ?? $response;
    }

    public function syncProfileAndAccounts(): bool
    {
        try {
            $profile = $this->profile();
            $accounts = $this->bankAccounts();

            $this->save('sepay_account_email', $profile['email'] ?? '');
            $this->save('sepay_account_display_name', $profile['name'] ?? $profile['full_name'] ?? $profile['fullName'] ?? '');
            $this->save('sepay_account_avatar', $profile['avatar'] ?? $profile['avatar_url'] ?? $profile['avatarUrl'] ?? '');
            $this->save('sepay_bank_accounts', json_encode($this->normalizeBankAccounts($accounts), JSON_UNESCAPED_UNICODE));
            $this->save('sepay_last_synced_at', now()->toDateTimeString());
            $this->save('sepay_connection_status', 'connected');

            return true;
        } catch (\Throwable $e) {
            Log::warning('SePay sync profile/accounts failed', [
                'settings_user_id' => $this->settingsUserId,
                'message' => $e->getMessage(),
            ]);

            $this->save('sepay_connection_status', 'sync_failed');

            return false;
        }
    }

    public function request(string $method, string $path, array $data = []): Response
    {
        $response = $this->send($method, $path, $data);

        if ($response->status() === 401 && $this->refreshToken()) {
            $response = $this->send($method, $path, $data);
        }

        return $response->throw();
    }

    private function send(string $method, string $path, array $data = []): Response
    {
        $options = [];
        if (!empty($data)) {
            $options['json'] = $data;
        }

        return Http::withToken((string) ($this->settings['sepay_access_token'] ?? ''))
            ->acceptJson()
            ->timeout(15)
            ->send(strtoupper($method), $this->apiUrl($path), $options);
    }

    private function refreshToken(): bool
    {
        $refreshToken = (string) ($this->settings['sepay_refresh_token'] ?? '');

        if ($refreshToken === '') {
            return false;
        }

        try {
            $response = Http::acceptJson()
                ->timeout(15)
                ->post((string) config('services.sepay.refresh_token_url'), [
                    'refresh_token' => $refreshToken,
                ])
                ->throw()
                ->json();

            if (empty($response['access_token'])) {
                return false;
            }

            $this->save('sepay_access_token', $response['access_token']);
            $this->save('sepay_refresh_token', $response['refresh_token'] ?? $refreshToken);
            $this->save('sepay_expired_at', isset($response['expires_in']) ? now()->addSeconds((int) $response['expires_in'])->toDateTimeString() : '');

            $this->settings = PaymentSetting::getUserSettings($this->settingsUserId);

            return true;
        } catch (\Throwable $e) {
            Log::warning('SePay refresh token failed', [
                'settings_user_id' => $this->settingsUserId,
                'message' => $e->getMessage(),
            ]);

            return false;
        }
    }

    private function normalizeBankAccounts(array $accounts): array
    {
        return collect($accounts)->map(function ($account) {
            $bank = $account['bank'] ?? [];

            return [
                'id' => (string) ($account['id'] ?? $account['bank_account_id'] ?? $account['bankAccountId'] ?? $account['account_id'] ?? ''),
                'bank_name' => $account['bank_name'] ?? $account['bankName'] ?? $bank['name'] ?? '',
                'bank_code' => $account['bank_code'] ?? $account['bankCode'] ?? $account['bank_short_name'] ?? $bank['code'] ?? $bank['short_name'] ?? '',
                'brand_name' => $account['brand_name'] ?? $account['brandName'] ?? '',
                'account_number' => $account['account_number'] ?? $account['accountNumber'] ?? $account['number'] ?? '',
                'account_name' => $account['account_name'] ?? $account['accountName'] ?? $account['account_holder_name'] ?? $account['name'] ?? '',
                'logo' => $account['logo'] ?? $account['bank_logo'] ?? $bank['logo'] ?? '',
            ];
        })->filter(fn ($account) => $account['id'] !== '')->values()->all();
    }

    private function apiUrl(string $path): string
    {
        return rtrim((string) config('services.sepay.api_base_url'), '/') . '/' . ltrim($path, '/');
    }

    private function save(string $key, mixed $value): void
    {
        PaymentSetting::updateOrCreateSetting($this->settingsUserId, $key, $value);
    }
}
