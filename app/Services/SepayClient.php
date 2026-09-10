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
        $endpoint = trim((string) config('sepay.api.profile_endpoint', ''));

        if ($endpoint === '') {
            return [];
        }

        $data = Cache::remember($this->cacheKey('profile'), now()->addMinute(), function () {
            return $this->request('GET', (string) config('sepay.api.profile_endpoint', '/user/profile'))->json() ?? [];
        });

        return $data['data'] ?? $data['user'] ?? $data;
    }

    public function bankAccounts(): array
    {
        $data = Cache::remember($this->cacheKey('bank_accounts'), now()->addMinute(), function () {
            return $this->request('GET', (string) config('sepay.api.bank_accounts_endpoint', '/bank-accounts'))->json() ?? [];
        });

        return $data['data'] ?? $data['bank_accounts'] ?? $data['bankAccounts'] ?? $data['bankaccounts'] ?? $data['accounts'] ?? $data;
    }

    public function bankAccount(string|int $id): array
    {
        $endpoint = rtrim((string) config('sepay.api.bank_accounts_endpoint', '/bank-accounts'), '/');

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

    public function subAccounts(string|int $bankAccountId): array
    {
        $endpoint = str_replace(
            '{id}',
            urlencode((string) $bankAccountId),
            (string) config('sepay.api.sub_accounts_endpoint', '/bank-accounts/{id}/va')
        );

        $data = Cache::remember($this->cacheKey('sub_accounts_' . $bankAccountId), now()->addMinute(), function () use ($endpoint) {
            return $this->request('GET', $endpoint)->json() ?? [];
        });

        return $data['data'] ?? $data['sub_accounts'] ?? $data['subAccounts'] ?? $data['vas'] ?? $data['virtual_accounts'] ?? $data;
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
            $this->settings = PaymentSetting::getUserSettings($this->settingsUserId);
            $this->syncSelectedSubAccounts();
            $this->settings = PaymentSetting::getUserSettings($this->settingsUserId);
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

            return Http::withToken((string) ($this->settings['sepay_api_key'] ?? $this->settings['sepay_access_token'] ?? ''))
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
            $bankCode = $account['bank_code'] ?? $account['bankCode'] ?? $account['bank_short_name'] ?? $account['bankShortName'] ?? $bank['code'] ?? $bank['short_name'] ?? '';
            $bankName = $account['bank_name'] ?? $account['bankName'] ?? $account['bank_full_name'] ?? $account['bankFullName'] ?? $bank['full_name'] ?? $bank['name'] ?? '';
            $bankShortName = $account['brand_name'] ?? $account['brandName'] ?? $account['bank_short_name'] ?? $account['bankShortName'] ?? $bank['short_name'] ?? $bankCode;

            return [
                'id' => (string) ($account['id'] ?? $account['bank_account_id'] ?? $account['bankAccountId'] ?? $account['account_id'] ?? ''),
                'bank_name' => $bankName,
                'bank_code' => $bankCode,
                'bank_short_name' => $bankShortName,
                'brand_name' => $bankShortName,
                'bank_bin' => $account['bank_bin'] ?? $account['bankBin'] ?? $bank['bin'] ?? '',
                'account_number' => $account['account_number'] ?? $account['accountNumber'] ?? $account['bank_account_number'] ?? $account['bankAccountNumber'] ?? $account['number'] ?? '',
                'account_name' => $account['account_name'] ?? $account['accountName'] ?? $account['account_holder_name'] ?? $account['accountHolderName'] ?? $account['account_holder'] ?? $account['accountHolder'] ?? $account['name'] ?? '',
                'account_type' => $account['account_type'] ?? $account['accountType'] ?? $account['type'] ?? '',
                'active' => $account['active'] ?? $account['status'] ?? '',
                'logo' => $account['logo'] ?? $account['bank_logo'] ?? $bank['logo'] ?? '',
                'metadata' => $account,
            ];
        })->filter(fn ($account) => $account['id'] !== '')->values()->all();
    }

    private function normalizeSubAccounts(array $subAccounts, string $bankAccountId): array
    {
        return collect($subAccounts)->map(function ($account) use ($bankAccountId) {
            $type = $this->normalizeSubAccountType($account);

            return [
                'id' => (string) ($account['id'] ?? $account['xid'] ?? $account['va_id'] ?? ''),
                'bank_account_id' => (string) ($account['bank_account_id'] ?? $account['bankAccountId'] ?? $bankAccountId),
                'account_number' => (string) ($account['account_number'] ?? $account['accountNumber'] ?? $account['va'] ?? ''),
                'account_holder_name' => (string) ($account['account_holder_name'] ?? $account['accountHolderName'] ?? $account['sub_holder_name'] ?? $account['holder_name'] ?? ''),
                'label' => (string) ($account['label'] ?? $account['name'] ?? ''),
                'acc_type' => (string) ($account['acc_type'] ?? $account['account_type'] ?? $account['type'] ?? ''),
                'type' => $type,
                'code' => (string) ($account['code'] ?? $account['tkp_code'] ?? $account['prefix'] ?? ''),
                'active' => $account['active'] ?? '',
                'va_active' => $account['va_active'] ?? $account['active'] ?? '',
                'official' => $account['official'] ?? null,
                'static' => $account['static'] ?? null,
                'metadata' => $account,
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
        $this->save('sepay_bank_bin', $selectedAccount['bank_bin']);
        $this->save('sepay_account_number', $selectedAccount['account_number']);
        $this->save('sepay_account_name', $selectedAccount['account_name']);
        $this->save('sepay_account_type', $selectedAccount['account_type']);
        $this->save('sepay_bank_account_metadata', json_encode($selectedAccount['metadata'] ?? $selectedAccount, JSON_UNESCAPED_UNICODE));
        $this->save('sepay_bank_logo', $selectedAccount['logo']);
    }

    public function syncSelectedSubAccounts(): array
    {
        $bankAccountId = (string) ($this->settings['sepay_bank_account_id'] ?? '');
        if ($bankAccountId === '') {
            $this->clearSelectedSubAccount();
            $this->save('sepay_sub_accounts', '[]');
            return [];
        }

        try {
            $subAccounts = $this->normalizeSubAccounts($this->subAccounts($bankAccountId), $bankAccountId);
            $this->save('sepay_sub_accounts', json_encode($subAccounts, JSON_UNESCAPED_UNICODE));

            $selectedId = (string) ($this->settings['sepay_sub_account_id'] ?? '');
            $selected = $selectedId !== ''
                ? collect($subAccounts)->firstWhere('id', $selectedId)
                : null;

            if (!$selected && count($subAccounts) === 1) {
                $selected = $subAccounts[0];
            }

            if ($selected) {
                $this->saveSelectedSubAccount($selected);
            } else {
                $this->clearSelectedSubAccount();
            }

            return $subAccounts;
        } catch (\Throwable $e) {
            Log::warning('SePay sub-account/VA sync failed', [
                'settings_user_id' => $this->settingsUserId,
                'bank_account_id' => $bankAccountId,
                'message' => $e->getMessage(),
            ]);

            $this->save('sepay_sub_accounts', '[]');
            $this->clearSelectedSubAccount();

            return [];
        }
    }

    private function saveSelectedSubAccount(array $selected): void
    {
        $this->save('sepay_sub_account_id', $selected['id']);
        $this->save('sepay_sub_account_number', $selected['account_number']);
        $this->save('sepay_sub_account_name', $selected['account_holder_name']);
        $this->save('sepay_sub_account_code', $selected['code']);
        $this->save('sepay_sub_account_type', $selected['type']);
        $this->save('sepay_sub_account_metadata', json_encode($selected['metadata'] ?? $selected, JSON_UNESCAPED_UNICODE));
    }

    private function clearSelectedSubAccount(): void
    {
        $this->save('sepay_sub_account_id', '');
        $this->save('sepay_sub_account_number', '');
        $this->save('sepay_sub_account_name', '');
        $this->save('sepay_sub_account_code', '');
        $this->save('sepay_sub_account_type', '');
        $this->save('sepay_sub_account_metadata', '');
    }

    private function normalizeSubAccountType(array $account): string
    {
        $rawType = strtolower((string) ($account['type'] ?? $account['acc_type'] ?? $account['va_type'] ?? ''));

        if (
            str_contains($rawType, 'content')
            || str_contains($rawType, 'tkp')
            || str_contains($rawType, 'terminal')
            || array_key_exists('tkp_code', $account)
        ) {
            return 'content_va';
        }

        return 'official_va';
    }

    private function clearSelectedBankAccount(): void
    {
        $this->save('sepay_bank_account_id', '');
        $this->save('sepay_bank_code', '');
        $this->save('sepay_bank_name', '');
        $this->save('sepay_bank_brand_name', '');
        $this->save('sepay_bank_bin', '');
        $this->save('sepay_account_number', '');
        $this->save('sepay_account_name', '');
        $this->save('sepay_account_type', '');
        $this->save('sepay_bank_account_metadata', '');
        $this->save('sepay_bank_logo', '');
        $this->save('sepay_sub_accounts', '[]');
        $this->clearSelectedSubAccount();
    }

    private function apiUrl(string $path): string
    {
        return rtrim((string) config('sepay.api.base_url'), '/') . '/' . ltrim($path, '/');
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
        Cache::forget($this->cacheKey('sub_accounts_' . ($this->settings['sepay_bank_account_id'] ?? '')));
    }
}
