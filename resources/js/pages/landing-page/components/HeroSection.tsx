import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { ArrowRight, Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getImagePath, isUserRegistrationEnabled} from '@/utils/helpers';
import { getCookie, isDemoMode } from '@/utils/cookies';
import { useBrand } from '@/contexts/BrandContext';

interface HeroSectionProps {
  brandColor?: string;
  settings: any;
  sectionData: {
    title?: string;
    subtitle?: string;
    announcement_text?: string;
    primary_button_text?: string;
    secondary_button_text?: string;
    image?: string;
    stats?: Array<{ value: string; label: string }>;
    background_color?: string;
    text_color?: string;
    height?: number;
    layout?: string;
    overlay?: boolean;
    overlay_color?: string;
    image_position?: string;
    card?: {
      name: string;
      title: string;
      company: string;
      initials: string;
    };
  };
}

export default function HeroSection({ settings, sectionData, brandColor = '#3b82f6' }: HeroSectionProps) {
  const { t } = useTranslation();
  const { globalSettings } = usePage().props as any;
  const brand = useBrand();
  const isDemo = isDemoMode();

  let themeMode = 'light';
  if (isDemo) {
    const themeSettings = getCookie('themeSettings');
    if (themeSettings) {
      try {
        const parsed = JSON.parse(themeSettings);
        themeMode = parsed.appearance || 'light';
      } catch {
        themeMode = 'light';
      }
    }
  } else {
    themeMode = globalSettings?.themeMode || 'light';
  }

  const isDark = themeMode === 'dark';

  // Check custom banner settings from BrandContext / globalSettings
  const isBannerEnabled = brand?.bannerEnabled !== false;
  const bannerLayout = (isBannerEnabled && brand?.bannerLayout) ? brand.bannerLayout : 'split-right';

  const displayTitle = (isBannerEnabled && brand?.bannerTitle)
    ? t(brand.bannerTitle)
    : (sectionData.title ? t(sectionData.title) : t('Create Your Digital Business Card'));

  const displaySubtitle = (isBannerEnabled && brand?.bannerSubtitle)
    ? t(brand.bannerSubtitle)
    : (sectionData.subtitle ? t(sectionData.subtitle) : t('Manage leads, opportunities, quotes, orders, invoices, projects, and reports — all from one platform.'));

  const displayBtnText = (isBannerEnabled && brand?.bannerButtonText)
    ? t(brand.bannerButtonText)
    : (sectionData.primary_button_text ? t(sectionData.primary_button_text) : t('Start Free Trial'));

  const displayBtnLink = (isBannerEnabled && brand?.bannerButtonLink)
    ? brand.bannerButtonLink
    : (isUserRegistrationEnabled() ? route('register') : route('login'));

  // Multi-image slider setup
  const bannerImageString = (isBannerEnabled && brand?.bannerImage) ? brand.bannerImage : (sectionData?.image || '');
  const bannerImages = bannerImageString
    ? bannerImageString.split(',').map((s: string) => s.trim()).filter(Boolean)
    : [];

  const defaultImage = getImagePath('/public/screenshots/a-advocate-saas-pic.png');

  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (bannerImages.length < 2) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % bannerImages.length);
    }, 4000); // 4-second auto slide

    return () => clearInterval(interval);
  }, [bannerImages.length]);

  const currentHeroImage = bannerImages.length > 0
    ? getImagePath(bannerImages[activeSlide % bannerImages.length])
    : (getImagePath(sectionData?.image) || defaultImage);

  // Apply sectionData settings & image position
  const imagePosition = sectionData.image_position || (sectionData.layout === 'image-left' ? 'left' : (sectionData.layout === 'full-width' ? 'fullscreen' : (sectionData.layout === 'centered' ? 'center' : (bannerLayout || 'right'))));
  const isFullLayout = imagePosition === 'fullscreen' || imagePosition === 'full' || imagePosition === 'background' || bannerLayout === 'full' || sectionData.layout === 'full-width';
  const isSplitLeft = imagePosition === 'left' || (!isFullLayout && (sectionData.layout === 'image-left' || bannerLayout === 'split-left'));
  const isCenter = imagePosition === 'center' || (!isFullLayout && sectionData.layout === 'centered');

  const backgroundColor = sectionData.background_color || (isDark ? '#111827' : '#f9fafb');
  const textColor = isFullLayout ? '#ffffff' : (sectionData.text_color || (isDark ? '#ffffff' : '#111827'));
  const subtitleColor = isFullLayout ? '#e5e7eb' : (sectionData.text_color || (isDark ? '#d1d5db' : '#4b5563'));
  const minHeight = isFullLayout ? '85vh' : (sectionData.height ? `${sectionData.height}px` : '100vh');

  // Reusable text content block
  const textContent = (
    <div className={`space-y-6 sm:space-y-8 ${
      (isFullLayout || isCenter) ? 'text-center max-w-4xl mx-auto' : 'text-center lg:text-left'
    }`}>
      {sectionData.announcement_text && (
        <div
          className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border shadow-sm backdrop-blur-sm"
          style={{
            borderColor: isFullLayout ? '#10b77f' : brandColor,
            color: isFullLayout ? '#ffffff' : brandColor,
            backgroundColor: isFullLayout ? 'rgba(16, 183, 127, 0.25)' : `${brandColor}15`
          }}
        >
          {sectionData.announcement_text}
        </div>
      )}
      <h1
        className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight drop-shadow-md"
        style={{ color: textColor }}
        role="banner"
        aria-label="Main heading"
      >
        {displayTitle}
      </h1>
      <p
        className="text-lg md:text-xl leading-relaxed font-medium max-w-3xl mx-auto lg:mx-0 drop-shadow-sm"
        style={{ color: subtitleColor, opacity: 0.95 }}
      >
        {displaySubtitle}
      </p>
      <div className={`flex flex-col sm:flex-row gap-3 sm:gap-4 ${
        (isFullLayout || isCenter) ? 'justify-center' : 'justify-center lg:justify-start'
      }`}>
        <a
          href={displayBtnLink}
          className="px-8 py-4 rounded-xl transition-all font-bold text-base flex items-center justify-center gap-2 border shadow-lg hover:shadow-2xl hover:scale-105 transform duration-200"
          style={{ backgroundColor: brandColor, color: 'white', borderColor: brandColor }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'white';
            e.currentTarget.style.color = brandColor;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = brandColor;
            e.currentTarget.style.color = 'white';
          }}
          aria-label="Action Button"
        >
          {displayBtnText}
          <ArrowRight size={18} />
        </a>
        <Link
          href={route('login')}
          className="border px-8 py-4 rounded-xl transition-all font-semibold text-base flex items-center justify-center gap-2 hover:bg-white/20 backdrop-blur-sm shadow-sm"
          style={{ borderColor: isFullLayout ? 'rgba(255,255,255,0.4)' : brandColor, color: isFullLayout ? '#ffffff' : brandColor }}
          aria-label="Login to existing account"
        >
          <Play size={18} />
          {sectionData.secondary_button_text || t('Login')}
        </Link>
      </div>

      {sectionData.stats && sectionData.stats.length > 0 && (
        <div className={`grid grid-cols-3 gap-4 sm:gap-6 lg:gap-8 pt-8 sm:pt-12 ${
          (isFullLayout || isCenter) ? 'max-w-lg mx-auto' : ''
        }`}>
          {sectionData.stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold" style={{ color: textColor }}>
                {stat.value}
              </div>
              <div className="text-sm font-medium" style={{ color: subtitleColor, opacity: 0.85 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Reusable image block with 4s auto-slide for Split layouts
  const imageContent = (
    <div className="relative w-full group">
      <div className="relative overflow-hidden rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-800">
        <img
          key={`hero-slide-${activeSlide}-${currentHeroImage}`}
          src={currentHeroImage}
          alt="Hero"
          className="w-full h-auto max-h-[520px] object-cover transition-all duration-700 ease-in-out"
        />

        {/* Multi-image indicator dots */}
        {bannerImages.length >= 2 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-2 z-10">
            {bannerImages.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveSlide(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  idx === activeSlide % bannerImages.length
                    ? 'w-7 bg-white shadow-lg'
                    : 'w-2.5 bg-white/50 hover:bg-white/90'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="absolute -top-4 -right-4 w-16 h-16 bg-gray-200 rounded-full opacity-50 pointer-events-none"></div>
      <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-gray-300 rounded-full opacity-40 pointer-events-none"></div>
    </div>
  );

  // Render layout based on imagePosition / layout selection
  const renderLayoutContent = () => {
    if (isFullLayout) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] py-16">
          {textContent}
        </div>
      );
    }

    if (isCenter) {
      return (
        <div className="flex flex-col items-center justify-center space-y-12 max-w-5xl mx-auto">
          {textContent}
          <div className="w-full max-w-3xl">
            {imageContent}
          </div>
        </div>
      );
    }

    if (isSplitLeft) {
      return (
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
          {imageContent}
          {textContent}
        </div>
      );
    }

    // Default: 'split-right' / 'right'
    return (
      <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
        {textContent}
        {imageContent}
      </div>
    );
  };

  return (
    <section
      id="hero"
      className="pt-16 flex items-center relative overflow-hidden transition-all duration-700"
      style={{
        minHeight,
        ...(isFullLayout && currentHeroImage ? {
          backgroundImage: `url(${currentHeroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        } : {
          backgroundColor: backgroundColor,
        })
      }}
    >
      {/* Full screen dark overlay gradient */}
      {isFullLayout && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/65 to-black/40 z-0 transition-opacity duration-700" />
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 w-full">
        {renderLayoutContent()}
      </div>

      {/* Slide indicator dots for Full Screen background layout */}
      {isFullLayout && bannerImages.length >= 2 && (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-2.5 z-20">
          {bannerImages.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveSlide(idx)}
              className={`h-3 rounded-full transition-all duration-300 ${
                idx === activeSlide % bannerImages.length
                  ? 'w-8 bg-emerald-400 shadow-lg'
                  : 'w-3 bg-white/40 hover:bg-white/80'
              }`}
              aria-label={`Go to background slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
