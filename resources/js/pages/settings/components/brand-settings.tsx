import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ThemePreview } from '@/components/theme-preview';
import { useAppearance, type Appearance, type ThemeColor } from '@/hooks/use-appearance';
import { useLayout, type LayoutPosition } from '@/contexts/LayoutContext';
import { useSidebarSettings } from '@/contexts/SidebarContext';
import { useBrand } from '@/contexts/BrandContext';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/custom-toast';
import { Switch } from '@/components/ui/switch';
import { Palette, Save, Upload, Check, Layout, Moon, FileText, Sidebar as SidebarIcon, Image as ImageIcon, Link as LinkIcon, X, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram, Globe, PanelBottom, Shield } from 'lucide-react';
import { SettingsSection } from '@/components/settings-section';
import { SidebarPreview } from '@/components/sidebar-preview';
import MediaPicker from '@/components/MediaPicker';
import { useTranslation } from 'react-i18next';
import { usePage, router } from '@inertiajs/react';
import { getImagePath } from '@/utils/helpers';
import { setCookie, getCookie } from '@/utils/cookies';
import { Card, CardContent } from '@/components/ui/card';

// Define the brand settings interface
export interface BrandSettings {
    logoDark: string;
    logoLight: string;
    logoFooter?: string;
    favicon: string;
    logoSize: number;
    titleText: string;
    footerText: string;
    themeColor: ThemeColor;
    customColor: string;
    sidebarVariant: string;
    sidebarStyle: string;
    layoutDirection: LayoutPosition;
    themeMode: Appearance;
    bannerTitle?: string;
    bannerSubtitle?: string;
    bannerButtonText?: string;
    bannerButtonLink?: string;
    bannerImage?: string;
    bannerEnabled?: boolean;
    bannerLayout?: string;
    enableAdminLogo?: boolean;
    enableHeaderLogo?: boolean;
    enableFooterLogo?: boolean;

    // Footer Settings
    footerCompanyName?: string;
    footerDescription?: string;
    footerContactEmail?: string;
    footerContactPhone?: string;
    footerContactAddress?: string;
    footerSocialFacebook?: string;
    footerSocialTwitter?: string;
    footerSocialLinkedin?: string;
    footerSocialInstagram?: string;
    footerProductTitle?: string;
    footerCompanyTitle?: string;
    footerSupportTitle?: string;
    footerLegalTitle?: string;
    footerProductLinks?: string;
    footerCompanyLinks?: string;
    footerSupportLinks?: string;
    footerLegalLinks?: string;
}

// Default brand settings
export const DEFAULT_BRAND_SETTINGS: BrandSettings = {
    logoDark: '/storage/media/1/logo-van-phong-luat.png',
    logoLight: '/storage/media/1/logo-van-phong-luat.png',
    logoFooter: '/storage/media/1/logo-van-phong-luat.png',
    favicon: '/storage/media/logos/favicon.png',
    logoSize: 42,
    titleText: 'Văn Phòng Luật Sư',
    footerText: '© 2026 Advocate & Partners. All rights reserved.',
    themeColor: 'green',
    customColor: '#10b77f',
    sidebarVariant: 'inset',
    sidebarStyle: 'plain',
    layoutDirection: 'left',
    themeMode: 'light',
    bannerTitle: 'Giải Pháp Quản Lý Văn Phòng Luật Toàn Diện',
    bannerSubtitle: 'Tối ưu hóa quản lý vụ án, hợp đồng, lịch hẹn và khách hàng cho văn phòng luật hiện đại.',
    bannerButtonText: 'Khám Phá Ngay',
    bannerButtonLink: '/plans',
    bannerImage: '',
    bannerEnabled: true,
    bannerLayout: 'split-right',
    enableAdminLogo: true,
    enableHeaderLogo: true,
    enableFooterLogo: true,

    // Footer defaults
    footerCompanyName: 'Văn Phòng Luật Sư Advocate & Partners',
    footerDescription: 'Cung cấp giải pháp pháp lý toàn diện, bảo vệ quyền lợi tối đa cho cá nhân và doanh nghiệp.',
    footerContactEmail: 'contact@advocate-law.vn',
    footerContactPhone: '+84 (028) 3822 1234',
    footerContactAddress: 'Tầng 12, Tòa nhà Bitexco, Q.1, TP. Hồ Chí Minh',
    footerSocialFacebook: 'https://facebook.com',
    footerSocialTwitter: 'https://twitter.com',
    footerSocialLinkedin: 'https://linkedin.com',
    footerSocialInstagram: 'https://instagram.com',
    footerProductTitle: 'Dịch vụ & Sản phẩm',
    footerCompanyTitle: 'Về chúng tôi',
    footerSupportTitle: 'Hỗ trợ khách hàng',
    footerLegalTitle: 'Chính sách & Pháp lý',
    footerProductLinks: 'Tư vấn doanh nghiệp | #\nTranh tụng dân sự | #\nBảo hộ sở hữu trí tuệ | #\nLuật sư tranh chấp đất đai | #',
    footerCompanyLinks: 'Trang chủ | /\nLuật sư tư vấn | #about\nĐội ngũ luật sư | #team\nLiên hệ | #contact',
    footerSupportLinks: 'Trung tâm hỗ trợ | #\nTài liệu pháp lý | #\nĐặt lịch hẹn tư vấn | #\nTra cứu tiến độ vụ án | #',
    footerLegalLinks: 'Chính sách bảo mật | #\nĐiều khoản dịch vụ | #\nQuy tắc đạo đức nghề nghiệp | #\nCam kết chất lượng | #',
};

// Default logo paths for reset functionality
export const DEFAULT_LOGOS = {
    logoDark: '/storage/media/1/logo-van-phong-luat.png',
    logoLight: '/storage/media/1/logo-van-phong-luat.png',
    logoFooter: '/storage/media/1/logo-van-phong-luat.png',
    favicon: '/storage/media/logos/favicon.png',
};

