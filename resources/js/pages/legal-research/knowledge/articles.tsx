import { useEffect, useState } from 'react';
import { PageTemplate } from '@/components/page-template';
import { usePage, router } from '@inertiajs/react';
import {
    Plus, BookOpen, Edit, Trash2, Eye, Globe, Lock,
    Tag, User, Calendar, CheckCircle2, FileText, Archive, Send,
    MoreHorizontal, Search, LayoutGrid, List, SlidersHorizontal,
    Sparkles, ArrowRight, Building2, Shield, EyeOff, RotateCcw,
    FileEdit, Clock
} from 'lucide-react';
import { hasPermission } from '@/utils/authorization';
import { CrudFormModal } from '@/components/CrudFormModal';
import { CrudDeleteModal } from '@/components/CrudDeleteModal';
import { toast } from '@/components/custom-toast';
import { useTranslation } from 'react-i18next';
import { Pagination } from '@/components/ui/pagination';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useInitials } from '@/hooks/use-initials';
import { Dialog } from '@/components/ui/dialog';
import ViewPopup from './view';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatStatusText, hexToRgba } from '@/utils/helpers';

const ARTICLE_IMAGES = [
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1479142506502-19b3a3b7ff33?auto=format&fit=crop&q=80&w=800',
];

function getArticleImage(article: any) {
    if (article.image) return article.image;
    const index = Math.abs((article.id || 1) - 1) % ARTICLE_IMAGES.length;
    return ARTICLE_IMAGES[index];
}

const STATUS_CONFIG = {
    published: {
        label: 'Đã xuất bản',
        cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 ring-1 ring-emerald-600/20 border border-emerald-200/60 dark:border-emerald-800/60',
        dot: 'bg-emerald-500'
    },
    draft: {
        label: 'Bản nháp',
        cls: 'bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 ring-1 ring-blue-600/20 border border-blue-200/60 dark:border-blue-800/60',
        dot: 'bg-blue-500'
    },
    archived: {
        label: 'Lưu trữ',
        cls: 'bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 ring-1 ring-amber-600/20 border border-amber-200/60 dark:border-amber-800/60',
        dot: 'bg-amber-500'
    },
} as const;

function stripHtml(html: string): string {
    return html?.replace(/<[^>]*>/g, '') ?? '';
}

