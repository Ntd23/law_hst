<?php

namespace App\Services;

class SepayTransferContentService
{
    public function instruction(array $settings, string $orderCode): array
    {
        $bankCode = $this->normalizeBankCode((string) ($settings['sepay_bank_code'] ?? ''));
        $bankName = trim((string) ($settings['sepay_bank_name'] ?? $settings['sepay_bank_brand_name'] ?? $bankCode));
        $mainAccount = trim((string) ($settings['sepay_account_number'] ?? ''));
        $accountName = trim((string) ($settings['sepay_account_name'] ?? ''));
        $subAccount = $this->selectedSubAccount($settings);
        $subAccountType = $this->subAccountType($subAccount);
        $rule = $this->bankRule($bankCode);
        $requiresSevqr = (bool) ($rule['requires_sevqr'] ?? false);
        $usesOfficialVa = $subAccountType === 'official_va';
        $requiresTkp = $subAccountType === 'content_va';
        $tkpCode = $requiresTkp ? $this->tkpCode($subAccount) : '';
        $configurationValid = true;
        $errors = [];

        $receivingAccount = $usesOfficialVa
            ? trim((string) ($subAccount['account_number'] ?? $subAccount['va'] ?? ''))
            : $mainAccount;

        if ($bankCode === '') {
            $configurationValid = false;
            $errors[] = 'Missing bank code';
        }

        if ($receivingAccount === '') {
            $configurationValid = false;
            $errors[] = 'Missing receiving account';
        }

        if ($requiresTkp && $tkpCode === '') {
            $configurationValid = false;
            $errors[] = 'Missing TKP code';
        }

        $parts = [];
        if ($requiresSevqr && !$usesOfficialVa) {
            $parts[] = 'SEVQR';
        }
        if ($requiresTkp) {
            $parts[] = 'TKP' . $tkpCode;
        }
        $parts[] = strtoupper(trim($orderCode));

        return [
            'bank_code' => $bankCode,
            'bank_name' => $bankName,
            'account_name' => $usesOfficialVa
                ? trim((string) ($subAccount['account_holder_name'] ?? $subAccount['sub_holder_name'] ?? $accountName))
                : $accountName,
            'receiving_account' => $receivingAccount,
            'requires_sevqr' => $requiresSevqr && !$usesOfficialVa,
            'requires_tkp' => $requiresTkp,
            'tkp_code' => $tkpCode,
            'uses_official_va' => $usesOfficialVa,
            'sub_account_type' => $subAccountType,
            'sub_account_id' => (string) ($subAccount['id'] ?? ''),
            'transfer_content' => trim(implode(' ', array_filter($parts))),
            'order_code' => strtoupper(trim($orderCode)),
            'rule_name' => $this->ruleName($requiresSevqr && !$usesOfficialVa, $requiresTkp, $usesOfficialVa),
            'configuration_valid' => $configurationValid,
            'errors' => $errors,
        ];
    }

    public function buildOrderCode(string $type, int|string $id, ?string $prefix): string
    {
        $prefix = $this->normalizeOrderPrefix($prefix);
        $type = strtoupper($type);

        if ($type === 'PLAN') {
            return $prefix . 'PLAN' . $id . strtoupper(substr(bin2hex(random_bytes(4)), 0, 8));
        }

        return $prefix . $id;
    }

    public function normalizeOrderPrefix(?string $prefix): string
    {
        $prefix = strtoupper((string) preg_replace('/[^A-Z0-9]/i', '', (string) $prefix));

        if ($prefix === '' || $prefix === 'SEVQR' || str_starts_with($prefix, 'TKP')) {
            return (string) config('sepay.default_order_prefix', 'HD');
        }

        return substr($prefix, 0, 20);
    }

    public function extractOrderCodes(string $content, array $prefixes = []): array
    {
        $content = strtoupper($content);
        $content = (string) preg_replace('/\bSEVQR\b/i', ' ', $content);
        $content = (string) preg_replace('/\bTKP[A-Z0-9]+\b/i', ' ', $content);
        $references = [];

        preg_match_all('/\b[A-Z0-9]*?(?:PLAN|INV)[-_]?\d+(?:[-_][A-Z0-9]+)?\b/i', $content, $legacyMatches);
        $references = array_merge($references, $legacyMatches[0] ?? []);

        foreach ($prefixes as $prefix) {
            $prefix = $this->normalizeOrderPrefix((string) $prefix);
            preg_match_all('/\b' . preg_quote($prefix, '/') . '[A-Z0-9]{1,48}\b/i', $content, $matches);
            $references = array_merge($references, $matches[0] ?? []);
        }

        return array_values(array_unique(array_map(
            fn (string $reference): string => strtoupper($reference),
            array_filter($references),
        )));
    }

    public function selectedSubAccount(array $settings): array
    {
        $selectedId = (string) ($settings['sepay_sub_account_id'] ?? '');
        if ($selectedId === '') {
            return [];
        }

        $subAccounts = json_decode((string) ($settings['sepay_sub_accounts'] ?? '[]'), true);
        if (!is_array($subAccounts)) {
            return [];
        }

        return collect($subAccounts)->first(
            fn ($account) => (string) ($account['id'] ?? '') === $selectedId
        ) ?? [];
    }

    private function subAccountType(array $subAccount): string
    {
        if (empty($subAccount)) {
            return 'main';
        }

        $rawType = strtolower((string) ($subAccount['type'] ?? $subAccount['acc_type'] ?? $subAccount['va_type'] ?? ''));

        if (
            str_contains($rawType, 'content')
            || str_contains($rawType, 'tkp')
            || str_contains($rawType, 'terminal')
            || (array_key_exists('tkp_code', $subAccount) && empty($subAccount['va']))
        ) {
            return 'content_va';
        }

        return 'official_va';
    }

    private function tkpCode(array $subAccount): string
    {
        $code = (string) (
            $subAccount['tkp_code']
            ?? $subAccount['code']
            ?? $subAccount['prefix']
            ?? $subAccount['terminal_code']
            ?? ''
        );

        return strtoupper((string) preg_replace('/[^A-Z0-9]/i', '', $code));
    }

    private function bankRule(string $bankCode): array
    {
        return config('sepay.bank_rules.' . $bankCode, []);
    }

    private function ruleName(bool $requiresSevqr, bool $requiresTkp, bool $usesOfficialVa): string
    {
        if ($usesOfficialVa) {
            return 'VA chính thức';
        }

        if ($requiresSevqr && $requiresTkp) {
            return 'SEVQR + TKP';
        }

        if ($requiresSevqr) {
            return 'SEVQR';
        }

        if ($requiresTkp) {
            return 'TKP';
        }

        return 'Mã hóa đơn';
    }

    private function normalizeBankCode(string $bankCode): string
    {
        $bankCode = trim($bankCode);

        if ($bankCode === '') {
            return '';
        }

        $aliases = [
            'vietinbank' => 'ICB',
            'vietin bank' => 'ICB',
            'icb' => 'ICB',
            'mbbank' => 'MBBank',
            'mb bank' => 'MBBank',
            'mb' => 'MB',
            'vietcombank' => 'VCB',
            'vietcom bank' => 'VCB',
            'vcb' => 'VCB',
            'techcombank' => 'TCB',
            'techcom bank' => 'TCB',
            'tcb' => 'TCB',
            'vpbank' => 'VPBank',
            'vp bank' => 'VPBank',
            'acb' => 'ACB',
            'bidv' => 'BIDV',
            'agribank' => 'Agribank',
        ];

        return $aliases[strtolower($bankCode)] ?? preg_replace('/\s+/', '', $bankCode);
    }
}
