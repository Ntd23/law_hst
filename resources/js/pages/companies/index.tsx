// pages/companies/index.tsx
import { useEffect, useState } from 'react';
import { PageTemplate } from '@/components/page-template';
import { usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { SearchAndFilterBar } from '@/components/ui/search-and-filter-bar';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus, Edit, Trash2, Eye, CreditCard, History } from 'lucide-react';
import { toast } from '@/components/custom-toast';
import { useTranslation } from 'react-i18next';
import { CrudTable } from '@/components/CrudTable';
import { CrudFormModal } from '@/components/CrudFormModal';
import { CrudDeleteModal } from '@/components/CrudDeleteModal';
import { formatStatusText, getImagePath } from '@/utils/helpers';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function Companies() {
    const { t } = useTranslation();
    const { auth, companies, filters: pageFilters = {}, globalSettings } = usePage().props as any;
    const permissions = auth?.permissions || [];

    // State
    const [activeView, setActiveView] = useState(
        ['list', 'grid'].includes(pageFilters.view) ? pageFilters.view : 'list'
    );
    const [searchTerm, setSearchTerm] = useState(pageFilters.search || '');
    const [startDate, setStartDate] = useState<Date | undefined>(pageFilters.start_date ? new Date(pageFilters.start_date) : undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(pageFilters.end_date ? new Date(pageFilters.end_date) : undefined);
    const [selectedStatus, setSelectedStatus] = useState(pageFilters.status || '_empty_');

    // Modal state
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [currentCompany, setCurrentCompany] = useState<any>(null);


    const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');

    // Check if any filters are active
    const hasActiveFilters = () => {
        return selectedStatus !== '_empty_' || searchTerm !== '' || startDate !== undefined || endDate !== undefined;
    };

    // Count active filters
    const activeFilterCount = () => {
        return (selectedStatus !== '_empty_' ? 1 : 0) +
            (searchTerm ? 1 : 0) +
            (startDate ? 1 : 0) +
            (endDate ? 1 : 0);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters();
    };

    const applyFilters = () => {
        router.get(route('companies.index'), {
            view: activeView,
            page: 1,
            search: searchTerm || undefined,
            status: selectedStatus !== '_empty_' ? selectedStatus : undefined,
            start_date: startDate ? startDate.toISOString().split('T')[0] : undefined,
            end_date: endDate ? endDate.toISOString().split('T')[0] : undefined,
            ...(pageFilters.sort_field && { sort_field: pageFilters.sort_field, sort_direction: pageFilters.sort_direction }),
            ...(pageFilters.per_page && { per_page: pageFilters.per_page }),
        }, { preserveState: true, preserveScroll: true });
    };

    const handleStatusFilter = (value: string) => {
        setSelectedStatus(value);
    };

    const handleSort = (field: string) => {
        const direction = pageFilters.sort_field === field && pageFilters.sort_direction === 'desc' ? 'asc' : 'desc';
        router.get(route('companies.index'), {
            view: activeView,
            sort_field: field,
            sort_direction: direction,
            page: 1,
            search: searchTerm || undefined,
            status: selectedStatus !== '_empty_' ? selectedStatus : undefined,
            start_date: startDate ? startDate.toISOString().split('T')[0] : undefined,
            end_date: endDate ? endDate.toISOString().split('T')[0] : undefined,
            ...(pageFilters.per_page && { per_page: pageFilters.per_page }),
        }, { preserveState: true, preserveScroll: true });
    };

    const handleAction = (action: string, company: any) => {
        setCurrentCompany(company);

        switch (action) {
            case 'company-info':
                router.visit(route('companies.show', company.id));
                break;
            case 'edit':
                setFormMode('edit');
                setIsFormModalOpen(true);
                break;
            case 'delete':
                setIsDeleteModalOpen(true);
                break;
            default:
                break;
        }
    };

    const handleAddNew = () => {
        setCurrentCompany(null);
        setFormMode('create');
        setIsFormModalOpen(true);
    };

    const handleFormSubmit = (formData: any) => {
        if (formMode === 'create') {
            if (!globalSettings?.is_demo) {
                toast.loading(t('Creating company...'));
            }

            router.post(route('companies.store'), formData, {
                onSuccess: (page) => {
                    setIsFormModalOpen(false);
                    if (!globalSettings?.is_demo) {
                        toast.dismiss();
                    }
                    if (page.props.flash.success) {
                        toast.success(t(page.props.flash.success));
                    } else if (page.props.flash.error) {
                        toast.error(t(page.props.flash.error));
                    }
                },
                onError: (errors) => {
                    if (!globalSettings?.is_demo) {
                        toast.dismiss();
                    }
                    if (typeof errors === 'string') {
                        toast.error(t(errors));
                    } else {
                        toast.error(t('Failed to create company: {{errors}}', { errors: Object.values(errors).join(', ') }));
                    }
                }
            });
        } else if (formMode === 'edit') {
            if (!globalSettings?.is_demo) {
                toast.loading(t('Updating company...'));
            }

            router.put(route('companies.update', currentCompany.id), formData, {
                onSuccess: (page) => {
                    setIsFormModalOpen(false);
                    if (!globalSettings?.is_demo) {
                        toast.dismiss();
                    }
                    if (page.props.flash.success) {
                        toast.success(t(page.props.flash.success));
                    } else if (page.props.flash.error) {
                        toast.error(t(page.props.flash.error));
                    }
                },
                onError: (errors) => {
                    if (!globalSettings?.is_demo) {
                        toast.dismiss();
                    }
                    if (typeof errors === 'string') {
                        toast.error(t(errors));
                    } else {
                        toast.error(t('Failed to update company: {{errors}}', { errors: Object.values(errors).join(', ') }));
                    }
                }
            });
        }
    };

    const handleDeleteConfirm = () => {
        if (!globalSettings?.is_demo) {
            toast.loading(t('Deleting company...'));
        }

        router.delete(route("companies.destroy", currentCompany.id), {
            onSuccess: (page) => {
                setIsDeleteModalOpen(false);
                if (!globalSettings?.is_demo) {
                    toast.dismiss();
                }
                if (page.props.flash.success) {
                    toast.success(t(page.props.flash.success));
                } else if (page.props.flash.error) {
                    toast.error(t(page.props.flash.error));
                }
            },
            onError: (errors) => {
                if (!globalSettings?.is_demo) {
                    toast.dismiss();
                }
                if (typeof errors === 'string') {
                    toast.error(t(errors));
                } else {
                    toast.error(t('Failed to delete company: {{errors}}', { errors: Object.values(errors).join(', ') }));
                }
            }
        });
    };

    const handlePageChange = (url: string) => {
        router.get(url, {}, { preserveState: true, preserveScroll: true });
    };

    const handleResetFilters = () => {
        router.get(route('companies.index'), {
            view: activeView,
        });
    };

    // Define page actions
    const pageActions = [
        ...(permissions.includes('view-users-log-history') ? [{
            icon: <History className="h-4 w-4 mx-auto" />,
            variant: 'outline',
            onClick: () => router.get(route('user-logs.index')),
            tooltip: t('Login History')
        }] : []),
        {
            label: t('Add Company'),
            icon: <Plus className="h-4 w-4 mr-2" />,
            variant: 'default',
            onClick: () => handleAddNew(),
        }
    ];

    const breadcrumbs = [
        { title: t('Dashboard'), href: route('dashboard') },
        { title: t('Companies') }
    ];

    const columns = [
        {
            key: 'name',
            label: t('Name'),
            sortable: true,
            render: (value: any, row: any) => {
                return (
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                            <AvatarImage
                                src={row.avatar}
                                alt={row.name}
                            />
                            <AvatarFallback className="text-lg">
                                {row.name?.charAt(0)?.toUpperCase() || 'U'}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="font-medium">{row.name}</div>
                            <div className="text-sm text-muted-foreground">{row.email}</div>
                        </div>
                    </div>
                );
            }
        },
        {
            key: 'plan_name',
            label: t('Plan'),
            render: (value: string) => (
                <span className={'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20'}>
                    {formatStatusText(value)}
                </span>
            )
        },
        {
            key: 'created_at',
            label: t('Created At'),
            sortable: true,
            type: 'date',
        }
    ];

    const actions = [
        { label: t('View Details'), icon: 'Eye', action: 'company-info', className: 'text-blue-500' },
        { label: t('Edit'), icon: 'Edit', action: 'edit', className: 'text-amber-500' },
    ];

    const [pageInitialState, setPageInitialState] = useState(true);

    useEffect(() => {
        if (!pageInitialState) applyFilters();
        setPageInitialState(false);
    }, [selectedStatus, startDate, endDate]);

    return (
        <PageTemplate
            title={t("Companies")}
            url="/companies"
            actions={pageActions}
            breadcrumbs={breadcrumbs}
            description={t("Manage your companies.")}
            noPadding
        >
            {/* Search and filters section */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow mb-4 border">
                <SearchAndFilterBar
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    onSearch={handleSearch}
                    filters={[
                        {
                            name: 'status',
                            label: t('Status'),
                            type: 'select',
                            value: selectedStatus,
                            onChange: handleStatusFilter,
                            options: [
                                { value: '_empty_', label: t('All Status') },
                                { value: 'active', label: t('Active') },
                                { value: 'inactive', label: t('Inactive') }
                            ]
                        },
                        {
                            name: 'start_date',
                            label: t('Start Date'),
                            type: 'date',
                            value: startDate,
                            onChange: (date) => setStartDate(date)
                        },
                        {
                            name: 'end_date',
                            label: t('End Date'),
                            type: 'date',
                            value: endDate,
                            onChange: (date) => setEndDate(date)
                        }
                    ]}
                    hasActiveFilters={hasActiveFilters}
                    activeFilterCount={activeFilterCount}
                    onResetFilters={handleResetFilters}
                    showViewToggle={true}
                    activeView={activeView}
                    onViewChange={(view) => {
                        setActiveView(view);
                        router.get(route('companies.index'), {
                            view,
                            page: pageFilters.page || 1,
                            search: searchTerm || undefined,
                            status: selectedStatus !== '_empty_' ? selectedStatus : undefined,
                            start_date: startDate ? startDate.toISOString().split('T')[0] : undefined,
                            end_date: endDate ? endDate.toISOString().split('T')[0] : undefined,
                            sort_field: pageFilters.sort_field || undefined,
                            sort_direction: pageFilters.sort_direction || undefined,
                            ...(parseInt(pageFilters.per_page) !== 10 && pageFilters.per_page && { per_page: pageFilters.per_page }),
                        }, { preserveState: true, preserveScroll: true });
                    }}
                />
            </div>

            {/* Content section */}
            {activeView === 'list' ? (
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
                    <CrudTable
                        columns={columns}
                        actions={actions}
                        data={companies?.data || []}
                        from={companies?.from || 1}
                        onAction={handleAction}
                        sortField={pageFilters.sort_field}
                        sortDirection={pageFilters.sort_direction}
                        onSort={handleSort}
                        permissions={permissions}
                        entityPermissions={{
                            view: 'manage-companies',
                            edit: 'edit-companies',
                            delete: 'delete-companies'
                        }}
                    />

                    <Pagination
                        from={companies?.from || 0}
                        to={companies?.to || 0}
                        total={companies?.total || 0}
                        links={companies?.links}
                        entityName={t("companies")}
                        onPageChange={handlePageChange}
                        currentPerPage={pageFilters.per_page?.toString() || "10"}
                        onPerPageChange={(value) => {
                            router.get(route('companies.index'), {
                                view: activeView,
                                page: 1,
                                per_page: parseInt(value) !== 10 ? parseInt(value) : undefined,
                                search: searchTerm || undefined,
                                status: selectedStatus !== '_empty_' ? selectedStatus : undefined,
                                start_date: startDate ? startDate.toISOString().split('T')[0] : undefined,
                                end_date: endDate ? endDate.toISOString().split('T')[0] : undefined,
                            }, { preserveState: true, preserveScroll: true });
                        }}
                    />
                </div>
            ) : (
                <div>
                    {/* Grid View */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {companies?.data?.map((company: any) => (
                            <Card key={company.id} className="group relative overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300">
                                {/* Status Badge */}
                                <div className="absolute top-4 right-4 z-10">
                                    <div className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${company.status === 'active'
                                        ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20'
                                        : 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20'
                                        }`}>
                                        {company.status === 'active' ? t('Active') : t('Inactive')}
                                    </div>
                                </div>

                                {/* Card Content */}
                                <div className="p-6">
                                    {/* Company Header */}
                                    <div className="flex items-start space-x-4 mb-6">
                                        <div className="relative">
                                            <img
                                                src={company.avatar}
                                                alt={company.name}
                                                className="h-14 w-14 rounded-full object-cover shadow-sm"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = getImagePath('/storage/media/avatars/avatar.png');
                                                }}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0 max-w-80">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1 mr-10">
                                                {company.name}
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                                                {company.email}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Plan Information */}
                                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <CreditCard className="h-4 w-4 text-primary mr-2" />
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {company.plan_name}
                                                </span>
                                            </div>
                                        </div>
                                        {company.plan_expiry_date && (
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {t("Expires")}: {window.appSettings?.formatDateTime(company.plan_expiry_date, false) || new Date(company.plan_expiry_date).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="flex items-center gap-2">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => handleAction('company-info', company)}
                                                >
                                                    <Eye size={16} />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>{t("View Details")}</TooltipContent>
                                        </Tooltip>

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => handleAction('edit', company)}
                                                >
                                                    <Edit size={16} />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>{t("Edit")}</TooltipContent>
                                        </Tooltip>
                                    </div>
                                </div>

                                {/* Hover Effect Overlay - REMOVED */}
                            </Card>
                        ))}

                        {(!companies?.data || companies.data.length === 0) && (
                            <div className="col-span-full">
                                <div className="text-center py-12">
                                    <div className="mx-auto h-24 w-24 text-gray-300 dark:text-gray-600 mb-4">
                                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-full h-full">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t("No companies found")}</h3>
                                    <p className="text-gray-500 dark:text-gray-400 mb-6">{t("Get started by creating your first company")}</p>
                                    <Button onClick={handleAddNew} className="inline-flex items-center">
                                        <Plus className="h-4 w-4 mr-2" />
                                        {t("Add Company")}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Pagination for grid view */}
                    <div className="mt-8">
                        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <Pagination
                                from={companies?.from || 0}
                                to={companies?.to || 0}
                                total={companies?.total || 0}
                                links={companies?.links}
                                entityName={t("companies")}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Form Modal */}
            <CrudFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSubmit={(data) => {
                    // If login_enabled is false, remove password field
                    if (data.login_enabled === false) {
                        delete data.password;
                    }
                    // Set status based on login_enabled
                    data.status = data.login_enabled ? 'active' : 'inactive';

                    // Remove login_enabled field as it's not needed in the backend
                    delete data.login_enabled;
                    handleFormSubmit(data);
                }}
                formConfig={{
                    fields: [
                        { name: 'name', label: t('Company Name'), type: 'text', placeholder: 'eg. Acme Firm', required: true },
                        { name: 'email', label: t('Email'), type: 'email', placeholder: 'eg. admin@acmefirm.com', required: true },
                        {
                            name: 'login_enabled',
                            label: t('Enable Login'),
                            placeholder: '', // Empty placeholder to prevent duplicate label
                            type: 'switch',
                            defaultValue: true,
                            conditional: (mode) => mode === 'create'
                        },
                        {
                            name: 'password',
                            label: t('Password'),
                            type: 'password',
                            placeholder: 'Enter Password',
                            required: (mode) => mode === 'create',
                            conditional: (mode, data) => {
                                return mode === 'create' && data?.login_enabled === true;
                            }
                        }
                    ],
                    modalSize: 'lg'
                }}
                initialData={{
                    ...currentCompany,
                    login_enabled: currentCompany?.status === 'active'
                }}
                title={
                    formMode === 'create'
                        ? t('Add Company')
                        : formMode === 'edit'
                            ? t('Edit Company')
                            : t('View Company')
                }
                mode={formMode}
                footerActions={formMode === 'edit' && currentCompany ? (
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={() => {
                            setIsFormModalOpen(false);
                            setIsDeleteModalOpen(true);
                        }}
                        disabled={globalSettings?.is_demo}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {t('Delete')}
                    </Button>
                ) : null}
            />

            {/* Delete Modal */}
            <CrudDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                itemName={currentCompany?.name || ''}
                entityName="company"
            />

        </PageTemplate>
    );
}
