import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getImagePath } from '@/utils/helpers';
import { useBrand } from '@/contexts/BrandContext';
import { toast } from '@/components/custom-toast';

interface FooterProps {
    brandColor?: string;
    settings: {
        company_name: string;
        contact_email: string;
        contact_phone: string;
        contact_address: string;
        footerText?: string;
        config_sections:
        {
            theme: {
                logo_dark: string;
                logo_light: string;
            },
            brand: {
                footerText: string;
            }
        }
    };
    sectionData?: {
        description?: string;
        newsletter_title?: string;
        newsletter_subtitle?: string;
        links?: any;
        footerText?: string;
        social_links?: Array<{
            name: string;
            icon: string;
            href: string;
        }>;
        section_titles?: {
            product: string;
            company: string;
            support: string;
            legal: string;
        };
    };
}

export default function Footer({ settings, sectionData = {}, brandColor = '#3b82f6' }: FooterProps) {
    const currentYear = new Date().getFullYear();
    const { t } = useTranslation();
    const { data, setData, post, processing, errors, reset } = useForm({
        email: ''
    });
    const brand = useBrand();
    const {
        logoLight,
        logoDark,
        logoFooter,
        logoSize,
        enableFooterLogo,
        footerCompanyName,
        footerDescription,
        footerContactEmail,
        footerContactPhone,
        footerContactAddress,
        footerSocialFacebook,
        footerSocialTwitter,
        footerSocialLinkedin,
        footerSocialInstagram,
        footerProductTitle,
        footerCompanyTitle,
        footerSupportTitle,
        footerLegalTitle,
        footerProductLinks,
        footerCompanyLinks,
        footerSupportLinks,
        footerLegalLinks,
        footerText: brandFooterText
    } = (brand || {}) as any;

    const parseLinks = (linksRaw: string | undefined, defaultLinks: Array<{ name: string; href: string }>) => {
        if (!linksRaw || !linksRaw.trim()) return defaultLinks;
        try {
            if (linksRaw.trim().startsWith('[')) {
                const parsed = JSON.parse(linksRaw);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch (e) {
            // Not JSON, fallback to line-separated
        }

        const lines = linksRaw.split('\n').map(l => l.trim()).filter(Boolean);
        if (lines.length === 0) return defaultLinks;

        return lines.map(line => {
            if (line.includes('|')) {
                const [name, href] = line.split('|').map(s => s.trim());
                return { name: name || href, href: href || '#' };
            }
            return { name: line, href: '#' };
        });
    };

    const defaultLinks = {
        product: [
            { name: t('Features'), href: '#features' },
            { name: t('Pricing'), href: '#pricing' },
            { name: t('Templates'), href: '#' },
            { name: t('Integrations'), href: '#' }
        ],
        company: [
            { name: t('Home'), href: '/' },
            { name: t('About Us'), href: '#about' },
            { name: t('Careers'), href: '#' },
            { name: t('Press'), href: '#' },
            { name: t('Contact'), href: '#contact' }
        ],
        support: [
            { name: t('Help Center'), href: '#' },
            { name: t('Documentation'), href: '#' },
            { name: t('API Reference'), href: '#' },
            { name: t('Status'), href: '#' }
        ],
        legal: [
            { name: t('Privacy Policy'), href: '#' },
            { name: t('Terms of Service'), href: '#' },
            { name: t('Cookie Policy'), href: '#' },
            { name: t('GDPR'), href: '#' }
        ]
    };

    const footerLinks = {
        product: parseLinks(footerProductLinks, sectionData.links?.product || defaultLinks.product),
        company: parseLinks(footerCompanyLinks, sectionData.links?.company || defaultLinks.company),
        support: parseLinks(footerSupportLinks, sectionData.links?.support || defaultLinks.support),
        legal: parseLinks(footerLegalLinks, sectionData.links?.legal || defaultLinks.legal),
    };

    const iconMap: Record<string, any> = {
        Facebook,
        Twitter,
        Linkedin,
        Instagram
    };

    const socialLinks = (() => {
        const customSocial: Array<{ name: string; icon: string; href: string }> = [];
        if (footerSocialFacebook) customSocial.push({ name: 'Facebook', icon: 'Facebook', href: footerSocialFacebook });
        if (footerSocialTwitter) customSocial.push({ name: 'Twitter', icon: 'Twitter', href: footerSocialTwitter });
        if (footerSocialLinkedin) customSocial.push({ name: 'LinkedIn', icon: 'Linkedin', href: footerSocialLinkedin });
        if (footerSocialInstagram) customSocial.push({ name: 'Instagram', icon: 'Instagram', href: footerSocialInstagram });

        if (customSocial.length > 0) return customSocial;
        return sectionData.social_links || [
            { name: 'Facebook', icon: 'Facebook', href: '#' },
            { name: 'Twitter', icon: 'Twitter', href: '#' },
            { name: 'LinkedIn', icon: 'Linkedin', href: '#' },
            { name: 'Instagram', icon: 'Instagram', href: '#' }
        ];
    })();

    const displayCompanyName = footerCompanyName || settings?.company_name || 'Văn Phòng Luật Sư Advocate & Partners';
    const displayDescription = footerDescription
        ? t(footerDescription)
        : (sectionData.description ? t(sectionData.description) : t('Transforming professional networking with innovative digital business cards. Connect, share, and grow your network effortlessly.'));
    const displayEmail = footerContactEmail || settings.contact_email;
    const displayPhone = footerContactPhone || settings.contact_phone;
    const displayAddress = footerContactAddress || settings.contact_address;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('landing-page.subscribe'), {
            preserveScroll: true,
            onSuccess: (page) => {
                reset();
                const success = page?.props?.flash?.success;
                const error = page?.props?.flash?.error;
                if (success) {
                    toast.success(success);
                }
                if (error) {
                    toast.error(error);
                }
            },
            onError: () => {
                toast.error(t('Please check your email and try again.'));
            }
        });
    };

    return (
        <footer className="bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Main Footer Content */}
                <div className="py-12 sm:py-16">
                    <div className="grid lg:grid-cols-6 gap-8 sm:gap-12">
                        {/* Company Info */}
                        <div className="lg:col-span-2">
                            <Link href="/" className="text-2xl font-bold mb-4 inline-block">
                                {(() => {
                                    const isLogoEnabled = enableFooterLogo !== false;
                                    const fallbackLogo = settings?.config_sections?.theme?.logo_light || settings?.config_sections?.theme?.logo_dark;
                                    const validBrandLogo = [logoFooter, logoLight, logoDark].find(l => l && !l.includes('logos/logo-light.png') && !l.includes('logos/logo-dark.png'));
                                    const logoSrc = fallbackLogo || validBrandLogo || logoFooter || logoLight || logoDark;
                                    const displayUrl = isLogoEnabled && logoSrc ? getImagePath(logoSrc) : '';

                                    return displayUrl ? (
                                        <img
                                            key={`${logoSrc}-${logoSize}`}
                                            src={displayUrl}
                                            alt={t(displayCompanyName) || 'Logo'}
                                            style={{ height: `${logoSize || 42}px`, width: 'auto' }}
                                            className="transition-all duration-200 object-contain max-h-[85px]"
                                        />
                                    ) : (
                                        <div className="h-12 text-inherit font-extrabold flex items-center text-lg tracking-tight">
                                            {t(displayCompanyName)}
                                        </div>
                                    );
                                })()}
                            </Link>
                            <p className="text-gray-400 mb-8 leading-relaxed">
                                {t(displayDescription)}
                            </p>

                            {/* Contact Info */}
                            <div className="space-y-3">
                                {displayEmail && (
                                    <div className="flex items-center gap-3">
                                        <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                                        <span className="text-gray-400 text-sm break-all">{displayEmail}</span>
                                    </div>
                                )}
                                {displayPhone && (
                                    <div className="flex items-center gap-3">
                                        <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                                        <span className="text-gray-400 text-sm">{displayPhone}</span>
                                    </div>
                                )}
                                {displayAddress && (
                                    <div className="flex items-center gap-3">
                                        <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                                        <span className="text-gray-400 text-sm">{t(displayAddress)}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Product Links */}
                        <div>
                            <h3 className="text-white font-semibold mb-4">
                                {t(footerProductTitle || sectionData.section_titles?.product || 'Product')}
                            </h3>
                            <ul className="space-y-3">
                                {(footerLinks.product || []).map((link, idx) => (
                                    <li key={`${link.name}-${idx}`}>
                                        <a
                                            href={link.href}
                                            className="text-gray-400 hover:text-white transition-colors text-sm"
                                        >
                                            {t(link.name)}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Company Links */}
                        <div>
                            <h3 className="text-white font-semibold mb-4">
                                {t(footerCompanyTitle || sectionData.section_titles?.company || 'Company')}
                            </h3>
                            <ul className="space-y-3">
                                {(footerLinks.company || []).map((link, idx) => (
                                    <li key={`${link.name}-${idx}`}>
                                        <a
                                            href={link.href}
                                            className="text-gray-400 hover:text-white transition-colors text-sm"
                                        >
                                            {t(link.name)}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Support Links */}
                        <div>
                            <h3 className="text-white font-semibold mb-4">
                                {t(footerSupportTitle || sectionData.section_titles?.support || 'Support')}
                            </h3>
                            <ul className="space-y-3">
                                {(footerLinks.support || []).map((link, idx) => (
                                    <li key={`${link.name}-${idx}`}>
                                        <a
                                            href={link.href}
                                            className="text-gray-400 hover:text-white transition-colors text-sm"
                                        >
                                            {t(link.name)}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Legal Links */}
                        <div>
                            <h3 className="text-white font-semibold mb-4">
                                {t(footerLegalTitle || sectionData.section_titles?.legal || 'Legal')}
                            </h3>
                            <ul className="space-y-3">
                                {(footerLinks.legal || []).map((link, idx) => (
                                    <li key={`${link.name}-${idx}`}>
                                        <a
                                            href={link.href}
                                            className="text-gray-400 hover:text-white transition-colors text-sm"
                                        >
                                            {t(link.name)}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Newsletter Section */}
                {(sectionData.newsletter_title || sectionData.newsletter_subtitle) && (
                    <div className="border-t border-gray-800 py-8 sm:py-12">
                        <div className="text-center max-w-2xl mx-auto">
                            <h3 className="text-xl font-bold text-white mb-4">
                                {t(sectionData.newsletter_title || 'Stay Updated with Our Latest Features')}
                            </h3>
                            <p className="text-gray-400 mb-6">
                                {t(sectionData.newsletter_subtitle || 'Join our newsletter for product updates and networking tips')}
                            </p>
                            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                                <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder={t('Enter your email')}
                                        className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-gray-600 focus:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                        required
                                        disabled={processing}
                                        aria-label={t('Email address for newsletter subscription')}
                                        aria-describedby="newsletter-description"
                                    />
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="text-white px-6 py-3 rounded-lg transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[120px] cursor-pointer"
                                        style={{ backgroundColor: brandColor }}
                                        aria-label={processing ? t('Subscribing to newsletter') : t('Subscribe to newsletter')}
                                    >
                                        {processing && (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        )}
                                        {processing ? t('Subscribing...') : t('Subscribe')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Bottom Footer */}
                <div className="border-t border-gray-800 py-4 sm:py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4">
                        {/* Copyright */}
                        {(() => {
                            const displayFooterText = brandFooterText
                                || sectionData.footerText
                                || settings?.config_sections?.brand?.footerText
                                || settings?.footerText
                                || '© 2026 Advocate & Partners. All rights reserved.';
                            return (
                                <div className="text-gray-400 text-sm">
                                    {t(displayFooterText)}
                                </div>
                            );
                        })()}

                        {/* Social Links */}
                        {socialLinks.length > 0 && (
                            <div className="flex items-center gap-4">
                                <span className="text-gray-400 text-sm">{t('Follow us:')}</span>
                                <div className="flex gap-3">
                                    {socialLinks.map((social) => {
                                        const IconComponent = iconMap[social.icon] || Facebook;
                                        return (
                                            <a
                                                key={social.name}
                                                href={social.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
                                                aria-label={social.name}
                                            >
                                                <IconComponent className="w-4 h-4 text-gray-400" />
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </footer>
    );
}
