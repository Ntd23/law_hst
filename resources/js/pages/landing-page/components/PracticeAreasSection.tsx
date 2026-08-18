import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Scale, Building2, Home, Users2, Briefcase, ShieldCheck, ArrowRight, CheckCircle2, X, PhoneCall, Sparkles } from 'lucide-react';

interface PracticeArea {
    id: string;
    icon: React.ComponentType<any>;
    title: string;
    description: string;
    badge: string;
    capabilities: string[];
    details: string;
    leadAttorney: string;
}

interface PracticeAreasSectionProps {
    brandColor?: string;
}

export default function PracticeAreasSection({ brandColor = '#3b82f6' }: PracticeAreasSectionProps) {
    const { t } = useTranslation();
    const [selectedArea, setSelectedArea] = useState<PracticeArea | null>(null);

    const practiceAreas: PracticeArea[] = [
        {
            id: 'litigation',
            icon: Scale,
            title: t('Litigation & Criminal Defense'),
            badge: t('Criminal & Civil'),
            description: t('Full legal representation at trial courts and appellate levels, defending economic crimes and civil disputes.'),
            capabilities: [
                t('Criminal defense in white-collar & economic cases'),
                t('Civil & commercial lawsuit representation'),
                t('Appellate court proceedings & cassation petitions'),
                t('Pre-trial investigation support & bail petitions')
            ],
            details: t('Our seasoned litigators bring decades of courtroom experience, defending individuals and corporate executives in complex criminal and high-stakes civil proceedings.'),
            leadAttorney: 'Luật sư Nguyễn Hồng Lĩnh'
        },
        {
            id: 'corporate',
            icon: Building2,
            title: t('Corporate Law & M&A'),
            badge: t('Business & Investment'),
            description: t('Strategic legal counsel for business incorporation, cross-border M&A transactions, and corporate governance.'),
            capabilities: [
                t('M&A legal due diligence & contract negotiations'),
                t('Corporate restructuring & equity transfers'),
                t('FDI investment licensing (IRC/ERC)'),
                t('Regular corporate legal retainer services')
            ],
            details: t('We provide end-to-end legal support for domestic enterprises and foreign investors navigating Vietnam business licensing, joint ventures, and M&A deals.'),
            leadAttorney: 'Luật sư Nguyễn Cao Trí'
        },
        {
            id: 'real_estate',
            icon: Home,
            title: t('Real Estate & Land Disputes'),
            badge: t('Land & Property'),
            description: t('Resolving complex land use right disputes, real estate project clearance, and property title transactions.'),
            capabilities: [
                t('Land Use Right Certificate (LURC) dispute resolution'),
                t('Real estate project clearance & compensation'),
                t('Commercial lease & property sale agreements'),
                t('Land boundary & inheritance litigation')
            ],
            details: t('Deep expertise in Land Law 2024 compliance, assisting investors and private property owners in resolving land disputes and securing legal titles.'),
            leadAttorney: 'Luật sư Nguyễn Văn Toàn'
        },
        {
            id: 'family',
            icon: Users2,
            title: t('Family & Inheritance Law'),
            badge: t('Personal & Estate'),
            description: t('Compassionate legal guidance for divorce, marital asset division, child custody, and estate probate.'),
            capabilities: [
                t('Mutual & contested divorce representation'),
                t('Complex marital property division'),
                t('Will drafting & estate probate execution'),
                t('Child custody & spousal support negotiation')
            ],
            details: t('Protecting your personal rights and family assets with discretion, sensitivity, and strict adherence to Marriage and Family Law regulations.'),
            leadAttorney: 'Luật sư Trần Thị Mai Hương'
        },
        {
            id: 'labor',
            icon: Briefcase,
            title: t('Labor & Commercial Contracts'),
            badge: t('Employment & Contracts'),
            description: t('Drafting commercial agreements, non-compete clauses, and resolving employment termination disputes.'),
            capabilities: [
                t('Employment contract & NDA/NCA drafting'),
                t('Unlawful dismissal & severance disputes'),
                t('Internal labor rules & compliance audits'),
                t('Commercial contract review & negotiation')
            ],
            details: t('Helping corporate HR departments and senior executives mitigate employment liability and negotiate binding commercial contracts.'),
            leadAttorney: 'Luật sư Nguyễn Văn Toàn'
        },
        {
            id: 'ip_fdi',
            icon: ShieldCheck,
            title: t('IP & Foreign Investment'),
            badge: t('IP & International'),
            description: t('Trademark registration, copyright enforcement, and market entry consulting for multinational corporations.'),
            capabilities: [
                t('Trademark, brand & patent registration'),
                t('IP infringement warning letters & litigation'),
                t('Cross-border technology transfer agreements'),
                t('Foreign contractor tax & regulatory filings')
            ],
            details: t('Safeguarding corporate intellectual property assets and guiding international businesses through seamless market entry into Southeast Asia.'),
            leadAttorney: 'Luật sư Nguyễn Cao Trí'
        }
    ];

    return (
        <section id="practice-areas" className="py-16 sm:py-20 bg-white dark:bg-gray-900 border-t border-b border-gray-200/60 dark:border-gray-800 transition-colors overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-14">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 mb-4 border border-blue-200 dark:border-blue-800">
                        <Scale className="w-3.5 h-3.5" />
                        <span>{t('Practice Areas')}</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                        {t('Core Legal Services & Practice Areas')}
                    </h2>
                    <p className="mt-4 text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                        {t('Comprehensive legal solutions tailored for corporate clients, investors, and individuals by senior trial attorneys.')}
                    </p>
                </div>

                {/* Grid of 6 Practice Areas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {practiceAreas.map((area) => {
                        const IconComponent = area.icon;
                        return (
                            <div
                                key={area.id}
                                onClick={() => setSelectedArea(area)}
                                className="group relative bg-gray-50/80 dark:bg-gray-800/80 rounded-2xl p-7 border border-gray-200/80 dark:border-gray-700/80 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/80 transition-all duration-300">
                                            <IconComponent className="w-6 h-6 text-primary shrink-0" />
                                        </div>
                                        <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-100/70 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                                            {area.badge}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary transition-colors">
                                        {area.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3 mb-6">
                                        {area.description}
                                    </p>

                                    {/* Capabilities Checklist */}
                                    <ul className="space-y-2 mb-6">
                                        {area.capabilities.slice(0, 3).map((cap, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                                <span className="line-clamp-1">{cap}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="pt-4 border-t border-gray-200/60 dark:border-gray-700/60 flex items-center justify-between">
                                    <span className="text-xs font-semibold text-primary group-hover:translate-x-1 transition-transform flex items-center gap-1">
                                        {t('View Service Details')}
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Practice Area Detail Modal */}
            {selectedArea && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-gray-200 dark:border-gray-800">
                        {/* Modal Header */}
                        <div className="p-6 sm:p-8 bg-gradient-to-r from-blue-600 via-primary to-blue-700 text-white relative">
                            <button
                                onClick={() => setSelectedArea(null)}
                                className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-3 backdrop-blur-md">
                                {selectedArea.badge}
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                                {selectedArea.title}
                            </h2>
                            <p className="text-xs sm:text-sm text-blue-100 mt-2">
                                {t('Lead Counsel')}: <span className="font-semibold text-white">{t(selectedArea.leadAttorney)}</span>
                            </p>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
                            <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-blue-900 dark:text-blue-200 text-sm leading-relaxed">
                                {selectedArea.details}
                            </div>

                            <div>
                                <h4 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white mb-3">
                                    {t('Key Legal Capabilities & Services')}
                                </h4>
                                <ul className="space-y-3">
                                    {selectedArea.capabilities.map((cap, idx) => (
                                        <li key={idx} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                            <span>{cap}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 px-6 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-4">
                            <button
                                onClick={() => setSelectedArea(null)}
                                className="px-5 py-2.5 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs sm:text-sm font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            >
                                {t('Close')}
                            </button>
                            <a
                                href="#contact"
                                onClick={() => setSelectedArea(null)}
                                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-blue-600 text-white text-xs sm:text-sm font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all"
                            >
                                <PhoneCall className="w-4 h-4" />
                                <span>{t('Request Consultation')}</span>
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
