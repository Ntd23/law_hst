const VIETQR_BANK_ALIASES: Record<string, string> = {
  'mb bank': 'MBBank',
  mbbank: 'MBBank',
  mb: 'MB',
  'vietcom bank': 'VCB',
  vietcombank: 'VCB',
  vcb: 'VCB',
  'techcom bank': 'TCB',
  techcombank: 'TCB',
  tcb: 'TCB',
  'vp bank': 'VPBank',
  vpbank: 'VPBank',
  acb: 'ACB',
  bidv: 'BIDV',
  vietinbank: 'VietinBank',
  agribank: 'Agribank',
};

export function normalizeVietQrBankCode(bankCode: string): string {
  const trimmedBankCode = (bankCode || '').trim();

  if (!trimmedBankCode) {
    return '';
  }

  const alias = VIETQR_BANK_ALIASES[trimmedBankCode.toLowerCase()];

  if (alias) {
    return alias;
  }

  return trimmedBankCode.replace(/\s+/g, '');
}