// Get brand settings from props or cookies/localStorage as fallback
export const getBrandSettings = (userSettings?: Record<string, string>, globalSettings?: any): BrandSettings => {
    const isDemo = globalSettings?.is_demo || false;

    // In demo mode, prioritize cookies over backend settings
    if (isDemo) {
        try {
            const themeSettings = getCookie('themeSettings');
            const sidebarSettings = getCookie('sidebarSettings');
            const layoutPosition = getCookie('layoutDirection');
            const brandSettings = getCookie('brandSettings');

            const parsedTheme = themeSettings ? JSON.parse(themeSettings) : {};
            const parsedSidebar = sidebarSettings ? JSON.parse(sidebarSettings) : {};
            const parsedBrand = brandSettings ? JSON.parse(brandSettings) : {};

            return {
                logoDark: parsedBrand.logoDark || userSettings?.logoDark || DEFAULT_BRAND_SETTINGS.logoDark,
                logoLight: parsedBrand.logoLight || userSettings?.logoLight || DEFAULT_BRAND_SETTINGS.logoLight,
                logoFooter: parsedBrand.logoFooter || userSettings?.logoFooter || DEFAULT_BRAND_SETTINGS.logoFooter,
                favicon: parsedBrand.favicon || userSettings?.favicon || DEFAULT_BRAND_SETTINGS.favicon,
                logoSize: Number(parsedBrand.logoSize || userSettings?.logoSize || DEFAULT_BRAND_SETTINGS.logoSize),
                titleText: parsedBrand.titleText || userSettings?.titleText || DEFAULT_BRAND_SETTINGS.titleText,
                footerText: parsedBrand.footerText || userSettings?.footerText || DEFAULT_BRAND_SETTINGS.footerText,
                themeColor: parsedTheme.themeColor || (userSettings?.themeColor as ThemeColor) || DEFAULT_BRAND_SETTINGS.themeColor,
                customColor: parsedTheme.customColor || userSettings?.customColor || DEFAULT_BRAND_SETTINGS.customColor,
                sidebarVariant: parsedSidebar.variant || userSettings?.sidebarVariant || DEFAULT_BRAND_SETTINGS.sidebarVariant,
                sidebarStyle: parsedSidebar.style || userSettings?.sidebarStyle || DEFAULT_BRAND_SETTINGS.sidebarStyle,
                layoutDirection: layoutPosition || (userSettings?.layoutDirection as LayoutPosition) || DEFAULT_BRAND_SETTINGS.layoutDirection,
                themeMode: parsedTheme.appearance || (userSettings?.themeMode as Appearance) || DEFAULT_BRAND_SETTINGS.themeMode,
                bannerTitle: parsedBrand.bannerTitle || userSettings?.bannerTitle || DEFAULT_BRAND_SETTINGS.bannerTitle,
                bannerSubtitle: parsedBrand.bannerSubtitle || userSettings?.bannerSubtitle || DEFAULT_BRAND_SETTINGS.bannerSubtitle,
                bannerButtonText: parsedBrand.bannerButtonText || userSettings?.bannerButtonText || DEFAULT_BRAND_SETTINGS.bannerButtonText,
                bannerButtonLink: parsedBrand.bannerButtonLink || userSettings?.bannerButtonLink || DEFAULT_BRAND_SETTINGS.bannerButtonLink,
                bannerImage: parsedBrand.bannerImage || userSettings?.bannerImage || DEFAULT_BRAND_SETTINGS.bannerImage,
                bannerEnabled: parsedBrand.bannerEnabled !== undefined ? Boolean(parsedBrand.bannerEnabled) : (userSettings?.bannerEnabled !== undefined ? Boolean(userSettings.bannerEnabled) : DEFAULT_BRAND_SETTINGS.bannerEnabled),
                bannerLayout: parsedBrand.bannerLayout || userSettings?.bannerLayout || DEFAULT_BRAND_SETTINGS.bannerLayout,
                enableAdminLogo: parsedBrand.enableAdminLogo !== undefined ? Boolean(parsedBrand.enableAdminLogo) : (userSettings?.enableAdminLogo !== undefined ? Boolean(userSettings.enableAdminLogo) : DEFAULT_BRAND_SETTINGS.enableAdminLogo),
                enableHeaderLogo: parsedBrand.enableHeaderLogo !== undefined ? Boolean(parsedBrand.enableHeaderLogo) : (userSettings?.enableHeaderLogo !== undefined ? Boolean(userSettings.enableHeaderLogo) : DEFAULT_BRAND_SETTINGS.enableHeaderLogo),
                enableFooterLogo: parsedBrand.enableFooterLogo !== undefined ? Boolean(parsedBrand.enableFooterLogo) : (userSettings?.enableFooterLogo !== undefined ? Boolean(userSettings.enableFooterLogo) : DEFAULT_BRAND_SETTINGS.enableFooterLogo),
                footerCompanyName: parsedBrand.footerCompanyName || userSettings?.footerCompanyName || DEFAULT_BRAND_SETTINGS.footerCompanyName,
                footerDescription: parsedBrand.footerDescription || userSettings?.footerDescription || DEFAULT_BRAND_SETTINGS.footerDescription,
                footerContactEmail: parsedBrand.footerContactEmail || userSettings?.footerContactEmail || DEFAULT_BRAND_SETTINGS.footerContactEmail,
                footerContactPhone: parsedBrand.footerContactPhone || userSettings?.footerContactPhone || DEFAULT_BRAND_SETTINGS.footerContactPhone,
                footerContactAddress: parsedBrand.footerContactAddress || userSettings?.footerContactAddress || DEFAULT_BRAND_SETTINGS.footerContactAddress,
                footerSocialFacebook: parsedBrand.footerSocialFacebook || userSettings?.footerSocialFacebook || DEFAULT_BRAND_SETTINGS.footerSocialFacebook,
                footerSocialTwitter: parsedBrand.footerSocialTwitter || userSettings?.footerSocialTwitter || DEFAULT_BRAND_SETTINGS.footerSocialTwitter,
                footerSocialLinkedin: parsedBrand.footerSocialLinkedin || userSettings?.footerSocialLinkedin || DEFAULT_BRAND_SETTINGS.footerSocialLinkedin,
                footerSocialInstagram: parsedBrand.footerSocialInstagram || userSettings?.footerSocialInstagram || DEFAULT_BRAND_SETTINGS.footerSocialInstagram,
                footerProductTitle: parsedBrand.footerProductTitle || userSettings?.footerProductTitle || DEFAULT_BRAND_SETTINGS.footerProductTitle,
                footerCompanyTitle: parsedBrand.footerCompanyTitle || userSettings?.footerCompanyTitle || DEFAULT_BRAND_SETTINGS.footerCompanyTitle,
                footerSupportTitle: parsedBrand.footerSupportTitle || userSettings?.footerSupportTitle || DEFAULT_BRAND_SETTINGS.footerSupportTitle,
                footerLegalTitle: parsedBrand.footerLegalTitle || userSettings?.footerLegalTitle || DEFAULT_BRAND_SETTINGS.footerLegalTitle,
                footerProductLinks: parsedBrand.footerProductLinks || userSettings?.footerProductLinks || DEFAULT_BRAND_SETTINGS.footerProductLinks,
                footerCompanyLinks: parsedBrand.footerCompanyLinks || userSettings?.footerCompanyLinks || DEFAULT_BRAND_SETTINGS.footerCompanyLinks,
                footerSupportLinks: parsedBrand.footerSupportLinks || userSettings?.footerSupportLinks || DEFAULT_BRAND_SETTINGS.footerSupportLinks,
                footerLegalLinks: parsedBrand.footerLegalLinks || userSettings?.footerLegalLinks || DEFAULT_BRAND_SETTINGS.footerLegalLinks,
            };
        } catch (error) {
            // Fall through to normal logic if cookie parsing fails
        }
    }

    // If we have settings from the backend, use those (non-demo mode)
    if (userSettings) {
        return {
            logoDark: userSettings.logoDark || DEFAULT_BRAND_SETTINGS.logoDark,
            logoLight: userSettings.logoLight || DEFAULT_BRAND_SETTINGS.logoLight,
            logoFooter: userSettings.logoFooter || DEFAULT_BRAND_SETTINGS.logoFooter,
            favicon: userSettings.favicon || DEFAULT_BRAND_SETTINGS.favicon,
            logoSize: Number(userSettings.logoSize || DEFAULT_BRAND_SETTINGS.logoSize),
            titleText: userSettings.titleText || DEFAULT_BRAND_SETTINGS.titleText,
            footerText: userSettings.footerText || DEFAULT_BRAND_SETTINGS.footerText,
            themeColor: (userSettings.themeColor as ThemeColor) || DEFAULT_BRAND_SETTINGS.themeColor,
            customColor: userSettings.customColor || DEFAULT_BRAND_SETTINGS.customColor,
            sidebarVariant: userSettings.sidebarVariant || DEFAULT_BRAND_SETTINGS.sidebarVariant,
            sidebarStyle: userSettings.sidebarStyle || DEFAULT_BRAND_SETTINGS.sidebarStyle,
            layoutDirection: (userSettings.layoutDirection as LayoutPosition) || DEFAULT_BRAND_SETTINGS.layoutDirection,
            themeMode: (userSettings.themeMode as Appearance) || DEFAULT_BRAND_SETTINGS.themeMode,
            bannerTitle: userSettings.bannerTitle || DEFAULT_BRAND_SETTINGS.bannerTitle,
            bannerSubtitle: userSettings.bannerSubtitle || DEFAULT_BRAND_SETTINGS.bannerSubtitle,
            bannerButtonText: userSettings.bannerButtonText || DEFAULT_BRAND_SETTINGS.bannerButtonText,
            bannerButtonLink: userSettings.bannerButtonLink || DEFAULT_BRAND_SETTINGS.bannerButtonLink,
            bannerImage: userSettings.bannerImage || DEFAULT_BRAND_SETTINGS.bannerImage,
            bannerEnabled: userSettings.bannerEnabled !== undefined ? Boolean(userSettings.bannerEnabled) : DEFAULT_BRAND_SETTINGS.bannerEnabled,
            bannerLayout: userSettings.bannerLayout || DEFAULT_BRAND_SETTINGS.bannerLayout,
            enableAdminLogo: userSettings.enableAdminLogo !== undefined ? (String(userSettings.enableAdminLogo) === 'true' || String(userSettings.enableAdminLogo) === '1') : DEFAULT_BRAND_SETTINGS.enableAdminLogo,
            enableHeaderLogo: userSettings.enableHeaderLogo !== undefined ? (String(userSettings.enableHeaderLogo) === 'true' || String(userSettings.enableHeaderLogo) === '1') : DEFAULT_BRAND_SETTINGS.enableHeaderLogo,
            enableFooterLogo: userSettings.enableFooterLogo !== undefined ? (String(userSettings.enableFooterLogo) === 'true' || String(userSettings.enableFooterLogo) === '1') : DEFAULT_BRAND_SETTINGS.enableFooterLogo,
            footerCompanyName: userSettings.footerCompanyName || DEFAULT_BRAND_SETTINGS.footerCompanyName,
            footerDescription: userSettings.footerDescription || DEFAULT_BRAND_SETTINGS.footerDescription,
            footerContactEmail: userSettings.footerContactEmail || DEFAULT_BRAND_SETTINGS.footerContactEmail,
            footerContactPhone: userSettings.footerContactPhone || DEFAULT_BRAND_SETTINGS.footerContactPhone,
            footerContactAddress: userSettings.footerContactAddress || DEFAULT_BRAND_SETTINGS.footerContactAddress,
            footerSocialFacebook: userSettings.footerSocialFacebook || DEFAULT_BRAND_SETTINGS.footerSocialFacebook,
            footerSocialTwitter: userSettings.footerSocialTwitter || DEFAULT_BRAND_SETTINGS.footerSocialTwitter,
            footerSocialLinkedin: userSettings.footerSocialLinkedin || DEFAULT_BRAND_SETTINGS.footerSocialLinkedin,
            footerSocialInstagram: userSettings.footerSocialInstagram || DEFAULT_BRAND_SETTINGS.footerSocialInstagram,
            footerProductTitle: userSettings.footerProductTitle || DEFAULT_BRAND_SETTINGS.footerProductTitle,
            footerCompanyTitle: userSettings.footerCompanyTitle || DEFAULT_BRAND_SETTINGS.footerCompanyTitle,
            footerSupportTitle: userSettings.footerSupportTitle || DEFAULT_BRAND_SETTINGS.footerSupportTitle,
            footerLegalTitle: userSettings.footerLegalTitle || DEFAULT_BRAND_SETTINGS.footerLegalTitle,
            footerProductLinks: userSettings.footerProductLinks || DEFAULT_BRAND_SETTINGS.footerProductLinks,
            footerCompanyLinks: userSettings.footerCompanyLinks || DEFAULT_BRAND_SETTINGS.footerCompanyLinks,
            footerSupportLinks: userSettings.footerSupportLinks || DEFAULT_BRAND_SETTINGS.footerSupportLinks,
            footerLegalLinks: userSettings.footerLegalLinks || DEFAULT_BRAND_SETTINGS.footerLegalLinks,
        };
    }

    // Fallback to defaults
    return DEFAULT_BRAND_SETTINGS;
};

