import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Scale, Award, Users, Building2, BookOpen, CheckCircle2, ArrowRight } from 'lucide-react';
import LegalNewsSection from './LegalNewsSection';

interface Props {
  brandColor?: string;
  pageContent?: string;
}

export default function AboutCompanyView({ brandColor = '#3b82f6', pageContent }: Props) {
  const { t } = useTranslation();

  const stats = [
    { number: '15+', label: t('Năm kinh nghiệm hoạt động'), icon: Building2 },
    { number: '5,000+', label: t('Vụ án & Hợp đồng thành công'), icon: Scale },
    { number: '98%', label: t('Tỷ lệ Thân chủ hài lòng'), icon: Award },
    { number: '50+', label: t('Luật sư & Chuyên gia pháp lý'), icon: Users },
  ];

  const coreValues = [
    {
      title: t('Bảo mật tuyệt đối 100%'),
      desc: t('Mọi thông tin cá nhân, hồ sơ tài liệu và nội dung trao đổi của Thân chủ được giữ bí mật theo Luật Luật sư.'),
      icon: ShieldCheck
    },
    {
      title: t('Chuyên môn sâu & Thực chiến'),
      desc: t('Đội ngũ Luật sư từng tham gia bào chữa các vụ án kinh tế lớn và đàm phán hợp đồng M&A xuyên quốc gia.'),
      icon: Scale
    },
    {
      title: t('Tận tâm & Phản hồi nhanh'),
      desc: t('Đồng hành 24/7 cùng Thân chủ, cam kết phản hồi và xử lý yêu cầu tư vấn trong vòng 2 giờ làm việc.'),
      icon: CheckCircle2
    },
    {
      title: t('Tối ưu giải pháp & Chi phí'),
      desc: t('Đưa ra phương án phòng ngừa rủi ro lâu dài, minh bạch chi phí dịch vụ pháp lý từ ban đầu.'),
      icon: Award
    }
  ];

  const practiceHighlights = [
    {
      title: t('Đất đai & Bất động sản (Luật Đất đai 2024)'),
      desc: t('Tư vấn thủ tục cấp Sổ đỏ/Sổ hồng, bồi thường giải phóng mặt bằng, giải quyết tranh chấp ranh giới và nhà đất phức tạp.')
    },
    {
      title: t('Tranh tụng & Bào chữa Hình sự'),
      desc: t('Đại diện bào chữa cho cá nhân và lãnh đạo doanh nghiệp trong các vụ án hình sự kinh tế, chức vụ ngay từ giai đoạn điều tra ban đầu.')
    },
    {
      title: t('Doanh nghiệp, Đầu tư FDI & M&A'),
      desc: t('Thẩm định pháp lý M&A, xin giấy chứng nhận đầu tư (IRC/ERC), soạn thảo hợp đồng thương mại và quản trị rủi ro nội bộ.')
    },
    {
      title: t('Hôn nhân Gia đình & Thừa kế'),
      desc: t('Tư vấn ly hôn thuận tình/đơn phương, phân chia tài sản chung/riêng, đàm phán quyền nuôi con và khai nhận di sản thừa kế.')
    },
    {
      title: t('Lao động & Hợp đồng Thương mại'),
      desc: t('Giải quyết tranh chấp sa thải trái pháp luật, rà soát Nội quy lao động, thỏa thuận bảo mật NDA/NCA và hợp đồng kinh tế.')
    },
    {
      title: t('Sở hữu Trí tuệ & Thuế Doanh nghiệp'),
      desc: t('Đăng ký bảo hộ Nhãn hiệu, bản quyền tác giả, xử lý vi phạm bản quyền và tư vấn nghĩa vụ thuế nhà thầu FCT.')
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      
      {/* 1. Hero Banner */}
      <section className="relative pt-6 pb-10 sm:pt-8 sm:pb-12 bg-gradient-to-b from-blue-50/70 via-white to-gray-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-950 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight max-w-4xl mx-auto">
            {t('Giới Thiệu Về Công Ty & Đội Ngũ Luật Sư Tranh Tụng')}
          </h1>

          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {t('Hơn 15 năm khẳng định vị thế hãng luật hàng đầu tại Việt Nam, chuyên cung cấp giải pháp pháp lý toàn diện, bảo vệ quyền lợi hợp pháp tối đa cho Thân chủ và Doanh nghiệp.')}
          </p>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5 pt-4 max-w-5xl mx-auto">
            {stats.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-md text-center space-y-1">
                  <Icon className="w-5 h-5 mx-auto text-blue-600 dark:text-blue-400" />
                  <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight" style={{ color: brandColor }}>
                    {item.number}
                  </div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {item.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. Detailed Company Content Section */}
      <section className="py-10 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        
        {/* Story & Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              {t('Quá Trình Hình Thành & Phát Triển')}
            </h2>
            
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
              {t('Được thành lập từ năm 2010, Văn phòng Luật sư Advocate & Partners đã quy tụ đội ngũ Luật sư cấp cao, Chuyên gia pháp lý và Cựu thẩm phán giàu kinh nghiệm tranh tụng. Chúng tôi không chỉ cung cấp tư vấn thuần túy mà luôn nghiên cứu kỹ lưỡng bản chất vụ việc để đưa ra chiến lược ứng phó tối ưu.')}
            </p>

            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
              {t('Trong suốt chặng đường phát triển, hãng luật đã đồng hành cùng hơn 5,000 Thân chủ cá nhân và hàng trăm tập đoàn FDI, doanh nghiệp lớn trong các giao dịch M&A, giải quyết tranh chấp đất đai phức tạp và đại diện bào chữa tại Tòa án các cấp.')}
            </p>

            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-gray-900 border border-blue-100 dark:border-gray-800">
                <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-1">{t('🎯 Tầm Nhìn Chiến Lược')}</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">{t('Trở thành hãng luật uy tín số 1 Việt Nam về chất lượng tư vấn và giải quyết tranh chấp tố tụng.')}</p>
              </div>
              <div className="p-4 rounded-xl bg-purple-50/60 dark:bg-gray-900 border border-purple-100 dark:border-gray-800">
                <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-1">{t('⚖️ Sứ Mệnh Thượng Tôn Pháp Luật')}</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">{t('Bảo vệ sự thật khách quan, phòng ngừa rủi ro pháp lý và kiến tạo giá trị bền vững cho Thân chủ.')}</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800">
              <img
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800"
                alt="Law Firm Office"
                className="w-full h-80 sm:h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent flex items-end p-6">
                <div className="text-white">
                  <p className="font-bold text-lg">{t('Trụ Sở Văn Phòng Luật Cấp Cao')}</p>
                  <p className="text-xs text-gray-300">{t('Không gian làm việc bảo mật & tiêu chuẩn quốc tế')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              {t('Giá Trị Cốt Lõi Làm Nên Thương Hiệu')}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {t('4 nguyên tắc vàng định hình chuẩn mực phục vụ khách hàng tại Advocate & Partners')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreValues.map((val, idx) => {
              const Icon = val.icon;
              return (
                <div key={idx} className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-md hover:shadow-xl transition-all space-y-3 group">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-base text-gray-900 dark:text-white">
                    {val.title}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    {val.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Practice Highlights Grid */}
        <div className="space-y-8 bg-gray-50/70 dark:bg-gray-900/40 p-6 sm:p-10 rounded-3xl border border-gray-100 dark:border-gray-800">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              {t('Năng Lực Thực Chấp & Lĩnh Vực Chuyên Môn')}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {t('Cung cấp giải pháp pháp lý toàn diện từ tư vấn phòng ngừa đến tranh tụng tại Tòa')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {practiceHighlights.map((item, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow space-y-2">
                <h4 className="font-bold text-sm text-blue-600 dark:text-blue-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-blue-500" />
                  <span>{item.title}</span>
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed pl-6">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* 3. Lower Section: Company Press & Legal News Row */}
      <section className="bg-gray-50 dark:bg-gray-900/60 py-12 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
              {t('Truyền Thông & Tin Tức Báo Chí')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
              {t('Các Bài Báo & Bài Viết Chuyên Môn Của Công Ty')}
            </h2>
          </div>

          {/* Render LegalNewsSection */}
          <LegalNewsSection brandColor={brandColor} />
        </div>
      </section>

    </div>
  );
}
