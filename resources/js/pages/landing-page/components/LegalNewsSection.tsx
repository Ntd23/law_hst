import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Newspaper, Calendar, Clock, ArrowRight, ChevronLeft, ChevronRight, X, Tag } from 'lucide-react';

interface Article {
    id: number;
    title: string;
    category: string;
    date: string;
    readTime: string;
    author: {
        name: string;
        role: string;
        avatar: string;
    };
    image: string;
    summary: string;
    content: string[];
    tags: string[];
}

interface LegalNewsSectionProps {
    brandColor?: string;
}

export default function LegalNewsSection({ brandColor = '#3b82f6' }: LegalNewsSectionProps) {
    const { t } = useTranslation();
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [activeArticle, setActiveArticle] = useState<Article | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [itemsPerPage, setItemsPerPage] = useState(3);

    // Responsive items per page detection
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 640) {
                setItemsPerPage(1);
            } else if (window.innerWidth < 1024) {
                setItemsPerPage(2);
            } else {
                setItemsPerPage(3);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const categories = [
        { key: 'all', label: t('All News') },
        { key: 'corporate', label: t('Corporate Law') },
        { key: 'real_estate', label: t('Real Estate') },
        { key: 'litigation', label: t('Litigation & Defense') },
        { key: 'tax_finance', label: t('Tax & Finance') },
    ];

    const articles: Article[] = [
        {
            id: 1,
            title: t('Highlights of the Land Law 2024: Essential Impacts on Enterprises & Investors'),
            category: 'real_estate',
            date: '15/08/2026',
            readTime: t('6 min read'),
            author: {
                name: 'Luật sư Nguyễn Văn Toàn',
                role: t('Senior Partner'),
                avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200'
            },
            image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800',
            summary: t('An in-depth guide to key modifications in Land Law 2024 including land valuation frameworks, lease terms, and project investment procedures.'),
            content: [
                t('The newly enacted Land Law 2024 introduces landmark reformations affecting corporate land allocation, lease payment structures, and project clearance procedures.'),
                t('One of the most noteworthy amendments is the removal of the government land price frame, transitioning to annual market-aligned land price lists.'),
                t('Investors and corporate landowners must proactively audit existing land use right certificates (LURC) and align project timelines with the updated regulations.')
            ],
            tags: [t('Land Law'), t('Real Estate'), t('Investment')]
        },
        {
            id: 2,
            title: t('M&A Legal Due Diligence: 5 Critical Risks Every Foreign Investor Must Mitigate'),
            category: 'corporate',
            date: '12/08/2026',
            readTime: t('5 min read'),
            author: {
                name: 'Luật sư Nguyễn Cao Trí',
                role: t('M&A Specialist'),
                avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200'
            },
            image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=600',
            summary: t('Legal risk assessment in cross-border mergers and acquisitions, focusing on tax liabilities, labor compliance, and IP ownership.'),
            content: [
                t('Navigating M&A transactions in Vietnam demands meticulous legal due diligence to uncover hidden financial liabilities and regulatory non-compliance.'),
                t('Key audit domains include employment contracts, tax arrears, environmental permits, and clear intellectual property title transfer.')
            ],
            tags: [t('Corporate Law'), t('M&A'), t('Cross-border')]
        },
        {
            id: 3,
            title: t('Defending White-Collar & Economic Offenses: Tactical Legal Guidance'),
            category: 'litigation',
            date: '09/08/2026',
            readTime: t('7 min read'),
            author: {
                name: 'Luật sư Nguyễn Hồng Lĩnh',
                role: t('Litigation Head'),
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
            },
            image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=600',
            summary: t('Key procedural rights, investigation protocols, and defense strategies in high-profile corporate criminal proceedings.'),
            content: [
                t('Corporate criminal defense requires immediate intervention during the preliminary investigation phase to safeguard constitutional rights.'),
                t('Defense counsel plays a critical role in preserving documentation, verifying accounting evidence, and mitigating personal asset freeze risk.')
            ],
            tags: [t('Criminal Defense'), t('Corporate Risk'), t('Litigation')]
        },
        {
            id: 4,
            title: t('New Tax Compliance Regulations for E-Commerce & Tech Companies'),
            category: 'tax_finance',
            date: '05/08/2026',
            readTime: t('4 min read'),
            author: {
                name: 'Luật sư Trần Thị Mai Hương',
                role: t('Tax & Financial Advisor'),
                avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'
            },
            image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=600',
            summary: t('Comprehensive analysis of digital tax withholding obligations, transfer pricing rules, and cross-border SaaS tax filings.'),
            content: [
                t('Tax authorities are tightening oversight on e-commerce platforms and digital service providers operating in Southeast Asia.'),
                t('Businesses must review their tax declarations, transfer pricing documentation, and foreign contractor tax (FCT) compliance.')
            ],
            tags: [t('Tax Law'), t('E-Commerce'), t('Fintech')]
        },
        {
            id: 5,
            title: t('Navigating Labor Disputes & Termination Protocols Under Revised Labor Code'),
            category: 'corporate',
            date: '01/08/2026',
            readTime: t('5 min read'),
            author: {
                name: 'Luật sư Nguyễn Văn Toàn',
                role: t('Senior Partner'),
                avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200'
            },
            image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80&w=600',
            summary: t('Essential guidance on employee termination, severance payments, and resolving collective labor disputes peacefully.'),
            content: [
                t('Employer compliance with statutory termination grounds and notice periods is mandatory to prevent unlawful dismissal claims.'),
                t('Proper documentation of performance metrics and disciplinary proceedings safeguards corporate reputation.')
            ],
            tags: [t('Labor Law'), t('Employment'), t('Compliance')]
        }
    ];

    const filteredArticles = selectedCategory === 'all' 
        ? articles 
        : articles.filter(a => a.category === selectedCategory);

    const maxIndex = Math.max(0, filteredArticles.length - itemsPerPage);

    // Reset slide index when changing category
    useEffect(() => {
        setCurrentIndex(0);
    }, [selectedCategory]);

    // Auto-scroll to the right every 3.5 seconds
    useEffect(() => {
        if (isHovered || maxIndex === 0) return;

        const timer = setInterval(() => {
            setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
        }, 3500);

        return () => clearInterval(timer);
    }, [isHovered, maxIndex]);

    const handlePrev = () => {
        setCurrentIndex(prev => (prev <= 0 ? maxIndex : prev - 1));
    };

    const handleNext = () => {
        setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
    };

    return (
        <section id="legal-news" className="pt-16 pb-8 bg-gray-50 dark:bg-gray-900/50 border-t border-b border-gray-200/60 dark:border-gray-800 transition-colors overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="mb-10 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        <Newspaper className="w-3.5 h-3.5" />
                        <span>{t('Legal News & Insights')}</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight w-full">
                        {t('Stay Informed With Latest Legal Updates')}
                    </h2>
                    <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed w-full">
                        {t('Explore expert commentary, legislative updates, and comprehensive guides curated by top attorneys.')}
                    </p>

                    {/* Category Filter Tabs & Navigation Arrows in 1 Row Under Description */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-3">
                        {/* Category Pills in 1 horizontal row */}
                        <div className="flex flex-wrap items-center gap-2">
                            {categories.map(cat => (
                                <button
                                    key={cat.key}
                                    onClick={() => setSelectedCategory(cat.key)}
                                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                                        selectedCategory === cat.key
                                            ? 'bg-primary text-white shadow-md shadow-primary/25'
                                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>

                        {/* Navigation Arrows */}
                        {filteredArticles.length > itemsPerPage && (
                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                <button
                                    onClick={handlePrev}
                                    aria-label="Previous articles"
                                    className="p-2.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-primary hover:text-white hover:border-primary dark:hover:bg-primary dark:hover:border-primary transition-all duration-200 shadow-sm cursor-pointer"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={handleNext}
                                    aria-label="Next articles"
                                    className="p-2.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-primary hover:text-white hover:border-primary dark:hover:bg-primary dark:hover:border-primary transition-all duration-200 shadow-sm cursor-pointer"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* 1-Row Auto-Sliding Carousel Container */}
                <div 
                    className="relative overflow-hidden"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <div 
                        className="flex transition-transform duration-700 ease-in-out gap-6"
                        style={{
                            transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)`
                        }}
                    >
                        {filteredArticles.map(article => (
                            <div
                                key={article.id}
                                onClick={() => setActiveArticle(article)}
                                style={{
                                    width: `calc(${100 / itemsPerPage}% - ${(24 * (itemsPerPage - 1)) / itemsPerPage}px)`
                                }}
                                className="flex-shrink-0 group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200/80 dark:border-gray-700/80 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                            >
                                <div>
                                    <div className="relative overflow-hidden aspect-[16/10]">
                                        <img
                                            src={article.image}
                                            alt={article.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute top-3 left-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md text-primary text-[11px] font-semibold px-2.5 py-1 rounded-md shadow-sm border border-white/20">
                                            {categories.find(c => c.key === article.category)?.label}
                                        </div>
                                    </div>

                                    <div className="p-5 sm:p-6">
                                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-3">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5 text-primary" />
                                                {article.date}
                                            </span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5 text-primary" />
                                                {article.readTime}
                                            </span>
                                        </div>
                                        <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                                            {article.title}
                                        </h3>
                                        <p className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed">
                                            {article.summary}
                                        </p>
                                    </div>
                                </div>

                                <div className="px-5 sm:px-6 pb-5 pt-3 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <img 
                                            src={article.author.avatar} 
                                            alt={article.author.name}
                                            className="w-7 h-7 rounded-full object-cover ring-1 ring-gray-200 dark:ring-gray-700"
                                        />
                                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate max-w-[120px]">
                                            {article.author.name}
                                        </span>
                                    </div>
                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:translate-x-1 transition-transform">
                                        {t('Read')}
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pagination Dots */}
                {maxIndex > 0 && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                        {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`h-2 rounded-full transition-all duration-300 ${
                                    currentIndex === idx
                                        ? 'w-7 bg-primary'
                                        : 'w-2 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600'
                                }`}
                                aria-label={`Go to slide ${idx + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Article Reading Modal */}
            {activeArticle && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="relative w-full max-w-3xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-gray-200 dark:border-gray-800">
                        {/* Modal Header */}
                        <div className="relative aspect-[21/9] overflow-hidden">
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
                                <span className="inline-block px-2.5 py-1 rounded bg-primary text-white text-xs font-bold uppercase tracking-wider mb-2">
                                    {categories.find(c => c.key === activeArticle.category)?.label}
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
                                        src={activeArticle.author.avatar} 
                                        alt={activeArticle.author.name}
                                        className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20"
                                    />
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white">{activeArticle.author.name}</p>
                                        <p className="text-xs text-gray-500">{activeArticle.author.role}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4 text-primary" />
                                        {activeArticle.date}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Clock className="w-4 h-4 text-primary" />
                                        {activeArticle.readTime}
                                    </span>
                                </div>
                            </div>

                            {/* Summary Box */}
                            <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-blue-900 dark:text-blue-200 text-sm italic leading-relaxed">
                                "{activeArticle.summary}"
                            </div>

                            {/* Paragraphs */}
                            <div className="space-y-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                                {activeArticle.content.map((paragraph, idx) => (
                                    <p key={idx}>{paragraph}</p>
                                ))}
                            </div>

                            {/* Tags */}
                            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2 flex-wrap">
                                <Tag className="w-4 h-4 text-gray-400" />
                                {activeArticle.tags.map((tag, idx) => (
                                    <span key={idx} className="px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-300">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 px-6 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                            <button
                                onClick={() => setActiveArticle(null)}
                                className="px-5 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs sm:text-sm font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            >
                                {t('Close')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
