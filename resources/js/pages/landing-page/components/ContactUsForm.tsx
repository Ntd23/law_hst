import React, { useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { MapPin, Phone, Mail, Clock, ShieldCheck, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from '@/components/custom-toast';

interface Props {
  settings?: any;
  brandColor?: string;
}

const practiceAreasList = [
  '🏡 Đất đai & Bất động sản (Sổ đỏ, tranh chấp đất, chuyển nhượng)',
  '⚖️ Dân sự & Tranh chấp hợp đồng (Đòi nợ, bồi thường thiệt hại)',
  '💼 Lao động & Việc làm (Sa thải, HĐLĐ, trợ cấp mất việc)',
  '🏢 Doanh nghiệp & M&A (Thành lập, đầu tư FDI, quản trị nội bộ)',
  '💍 Hôn nhân & Gia đình (Ly hôn, phân chia tài sản, quyền nuôi con)',
  '🔒 Hình sự & Bào chữa tranh tụng (Điều tra, tại ngoại, ra tòa)',
  '🛡️ Bảo hiểm & Social Security (BHXH bắt buộc, BHYT, thất nghiệp)',
  '🚗 Giao thông & Tai nạn giao thông',
  '🏛️ Hành chính & Khiếu nại quyết định hành chính',
  '💡 Sở hữu trí tuệ & Bản quyền thương hiệu',
  '📜 Thừa kế & Di chúc (Khai nhận di sản, tranh chấp di chúc)',
  '💰 Thuế & Tài chính doanh nghiệp',
  '❓ Lĩnh vực pháp lý khác'
];

export default function ContactUsForm({ settings, brandColor = '#3b82f6' }: Props) {
  const { t } = useTranslation();
  const pageProps = usePage().props as any;
  const flash = pageProps?.flash || {};

  const { data, setData, post, processing, errors, reset, hasErrors } = useForm({
    name: '',
    address: '',
    phone: '',
    email: '',
    practice_area: practiceAreasList[0],
    subject: '',
    message: '',
  });

  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedSuccess(false);

    post(route('landing-page.contact'), {
      preserveScroll: true,
      onSuccess: () => {
        setSubmittedSuccess(true);
        reset();
        toast.success(t('Your message has been sent successfully! Our legal team will contact you shortly.'));
      },
      onError: (errs) => {
        toast.error(t('Failed to send message. Please check the fields and try again.'));
      }
    });
  };

  const contactAddress = settings?.contact_address || '123 Business Ave, Suite 100, San Francisco, CA 94105';
  const contactPhone = settings?.contact_phone || '+1 (555) 123-4567';
  const contactEmail = settings?.contact_email || 'contact@advocate.com';

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header Title Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>{t('Tư Vấn Pháp Lý Trực Tuyến & Bảo Mật 100%')}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {t('Gửi Câu Hỏi & Yêu Cầu Tư Vấn Pháp Lý')}
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed">
            {t('Đội ngũ Luật sư cấp cao sẽ nghiên cứu hồ sơ và phản hồi trực tiếp qua Điện thoại/Email trong vòng 2 giờ làm việc.')}
          </p>
        </div>

        {/* Main Content: 2 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: The Contact Form (7 Cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-gray-900 rounded-2xl p-6 sm:p-8 shadow-xl border border-gray-100 dark:border-gray-800 relative">
            
            {submittedSuccess && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-800 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-emerald-800 dark:text-emerald-200">
                    {t('Gửi câu hỏi tư vấn thành công!')}
                  </p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                    {t('Chúng tôi đã ghi nhận thông tin vụ việc và sẽ phản hồi cho bạn trong thời gian sớm nhất.')}
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Row 1: Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                    {t('Họ và tên')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder={t('Nhập họ và tên đầy đủ của bạn')}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm"
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                    {t('Số điện thoại')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={data.phone}
                    onChange={(e) => setData('phone', e.target.value)}
                    placeholder={t('Ví dụ: 0912 345 678')}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm"
                  />
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>
              </div>

              {/* Row 2: Email & Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                    {t('Gmail / Email')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    placeholder={t('nhapemail@gmail.com')}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm"
                  />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                    {t('Địa chỉ liên hệ')}
                  </label>
                  <input
                    type="text"
                    value={data.address}
                    onChange={(e) => setData('address', e.target.value)}
                    placeholder={t('Thành phố, Tỉnh hoặc Quận/Huyện')}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm"
                  />
                </div>
              </div>

              {/* Row 3: Practice Area Select */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('Lĩnh vực quan tâm / Cần tư vấn')} <span className="text-red-500">*</span>
                </label>
                <select
                  value={data.practice_area}
                  onChange={(e) => setData('practice_area', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm cursor-pointer"
                >
                  {practiceAreasList.map((area, idx) => (
                    <option key={idx} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>

              {/* Row 4: Question Subject */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('Tiêu đề câu hỏi')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={data.subject}
                  onChange={(e) => setData('subject', e.target.value)}
                  placeholder={t('Tóm tắt ngắn gọn vấn đề pháp lý (Ví dụ: Tranh chấp hợp đồng mua bán nhà đất)')}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm"
                />
                {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject}</p>}
              </div>

              {/* Row 5: Question Details Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('Mô tả nội dung câu hỏi')} <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={5}
                  required
                  value={data.message}
                  onChange={(e) => setData('message', e.target.value)}
                  placeholder={t('Mô tả chi tiết hoàn cảnh vụ việc, mốc thời gian, giấy tờ hiện có và các câu hỏi cần Luật sư giải đáp...')}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm resize-y"
                />
                {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={processing}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-white text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                style={{ backgroundColor: brandColor }}
              >
                {processing ? (
                  <span>{t('Đang gửi dữ liệu...')}</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{t('Gửi Yêu Cầu Tư Vấn Ngay')}</span>
                  </>
                )}
              </button>

            </form>
          </div>

          {/* Right Column: Office Info & Legal Privilege Guarantees (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Info Card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-800 space-y-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>{t('Thông Tin Văn Phòng Luật')}</span>
              </h3>

              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{t('Trụ sở chính')}</p>
                    <p className="text-gray-600 dark:text-gray-300 text-xs mt-0.5">{contactAddress}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{t('Hotline tư vấn khẩn cấp')}</p>
                    <p className="text-blue-600 dark:text-blue-400 font-bold text-xs mt-0.5">{contactPhone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{t('Gmail tiếp nhận hồ sơ')}</p>
                    <p className="text-gray-600 dark:text-gray-300 text-xs mt-0.5">{contactEmail}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{t('Thời gian làm việc')}</p>
                    <p className="text-gray-600 dark:text-gray-300 text-xs mt-0.5">
                      {t('Thứ 2 - Thứ 6: 08:00 - 18:00 (Hotline 24/7)')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Confidentiality & Legal Privilege Card */}
            <div className="bg-gradient-to-br from-blue-900 to-indigo-950 rounded-2xl p-6 shadow-xl text-white space-y-3">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-6 h-6 text-blue-300 shrink-0" />
                <h4 className="font-bold text-base text-white">
                  {t('Bí Mật Thông Tin Thân Chủ')}
                </h4>
              </div>
              <p className="text-xs text-blue-100 leading-relaxed">
                {t('Toàn bộ thông tin cá nhân, địa chỉ, số điện thoại và nội dung vụ việc do bạn cung cấp đều được bảo mật tuyệt đối theo Quy tắc đạo đức và ứng xử nghề nghiệp Luật sư.')}
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
