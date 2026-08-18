import React, { useState } from 'react';
import { Star, MapPin, Phone, ChevronLeft, ChevronRight, Info, Award, ShieldCheck, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Lawyer {
    id: number;
    name: string;
    avatar: string;
    rating: number;
    reviewsCount: number;
    ilawScore: number;
    location: string;
    practiceAreas: string[];
    phone: string;
    firm: string;
    bio: string;
}

interface TopLawyersSectionProps {
    brandColor?: string;
}

export default function TopLawyersSection({ brandColor = '#3b82f6' }: TopLawyersSectionProps) {
    const { t } = useTranslation();
    const [currentIndex, setCurrentIndex] = useState(0);

    const lawyers: Lawyer[] = [
        {
            id: 1,
            name: 'Nguyễn Văn Toàn',
            avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400',
            rating: 5.0,
            reviewsCount: 918,
            ilawScore: 9.6,
            location: 'Thành phố Hồ Chí Minh',
            practiceAreas: ['Đất đai', 'Dân sự', 'Hình sự', 'Hôn nhân gia đình', 'Doanh nghiệp'],
            phone: '0902 524 567',
            firm: 'CÔNG TY LUẬT TNHH NT INTERNATIONAL LAW FIRM (NTLAW)',
            bio: 'Luật sư Toàn Nguyễn – Người đồng hành pháp lý tin cậy, sáng lập NTLAW với hơn 18 năm kinh nghiệm chuyên sâu tranh tụng và tư vấn doanh nghiệp.'
        },
        {
            id: 2,
            name: 'Nguyễn Cao Trí',
            avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400',
            rating: 5.0,
            reviewsCount: 67,
            ilawScore: 9.4,
            location: 'Thành phố Hồ Chí Minh',
            practiceAreas: ['Dân sự', 'Đất đai', 'Thừa kế - Di chúc', 'Hôn nhân gia đình', 'Hình sự'],
            phone: '0909 058 983',
            firm: 'CÔNG TY LUẬT TNHH SÀI GÒN CHÍ NHÂN',
            bio: 'Luật sư Nguyễn Cao Trí là luật sư sáng lập Công ty Luật Sài Gòn Chí Nhân, thuộc Đoàn luật sư TP.HCM với hơn 15 năm kinh nghiệm.'
        },
        {
            id: 3,
            name: 'Nguyễn Hồng Lĩnh',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
            rating: 5.0,
            reviewsCount: 47,
            ilawScore: 9.2,
            location: 'Thành phố Hồ Chí Minh',
            practiceAreas: ['Đất đai', 'Thừa kế - Di chúc', 'Hôn nhân gia đình', 'Dân sự', 'Hình sự'],
            phone: '0938 398 727',
            firm: 'CÔNG TY LUẬT TNHH NGUYỄN & BROTHERS (NBLaw)',
            bio: 'Luật sư Nguyễn Hồng Lĩnh thuộc Đoàn Luật sư TP.HCM, nhà điều hành NBLaw với uy tín cao trong giải quyết tranh chấp dân sự và bất động sản.'
        },
        {
            id: 4,
            name: 'Trần Thị Mai Hương',
            avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
            rating: 5.0,
            reviewsCount: 154,
            ilawScore: 9.5,
            location: 'Thành phố Hà Nội',
            practiceAreas: ['Đầu tư nước ngoài', 'Doanh nghiệp', 'Sở hữu trí tuệ', 'Tài chính - Ngân hàng'],
            phone: '0988 123 456',
            firm: 'CÔNG TY LUẬT TNHH HÀ NỘI ASSOCIATES',
            bio: 'Luật sư Hương chuyên gia tư vấn cho các tập đoàn đa quốc gia và giải quyết tranh chấp thương mại quốc tế tại Trọng tài thương mại.'
        }
    ];

    const cardsPerPage = 3;
    const maxIndex = Math.max(0, lawyers.length - cardsPerPage);

    const prevSlide = () => {
        setCurrentIndex(prev => Math.max(0, prev - 1));
    };

    const nextSlide = () => {
        setCurrentIndex(prev => Math.min(maxIndex, prev + 1));
    };

    return (
        <section className="py-12 lg:py-16 bg-gradient-to-b from-gray-50 via-white to-gray-50 border-y border-gray-100 relative overflow-hidden">
            <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 lg:mb-12 gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-3">
                            <Award className="w-4 h-4 text-amber-500" />
                            {t('Luật sư uy tín hàng đầu')}
                        </div>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
                            {t('Danh sách Luật sư Hàng đầu')}
                        </h2>
                        <p className="text-gray-600 text-sm sm:text-base mt-2 max-w-2xl">
                            {t('Đội ngũ Luật sư giàu kinh nghiệm, chuyên môn cao, sẵn sàng tư vấn và bảo vệ quyền lợi pháp lý cho bạn.')}
                        </p>
                    </div>

                    {/* Slider Controls */}
                    <div className="flex items-center gap-2 self-start md:self-auto">
                        <button
                            onClick={prevSlide}
                            disabled={currentIndex === 0}
                            className={`p-3 rounded-full border transition-all ${
                                currentIndex === 0
                                    ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                                    : 'border-gray-300 text-gray-700 hover:bg-white hover:border-blue-600 hover:text-blue-600 shadow-sm'
                            }`}
                            aria-label="Previous lawyers"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={nextSlide}
                            disabled={currentIndex >= maxIndex}
                            className={`p-3 rounded-full border transition-all ${
                                currentIndex >= maxIndex
                                    ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                                    : 'border-gray-300 text-gray-700 hover:bg-white hover:border-blue-600 hover:text-blue-600 shadow-sm'
                            }`}
                            aria-label="Next lawyers"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Cards Container */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {lawyers.slice(currentIndex, currentIndex + cardsPerPage).map((lawyer) => (
                        <div
                            key={lawyer.id}
                            className="bg-white rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:-translate-y-1"
                        >
                            {/* Card Top / Basic Info */}
                            <div className="p-6">
                                <div className="flex gap-4 items-start">
                                    {/* Lawyer Avatar */}
                                    <div className="relative flex-shrink-0">
                                        <img
                                            src={lawyer.avatar}
                                            alt={lawyer.name}
                                            className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover border-2 border-gray-100 shadow-inner group-hover:border-blue-500 transition-colors"
                                        />
                                        <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1 shadow">
                                            <ShieldCheck className="w-3.5 h-3.5" />
                                        </div>
                                    </div>

                                    {/* Name & Ratings */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                                            {t(lawyer.name)}
                                        </h3>

                                        {/* Stars & Reviews */}
                                        <div className="flex items-center gap-1 mt-1 text-xs font-semibold text-amber-500">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                            ))}
                                            <span className="text-gray-500 ml-1 font-normal">
                                                ({lawyer.reviewsCount} {t('Nhận xét')})
                                            </span>
                                        </div>

                                        {/* Score iLAW */}
                                        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-gray-600">
                                            <span className="font-medium">{t('Đánh giá')}:</span>
                                            <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-xs">
                                                {lawyer.ilawScore}/10
                                            </span>
                                            <Info className="w-3.5 h-3.5 text-gray-400" />
                                        </div>

                                        {/* Location */}
                                        <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                                            <MapPin className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                                            <span className="truncate">{t(lawyer.location)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Practice Areas */}
                                <div className="mt-5 pt-4 border-t border-gray-100">
                                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                                        {t('LĨNH VỰC HÀNH NGHỀ')}
                                    </span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {lawyer.practiceAreas.map((area, idx) => (
                                            <span
                                                key={idx}
                                                className="text-xs bg-gray-100 text-gray-700 font-medium px-2.5 py-1 rounded-md group-hover:bg-blue-50 group-hover:text-blue-700 transition-colors"
                                            >
                                                {t(area)}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Phone Badge Button */}
                                <div className="mt-4">
                                    <a
                                        href={`tel:${lawyer.phone.replace(/\s+/g, '')}`}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-500 text-gray-900 text-sm font-bold rounded-lg transition-all shadow-sm hover:shadow"
                                    >
                                        <Phone className="w-4 h-4 fill-gray-900" />
                                        <span>{lawyer.phone}</span>
                                    </a>
                                </div>
                            </div>

                            {/* Card Bottom / Lawyer Bio */}
                            <div className="p-6 bg-gray-50/70 border-t border-gray-100 flex-1 flex flex-col justify-between">
                                <div>
                                    <span className="text-xs font-bold text-gray-900 uppercase tracking-wider block mb-1">
                                        {t('Thông tin luật sư')}
                                    </span>
                                    <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                                        {t(lawyer.bio)}
                                    </p>
                                </div>

                                <div className="mt-4 pt-3 flex items-center justify-between border-t border-gray-200/50">
                                    <span className="text-xs text-gray-500 font-medium truncate max-w-[200px]">
                                        {t(lawyer.firm)}
                                    </span>
                                    <a
                                        href={`tel:${lawyer.phone.replace(/\s+/g, '')}`}
                                        className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                                    >
                                        {t('Xem thêm')}
                                        <ArrowRight className="w-3 h-3" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination Dots */}
                <div className="flex justify-center items-center gap-2 mt-8">
                    {[...Array(maxIndex + 1)].map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentIndex(i)}
                            className={`h-2 rounded-full transition-all ${
                                currentIndex === i ? 'w-8 bg-blue-600' : 'w-2 bg-gray-300 hover:bg-gray-400'
                            }`}
                            aria-label={`Go to slide ${i + 1}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