export default function KnowledgeArticles() {
    const { t } = useTranslation();
    const {
        auth,
        articles,
        stats,
        categories,
        allCategories,
        filters: pageFilters = {},
    } = usePage().props as any;
    const permissions = auth?.permissions || [];
    const getInitials = useInitials();

    const [searchTerm, setSearchTerm] = useState(pageFilters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(pageFilters.category_id || '_empty_');
    const [selectedStatus, setSelectedStatus] = useState(pageFilters.status || '_empty_');
    const [sortDirection, setSortDirection] = useState(pageFilters.sort_direction || 'desc');
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<any>(null);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

    // ── Query helpers ────────────────────────────────────────────────────────
    const qp = () => ({
        search: searchTerm || undefined,
        category_id: selectedCategory !== '_empty_' ? selectedCategory : undefined,
        status: selectedStatus !== '_empty_' ? selectedStatus : undefined,
        sort_direction: sortDirection || undefined,
        ...(pageFilters.per_page && { per_page: pageFilters.per_page }),
    });

    const applyFilters = (customParams?: any) => {
        router.get(
            route('legal-research.knowledge.index'),
            { ...qp(), ...customParams, page: 1 },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setSelectedCategory('_empty_');
        setSelectedStatus('_empty_');
        setSortDirection('desc');
        router.get(route('legal-research.knowledge.index'));
    };

    const handleStatusCardClick = (statusKey: string) => {
        const newStatus = selectedStatus === statusKey ? '_empty_' : statusKey;
        setSelectedStatus(newStatus);
        applyFilters({ status: newStatus !== '_empty_' ? newStatus : undefined });
    };

    // ── CRUD handlers ────────────────────────────────────────────────────────
    const handleFormSubmit = (formData: any) => {
        if (formData.tags && typeof formData.tags === 'string') {
            formData.tags = formData.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean);
        }
        const isCreate = formMode === 'create';
        router[isCreate ? 'post' : 'put'](
            isCreate ? route('legal-research.knowledge.store') : route('legal-research.knowledge.update', currentItem.id),
            formData,
            {
                onSuccess: (page) => {
                    setIsFormOpen(false);
                    const f = page.props.flash as any;
                    if (f?.success) toast.success(t(f.success));
                    else if (f?.error) toast.error(t(f.error));
                },
                onError: (errors) => toast.error(Object.values(errors).join(', ')),
            }
        );
    };

    const handleDelete = () => {
        router.delete(route('legal-research.knowledge.destroy', currentItem.id), {
            onSuccess: (page) => {
                setIsDeleteOpen(false);
                const f = page.props.flash as any;
                if (f?.success) toast.success(t(f.success));
                else if (f?.error) toast.error(t(f.error));
            },
            onError: (errors) => toast.error(Object.values(errors).join(', ')),
        });
    };

    const handlePublishToggle = (article: any) => {
        router.put(route('legal-research.knowledge.publish', article.id), {}, {
            onSuccess: (page) => {
                const f = page.props.flash as any;
                if (f?.success) toast.success(t(f.success));
                else if (f?.error) toast.error(t(f.error));
            },
            onError: (errors) => toast.error(Object.values(errors).join(', ')),
        });
    };

    const handleArchiveToggle = (article: any) => {
        const newStatus = article.status === 'archived' ? 'draft' : 'archived';
        router.put(route('legal-research.knowledge.update', article.id), {
            ...article,
            tags: Array.isArray(article.tags) ? article.tags : [],
            status: newStatus
        }, {
            onSuccess: (page) => {
                const f = page.props.flash as any;
                if (f?.success) toast.success(t(f.success));
                else if (f?.error) toast.error(t(f.error));
            },
            onError: (errors) => toast.error(Object.values(errors).join(', ')),
        });
    };

    const isSuperAdmin = auth.user?.type === 'superadmin' || auth.user?.role === 'superadmin';

    // ── Page setup ────────────────────────────────────────────────────────────
    const pageActions: any[] = [];
    if (isSuperAdmin || hasPermission(permissions, 'create-knowledge-articles')) {
        pageActions.push({
            label: t('Viết bài mới'),
            icon: <Plus className="h-4 w-4 mr-2" />,
            variant: 'default',
            onClick: () => { setCurrentItem(null); setFormMode('create'); setIsFormOpen(true); },
        });
    }

    const breadcrumbs = isSuperAdmin ? [
        { title: t('Bảng điều khiển'), href: route('dashboard') },
        { title: t('Quản lý bài viết') },
    ] : [
        { title: t('Bảng điều khiển'), href: route('dashboard') },
        { title: t('Nghiên cứu Pháp lý') },
        { title: t('Quản lý bài viết') },
    ];

    const data: any[] = articles?.data || [];
    const hasActiveFilter = searchTerm !== '' || selectedCategory !== '_empty_' || selectedStatus !== '_empty_';

    const publishedPercentage = stats?.total > 0
        ? Math.round(((stats?.published ?? 0) / stats.total) * 100)
        : 0;

    return (
        <PageTemplate
            title={t('Quản lý bài viết')}
            url="/legal-research/knowledge"
            actions={pageActions}
            description={t("Quản lý các bài viết phân tích pháp lý, bài đăng kiến thức và ấn phẩm chuyên môn hiển thị trên toàn hệ thống.")}
            breadcrumbs={breadcrumbs}
            noPadding
        >
            {/* ── Stats Overview ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Total */}
                <div
                    onClick={() => handleStatusCardClick('_empty_')}
                    className={`cursor-pointer group relative bg-white dark:bg-gray-900 rounded-3xl p-5 border transition-all duration-200 shadow-xs hover:shadow-md ${
                        selectedStatus === '_empty_' && !hasActiveFilter
                            ? 'border-indigo-500/70 ring-2 ring-indigo-500/10'
                            : 'border-gray-200/80 dark:border-gray-800 hover:border-indigo-400/50'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {t('Tổng bài viết')}
                            </p>
                            <h3 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-1">
                                {stats?.total ?? 0}
                            </h3>
                            <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium mt-1">
                                {t('Toàn hệ thống')}
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                            <BookOpen className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* Published */}
                <div
                    onClick={() => handleStatusCardClick('published')}
                    className={`cursor-pointer group relative bg-white dark:bg-gray-900 rounded-3xl p-5 border transition-all duration-200 shadow-xs hover:shadow-md ${
                        selectedStatus === 'published'
                            ? 'border-emerald-500/70 ring-2 ring-emerald-500/10'
                            : 'border-gray-200/80 dark:border-gray-800 hover:border-emerald-400/50'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {t('Đã xuất bản')}
                            </p>
                            <h3 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-1">
                                {stats?.published ?? 0}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-1">
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                                    {publishedPercentage}%
                                </span>
                                <span className="text-[11px] text-gray-400">{t('công khai')}</span>
                            </div>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* Draft */}
                <div
                    onClick={() => handleStatusCardClick('draft')}
                    className={`cursor-pointer group relative bg-white dark:bg-gray-900 rounded-3xl p-5 border transition-all duration-200 shadow-xs hover:shadow-md ${
                        selectedStatus === 'draft'
                            ? 'border-blue-500/70 ring-2 ring-blue-500/10'
                            : 'border-gray-200/80 dark:border-gray-800 hover:border-blue-400/50'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {t('Bản nháp')}
                            </p>
                            <h3 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-1">
                                {stats?.draft ?? 0}
                            </h3>
                            <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mt-1">
                                {t('Đang soạn thảo')}
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                            <FileEdit className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* Archived */}
                <div
                    onClick={() => handleStatusCardClick('archived')}
                    className={`cursor-pointer group relative bg-white dark:bg-gray-900 rounded-3xl p-5 border transition-all duration-200 shadow-xs hover:shadow-md ${
                        selectedStatus === 'archived'
                            ? 'border-amber-500/70 ring-2 ring-amber-500/10'
                            : 'border-gray-200/80 dark:border-gray-800 hover:border-amber-400/50'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {t('Lưu trữ')}
                            </p>
                            <h3 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-1">
                                {stats?.archived ?? 0}
                            </h3>
                            <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-1">
                                {t('Tạm ẩn')}
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                            <Archive className="w-6 h-6" />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Filter & Search Bar ── */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-4 sm:p-5 border border-gray-200/80 dark:border-gray-800 shadow-xs mb-6 space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
                    {/* Search Form */}
                    <form
                        onSubmit={(e) => { e.preventDefault(); applyFilters(); }}
                        className="relative flex-1 min-w-[260px]"
                    >
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={t('Tìm kiếm theo tiêu đề, nội dung bài viết...')}
                            className="w-full pl-10 pr-20 py-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() => { setSearchTerm(''); applyFilters({ search: undefined }); }}
                                className="absolute right-12 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            >
                                {t('Xoá')}
                            </button>
                        )}
                        <button
                            type="submit"
                            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-semibold hover:opacity-90 transition-opacity"
                        >
                            {t('Tìm')}
                        </button>
                    </form>

                    {/* Filter Selects */}
                    <div className="flex flex-wrap items-center gap-2.5">
                        {/* Category filter */}
                        <select
                            value={selectedCategory}
                            onChange={(e) => {
                                setSelectedCategory(e.target.value);
                                applyFilters({ category_id: e.target.value !== '_empty_' ? e.target.value : undefined });
                            }}
                            className="px-3.5 py-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-xs sm:text-sm text-gray-800 dark:text-gray-200 focus:outline-hidden focus:ring-2 focus:ring-primary/20 cursor-pointer"
                        >
                            <option value="_empty_">{t('Tất cả Danh mục')}</option>
                            {(allCategories || []).map((c: any) => (
                                <option key={c.id} value={c.id.toString()}>
                                    {c.name}
                                </option>
                            ))}
                        </select>

                        {/* Status filter */}
                        <select
                            value={selectedStatus}
                            onChange={(e) => {
                                setSelectedStatus(e.target.value);
                                applyFilters({ status: e.target.value !== '_empty_' ? e.target.value : undefined });
                            }}
                            className="px-3.5 py-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-xs sm:text-sm text-gray-800 dark:text-gray-200 focus:outline-hidden focus:ring-2 focus:ring-primary/20 cursor-pointer"
                        >
                            <option value="_empty_">{t('Tất cả Trạng thái')}</option>
                            <option value="published">{t('Đã xuất bản')}</option>
                            <option value="draft">{t('Bản nháp')}</option>
                            <option value="archived">{t('Lưu trữ')}</option>
                        </select>

                        {/* Reset Filter Button */}
                        {hasActiveFilter && (
                            <button
                                onClick={handleResetFilters}
                                className="p-2.5 rounded-2xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                                title={t('Đặt lại bộ lọc')}
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">{t('Đặt lại')}</span>
                            </button>
                        )}

                        {/* View Switcher: Grid / Table */}
                        <div className="flex items-center p-1 rounded-2xl bg-gray-100 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 ml-auto sm:ml-0">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-xl transition-all ${
                                    viewMode === 'grid'
                                        ? 'bg-white dark:bg-gray-900 text-primary shadow-xs font-semibold'
                                        : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                                }`}
                                title={t('Chế độ Lưới (Card)')}
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('table')}
                                className={`p-2 rounded-xl transition-all ${
                                    viewMode === 'table'
                                        ? 'bg-white dark:bg-gray-900 text-primary shadow-xs font-semibold'
                                        : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                                }`}
                                title={t('Chế độ Bảng (Danh sách)')}
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Status Quick Filter Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-gray-100 dark:border-gray-800">
                    <span className="text-xs font-semibold text-gray-400 mr-1 shrink-0">
                        {t('Lọc nhanh')}:
                    </span>
                    {[
                        { key: '_empty_', label: t('Tất cả'), count: stats?.total ?? 0 },
                        { key: 'published', label: t('Đã xuất bản'), count: stats?.published ?? 0 },
                        { key: 'draft', label: t('Bản nháp'), count: stats?.draft ?? 0 },
                        { key: 'archived', label: t('Lưu trữ'), count: stats?.archived ?? 0 },
                    ].map((tab) => {
                        const isActive = selectedStatus === tab.key;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => handleStatusCardClick(tab.key)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                                    isActive
                                        ? 'bg-primary text-white shadow-xs'
                                        : 'bg-gray-50 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                            >
                                <span>{tab.label}</span>
                                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                                    isActive
                                        ? 'bg-white/20 text-white'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                }`}>
                                    {tab.count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Content View ── */}
            {data.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-300 dark:border-gray-800 shadow-xs">
                    <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 flex items-center justify-center mb-4">
                        <BookOpen className="w-8 h-8" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                        {t('Không tìm thấy bài viết nào')}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
                        {hasActiveFilter
                            ? t('Không có bài viết nào phù hợp với bộ lọc hiện tại. Thử xoá bộ lọc hoặc đổi từ khoá tìm kiếm.')
                            : t('Chưa có bài viết kiến thức pháp lý nào trong hệ thống. Hãy tạo bài viết đầu tiên ngay.')}
                    </p>
                    <div className="flex items-center gap-3 mt-5">
                        {hasActiveFilter && (
                            <Button variant="outline" size="sm" onClick={handleResetFilters} className="text-xs">
                                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                                {t('Xoá bộ lọc')}
                            </Button>
                        )}
                        {(isSuperAdmin || hasPermission(permissions, 'create-knowledge-articles')) && (
                            <Button
                                size="sm"
                                onClick={() => { setCurrentItem(null); setFormMode('create'); setIsFormOpen(true); }}
                                className="text-xs font-semibold"
                            >
                                <Plus className="w-3.5 h-3.5 mr-1.5" />
                                {t('Viết bài mới')}
                            </Button>
                        )}
                    </div>
                </div>
            ) : viewMode === 'grid' ? (
                /* ── CARD VIEW (Matches uploaded image exactly) ── */
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {data.map((article: any) => {
                        const sc = STATUS_CONFIG[article.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.draft;
                        const plainText = stripHtml(article.content);
                        const articleImage = getArticleImage(article);
                        const wordCount = plainText.split(/\s+/).filter(Boolean).length;
                        const readTime = `${Math.max(1, Math.ceil(wordCount / 200))} ${t('phút đọc')}`;
                        const formattedDate = article.created_at
                            ? (window.appSettings?.formatDate(article.created_at) || article.created_at.slice(0, 10))
                            : '-';

                        const authorName = article.creator?.name || 'Super Admin';

                        return (
                            <div
                                key={article.id}
                                className="group relative flex flex-col bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-primary/40 transition-all duration-300 overflow-hidden"
                            >
                                {/* Card Image Banner */}
                                <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                                    <img
                                        src={articleImage}
                                        alt={article.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />

                                    {/* Category Badge Floating on Image (Top-Left) */}
                                    <div className="absolute top-3 left-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md text-primary dark:text-blue-400 text-[11px] sm:text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs border border-white/20">
                                        {article.category?.name || t('Pháp luật Doanh nghiệp')}
                                    </div>

                                    {/* Status & Actions Floating on Image (Top-Right) */}
                                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-semibold backdrop-blur-md shadow-xs ${sc.cls}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                                            {t(sc.label)}
                                        </span>

                                        {(isSuperAdmin ||
                                            hasPermission(permissions, 'manage-knowledge-articles') ||
                                            hasPermission(permissions, 'edit-knowledge-articles') ||
                                            hasPermission(permissions, 'delete-knowledge-articles') ||
                                            hasPermission(permissions, 'publish-knowledge-articles')) && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button className="p-1.5 rounded-xl bg-white/90 dark:bg-black/60 backdrop-blur-md text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-black/80 shadow-xs transition-colors cursor-pointer">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48 rounded-2xl p-1.5 shadow-xl border border-gray-200 dark:border-gray-800">
                                                    {(isSuperAdmin || hasPermission(permissions, 'manage-knowledge-articles')) && (
                                                        <DropdownMenuItem
                                                            onClick={() => { setCurrentItem(article); setIsViewOpen(true); }}
                                                            className="rounded-xl cursor-pointer py-2 text-xs font-semibold"
                                                        >
                                                            <Eye className="h-4 w-4 mr-2 text-blue-500" />
                                                            {t('Xem chi tiết')}
                                                        </DropdownMenuItem>
                                                    )}
                                                    {(isSuperAdmin || hasPermission(permissions, 'edit-knowledge-articles')) && (
                                                        <DropdownMenuItem
                                                            onClick={() => { setCurrentItem(article); setFormMode('edit'); setIsFormOpen(true); }}
                                                            className="rounded-xl cursor-pointer py-2 text-xs font-semibold"
                                                        >
                                                            <Edit className="h-4 w-4 mr-2 text-amber-500" />
                                                            {t('Chỉnh sửa')}
                                                        </DropdownMenuItem>
                                                    )}
                                                    {(isSuperAdmin || hasPermission(permissions, 'publish-knowledge-articles')) && (
                                                        <DropdownMenuItem
                                                            onClick={() => handlePublishToggle(article)}
                                                            className="rounded-xl cursor-pointer py-2 text-xs font-semibold"
                                                        >
                                                            {article.status === 'published' ? (
                                                                <>
                                                                    <EyeOff className="h-4 w-4 mr-2 text-gray-500" />
                                                                    {t('Huỷ xuất bản')}
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Send className="h-4 w-4 mr-2 text-emerald-500" />
                                                                    {t('Xuất bản')}
                                                                </>
                                                            )}
                                                        </DropdownMenuItem>
                                                    )}
                                                    {((isSuperAdmin || hasPermission(permissions, 'edit-knowledge-articles')) && article.status !== 'archived') && (
                                                        <DropdownMenuItem
                                                            onClick={() => handleArchiveToggle(article)}
                                                            className="rounded-xl cursor-pointer py-2 text-xs font-semibold"
                                                        >
                                                            <Archive className="h-4 w-4 mr-2 text-amber-600" />
                                                            {t('Lưu trữ bài viết')}
                                                        </DropdownMenuItem>
                                                    )}
                                                    {(isSuperAdmin || hasPermission(permissions, 'delete-knowledge-articles')) && (
                                                        <>
                                                            <DropdownMenuSeparator className="my-1" />
                                                            <DropdownMenuItem
                                                                className="rounded-xl cursor-pointer py-2 text-xs font-semibold text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30"
                                                                onClick={() => { setCurrentItem(article); setIsDeleteOpen(true); }}
                                                            >
                                                                <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                                                                {t('Xoá bài viết')}
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-3">
                                    <div className="space-y-2.5">
                                        {/* Date and Read Time Row */}
                                        <div className="flex items-center gap-2.5 text-xs text-gray-500 dark:text-gray-400 font-medium">
                                            <span className="flex items-center gap-1.5 text-primary">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span className="text-gray-600 dark:text-gray-300">{formattedDate}</span>
                                            </span>
                                            <span className="text-gray-300 dark:text-gray-600">•</span>
                                            <span className="flex items-center gap-1.5 text-primary">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span className="text-gray-600 dark:text-gray-300">{readTime}</span>
                                            </span>
                                        </div>

                                        {/* Article Title (Bright Blue font as shown in image) */}
                                        <h3
                                            onClick={() => { setCurrentItem(article); setIsViewOpen(true); }}
                                            className="text-base sm:text-lg font-bold text-primary dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors line-clamp-2 leading-snug cursor-pointer"
                                        >
                                            {article.title}
                                        </h3>

                                        {/* Excerpt / Summary */}
                                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed font-normal">
                                            {plainText}
                                        </p>
                                    </div>
                                </div>

                                {/* Card Footer: Author (Left) + "Xem chi tiết ->" (Right) */}
                                <div className="px-5 sm:px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <Avatar className="h-7 w-7 rounded-full ring-1 ring-amber-400/40 shrink-0">
                                            <AvatarImage src={article.creator?.avatar} alt={authorName} />
                                            <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                                                {getInitials(authorName)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 truncate max-w-[130px]">
                                            {authorName}
                                        </span>
                                    </div>

                                    <button
                                        onClick={() => { setCurrentItem(article); setIsViewOpen(true); }}
                                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary group-hover:translate-x-1 transition-transform cursor-pointer"
                                    >
                                        <span>{t('Xem chi tiết')}</span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* ── TABLE VIEW ── */
                <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50/80 dark:bg-gray-800/50 hover:bg-gray-50/80">
                                <TableHead className="font-bold text-xs uppercase tracking-wider text-gray-500 py-4 pl-6">
                                    {t('Bài viết')}
                                </TableHead>
                                <TableHead className="font-bold text-xs uppercase tracking-wider text-gray-500 py-4">
                                    {t('Danh mục')}
                                </TableHead>
                                <TableHead className="font-bold text-xs uppercase tracking-wider text-gray-500 py-4">
                                    {t('Tác giả')}
                                </TableHead>
                                <TableHead className="font-bold text-xs uppercase tracking-wider text-gray-500 py-4 text-center">
                                    {t('Trạng thái')}
                                </TableHead>
                                <TableHead className="font-bold text-xs uppercase tracking-wider text-gray-500 py-4">
                                    {t('Ngày tạo')}
                                </TableHead>
                                <TableHead className="font-bold text-xs uppercase tracking-wider text-gray-500 py-4 pr-6 text-right">
                                    {t('Thao tác')}
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((article: any) => {
                                const sc = STATUS_CONFIG[article.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.draft;
                                const plainText = stripHtml(article.content);
                                const authorName = article.creator?.name || 'Super Admin';
                                const formattedDate = article.created_at
                                    ? (window.appSettings?.formatDate(article.created_at) || article.created_at.slice(0, 10))
                                    : '-';

                                return (
                                    <TableRow
                                        key={article.id}
                                        className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors border-b border-gray-100 dark:border-gray-800"
                                    >
                                        <TableCell className="py-4 pl-6 max-w-sm">
                                            <div className="space-y-1">
                                                <h4
                                                    onClick={() => { setCurrentItem(article); setIsViewOpen(true); }}
                                                    className="font-bold text-sm text-primary dark:text-blue-400 hover:underline cursor-pointer line-clamp-1 leading-snug"
                                                >
                                                    {article.title}
                                                </h4>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                                                    {plainText}
                                                </p>
                                            </div>
                                        </TableCell>

                                        <TableCell className="py-4">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200/50">
                                                {article.category?.name || t('Pháp luật')}
                                            </span>
                                        </TableCell>

                                        <TableCell className="py-4">
                                            <div className="flex items-center gap-2.5">
                                                <Avatar className="h-7 w-7 ring-1 ring-amber-400/40 shrink-0">
                                                    <AvatarImage src={article.creator?.avatar} alt={authorName} />
                                                    <AvatarFallback className="text-[9px] font-bold bg-primary/10 text-primary">
                                                        {getInitials(authorName)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="text-xs font-bold text-gray-900 dark:text-white">
                                                    {authorName}
                                                </span>
                                            </div>
                                        </TableCell>

                                        <TableCell className="py-4 text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold ${sc.cls}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                                                {t(sc.label)}
                                            </span>
                                        </TableCell>

                                        <TableCell className="py-4 text-xs text-gray-500">
                                            {formattedDate}
                                        </TableCell>

                                        <TableCell className="py-4 pr-6 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => { setCurrentItem(article); setIsViewOpen(true); }}
                                                    className="h-8 w-8 p-0 rounded-xl text-gray-500 hover:text-primary hover:bg-primary/10"
                                                    title={t('Xem chi tiết')}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>

                                                {(isSuperAdmin || hasPermission(permissions, 'edit-knowledge-articles')) && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => { setCurrentItem(article); setFormMode('edit'); setIsFormOpen(true); }}
                                                        className="h-8 w-8 p-0 rounded-xl text-gray-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                                                        title={t('Chỉnh sửa')}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                )}

                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                                                        >
                                                            <MoreHorizontal className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-44 rounded-2xl p-1.5 shadow-xl border border-gray-200 dark:border-gray-800">
                                                        {(isSuperAdmin || hasPermission(permissions, 'publish-knowledge-articles')) && (
                                                            <DropdownMenuItem
                                                                onClick={() => handlePublishToggle(article)}
                                                                className="rounded-xl cursor-pointer py-2 text-xs font-semibold"
                                                            >
                                                                {article.status === 'published' ? (
                                                                    <>
                                                                        <EyeOff className="h-4 w-4 mr-2 text-gray-500" />
                                                                        {t('Huỷ xuất bản')}
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Send className="h-4 w-4 mr-2 text-emerald-500" />
                                                                        {t('Xuất bản')}
                                                                    </>
                                                                )}
                                                            </DropdownMenuItem>
                                                        )}
                                                        {((isSuperAdmin || hasPermission(permissions, 'edit-knowledge-articles')) && article.status !== 'archived') && (
                                                            <DropdownMenuItem
                                                                onClick={() => handleArchiveToggle(article)}
                                                                className="rounded-xl cursor-pointer py-2 text-xs font-semibold"
                                                            >
                                                                <Archive className="h-4 w-4 mr-2 text-amber-600" />
                                                                {t('Lưu trữ')}
                                                            </DropdownMenuItem>
                                                        )}
                                                        {(isSuperAdmin || hasPermission(permissions, 'delete-knowledge-articles')) && (
                                                            <>
                                                                <DropdownMenuSeparator className="my-1" />
                                                                <DropdownMenuItem
                                                                    className="rounded-xl cursor-pointer py-2 text-xs font-semibold text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30"
                                                                    onClick={() => { setCurrentItem(article); setIsDeleteOpen(true); }}
                                                                >
                                                                    <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                                                                    {t('Xoá')}
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* ── Pagination ── */}
            {articles?.total > 0 && (
                <div className="mt-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs overflow-hidden">
                    <Pagination
                        from={articles?.from || 0}
                        to={articles?.to || 0}
                        total={articles?.total || 0}
                        links={articles?.links}
                        entityName={t('bài viết')}
                        perPageOptions={[9, 18, 27, 45, 90]}
                        currentPerPage={pageFilters.per_page?.toString() || '9'}
                        onPerPageChange={(value) => {
                            router.get(route('legal-research.knowledge.index'), {
                                ...qp(), page: 1, per_page: parseInt(value),
                            }, { preserveState: true, preserveScroll: true });
                        }}
                        onPageChange={(url) => {
                            const page = new URL(url).searchParams.get('page');
                            router.get(route('legal-research.knowledge.index'), { ...qp(), page }, { preserveState: true, preserveScroll: true });
                        }}
                    />
                </div>
            )}

            {/* ── Create / Edit Modal ── */}
            <CrudFormModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSubmit={handleFormSubmit}
                formConfig={{
                    fields: [
                        {
                            name: 'title',
                            label: t('Tiêu đề bài viết'),
                            type: 'text',
                            required: true,
                            placeholder: t('VD: Thẩm định Pháp lý M&A (Legal Due Diligence): 5 Rủi ro Trọng yếu...')
                        },
                        {
                            name: 'category_id',
                            label: t('Danh mục pháp lý'),
                            type: 'select',
                            searchable: true,
                            required: true,
                            options: (categories || []).map((c: any) => ({
                                value: c.id,
                                label: c.practice_area ? `${c.name} (${c.practice_area.name})` : c.name,
                            })),
                            emptyNote: { link: route('legal-research.categories.index'), linkText: t('Danh mục nghiên cứu') },
                        },
                        {
                            name: 'content',
                            label: t('Nội dung phân tích & kiến thức'),
                            type: 'textarea',
                            required: true,
                            rows: 10,
                            placeholder: t('Nhập nội dung bài phân tích, quy định pháp luật liên quan, hướng dẫn áp dụng...')
                        },
                        {
                            name: 'tags',
                            label: t('Thẻ tag (phân tách bằng dấu phẩy)'),
                            type: 'text',
                            placeholder: t('VD: M&A, DoanhNghiep, PhapLy, DauTu')
                        },
                        {
                            name: 'status',
                            label: t('Trạng thái bài viết'),
                            type: 'select',
                            options: [
                                { value: 'published', label: t('Đã xuất bản (Công khai ra trang chủ & giới thiệu)') },
                                { value: 'draft', label: t('Bản nháp (Chỉ lưu nội bộ)') },
                                { value: 'archived', label: t('Lưu trữ (Tạm ẩn)') },
                            ],
                            defaultValue: 'published',
                        },
                    ],
                    modalSize: 'xl',
                }}
                initialData={currentItem ? {
                    ...currentItem,
                    tags: currentItem.tags ? currentItem.tags.join(', ') : '',
                } : null}
                title={formMode === 'create' ? t('Thêm bài viết kiến thức pháp lý mới') : t('Chỉnh sửa bài viết pháp lý')}
                mode={formMode}
            />

            {/* ── Delete Modal ── */}
            <CrudDeleteModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleDelete}
                itemName={currentItem?.title || ''}
                entityName="bài viết"
            />

            {/* ── View Modal ── */}
            <Dialog open={isViewOpen} onOpenChange={() => setIsViewOpen(false)}>
                {currentItem && (
                    <ViewPopup
                        record={currentItem}
                        onClose={() => setIsViewOpen(false)}
                        onEdit={() => {
                            setIsViewOpen(false);
                            setFormMode('edit');
                            setIsFormOpen(true);
                        }}
                        onPublishToggle={() => {
                            handlePublishToggle(currentItem);
                            setIsViewOpen(false);
                        }}
                        isSuperAdmin={isSuperAdmin}
                        permissions={permissions}
                    />
                )}
            </Dialog>
        </PageTemplate>
    );
}
