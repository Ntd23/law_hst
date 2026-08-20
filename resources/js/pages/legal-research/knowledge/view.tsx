import React from 'react';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTranslation } from 'react-i18next';
import {
    BookOpen,
    Tag,
    Calendar,
    Clock,
    User,
    CheckCircle2,
    FileText,
    Archive,
    Send,
    Edit,
    X,
    Building2,
    Shield,
    Eye
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useInitials } from '@/hooks/use-initials';
import { hasPermission } from '@/utils/authorization';

interface ViewProps {
    record: any;
    onClose?: () => void;
    onEdit?: () => void;
    onPublishToggle?: () => void;
    isSuperAdmin?: boolean;
    permissions?: string[];
}

const STATUS_MAP: Record<string, { label: string; cls: string; dot: string }> = {
    published: {
        label: 'Đã xuất bản',
        cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        dot: 'bg-emerald-500'
    },
    draft: {
        label: 'Bản nháp',
        cls: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        dot: 'bg-blue-500'
    },
    archived: {
        label: 'Lưu trữ',
        cls: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        dot: 'bg-amber-500'
    },
};

function stripHtml(html: string): string {
    return html?.replace(/<[^>]*>/g, '') ?? '';
}

export default function ViewPopup({
    record,
    onClose,
    onEdit,
    onPublishToggle,
    isSuperAdmin = false,
    permissions = [],
}: ViewProps) {
    const { t } = useTranslation();
    const getInitials = useInitials();

    if (!record) return null;

    const statusInfo = STATUS_MAP[record?.status] || STATUS_MAP.draft;
    const tags: string[] = Array.isArray(record?.tags)
        ? record.tags
        : typeof record?.tags === 'string'
            ? record.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean)
            : [];

    const rawContent = stripHtml(record?.content || '');
    const paragraphs = rawContent.split('\n').filter(p => p.trim().length > 0);
    const wordCount = rawContent.split(/\s+/).filter(Boolean).length;
    const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

    const canEdit = isSuperAdmin || hasPermission(permissions, 'edit-knowledge-articles');
    const canPublish = isSuperAdmin || hasPermission(permissions, 'publish-knowledge-articles');

    return (
        <DialogContent
            className="max-w-3xl max-h-[90vh] overflow-hidden p-0 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col bg-white dark:bg-gray-900"
            onOpenAutoFocus={(e) => e.preventDefault()}
        >
            {/* Header Banner */}
            <div className="relative bg-gradient-to-br from-slate-900 via-slate-850 to-indigo-950 text-white p-6 sm:p-7 shrink-0 overflow-hidden">
                <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                            {record?.category && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-white/10 backdrop-blur-md text-white border border-white/15">
                                    <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                                    {record?.category?.name}
                                </span>
                            )}
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-white/10 backdrop-blur-md text-white border border-white/15">
                                <span className={`w-2 h-2 rounded-full ${statusInfo.dot}`} />
                                {t(statusInfo.label)}
                            </span>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-slate-300">
                            <span className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-primary" />
                                {record?.created_at ? (window.appSettings?.formatDate(record.created_at) || record.created_at.slice(0, 10)) : '-'}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-amber-400" />
                                {readTimeMinutes} {t('phút đọc')}
                            </span>
                        </div>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
                        {record?.title || t('Untitled Article')}
                    </h2>
                </div>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 sm:p-7 overflow-y-auto space-y-6 flex-1">
                {/* Author Card */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                    <div className="flex items-center gap-3.5">
                        <Avatar className="h-11 w-11 ring-2 ring-primary/20 shadow-xs">
                            <AvatarImage src={record?.creator?.avatar} alt={record?.creator?.name} />
                            <AvatarFallback className="text-sm font-bold bg-primary/10 text-primary">
                                {getInitials(record?.creator?.name || '?')}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-gray-900 dark:text-white">
                                    {record?.creator?.name || t('Chuyên gia Pháp lý')}
                                </span>
                                {record?.creator?.type === 'superadmin' ? (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 flex items-center gap-1">
                                        <Shield className="w-3 h-3" />
                                        Super Admin
                                    </span>
                                ) : (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center gap-1">
                                        <Building2 className="w-3 h-3" />
                                        {t('Hãng Luật')}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {record?.creator?.email || t('Tác giả bài viết')}
                            </p>
                        </div>
                    </div>

                    <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500 font-medium">
                        <span>{wordCount} {t('từ')}</span>
                    </div>
                </div>

                {/* Excerpt / Summary Callout */}
                {paragraphs.length > 0 && (
                    <div className="p-4.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 text-amber-950 dark:text-amber-200 text-sm font-medium italic leading-relaxed shadow-xs">
                        "{paragraphs[0]}"
                    </div>
                )}

                {/* Article Full Content */}
                <div className="space-y-4 text-sm sm:text-base text-gray-800 dark:text-gray-200 leading-relaxed font-normal">
                    {paragraphs.length > 1 ? (
                        paragraphs.slice(1).map((p, idx) => (
                            <p key={idx} className="leading-relaxed">
                                {p}
                            </p>
                        ))
                    ) : paragraphs.length === 1 ? (
                        <p className="leading-relaxed">{paragraphs[0]}</p>
                    ) : (
                        <p className="text-gray-400 italic">{t('Không có nội dung chi tiết.')}</p>
                    )}
                </div>

                {/* Tags Cloud */}
                {tags.length > 0 && (
                    <div className="pt-5 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                            <Tag className="w-3.5 h-3.5 text-primary" />
                            {t('Từ khoá')}:
                        </span>
                        {tags.map((tag: string, index: number) => (
                            <span
                                key={index}
                                className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer Action Bar */}
            <div className="p-4 sm:px-6 bg-slate-50 dark:bg-slate-900/90 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2">
                    {canPublish && onPublishToggle && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onPublishToggle}
                            className="text-xs font-semibold gap-1.5"
                        >
                            <Send className="w-3.5 h-3.5" />
                            {record.status === 'published' ? t('Huỷ xuất bản') : t('Xuất bản')}
                        </Button>
                    )}
                    {canEdit && onEdit && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onEdit}
                            className="text-xs font-semibold gap-1.5"
                        >
                            <Edit className="w-3.5 h-3.5" />
                            {t('Chỉnh sửa')}
                        </Button>
                    )}
                </div>

                <Button
                    variant="default"
                    size="sm"
                    onClick={onClose}
                    className="text-xs font-semibold px-5"
                >
                    {t('Đóng')}
                </Button>
            </div>
        </DialogContent>
    );
}
