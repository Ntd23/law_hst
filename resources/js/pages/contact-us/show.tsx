import React, { useState } from 'react';
import { PageTemplate } from '@/components/page-template';
import { usePage, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, Mail, Calendar, Phone, MapPin, 
  Trash2, Send, Copy, ShieldCheck, Scale, FileText, Check, Tag 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CrudDeleteModal } from '@/components/CrudDeleteModal';
import { toast } from '@/components/custom-toast';
import { useInitials } from '@/hooks/use-initials';

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  updated_at?: string;
}

interface PageProps {
  contact: ContactMessage;
  auth: any;
}

export default function ContactUsShow() {
  const { t } = useTranslation();
  const { contact } = usePage<PageProps>().props;
  const getInitials = useInitials();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  // Normalize literal '\n' escape characters into real newlines
  const rawMessage = (contact.message || '').replace(/\\n/g, '\n');

  // Helper parser for extra structured fields
  const parseMessageFields = (text: string) => {
    let phone = '';
    let address = '';
    let practiceArea = '';
    let questionContent = text;

    const phoneMatch = text.match(/Số điện thoại:\s*(.+)/i);
    if (phoneMatch) phone = phoneMatch[1].trim();

    const addressMatch = text.match(/Địa chỉ:\s*(.+)/i);
    if (addressMatch) address = addressMatch[1].trim();

    const practiceMatch = text.match(/Lĩnh vực quan tâm:\s*(.+)/i);
    if (practiceMatch) practiceArea = practiceMatch[1].trim();

    if (text.includes('[Mô Tả Nội Dung Câu Hỏi]')) {
      const parts = text.split('[Mô Tả Nội Dung Câu Hỏi]');
      questionContent = (parts[1] || parts[0]).trim();
    } else if (text.includes('[Thông Tin Tư Vấn]')) {
      // Remove lines matching info fields
      questionContent = text
        .replace(/\[Thông Tin Tư Vấn\]/g, '')
        .replace(/Số điện thoại:.*/gi, '')
        .replace(/Địa chỉ:.*/gi, '')
        .replace(/Lĩnh vực quan tâm:.*/gi, '')
        .trim();
    }

    return { phone, address, practiceArea, questionContent };
  };

  const parsed = parseMessageFields(rawMessage);

  const breadcrumbs = [
    { title: t('Dashboard'), href: route('dashboard') },
    { title: t('Contact Inquiries'), href: route('contact-us.index') },
    { title: `Chi tiết #${contact.id}` }
  ];

  const handleCopyEmail = () => {
    if (contact.email) {
      navigator.clipboard.writeText(contact.email);
      setCopiedEmail(true);
      toast.success(t('Đã sao chép địa chỉ Email'));
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  const handleCopyPhone = () => {
    if (parsed.phone) {
      navigator.clipboard.writeText(parsed.phone);
      setCopiedPhone(true);
      toast.success(t('Đã sao chép số điện thoại'));
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  };

  const handleDeleteConfirm = () => {
    router.delete(route('contact-us.destroy', contact.id), {
      onSuccess: () => {
        toast.success(t('Đã xóa yêu cầu tư vấn thành công.'));
        router.visit(route('contact-us.index'));
      },
      onError: (errors) => {
        toast.error(`Xóa thất bại: ${Object.values(errors).join(', ')}`);
      }
    });
  };

  const pageActions = [
    {
      label: t('Quay lại danh sách'),
      icon: <ArrowLeft className="w-4 h-4 mr-1.5" />,
      variant: 'outline' as const,
      onClick: () => router.visit(route('contact-us.index'))
    },
    {
      label: t('Xóa yêu cầu'),
      icon: <Trash2 className="w-4 h-4 mr-1.5" />,
      variant: 'destructive' as const,
      onClick: () => setIsDeleteModalOpen(true)
    }
  ];

  return (
    <PageTemplate
      title={`Chi tiết yêu cầu tư vấn #${contact.id}`}
      description={t('Thông tin chi tiết người gửi và nội dung thắc mắc pháp lý của Thân chủ.')}
      breadcrumbs={breadcrumbs}
      actions={pageActions}
    >
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Main Grid: Left (Sender Info) & Right (Message Content) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Sender Information Card (4 Cols) */}
          <div className="lg:col-span-4 bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 space-y-5">
            <div className="text-center space-y-2.5">
              <Avatar className="h-20 w-20 mx-auto shadow-md border-2 border-blue-50 dark:border-blue-900">
                <AvatarFallback className="text-2xl font-black bg-blue-600 text-white">
                  {getInitials(contact.name)}
                </AvatarFallback>
              </Avatar>

              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {contact.name || t('Thân chủ ẩn danh')}
                </h2>
                <Badge variant="outline" className="mt-1 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 text-xs">
                  {t('Thân chủ gửi yêu cầu')}
                </Badge>
              </div>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-3.5 text-sm">
              
              {/* Email */}
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                  {t('Địa chỉ Email')}
                </span>
                <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/80 p-2.5 rounded-xl border border-gray-200/80 dark:border-gray-700">
                  <span className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate mr-2">
                    {contact.email}
                  </span>
                  <button
                    onClick={handleCopyEmail}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
                    title={t('Sao chép Email')}
                  >
                    {copiedEmail ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Phone Number (If available) */}
              {parsed.phone && (
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                    {t('Số điện thoại')}
                  </span>
                  <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/80 p-2.5 rounded-xl border border-gray-200/80 dark:border-gray-700">
                    <a
                      href={`tel:${parsed.phone}`}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{parsed.phone}</span>
                    </a>
                    <button
                      onClick={handleCopyPhone}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
                      title={t('Sao chép Số điện thoại')}
                    >
                      {copiedPhone ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Address (If available) */}
              {parsed.address && (
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                    {t('Địa chỉ liên hệ')}
                  </span>
                  <div className="flex items-start gap-2 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/80 p-2.5 rounded-xl border border-gray-200/80 dark:border-gray-700">
                    <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>{parsed.address}</span>
                  </div>
                </div>
              )}

              {/* Practice Area Badge (If available) */}
              {parsed.practiceArea && (
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                    {t('Lĩnh vực quan tâm')}
                  </span>
                  <div className="flex items-center gap-2 text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 p-2.5 rounded-xl border border-purple-100 dark:border-purple-800">
                    <Tag className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>{parsed.practiceArea}</span>
                  </div>
                </div>
              )}

              {/* Submission Time */}
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                  {t('Thời gian gửi câu hỏi')}
                </span>
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-xs font-medium bg-gray-50 dark:bg-gray-800/80 p-2.5 rounded-xl border border-gray-200/80 dark:border-gray-700">
                  <Calendar className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>
                    {window.appSettings?.formatDateTime(contact.created_at) || contact.created_at}
                  </span>
                </div>
              </div>

            </div>

            {/* Email Reply Button */}
            <div className="pt-2">
              <a
                href={`mailto:${contact.email}?subject=Re: ${encodeURIComponent(contact.subject || 'Tư vấn pháp lý')}`}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{t('Phản Hồi Qua Email')}</span>
              </a>
            </div>
          </div>

          {/* Right Column: Full Question & Message Details (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Subject Card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                <FileText className="w-4 h-4" />
                <span>{t('Tiêu Đề Câu Hỏi / Vấn Đề Pháp Lý')}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white leading-snug">
                {contact.subject || t('Không có tiêu đề')}
              </h1>
            </div>

            {/* Message Body Card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200 dark:border-gray-800 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Scale className="w-4 h-4 text-blue-600" />
                  <span>{t('Nội Dung Chi Tiết Yêu Cầu Tư Vấn')}</span>
                </h3>
                <span className="text-xs text-gray-400 font-mono">
                  ID #{contact.id}
                </span>
              </div>

              {/* Message Content with real line breaks and paragraph formatting */}
              <div className="bg-gray-50/80 dark:bg-gray-800/40 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 text-sm leading-relaxed text-gray-800 dark:text-gray-200 space-y-3">
                {(parsed.questionContent || rawMessage).split('\n').map((line, idx) => (
                  <p key={idx} className={line.trim() === '' ? 'h-2' : ''}>
                    {line}
                  </p>
                ))}
              </div>
            </div>

            {/* Security Guarantee Notice */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-900 p-4 rounded-xl border border-blue-100 dark:border-gray-800 flex items-center gap-3 text-xs text-gray-600 dark:text-gray-300">
              <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
              <span>
                {t('Nội dung tư vấn này được bảo mật 100% theo quy định bí mật thông tin Thân chủ của Luật Luật sư.')}
              </span>
            </div>

          </div>

        </div>

      </div>

      {/* Delete Modal */}
      <CrudDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={`${contact.name} - #${contact.id}`}
        entityName={t('yêu cầu tư vấn')}
      />
    </PageTemplate>
  );
}
