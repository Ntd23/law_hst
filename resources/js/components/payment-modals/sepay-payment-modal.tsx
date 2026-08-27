import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { router } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/components/custom-toast';
import { formatCurrencyForCompany } from '@/utils/helpers';
import { normalizeVietQrBankCode } from '@/utils/vietqr';
import { CheckCircle, Copy, Loader2, QrCode } from 'lucide-react';

interface SepayPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: any;
  amount: number;
  sepaySettings?: {
    bank_code?: string;
    account_number?: string;
    account_name?: string;
    payment_prefix?: string;
  };
}

export function SepayPaymentModal({
  isOpen,
  onClose,
  invoice,
  amount,
  sepaySettings = {},
}: SepayPaymentModalProps) {
  const { t } = useTranslation();
  const [processing, setProcessing] = useState(false);
  const [paymentReady, setPaymentReady] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const startedRef = useRef(false);

  const bankCode = sepaySettings.bank_code || '';
  const vietQrBankCode = normalizeVietQrBankCode(bankCode);
  const accountNumber = sepaySettings.account_number || '';
  const accountName = sepaySettings.account_name || '';
  const paymentPrefix = sepaySettings.payment_prefix || 'SEPAY';

  const referenceCode = useMemo(() => {
    const safePrefix = paymentPrefix.replace(/[^a-zA-Z0-9_]/g, '').toUpperCase() || 'SEPAY';
    return `${safePrefix}INV${invoice.id || invoice.invoice_number}${Date.now().toString(36).toUpperCase()}`;
  }, [paymentPrefix, invoice.id, invoice.invoice_number]);

  const qrUrl = useMemo(() => {
    if (!vietQrBankCode || !accountNumber) return '';

    const params = new URLSearchParams({
      bank: vietQrBankCode,
      acc: accountNumber,
      template: 'compact',
      amount: Math.round(Number(amount)).toString(),
      des: referenceCode,
    });

    return `https://qr.sepay.vn/img?${params.toString()}`;
  }, [vietQrBankCode, accountNumber, amount, referenceCode]);

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success(t('Copied to clipboard'));
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setIsPaid(false);
    setPaymentReady(false);
    startedRef.current = false;
  }, [isOpen, referenceCode]);

  useEffect(() => {
    if (!isOpen || !qrUrl || startedRef.current) return;

    startedRef.current = true;
    setProcessing(true);

    router.post(route('invoice.payment.process', invoice.payment_token), {
      payment_method: 'sepay',
      invoice_token: invoice.payment_token,
      amount,
      reference_code: referenceCode,
    }, {
      onSuccess: () => {
        setPaymentReady(true);
      },
      onError: (errors) => {
        toast.error(Object.values(errors).join(', '));
      },
      onFinish: () => setProcessing(false),
    });
  }, [amount, invoice.payment_token, isOpen, qrUrl, referenceCode, t]);

  useEffect(() => {
    if (!isOpen || !paymentReady || isPaid) return;

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
          window.setTimeout(() => {
            onClose();
            window.location.reload();
          }, 2000);
        }
      } catch {
        // Lỗi mạng tạm thời: tiếp tục kiểm tra ở vòng kế tiếp.
      }
    }, 3000);

    return () => window.clearInterval(poll);
  }, [isOpen, isPaid, onClose, paymentReady, referenceCode, t]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('SePay QR Payment')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <QrCode className="h-5 w-5 text-primary" />
                <h4 className="font-semibold">{t('Payment Instructions')}</h4>
              </div>

              {qrUrl ? (
                <div className="flex flex-col items-center gap-4">
                  <img
                    src={qrUrl}
                    alt={t('SePay QR Payment')}
                    className="w-56 max-w-full rounded-lg border bg-white p-2"
                  />
                  <div className="w-full space-y-2 text-sm">
                    <PaymentInfoRow label={t('Bank Code')} value={vietQrBankCode} copyLabel={t('Copy')} onCopy={copyToClipboard} />
                    <PaymentInfoRow label={t('Bank Name')} value={bankCode} copyLabel={t('Copy')} onCopy={copyToClipboard} />
                    <PaymentInfoRow label={t('Account Number')} value={accountNumber} copyLabel={t('Copy')} onCopy={copyToClipboard} />
                    <PaymentInfoRow label={t('Account Name')} value={accountName} copyLabel={t('Copy')} onCopy={copyToClipboard} />
                    <PaymentInfoRow label={t('Amount')} value={formatCurrencyForCompany(amount.toFixed(2))} copyValue={String(Math.round(Number(amount)))} copyLabel={t('Copy')} onCopy={copyToClipboard} />
                    <PaymentInfoRow label={t('Transfer Content')} value={referenceCode} copyLabel={t('Copy')} onCopy={copyToClipboard} />
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800">
                  {t('SePay is enabled but bank information is incomplete. Please contact the administrator.')}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className={isPaid ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}>
            <CardContent className="p-4">
              <div className="flex items-start gap-2">
                {isPaid ? <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" /> : <Loader2 className="h-5 w-5 animate-spin text-orange-600 mt-0.5" />}
                <div className={isPaid ? 'text-sm text-green-800' : 'text-sm text-orange-800'}>
                  <p className="font-medium mb-1">
                    {isPaid ? t('Payment successful!') : t('Waiting for your payment...')}
                  </p>
                  {isPaid ? (
                    <p className="text-xs">{t('Invoice payment has been confirmed. Refreshing...')}</p>
                  ) : (
                    <ul className="space-y-1 text-xs">
                      <li>• {t('Transfer the exact amount shown above')}</li>
                      <li>• {t('Please keep the transfer content exactly as shown so the system can confirm your order automatically after 1-3 seconds.')}</li>
                      <li>• {paymentReady ? t('The system is checking payment status automatically.') : t('Preparing payment request...')}</li>
                    </ul>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              {t('Cancel')}
            </Button>
            <Button disabled className="flex-1">
              {isPaid ? t('Payment successful!') : processing ? t('Preparing...') : t('Waiting for confirmation')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
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
