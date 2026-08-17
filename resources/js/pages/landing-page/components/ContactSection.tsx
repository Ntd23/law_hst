import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Mail, MapPin, Send, CheckCircle, Clock, User, FileText, Sparkles, MessageSquare, PhoneCall } from 'lucide-react';
import { toast } from '@/components/custom-toast';
import { useTranslation } from 'react-i18next';

interface ContactSectionProps {
  brandColor?: string;
  flash?: {
    success?: string;
    error?: string;
  };
  settings?: {
    contact_email?: string;
    contact_phone?: string;
    contact_address?: string;
  };
  sectionData?: {
    title?: string;
    subtitle?: string;
    form_title?: string;
    info_title?: string;
    info_description?: string;
  };
}

export default function ContactSection({ flash, settings, sectionData, brandColor = '#3b82f6' }: ContactSectionProps) {
  const { t } = useTranslation();
  const [contactSuccessMessage, setContactSuccessMessage] = useState<string | false>(false);
  
  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('landing-page.contact'), {
      preserveScroll: true,
      onSuccess: (page) => {
        reset();
        const success = page.props.flash?.success;
        if (success) {
          setContactSuccessMessage(success);
        } else {
          setContactSuccessMessage(t('Your message has been sent successfully! Our legal team will contact you shortly.'));
        }
        toast.success(t('Message sent successfully!'));
      },
      onError: (errors) => {
        const errorMessage = Object.values(errors).join(', ');
        setContactSuccessMessage(false);
        toast.error(errorMessage || t('Failed to send message. Please try again.'));
      }
    });
  };

  const contactEmail = settings?.contact_email || 'contact@lawfirm.vn';
  const contactPhone = settings?.contact_phone || '0902 524 567';
  const contactAddress = settings?.contact_address || 'Tầng 12, Tòa nhà Bitexco Financial Tower, Số 2 Hải Triều, Q.1, TP. Hồ Chí Minh';

  return (
    <section id="contact" className="relative pt-6 pb-16 bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900/90 dark:to-gray-900 border-t border-gray-200/60 dark:border-gray-800 transition-colors overflow-hidden">
      {/* Decorative Background Blur Circles */}
      <div className="absolute top-1/4 left-0 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-0 translate-x-1/3 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 mb-3 border border-blue-200 dark:border-blue-800">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{t('Legal Consultation')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {t(sectionData?.title || 'Get in Touch')}
          </h2>
          <p className="mt-3 text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
            {t(sectionData?.subtitle || "Have questions about Advocate SaaS? We'd love to hear from you.")}
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left Column: Modern Glassmorphic Form */}
          <div className="lg:col-span-7">
            <div className="bg-white dark:bg-gray-800/90 backdrop-blur-xl border border-gray-200/80 dark:border-gray-700/80 rounded-2xl p-6 sm:p-8 shadow-xl shadow-gray-200/50 dark:shadow-none transition-all duration-300">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-700/80">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {t(sectionData?.form_title || 'Send us a Message')}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {t('Fill out the form below for a confidential case review.')}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary hidden sm:block">
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>

              {contactSuccessMessage && (
                <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 px-5 py-4 rounded-xl mb-6 flex items-start gap-3 animate-fade-in">
                  <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-sm font-medium leading-relaxed">{contactSuccessMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Name Input */}
                  <div>
                    <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                      {t('Full Name')} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        id="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        placeholder={t('Enter your full name')}
                        required
                        disabled={processing}
                      />
                    </div>
                    {errors.name && <p className="text-red-500 text-xs mt-1.5">{errors.name}</p>}
                  </div>

                  {/* Email Input */}
                  <div>
                    <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                      {t('Email Address')} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        placeholder="example@domain.com"
                        required
                        disabled={processing}
                      />
                    </div>
                    {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email}</p>}
                  </div>
                </div>

                {/* Subject Input */}
                <div>
                  <label htmlFor="subject" className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                    {t('Subject')} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <FileText className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      id="subject"
                      value={data.subject}
                      onChange={(e) => setData('subject', e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder={t('What legal matter do you need help with?')}
                      required
                      disabled={processing}
                    />
                  </div>
                  {errors.subject && <p className="text-red-500 text-xs mt-1.5">{errors.subject}</p>}
                </div>

                {/* Message Textarea */}
                <div>
                  <label htmlFor="message" className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                    {t('Message')} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    value={data.message}
                    onChange={(e) => setData('message', e.target.value)}
                    className="w-full p-3.5 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                    placeholder={t('Please describe your case details or questions...')}
                    required
                    disabled={processing}
                  />
                  {errors.message && <p className="text-red-500 text-xs mt-1.5">{errors.message}</p>}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={processing}
                  className="w-full group relative inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary hover:bg-blue-600 text-white text-sm font-bold uppercase tracking-wider rounded-xl shadow-md shadow-primary/25 hover:shadow-primary/40 active:scale-[0.99] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer overflow-hidden"
                >
                  {processing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{t('Sending...')}</span>
                    </>
                  ) : (
                    <>
                      <span>{t('Send Message')}</span>
                      <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Office Info */}
          <div className="lg:col-span-5">
            <div className="bg-white dark:bg-gray-800/90 backdrop-blur-xl border border-gray-200/80 dark:border-gray-700/80 rounded-2xl p-6 sm:p-8 shadow-xl shadow-gray-200/50 dark:shadow-none space-y-5">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white pb-3 border-b border-gray-100 dark:border-gray-700/80">
                {t(sectionData?.info_title || 'Contact Information')}
              </h3>

              {/* Phone / Hotline */}
              <div className="flex items-start gap-4 p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100/80 dark:border-blue-900/40">
                <div className="p-2.5 rounded-xl bg-blue-500 text-white shadow-md shrink-0">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('Hotline Phone')}</h4>
                  <a href={`tel:${contactPhone}`} className="text-base font-extrabold text-blue-600 dark:text-blue-400 hover:underline block mt-0.5">
                    {contactPhone}
                  </a>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t('24/7 Emergency Legal Response')}</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4 p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100/80 dark:border-emerald-900/40">
                <div className="p-2.5 rounded-xl bg-emerald-500 text-white shadow-md shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('Email Address')}</h4>
                  <a href={`mailto:${contactEmail}`} className="text-sm font-semibold text-gray-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors block mt-0.5">
                    {contactEmail}
                  </a>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t('Guaranteed reply within 2 business hours')}</p>
                </div>
              </div>

              {/* Office Address */}
              <div className="flex items-start gap-4 p-3.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-100/80 dark:border-purple-900/40">
                <div className="p-2.5 rounded-xl bg-purple-500 text-white shadow-md shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('Headquarters Address')}</h4>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5 leading-snug">
                    {contactAddress}
                  </p>
                </div>
              </div>

              {/* Working Hours */}
              <div className="flex items-start gap-4 p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-100/80 dark:border-amber-900/40">
                <div className="p-2.5 rounded-xl bg-amber-500 text-white shadow-md shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('Working Hours')}</h4>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">
                    {t('Mon - Fri')}: 08:00 AM - 18:00 PM
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {t('Sat')}: 08:00 AM - 12:00 PM
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
