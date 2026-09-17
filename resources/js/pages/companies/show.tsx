import { FormEvent, ReactNode, useEffect, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Briefcase,
  Building2,
  Calendar,
  ChevronRight,
  Clock,
  CreditCard,
  Database,
  FileText,
  Gem,
  Globe2,
  GraduationCap,
  Hash,
  Heart,
  KeyRound,
  Landmark,
  Languages,
  Lock,
  Mail,
  MapPin,
  MoreVertical,
  Package,
  Percent,
  Pencil,
  Phone,
  Receipt,
  Sparkles,
  Unlock,
  User,
  Users,
  Zap,
} from 'lucide-react';
import { PageTemplate } from '@/components/page-template';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/custom-toast';
import { formatCurrencyForPlansAndReferrals, getImagePath } from '@/utils/helpers';

type ActiveTab = 'overview' | 'details' | 'members' | 'plans' | 'payments' | 'storage';

interface UsageItem {
  used: number;
  limit: number;
  used_gb?: number;
  limit_gb?: number;
}

interface CompanyProfile {
  id: number;
  company_id?: string | null;
  name?: string | null;
  registration_number?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  logo?: string | null;
  establishment_date?: string | null;
  company_size?: string | null;
  business_type?: string | null;
  status?: string | null;
  description?: string | null;
  advocate_name?: string | null;
  bar_registration_number?: string | null;
  years_of_experience?: number | null;
  law_degree?: string | null;
  university?: string | null;
  specialization?: string | null;
  court_jurisdictions?: string | null;
  languages_spoken?: string | null;
  consultation_fees?: number | null;
  office_hours?: string | null;
  success_rate?: number | null;
  services_offered?: string | null;
  notable_cases?: string | null;
}

interface CompanySettings {
  titleText?: string | null;
  footerText?: string | null;
  defaultLanguage?: string | null;
  defaultCurrency?: string | null;
  dateFormat?: string | null;
  timeFormat?: string | null;
  defaultTimezone?: string | null;
}

interface PaymentHistoryItem {
  id: number;
  order_number?: string | null;
  plan_name?: string | null;
  billing_cycle?: string | null;
  original_price?: number | null;
  discount_amount?: number | null;
  final_price?: number | null;
  paid_amount?: number | null;
  coupon_code?: string | null;
  payment_method?: string | null;
  payment_id?: string | null;
  sepay_order_code?: string | null;
  sepay_transaction_id?: string | null;
  sepay_transaction_date?: string | null;
  status?: string | null;
  ordered_at?: string | null;
  processed_at?: string | null;
  processed_by?: {
    id: number;
    name: string;
    email?: string | null;
  } | null;
  notes?: string | null;
  receipt_path?: string | null;
}

interface CompanyDetailProps {
  company: {
    id: number;
    avatar?: string;
    name: string;
    email: string;
    status: string;
    lang?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    email_verified_at?: string | null;
    plan_expiry_date?: string | null;
    plan_is_active?: number | null;
    is_enable_login?: number | null;
    storage_limit?: number | null;
    is_trial?: boolean | string | null;
    trial_day?: number | null;
    trial_expire_date?: string | null;
    referral_code?: number | null;
    used_referral_code?: number | null;
    commission_amount?: number | null;
  };
  profile: CompanyProfile | null;
  settings: CompanySettings;
  paymentHistory: PaymentHistoryItem[];
  plan: {
    id: number;
    name: string;
    description?: string;
    price?: number;
    yearly_price?: number;
    max_users: number;
    max_cases: number;
    max_clients: number;
    storage_limit: number;
  } | null;
  usage: {
    users: UsageItem;
    cases: UsageItem;
    clients: UsageItem;
    storage: UsageItem;
  };
}

