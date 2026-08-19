import React, { useState } from 'react';
import { PageTemplate } from '@/components/page-template';
import { usePage, router } from '@inertiajs/react';
import { hasPermission } from '@/utils/authorization';
import { CrudTable } from '@/components/CrudTable';
import { useTranslation } from 'react-i18next';
import { Pagination } from '@/components/ui/pagination';
import { SearchAndFilterBar } from '@/components/ui/search-and-filter-bar';
import { toast } from '@/components/custom-toast';
import { CrudDeleteModal } from '@/components/CrudDeleteModal';
import { Dialog } from '@/components/ui/dialog';
import ViewPopup from './view';
import UserColumn from '@/components/UserColumn';
import { Mail, Phone, Clock, CheckCircle2, PhoneCall, XCircle, UserPlus, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface IndexProps {
  contacts: any;
  lawyers?: Array<{ id: number; name: string; email?: string }>;
  filters?: any;
  permissions?: any;
}

export default function Index({ contacts, lawyers = [], filters: pageFilters = {}, permissions }: IndexProps) {
  const { t } = useTranslation();
  const pageProps = usePage().props as any;
  const userPermissions = permissions || pageProps?.auth?.permissions || [];

  const [searchTerm, setSearchTerm] = useState(pageFilters?.search || '');
  const [statusFilter, setStatusFilter] = useState(pageFilters?.status || 'all');
  const [lawyerFilter, setLawyerFilter] = useState(pageFilters?.user_id || 'all');
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentContact, setCurrentContact] = useState<any>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(route('contact-us.index'), {
      page: 1,
      search: searchTerm || undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      user_id: lawyerFilter !== 'all' ? lawyerFilter : undefined,
      ...(pageFilters?.sort_field && { sort_field: pageFilters.sort_field, sort_direction: pageFilters.sort_direction }),
      ...(pageFilters?.per_page && { per_page: pageFilters.per_page }),
    }, { preserveState: true, preserveScroll: true });
  };

  const handleStatusFilterChange = (val: string) => {
    setStatusFilter(val);
    router.get(route('contact-us.index'), {
      page: 1,
      search: searchTerm || undefined,
      status: val !== 'all' ? val : undefined,
      user_id: lawyerFilter !== 'all' ? lawyerFilter : undefined,
      ...(pageFilters?.per_page && { per_page: pageFilters.per_page }),
    }, { preserveState: true, preserveScroll: true });
  };

  const handleLawyerFilterChange = (val: string) => {
    setLawyerFilter(val);
    router.get(route('contact-us.index'), {
      page: 1,
      search: searchTerm || undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      user_id: val !== 'all' ? val : undefined,
      ...(pageFilters?.per_page && { per_page: pageFilters.per_page }),
    }, { preserveState: true, preserveScroll: true });
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setLawyerFilter('all');
    router.get(route('contact-us.index'), {}, { preserveState: true, preserveScroll: true });
  };

  const breadcrumbs = [
    { title: t('Dashboard'), href: route('dashboard') },
    { title: t('Landing Page') },
    { title: t('Contact Inquiries') }
  ];

  const handleCreateClient = (row: any) => {
    const phone = getPhoneFromRecord(row);
    let address = '';
    if (row.message) {
      const cleanMsg = (row.message || '').replace(/\\n/g, '\n').replace(/\r\n/g, '\n');
      const addrMatch = cleanMsg.match(/Địa chỉ:\s*([^\n\r]+)/i);
      if (addrMatch) address = addrMatch[1].trim();
    }
    router.visit(route('clients.index', {
      create: '1',
      name: row.name || '',
      email: row.email || '',
      phone: phone || '',
      address: address || '',
    }));
  };

  const handleAction = (action: string, item: any) => {
    setCurrentContact(item);
    if (action === 'delete') {
      setIsDeleteModalOpen(true);
    } else if (action === 'view') {
      router.visit(route('contact-us.show', item.id));
    } else if (action === 'create-client') {
      handleCreateClient(item);
    }
  };

  const handleStatusChange = (contactId: number, newStatus: string) => {
    router.put(route('contact-us.update-status', contactId), {
      status: newStatus
    }, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success(t('Đã cập nhật trạng thái liên hệ thành công'));
      },
      onError: () => {
        toast.error(t('Không thể cập nhật trạng thái'));
      }
    });
  };

  const handleDeleteConfirm = () => {
    if (isDeleteModalOpen && currentContact) {
      router.delete(route('contact-us.destroy', currentContact.id), {
        onSuccess: (page: any) => {
          setIsDeleteModalOpen(false);
          if (page.props.flash?.success) {
            toast.success(page.props.flash.success);
          } else if (page.props.flash?.error) {
            toast.error(page.props.flash.error);
          } else {
            toast.success(t('Contact message deleted successfully.'));
          }
        },
        onError: (errors: any) => {
          setIsDeleteModalOpen(false);
          if (typeof errors === 'string') {
            toast.error(errors);
          } else if (errors?.error) {
            toast.error(errors.error);
          } else {
            toast.error(`Failed to delete contact message: ${Object.values(errors).join(', ')}`);
          }
        }
      });
    }
  };

  const getPhoneFromRecord = (row: any) => {
    if (row.phone) return row.phone;
    if (!row.message) return '';
    const cleanMsg = (row.message || '').replace(/\\n/g, '\n').replace(/\r\n/g, '\n');
    const phoneMatch = cleanMsg.match(/Số điện thoại:\s*([^\n\r]+)/i);
    return phoneMatch ? phoneMatch[1].trim() : '';
  };

  const getInitials = (fullName: string) => {
    const names = (fullName || '').trim().split(' ');
    if (names.length === 0 || !names[0]) return 'U';
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    const firstInitial = names[0].charAt(0);
    const lastInitial = names[names.length - 1].charAt(0);
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  const statusConfig: Record<string, { label: string; bg: string; text: string; icon: any }> = {
    pending: { label: t('Chờ xử lý'), bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300', text: 'text-amber-700', icon: Clock },
    contacted: { label: t('Đã liên hệ'), bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300', text: 'text-blue-700', icon: PhoneCall },
    resolved: { label: t('Đã giải quyết'), bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300', text: 'text-emerald-700', icon: CheckCircle2 },
    cancelled: { label: t('Đã hủy'), bg: 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400', text: 'text-gray-600', icon: XCircle },
  };

  const columns = [
    { 
      key: 'user', 
      label: t('Người gửi'),
      render: (_value: any, row: any) => {
        return (
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center border border-blue-200 dark:border-blue-800 shrink-0 shadow-sm">
              {getInitials(row.name)}
            </div>
            <div>
              <div className="font-bold text-sm text-gray-900 dark:text-white whitespace-nowrap">
                {row.name || t('Thân chủ ẩn danh')}
              </div>
              <div className="text-[11px] text-gray-400 font-mono">
                ID #{row.id}
              </div>
            </div>
          </div>
        );
      }
    },
    {
      key: 'phone',
      label: t('Số điện thoại'),
      render: (_value: any, row: any) => {
        const phone = getPhoneFromRecord(row);
        return (
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
            <Phone className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            {phone ? (
              <a href={`tel:${phone}`} className="hover:text-primary hover:underline tracking-wide font-mono text-emerald-700 dark:text-emerald-400">
                {phone}
              </a>
            ) : (
              <span className="text-gray-400 italic font-normal">--</span>
            )}
          </div>
        );
      }
    },
    {
      key: 'subject',
      label: t('Tiêu đề'),
      render: (_value: any, row: any) => {
        return (
          <div className="max-w-[220px]" title={row.subject}>
            <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
              {row.subject || t('Tư vấn pháp lý')}
            </span>
          </div>
        );
      }
    },
    {
      key: 'lawyer',
      label: t('Luật sư tư vấn'),
      render: (_value: any, row: any) => {
        const lawyerName = row.user?.name || (() => {
          if (!row.message) return '';
          const match = row.message.match(/Luật sư mong muốn:\s*([^\n\r]+)/i);
          return match ? match[1].trim() : '';
        })();

        return lawyerName ? (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-100 dark:border-indigo-800 w-fit">
            <User className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
            <span className="truncate max-w-[130px]" title={lawyerName}>{lawyerName}</span>
          </div>
        ) : (
          <span className="text-gray-400 italic text-xs font-normal">{t('Không có')}</span>
        );
      }
    },
    {
      key: 'status',
      label: t('Trạng thái'),
      render: (_value: any, row: any) => {
        const currentStatus = (row.status || 'pending').toLowerCase();
        const conf = statusConfig[currentStatus] || statusConfig.pending;

        return (
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <Select 
              value={currentStatus} 
              onValueChange={(newVal) => handleStatusChange(row.id, newVal)}
            >
              <SelectTrigger className={`h-8 px-3 py-1 text-xs font-semibold rounded-full border shadow-sm ${conf.bg} focus:ring-1 focus:ring-primary gap-1.5 w-auto whitespace-nowrap`}>
                <SelectValue placeholder={conf.label} />
              </SelectTrigger>
              <SelectContent align="end" className="min-w-[140px]">
                <SelectItem value="pending" className="text-xs font-medium text-amber-700 dark:text-amber-300">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{t('Chờ xử lý')}</span>
                  </div>
                </SelectItem>
                <SelectItem value="contacted" className="text-xs font-medium text-blue-700 dark:text-blue-300">
                  <div className="flex items-center gap-2">
                    <PhoneCall className="h-3.5 w-3.5" />
                    <span>{t('Đã liên hệ')}</span>
                  </div>
                </SelectItem>
                <SelectItem value="resolved" className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{t('Đã giải quyết')}</span>
                  </div>
                </SelectItem>
                <SelectItem value="cancelled" className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-3.5 w-3.5" />
                    <span>{t('Đã hủy')}</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {currentStatus === 'resolved' && (
              row.has_account ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 rounded-full border border-blue-200 dark:border-blue-800 whitespace-nowrap shadow-xs">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                  <span>{t('Đã có tài khoản')}</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleCreateClient(row)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-full shadow-sm transition-all duration-150 whitespace-nowrap cursor-pointer"
                  title={t('Tạo tài khoản khách hàng / thân chủ')}
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>{t('Tạo Tài khoản')}</span>
                </button>
              )
            )}
          </div>
        );
      }
    },
    {
      key: 'created_at',
      label: t('Ngày gửi'),
      type: 'date',
    }
  ];

  const actions = [
    {
      label: t('View'),
      action: 'view',
      icon: 'Eye',
      className: 'text-blue-500 hover:text-blue-700',
      requiredPermission: 'manage-contact-us',
      href: (row: any) => route('contact-us.show', row.id)
    },
    {
      label: t('Tạo Tài khoản'),
      action: 'create-client',
      icon: 'UserPlus',
      className: 'text-emerald-600 hover:text-emerald-800',
      requiredPermission: 'manage-clients',
      show: (row: any) => (row.status || '').toLowerCase() === 'resolved' && !row.has_account,
      onClick: (row: any) => handleCreateClient(row)
    },
    {
      label: t('Delete'),
      action: 'delete',
      icon: 'Trash2',
      className: 'text-red-500 hover:text-red-700',
      requiredPermission: 'manage-contact-us'
    }
  ];

  const filterOptions = [
    {
      name: 'status',
      label: t('Trạng thái'),
      type: 'select' as const,
      value: statusFilter,
      options: [
        { value: 'all', label: t('Tất cả trạng thái') },
        { value: 'pending', label: t('Chờ xử lý') },
        { value: 'contacted', label: t('Đã liên hệ') },
        { value: 'resolved', label: t('Đã giải quyết') },
        { value: 'cancelled', label: t('Đã hủy') },
      ],
      onChange: handleStatusFilterChange
    },
    ...(lawyers && lawyers.length > 0 ? [{
      name: 'user_id',
      label: t('Luật sư'),
      type: 'select' as const,
      value: lawyerFilter,
      options: [
        { value: 'all', label: t('Tất cả Luật sư') },
        ...lawyers.map((l) => ({ value: String(l.id), label: l.name })),
      ],
      onChange: handleLawyerFilterChange
    }] : [])
  ];

  return (
    <PageTemplate
      title={t("Contact Inquiries")}
      url="/contact-us"
      breadcrumbs={breadcrumbs}
      description={t("Manage and review contact inquiries from users.")}
      noPadding
    >
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow mb-4 border p-1">
        <SearchAndFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSearch={handleSearch}
          searchPlaceholder={t("Tìm kiếm theo tên, email, SĐT hoặc nội dung...")}
          filters={filterOptions}
          hasActiveFilters={() => searchTerm !== '' || statusFilter !== 'all' || lawyerFilter !== 'all'}
          activeFilterCount={() => (searchTerm !== '' ? 1 : 0) + (statusFilter !== 'all' ? 1 : 0) + (lawyerFilter !== 'all' ? 1 : 0)}
          onResetFilters={handleResetFilters}
        />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
        <CrudTable
          columns={columns}
          actions={actions}
          data={contacts?.data || []}
          from={contacts?.from || 1}
          onAction={handleAction}
          sortField={undefined}
          sortDirection={undefined}
          onSort={undefined}
          permissions={userPermissions}
          entityPermissions={{
            view: 'manage-contact-us',
            create: false,
            edit: false,
            delete: 'manage-contact-us'
          }}
          showActions={true}
        />

        <Pagination
          from={contacts?.from || 0}
          to={contacts?.to || 0}
          total={contacts?.total || 0}
          links={contacts?.links}
          entityName={t("contact messages")}
          currentPerPage={pageFilters.per_page?.toString() || "10"}
          onPerPageChange={(value) => {
            router.get(route('contact-us.index'), {
              page: 1,
              ...(parseInt(value) !== 10 && { per_page: parseInt(value) }),
              search: searchTerm || undefined,
              status: statusFilter !== 'all' ? statusFilter : undefined,
            }, { preserveState: true, preserveScroll: true });
          }}
          onPageChange={(url) => router.get(url, {}, { preserveState: true, preserveScroll: true })}
        />
      </div>

      {/* Delete Modal */}
      <CrudDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={`${currentContact?.name || ''} - ${currentContact?.subject || ''}`}
        entityName={t('contact')}
      />

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        {currentContact && <ViewPopup record={currentContact} />}
      </Dialog>
    </PageTemplate>
  );
}