interface BrandSettingsProps {
    userSettings?: Record<string, string>;
}

export default function BrandSettings({ userSettings }: BrandSettingsProps) {
    const { t } = useTranslation();
    const { props } = usePage();
    const currentGlobalSettings = (props as any).globalSettings;
    const [settings, setSettings] = useState<BrandSettings>(() => getBrandSettings(currentGlobalSettings || userSettings, currentGlobalSettings));
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [activeSection, setActiveSection] = useState<'logos' | 'text' | 'theme'>('logos');

    // Get theme hooks
    const {
        updateAppearance,
        updateThemeColor,
        updateCustomColor,
        saveThemeSettings
    } = useAppearance();

    const { updatePosition, saveLayoutPosition } = useLayout();
    const { updateVariant, updateStyle, saveSidebarSettings } = useSidebarSettings();

    // Load settings when globalSettings change (but not while saving)
    useEffect(() => {
        if (isSaving) return; // Don't reset form while saving

        const newBrandSettings = getBrandSettings(currentGlobalSettings || userSettings, currentGlobalSettings);
        setSettings(newBrandSettings);

        // Also sync sidebar settings from cookies or localStorage
        try {
            const isDemo = currentGlobalSettings?.is_demo || false;
            let sidebarSettings = null;

            if (isDemo) {
                // In demo mode, get from cookies
                sidebarSettings = getCookie('sidebarSettings');
            } else {
                // In non-demo mode, get from localStorage
                sidebarSettings = localStorage.getItem('sidebarSettings');
            }

            if (sidebarSettings) {
                const parsedSettings = JSON.parse(sidebarSettings);
                setSettings(prev => ({
                    ...prev,
                    sidebarVariant: parsedSettings.variant || prev.sidebarVariant,
                    sidebarStyle: parsedSettings.style || prev.sidebarStyle
                }));
            }
        } catch (error) {
        }
    }, [currentGlobalSettings, userSettings, isSaving]);

    // Handle input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));

        // Update brand context
        updateBrandSettings({ [name]: value });
    };



    // Handle media picker selection
    const handleMediaSelect = (name: string, url: string) => {
        setSettings(prev => ({ ...prev, [name]: url }));
        updateBrandSettings({ [name]: url });
        setLogoErrors(prev => ({ ...prev, [name]: false }));
    };

    // Handle setting change for switches & general inputs
    const handleSettingChange = (name: keyof BrandSettings, value: any) => {
        setSettings(prev => ({ ...prev, [name]: value }));
        updateBrandSettings({ [name]: value });
    };

    // Handle direct file upload from local computer
    const handleFileUpload = (name: string, file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            if (result) {
                setSettings(prev => ({ ...prev, [name]: result }));
                updateBrandSettings({ [name]: result });
                setLogoErrors(prev => ({ ...prev, [name]: false }));
                toast.success(t('Đã tải ảnh lên thành công! Bấm "Lưu thay đổi" để hoàn tất.'));
            }
        };
        reader.readAsDataURL(file);
    };

    // Import useBrand hook
    const { updateBrandSettings } = useBrand();

    // State to track logo errors
    const [logoErrors, setLogoErrors] = useState({
        logoDark: false,
        logoLight: false,
        logoFooter: false,
        favicon: false
    });



    // Handle logo size change
    const handleLogoSizeChange = (size: number) => {
        const validSize = Math.max(16, Math.min(120, size));
        setSettings(prev => ({ ...prev, logoSize: validSize }));
        updateBrandSettings({ logoSize: validSize });
    };

    // Handle theme color change
    const handleThemeColorChange = (color: ThemeColor) => {
        setSettings(prev => ({ ...prev, themeColor: color }));
        updateThemeColor(color);
    };

    // Handle custom color change
    const handleCustomColorChange = (color: string) => {
        setSettings(prev => ({ ...prev, customColor: color }));
        // Set as active custom color when user is editing it
        updateCustomColor(color, true);
    };

    // Handle sidebar variant change
    const handleSidebarVariantChange = (variant: string) => {
        setSettings(prev => ({ ...prev, sidebarVariant: variant }));
        updateVariant(variant as any);
    };

    // Handle sidebar style change
    const handleSidebarStyleChange = (style: string) => {
        setSettings(prev => ({ ...prev, sidebarStyle: style }));
        updateStyle(style);
    };

    // Handle layout direction change
    const handleLayoutDirectionChange = (direction: LayoutPosition) => {
        setSettings(prev => ({ ...prev, layoutDirection: direction }));
        updatePosition(direction);

        // Trigger event for LayoutContext to listen
        window.dispatchEvent(new CustomEvent('layoutDirectionChanged', {
            detail: { direction }
        }));
    };

    // Handle theme mode change
    const handleThemeModeChange = (mode: Appearance) => {
        setSettings(prev => ({ ...prev, themeMode: mode }));
        // Only update appearance, don't let it reset the theme color
        updateAppearance(mode);
        // Immediately reapply the current theme color to prevent it from changing
        setTimeout(() => {
            updateThemeColor(settings.themeColor);
            if (settings.themeColor === 'custom') {
                updateCustomColor(settings.customColor);
            }
        }, 0);
    };

    // Save settings
    const saveSettings = () => {
        setIsLoading(true);
        setIsSaving(true);

        // Update theme settings - this applies the theme immediately
        updateThemeColor(settings.themeColor);
        if (settings.themeColor === 'custom') {
            updateCustomColor(settings.customColor);
        }
        updateAppearance(settings.themeMode);
        updatePosition(settings.layoutDirection);

        // Update sidebar settings
        updateVariant(settings.sidebarVariant as any);
        updateStyle(settings.sidebarStyle);

        // Save all settings to cookies/storage (but don't show toasts for these)
        try {
            saveThemeSettings();
            saveLayoutPosition(settings.layoutDirection);
            saveSidebarSettings();
        } catch (error) {
            // Silently handle storage errors
        }

        // Update brand context with all settings including theme and footer
        updateBrandSettings({
            logoLight: settings.logoLight,
            logoDark: settings.logoDark,
            logoFooter: settings.logoFooter,
            favicon: settings.favicon,
            logoSize: settings.logoSize,
            titleText: settings.titleText,
            footerText: settings.footerText,
            themeColor: settings.themeColor,
            customColor: settings.customColor,
            themeMode: settings.themeMode,
            layoutDirection: settings.layoutDirection,
            sidebarVariant: settings.sidebarVariant,
            sidebarStyle: settings.sidebarStyle,
            bannerTitle: settings.bannerTitle,
            bannerSubtitle: settings.bannerSubtitle,
            bannerButtonText: settings.bannerButtonText,
            bannerButtonLink: settings.bannerButtonLink,
            bannerImage: settings.bannerImage,
            bannerEnabled: settings.bannerEnabled,
            bannerLayout: settings.bannerLayout,
            enableAdminLogo: settings.enableAdminLogo,
            enableHeaderLogo: settings.enableHeaderLogo,
            enableFooterLogo: settings.enableFooterLogo,
            footerCompanyName: settings.footerCompanyName,
            footerDescription: settings.footerDescription,
            footerContactEmail: settings.footerContactEmail,
            footerContactPhone: settings.footerContactPhone,
            footerContactAddress: settings.footerContactAddress,
            footerSocialFacebook: settings.footerSocialFacebook,
            footerSocialTwitter: settings.footerSocialTwitter,
            footerSocialLinkedin: settings.footerSocialLinkedin,
            footerSocialInstagram: settings.footerSocialInstagram,
            footerProductTitle: settings.footerProductTitle,
            footerCompanyTitle: settings.footerCompanyTitle,
            footerSupportTitle: settings.footerSupportTitle,
            footerLegalTitle: settings.footerLegalTitle,
            footerProductLinks: settings.footerProductLinks,
            footerCompanyLinks: settings.footerCompanyLinks,
            footerSupportLinks: settings.footerSupportLinks,
            footerLegalLinks: settings.footerLegalLinks,
        });

        // Save to database using Inertia
        router.post(route('settings.brand.update'), {
            settings: settings
        }, {
            preserveScroll: true,
            onSuccess: (page) => {
                setIsLoading(false);
                const successMessage = page.props.flash?.success;
                const errorMessage = page.props.flash?.error;

                if (successMessage) {
                    toast.success(successMessage);
                    // Reset saving state after success
                    setTimeout(() => setIsSaving(false), 500);
                } else if (errorMessage) {
                    toast.error(errorMessage);
                }
            },
            onError: (errors) => {
                setIsLoading(false);
                setIsSaving(false);
                const errorMessage = errors.error || Object.values(errors).join(', ') || t('Failed to save brand settings');
                toast.error(errorMessage);
            }
        });
    };

    return (
        <div className="space-y-8">
            <SettingsSection
                title={t("Brand Settings")}
                description={t("Customize your application's branding and appearance")}
                action={
                    <Button onClick={saveSettings} disabled={isLoading} size="sm">
                        <Save className="h-4 w-4 mr-2" />
                        {isLoading ? t('Saving...') : t('Save Changes')}
                    </Button>
                }
            >
                <Card>
                    <CardContent className='mt-6'>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <div className="flex space-x-2 mb-6">
                                    <Button
                                        variant={activeSection === 'logos' ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setActiveSection('logos')}
                                        className="flex-1"
                                    >
                                        <Upload className="h-4 w-4 mr-2" />
                                        {t("Logos")}
                                    </Button>
                                    <Button
                                        variant={activeSection === 'text' ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setActiveSection('text')}
                                        className="flex-1"
                                    >
                                        <FileText className="h-4 w-4 mr-2" />
                                        {t("Text")}
                                    </Button>
                                    <Button
                                        variant={activeSection === 'theme' ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setActiveSection('theme')}
                                        className="flex-1"
                                    >
                                        <Palette className="h-4 w-4 mr-2" />
                                        {t("Theme")}
                                    </Button>
                                </div>

                                {/* Logos Section */}
                                {activeSection === 'logos' && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <Label>{t("Logo Dark")}</Label>
                                                <div className="flex flex-col gap-3">
                                                    <div className="border rounded-md p-4 flex items-center justify-center dark:bg-white bg-muted/30 h-32 relative group">
                                                        {settings.logoDark && !logoErrors.logoDark ? (
                                                            <>
                                                                <img
                                                                    key={`preview-dark-${Date.now()}`}
                                                                    src={getImagePath(settings.logoDark)}
                                                                    alt="Dark Logo"
                                                                    className="max-h-full max-w-full object-contain"
                                                                    onError={() => setLogoErrors(prev => ({ ...prev, logoDark: true }))}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        handleMediaSelect('logoDark', '');
                                                                        setLogoErrors(prev => ({ ...prev, logoDark: false }));
                                                                    }}
                                                                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-md transition-all duration-200 opacity-90 group-hover:opacity-100 hover:scale-110"
                                                                    title={t("Xoá logo")}
                                                                >
                                                                    <X className="w-3.5 h-3.5" />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <div className="text-muted-foreground flex flex-col items-center gap-2">
                                                                <div className="h-12 w-24 bg-muted flex items-center justify-center rounded border border-dashed">
                                                                    <span className="font-semibold text-muted-foreground">{t("Logo")}</span>
                                                                </div>
                                                                <span className="text-xs">
                                                                    {logoErrors.logoDark ? "Failed to load image" : "No logo selected"}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <div className="flex-1">
                                                            <MediaPicker
                                                                label=""
                                                                value={settings.logoDark}
                                                                onChange={(url) => handleMediaSelect('logoDark', url)}
                                                                placeholder="Select dark mode logo..."
                                                                showPreview={false}
                                                                defaultValue={DEFAULT_LOGOS.logoDark}
                                                            />
                                                        </div>
                                                        <label htmlFor="file-logoDark" className="px-3 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-md text-xs font-medium cursor-pointer border flex items-center gap-1 shrink-0" title={t("Tải ảnh từ máy tính")}>
                                                            <Upload className="w-3.5 h-3.5" />
                                                            <span>{t("Tải từ máy")}</span>
                                                            <input
                                                                id="file-logoDark"
                                                                type="file"
                                                                accept="image/*"
                                                                className="hidden"
                                                                onChange={(e) => e.target.files?.[0] && handleFileUpload('logoDark', e.target.files[0])}
                                                            />
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <Label>{t("Logo Light")}</Label>
                                                <div className="flex flex-col gap-3">
                                                    <div className="border rounded-md p-4 flex items-center justify-center bg-black h-32 relative group">
                                                        {settings.logoLight && !logoErrors.logoLight ? (
                                                            <>
                                                                <img
                                                                    key={`preview-light-${Date.now()}`}
                                                                    src={getImagePath(settings.logoLight)}
                                                                    alt="Light Logo"
                                                                    className="max-h-full max-w-full object-contain"
                                                                    onError={() => setLogoErrors(prev => ({ ...prev, logoLight: true }))}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        handleMediaSelect('logoLight', '');
                                                                        setLogoErrors(prev => ({ ...prev, logoLight: false }));
                                                                    }}
                                                                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-md transition-all duration-200 opacity-90 group-hover:opacity-100 hover:scale-110"
                                                                    title={t("Xoá logo")}
                                                                >
                                                                    <X className="w-3.5 h-3.5" />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <div className="text-muted-foreground flex flex-col items-center gap-2">
                                                                <div className="h-12 w-24 bg-muted flex items-center justify-center rounded border border-dashed">
                                                                    <span className="font-semibold text-muted-foreground">{t("Logo")}</span>
                                                                </div>
                                                                <span className="text-xs">
                                                                    {logoErrors.logoLight ? "Failed to load image" : "No logo selected"}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <div className="flex-1">
                                                            <MediaPicker
                                                                label=""
                                                                value={settings.logoLight}
                                                                onChange={(url) => handleMediaSelect('logoLight', url)}
                                                                placeholder="Select light mode logo..."
                                                                showPreview={false}
                                                                defaultValue={DEFAULT_LOGOS.logoLight}
                                                            />
                                                        </div>
                                                        <label htmlFor="file-logoLight" className="px-3 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-md text-xs font-medium cursor-pointer border flex items-center gap-1 shrink-0" title={t("Tải ảnh từ máy tính")}>
                                                            <Upload className="w-3.5 h-3.5" />
                                                            <span>{t("Tải từ máy")}</span>
                                                            <input
                                                                id="file-logoLight"
                                                                type="file"
                                                                accept="image/*"
                                                                className="hidden"
                                                                onChange={(e) => e.target.files?.[0] && handleFileUpload('logoLight', e.target.files[0])}
                                                            />
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <Label>{t("Favicon")}</Label>
                                                <div className="flex flex-col gap-3">
                                                    <div className="border rounded-md p-4 flex items-center justify-center bg-muted/30 h-20 relative group">
                                                        {settings.favicon && !logoErrors.favicon ? (
                                                            <>
                                                                <img
                                                                    key={`preview-favicon-${Date.now()}`}
                                                                    src={getImagePath(settings.favicon)}
                                                                    alt="Favicon"
                                                                    className="h-16 w-16 object-contain"
                                                                    onError={() => setLogoErrors(prev => ({ ...prev, favicon: true }))}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        handleMediaSelect('favicon', '');
                                                                        setLogoErrors(prev => ({ ...prev, favicon: false }));
                                                                    }}
                                                                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full shadow-md transition-all duration-200 opacity-90 group-hover:opacity-100 hover:scale-110"
                                                                    title={t("Xoá favicon")}
                                                                >
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <div className="text-muted-foreground flex flex-col items-center gap-1">
                                                                <div className="h-10 w-10 bg-muted flex items-center justify-center rounded border border-dashed">
                                                                    <span className="font-semibold text-xs text-muted-foreground">{t("Icon")}</span>
                                                                </div>
                                                                <span className="text-xs">
                                                                    {logoErrors.favicon ? "Failed to load image" : "No favicon selected"}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <div className="flex-1">
                                                            <MediaPicker
                                                                label=""
                                                                value={settings.favicon}
                                                                onChange={(url) => handleMediaSelect('favicon', url)}
                                                                placeholder="Select favicon..."
                                                                showPreview={false}
                                                                defaultValue={DEFAULT_LOGOS.favicon}
                                                            />
                                                        </div>
                                                        <label htmlFor="file-favicon" className="px-3 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-md text-xs font-medium cursor-pointer border flex items-center gap-1 shrink-0" title={t("Tải ảnh từ máy tính")}>
                                                            <Upload className="w-3.5 h-3.5" />
                                                            <span>{t("Tải từ máy")}</span>
                                                            <input
                                                                id="file-favicon"
                                                                type="file"
                                                                accept="image/*"
                                                                className="hidden"
                                                                onChange={(e) => e.target.files?.[0] && handleFileUpload('favicon', e.target.files[0])}
                                                            />
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <Separator className="my-4" />

                                        {/* Logo Size Control */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="logoSize" className="font-medium text-sm">
                                                    {t("Logo Size (Height in px)")}
                                                </Label>
                                                <span className="text-sm font-semibold text-primary">
                                                    {settings.logoSize || 36}px
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <input
                                                    id="logoSize"
                                                    type="range"
                                                    min={16}
                                                    max={120}
                                                    step={2}
                                                    value={settings.logoSize || 36}
                                                    onChange={(e) => handleLogoSizeChange(Number(e.target.value))}
                                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary dark:bg-gray-700"
                                                />
                                                <Input
                                                    type="number"
                                                    min={16}
                                                    max={120}
                                                    value={settings.logoSize || 36}
                                                    onChange={(e) => handleLogoSizeChange(Number(e.target.value))}
                                                    className="w-20 text-center"
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {t("Adjust the height of the logo across the dashboard and landing page")}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Text Section */}
                                {activeSection === 'text' && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 gap-6">
                                            <div className="space-y-3">
                                                <Label htmlFor="titleText" required>{t("Title Text")}</Label>
                                                <Input
                                                    id="titleText"
                                                    name="titleText"
                                                    value={settings.titleText}
                                                    onChange={handleInputChange}
                                                    placeholder="WorkDo"
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    {t("Application title displayed in the browser tab")}
                                                </p>
                                            </div>

                                            <div className="space-y-3">
                                                <Label htmlFor="footerText" required>{t("Footer Text")}</Label>
                                                <Input
                                                    id="footerText"
                                                    name="footerText"
                                                    value={settings.footerText}
                                                    onChange={handleInputChange}
                                                    placeholder="© 2025 WorkDo. All rights reserved."
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    {t("Text displayed in the footer")}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Theme Section */}
                                {activeSection === 'theme' && (
                                    <div className="space-y-6">
                                        <div className="flex flex-col space-y-8">
                                            {/* Theme Color Section */}
                                            <div className="space-y-4">
                                                <div className="flex items-center">
                                                    <Palette className="h-5 w-5 mr-2 text-muted-foreground" />
                                                    <h3 className="text-base font-medium">{t("Theme Color")}</h3>
                                                </div>
                                                <Separator className="my-2" />

                                                <div className="grid grid-cols-6 gap-2">
                                                    {Object.entries({ blue: '#3b82f6', green: '#10b77f', purple: '#8b5cf6', orange: '#f97316', red: '#ef4444' }).map(([color, hex]) => (
                                                        <Button
                                                            key={color}
                                                            type="button"
                                                            variant={settings.themeColor === color ? "default" : "outline"}
                                                            className="h-8 w-full p-0 relative"
                                                            style={{ backgroundColor: settings.themeColor === color ? hex : 'transparent' }}
                                                            onClick={() => handleThemeColorChange(color as ThemeColor)}
                                                        >
                                                            <span
                                                                className="absolute inset-1 rounded-sm"
                                                                style={{ backgroundColor: hex }}
                                                            />
                                                        </Button>
                                                    ))}
                                                    <Button
                                                        type="button"
                                                        variant={settings.themeColor === 'custom' ? "default" : "outline"}
                                                        className="h-8 w-full p-0 relative"
                                                        style={{ backgroundColor: settings.themeColor === 'custom' ? settings.customColor : 'transparent' }}
                                                        onClick={() => handleThemeColorChange('custom')}
                                                    >
                                                        <span
                                                            className="absolute inset-1 rounded-sm"
                                                            style={{ backgroundColor: settings.customColor }}
                                                        />
                                                    </Button>
                                                </div>

                                                {settings.themeColor === 'custom' && (
                                                    <div className="space-y-2 mt-4">
                                                        <Label htmlFor="customColor">{t("Custom Color")}</Label>
                                                        <div className="flex gap-2">
                                                            <div className="relative">
                                                                <Input
                                                                    id="colorPicker"
                                                                    type="color"
                                                                    value={settings.customColor}
                                                                    onChange={(e) => handleCustomColorChange(e.target.value)}
                                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                                />
                                                                <div
                                                                    className="w-10 h-10 rounded border cursor-pointer"
                                                                    style={{ backgroundColor: settings.customColor }}
                                                                />
                                                            </div>
                                                            <Input
                                                                id="customColor"
                                                                name="customColor"
                                                                type="text"
                                                                value={settings.customColor}
                                                                onChange={(e) => handleCustomColorChange(e.target.value)}
                                                                placeholder="#3b82f6"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Sidebar Section */}
                                            <div className="space-y-4">
                                                <div className="flex items-center">
                                                    <SidebarIcon className="h-5 w-5 mr-2 text-muted-foreground" />
                                                    <h3 className="text-base font-medium">{t("Sidebar")}</h3>
                                                </div>
                                                <Separator className="my-2" />

                                                <div className="space-y-6">
                                                    <div>
                                                        <Label className="mb-2 block">{t("Sidebar Variant")}</Label>
                                                        <div className="grid grid-cols-3 gap-3">
                                                            {['inset', 'floating', 'minimal'].map((variant) => (
                                                                <Button
                                                                    key={variant}
                                                                    type="button"
                                                                    variant={settings.sidebarVariant === variant ? "default" : "outline"}
                                                                    className="h-10 justify-start"
                                                                    style={{
                                                                        backgroundColor: settings.sidebarVariant === variant ?
                                                                            (settings.themeColor === 'custom' ? settings.customColor : null) :
                                                                            'transparent'
                                                                    }}
                                                                    onClick={() => handleSidebarVariantChange(variant)}
                                                                >
                                                                    {variant.charAt(0).toUpperCase() + variant.slice(1)}
                                                                    {settings.sidebarVariant === variant && (
                                                                        <Check className="h-4 w-4 ml-2" />
                                                                    )}
                                                                </Button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <Label className="mb-2 block">{t("Sidebar Style")}</Label>
                                                        <div className="grid grid-cols-3 gap-3">
                                                            {[
                                                                { id: 'plain', name: 'Plain' },
                                                                { id: 'colored', name: 'Colored' },
                                                                { id: 'gradient', name: 'Gradient' }
                                                            ].map((style) => (
                                                                <Button
                                                                    key={style.id}
                                                                    type="button"
                                                                    variant={settings.sidebarStyle === style.id ? "default" : "outline"}
                                                                    className="h-10 justify-start"
                                                                    style={{
                                                                        backgroundColor: settings.sidebarStyle === style.id ?
                                                                            (settings.themeColor === 'custom' ? settings.customColor : null) :
                                                                            'transparent'
                                                                    }}
                                                                    onClick={() => handleSidebarStyleChange(style.id)}
                                                                >
                                                                    {style.name}
                                                                    {settings.sidebarStyle === style.id && (
                                                                        <Check className="h-4 w-4 ml-2" />
                                                                    )}
                                                                </Button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Layout Section */}
                                            <div className="space-y-4">
                                                <div className="flex items-center">
                                                    <Layout className="h-5 w-5 mr-2 text-muted-foreground" />
                                                    <h3 className="text-base font-medium">{t("Layout")}</h3>
                                                </div>
                                                <Separator className="my-2" />

                                                <div className="space-y-2">
                                                    <Label className="mb-2 block">{t("Layout Direction")}</Label>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <Button
                                                            type="button"
                                                            variant={settings.layoutDirection === "left" ? "default" : "outline"}
                                                            className="h-10 justify-start"
                                                            style={{
                                                                backgroundColor: settings.layoutDirection === "left" ?
                                                                    (settings.themeColor === 'custom' ? settings.customColor : null) :
                                                                    'transparent'
                                                            }}
                                                            onClick={() => handleLayoutDirectionChange("left")}
                                                        >
                                                            {t("Left-to-Right")}
                                                            {settings.layoutDirection === "left" && (
                                                                <Check className="h-4 w-4 ml-2" />
                                                            )}
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant={settings.layoutDirection === "right" ? "default" : "outline"}
                                                            className="h-10 justify-start"
                                                            style={{
                                                                backgroundColor: settings.layoutDirection === "right" ?
                                                                    (settings.themeColor === 'custom' ? settings.customColor : null) :
                                                                    'transparent'
                                                            }}
                                                            onClick={() => handleLayoutDirectionChange("right")}
                                                        >
                                                            {t("Right-to-Left")}
                                                            {settings.layoutDirection === "right" && (
                                                                <Check className="h-4 w-4 ml-2" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Mode Section */}
                                            <div className="space-y-4">
                                                <div className="flex items-center">
                                                    <Moon className="h-5 w-5 mr-2 text-muted-foreground" />
                                                    <h3 className="text-base font-medium">{t("Theme Mode")}</h3>
                                                </div>
                                                <Separator className="my-2" />

                                                <div className="space-y-2">
                                                    <div className="grid grid-cols-3 gap-2">
                                                        <Button
                                                            type="button"
                                                            variant={settings.themeMode === "light" ? "default" : "outline"}
                                                            className="h-10 justify-start"
                                                            style={{
                                                                backgroundColor: settings.themeMode === "light" ?
                                                                    (settings.themeColor === 'custom' ? settings.customColor : null) :
                                                                    'transparent'
                                                            }}
                                                            onClick={() => handleThemeModeChange("light")}
                                                        >
                                                            {t("Light")}
                                                            {settings.themeMode === "light" && (
                                                                <Check className="h-4 w-4 ml-2" />
                                                            )}
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant={settings.themeMode === "dark" ? "default" : "outline"}
                                                            className="h-10 justify-start"
                                                            style={{
                                                                backgroundColor: settings.themeMode === "dark" ?
                                                                    (settings.themeColor === 'custom' ? settings.customColor : null) :
                                                                    'transparent'
                                                            }}
                                                            onClick={() => handleThemeModeChange("dark")}
                                                        >
                                                            {t("Dark")}
                                                            {settings.themeMode === "dark" && (
                                                                <Check className="h-4 w-4 ml-2" />
                                                            )}
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant={settings.themeMode === "system" ? "default" : "outline"}
                                                            className="h-10 justify-start"
                                                            style={{
                                                                backgroundColor: settings.themeMode === "system" ?
                                                                    (settings.themeColor === 'custom' ? settings.customColor : null) :
                                                                    'transparent'
                                                            }}
                                                            onClick={() => handleThemeModeChange("system")}
                                                        >
                                                            {t("System")}
                                                            {settings.themeMode === "system" && (
                                                                <Check className="h-4 w-4 ml-2" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Preview Column */}
                            <div className="lg:col-span-1">
                                <div className="sticky top-20 space-y-6">
                                    <div className="border rounded-md p-4">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Palette className="h-4 w-4" />
                                            <h3 className="font-medium">{t("Live Preview")}</h3>
                                        </div>

                                        {/* Comprehensive Theme Preview */}
                                        <ThemePreview />

                                        {/* Text Preview */}
                                        <div className="mt-4 pt-4 border-t">
                                            <div className="text-xs mb-2 text-muted-foreground">{t("Title:")} <span className="font-medium text-foreground">{settings.titleText}</span></div>
                                            <div className="text-xs text-muted-foreground">{t("Footer:")} <span className="font-medium text-foreground">{settings.footerText}</span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </SettingsSection>
        </div>
    );
}
