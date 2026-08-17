import React from 'react';
import { 
    Briefcase, Scale, Users, Calendar, DollarSign, ShieldCheck, 
    FileText, Clock, Lock, Sparkles, CheckCircle2, Gavel, FolderKanban
} from 'lucide-react';
import { useScrollAnimation } from '../../../hooks/useScrollAnimation';
import { useTranslation } from 'react-i18next';
import { getImagePath } from '@/utils/helpers';

interface Feature {
    title: string;
    description: string;
    icon: string;
}

interface FeaturesSectionProps {
    brandColor?: string;
    settings: any;
    sectionData: {
        title?: string;
        description?: string;
        features_list?: Feature[];
        layout?: string;
        columns?: number;
        background_color?: string;
        image?: string;
        show_icons?: boolean;
    };
}

// Legal Icon mapping
const iconMap: Record<string, React.ComponentType<any>> = {
    'briefcase': Briefcase,
    'scale': Scale,
    'users': Users,
    'calendar': Calendar,
    'dollar-sign': DollarSign,
    'shield-check': ShieldCheck,
    'file-text': FileText,
    'clock': Clock,
    'lock': Lock,
    'gavel': Gavel,
    'folder-kanban': FolderKanban,
    'qr-code': Briefcase,
    'smartphone': Calendar,
    'share': Users,
    'bar-chart': DollarSign,
    'globe': Scale,
    'shield': ShieldCheck,
};

export default function FeaturesSection({ settings, sectionData, brandColor = '#3b82f6' }: FeaturesSectionProps) {
    const { ref, isVisible } = useScrollAnimation();
    const { t } = useTranslation();

    const sectionImage = getImagePath(sectionData.image);
    const columns = sectionData.columns || 3;

    const defaultLegalFeatures: Feature[] = [
        {
            icon: 'briefcase',
            title: t('Comprehensive Case Management'),
            description: t('Centralize all lawsuit records, court timelines, documents, and litigation history in one secure workspace.')
        },
        {
            icon: 'calendar',
            title: t('Court Hearing & Timeline Tracking'),
            description: t('Never miss a court trial or deadline. Automated reminders for hearings, pleadings, and procedural milestones.')
        },
        {
            icon: 'users',
            title: t('Client & Contact Database'),
            description: t('Manage corporate clients and individual litigants with complete case logs, contact info, and history.')
        },
        {
            icon: 'file-text',
            title: t('Document & Contract Vault'),
            description: t('Store, categorize, and share legal templates, evidence files, and powers of attorney with role access control.')
        },
        {
            icon: 'dollar-sign',
            title: t('Legal Billing & Expense Tracking'),
            description: t('Track attorney billable hours, retainer deposits, court fee receipts, and generate professional invoices.')
        },
        {
            icon: 'shield-check',
            title: t('Role-Based Security & Audit Logs'),
            description: t('Bank-grade data encryption, granular permissions for attorneys, partners, and clients with full activity audit trails.')
        }
    ];

    const rawFeatures = sectionData.features_list && sectionData.features_list.length > 0
        ? sectionData.features_list
        : defaultLegalFeatures;

    return (
        <section id="features" className="py-16 sm:py-20 bg-gray-50/80 dark:bg-gray-900/40 border-t border-b border-gray-200/60 dark:border-gray-800 transition-colors" ref={ref}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className={`text-center max-w-3xl mx-auto mb-12 sm:mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 mb-4 border border-blue-200 dark:border-blue-800">
                        <FolderKanban className="w-3.5 h-3.5" />
                        <span>{t('Legal Practice Features')}</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                        {t(sectionData.title || 'Comprehensive Legal Practice Management')}
                    </h2>
                    <p className="mt-4 text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                        {t(sectionData.description || 'Everything you need to streamline law firm operations, manage court cases, and collaborate with clients efficiently.')}
                    </p>
                </div>

                {/* Optional Hero Feature Image */}
                {sectionImage && (
                    <div className="mb-12 text-center">
                        <img 
                            src={sectionImage} 
                            alt={t('Comprehensive Legal Practice Management')} 
                            className="max-w-full h-auto rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 mx-auto" 
                        />
                    </div>
                )}

                {/* Grid Layout */}
                <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    {rawFeatures.map((feature, index) => {
                        const IconComponent = iconMap[feature.icon] || Briefcase;
                        return (
                            <div 
                                key={index} 
                                className="group relative bg-white dark:bg-gray-800/90 rounded-2xl p-8 border border-gray-200/80 dark:border-gray-700/80 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
                            >
                                <div>
                                    <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/40 text-primary flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm">
                                        <IconComponent className="w-7 h-7" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary transition-colors">
                                        {t(feature.title)}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                        {t(feature.description)}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
