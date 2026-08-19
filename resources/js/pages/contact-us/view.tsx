import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTranslation } from 'react-i18next';
import { MessageSquare, Mail, User, FileText, Calendar, Phone, Activity, UserPlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { router } from '@inertiajs/react';

interface ViewProps {
    record: any;
}

export default function View({ record }: ViewProps) {
    const { t } = useTranslation();

    const getPhoneFromRecord = (row: any) => {
        if (row?.phone) return row.phone;
        if (!row?.message) return '';
        const cleanMsg = (row.message || '').replace(/\\n/g, '\n').replace(/\r\n/g, '\n');
        const phoneMatch = cleanMsg.match(/Số điện thoại:\s*([^\n\r]+)/i);
        return phoneMatch ? phoneMatch[1].trim() : '';
    };

    const handleCreateClient = (row: any) => {
        const phoneVal = getPhoneFromRecord(row);
        let address = '';
        if (row?.message) {
            const cleanMsg = (row.message || '').replace(/\\n/g, '\n').replace(/\r\n/g, '\n');
            const addrMatch = cleanMsg.match(/Địa chỉ:\s*([^\n\r]+)/i);
            if (addrMatch) address = addrMatch[1].trim();
        }
        router.visit(route('clients.index', {
            create: '1',
            name: row?.name || '',
            email: row?.email || '',
            phone: phoneVal || '',
            address: address || '',
        }));
    };

    const phone = getPhoneFromRecord(record);
    const status = (record?.status || 'pending').toLowerCase();
    
    const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
        pending: { label: t('Chờ xử lý'), bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200', text: 'text-amber-700' },
        contacted: { label: t('Đã liên hệ'), bg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200', text: 'text-blue-700' },
        resolved: { label: t('Đã giải quyết'), bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200', text: 'text-emerald-700' },
        cancelled: { label: t('Đã hủy'), bg: 'bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200', text: 'text-gray-600' },
    };

    const currentConf = statusConfig[status] || statusConfig.pending;

    return (
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
            <DialogHeader className="px-6 pt-6 pb-4 border-b">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <MessageSquare className="h-5 w-5 text-primary" />
                        </div>
                        <DialogTitle className="text-xl font-semibold">{t('Contact Details')}</DialogTitle>
                    </div>
                    <Badge variant="outline" className={`text-xs font-semibold px-2.5 py-1 ${currentConf.bg}`}>
                        {currentConf.label}
                    </Badge>
                </div>
            </DialogHeader>

            <div className="px-6 py-4 pb-6 space-y-4">
                {/* Name & Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                            <User className="h-3.5 w-3.5 text-gray-400" />
                            {t('Họ và tên')}
                        </label>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{record?.name || '-'}</p>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                            <Activity className="h-3.5 w-3.5 text-gray-400" />
                            {t('Trạng thái')}
                        </label>
                        <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-md border ${currentConf.bg}`}>
                            {currentConf.label}
                        </span>
                    </div>
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                            <Mail className="h-3.5 w-3.5 text-gray-400" />
                            {t('Gmail / Email')}
                        </label>
                        {record?.email ? (
                            <a href={`mailto:${record.email}`} className="text-sm font-medium text-blue-600 hover:underline font-mono">
                                {record.email}
                            </a>
                        ) : (
                            <p className="text-sm text-gray-400 italic">--</p>
                        )}
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                            <Phone className="h-3.5 w-3.5 text-gray-400" />
                            {t('Số điện thoại')}
                        </label>
                        {phone ? (
                            <a href={`tel:${phone}`} className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline font-mono">
                                {phone}
                            </a>
                        ) : (
                            <p className="text-sm text-gray-400 italic font-normal">--</p>
                        )}
                    </div>
                </div>

                {/* Subject & Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                            <FileText className="h-3.5 w-3.5 text-gray-400" />
                            {t('Subject')}
                        </label>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{record?.subject || '-'}</p>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                            <Calendar className="h-3.5 w-3.5 text-gray-400" />
                            {t('Date')}
                        </label>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {record?.created_at ? (window.appSettings?.formatDateTime(record.created_at, true) || new Date(record.created_at).toLocaleString()) : '-'}
                        </p>
                    </div>
                </div>

                {/* Lawyer (If specified) */}
                {(record?.user?.name || (() => {
                    if (!record?.message) return '';
                    const cleanMsg = (record.message || '').replace(/\\n/g, '\n').replace(/\r\n/g, '\n');
                    const match = cleanMsg.match(/Luật sư mong muốn:\s*([^\n\r]+)/i);
                    return match ? match[1].trim() : '';
                })()) && (
                    <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-800/80 flex items-center gap-2">
                        <User className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        <div className="text-xs">
                            <span className="text-gray-500 dark:text-gray-400 mr-1.5">{t('Luật sư mong muốn')}:</span>
                            <span className="font-bold text-indigo-700 dark:text-indigo-300">
                                {record?.user?.name || (() => {
                                    const cleanMsg = (record.message || '').replace(/\\n/g, '\n').replace(/\r\n/g, '\n');
                                    const match = cleanMsg.match(/Luật sư mong muốn:\s*([^\n\r]+)/i);
                                    return match ? match[1].trim() : '';
                                })()}
                            </span>
                        </div>
                    </div>
                )}

                {/* Message */}
                {record?.message && (
                    <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                            <MessageSquare className="h-3.5 w-3.5 text-gray-400" />
                            {t('Message')}
                        </label>
                        <div className="p-3.5 bg-gray-50 dark:bg-gray-800/60 rounded-xl border text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                            {record.message}
                        </div>
                    </div>
                )}

                {/* Create Account Action */}
                {status === 'resolved' && (
                    <div className="pt-2">
                        {record?.has_account ? (
                            <div className="w-full py-2 px-3 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-blue-200 dark:border-blue-800">
                                <span>{t('Đã có tài khoản trong hệ thống')}</span>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => handleCreateClient(record)}
                                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                            >
                                <UserPlus className="w-4 h-4" />
                                <span>{t('Tạo Tài Khoản Thân Chủ')}</span>
                            </button>
                        )}
                    </div>
                )}
            </div>
        </DialogContent>
    );
}
