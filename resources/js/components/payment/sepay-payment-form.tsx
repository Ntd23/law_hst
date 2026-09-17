import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/components/custom-toast';
import { normalizeVietQrBankCode } from '@/utils/vietqr';
import { Copy, QrCode } from 'lucide-react';

interface SepayPaymentFormProps {
  planId: number;
  planPrice: number;
  couponCode: string;
  billingCycle: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  paymentPrefix?: string;
  orderCode?: string;
  transferContent?: string;
  ruleName?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function SepayPaymentForm({
  planId,
  planPrice,
  couponCode,
  billingCycle,
  bankCode,
  accountNumber,
  accountName,
  paymentPrefix = 'HD',
  orderCode,
  transferContent: configuredTransferContent,
  ruleName,
  onSuccess,
}: SepayPaymentFormProps) {
  const { t } = useTranslation();
  const [previewChecked, setPreviewChecked] = useState(Boolean(orderCode || configuredTransferContent));
  const [preview, setPreview] = useState<any>(null);
  const [paymentReady, setPaymentReady] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const startedRef = useRef(false);

  const fallbackReferenceCode = useMemo(() => {
    const safePrefix = (paymentPrefix || 'HD').replace(/[^a-zA-Z0-9]/g, '').toUpperCase() || 'HD';
    return `${safePrefix}PLAN${planId}${Date.now().toString(36).toUpperCase()}`;
  }, [paymentPrefix, planId]);

  useEffect(() => {
    if (orderCode || configuredTransferContent) {
      setPreviewChecked(true);
      return;
    }

    let cancelled = false;

    const loadPreview = async () => {
      try {
        const params = new URLSearchParams({ plan_id: String(planId) });
        const response = await fetch(`${route('sepay.plan-transfer-preview')}?${params.toString()}`, {
          headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          credentials: 'same-origin',
        });

        if (!cancelled && response.ok) {
          const result = await response.json();
          setPreview(result.preview || null);
        }
      } catch {
        // Fallback content still lets the user pay if preview is temporarily unavailable.
      } finally {
        if (!cancelled) {
          setPreviewChecked(true);
        }
      }
    };

    loadPreview();

    return () => {
      cancelled = true;
    };
  }, [configuredTransferContent, orderCode, planId]);

  const referenceCode = preview?.order_code || orderCode || fallbackReferenceCode;
  const transferContent = preview?.transfer_content || configuredTransferContent || referenceCode;
  const effectiveBankCode = preview?.bank_code || bankCode;
  const effectiveAccountNumber = preview?.receiving_account || accountNumber;
  const effectiveAccountName = preview?.account_name || accountName;
  const effectiveRuleName = preview?.rule_name || ruleName;
  const vietQrBankCode = normalizeVietQrBankCode(effectiveBankCode);

  const qrUrl = useMemo(() => {
    if (!previewChecked || !vietQrBankCode || !effectiveAccountNumber) return '';

    const params = new URLSearchParams({
      bank: vietQrBankCode,
      acc: effectiveAccountNumber,
      template: 'compact',
      amount: Math.round(Number(planPrice)).toString(),
      des: transferContent,
    });

    return `https://qr.sepay.vn/img?${params.toString()}`;
  }, [previewChecked, vietQrBankCode, effectiveAccountNumber, planPrice, transferContent]);

  const formatAmount = (amount: number) => {
    if (typeof window !== 'undefined' && window.appSettings?.formatCurrency) {
      return window.appSettings.formatCurrency(amount, { showSymbol: true });
    }

    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success(t('Copied to clipboard'));
  };

  useEffect(() => {
    if (!previewChecked || !qrUrl || startedRef.current) return;

    startedRef.current = true;

    router.post(route('sepay.payment'), {
      plan_id: planId,
      billing_cycle: billingCycle,
      coupon_code: couponCode || '',
      amount: planPrice,
      reference_code: referenceCode,
    }, {
      onSuccess: () => {
        setPaymentReady(true);
      },
      onError: (errors) => {
        const message = typeof errors === 'string'
          ? errors
          : Object.values(errors).flat().join(', ');
        toast.error(message || t('Failed to submit payment request'));
      },
    });
  }, [billingCycle, couponCode, planId, planPrice, previewChecked, qrUrl, referenceCode, t]);

  useEffect(() => {
    if (!paymentReady || isPaid) return;

    const poll = window.setInterval(async () => {
      try {
        const response = await fetch(`/api/orders/${encodeURIComponent(referenceCode)}/check-status`, {
          headers: { Accept: 'application/json' },
        });
        const data = await response.json();

        if (data?.is_paid) {
          window.clearInterval(poll);
          setIsPaid(true);
          toast.success(t('Payment successful!'));
          window.setTimeout(onSuccess, 2000);
        }
      } catch {
        // Giữ polling, lỗi mạng tạm thời không chặn người dùng.
      }
    }, 3000);

    return () => window.clearInterval(poll);
  }, [isPaid, onSuccess, paymentReady, referenceCode, t]);

  return (
    <div>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <QrCode className="h-5 w-5 text-primary" />
            <h3 className="font-medium">{t('SePay QR Payment')}</h3>
          </div>

          {qrUrl ? (
            <div className="grid gap-4 md:grid-cols-[260px_minmax(0,1fr)] md:items-start">
              <div className="flex justify-center">
                <img
                  src={qrUrl}
                  alt={t('SePay QR Payment')}
                  className="w-60 max-w-full rounded-lg border bg-white p-2"
                />
              </div>

              <div className="w-full space-y-2 text-sm">
                <PaymentInfoRow label={t('Bank Code')} value={vietQrBankCode} copyLabel={t('Copy')} onCopy={copyToClipboard} />
                <PaymentInfoRow label={t('Account Number')} value={effectiveAccountNumber} copyLabel={t('Copy')} onCopy={copyToClipboard} />
                <PaymentInfoRow label={t('Account Name')} value={effectiveAccountName} copyLabel={t('Copy')} onCopy={copyToClipboard} />
                <PaymentInfoRow label={t('Amount')} value={formatAmount(planPrice)} copyValue={String(Math.round(Number(planPrice)))} copyLabel={t('Copy')} onCopy={copyToClipboard} />
                {effectiveRuleName ? <PaymentInfoRow label={t('Content Rule')} value={effectiveRuleName} copyLabel={t('Copy')} onCopy={copyToClipboard} /> : null}
                <PaymentInfoRow label={t('Transfer Content')} value={transferContent} copyLabel={t('Copy')} onCopy={copyToClipboard} />
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800">
              {t('SePay is enabled but bank information is incomplete. Please contact the administrator.')}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PaymentInfoRow({
  label,
  value,
  copyValue,
  copyLabel,
  onCopy,
}: {
  label: string;
  value: string;
  copyValue?: string;
  copyLabel: string;
  onCopy: (value: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded bg-gray-50 p-2">
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="break-all font-medium">{value}</p>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onCopy(copyValue || value)}
      >
        <Copy className="h-3 w-3 mr-1" />
        {copyLabel}
      </Button>
    </div>
  );
}
