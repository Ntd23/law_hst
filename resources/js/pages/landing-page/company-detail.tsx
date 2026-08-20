import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import {
  Building2,
  Scale,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  Users,
  Briefcase,
  Award,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Clock,
  GraduationCap,
  Shield,
  Star,
  MessageSquare,
  Send,
  UserCheck,
  FileCheck,
  ChevronRight,
  BookOpen,
  Tag,
  X
} from 'lucide-react';
import Header from './components/Header';
import Footer from './components/Footer';
import { getImagePath } from '@/utils/helpers';
import { toast } from '@/components/custom-toast';

interface Lawyer {
  id: number;
  name: string;
  email?: string;
  avatar?: string;
  phone?: string;
}

interface CompanyDetailProps {
  company: {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    address?: string | null;
    website?: string | null;
    logo?: string | null;
    advocate_name: string;
    specialization?: string | null;
    years_of_experience?: number | null;
    success_rate?: number | null;
    consultation_fees?: number | null;
    languages_spoken?: string | null;
    office_hours?: string | null;
    registration_number?: string | null;
    bar_registration_number?: string | null;
    business_type?: string | null;
    description?: string | null;
    law_degree?: string | null;
    university?: string | null;
    court_jurisdictions?: string | null;
    services_offered?: string | null;
    notable_cases?: string | null;
    establishment_date?: string | null;
    company_size?: string;
    plan_name?: string | null;
    cases_count: number;
    clients_count: number;
    lawyers_count: number;
    lawyers?: Lawyer[];
    created_at: string;
  };
  articles?: any[];
  customPages: any[];
  settings: any;
}

function CompanyEmblem({ logo, name }: { logo?: string | null; name: string }) {
  const [hasError, setHasError] = useState(false);
  const isValidLogo = logo && !hasError && !logo.includes('/storage/media/avatars/avatar.png');

  if (isValidLogo) {
    return (
      <img
        src={getImagePath(logo)}
        alt={name}
        onError={() => setHasError(true)}
        className="w-full h-full object-contain rounded-2xl"
      />
    );
  }

  return (
    <div className="w-full h-full bg-black/40 rounded-2xl flex items-center justify-center text-amber-400">
      <Scale className="w-16 h-16" />
    </div>
  );
}

