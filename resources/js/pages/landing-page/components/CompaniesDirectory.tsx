import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from '@inertiajs/react';
import {
  MapPin,
  Phone,
  Mail,
  Scale,
  Briefcase,
  Users,
  Star,
  Shield,
  Building2,
  ArrowRight,
  User,
  Headphones,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { getImagePath } from '@/utils/helpers';

interface CompanyItem {
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
  plan_name?: string | null;
  cases_count: number;
  clients_count: number;
  lawyers_count: number;
  lawyers?: Array<{ id: number; name: string; email?: string; avatar?: string }>;
  created_at: string;
}

interface Props {
  companies: CompanyItem[];
  brandColor?: string;
  className?: string;
  isSection?: boolean;
}

function CompanyLogo({ logo, name }: { logo?: string | null; name: string }) {
  const [hasError, setHasError] = useState(false);
  const isValidLogo = logo && !hasError && !logo.includes('/storage/media/avatars/avatar.png') && !logo.endsWith('avatar.png');

  if (isValidLogo) {
    return (
      <img
        src={getImagePath(logo)}
        alt={name}
        onError={() => setHasError(true)}
        className="w-full h-full object-contain drop-shadow-md"
      />
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center text-amber-400">
      <Scale className="w-12 h-12 stroke-[1.8] text-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.3)]" />
    </div>
  );
}

export default function CompaniesDirectory({
  companies = [],
  brandColor = '#c3935b',
  className = '',
  isSection = false
}: Props) {
  const { t } = useTranslation();
  const sliderRef = useRef<HTMLDivElement>(null);

  const slide = (direction: 'next' | 'previous') => {
    sliderRef.current?.scrollBy({
      left: (direction === 'next' ? 1 : -1) * sliderRef.current.clientWidth,
      behavior: 'smooth',
    });
  };

  // Dynamic banner generator based on company data
  const renderCardBanner = (company: CompanyItem) => {
    return (
      <div className="relative h-[210px] w-full bg-gradient-to-b from-[#0a1120] via-[#0e172a] to-[#070b14] overflow-hidden flex flex-col justify-between p-4 sm:p-5 text-white">
        {/* Subtle geometric dot pattern */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

        {/* Top Right Badge */}
        <div className="flex justify-end relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-black/40 border border-amber-500/40 text-amber-300 backdrop-blur-xs">
            <Shield className="w-3 h-3 text-amber-400" />
            <span>{t('Đối tác uy tín')}</span>
          </div>
        </div>

        {/* Center / Bottom Company Branding */}
        <div className="relative z-10 flex flex-col items-center justify-center my-auto text-center space-y-1.5 px-2">
          <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
            <CompanyLogo logo={company.logo} name={company.name} />
          </div>

          <h4 className="text-base sm:text-lg font-black tracking-wider text-amber-400 uppercase line-clamp-1">
            {company.name}
          </h4>

          <p className="text-[10px] tracking-[0.25em] text-gray-300 uppercase font-semibold">
            {company.business_type ? `— ${company.business_type.replace('_', ' ').toUpperCase()} —` : '— LAW FIRM —'}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className={`relative bg-[#f8f9fb] dark:bg-gray-950 text-gray-900 dark:text-gray-100 overflow-hidden ${isSection ? 'py-14 sm:py-20 border-b border-gray-200/80 dark:border-gray-800' : 'min-h-screen pb-16'} ${className}`}>

      {/* Decorative Background Elements */}
      {/* 1. Left Dotted Pattern */}
      <div className="absolute top-0 left-0 w-72 sm:w-96 h-72 sm:h-96 opacity-30 bg-[radial-gradient(#c3935b_1.2px,transparent_1.2px)] [background-size:22px_22px] pointer-events-none z-0"></div>

      {/* 2. Right Scales Watermark */}
      <div className="absolute top-4 right-0 lg:right-6 w-[340px] md:w-[440px] h-[340px] md:h-[440px] opacity-[0.05] dark:opacity-[0.03] pointer-events-none select-none z-0">
        <svg viewBox="0 0 200 200" fill="currentColor" className="w-full h-full text-[#c3935b]">
          <path d="M100 20 C55.8 20 20 55.8 20 100 C20 144.2 55.8 180 100 180 C144.2 180 180 144.2 180 100 C180 55.8 144.2 20 100 20 Z M100 30 C138.7 30 170 61.3 170 100 C170 138.7 138.7 170 100 170 C61.3 170 30 138.7 30 100 C30 61.3 61.3 30 100 30 Z" />
          <path d="M97 50 H103 V145 H97 Z" />
          <path d="M55 70 H145 V75 H55 Z" />
          <path d="M55 75 L35 115 H75 Z" fillOpacity="0.6" />
          <path d="M145 75 L125 115 H165 Z" fillOpacity="0.6" />
        </svg>
      </div>

      {/* 1. Hero Header Section */}
      <section className="relative z-10 pt-8 pb-7 text-center px-4 max-w-5xl mx-auto space-y-3">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-[#fff8ee] dark:bg-amber-950/40 text-[#b45309] dark:text-amber-300 border border-[#f5deb3] dark:border-amber-700/50 shadow-2xs">
          <Building2 className="w-4 h-4 text-[#d97706]" />
          <span>{t('DANH BẠ HÃNG LUẬT & VĂN PHÒNG LUẬT SƯ')}</span>
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-black text-gray-900 dark:text-white tracking-tight leading-tight">
          {t('Các Tổ Chức Hành Nghề Luật Sư')}
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-normal">
          {t('Danh sách các công ty luật và văn phòng luật sư đang hoạt động trên hệ thống.')}
        </p>

        {/* Gold Scale Divider */}
        <div className="flex items-center justify-center gap-3 pt-1">
          <div className="w-12 sm:w-16 h-[1.5px] bg-[#c3935b]/60"></div>
          <Scale className="w-4 h-4 text-[#c3935b]" />
          <div className="w-12 sm:w-16 h-[1.5px] bg-[#c3935b]/60"></div>
        </div>
      </section>

      {/* 2. Companies Cards Grid (3 cards per row on desktop & tablet) */}
      <section className="relative z-10 max-w-[1420px] mx-auto px-4 sm:px-6 lg:px-8">
        {companies.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-300 dark:border-gray-800 space-y-4">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {t('Chưa có công ty nào được kích hoạt')}
            </h3>
          </div>
        ) : (
          <div className="relative">
            {isSection && companies.length > 1 && (
              <div className="absolute -top-12 right-0 hidden sm:flex gap-2">
                <button type="button" onClick={() => slide('previous')} aria-label={t('Previous')} className="p-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 shadow-sm">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => slide('next')} aria-label={t('Next')} className="p-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 shadow-sm">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
            <div ref={sliderRef} className={isSection ? 'flex gap-5 lg:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-3 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden' : 'grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 xl:gap-7'}>
            {companies.map(company => {
              const successRate = company.success_rate !== null && company.success_rate !== undefined ? company.success_rate : 100;
              const starCount = Math.max(1, Math.min(5, Math.round(successRate / 20)));
              const specialization = company.specialization ? t(company.specialization) : t('Tư vấn Doanh nghiệp, Đất đai & Tranh tụng');
              const address = company.address ? t(company.address) : t('Chưa cập nhật');
              const phone = company.phone ? t(company.phone) : t('Chưa cập nhật');

              return (
                <div
                  key={company.id}
                  className={`${isSection ? 'w-[86vw] sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-16px)] shrink-0 snap-start' : ''} bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/90 dark:border-gray-800 shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group`}
                >
                  {/* Top Banner */}
                  {renderCardBanner(company)}

                  {/* Card Content Body */}
                  <div className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col justify-between bg-white dark:bg-gray-900">

                    {/* Title & Representative */}
                    <div>
                      <h3 className="text-lg font-extrabold text-gray-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
                        {company.name}
                      </h3>
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-1">
                        {t('Đại diện')}: <span className="text-gray-800 dark:text-gray-200">{company.advocate_name || company.name}</span>
                      </p>
                    </div>

                    {/* Specialization Box */}
                    <div className="bg-[#fff9f2] dark:bg-amber-950/20 border border-[#f7e4ce] dark:border-amber-900/40 rounded-xl p-3 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#d97706] text-white flex items-center justify-center shrink-0 shadow-xs">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium leading-none mb-1">{t('Chuyên môn')}</p>
                        <p className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">
                          {specialization}
                        </p>
                      </div>
                    </div>

                    {/* Contact Info rows */}
                    <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400 pt-0.5">
                      <div className="flex items-center gap-2.5">
                        <MapPin className="w-4 h-4 text-[#c3935b] shrink-0" />
                        <span className="truncate">{address}</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Phone className="w-4 h-4 text-[#c3935b] shrink-0" />
                        <span>{phone}</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Mail className="w-4 h-4 text-[#c3935b] shrink-0" />
                        <span className="truncate">{company.email}</span>
                      </div>
                    </div>

                    {/* Metrics Bar */}
                    <div className="rounded-xl p-3 border border-gray-200/90 dark:border-gray-800 bg-[#fafafa] dark:bg-gray-850/80 my-1 shadow-2xs">
                      <div className="grid grid-cols-3 divide-x divide-gray-200 dark:divide-gray-800 text-center">

                        {/* Metric 1: Luật sư */}
                        <div className="px-1 space-y-0.5 flex flex-col items-center justify-center">
                          <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            <Users className="w-3.5 h-3.5 text-[#c3935b]" />
                            <span>{t('LUẬT SƯ')}</span>
                          </div>
                          <p className="text-base font-black text-gray-900 dark:text-white mt-0.5">
                            {company.lawyers_count}
                          </p>
                        </div>

                        {/* Metric 2: Vụ việc */}
                        <div className="px-1 space-y-0.5 flex flex-col items-center justify-center">
                          <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            <Briefcase className="w-3.5 h-3.5 text-[#c3935b]" />
                            <span>{t('VỤ VIỆC')}</span>
                          </div>
                          <p className="text-base font-black text-gray-900 dark:text-white mt-0.5">
                            {company.cases_count}{company.cases_count > 0 ? '+' : ''}
                          </p>
                        </div>

                        {/* Metric 3: Đánh giá */}
                        <div className="px-1 space-y-0.5 flex flex-col items-center justify-center">
                          <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-amber-500 uppercase tracking-wider">
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            <span>{t('ĐÁNH GIÁ')}</span>
                          </div>
                          <p className="text-base font-black text-amber-500 dark:text-amber-400 mt-0.5">
                            {successRate}%
                          </p>
                          {/* Stars row */}
                          <div className="flex items-center justify-center gap-0.5 pt-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-2.5 h-2.5 ${i < starCount
                                  ? 'fill-[#f59e0b] text-[#f59e0b]'
                                  : 'text-gray-300 dark:text-gray-600'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Card Bottom Buttons */}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <Link
                        href={`/cong-ty/${company.id}`}
                        className="py-2.5 px-3 rounded-xl text-xs font-bold bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/80 shadow-2xs transition-all flex items-center justify-center gap-1 text-center"
                      >
                        <span>{t('Xem Chi Tiết')}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                      </Link>

                      <Link
                        href={`/lien-he-voi-chung-toi`}
                        className="py-2.5 px-3 rounded-xl text-xs font-bold text-white shadow-2xs hover:brightness-95 transition-all text-center flex items-center justify-center gap-1 bg-[#c3935b]"
                      >
                        <span>{t('Liên Hệ Ngay')}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                  </div>
                </div>
              );
            })}
            </div>
          </div>
        )}
      </section>

      {/* 3. Bottom Feature Highlights Bar (4 items) */}
      <section className="relative z-10 max-w-[1420px] mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/90 dark:border-gray-800 shadow-sm p-5 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-4 lg:gap-6">
            
            {/* Feature 1 */}
            <div className="flex items-center gap-3.5">
              <Shield className="w-8 h-8 text-[#c3935b] shrink-0 stroke-[1.75]" />
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                  {t('Thông tin minh bạch')}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                  {t('Thông tin được xác minh và cập nhật thường xuyên')}
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-center gap-3.5">
              <Users className="w-8 h-8 text-[#c3935b] shrink-0 stroke-[1.75]" />
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                  {t('Đối tác uy tín')}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                  {t('Các tổ chức hành nghề luật sư uy tín, chuyên nghiệp')}
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-center gap-3.5">
              <Scale className="w-8 h-8 text-[#c3935b] shrink-0 stroke-[1.75]" />
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                  {t('Dịch vụ đa dạng')}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                  {t('Đa dạng lĩnh vực pháp lý, đáp ứng mọi nhu cầu')}
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex items-center gap-3.5">
              <Headphones className="w-8 h-8 text-[#c3935b] shrink-0 stroke-[1.75]" />
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                  {t('Hỗ trợ tận tâm')}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                  {t('Đội ngũ hỗ trợ nhiệt tình, sẵn sàng tư vấn')}
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
