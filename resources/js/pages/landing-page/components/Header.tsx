import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useBrand } from '@/contexts/BrandContext';
import { getImagePath, isUserRegistrationEnabled } from '@/utils/helpers';
import { LanguageSwitcher } from '@/components/language-switcher';

interface CustomPage {
    id: number;
    title: string;
    slug: string;
}

interface HeaderProps {
    brandColor?: string;
    settings: {
        company_name: string;
        config_sections: {
            theme: {
                logo_dark: string;
                logo_light: string;
            };
        };
    };
    sectionData?: any;
    customPages?: CustomPage[];
}

export default function Header({ settings, sectionData, customPages = [], brandColor = '#3b82f6' }: HeaderProps) {
    const { t } = useTranslation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [imgError, setImgError] = useState(false);
    const { auth } = usePage().props as any;
    const { logoLight, logoDark, logoSize, enableHeaderLogo, titleText } = useBrand();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Filter out "FAQ" and "Refund Policy"
    const filteredPages = customPages.filter(page => {
        const slug = (page.slug || '').toLowerCase();
        const title = (page.title || '').toLowerCase();
        return !['faq', 'refund-policy', 'refund'].includes(slug) &&
               !title.includes('faq') &&
               !title.includes('refund') &&
               !title.includes('câu hỏi thường gặp') &&
               !title.includes('chính sách hoàn tiền');
    });

    const menuItems = filteredPages.map(page => ({
        name: page.title,
        href: route('custom-page.show', page.slug)
    }));

    const isTransparent = sectionData?.transparent;
    const backgroundColor = sectionData?.background_color || '#ffffff';
    const textColor = sectionData?.text_color || '#1f2937';
    const buttonStyle = sectionData?.button_style || 'solid';

    const getHeaderClasses = () => {
        if (isTransparent) {
            return isScrolled
                ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-md border-b border-gray-200/80 dark:border-gray-800'
                : 'bg-transparent';
        }
        return isScrolled
            ? 'shadow-md border-b border-gray-200/80 dark:border-gray-800'
            : 'border-b border-gray-100 dark:border-gray-800/60';
    };

    const getHeaderStyle = () => {
        if (isTransparent) return {};
        return { backgroundColor };
    };

    const getButtonStyles = () => {
        if (buttonStyle === 'outline') {
            return {
                default: { backgroundColor: 'transparent', color: brandColor, borderColor: brandColor },
                hover: { backgroundColor: brandColor, color: 'white' },
                hoverLeave: { backgroundColor: 'transparent', color: brandColor }
            };
        }
        if (buttonStyle === 'gradient') {
            return {
                default: { background: `linear-gradient(120deg, ${brandColor} 50%, #ffffff 100%)`, color: 'white', borderColor: brandColor },
                hover: { background: `linear-gradient(120deg, #ffffff 50%, ${brandColor} 100%)`, color: brandColor },
                hoverLeave: { background: `linear-gradient(120deg, ${brandColor} 50%, #ffffff 100%)`, color: 'white' }
            };
        }
        // solid
        return {
            default: { backgroundColor: brandColor, color: 'white', borderColor: brandColor },
            hover: { backgroundColor: 'white', color: brandColor },
            hoverLeave: { backgroundColor: brandColor, color: 'white' }
        };
    };

    const btnStyles = getButtonStyles();

    return (
        <header
            className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${getHeaderClasses()}`}
            style={getHeaderStyle()}
        >
            <div className="max-w-[92rem] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20 gap-6">
                    {/* Left: Brand Logo */}
                    <div className="flex-shrink-0">
                        <Link
                            href={route("home")}
                            className="text-2xl font-bold flex items-center group"
                        >
                            {(() => {
                                const isLogoEnabled = enableHeaderLogo !== false;
                                const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
                                
                                const validBrandLogo = [isDark ? logoLight : logoDark, isDark ? logoDark : logoLight, logoLight, logoDark].find(
                                    l => l && !l.includes('logos/logo-light.png') && !l.includes('logos/logo-dark.png')
                                );
                                const fallbackLogo = isDark 
                                    ? (settings?.config_sections?.theme?.logo_light || settings?.config_sections?.theme?.logo_dark) 
                                    : (settings?.config_sections?.theme?.logo_dark || settings?.config_sections?.theme?.logo_light);
                                const validFallback = fallbackLogo && !fallbackLogo.includes('logos/logo-light.png') && !fallbackLogo.includes('logos/logo-dark.png')
                                    ? fallbackLogo
                                    : null;

                                const logoSrc = validBrandLogo || validFallback || (isDark ? (logoLight || logoDark) : (logoDark || logoLight)) || fallbackLogo;
                                const displayUrl = isLogoEnabled && logoSrc ? getImagePath(logoSrc) : '';

                                return displayUrl && !imgError ? (
                                    <img
                                        key={`${logoSrc}-${logoSize}`}
                                        src={displayUrl}
                                        alt={titleText || settings?.company_name || "Logo"}
                                        style={{ height: `${Math.max(logoSize || 42, 42)}px`, width: 'auto' }}
                                        className="transition-transform duration-200 group-hover:scale-105 object-contain max-h-[85px]"
                                        onError={() => setImgError(true)}
                                    />
                                ) : (
                                    <div className="h-12 text-gray-900 dark:text-white font-extrabold flex items-center text-xl tracking-tight">
                                        {titleText || settings?.company_name || 'Văn Phòng Luật'}
                                    </div>
                                );
                            })()}
                        </Link>
                    </div>

                    {/* Center: Balanced, Larger Desktop Navigation Menu */}
                    <nav 
                        className="hidden md:flex flex-1 justify-center items-center gap-6 lg:gap-8 whitespace-nowrap" 
                        role="navigation" 
                        aria-label="Main navigation"
                    >
                        <Link
                            href={route('home')}
                            className="text-base font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 hover:bg-gray-100/70 dark:hover:bg-gray-800/70 relative group whitespace-nowrap"
                            style={{ color: textColor }}
                            onMouseEnter={(e) => e.currentTarget.style.color = brandColor}
                            onMouseLeave={(e) => e.currentTarget.style.color = textColor}
                        >
                            {t("Home")}
                            <span
                                className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
                                style={{ backgroundColor: brandColor }}
                            ></span>
                        </Link>

                        {menuItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="text-base font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 hover:bg-gray-100/70 dark:hover:bg-gray-800/70 relative group whitespace-nowrap"
                                style={{ color: textColor }}
                                onMouseEnter={(e) => e.currentTarget.style.color = brandColor}
                                onMouseLeave={(e) => e.currentTarget.style.color = textColor}
                            >
                                {t(item.name)}
                                <span
                                    className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
                                    style={{ backgroundColor: brandColor }}
                                ></span>
                            </Link>
                        ))}
                    </nav>

                    {/* Right: Auth Action Buttons & Language Switcher */}
                    <div className="hidden md:flex items-center gap-4 flex-shrink-0 whitespace-nowrap">
                        <LanguageSwitcher />
                        
                        {!auth?.user ? (
                            <>
                                <Link
                                    href={route('login')}
                                    className="text-base font-semibold px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap"
                                    style={{ color: textColor }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = brandColor}
                                    onMouseLeave={(e) => e.currentTarget.style.color = textColor}
                                >
                                    {t("Login")}
                                </Link>
                                {isUserRegistrationEnabled() && (
                                    <Link
                                        href={route('register')}
                                        className="px-6 py-2.5 rounded-xl text-base font-bold transition-all shadow-sm hover:shadow-md border whitespace-nowrap"
                                        style={btnStyles.default}
                                        onMouseEnter={(e) => { Object.assign(e.currentTarget.style, btnStyles.hover); }}
                                        onMouseLeave={(e) => { Object.assign(e.currentTarget.style, btnStyles.hoverLeave); }}
                                    >
                                        {t("Get Started")}
                                    </Link>
                                )}
                            </>
                        ) : (
                            <Link
                                href={route('dashboard')}
                                className="px-6 py-2.5 rounded-xl text-base font-bold transition-all shadow-sm hover:shadow-md border whitespace-nowrap"
                                style={btnStyles.default}
                                onMouseEnter={(e) => { Object.assign(e.currentTarget.style, btnStyles.hover); }}
                                onMouseLeave={(e) => { Object.assign(e.currentTarget.style, btnStyles.hoverLeave); }}
                            >
                                {t("Dashboard")}
                            </Link>
                        )}
                    </div>

                    {/* Mobile menu toggle */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
                            style={{ color: textColor }}
                            aria-label={isMenuOpen ? t('Close navigation menu') : t('Open navigation menu')}
                            aria-expanded={isMenuOpen}
                            aria-controls="mobile-menu"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation Dropdown */}
                {isMenuOpen && (
                    <div className="md:hidden border-t border-gray-200 dark:border-gray-800" id="mobile-menu">
                        <div
                            className="px-5 py-6 space-y-4"
                            style={isTransparent ? { backgroundColor: 'white' } : { backgroundColor }}
                        >
                            <Link
                                href={route('home')}
                                className="block text-lg font-bold transition-colors py-1"
                                style={{ color: textColor }}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {t("Home")}
                            </Link>
                            {menuItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="block text-lg font-bold transition-colors py-1"
                                    style={{ color: textColor }}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {t(item.name)}
                                </Link>
                            ))}
                            <div className="pt-4 space-y-3 border-t border-gray-200 dark:border-gray-800">
                                <div className="flex justify-center pb-2">
                                    <LanguageSwitcher />
                                </div>
                                {!auth?.user ? (
                                    <>
                                        <Link
                                            href={route('login')}
                                            className="block w-full text-center py-3 text-base font-semibold transition-colors"
                                            style={{ color: textColor }}
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            {t("Login")}
                                        </Link>
                                        <Link
                                            href={route('register')}
                                            className="block w-full text-center py-3 rounded-xl text-base font-bold transition-colors border shadow-sm"
                                            style={btnStyles.default}
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            {t("Get Started")}
                                        </Link>
                                    </>
                                ) : (
                                    <Link
                                        href={route('dashboard')}
                                        className="block w-full text-center py-3 rounded-xl text-base font-bold transition-colors border shadow-sm"
                                        style={btnStyles.default}
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        {t("Dashboard")}
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