export default function CompanyDetailPage({ company, articles = [], customPages = [], settings = {} }: CompanyDetailProps) {
  const { t } = useTranslation();
  const primaryColor = settings?.theme_color || '#c3935b';
  const [activeArticle, setActiveArticle] = useState<any | null>(null);

  // Contact form state
  const { data, setData, post, processing, reset, errors } = useForm({
    name: '',
    email: '',
    phone: '',
    subject: `Yêu cầu tư vấn từ trang chi tiết: ${company.name}`,
    message: '',
    user_id: company.id,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('landing-page.contact'), {
      preserveScroll: true,
      onSuccess: () => {
        toast.success(t('Gửi yêu cầu tư vấn thành công! Hãng luật sẽ liên hệ lại với bạn sớm nhất.'));
        reset('name', 'email', 'phone', 'message');
      },
      onError: () => {
        toast.error(t('Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại.'));
      }
    });
  };

  const successRate = company.success_rate !== null && company.success_rate !== undefined ? company.success_rate : 100;
  const starCount = Math.max(1, Math.min(5, Math.round(successRate / 20)));

  return (
    <div className="min-h-screen bg-[#f8f9fb] dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col font-sans">
      <Head title={`${company.name} - Thông Tin Chi Tiết Hãng Luật`} />

      {/* Navigation Header */}
      <Header
        settings={settings}
        customPages={customPages}
        sectionData={settings?.config_sections?.sections?.find((s: any) => s.key === 'header') || {}}
        brandColor={primaryColor}
      />

      <main className="flex-1">
        
        {/* Top Breadcrumb Bar */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Link href="/" className="hover:text-amber-600 transition-colors">
                {t('Trang chủ')}
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <Link href="/page/luat-su-tu-van" className="hover:text-amber-600 transition-colors">
                {t('Danh bạ hãng luật')}
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-gray-900 dark:text-white font-semibold truncate max-w-[200px] sm:max-w-none">
                {company.name}
              </span>
            </div>

            <Link
              href="/page/luat-su-tu-van"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 hover:text-amber-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('Quay lại danh bạ')}</span>
            </Link>
          </div>
        </div>

        {/* 1. Hero Showcase Banner */}
        <div className="relative bg-gradient-to-br from-[#0a1220] via-[#112038] to-[#060c16] text-white py-12 lg:py-16 overflow-hidden">
          {/* Subtle Background pattern */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:20px_20px]"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              
              {/* Emblem / Logo */}
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl p-3 bg-black/40 border-2 border-amber-500/40 shadow-2xl flex items-center justify-center shrink-0 backdrop-blur-md">
                <CompanyEmblem logo={company.logo} name={company.name} />
              </div>

              {/* Title & Core Info */}
              <div className="flex-1 text-center md:text-left space-y-3">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-xs">
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t('Đối tác uy tín đã xác minh')}</span>
                  </span>
                  {company.business_type && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-gray-200 uppercase tracking-wider">
                      {company.business_type === 'law_firm' ? t('Hãng luật / Văn phòng Luật sư') : company.business_type}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                  {company.name}
                </h1>

                <p className="text-sm sm:text-base text-amber-300 font-medium">
                  {t('Luật sư Trưởng / Người đại diện')}: <span className="font-bold text-white">{company.advocate_name || company.name}</span>
                  {company.bar_registration_number && ` • Thẻ LS: ${company.bar_registration_number}`}
                </p>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-gray-300 pt-1">
                  {company.address && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{company.address}</span>
                    </div>
                  )}
                  {company.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{company.phone}</span>
                    </div>
                  )}
                  {company.email && (
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{company.email}</span>
                    </div>
                  )}
                </div>

                {/* Hero CTAs */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-3">
                  <a
                    href="#contact-section"
                    className="px-6 py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#c3935b] hover:bg-[#b08048] shadow-lg shadow-amber-900/30 transition-all flex items-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{t('Đặt Lịch Tư Vấn Trực Tiếp')}</span>
                  </a>
                  {company.phone && (
                    <a
                      href={`tel:${company.phone}`}
                      className="px-5 py-3 rounded-xl text-xs sm:text-sm font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-xs transition-all flex items-center gap-2"
                    >
                      <Phone className="w-4 h-4 text-amber-400" />
                      <span>{t('Gọi Hotline')}</span>
                    </a>
                  )}
                </div>

              </div>

            </div>
          </div>
        </div>

        {/* 2. Key Stats Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200/80 dark:border-gray-800 p-4 sm:p-6 grid grid-cols-2 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-800">
            
            <div className="flex items-center gap-4 p-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900 dark:text-white">{company.lawyers_count}</p>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('Luật sư thành viên')}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-2 pt-4 md:pt-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900 dark:text-white">{company.cases_count}{company.cases_count > 0 ? '+' : ''}</p>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('Vụ việc đã thụ lý')}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-2 pt-4 md:pt-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900 dark:text-white">{company.clients_count}{company.clients_count > 0 ? '+' : ''}</p>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('Thân chủ tin tưởng')}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-2 pt-4 md:pt-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Star className="w-6 h-6 fill-amber-500 text-amber-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-black text-gray-900 dark:text-white">{successRate}%</p>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${i < starCount ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('Tỷ lệ hài lòng & Thắng kiện')}</p>
              </div>
            </div>

          </div>
        </div>

        {/* 3. Main Content: 2-Column Layout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column (8 cols) */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* About & Profile Overview */}
              <section className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-200/80 dark:border-gray-800 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                    {t('Hồ Sơ Năng Lực & Giới Thiệu')}
                  </h2>
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed space-y-3">
                  {company.description ? (
                    <p className="whitespace-pre-line">{company.description}</p>
                  ) : (
                    <p>
                      <strong>{company.name}</strong> là tổ chức hành nghề luật sư uy tín, cung cấp các giải pháp pháp lý chuyên sâu, toàn diện và hiệu quả cho các doanh nghiệp, tổ chức và cá nhân. Với đội ngũ luật sư giàu kinh nghiệm thực chiến và đạo đức nghề nghiệp vững vàng, chúng tôi cam kết bảo vệ tối đa quyền và lợi ích hợp pháp của thân chủ.
                    </p>
                  )}
                </div>

                {/* Professional Qualifications Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                      <GraduationCap className="w-4 h-4 text-amber-600" />
                      <span>{t('Bằng cấp & Học vị')}</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {company.law_degree || t('Cử nhân / Thạc sĩ Luật học')}
                    </p>
                    {company.university && (
                      <p className="text-xs text-gray-500">{company.university}</p>
                    )}
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                      <Award className="w-4 h-4 text-amber-600" />
                      <span>{t('Kinh nghiệm thực chiến')}</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {company.years_of_experience ? `${company.years_of_experience} ${t('Năm kinh nghiệm')}` : t('Kinh nghiệm chuyên sâu')}
                    </p>
                    <p className="text-xs text-gray-500">{t('Đại diện tố tụng & Tư vấn chiến lược')}</p>
                  </div>
                </div>
              </section>

              {/* Specialization & Practice Areas */}
              <section className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-200/80 dark:border-gray-800 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                    <Scale className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                    {t('Lĩnh Vực Chuyên Môn Trọng Tâm')}
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {(company.specialization
                    ? company.specialization.split(',').map(s => s.trim())
                    : [
                        'Tư vấn Pháp luật Doanh nghiệp & M&A',
                        'Tranh tụng Dân sự & Thương mại',
                        'Tư vấn Đất đai & Bất động sản',
                        'Bào chữa & Bảo vệ án Hình sự',
                        'Hôn nhân & Thừa kế tài sản',
                        'Sở hữu trí tuệ & Bản quyền'
                      ]
                  ).map((item, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-2xl border border-gray-200/70 dark:border-gray-800 bg-[#fcfbf9] dark:bg-gray-850 flex items-start gap-3 hover:border-amber-400/60 transition-colors"
                    >
                      <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">{item}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">{t('Tư vấn và thực hiện thủ tục pháp lý chuyên nghiệp.')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Articles & Legal Publications Section */}
              {articles && articles.length > 0 && (
                <section className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-200/80 dark:border-gray-800 shadow-sm space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                        {t('Bài Viết & Ấn Phẩm Pháp Lý')}
                      </h2>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {t('Các bài phân tích chuyên môn và góc nhìn pháp lý của')} {company.name}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {articles.slice(0, 6).map((art: any) => (
                      <div
                        key={art.id}
                        onClick={() => setActiveArticle(art)}
                        className="group p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-[#fcfbf9] dark:bg-gray-850 hover:border-amber-400/80 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-semibold text-[11px]">
                              {art.category}
                            </span>
                            <span>{art.date}</span>
                          </div>

                          <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white group-hover:text-amber-600 transition-colors line-clamp-2 leading-snug">
                            {art.title}
                          </h3>

                          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                            {art.summary}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-200/60 dark:border-gray-800">
                          <div className="flex items-center gap-2">
                            <img
                              src={art.author?.avatar}
                              alt={art.author?.name}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                            <span className="text-xs text-gray-700 dark:text-gray-300 font-medium truncate max-w-[130px]">
                              {art.author?.name}
                            </span>
                          </div>
                          <span className="text-xs font-semibold text-amber-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                            {t('Chi tiết')}
                            <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

            </div>

            {/* Right Column - Sticky Contact Card (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Contact Information Card */}
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-7 border border-gray-200/80 dark:border-gray-800 shadow-lg space-y-5">
                <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-amber-600" />
                  <span>{t('Thông Tin Liên Hệ')}</span>
                </h3>

                <div className="space-y-4 text-xs sm:text-sm">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-1" />
                    <div>
                      <p className="text-gray-400 text-xs">{t('Địa chỉ trụ sở')}</p>
                      <p className="font-bold text-gray-900 dark:text-white">{company.address || t('Chưa cập nhật')}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-amber-600 shrink-0 mt-1" />
                    <div>
                      <p className="text-gray-400 text-xs">{t('Hotline / Số điện thoại')}</p>
                      <p className="font-bold text-gray-900 dark:text-white">{company.phone || t('Chưa cập nhật')}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-amber-600 shrink-0 mt-1" />
                    <div>
                      <p className="text-gray-400 text-xs">{t('Email chính thức')}</p>
                      <p className="font-bold text-gray-900 dark:text-white truncate">{company.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-1" />
                    <div>
                      <p className="text-gray-400 text-xs">{t('Thời gian làm việc')}</p>
                      <p className="font-bold text-gray-900 dark:text-white">{company.office_hours || '08:30 - 17:30 (T2 - T6)'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Globe className="w-4 h-4 text-amber-600 shrink-0 mt-1" />
                    <div>
                      <p className="text-gray-400 text-xs">{t('Ngôn ngữ tư vấn')}</p>
                      <p className="font-bold text-gray-900 dark:text-white">{company.languages_spoken || 'Tiếng Việt'}</p>
                    </div>
                  </div>
                </div>

                {/* Consultation Fee Box */}
                <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/60 space-y-1">
                  <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">{t('Biểu phí tư vấn tham khảo')}</p>
                  <p className="text-lg font-black text-amber-900 dark:text-amber-200">
                    {company.consultation_fees ? `${Number(company.consultation_fees).toLocaleString('vi-VN')} VNĐ` : t('Báo phí theo tính chất vụ việc')}
                  </p>
                </div>
              </div>

              {/* Consultation Booking Form */}
              <div id="contact-section" className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-7 border border-gray-200/80 dark:border-gray-800 shadow-lg space-y-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-gray-900 dark:text-white">
                    {t('Gửi Yêu Cầu Tư Vấn')}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {t('Điền thông tin để được luật sư của')} {company.name} {t('liên hệ tư vấn trực tiếp.')}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      {t('Họ và tên')} *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={t('Nguyễn Văn A')}
                      value={data.name}
                      onChange={e => setData('name', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      {t('Số điện thoại')} *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder={t('0912 345 678')}
                      value={data.phone}
                      onChange={e => setData('phone', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      {t('Email')} *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder={t('email@example.com')}
                      value={data.email}
                      onChange={e => setData('email', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      {t('Nội dung vướng mắc cần tư vấn')} *
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder={t('Mô tả sơ lược sự việc và yêu cầu pháp lý của bạn...')}
                      value={data.message}
                      onChange={e => setData('message', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-hidden"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={processing}
                    className="w-full py-3 rounded-xl text-xs font-bold text-white bg-[#c3935b] hover:bg-[#b08048] shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{processing ? t('Đang gửi...') : t('Gửi Yêu Cầu Tư Vấn Ngay')}</span>
                  </button>
                </form>
              </div>

            </div>

          </div>
        </div>

        {/* Article Reading Modal */}
        {activeArticle && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onClick={() => setActiveArticle(null)}
          >
            <div
              className="bg-white dark:bg-gray-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col animate-in zoom-in-95 duration-200"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Banner */}
              <div className="relative aspect-[21/9] w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img
                  src={activeArticle.image}
                  alt={activeArticle.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
                <button
                  onClick={() => setActiveArticle(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-md transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute bottom-4 left-6 right-6">
                  <span className="inline-block px-2.5 py-1 rounded bg-amber-600 text-white text-xs font-bold uppercase tracking-wider mb-2">
                    {activeArticle.category}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                    {activeArticle.title}
                  </h2>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-3">
                    <img
                      src={activeArticle.author?.avatar}
                      alt={activeArticle.author?.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-500/20"
                    />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{activeArticle.author?.name}</p>
                      <p className="text-xs text-gray-500">{activeArticle.author?.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-amber-600" />
                      {activeArticle.date}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-600" />
                      {activeArticle.readTime}
                    </span>
                  </div>
                </div>

                {/* Summary */}
                <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 text-sm italic leading-relaxed">
                  "{activeArticle.summary}"
                </div>

                {/* Content Paragraphs */}
                <div className="space-y-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                  {Array.isArray(activeArticle.content) ? (
                    activeArticle.content.map((p: string, idx: number) => (
                      <p key={idx}>{p}</p>
                    ))
                  ) : (
                    <div className="whitespace-pre-line">{activeArticle.content}</div>
                  )}
                </div>

                {/* Tags */}
                {activeArticle.tags && activeArticle.tags.length > 0 && (
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2 flex-wrap">
                    <Tag className="w-4 h-4 text-gray-400" />
                    {activeArticle.tags.map((tag: string, idx: number) => (
                      <span key={idx} className="px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-300">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 px-6 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                <button
                  onClick={() => setActiveArticle(null)}
                  className="px-5 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs sm:text-sm font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  {t('Đóng')}
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <Footer
        settings={settings}
        customPages={customPages}
        sectionData={settings?.config_sections?.sections?.find((s: any) => s.key === 'footer') || {}}
        brandColor={primaryColor}
      />
    </div>
  );
}
