<?php

namespace App\Services;

use App\Models\PaymentSetting;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Cache;
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
        return !empty($this->settings['sepay_api_key'])
            && !empty($this->settings['sepay_connected_at'])
            && ($this->settings['sepay_connection_status'] ?? '') === 'connected';
    }

    public function profile(): array
    {
        $endpoint = trim((string) config('services.sepay.profile_endpoint', ''));

        if ($endpoint === '') {
            return [];
        }

        $data = Cache::remember($this->cacheKey('profile'), now()->addMinute(), function () {
            return $this->request('GET', (string) config('services.sepay.profile_endpoint', '/user/profile'))->json() ?? [];
        });

        return $data['data'] ?? $data['user'] ?? $data;
    }

    public function bankAccounts(): array
    {
        $data = Cache::remember($this->cacheKey('bank_accounts'), now()->addMinute(), function () {
            return $this->request('GET', (string) config('services.sepay.bank_accounts_endpoint', '/bank-accounts'))->json() ?? [];
        });

        return $data['data'] ?? $data['bank_accounts'] ?? $data['bankAccounts'] ?? $data['bankaccounts'] ?? $data['accounts'] ?? $data;
    }

    public function bankAccount(string|int $id): array
    {
        $endpoint = rtrim((string) config('services.sepay.bank_accounts_endpoint', '/bank-accounts'), '/');

        try {
            $data = $this->request('GET', $endpoint . '/' . urlencode((string) $id))->json() ?? [];

            return $data['data'] ?? $data;
        } catch (\Throwable $e) {
            Log::warning('SePay bank account detail request failed, falling back to account list', [
                'settings_user_id' => $this->settingsUserId,
                'bank_account_id' => (string) $id,
                'message' => $e->getMessage(),
            ]);

            return collect($this->normalizeBankAccounts($this->bankAccounts()))
                ->firstWhere('id', (string) $id) ?? [];
        }
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
            $this->forgetCache();

            $profile = $this->normalizeProfile($this->profile());
            $accounts = $this->normalizeBankAccounts($this->bankAccounts());

            $this->save('sepay_account_email', $profile['email']);
            $this->save('sepay_account_display_name', $profile['display_name']);
            $this->save('sepay_account_avatar', $profile['avatar']);
            $this->save('sepay_bank_accounts', json_encode($accounts, JSON_UNESCAPED_UNICODE));
            $this->save('sepay_last_synced_at', now()->toDateTimeString());

            if (empty($accounts)) {
                $this->save('sepay_oauth_connected', false);
                $this->save('sepay_connected_at', '');
                $this->save('sepay_connection_status', 'missing_bank_accounts');
                $this->clearSelectedBankAccount();

                return false;
            }

            $this->syncSelectedBankAccount($accounts);
            $this->save('sepay_oauth_connected', true);
            $this->save('sepay_connected_at', now()->toDateTimeString());
            $this->save('sepay_connection_status', 'connected');

            return true;
        } catch (\Throwable $e) {
            $statusCode = $e instanceof RequestException ? $e->response?->status() : null;

            Log::warning('SePay sync profile/accounts failed', [
                'settings_user_id' => $this->settingsUserId,
                'status_code' => $statusCode,
                'message' => $e->getMessage(),
            ]);

            $this->save('sepay_oauth_connected', false);
            $this->save('sepay_connected_at', '');
            $this->save('sepay_connection_status', $statusCode === 401 ? 'invalid_api_key' : 'sync_failed');
            $this->save('sepay_bank_accounts', '[]');
            $this->clearSelectedBankAccount();

            return false;
        }
    }

    public function request(string $method, string $path, array $data = []): Response
    {
        return $this->send($method, $path, $data)->throw();
    }

    private function send(string $method, string $path, array $data = []): Response
    {
        $options = [];
        if (!empty($data)) {
            $options['json'] = $data;
        }

        return Http::withToken((string) ($this->settings['sepay_api_key'] ?? ''))
            ->acceptJson()
            ->timeout(15)
            ->send(strtoupper($method), $this->apiUrl($path), $options);
    }

    private function normalizeProfile(array $profile): array
    {
        $firstName = trim((string) ($profile['first_name'] ?? $profile['firstName'] ?? ''));
        $lastName = trim((string) ($profile['last_name'] ?? $profile['lastName'] ?? ''));
        $displayName = trim($firstName . ' ' . $lastName);

        if ($displayName === '') {
            $displayName = trim((string) ($profile['name'] ?? $profile['full_name'] ?? $profile['fullName'] ?? ''));
        }

        return [
            'email' => (string) ($profile['email'] ?? $profile['user_email'] ?? $profile['userEmail'] ?? ''),
            'display_name' => $displayName,
            'avatar' => (string) ($profile['avatar'] ?? $profile['avatar_url'] ?? $profile['avatarUrl'] ?? $profile['picture'] ?? ''),
        ];
    }

    private function normalizeBankAccounts(array $accounts): array
    {
        return collect($accounts)->map(function ($account) {
            $bank = $account['bank'] ?? [];

            return [
                'id' => (string) ($account['id'] ?? $account['bank_account_id'] ?? $account['bankAccountId'] ?? $account['account_id'] ?? ''),
                'bank_name' => $account['bank_name'] ?? $account['bankName'] ?? $account['bank_full_name'] ?? $account['bankFullName'] ?? $bank['name'] ?? '',
                'bank_code' => $account['bank_code'] ?? $account['bankCode'] ?? $account['bank_short_name'] ?? $account['bankShortName'] ?? $bank['code'] ?? $bank['short_name'] ?? '',
                'brand_name' => $account['brand_name'] ?? $account['brandName'] ?? $account['bank_short_name'] ?? $account['bankShortName'] ?? '',
                'account_number' => $account['account_number'] ?? $account['accountNumber'] ?? $account['bank_account_number'] ?? $account['bankAccountNumber'] ?? $account['number'] ?? '',
                'account_name' => $account['account_name'] ?? $account['accountName'] ?? $account['account_holder_name'] ?? $account['accountHolderName'] ?? $account['account_holder'] ?? $account['accountHolder'] ?? $account['name'] ?? '',
                'logo' => $account['logo'] ?? $account['bank_logo'] ?? $bank['logo'] ?? '',
            ];
        })->filter(fn ($account) => $account['id'] !== '')->values()->all();
    }

    private function syncSelectedBankAccount(array $accounts): void
    {
        $selectedId = (string) ($this->settings['sepay_bank_account_id'] ?? '');

        if ($selectedId === '' && count($accounts) === 1) {
            $selectedId = (string) ($accounts[0]['id'] ?? '');
        }

        if ($selectedId === '') {
            $this->clearSelectedBankAccount();
            return;
        }

        $selectedAccount = collect($accounts)->firstWhere('id', $selectedId);

        if (!$selectedAccount) {
            $this->clearSelectedBankAccount();
            return;
        }

        $this->save('sepay_bank_account_id', $selectedAccount['id']);
        $this->save('sepay_bank_code', $selectedAccount['bank_code']);
        $this->save('sepay_bank_name', $selectedAccount['bank_name']);
        $this->save('sepay_bank_brand_name', $selectedAccount['brand_name']);
        $this->save('sepay_account_number', $selectedAccount['account_number']);
        $this->save('sepay_account_name', $selectedAccount['account_name']);
        $this->save('sepay_bank_logo', $selectedAccount['logo']);
    }

    private function clearSelectedBankAccount(): void
    {
        $this->save('sepay_bank_account_id', '');
        $this->save('sepay_bank_code', '');
        $this->save('sepay_bank_name', '');
        $this->save('sepay_bank_brand_name', '');
        $this->save('sepay_account_number', '');
        $this->save('sepay_account_name', '');
        $this->save('sepay_bank_logo', '');
    }

    private function apiUrl(string $path): string
    {
        return rtrim((string) config('services.sepay.api_base_url'), '/') . '/' . ltrim($path, '/');
    }

    private function save(string $key, mixed $value): void
    {
        PaymentSetting::updateOrCreateSetting($this->settingsUserId, $key, $value);
    }

    private function cacheKey(string $key): string
    {
        return "sepay:{$this->settingsUserId}:{$key}";
    }

    private function forgetCache(): void
    {
        Cache::forget($this->cacheKey('profile'));
        Cache::forget($this->cacheKey('bank_accounts'));
    }
}