export default function CompanyShow({ company, profile, settings = {}, paymentHistory = [], plan, usage }: CompanyDetailProps) {
  const { t } = useTranslation();
  const { globalSettings } = usePage().props as any;

  // Active tab state
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState(company.name);
  const [editEmail, setEditEmail] = useState(company.email);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Password reset state
  const [password, setPassword] = useState('');
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  // Status toggle state
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Plan upgrade state
  const [availablePlans, setAvailablePlans] = useState<any[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<'monthly' | 'yearly'>('monthly');
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [isSubmittingUpgrade, setIsSubmittingUpgrade] = useState(false);

  useEffect(() => {
    setEditName(company.name);
    setEditEmail(company.email);
  }, [company]);

  const breadcrumbs = [
    { title: t('Dashboard', 'Bảng điều khiển'), href: route('dashboard') },
    { title: t('Companies', 'Công ty thành viên'), href: route('companies.index') },
    { title: company.name },
  ];

  const formatDate = (value?: string | null) => {
    if (!value) return '-';
    try {
      const d = new Date(value);
      if (isNaN(d.getTime())) return value;
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return value;
    }
  };

  const formatStorageSize = (gb: number) => {
    if (gb >= 1) {
      return `${gb % 1 === 0 ? gb : gb.toFixed(1)} GB`;
    }
    return `${Math.round(gb * 1024)} MB`;
  };

  const getUsagePercentage = (used: number, limit: number) => {
    if (!limit || limit <= 0) return 0;
    return Math.min(Math.round((used / limit) * 100), 100);
  };

  const formatDateTime = (value?: string | null) => {
    if (!value) return '-';
    try {
      const d = new Date(value);
      if (isNaN(d.getTime())) return value;
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    } catch {
      return value;
    }
  };

  const formatCurrencyValue = (amount?: number | string | null) => {
    if (amount === null || amount === undefined || amount === '') return '-';
    return String(formatCurrencyForPlansAndReferrals(amount));
  };

  const formatPlainValue = (value?: string | number | null) => {
    if (value === null || value === undefined || value === '') return '-';
    return String(value);
  };

  const formatCompanySize = (value?: string | null) => {
    const labels: Record<string, string> = {
      solo: t('Cá nhân', 'Cá nhân'),
      small: t('Nhỏ', 'Nhỏ'),
      medium: t('Vừa', 'Vừa'),
      large: t('Lớn', 'Lớn'),
    };
    return value ? labels[value] || value : '-';
  };

  const formatBusinessType = (value?: string | null) => {
    const labels: Record<string, string> = {
      law_firm: t('Công ty luật', 'Công ty luật'),
      corporate_legal: t('Pháp chế doanh nghiệp', 'Pháp chế doanh nghiệp'),
      government: t('Cơ quan nhà nước', 'Cơ quan nhà nước'),
      other: t('Khác', 'Khác'),
    };
    return value ? labels[value] || value : '-';
  };

  const formatBillingCycle = (value?: string | null) => {
    const labels: Record<string, string> = {
      monthly: t('Hàng tháng', 'Hàng tháng'),
      yearly: t('Hàng năm', 'Hàng năm'),
      Monthly: t('Hàng tháng', 'Hàng tháng'),
      Yearly: t('Hàng năm', 'Hàng năm'),
    };
    return value ? labels[value] || value : '-';
  };

  const getPaymentStatusMeta = (status?: string | null) => {
    const key = status || 'pending';
    const labels: Record<string, string> = {
      pending: t('Chờ duyệt', 'Chờ duyệt'),
      approved: t('Đã duyệt', 'Đã duyệt'),
      rejected: t('Từ chối', 'Từ chối'),
      cancelled: t('Đã hủy', 'Đã hủy'),
      completed: t('Hoàn tất', 'Hoàn tất'),
    };
    const classes: Record<string, string> = {
      pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
      approved: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
      rejected: 'bg-rose-50 text-rose-700 ring-rose-600/20',
      cancelled: 'bg-gray-50 text-gray-700 ring-gray-600/20',
      completed: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    };
    return {
      label: labels[key] || key,
      className: classes[key] || 'bg-gray-50 text-gray-700 ring-gray-600/20',
    };
  };

  const renderValue = (value?: ReactNode) => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-gray-400">-</span>;
    }
    return value;
  };

  const DetailItem = ({ icon, label, value, className = '' }: { icon: ReactNode; label: string; value?: ReactNode; className?: string }) => (
    <div className={`flex gap-3 rounded-xl border border-gray-100 bg-gray-50/30 p-4 dark:border-gray-800 dark:bg-gray-800/30 ${className}`}>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</div>
        <div className="mt-1 break-words text-sm font-semibold text-gray-900 dark:text-white">{renderValue(value)}</div>
      </div>
    </div>
  );

  const TextPanel = ({ label, value }: { label: string; value?: string | null }) => (
    <div className="rounded-xl border border-gray-100 bg-gray-50/30 p-4 dark:border-gray-800 dark:bg-gray-800/30">
      <div className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</div>
      <div className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-gray-800 dark:text-gray-200">
        {renderValue(value)}
      </div>
    </div>
  );

  const handleToggleStatus = () => {
    setIsUpdatingStatus(true);
    router.put(
      route('companies.toggle-status', company.id),
      {},
      {
        preserveScroll: true,
        onSuccess: (page) => {
          toast.success(t((page.props as any).flash?.success || 'Cập nhật trạng thái công ty thành công'));
        },
        onError: (errors) => {
          toast.error(typeof errors === 'string' ? t(errors) : Object.values(errors).flat().join(', '));
        },
        onFinish: () => setIsUpdatingStatus(false),
      }
    );
  };

  const handleEditSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !editEmail.trim()) {
      toast.error(t('Vui lòng điền đầy đủ thông tin'));
      return;
    }

    setIsSubmittingEdit(true);
    router.put(
      route('companies.update', company.id),
      {
        name: editName.trim(),
        email: editEmail.trim(),
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          setIsEditModalOpen(false);
          toast.success(t('Cập nhật thông tin công ty thành công'));
        },
        onError: (errors) => {
          toast.error(typeof errors === 'string' ? t(errors) : Object.values(errors).flat().join(', '));
        },
        onFinish: () => setIsSubmittingEdit(false),
      }
    );
  };

  const handleResetPassword = (event: FormEvent) => {
    event.preventDefault();

    if (password.length < 8) {
      toast.error(t('Mật khẩu phải có ít nhất 8 ký tự.'));
      return;
    }

    setIsSubmittingPassword(true);
    router.put(
      route('companies.reset-password', company.id),
      { password },
      {
        preserveScroll: true,
        onSuccess: (page) => {
          setPassword('');
          setIsResetPasswordModalOpen(false);
          toast.success(t((page.props as any).flash?.success || 'Đặt lại mật khẩu thành công'));
        },
        onError: (errors) => {
          toast.error(typeof errors === 'string' ? t(errors) : Object.values(errors).flat().join(', '));
        },
        onFinish: () => setIsSubmittingPassword(false),
      }
    );
  };

  const fetchPlans = async () => {
    setIsLoadingPlans(true);
    try {
      const response = await fetch(route('companies.plans', company.id));
      const data = await response.json();
      if (data?.plans) {
        setAvailablePlans(data.plans);
        if (data.plans.length > 0) {
          setSelectedPlanId(data.company?.current_plan_id || data.plans[0].id);
        }
      }
    } catch (error) {
      toast.error(t('Không thể tải danh sách gói dịch vụ'));
    } finally {
      setIsLoadingPlans(false);
    }
  };

  const handleOpenUpgradeModal = () => {
    fetchPlans();
    setIsUpgradeModalOpen(true);
  };

  const handleUpgradePlan = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedPlanId) return;

    setIsSubmittingUpgrade(true);
    router.put(
      route('companies.upgrade-plan', company.id),
      {
        plan_id: selectedPlanId,
        duration: selectedDuration,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          setIsUpgradeModalOpen(false);
          toast.success(t('Nâng cấp gói dịch vụ thành công'));
        },
        onError: (errors) => {
          toast.error(typeof errors === 'string' ? t(errors) : Object.values(errors).flat().join(', '));
        },
        onFinish: () => setIsSubmittingUpgrade(false),
      }
    );
  };

  const pageActions = [
    {
      icon: <ArrowLeft className="h-4 w-4" />,
      variant: 'outline' as const,
      onClick: () => router.get(route('companies.index')),
      tooltip: t('Quay lại danh sách'),
    },
    {
      label: t('Lịch sử thanh toán', 'Lịch sử thanh toán'),
      icon: <Receipt className="mr-2 h-4 w-4" />,
      variant: 'outline' as const,
      onClick: () => setActiveTab('payments'),
      tooltip: t('Xem các khoản công ty đã thanh toán'),
    },
  ];

  // Tab definitions
  const tabs = [
    { id: 'overview', label: t('Tổng quan', 'Tổng quan'), icon: Building2 },
    { id: 'details', label: t('Thông tin chi tiết', 'Thông tin chi tiết'), icon: Sparkles },
    { id: 'members', label: t('Thành viên', 'Thành viên'), icon: Users },
    { id: 'plans', label: t('Gói dịch vụ', 'Gói dịch vụ'), icon: Briefcase },
    { id: 'payments', label: t('Thanh toán', 'Thanh toán'), icon: CreditCard },
    { id: 'storage', label: t('Dữ liệu & lưu trữ', 'Dữ liệu & lưu trữ'), icon: Database },
  ] as const;

  // Stat calculations
  const usersPercent = getUsagePercentage(usage.users.used, usage.users.limit);
  const casesPercent = getUsagePercentage(usage.cases.used, usage.cases.limit);
  const clientsPercent = getUsagePercentage(usage.clients.used, usage.clients.limit);
  const storagePercent = getUsagePercentage(usage.storage.used_gb || 0, usage.storage.limit_gb || 0);
  const isTrial = company.is_trial === true || company.is_trial === '1' || company.is_trial === 'true';
  const successfulPayments = paymentHistory.filter((item) => ['approved', 'completed'].includes(item.status || ''));
  const totalPaid = successfulPayments.reduce(
    (total, item) => total + Number(item.paid_amount ?? item.final_price ?? 0),
    0
  );

  return (
    <PageTemplate
      title={company.name}
      description={company.email}
      url={`/cong-ty-thanh-vien/${company.id}`}
      actions={pageActions}
      breadcrumbs={breadcrumbs}
      noPadding
    >
      <div className="space-y-6">
        {/* Top Header Card */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            {/* Left: Avatar & Info */}
            <div className="flex items-center gap-5">
              <Avatar className="h-20 w-20 rounded-full ring-4 ring-amber-50 dark:ring-amber-950/30">
                <AvatarImage src={company.avatar} alt={company.name} />
                <AvatarFallback className="bg-amber-100 text-3xl font-bold text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                  {company.name?.charAt(0)?.toUpperCase() || 'C'}
                </AvatarFallback>
              </Avatar>

              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {company.name}
                  </h1>
                  <Badge
                    className={
                      company.status === 'active'
                        ? 'border-none bg-emerald-50 px-3 py-1 font-medium text-emerald-600 hover:bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400'
                        : 'border-none bg-rose-50 px-3 py-1 font-medium text-rose-600 hover:bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400'
                    }
                  >
                    {company.status === 'active' ? t('Hoạt động', 'Hoạt động') : t('Không hoạt động', 'Không hoạt động')}
                  </Badge>
                </div>

                <div className="mt-2.5 flex flex-wrap items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                  <span className="inline-flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{company.email}</span>
                  </span>
                  {profile?.phone && (
                    <span className="inline-flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{profile.phone}</span>
                    </span>
                  )}
                  {profile?.address && (
                    <span className="inline-flex min-w-0 items-center gap-2">
                      <MapPin className="h-4 w-4 shrink-0 text-gray-400" />
                      <span className="max-w-sm truncate">{profile.address}</span>
                    </span>
                  )}
                  <span className="inline-flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>
                      {t('Tham gia', 'Tham gia')}: {formatDate(company.created_at)}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2.5">
              <Button
                variant="outline"
                className="h-10 rounded-xl border-gray-200 px-4 text-sm font-medium text-gray-700 shadow-none hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                onClick={() => setIsEditModalOpen(true)}
              >
                <Pencil className="mr-2 h-4 w-4 text-gray-500" />
                {t('Chỉnh sửa', 'Chỉnh sửa')}
              </Button>

              <Button
                variant="outline"
                className={`h-10 rounded-xl px-4 text-sm font-medium shadow-none transition-colors ${
                  company.status === 'active'
                    ? 'border-red-200 bg-red-50/50 text-red-600 hover:bg-red-100/60 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400'
                    : 'border-emerald-200 bg-emerald-50/50 text-emerald-600 hover:bg-emerald-100/60 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-400'
                }`}
                onClick={handleToggleStatus}
                disabled={isUpdatingStatus || globalSettings?.is_demo}
              >
                {company.status === 'active' ? (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    {t('Khóa tài khoản', 'Khóa tài khoản')}
                  </>
                ) : (
                  <>
                    <Unlock className="mr-2 h-4 w-4" />
                    {t('Mở khóa tài khoản', 'Mở khóa tài khoản')}
                  </>
                )}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-10 w-10 rounded-xl border-gray-200 p-0 text-gray-700 shadow-none hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-64 rounded-xl border border-gray-100 p-1.5 shadow-xl dark:border-gray-800 dark:bg-gray-900"
                >
                  <DropdownMenuItem
                    className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                    onClick={() => router.visit(route('impersonate.start', company.id))}
                  >
                    <ArrowRight className="h-4 w-4 text-gray-500" />
                    {t('Đăng nhập với tư cách công ty', 'Đăng nhập với tư cách công ty')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                    onClick={() => setIsResetPasswordModalOpen(true)}
                  >
                    <KeyRound className="h-4 w-4 text-gray-500" />
                    {t('Đặt lại mật khẩu', 'Đặt lại mật khẩu')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto border-b border-gray-200/80 pb-0 dark:border-gray-800 sm:gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`flex items-center gap-2.5 border-b-2 px-4 py-3 text-sm font-medium transition-all whitespace-nowrap cursor-pointer -mb-px ${
                  isActive
                    ? 'border-blue-600 text-blue-600 font-semibold'
                    : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Tổng quan (Overview) */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 4 Stat Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {/* Card 1: Thành viên nhóm */}
              <div className="rounded-2xl border border-blue-100/90 bg-[#f0f7ff] p-5 shadow-sm transition-all hover:shadow-md dark:border-blue-900/40 dark:bg-blue-950/20">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/60 dark:text-blue-300">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      {t('Thành viên nhóm', 'Thành viên nhóm')}
                    </div>
                    <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                      {usage.users.used} / {usage.users.limit}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-blue-200/50 dark:bg-blue-900/50">
                    <div
                      className="h-full rounded-full bg-blue-500 transition-all duration-500"
                      style={{ width: `${usersPercent}%` }}
                    />
                  </div>
                  <span className="min-w-[28px] text-right text-xs font-bold text-blue-600 dark:text-blue-400">
                    {usersPercent}%
                  </span>
                </div>
              </div>

              {/* Card 2: Vụ án */}
              <div className="rounded-2xl border border-emerald-100/90 bg-[#f0fdf4] p-5 shadow-sm transition-all hover:shadow-md dark:border-emerald-900/40 dark:bg-emerald-950/20">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/60 dark:text-emerald-300">
                    <Briefcase className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      {t('Vụ án', 'Vụ án')}
                    </div>
                    <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                      {usage.cases.used} / {usage.cases.limit}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-emerald-200/50 dark:bg-emerald-900/50">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${casesPercent}%` }}
                    />
                  </div>
                  <span className="min-w-[28px] text-right text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {casesPercent}%
                  </span>
                </div>
              </div>

              {/* Card 3: Khách hàng */}
              <div className="rounded-2xl border border-purple-100/90 bg-[#faf5ff] p-5 shadow-sm transition-all hover:shadow-md dark:border-purple-900/40 dark:bg-purple-950/20">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/60 dark:text-purple-300">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      {t('Khách hàng', 'Khách hàng')}
                    </div>
                    <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                      {usage.clients.used} / {usage.clients.limit}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-purple-200/50 dark:bg-purple-900/50">
                    <div
                      className="h-full rounded-full bg-purple-500 transition-all duration-500"
                      style={{ width: `${clientsPercent}%` }}
                    />
                  </div>
                  <span className="min-w-[28px] text-right text-xs font-bold text-purple-600 dark:text-purple-400">
                    {clientsPercent}%
                  </span>
                </div>
              </div>

              {/* Card 4: Lưu trữ */}
              <div className="rounded-2xl border border-amber-100/90 bg-[#fffbeb] p-5 shadow-sm transition-all hover:shadow-md dark:border-amber-900/40 dark:bg-amber-950/20">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/60 dark:text-amber-300">
                    <Database className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      {t('Lưu trữ', 'Lưu trữ')}
                    </div>
                    <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                      {formatStorageSize(usage.storage.used_gb || 0)} / {formatStorageSize(usage.storage.limit_gb || 0)}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-amber-200/50 dark:bg-amber-900/50">
                    <div
                      className="h-full rounded-full bg-amber-500 transition-all duration-500"
                      style={{ width: `${storagePercent}%` }}
                    />
                  </div>
                  <span className="min-w-[28px] text-right text-xs font-bold text-amber-600 dark:text-amber-400">
                    {storagePercent}%
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom 2-Column Section */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Left Column: Thông tin công ty */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 lg:col-span-8">
                <div className="flex items-center justify-between pb-4">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-6 w-6 text-blue-600" />
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                      {t('Thông tin công ty', 'Thông tin công ty')}
                    </h2>
                  </div>

                  <Button
                    variant="outline"
                    className="h-8 rounded-lg border-gray-200 px-3 text-xs font-medium text-gray-700 shadow-none hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    onClick={() => setIsEditModalOpen(true)}
                  >
                    <Pencil className="mr-1.5 h-3.5 w-3.5 text-gray-500" />
                    {t('Chỉnh sửa', 'Chỉnh sửa')}
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-2">
                  {/* Box 1: Tên công ty */}
                  <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50/30 p-4 dark:border-gray-800 dark:bg-gray-800/30">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        {t('Tên công ty', 'Tên công ty')}
                      </div>
                      <div className="mt-0.5 truncate text-sm font-bold text-gray-900 dark:text-white">
                        {company.name}
                      </div>
                    </div>
                  </div>

                  {/* Box 2: Email */}
                  <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50/30 p-4 dark:border-gray-800 dark:bg-gray-800/30">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        {t('Email', 'Email')}
                      </div>
                      <div className="mt-0.5 truncate text-sm font-bold text-gray-900 dark:text-white">
                        {company.email}
                      </div>
                    </div>
                  </div>

                  {/* Box 3: Số điện thoại */}
                  <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50/30 p-4 dark:border-gray-800 dark:bg-gray-800/30">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        {t('Số điện thoại', 'Số điện thoại')}
                      </div>
                      <div className="mt-0.5 truncate text-sm font-bold text-gray-900 dark:text-white">
                        {profile?.phone || '-'}
                      </div>
                    </div>
                  </div>

                  {/* Box 4: Địa chỉ */}
                  <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50/30 p-4 dark:border-gray-800 dark:bg-gray-800/30">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        {t('Địa chỉ', 'Địa chỉ')}
                      </div>
                      <div className="mt-0.5 break-words text-sm font-bold text-gray-900 dark:text-white">
                        {profile?.address || '-'}
                      </div>
                    </div>
                  </div>

                  {/* Box 3: Gói hiện tại */}
                  <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50/30 p-4 dark:border-gray-800 dark:bg-gray-800/30">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                      <Gem className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        {t('Gói hiện tại', 'Gói hiện tại')}
                      </div>
                      <div className="mt-0.5 truncate text-sm font-bold text-gray-900 dark:text-white">
                        {plan?.name || 'Free'}
                      </div>
                    </div>
                  </div>

                  {/* Box 4: Trạng thái */}
                  <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50/30 p-4 dark:border-gray-800 dark:bg-gray-800/30">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                      <Heart className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        {t('Trạng thái', 'Trạng thái')}
                      </div>
                      <div className="mt-0.5">
                        <Badge
                          className={
                            company.status === 'active'
                              ? 'border-none bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400'
                              : 'border-none bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400'
                          }
                        >
                          {company.status === 'active' ? t('Hoạt động', 'Hoạt động') : t('Không hoạt động', 'Không hoạt động')}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Box 5: Ngày tham gia */}
                  <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50/30 p-4 dark:border-gray-800 dark:bg-gray-800/30">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        {t('Ngày tham gia', 'Ngày tham gia')}
                      </div>
                      <div className="mt-0.5 truncate text-sm font-bold text-gray-900 dark:text-white">
                        {formatDate(company.created_at)}
                      </div>
                    </div>
                  </div>

                  {/* Box 6: Ngày hết hạn */}
                  <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50/30 p-4 dark:border-gray-800 dark:bg-gray-800/30">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        {t('Ngày hết hạn', 'Ngày hết hạn')}
                      </div>
                      <div className="mt-0.5 truncate text-sm font-bold text-gray-900 dark:text-white">
                        {company.plan_expiry_date ? formatDate(company.plan_expiry_date) : '-'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Hành động nhanh */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 lg:col-span-4">
                <div className="flex items-center gap-3 pb-4">
                  <Zap className="h-6 w-6 fill-amber-500 text-amber-500" />
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {t('Hành động nhanh', 'Hành động nhanh')}
                  </h2>
                </div>

                <div className="space-y-3 pt-2">
                  {/* Action 1: Xem danh sách thành viên */}
                  <button
                    onClick={() => setActiveTab('members')}
                    className="group flex w-full cursor-pointer items-center justify-between rounded-xl border border-transparent bg-gray-50/60 p-3.5 text-left transition-all hover:border-gray-200 hover:bg-gray-100/80 dark:bg-gray-800/40 dark:hover:bg-gray-800/80"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                        <Users className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 transition-colors group-hover:text-blue-600 dark:text-gray-200">
                        {t('Xem danh sách thành viên', 'Xem danh sách thành viên')}
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-600" />
                  </button>

                  {/* Action 2: Quản lý gói dịch vụ */}
                  <button
                    onClick={() => setActiveTab('plans')}
                    className="group flex w-full cursor-pointer items-center justify-between rounded-xl border border-transparent bg-gray-50/60 p-3.5 text-left transition-all hover:border-gray-200 hover:bg-gray-100/80 dark:bg-gray-800/40 dark:hover:bg-gray-800/80"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                        <Package className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 transition-colors group-hover:text-blue-600 dark:text-gray-200">
                        {t('Quản lý gói dịch vụ', 'Quản lý gói dịch vụ')}
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-600" />
                  </button>

                  {/* Action 3: Xem lịch sử thanh toán */}
                  <button
                    onClick={() => setActiveTab('payments')}
                    className="group flex w-full cursor-pointer items-center justify-between rounded-xl border border-transparent bg-gray-50/60 p-3.5 text-left transition-all hover:border-gray-200 hover:bg-gray-100/80 dark:bg-gray-800/40 dark:hover:bg-gray-800/80"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                        <Receipt className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 transition-colors group-hover:text-blue-600 dark:text-gray-200">
                        {t('Xem lịch sử thanh toán', 'Xem lịch sử thanh toán')}
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-600" />
                  </button>

                  {/* Action 4: Xem dung lượng lưu trữ */}
                  <button
                    onClick={() => setActiveTab('storage')}
                    className="group flex w-full cursor-pointer items-center justify-between rounded-xl border border-transparent bg-gray-50/60 p-3.5 text-left transition-all hover:border-gray-200 hover:bg-gray-100/80 dark:bg-gray-800/40 dark:hover:bg-gray-800/80"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                        <Database className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 transition-colors group-hover:text-blue-600 dark:text-gray-200">
                        {t('Xem dung lượng lưu trữ', 'Xem dung lượng lưu trữ')}
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Thông tin chi tiết */}
        {activeTab === 'details' && (
          <div className="space-y-6">
            <Card className="rounded-2xl border-gray-100 shadow-sm dark:border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div>
                  <CardTitle className="text-lg font-bold">{t('Thông tin tài khoản', 'Thông tin tài khoản')}</CardTitle>
                  <CardDescription>{t('Thông tin đăng nhập, trạng thái và gói hiện tại của công ty thành viên.')}</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(true)} className="rounded-xl">
                  <Pencil className="mr-2 h-3.5 w-3.5" />
                  {t('Chỉnh sửa', 'Chỉnh sửa')}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <DetailItem icon={<Hash className="h-4 w-4" />} label={t('Mã công ty (ID)', 'Mã công ty (ID)')} value={`#${company.id}`} />
                  <DetailItem icon={<Building2 className="h-4 w-4" />} label={t('Tên tài khoản', 'Tên tài khoản')} value={company.name} />
                  <DetailItem icon={<Mail className="h-4 w-4" />} label={t('Email đăng nhập', 'Email đăng nhập')} value={company.email} />
                  <DetailItem
                    icon={<Heart className="h-4 w-4" />}
                    label={t('Trạng thái tài khoản', 'Trạng thái tài khoản')}
                    value={
                      <Badge className={company.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}>
                        {company.status === 'active' ? t('Hoạt động', 'Hoạt động') : t('Không hoạt động', 'Không hoạt động')}
                      </Badge>
                    }
                  />
                  <DetailItem
                    icon={company.is_enable_login === 0 ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                    label={t('Quyền đăng nhập', 'Quyền đăng nhập')}
                    value={company.is_enable_login === 0 ? t('Đang khóa đăng nhập', 'Đang khóa đăng nhập') : t('Được phép đăng nhập', 'Được phép đăng nhập')}
                  />
                  <DetailItem icon={<Languages className="h-4 w-4" />} label={t('Ngôn ngữ', 'Ngôn ngữ')} value={company.lang || settings.defaultLanguage} />
                  <DetailItem icon={<Calendar className="h-4 w-4" />} label={t('Ngày đăng ký', 'Ngày đăng ký')} value={formatDate(company.created_at)} />
                  <DetailItem icon={<Clock className="h-4 w-4" />} label={t('Cập nhật gần nhất', 'Cập nhật gần nhất')} value={formatDateTime(company.updated_at)} />
                  <DetailItem icon={<Mail className="h-4 w-4" />} label={t('Xác thực email', 'Xác thực email')} value={formatDateTime(company.email_verified_at)} />
                  <DetailItem icon={<Gem className="h-4 w-4" />} label={t('Gói dịch vụ', 'Gói dịch vụ')} value={plan?.name || t('Chưa đăng ký gói', 'Chưa đăng ký gói')} />
                  <DetailItem icon={<Clock className="h-4 w-4" />} label={t('Ngày hết hạn gói', 'Ngày hết hạn gói')} value={formatDate(company.plan_expiry_date)} />
                  {isTrial && (
                    <DetailItem icon={<Sparkles className="h-4 w-4" />} label={t('Hạn dùng thử', 'Hạn dùng thử')} value={formatDate(company.trial_expire_date)} />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-gray-100 shadow-sm dark:border-gray-800">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold">{t('Hồ sơ & liên hệ', 'Hồ sơ & liên hệ')}</CardTitle>
                <CardDescription>{t('Địa chỉ, số điện thoại, website và thông tin pháp nhân của hồ sơ công ty.')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!profile && (
                  <div className="flex items-center gap-3 rounded-xl border border-dashed border-amber-200 bg-amber-50/70 p-4 text-sm text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-300">
                    <FileText className="h-4 w-4 shrink-0" />
                    <span>{t('Công ty này chưa tạo hồ sơ công ty nên các trường liên hệ chi tiết đang trống.', 'Công ty này chưa tạo hồ sơ công ty nên các trường liên hệ chi tiết đang trống.')}</span>
                  </div>
                )}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <DetailItem icon={<Hash className="h-4 w-4" />} label={t('Mã hồ sơ', 'Mã hồ sơ')} value={profile?.company_id} />
                  <DetailItem icon={<Building2 className="h-4 w-4" />} label={t('Tên hồ sơ công ty', 'Tên hồ sơ công ty')} value={profile?.name} />
                  <DetailItem icon={<Hash className="h-4 w-4" />} label={t('Số đăng ký', 'Số đăng ký')} value={profile?.registration_number} />
                  <DetailItem icon={<Phone className="h-4 w-4" />} label={t('Số điện thoại', 'Số điện thoại')} value={profile?.phone} />
                  <DetailItem icon={<Mail className="h-4 w-4" />} label={t('Email hồ sơ', 'Email hồ sơ')} value={profile?.email} />
                  <DetailItem
                    icon={<Globe2 className="h-4 w-4" />}
                    label={t('Website', 'Website')}
                    value={
                      profile?.website ? (
                        <a
                          href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline dark:text-blue-400"
                        >
                          {profile.website}
                        </a>
                      ) : null
                    }
                  />
                  <DetailItem icon={<MapPin className="h-4 w-4" />} label={t('Địa chỉ', 'Địa chỉ')} value={profile?.address} className="md:col-span-2 lg:col-span-3" />
                  <DetailItem icon={<Calendar className="h-4 w-4" />} label={t('Ngày thành lập', 'Ngày thành lập')} value={formatDate(profile?.establishment_date)} />
                  <DetailItem icon={<Users className="h-4 w-4" />} label={t('Quy mô công ty', 'Quy mô công ty')} value={formatCompanySize(profile?.company_size)} />
                  <DetailItem icon={<Briefcase className="h-4 w-4" />} label={t('Loại hình', 'Loại hình')} value={formatBusinessType(profile?.business_type)} />
                  <DetailItem
                    icon={<Heart className="h-4 w-4" />}
                    label={t('Trạng thái hồ sơ', 'Trạng thái hồ sơ')}
                    value={
                      profile?.status ? (
                        <Badge className={profile.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}>
                          {profile.status === 'active' ? t('Hoạt động', 'Hoạt động') : t('Không hoạt động', 'Không hoạt động')}
                        </Badge>
                      ) : null
                    }
                  />
                </div>
                <TextPanel label={t('Mô tả công ty', 'Mô tả công ty')} value={profile?.description} />
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-gray-100 shadow-sm dark:border-gray-800">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold">{t('Thông tin pháp lý & chuyên môn', 'Thông tin pháp lý & chuyên môn')}</CardTitle>
                <CardDescription>{t('Thông tin luật sư, bằng cấp, thẩm quyền tòa án, dịch vụ và thành tích nổi bật.')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <DetailItem icon={<User className="h-4 w-4" />} label={t('Tên luật sư đại diện', 'Tên luật sư đại diện')} value={profile?.advocate_name} />
                  <DetailItem icon={<Landmark className="h-4 w-4" />} label={t('Số đăng ký luật sư', 'Số đăng ký luật sư')} value={profile?.bar_registration_number} />
                  <DetailItem
                    icon={<Clock className="h-4 w-4" />}
                    label={t('Kinh nghiệm', 'Kinh nghiệm')}
                    value={profile?.years_of_experience !== null && profile?.years_of_experience !== undefined ? `${profile.years_of_experience} ${t('năm', 'năm')}` : null}
                  />
                  <DetailItem icon={<GraduationCap className="h-4 w-4" />} label={t('Bằng luật', 'Bằng luật')} value={profile?.law_degree} />
                  <DetailItem icon={<GraduationCap className="h-4 w-4" />} label={t('Trường đại học', 'Trường đại học')} value={profile?.university} />
                  <DetailItem icon={<Languages className="h-4 w-4" />} label={t('Ngôn ngữ sử dụng', 'Ngôn ngữ sử dụng')} value={profile?.languages_spoken} />
                  <DetailItem icon={<Banknote className="h-4 w-4" />} label={t('Phí tư vấn', 'Phí tư vấn')} value={formatCurrencyValue(profile?.consultation_fees)} />
                  <DetailItem icon={<Clock className="h-4 w-4" />} label={t('Giờ làm việc', 'Giờ làm việc')} value={profile?.office_hours} />
                  <DetailItem
                    icon={<Percent className="h-4 w-4" />}
                    label={t('Tỷ lệ thành công', 'Tỷ lệ thành công')}
                    value={profile?.success_rate !== null && profile?.success_rate !== undefined ? `${profile.success_rate}%` : null}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <TextPanel label={t('Chuyên môn', 'Chuyên môn')} value={profile?.specialization} />
                  <TextPanel label={t('Thẩm quyền tòa án', 'Thẩm quyền tòa án')} value={profile?.court_jurisdictions} />
                  <TextPanel label={t('Dịch vụ cung cấp', 'Dịch vụ cung cấp')} value={profile?.services_offered} />
                  <TextPanel label={t('Vụ việc tiêu biểu', 'Vụ việc tiêu biểu')} value={profile?.notable_cases} />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-gray-100 shadow-sm dark:border-gray-800">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold">{t('Cấu hình hệ thống', 'Cấu hình hệ thống')}</CardTitle>
                <CardDescription>{t('Một số thiết lập chung và dữ liệu giới thiệu đang gắn với tài khoản công ty.')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <DetailItem icon={<Building2 className="h-4 w-4" />} label={t('Tên hiển thị hệ thống', 'Tên hiển thị hệ thống')} value={settings.titleText} />
                  <DetailItem icon={<FileText className="h-4 w-4" />} label={t('Chân trang', 'Chân trang')} value={settings.footerText} />
                  <DetailItem icon={<Languages className="h-4 w-4" />} label={t('Ngôn ngữ mặc định', 'Ngôn ngữ mặc định')} value={settings.defaultLanguage} />
                  <DetailItem icon={<CreditCard className="h-4 w-4" />} label={t('Tiền tệ mặc định', 'Tiền tệ mặc định')} value={settings.defaultCurrency} />
                  <DetailItem icon={<Calendar className="h-4 w-4" />} label={t('Định dạng ngày', 'Định dạng ngày')} value={settings.dateFormat} />
                  <DetailItem icon={<Clock className="h-4 w-4" />} label={t('Định dạng giờ', 'Định dạng giờ')} value={settings.timeFormat} />
                  <DetailItem icon={<Globe2 className="h-4 w-4" />} label={t('Múi giờ', 'Múi giờ')} value={settings.defaultTimezone} />
                  <DetailItem icon={<Hash className="h-4 w-4" />} label={t('Mã giới thiệu', 'Mã giới thiệu')} value={formatPlainValue(company.referral_code)} />
                  <DetailItem icon={<Hash className="h-4 w-4" />} label={t('Mã giới thiệu đã dùng', 'Mã giới thiệu đã dùng')} value={formatPlainValue(company.used_referral_code)} />
                  <DetailItem icon={<Banknote className="h-4 w-4" />} label={t('Hoa hồng hiện tại', 'Hoa hồng hiện tại')} value={formatCurrencyValue(company.commission_amount)} />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab 3: Thành viên */}
        {activeTab === 'members' && (
          <Card className="rounded-2xl border-gray-100 shadow-sm dark:border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-lg font-bold">{t('Quản lý thành viên nhóm', 'Quản lý thành viên nhóm')}</CardTitle>
                <CardDescription>
                  {t('Công ty đã sử dụng {{used}} / {{limit}} tài khoản thành viên.', {
                    used: usage.users.used,
                    limit: usage.users.limit || t('Không giới hạn'),
                  })}
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl"
                onClick={() => router.visit(route('users.index'))}
              >
                <Users className="mr-2 h-4 w-4 text-blue-600" />
                {t('Danh sách người dùng', 'Danh sách người dùng')}
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-xl border border-blue-100 bg-[#f0f7ff] p-5 dark:border-blue-900/40 dark:bg-blue-950/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('Hạn mức người dùng')}
                      </div>
                      <div className="text-xl font-bold text-gray-900 dark:text-white">
                        {usage.users.used} / {usage.users.limit} {t('thành viên')}
                      </div>
                    </div>
                  </div>
                  <span className="text-base font-bold text-blue-600">{usersPercent}%</span>
                </div>
                <Progress value={usersPercent} className="mt-4 h-2.5" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tab 4: Gói dịch vụ */}
        {activeTab === 'plans' && (
          <div className="space-y-6">
            <Card className="rounded-2xl border-gray-100 shadow-sm dark:border-gray-800">
              <CardHeader className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-lg font-bold">{t('Gói dịch vụ hiện tại', 'Gói dịch vụ hiện tại')}</CardTitle>
                  <CardDescription>
                    {t('Thông tin chi tiết về gói dịch vụ và các giới hạn tài nguyên')}
                  </CardDescription>
                </div>
                <Button
                  onClick={handleOpenUpgradeModal}
                  className="rounded-xl bg-blue-600 hover:bg-blue-700"
                >
                  <Package className="mr-2 h-4 w-4" />
                  {t('Nâng cấp gói', 'Nâng cấp gói')}
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-xl border p-4">
                    <div className="text-xs text-muted-foreground">{t('Tên gói')}</div>
                    <div className="mt-1 text-xl font-bold text-blue-600">{plan?.name || t('Không có gói')}</div>
                    <div className="mt-2 text-xs text-muted-foreground">{plan?.description || '-'}</div>
                  </div>
                  <div className="rounded-xl border p-4">
                    <div className="text-xs text-muted-foreground">{t('Hạn mức vụ án')}</div>
                    <div className="mt-1 text-xl font-bold">{plan?.max_cases ?? 0}</div>
                    <div className="mt-2 text-xs text-muted-foreground">{t('Vụ án được phép tạo')}</div>
                  </div>
                  <div className="rounded-xl border p-4">
                    <div className="text-xs text-muted-foreground">{t('Hạn mức khách hàng')}</div>
                    <div className="mt-1 text-xl font-bold">{plan?.max_clients ?? 0}</div>
                    <div className="mt-2 text-xs text-muted-foreground">{t('Khách hàng được quản lý')}</div>
                  </div>
                  <div className="rounded-xl border p-4">
                    <div className="text-xs text-muted-foreground">{t('Dung lượng lưu trữ')}</div>
                    <div className="mt-1 text-xl font-bold">{plan?.storage_limit ?? 0} GB</div>
                    <div className="mt-2 text-xs text-muted-foreground">{t('Lưu trữ tài liệu và hồ sơ')}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab 5: Thanh toán */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-blue-100/90 bg-[#f0f7ff] p-5 shadow-sm dark:border-blue-900/40 dark:bg-blue-950/20">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <Receipt className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('Tổng đơn gói', 'Tổng đơn gói')}</div>
                    <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{paymentHistory.length}</div>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-emerald-100/90 bg-[#f0fdf4] p-5 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/20">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('Đã thanh toán', 'Đã thanh toán')}</div>
                    <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{successfulPayments.length}</div>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-amber-100/90 bg-[#fffbeb] p-5 shadow-sm dark:border-amber-900/40 dark:bg-amber-950/20">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                    <Banknote className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('Tổng tiền đã ghi nhận', 'Tổng tiền đã ghi nhận')}</div>
                    <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{formatCurrencyValue(totalPaid)}</div>
                  </div>
                </div>
              </div>
            </div>

            <Card className="rounded-2xl border-gray-100 shadow-sm dark:border-gray-800">
              <CardHeader className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-lg font-bold">{t('Lịch sử thanh toán gói', 'Lịch sử thanh toán gói')}</CardTitle>
                  <CardDescription>{t('20 giao dịch mua, gia hạn hoặc nâng cấp gói gần nhất của công ty.')}</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="rounded-xl" onClick={() => router.visit(route('plan-orders.index'))}>
                  <Receipt className="mr-2 h-4 w-4" />
                  {t('Mở quản lý đơn gói', 'Mở quản lý đơn gói')}
                </Button>
              </CardHeader>
              <CardContent>
                {paymentHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
                    <Receipt className="h-10 w-10 text-gray-400" />
                    <h3 className="mt-3 text-base font-semibold text-gray-900 dark:text-white">
                      {t('Chưa có lịch sử thanh toán', 'Chưa có lịch sử thanh toán')}
                    </h3>
                    <p className="mt-1 max-w-md text-sm text-gray-500">
                      {t('Công ty này chưa phát sinh đơn mua, gia hạn hoặc nâng cấp gói nào.', 'Công ty này chưa phát sinh đơn mua, gia hạn hoặc nâng cấp gói nào.')}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
                    <table className="min-w-[1100px] w-full text-left text-sm">
                      <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500 dark:bg-gray-800/60 dark:text-gray-400">
                        <tr>
                          <th className="px-4 py-3">{t('Mã đơn', 'Mã đơn')}</th>
                          <th className="px-4 py-3">{t('Gói', 'Gói')}</th>
                          <th className="px-4 py-3">{t('Chu kỳ', 'Chu kỳ')}</th>
                          <th className="px-4 py-3">{t('Số tiền', 'Số tiền')}</th>
                          <th className="px-4 py-3">{t('Trạng thái', 'Trạng thái')}</th>
                          <th className="px-4 py-3">{t('Phương thức', 'Phương thức')}</th>
                          <th className="px-4 py-3">{t('Mã giao dịch', 'Mã giao dịch')}</th>
                          <th className="px-4 py-3">{t('Xử lý', 'Xử lý')}</th>
                          <th className="px-4 py-3 text-right">{t('Biên lai', 'Biên lai')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {paymentHistory.map((order) => {
                          const statusMeta = getPaymentStatusMeta(order.status);
                          const paymentMethod = order.payment_method ? order.payment_method.replace(/_/g, ' ') : '-';
                          const transactionRows = [
                            { label: t('GD SePay', 'GD SePay'), value: order.sepay_transaction_id },
                            { label: t('Đơn SePay', 'Đơn SePay'), value: order.sepay_order_code },
                            { label: t('Payment ID', 'Payment ID'), value: order.payment_id },
                          ].filter((item) => item.value);

                          return (
                            <tr key={order.id} className="bg-white align-top dark:bg-gray-900">
                              <td className="px-4 py-4">
                                <div className="font-semibold text-gray-900 dark:text-white">{order.order_number || `#${order.id}`}</div>
                                <div className="mt-1 text-xs text-gray-500">{formatDateTime(order.ordered_at)}</div>
                              </td>
                              <td className="px-4 py-4">
                                <div className="font-medium text-gray-900 dark:text-white">{order.plan_name || '-'}</div>
                                {order.coupon_code && (
                                  <div className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                                    {t('Mã giảm giá', 'Mã giảm giá')}: {order.coupon_code}
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-4 text-gray-700 dark:text-gray-300">{formatBillingCycle(order.billing_cycle)}</td>
                              <td className="px-4 py-4">
                                {Number(order.discount_amount || 0) > 0 && (
                                  <div className="text-xs text-gray-400 line-through">{formatCurrencyValue(order.original_price)}</div>
                                )}
                                <div className="font-semibold text-gray-900 dark:text-white">{formatCurrencyValue(order.final_price)}</div>
                                {Number(order.discount_amount || 0) > 0 && (
                                  <div className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                                    -{formatCurrencyValue(order.discount_amount)}
                                  </div>
                                )}
                                {order.paid_amount !== null && order.paid_amount !== undefined && (
                                  <div className="mt-1 text-xs text-gray-500">
                                    {t('Đã trả', 'Đã trả')}: {formatCurrencyValue(order.paid_amount)}
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-4">
                                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${statusMeta.className}`}>
                                  {statusMeta.label}
                                </span>
                              </td>
                              <td className="px-4 py-4 capitalize text-gray-700 dark:text-gray-300">{paymentMethod}</td>
                              <td className="px-4 py-4">
                                {transactionRows.length > 0 ? (
                                  <div className="space-y-1">
                                    {transactionRows.map((item) => (
                                      <div key={`${order.id}-${item.label}`} className="max-w-[220px] break-all text-xs text-gray-700 dark:text-gray-300">
                                        <span className="font-medium text-gray-500">{item.label}: </span>
                                        <span className="font-mono">{item.value}</span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                                {order.sepay_transaction_date && (
                                  <div className="mt-1 text-xs text-gray-500">
                                    {t('Ngày giao dịch', 'Ngày giao dịch')}: {formatDateTime(order.sepay_transaction_date)}
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-4">
                                <div className="text-gray-700 dark:text-gray-300">{formatDateTime(order.processed_at)}</div>
                                {order.processed_by && (
                                  <div className="mt-1 text-xs text-gray-500">{order.processed_by.name}</div>
                                )}
                                {order.notes && (
                                  <div className="mt-1 max-w-[220px] break-words text-xs text-gray-500">{order.notes}</div>
                                )}
                              </td>
                              <td className="px-4 py-4 text-right">
                                {order.receipt_path ? (
                                  <a
                                    href={getImagePath(order.receipt_path)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-end gap-1 text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                                  >
                                    <FileText className="h-4 w-4" />
                                    {t('Xem', 'Xem')}
                                  </a>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab 6: Dữ liệu & lưu trữ */}
        {activeTab === 'storage' && (
          <Card className="rounded-2xl border-gray-100 shadow-sm dark:border-gray-800">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold">{t('Dữ liệu & dung lượng lưu trữ', 'Dữ liệu & dung lượng lưu trữ')}</CardTitle>
              <CardDescription>
                {t('Theo dõi mức sử dụng ổ đĩa và tệp tin đính kèm')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-xl border border-amber-100 bg-[#fffbeb] p-6 dark:border-amber-900/40 dark:bg-amber-950/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                      <Database className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('Tổng dung lượng lưu trữ')}
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatStorageSize(usage.storage.used_gb || 0)} / {formatStorageSize(usage.storage.limit_gb || 0)}
                      </div>
                    </div>
                  </div>
                  <span className="text-xl font-bold text-amber-600">{storagePercent}%</span>
                </div>
                <Progress value={storagePercent} className="mt-5 h-3" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dialog 1: Chỉnh sửa công ty */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-md rounded-2xl p-6">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Pencil className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold">{t('Chỉnh sửa công ty', 'Chỉnh sửa công ty')}</DialogTitle>
                  <DialogDescription className="text-xs text-gray-500">
                    {t('Cập nhật tên và địa chỉ email của công ty')}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="company_name">{t('Tên công ty', 'Tên công ty')}</Label>
                <Input
                  id="company_name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder={t('Nhập tên công ty')}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_email">{t('Email', 'Email')}</Label>
                <Input
                  id="company_email"
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder={t('Nhập email')}
                  required
                />
              </div>

              <DialogFooter className="gap-2 pt-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  {t('Hủy', 'Hủy')}
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingEdit || globalSettings?.is_demo}
                  className="rounded-xl bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmittingEdit ? t('Đang lưu...') : t('Lưu thay đổi', 'Lưu thay đổi')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog 2: Đặt lại mật khẩu */}
        <Dialog open={isResetPasswordModalOpen} onOpenChange={setIsResetPasswordModalOpen}>
          <DialogContent className="max-w-md rounded-2xl p-6">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold">{t('Đặt lại mật khẩu', 'Đặt lại mật khẩu')}</DialogTitle>
                  <DialogDescription className="text-xs text-gray-500">
                    {t('Nhập mật khẩu mới cho tài khoản công ty (tối thiểu 8 ký tự)')}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <form onSubmit={handleResetPassword} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="reset_password">{t('Mật khẩu mới', 'Mật khẩu mới')}</Label>
                <Input
                  id="reset_password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('Nhập mật khẩu mới')}
                  minLength={8}
                  required
                />
              </div>

              <DialogFooter className="gap-2 pt-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => {
                    setPassword('');
                    setIsResetPasswordModalOpen(false);
                  }}
                >
                  {t('Hủy', 'Hủy')}
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingPassword || password.length < 8 || globalSettings?.is_demo}
                  className="rounded-xl bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmittingPassword ? t('Đang xử lý...') : t('Đặt lại mật khẩu', 'Đặt lại mật khẩu')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog 3: Nâng cấp gói */}
        <Dialog open={isUpgradeModalOpen} onOpenChange={setIsUpgradeModalOpen}>
          <DialogContent className="max-w-lg rounded-2xl p-6">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold">{t('Nâng cấp gói dịch vụ', 'Nâng cấp gói dịch vụ')}</DialogTitle>
                  <DialogDescription className="text-xs text-gray-500">
                    {t('Chọn gói cước và chu kỳ thanh toán mới')}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <form onSubmit={handleUpgradePlan} className="space-y-4 pt-2">
              {isLoadingPlans ? (
                <div className="py-8 text-center text-sm text-gray-500">{t('Đang tải danh sách gói...')}</div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>{t('Chu kỳ thanh toán')}</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        variant={selectedDuration === 'monthly' ? 'default' : 'outline'}
                        className="rounded-xl"
                        onClick={() => setSelectedDuration('monthly')}
                      >
                        {t('Hàng tháng')}
                      </Button>
                      <Button
                        type="button"
                        variant={selectedDuration === 'yearly' ? 'default' : 'outline'}
                        className="rounded-xl"
                        onClick={() => setSelectedDuration('yearly')}
                      >
                        {t('Hàng năm')}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{t('Chọn gói cước')}</Label>
                    <div className="max-h-60 space-y-2 overflow-y-auto">
                      {availablePlans
                        .filter((p) => (selectedDuration === 'monthly' ? p.duration === t('Monthly') || p.duration === 'Monthly' : p.duration === t('Yearly') || p.duration === 'Yearly'))
                        .map((p) => (
                          <div
                            key={`${p.id}-${p.duration}`}
                            onClick={() => setSelectedPlanId(p.id)}
                            className={`flex cursor-pointer items-center justify-between rounded-xl border p-3.5 transition-all ${
                              selectedPlanId === p.id
                                ? 'border-blue-600 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-950/30'
                                : 'hover:border-gray-300'
                            }`}
                          >
                            <div>
                              <div className="text-sm font-semibold">{p.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {p.max_users} {t('thành viên')} • {p.max_cases} {t('vụ án')} • {p.storage_limit} GB
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-bold text-blue-600">
                                {Number(p.price || 0).toLocaleString()} VNĐ
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </>
              )}

              <DialogFooter className="gap-2 pt-3 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => setIsUpgradeModalOpen(false)}
                >
                  {t('Hủy', 'Hủy')}
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingUpgrade || !selectedPlanId || globalSettings?.is_demo}
                  className="rounded-xl bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmittingUpgrade ? t('Đang cập nhật...') : t('Xác nhận nâng cấp', 'Xác nhận nâng cấp')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </PageTemplate>
  );
}
