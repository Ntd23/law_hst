import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from '@inertiajs/react';
import {
  Building2,
  Scale,
  Award,
  Users,
  ShieldCheck,
  Zap,
  Briefcase,
  CheckCircle2,
  Lock,
  Globe,
  Sparkles,
  ArrowRight,
  Star,
  Quote,
  Clock,
  FileText,
  TrendingUp,
  Headphones
} from 'lucide-react';
import LegalNewsSection from './LegalNewsSection';

interface Props {
  brandColor?: string;
  pageContent?: string;
  articles?: any[];
}

export default function AboutCompanyView({ brandColor = '#3b82f6', pageContent, articles }: Props) {
  const { t } = useTranslation();

  const stats = [
    { number: '500+', label: t('Công ty & Văn phòng Luật tin dùng'), icon: Building2 },
    { number: '10,000+', label: t('Luật sư & Trợ lý pháp lý hoạt động'), icon: Users },
    { number: '250,000+', label: t('Vụ án & Hồ sơ xử lý an toàn'), icon: Scale },
    { number: '99.9%', label: t('Độ tin cậy & Cam kết Uptime'), icon: ShieldCheck },
  ];

  const trustedFirms = [
    {
      name: 'Apex & Partners International Law',
      type: t('Hãng luật Doanh nghiệp & FDI'),
      location: 'Hà Nội & TP. Hồ Chí Minh',
      cases: '3,200+ ' + t('Vụ án'),
      rating: '5.0',
      specialty: t('Tư vấn M&A, Đầu tư nước ngoài & Tranh chấp thương mại quốc tế'),
      avatar: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=400',
      badge: t('Hãng Luật Tiêu Biểu')
    },
    {
      name: 'Văn Phòng Luật Sư Thăng Long & Cộng Sự',
      type: t('Văn phòng Luật Tranh tụng'),
      location: 'Hà Nội',
      cases: '5,000+ ' + t('Vụ án'),
      rating: '4.9',
      specialty: t('Bào chữa Hình sự kinh tế, Tranh tụng Đất đai & Dân sự phức tạp'),
      avatar: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=400',
      badge: t('Top Tranh Tụng')
    },
    {
      name: 'Saigon Legal & Associates',
      type: t('Công ty Luật Bất động sản & Đất đai'),
      location: 'TP. Hồ Chí Minh & Đà Nẵng',
      cases: '2,800+ ' + t('Vụ án'),
      rating: '5.0',
      specialty: t('Tư vấn Luật Đất đai 2024, Cấp phép dự án & Giải phóng mặt bằng'),
      avatar: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=400',
      badge: t('Chuyên Gia Đất Đai')
    },
    {
      name: 'VinaPat Intellectual Property Firm',
      type: t('Hãng Luật Sở hữu Trí tuệ'),
      location: 'Hà Nội, TP. HCM, Singapore',
      cases: '4,100+ ' + t('Bản quyền'),
      rating: '4.9',
      specialty: t('Bảo hộ Nhãn hiệu, Sáng chế công nghệ & Xử lý xâm phạm quyền SHTT'),
      avatar: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=400',
      badge: t('Top IP Firm')
    },
    {
      name: 'VietTrust Corporate & Finance Law',
      type: t('Tư vấn Doanh nghiệp & Tài chính'),
      location: 'TP. Hồ Chí Minh',
      cases: '1,900+ ' + t('Hợp đồng'),
      rating: '5.0',
      specialty: t('Tái cấu trúc doanh nghiệp, Thuế nhà thầu FCT & Thẩm định pháp lý'),
      avatar: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&q=80&w=400',
      badge: t('Đối Tác Doanh Nghiệp')
    },
    {
      name: 'Văn Phòng Luật Sư Phúc An Khang',
      type: t('Văn phòng Luật Gia đình & Thừa kế'),
      location: 'Hà Nội & Hải Phòng',
      cases: '3,500+ ' + t('Thân chủ'),
      rating: '4.9',
      specialty: t('Hôn nhân gia đình, Phân chia di sản thừa kế & Hợp đồng dân sự'),
      avatar: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80&w=400',
      badge: t('Uy Tín 15+ Năm')
    }
  ];

  const whyChooseUs = [
    {
      icon: ShieldCheck,
      title: t('Bảo mật Dữ liệu Cấp độ Ngân hàng'),
      desc: t('Mã hóa chuẩn AES-256, phân quyền đa tầng và cách ly dữ liệu độc lập giữa các công ty theo chuẩn mực bảo mật thông tin thân chủ của Luật Luật sư.')
    },
    {
      icon: Briefcase,
      title: t('Quản trị Vụ án & Tố tụng Liền mạch'),
      desc: t('Theo dõi toàn bộ vòng đời vụ việc: từ tiếp nhận thân chủ, chỉ định luật sư thụ lý, quản lý chứng cứ đến lịch xét xử và cập nhật án lệ.')
    },
    {
      icon: Sparkles,
      title: t('Tùy biến Nhận diện Thương hiệu Riêng'),
      desc: t('Mỗi công ty sở hữu không gian làm việc độc quyền với Logo riêng, màu sắc chủ đạo, mẫu hóa đơn và Cổng tra cứu riêng biệt cho thân chủ.')
    },
    {
      icon: Clock,
      title: t('Tự động hóa Biểu phí & Tính giờ'),
      desc: t('Đo lường thời gian tư vấn (Billable Hours), quản lý tạm ứng, xuất hóa đơn tự động và theo dõi đối soát doanh thu theo từng luật sư.')
    },
    {
      icon: Zap,
      title: t('Trợ lý AI & Tích hợp Lịch xét xử'),
      desc: t('Tự động đồng bộ lịch với Google Calendar, hỗ trợ AI tóm tắt hồ sơ pháp lý, soạn thảo văn bản và gửi thông báo nhắc hạn tự động.')
    },
    {
      icon: Headphones,
      title: t('Hỗ trợ Chuyên trách & Cam kết SLA 99.9%'),
      desc: t('Đội ngũ kỹ thuật đồng hành 24/7, đào tạo chuyển giao công nghệ trực tiếp cho toàn bộ luật sư và sao lưu dữ liệu tự động mỗi ngày.')
    }
  ];

  const testimonials = [
    {
      quote: t('Nền tảng giúp văn phòng chúng tôi quản lý hơn 200 vụ án cùng lúc mà không xảy ra sai sót hay trễ hạn tòa. Toàn bộ 35 luật sư phối hợp cực kỳ mượt mà.'),
      author: 'LS. Nguyễn Văn Hùng',
      role: t('Luật sư Điều hành - Apex & Partners'),
      image: '/images/testimonials/vietnamese-managing-lawyer.png'
    },
    {
      quote: t('Tính năng tùy biến thương hiệu riêng và Cổng thân chủ giúp hình ảnh văn phòng trở nên vô cùng chuyên nghiệp. Thân chủ có thể chủ động xem tiến độ vụ án bất cứ lúc nào.'),
      author: 'LS. Trần Thị Mai Anh',
      role: t('Trưởng Văn phòng Luật sư Thăng Long'),
      image: '/images/testimonials/vietnamese-managing-lawyer.png'
    },
    {
      quote: t('Hệ thống tính giờ tư vấn và quản lý biểu phí minh bạch giúp doanh thu công ty tăng trưởng 40% trong năm qua. Một giải pháp chuyển đổi số không thể thiếu cho nghề luật.'),
      author: 'LS. Lê Hoàng Nam',
      role: t('Giám đốc Hãng Luật VietTrust'),
      image: '/images/testimonials/vietnamese-managing-lawyer.png'
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      
      {/* 1. Hero Section */}
      <section className="relative pt-10 pb-16 sm:pt-14 sm:pb-20 bg-gradient-to-b from-blue-50/80 via-white to-gray-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-950 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-100/80 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border border-blue-200/60 dark:border-blue-700/50 shadow-xs">
            <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>{t('NỀN TẢNG QUẢN LÝ PHÁP LÝ HÀNG ĐẦU')}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight max-w-4xl mx-auto">
            {t('Được Hơn 500+ Công Ty Luật & Văn Phòng Luật Sư Uy Tín Tin Dùng')}
          </h1>

          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {t('Giải pháp công nghệ pháp lý chuyên sâu giúp các tổ chức hành nghề luật sư số hóa toàn diện: quản trị vụ án, bảo mật hồ sơ thân chủ, theo dõi phiên tòa và nâng tầm vị thế thương hiệu.')}
          </p>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white shadow-lg hover:shadow-xl hover:opacity-95 transition-all transform hover:-translate-y-0.5"
              style={{ backgroundColor: brandColor }}
            >
              <span>{t('Đăng Ký Dùng Thử Miễn Phí')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/plans"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
            >
              <span>{t('Xem Bảng Giá Gói Dịch Vụ')}</span>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-8 max-w-5xl mx-auto">
            {stats.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-md text-center space-y-1.5 hover:shadow-lg transition-shadow">
                  <div className="w-10 h-10 mx-auto rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight" style={{ color: brandColor }}>
                    {item.number}
                  </div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {item.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. Featured Partner Law Firms Section */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
            {t('DANH SÁCH KHÁCH HÀNG TIÊU BIỂU')}
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
            {t('Các Hãng Luật & Văn Phòng Luật Sư Hàng Đầu')}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            {t('Những tổ chức hành nghề luật sư uy tín đang vận hành toàn bộ hệ thống quản lý tố tụng và thân chủ trên nền tảng của chúng tôi')}
          </p>
        </div>

        {/* Law Firms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trustedFirms.map((firm, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group"
            >
              <div className="relative h-44 overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img
                  src={firm.avatar}
                  alt={firm.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-gray-950/30 to-transparent flex items-end p-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-600 text-white shadow-xs">
                    <Award className="w-3.5 h-3.5" />
                    {firm.badge}
                  </span>
                </div>
              </div>

              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span className="font-semibold text-blue-600 dark:text-blue-400">{firm.type}</span>
                    <span className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {firm.rating}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {firm.name}
                  </h3>

                  <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
                    {firm.specialty}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-gray-400" />
                    {firm.location}
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                    {firm.cases}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Why Leading Firms Choose Us */}
      <section className="py-14 sm:py-20 bg-gray-50/80 dark:bg-gray-900/50 border-y border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
              {t('TIÊU CHUẨN VƯỢT TRỘI')}
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
              {t('Tại Sao Các Hãng Luật Lớn Lựa Chọn Chúng Tôi?')}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              {t('Được thiết kế chuyên biệt theo quy trình thực chiến của nghề luật sư tại Việt Nam và chuẩn mực quốc tế')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyChooseUs.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-gray-900 p-6 sm:p-7 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm hover:shadow-md transition-all space-y-3.5 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Testimonials from Managing Partners */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
            {t('ĐÁNH GIÁ THỰC TẾ')}
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
            {t('Luật Sư Điều Hành Nói Gì Về Chúng Tôi?')}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            {t('Lắng nghe chia sẻ trực tiếp từ những người đứng đầu các hãng luật uy tín')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((item, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-gray-900 p-6 sm:p-7 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-md flex flex-col justify-between space-y-6 relative"
            >
              <Quote className="w-8 h-8 text-blue-200 dark:text-blue-900/50 absolute top-4 right-4" />
              
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed italic relative z-10">
                "{item.quote}"
              </p>

              <div className="flex items-center gap-3.5 pt-4 border-t border-gray-100 dark:border-gray-800">
                <img
                  src={item.image}
                  alt={item.author}
                  className="w-11 h-11 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                />
                <div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                    {item.author}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {item.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. CTA Banner */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-14">
        <div
          className="rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden shadow-2xl space-y-5"
          style={{
            background: `linear-gradient(135deg, ${brandColor} 0%, #1e1b4b 100%)`
          }}
        >
          <div className="relative z-10 max-w-3xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              {t('Sẵn Sàng Đưa Hãng Luật Của Bạn Lên Tầm Cao Mới?')}
            </h2>
            <p className="text-sm sm:text-base text-blue-100 leading-relaxed">
              {t('Gia nhập cộng đồng hơn 500+ công ty luật tiên phong chuyển đổi số ngay hôm nay. Trải nghiệm đầy đủ tính năng trong 14 ngày dùng thử miễn phí.')}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="/register"
                className="px-6 py-3 rounded-xl text-sm font-bold bg-white text-gray-900 shadow-md hover:bg-gray-100 transition-all transform hover:-translate-y-0.5"
              >
                {t('Bắt Đầu Dùng Thử Miễn Phí')}
              </Link>
              <Link
                href="/plans"
                className="px-6 py-3 rounded-xl text-sm font-bold bg-blue-900/60 text-white border border-blue-400/40 hover:bg-blue-900/80 transition-all"
              >
                {t('Xem Bảng Giá Gói Dịch Vụ')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Legal News Section */}
      <section className="bg-gray-50 dark:bg-gray-900/60 py-12 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
              {t('BẢN TIN PHÁP LÝ & HOẠT ĐỘNG')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
              {t('Tin Tức Pháp Luật & Bài Viết Chuyên Môn')}
            </h2>
          </div>

          <LegalNewsSection brandColor={brandColor} articles={articles} />
        </div>
      </section>

    </div>
  );
}
