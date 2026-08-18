import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
    Search, Scale, Shield, Building2, Home, Truck, FileText, 
    Gavel, HeartHandshake, Briefcase, Award, Coins, MapPin, 
    Phone, Star, MessageSquare, X, Filter, User, ArrowRight
} from 'lucide-react';

interface SubCategory {
    id: string;
    name: string;
}

interface Category {
    id: string;
    name: string;
    icon: React.ComponentType<any>;
    subCategories: SubCategory[];
}

interface Lawyer {
    id: number;
    name: string;
    role: string;
    avatar: string;
    rating: number;
    ilawScore: number;
    experienceYears: number;
    location: string;
    phone: string;
    email: string;
    categories: string[];
    subCategories: string[];
    bio: string;
    casesSolved: number;
    specialityBadges: string[];
}

export default function ConsultingLawyersDirectory({ brandColor = '#3b82f6' }: { brandColor?: string }) {
    const { t } = useTranslation();

    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedLawyer, setSelectedLawyer] = useState<Lawyer | null>(null);

    // 12 Legal Categories with exact sub-categories requested
    const categories: Category[] = [
        {
            id: 'insurance',
            name: t('1. Bảo hiểm'),
            icon: Shield,
            subCategories: [
                { id: 'bhxh', name: t('Bảo hiểm xã hội (BHXH bắt buộc, tự nguyện, rút BHXH 1 lần)') },
                { id: 'bhyt', name: t('Bảo hiểm y tế (BHYT)') },
                { id: 'bhtn', name: t('Bảo hiểm thất nghiệp') },
                { id: 'bhnt', name: t('Bảo hiểm nhân thọ / phi nhân thọ') },
                { id: 'bhts', name: t('Bảo hiểm tài sản (Xe cơ giới, cháy nổ...)') }
            ]
        },
        {
            id: 'civil',
            name: t('2. Dân sự'),
            icon: Scale,
            subCategories: [
                { id: 'hd_dansu', name: t('Tranh chấp hợp đồng dân sự (vay mượn, mua bán, tặng cho...)') },
                { id: 'boithuong_ngoai_hd', name: t('Bồi thường thiệt hại ngoài hợp đồng (do tai nạn, danh dự...)') },
                { id: 'tranhchap_taisan', name: t('Tranh chấp tài sản và quyền sở hữu') },
                { id: 'doino', name: t('Đòi nợ, thu hồi nợ cá nhân / tổ chức') },
                { id: 'quyen_nhanthan', name: t('Xác lập quyền nhân thân (đổi tên, chuyển đổi giới tính...)') }
            ]
        },
        {
            id: 'land',
            name: t('3. Đất đai'),
            icon: Home,
            subCategories: [
                { id: 'ranhgioi_qsd', name: t('Tranh chấp ranh giới, quyền sử dụng đất') },
                { id: 'sodo_sohong', name: t('Thủ tục cấp sổ đỏ, sổ hồng (Giấy chứng nhận QSDĐ)') },
                { id: 'muaban_nhadat', name: t('Chuyển nhượng, mua bán, tặng cho, thế chấp nhà đất') },
                { id: 'denbu_giaitoai', name: t('Đền bù, giải tỏa, thu hồi đất, bồi thường tái định cư') },
                { id: 'thue_matbang', name: t('Hợp đồng thuê, cho thuê mặt bằng / đất đai') }
            ]
        },
        {
            id: 'corporate',
            name: t('4. Doanh nghiệp (KD - Thương mại)'),
            icon: Building2,
            subCategories: [
                { id: 'thanhlap_giaithe', name: t('Thủ tục thành lập, thay đổi, giải thể, phá sản doanh nghiệp') },
                { id: 'tranhchap_noibo', name: t('Tranh chấp nội bộ (cổ đông, thành viên góp vốn)') },
                { id: 'ma_enterprise', name: t('Mua bán, sáp nhập doanh nghiệp (M&A)') },
                { id: 'hd_thuongmai', name: t('Tranh chấp hợp đồng kinh tế, thương mại') },
                { id: 'giayphepon', name: t('Xin cấp các loại giấy phép con (ATTP, PCCC...)') }
            ]
        },
        {
            id: 'traffic',
            name: t('5. Giao thông - Vận tải'),
            icon: Truck,
            subCategories: [
                { id: 'viphanchinh_gt', name: t('Xử lý vi phạm hành chính trong giao thông') },
                { id: 'boithuong_tainan_gt', name: t('Bồi thường thiệt hại do tai nạn giao thông') },
                { id: 'hd_vanchuyen', name: t('Tranh chấp hợp đồng vận chuyển hàng hóa, hành khách') },
                { id: 'capphep_vantai', name: t('Thủ tục cấp phép kinh doanh vận tải') }
            ]
        },
        {
            id: 'administrative',
            name: t('6. Hành chính'),
            icon: FileText,
            subCategories: [
                { id: 'khieu_nai_qd', name: t('Khiếu nại, khởi kiện các quyết định hành chính') },
                { id: 'khoikien_hanhvi', name: t('Khởi kiện hành vi hành chính của cơ quan nhà nước') },
                { id: 'thutuc_hanhchinhcong', name: t('Tư vấn các thủ tục hành chính công') }
            ]
        },
        {
            id: 'criminal',
            name: t('7. Hình sự'),
            icon: Gavel,
            subCategories: [
                { id: 'toi_tinhmang', name: t('Các tội xâm phạm tính mạng, sức khỏe, danh dự') },
                { id: 'toi_kinhte', name: t('Các tội phạm về kinh tế (lừa đảo, trốn thuế...)') },
                { id: 'toi_chucvu', name: t('Các tội phạm về chức vụ (tham nhũng, nhận hối lộ...)') },
                { id: 'toi_matuy', name: t('Các tội phạm về ma túy') },
                { id: 'baochua_bican', name: t('Bào chữa cho bị can, bị cáo hoặc bảo vệ người bị hại') }
            ]
        },
        {
            id: 'family',
            name: t('8. Hôn nhân gia đình'),
            icon: HeartHandshake,
            subCategories: [
                { id: 'lyhon', name: t('Ly hôn (thuận tình ly hôn, đơn phương ly hôn)') },
                { id: 'nuoicon_capduong', name: t('Tranh chấp quyền nuôi con và cấp dưỡng') },
                { id: 'taisan_vochong', name: t('Phân chia tài sản chung/riêng trong và sau ly hôn') },
                { id: 'xacnhan_cha_me_con', name: t('Xác nhận cha, mẹ, con') },
                { id: 'lyhon_nuocngoai', name: t('Kết hôn hoặc ly hôn có yếu tố nước ngoài') }
            ]
        },
        {
            id: 'labor',
            name: t('9. Lao động'),
            icon: Briefcase,
            subCategories: [
                { id: 'tranhchap_hdld', name: t('Tranh chấp hợp đồng lao động') },
                { id: 'sathai_trailuat', name: t('Xử lý kỷ luật lao động, sa thải trái pháp luật') },
                { id: 'luong_trocap', name: t('Tranh chấp tiền lương, tiền thưởng, trợ cấp thôi việc') },
                { id: 'tainan_laodong', name: t('Tai nạn lao động, bệnh nghề nghiệp') },
                { id: 'gpld_nuocngoai', name: t('Cấp giấy phép lao động cho người nước ngoài tại Việt Nam') }
            ]
        },
        {
            id: 'ip',
            name: t('10. Sở hữu trí tuệ'),
            icon: Award,
            subCategories: [
                { id: 'nhanhieu_logo', name: t('Đăng ký bảo hộ nhãn hiệu, logo, thương hiệu') },
                { id: 'banquyen_tacgia', name: t('Đăng ký bản quyền tác giả, tác phẩm') },
                { id: 'sangche_kieudang', name: t('Đăng ký sáng chế, giải pháp hữu ích, kiểu dáng công nghiệp') },
                { id: 'viphamp_shtt', name: t('Xử lý hành vi vi phạm, xâm phạm SHTT (hàng giả, hàng nhái)') }
            ]
        },
        {
            id: 'inheritance',
            name: t('11. Thừa kế - Di chúc'),
            icon: FileText,
            subCategories: [
                { id: 'dichuc_hople', name: t('Tư vấn lập di chúc hợp pháp, lưu giữ di chúc') },
                { id: 'disan_theo_dichuc', name: t('Phân chia di sản thừa kế theo di chúc') },
                { id: 'disan_theo_phapluat', name: t('Phân chia di sản thừa kế theo pháp luật') },
                { id: 'tranhchap_thuake', name: t('Tranh chấp hàng thừa kế, truất quyền thừa kế') }
            ]
        },
        {
            id: 'tax',
            name: t('12. Thuế'),
            icon: Coins,
            subCategories: [
                { id: 'thue_tncn', name: t('Tư vấn thuế thu nhập cá nhân (TNCN)') },
                { id: 'thue_tndn', name: t('Tư vấn thuế thu nhập doanh nghiệp (TNDN)') },
                { id: 'thue_gtgt_vat', name: t('Thuế giá trị gia tăng (GTGT/VAT), thuế xuất nhập khẩu') },
                { id: 'khieunai_truythue', name: t('Giải quyết khiếu nại về truy thu thuế, quyết toán thuế') }
            ]
        }
    ];

    // Mock Senior Attorneys Directory
    const lawyersList: Lawyer[] = [
        {
            id: 1,
            name: 'Luật sư Nguyễn Hồng Lĩnh',
            role: 'Luật sư Điều hành / Trưởng ban Tranh tụng',
            avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400',
            rating: 4.9,
            ilawScore: 9.8,
            experienceYears: 18,
            location: 'Hồ Chí Minh',
            phone: '0902 524 567',
            email: 'nguyenhonglinh@lawfirm.vn',
            categories: ['criminal', 'civil', 'land'],
            subCategories: ['toi_tinhmang', 'toi_kinhte', 'baochua_bican', 'hd_dansu', 'ranhgioi_qsd', 'sodo_sohong'],
            bio: 'Hơn 18 năm kinh nghiệm bào chữa các vụ án hình sự trọng điểm và đại diện tố tụng tranh chấp đất đai phức tạp tại Tòa án nhân dân các cấp.',
            casesSolved: 320,
            specialityBadges: ['Bào chữa Hình sự', 'Sổ đỏ & Đất đai', 'Tranh tụng Tòa án']
        },
        {
            id: 2,
            name: 'Luật sư Nguyễn Cao Trí',
            role: 'Luật sư Cấp cao / Chuyên gia M&A & Thuế Doanh Nghiệp',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
            rating: 5.0,
            ilawScore: 9.9,
            experienceYears: 15,
            location: 'Hà Nội',
            phone: '0912 345 678',
            email: 'caotri@lawfirm.vn',
            categories: ['corporate', 'tax', 'ip'],
            subCategories: ['thanhlap_giaithe', 'tranhchap_noibo', 'ma_enterprise', 'hd_thuongmai', 'thue_tndn', 'nhanhieu_logo'],
            bio: 'Chuyên tư vấn cấu trúc thương vụ M&A, giải quyết tranh chấp kinh tế thương mại và tư vấn chính sách thuế TNDN cho tập đoàn đa quốc gia.',
            casesSolved: 280,
            specialityBadges: ['M&A Doanh nghiệp', 'Quyết toán Thuế', 'Sở hữu trí tuệ']
        },
        {
            id: 3,
            name: 'Luật sư Trần Thị Mai Hương',
            role: 'Trưởng ban Pháp lý Hôn nhân & Thừa kế',
            avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
            rating: 4.8,
            ilawScore: 9.6,
            experienceYears: 12,
            location: 'Đà Nẵng',
            phone: '0908 999 888',
            email: 'maihuong@lawfirm.vn',
            categories: ['family', 'inheritance', 'civil'],
            subCategories: ['lyhon', 'nuoicon_capduong', 'taisan_vochong', 'dichuc_hople', 'disan_theo_dichuc', 'tranhchap_thuake'],
            bio: 'Tận tâm bảo vệ quyền nuôi con, phân chia tài sản ly hôn minh bạch và tư vấn lập di chúc thừa kế hợp pháp với tinh thần hòa giải.',
            casesSolved: 210,
            specialityBadges: ['Ly hôn & Quyền nuôi con', 'Phân chia Di sản', 'Lập Di chúc']
        },
        {
            id: 4,
            name: 'Luật sư Nguyễn Văn Toàn',
            role: 'Luật sư Cố vấn Đất đai & Lao động',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
            rating: 4.9,
            ilawScore: 9.7,
            experienceYears: 14,
            location: 'Hồ Chí Minh',
            phone: '0938 123 456',
            email: 'vantoan@lawfirm.vn',
            categories: ['land', 'labor', 'insurance', 'administrative'],
            subCategories: ['sodo_sohong', 'denbu_giaitoai', 'tranhchap_hdld', 'sathai_trailuat', 'bhxh', 'khieu_nai_qd'],
            bio: 'Đã giải quyết hơn 200 hồ sơ tranh chấp bồi thường giải phóng mặt bằng, khiếu nại quyết định hành chính và kỷ luật sa thải lao động.',
            casesSolved: 260,
            specialityBadges: ['Cấp Sổ Đỏ / Hồng', 'Tranh chấp Lao động', 'Khiếu nại Hành chính']
        },
        {
            id: 5,
            name: 'Luật sư Lê Hoàng Nam',
            role: 'Chuyên gia Giao thông & Bảo hiểm',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
            rating: 4.8,
            ilawScore: 9.5,
            experienceYears: 10,
            location: 'Cần Thơ',
            phone: '0977 654 321',
            email: 'hoangnam@lawfirm.vn',
            categories: ['traffic', 'insurance', 'civil'],
            subCategories: ['viphanchinh_gt', 'boithuong_tainan_gt', 'bhts', 'bhnt', 'boithuong_ngoai_hd'],
            bio: 'Chuyên gia tư vấn bồi thường tai nạn giao thông, hỗ trợ đòi quyền lợi bảo hiểm nhân thọ / tài sản và khởi kiện vi phạm hành chính.',
            casesSolved: 190,
            specialityBadges: ['Bồi thường Tai nạn GT', 'Quyền lợi Bảo hiểm', 'Thu hồi Nợ']
        }
    ];

    const currentCategoryObj = useMemo(() => {
        return categories.find(c => c.id === selectedCategory) || null;
    }, [selectedCategory]);

    const activeSubCategories = useMemo(() => {
        if (selectedCategory === 'all') {
            return categories.flatMap(c => c.subCategories);
        }
        return currentCategoryObj ? currentCategoryObj.subCategories : [];
    }, [selectedCategory, currentCategoryObj]);

    const filteredLawyers = useMemo(() => {
        return lawyersList.filter(lawyer => {
            const matchesCategory = selectedCategory === 'all' || lawyer.categories.includes(selectedCategory);
            const matchesSubCategory = selectedSubCategory === 'all' || lawyer.subCategories.includes(selectedSubCategory);

            const query = searchQuery.toLowerCase().trim();
            const matchesSearch = !query || 
                lawyer.name.toLowerCase().includes(query) ||
                lawyer.role.toLowerCase().includes(query) ||
                lawyer.bio.toLowerCase().includes(query) ||
                lawyer.location.toLowerCase().includes(query) ||
                lawyer.specialityBadges.some(b => b.toLowerCase().includes(query));

            return matchesCategory && matchesSubCategory && matchesSearch;
        });
    }, [selectedCategory, selectedSubCategory, searchQuery]);

    return (
        <section className="py-8 bg-slate-50/70 dark:bg-gray-900/90 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Ultra-Compact Page Header & Inline Search Bar */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 mb-6 shadow-sm border border-gray-200/80 dark:border-gray-700/80">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                                <Scale className="w-6 h-6 text-primary" />
                                <span>{t('Luật Sư Tư Vấn Theo Lĩnh Vực')}</span>
                            </h1>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {t('Chọn lĩnh vực & nội dung vướng mắc bên dưới để kết nối với Luật sư phù hợp nhất')}
                            </p>
                        </div>

                        {/* Search Box */}
                        <div className="relative w-full md:w-80">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t('Tìm tên luật sư, sổ đỏ, ly hôn...')}
                                className="w-full pl-9 pr-8 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Compact 1-Line Dropdowns Bar */}
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/60 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Select Category */}
                        <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                                {t('1. Lĩnh vực pháp lý (12 Lĩnh vực)')}
                            </label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => { setSelectedCategory(e.target.value); setSelectedSubCategory('all'); }}
                                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                            >
                                <option value="all">{t('-- Tất cả 12 Lĩnh vực --')}</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name} ({cat.subCategories.length} {t('nội dung')})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Select SubCategory */}
                        <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                                {t('2. Nội dung chi tiết vướng mắc')}
                            </label>
                            <select
                                value={selectedSubCategory}
                                onChange={(e) => setSelectedSubCategory(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                            >
                                <option value="all">{t('-- Tất cả nội dung chi tiết --')}</option>
                                {activeSubCategories.map(sub => (
                                    <option key={sub.id} value={sub.id}>
                                        {sub.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Filter Summary & Count Header */}
                <div className="flex items-center justify-between mb-4 px-1">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                        {t('Hiển thị')} <strong className="text-primary">{filteredLawyers.length}</strong> {t('Luật sư đảm trách')}
                    </span>
                    {(selectedCategory !== 'all' || selectedSubCategory !== 'all' || searchQuery) && (
                        <button
                            onClick={() => { setSelectedCategory('all'); setSelectedSubCategory('all'); setSearchQuery(''); }}
                            className="text-xs font-bold text-red-500 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                            <X className="w-3.5 h-3.5" />
                            {t('Xóa tất cả bộ lọc')}
                        </button>
                    )}
                </div>

                {/* Lawyers Cards Grid (Compact & Clean) */}
                {filteredLawyers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredLawyers.map((lawyer) => (
                            <div
                                key={lawyer.id}
                                className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200/80 dark:border-gray-700/80 shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
                            >
                                <div>
                                    {/* Lawyer Info Row */}
                                    <div className="flex items-center gap-3 mb-3">
                                        <img
                                            src={lawyer.avatar}
                                            alt={lawyer.name}
                                            className="w-14 h-14 rounded-xl object-cover border border-gray-200 dark:border-gray-700 shrink-0"
                                        />
                                        <div className="min-w-0">
                                            <h3 className="text-base font-extrabold text-gray-900 dark:text-white truncate">
                                                {t(lawyer.name)}
                                            </h3>
                                            <p className="text-xs text-primary font-medium truncate">
                                                {t(lawyer.role)}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[11px] font-bold text-amber-500 flex items-center gap-0.5">
                                                    <Star className="w-3 h-3 fill-amber-500" />
                                                    {lawyer.rating}
                                                </span>
                                                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                                    iLAW {lawyer.ilawScore}
                                                </span>
                                                <span className="text-[11px] text-gray-400">
                                                    • {lawyer.experienceYears} {t('năm KN')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bio */}
                                    <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed mb-3">
                                        {t(lawyer.bio)}
                                    </p>

                                    {/* Speciality Badges */}
                                    <div className="flex flex-wrap gap-1.5 mb-4">
                                        {lawyer.specialityBadges.map((badge, idx) => (
                                            <span 
                                                key={idx}
                                                className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/40"
                                            >
                                                {t(badge)}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Compact Actions */}
                                <div className="pt-3 border-t border-gray-100 dark:border-gray-700/60 flex items-center gap-2">
                                    <a
                                        href={`tel:${lawyer.phone}`}
                                        className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-colors cursor-pointer"
                                    >
                                        <Phone className="w-3.5 h-3.5" />
                                        <span>{t('Hotline')}</span>
                                    </a>
                                    <button
                                        onClick={() => setSelectedLawyer(lawyer)}
                                        className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-primary hover:bg-blue-600 text-white text-xs font-bold transition-colors cursor-pointer"
                                    >
                                        <MessageSquare className="w-3.5 h-3.5" />
                                        <span>{t('Đặt Tư Vấn')}</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center border border-gray-200 dark:border-gray-700">
                        <Scale className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">
                            {t('Không tìm thấy luật sư phù hợp')}
                        </h3>
                        <button
                            onClick={() => { setSelectedCategory('all'); setSelectedSubCategory('all'); setSearchQuery(''); }}
                            className="mt-3 inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-blue-600"
                        >
                            {t('Xem tất cả luật sư')}
                        </button>
                    </div>
                )}
            </div>

            {/* Quick Consultation Booking Modal */}
            {selectedLawyer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-6">
                        <button
                            onClick={() => setSelectedLawyer(null)}
                            className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
                            <img
                                src={selectedLawyer.avatar}
                                alt={selectedLawyer.name}
                                className="w-12 h-12 rounded-xl object-cover border shrink-0"
                            />
                            <div>
                                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                    {t(selectedLawyer.name)}
                                </h3>
                                <p className="text-xs text-primary font-medium">{t(selectedLawyer.role)}</p>
                            </div>
                        </div>

                        <form onSubmit={(e) => { e.preventDefault(); setSelectedLawyer(null); alert(t('Yêu cầu tư vấn của bạn đã được gửi. Luật sư sẽ liên hệ lại ngay!')); }} className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    {t('Họ và tên của bạn')} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder={t('Nhập họ tên')}
                                    className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    {t('Số điện thoại liên hệ')} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    required
                                    placeholder={t('Nhập số điện thoại')}
                                    className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    {t('Nội dung vướng mắc')} <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    rows={3}
                                    required
                                    placeholder={t('Mô tả ngắn vướng mắc...')}
                                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white resize-none"
                                />
                            </div>

                            <div className="pt-2 flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedLawyer(null)}
                                    className="flex-1 py-2.5 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-semibold"
                                >
                                    {t('Hủy')}
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-md hover:bg-blue-600"
                                >
                                    {t('Gửi Yêu Cầu')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
}
