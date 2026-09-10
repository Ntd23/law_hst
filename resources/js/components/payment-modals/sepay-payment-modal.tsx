import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/custom-toast';
import { formatCurrencyForCompany } from '@/utils/helpers';
import { normalizeVietQrBankCode } from '@/utils/vietqr';
import { QrCode } from 'lucide-react';

interface SepayPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: any;
  amount: number;
  sepaySettings?: {
    bank_code?: string;
    bank_name?: string;
    account_number?: string;
    account_name?: string;
    payment_prefix?: string;
    order_code?: string;
    transfer_content?: string;
    rule_name?: string;
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
  const bankCode = sepaySettings.bank_code || '';
  const vietQrBankCode = normalizeVietQrBankCode(bankCode);
  const accountNumber = sepaySettings.account_number || '';
  const accountName = sepaySettings.account_name || '';
  const paymentPrefix = sepaySettings.payment_prefix || 'SEPAY';

  const referenceCode = useMemo(() => {
    if (sepaySettings.order_code) {
      return sepaySettings.order_code;
    }

    const safePrefix = paymentPrefix
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .replace(/[-_]+$/g, '')
      .toUpperCase() || 'SEPAY';

    return `${safePrefix}-INV-${invoice.id}`;
  }, [paymentPrefix, invoice.id, sepaySettings.order_code]);

  const transferContent = sepaySettings.transfer_content || referenceCode;

  const qrUrl = useMemo(() => {
    if (!vietQrBankCode || !accountNumber) return '';

    const params = new URLSearchParams({
      bank: vietQrBankCode,
      acc: accountNumber,
      template: 'compact',
      amount: Math.round(Number(amount)).toString(),
      des: transferContent,
    });

    return `https://qr.sepay.vn/img?${params.toString()}`;
  }, [vietQrBankCode, accountNumber, amount, transferContent]);

  useEffect(() => {
    if (!isOpen || !referenceCode) return;

    const checkPaymentStatus = async () => {
      try {
        const response = await fetch(`/api/orders/${encodeURIComponent(referenceCode)}/check-status`, {
          headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
        });

        if (!response.ok) return;

        const result = await response.json();
        if (result?.is_paid === true) {
          toast.success(t('Payment successful'));
          onClose();
          window.location.reload();
        }
      } catch {
        // Keep the QR visible if the status check is temporarily unavailable.
      }
    };

    const intervalId = window.setInterval(checkPaymentStatus, 3000);
    checkPaymentStatus();

    return () => window.clearInterval(intervalId);
  }, [isOpen, onClose, referenceCode, t]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t('Payment')}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-[280px_1fr]">
          <div className="flex flex-col items-center justify-center rounded-md border bg-white p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
              <QrCode className="h-4 w-4 text-primary" />
              {t('Bank QR Code')}
            </div>
            {qrUrl ? (
              <img
                src={qrUrl}
                alt={t('Bank QR Code')}
                className="h-60 w-60 max-w-full object-contain"
              />
            ) : (
              <div className="flex h-60 w-60 max-w-full items-center justify-center rounded-md border border-dashed text-center text-sm text-muted-foreground">
                {t('Bank account information is incomplete.')}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <PaymentInfoRow label={t('Account Number')} value={accountNumber || '-'} />
            <PaymentInfoRow label={t('Account Name')} value={accountName || '-'} />
            <PaymentInfoRow label={t('Amount')} value={String(formatCurrencyForCompany(amount.toFixed(2)))} />
            <PaymentInfoRow label={t('Content Rule')} value={sepaySettings.rule_name || '-'} />
            <PaymentInfoRow label={t('Transfer Content')} value={transferContent} />

            <Button variant="outline" onClick={onClose} className="mt-2 w-full">
              {t('Close')}
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
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border bg-gray-50 px-4 py-3">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 break-all text-base font-semibold text-gray-900">{value}</p>
    </div>
  );
}
