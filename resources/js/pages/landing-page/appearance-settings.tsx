import React, { useMemo, useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { Check, Palette, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PageTemplate } from '@/components/page-template';

type Section = { key: string; [key: string]: unknown };

interface LandingSettings {
    company_name: string;
    contact_email: string;
    contact_phone: string;
    contact_address: string;
    config_sections?: {
        theme?: Record<string, string>;
        sections?: Section[];
        [key: string]: unknown;
    };
}

const palettes = [
    { name: 'Xanh dương', primary: '#2563eb', secondary: '#7c3aed', accent: '#059669' },
    { name: 'Xanh lá', primary: '#059669', secondary: '#0f766e', accent: '#65a30d' },
    { name: 'Tím', primary: '#7c3aed', secondary: '#a855f7', accent: '#db2777' },
    { name: 'Cam', primary: '#ea580c', secondary: '#f59e0b', accent: '#dc2626' },
];

const colorValue = (value: unknown, fallback: string) =>
    typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback;

export default function LandingPageAppearanceSettings() {
    const { t } = useTranslation();
    const { settings } = usePage<{ settings: LandingSettings }>().props;
    const [saved, setSaved] = useState(false);
    const { data, setData, post, processing, errors } = useForm<LandingSettings>({
        company_name: settings.company_name,
        contact_email: settings.contact_email,
        contact_phone: settings.contact_phone,
        contact_address: settings.contact_address,
        config_sections: settings.config_sections || { sections: [], theme: {} },
    });

    const theme = data.config_sections?.theme || {};
    const sections = data.config_sections?.sections || [];
    const getSection = (key: string) => sections.find((section) => section.key === key) || { key };
    const header = getSection('header');
    const hero = getSection('hero');

    const primary = colorValue(theme.primary_color, '#2563eb');
    const secondary = colorValue(theme.secondary_color, '#7c3aed');
    const accent = colorValue(theme.accent_color, '#059669');
    const headerBackground = colorValue(header.background_color, '#ffffff');
    const headerText = colorValue(header.text_color, '#1f2937');
    const heroBackground = colorValue(hero.background_color, '#f8fafc');
    const heroText = colorValue(hero.text_color, '#111827');

    const updateTheme = (updates: Record<string, string>) => {
        setSaved(false);
        setData('config_sections', {
            ...data.config_sections,
            theme: { ...theme, ...updates },
        });
    };

    const updateSection = (key: string, updates: Record<string, string>) => {
        setSaved(false);
        const nextSections = [...sections];
        const index = nextSections.findIndex((section) => section.key === key);
        if (index === -1) nextSections.push({ key, ...updates });
        else nextSections[index] = { ...nextSections[index], ...updates };
        setData('config_sections', { ...data.config_sections, sections: nextSections });
    };

    const previewStyle = useMemo(() => ({
        '--preview-primary': primary,
        '--preview-secondary': secondary,
        '--preview-accent': accent,
    }) as React.CSSProperties, [primary, secondary, accent]);

    const save = () => {
        post(route('landing-page.settings.update'), {
            preserveScroll: true,
            onSuccess: () => setSaved(true),
        });
    };

    const ColorControl = ({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) => (
        <label className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="mb-3 block text-sm font-semibold text-slate-700">{label}</span>
            <span className="flex items-center gap-3">
                <input aria-label={label} type="color" value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-12 cursor-pointer rounded border-0 bg-transparent p-0" />
                <input value={value} onChange={(event) => onChange(event.target.value)} maxLength={7} className="w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm uppercase outline-none focus:border-blue-500" />
            </span>
        </label>
    );

    return (
        <PageTemplate
            title={t('Giao diện trang chủ')}
            description={t('Chỉnh màu sắc hiển thị bên ngoài trang chủ')}
            url="/chinh-sua-giao-dien-trang-chu"
            breadcrumbs={[
                { title: t('Dashboard'), href: route('dashboard') },
                { title: t('Giao diện trang chủ') },
            ]}
            actions={[{
                label: processing ? t('Đang lưu...') : saved ? t('Đã lưu') : t('Lưu thay đổi'),
                icon: saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />,
                onClick: save,
            }]}
        >
                <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                    <section className="space-y-6 rounded-2xl bg-white p-5 shadow-sm sm:p-7">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
                            <span className="rounded-xl p-2.5 text-white" style={{ backgroundColor: primary }}><Palette className="h-5 w-5" /></span>
                            <div><h2 className="font-bold text-slate-900">{t('Bảng màu trang chủ')}</h2><p className="text-sm text-slate-500">{t('Các màu này chỉ áp dụng cho phần public.')}</p></div>
                        </div>

                        <div>
                            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">{t('Mẫu màu nhanh')}</h3>
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                {palettes.map((palette) => (
                                    <button key={palette.name} type="button" onClick={() => updateTheme({ primary_color: palette.primary, secondary_color: palette.secondary, accent_color: palette.accent })} className="rounded-xl border border-slate-200 p-3 text-left transition hover:border-slate-400">
                                        <span className="mb-2 flex gap-1"><i className="h-5 w-5 rounded-full" style={{ backgroundColor: palette.primary }} /><i className="h-5 w-5 rounded-full" style={{ backgroundColor: palette.secondary }} /><i className="h-5 w-5 rounded-full" style={{ backgroundColor: palette.accent }} /></span>
                                        <span className="text-xs font-semibold text-slate-700">{palette.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                            <ColorControl label={t('Màu chính')} value={primary} onChange={(value) => updateTheme({ primary_color: value })} />
                            <ColorControl label={t('Màu phụ')} value={secondary} onChange={(value) => updateTheme({ secondary_color: value })} />
                            <ColorControl label={t('Màu nhấn')} value={accent} onChange={(value) => updateTheme({ accent_color: value })} />
                        </div>

                        <div className="border-t border-slate-100 pt-6">
                            <h3 className="mb-3 font-bold text-slate-900">{t('Phần đầu trang')}</h3>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <ColorControl label={t('Nền header')} value={headerBackground} onChange={(value) => updateSection('header', { background_color: value })} />
                                <ColorControl label={t('Chữ header')} value={headerText} onChange={(value) => updateSection('header', { text_color: value })} />
                            </div>
                        </div>

                        <div className="border-t border-slate-100 pt-6">
                            <h3 className="mb-3 font-bold text-slate-900">{t('Phần giới thiệu')}</h3>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <ColorControl label={t('Nền hero')} value={heroBackground} onChange={(value) => updateSection('hero', { background_color: value })} />
                                <ColorControl label={t('Chữ hero')} value={heroText} onChange={(value) => updateSection('hero', { text_color: value })} />
                            </div>
                        </div>
                        {Object.keys(errors).length > 0 && <p className="text-sm font-medium text-red-600">{t('Không thể lưu, vui lòng kiểm tra lại dữ liệu.')}</p>}
                    </section>

                    <aside className="h-fit rounded-2xl bg-white p-5 shadow-sm lg:sticky lg:top-6">
                        <h2 className="mb-4 font-bold text-slate-900">{t('Xem trước trực tiếp')}</h2>
                        <div className="overflow-hidden rounded-xl border border-slate-200" style={previewStyle}>
                            <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: headerBackground, color: headerText }}>
                                <span className="text-sm font-bold">{settings.company_name}</span><span className="text-xs">Trang chủ&nbsp;&nbsp; Dịch vụ&nbsp;&nbsp; Liên hệ</span>
                            </div>
                            <div className="p-6" style={{ backgroundColor: heroBackground, color: heroText }}>
                                <span className="text-xs font-bold" style={{ color: primary }}>VĂN PHÒNG LUẬT SƯ</span>
                                <h3 className="mt-3 text-xl font-bold">Giải pháp pháp lý tin cậy</h3>
                                <p className="mt-2 text-sm opacity-70">Giao diện trang chủ sẽ dùng các màu bạn chọn.</p>
                                <div className="mt-5 flex gap-2"><span className="rounded-lg px-3 py-2 text-xs font-bold text-white" style={{ backgroundColor: primary }}>Tư vấn ngay</span><span className="rounded-lg px-3 py-2 text-xs font-bold text-white" style={{ backgroundColor: secondary }}>Tìm hiểu thêm</span></div>
                            </div>
                            <div className="flex gap-2 p-4"><span className="h-2 flex-1 rounded" style={{ backgroundColor: primary }} /><span className="h-2 flex-1 rounded" style={{ backgroundColor: secondary }} /><span className="h-2 flex-1 rounded" style={{ backgroundColor: accent }} /></div>
                        </div>
                    </aside>
                </div>
        </PageTemplate>
    );
}
