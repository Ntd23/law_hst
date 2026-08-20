/**
 * Pagination component with dark mode support & clean icon navigation
 */
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Label } from './label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

interface PaginationProps {
    from?: number;
    to?: number;
    total?: number;
    links?: any[];
    currentPage?: number;
    lastPage?: number;
    entityName?: string;
    onPageChange?: (url: string) => void;
    className?: string;
    perPageOptions?: number[];
    currentPerPage: string;
    onPerPageChange: (value: string) => void;
    hidePerPage?: boolean;
}

export function Pagination({
    from = 0,
    to = 0,
    total = 0,
    links = [],
    currentPage,
    lastPage,
    entityName = 'kết quả',
    perPageOptions = [10, 25, 50, 100],
    hidePerPage = false,
    currentPerPage,
    onPerPageChange,
    onPageChange,
    className = '',
}: PaginationProps) {
    const { t } = useTranslation();

    const handlePageChange = (url: string) => {
        if (onPageChange) {
            onPageChange(url);
        } else if (url) {
            window.location.href = url;
        }
    };

    const isPrev = (label: string, index: number) => {
        if (index === 0) return true;
        const l = (label || '').toLowerCase();
        return l.includes('prev') || l.includes('pagination.previous') || l.includes('&laquo;') || l === '«' || l === '‹';
    };

    const isNext = (label: string, index: number, totalLinks: number) => {
        if (index === totalLinks - 1) return true;
        const l = (label || '').toLowerCase();
        return l.includes('next') || l.includes('pagination.next') || l.includes('&raquo;') || l === '»' || l === '›';
    };

    return (
        <div className={cn(
            "p-4 px-6 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-3.5 items-center justify-between bg-white dark:bg-gray-900",
            className
        )}>
            {/* Left: Summary text */}
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {t("Showing")}{" "}
                <span className="font-semibold text-gray-900 dark:text-white">{from}</span>{" "}
                {t("to")}{" "}
                <span className="font-semibold text-gray-900 dark:text-white">{to}</span>{" "}
                {t("of")}{" "}
                <span className="font-semibold text-gray-900 dark:text-white">{total}</span>{" "}
                {t(entityName || 'results')}
            </div>

            {/* Right: Per page selector & Navigation buttons */}
            <div className="flex flex-wrap items-center gap-3">
                {!hidePerPage && (
                    <div className="flex items-center gap-2">
                        <Label className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {t("Rows per page:")}
                        </Label>
                        <Select
                            value={currentPerPage || "10"}
                            onValueChange={onPerPageChange}
                        >
                            <SelectTrigger className="w-18 h-8 rounded-xl text-xs font-semibold bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                {perPageOptions.map(option => (
                                    <SelectItem key={option} value={option.toString()} className="text-xs">
                                        {option}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {/* Page number buttons */}
                <div className="flex items-center gap-1">
                    {links && links.length > 0 ? (
                        links.map((link: any, i: number) => {
                            const isFirst = isPrev(link.label, i);
                            const isLast = isNext(link.label, i, links.length);
                            const isEllipsis = link.label === '...' || link.label === '&hellip;';

                            if (isFirst) {
                                return (
                                    <Button
                                        key={`pagination-prev-${i}`}
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8 rounded-xl border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-40"
                                        disabled={!link.url}
                                        onClick={() => link.url && handlePageChange(link.url)}
                                        title={t('Previous Page')}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                );
                            }

                            if (isLast) {
                                return (
                                    <Button
                                        key={`pagination-next-${i}`}
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8 rounded-xl border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-40"
                                        disabled={!link.url}
                                        onClick={() => link.url && handlePageChange(link.url)}
                                        title={t('Next Page')}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                );
                            }

                            if (isEllipsis) {
                                return (
                                    <span
                                        key={`pagination-dots-${i}`}
                                        className="h-8 w-8 flex items-center justify-center text-xs text-gray-400 font-bold"
                                    >
                                        ...
                                    </span>
                                );
                            }

                            return (
                                <Button
                                    key={`pagination-num-${i}-${link.label}`}
                                    variant={link.active ? 'default' : 'outline'}
                                    size="icon"
                                    className={`h-8 w-8 rounded-xl text-xs font-semibold transition-all ${
                                        link.active
                                            ? 'bg-primary text-white shadow-xs'
                                            : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                                    disabled={!link.url && !link.active}
                                    onClick={() => link.url && handlePageChange(link.url)}
                                >
                                    {link.label}
                                </Button>
                            );
                        })
                    ) : (
                        currentPage && lastPage && lastPage > 1 && (
                            <>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 rounded-xl"
                                    disabled={currentPage <= 1}
                                    onClick={() => handlePageChange(`?page=${currentPage - 1}`)}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                                    {currentPage} {t('of')} {lastPage}
                                </span>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 rounded-xl"
                                    disabled={currentPage >= lastPage}
                                    onClick={() => handlePageChange(`?page=${currentPage + 1}`)}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
