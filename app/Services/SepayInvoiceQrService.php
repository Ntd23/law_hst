<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\PaymentSetting;

class SepayInvoiceQrService
{
    public function buildVariables(Invoice $invoice): array
    {
        $settingsUserId = getCompanyId($invoice->created_by) ?: $invoice->created_by;

        if (!$settingsUserId) {
            return [];
        }

        $settings = PaymentSetting::getUserSettings((int) $settingsUserId);

        if (!$this->isEnabled($settings)) {
            return [];
        }

        $bankCode = $this->normalizeBankCode((string) ($settings['sepay_bank_code'] ?? ''));
        $accountNumber = trim((string) ($settings['sepay_account_number'] ?? ''));
        $accountName = trim((string) ($settings['sepay_account_name'] ?? ''));
        $amount = (int) round((float) ($invoice->remaining_amount ?: $invoice->total_amount));

        if ($bankCode === '' || $accountNumber === '' || $amount <= 0) {
            return [];
        }

        $referenceCode = $this->referenceCode($invoice, (string) (($settings['sepay_payment_prefix'] ?? '') ?: config('services.sepay.order_prefix', 'SEPAY')));
        $qrUrl = 'https://qr.sepay.vn/img?' . http_build_query([
            'bank' => $bankCode,
            'acc' => $accountNumber,
            'template' => 'compact',
            'amount' => $amount,
            'des' => $referenceCode,
        ]);

        $amountText = number_format($amount, 0, ',', '.') . ' VNĐ';

        return [
            '{sepay_qr_block}' => $this->qrBlock($qrUrl, $bankCode, $accountNumber, $accountName, $amountText, $referenceCode),
            '{sepay_qr_url}' => $qrUrl,
            '{sepay_bank_name}' => $bankCode,
            '{sepay_account_number}' => $accountNumber,
            '{sepay_account_name}' => $accountName,
            '{sepay_amount}' => $amountText,
            '{sepay_reference_code}' => $referenceCode,
        ];
    }

    private function isEnabled(array $settings): bool
    {
        return ($settings['is_sepay_enabled'] ?? false) === true
            || ($settings['is_sepay_enabled'] ?? null) === '1'
            || ($settings['is_sepay_enabled'] ?? null) === 1;
    }

    private function referenceCode(Invoice $invoice, string $prefix): string
    {
        $safePrefix = strtoupper(trim((string) preg_replace('/[^A-Z0-9_-]/i', '', $prefix), '-_')) ?: 'SEPAY';

        return $safePrefix . '-INV-' . $invoice->id;
    }

    private function normalizeBankCode(string $bankCode): string
    {
        $bankCode = trim($bankCode);

        if ($bankCode === '') {
            return '';
        }

        $aliases = [
            'mb bank' => 'MBBank',
            'mbbank' => 'MBBank',
            'mb' => 'MB',
            'vietcom bank' => 'VCB',
            'vietcombank' => 'VCB',
            'vcb' => 'VCB',
            'techcom bank' => 'TCB',
            'techcombank' => 'TCB',
            'tcb' => 'TCB',
            'vp bank' => 'VPBank',
            'vpbank' => 'VPBank',
            'acb' => 'ACB',
            'bidv' => 'BIDV',
            'vietinbank' => 'VietinBank',
            'agribank' => 'Agribank',
        ];

        return $aliases[strtolower($bankCode)] ?? preg_replace('/\s+/', '', $bankCode);
    }

    private function qrBlock(
        string $qrUrl,
        string $bankCode,
        string $accountNumber,
        string $accountName,
        string $amountText,
        string $referenceCode
    ): string {
        return '
            <div style="margin: 28px 0; padding: 22px; border: 1px solid #d1fae5; border-radius: 14px; background: #f0fdf4; text-align: center;">
                <h3 style="margin: 0 0 8px; color: #065f46; font-size: 20px;">Thanh toán chuyển khoản qua SePay</h3>
                <p style="margin: 0 0 18px; color: #4b5563;">Quét mã QR bên dưới để thanh toán đúng số tiền hóa đơn.</p>
                <img src="' . e($qrUrl) . '" alt="SePay VietQR" style="display: block; width: 240px; max-width: 100%; margin: 0 auto 18px; padding: 10px; border: 1px solid #e5e7eb; border-radius: 12px; background: #ffffff;">
                <table role="presentation" cellspacing="0" cellpadding="0" style="width: 100%; max-width: 520px; margin: 0 auto; text-align: left; border-collapse: collapse; font-size: 14px; color: #111827;">
                    <tr><td style="padding: 8px 0; color: #6b7280;">Ngân hàng</td><td style="padding: 8px 0; font-weight: 700; text-align: right;">' . e($bankCode) . '</td></tr>
                    <tr><td style="padding: 8px 0; color: #6b7280;">Số tài khoản</td><td style="padding: 8px 0; font-weight: 700; text-align: right;">' . e($accountNumber) . '</td></tr>
                    <tr><td style="padding: 8px 0; color: #6b7280;">Chủ tài khoản</td><td style="padding: 8px 0; font-weight: 700; text-align: right;">' . e($accountName ?: 'Chưa cập nhật') . '</td></tr>
                    <tr><td style="padding: 8px 0; color: #6b7280;">Số tiền</td><td style="padding: 8px 0; font-weight: 700; text-align: right;">' . e($amountText) . '</td></tr>
                    <tr><td style="padding: 8px 0; color: #6b7280;">Nội dung CK</td><td style="padding: 8px 0; font-weight: 800; color: #dc2626; text-align: right;">' . e($referenceCode) . '</td></tr>
                </table>
                <p style="margin: 18px 0 0; padding: 12px; border-radius: 10px; background: #fff7ed; color: #9a3412; font-size: 13px;">
                    Vui lòng giữ nguyên chính xác nội dung chuyển khoản để hệ thống tự động xác nhận thanh toán.
                </p>
            </div>';
    }
}
