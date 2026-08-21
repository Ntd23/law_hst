<?php

namespace Database\Seeders;

use App\Models\LandingPageCustomPage;
use Illuminate\Database\Seeder;

class LandingPageCustomPageSeeder extends Seeder
{
    public function run(): void
    {
        $pages = [
            [
                'title' => 'Luật sư tư vấn',
                'slug' => 'luat-su-tu-van',
                'content' => "Danh bạ tổ chức hành nghề luật sư và luật sư tư vấn pháp luật uy tín hàng đầu. Kết nối trực tiếp khách hàng với các luật sư giàu kinh nghiệm trong đa dạng lĩnh vực pháp lý.",
                'meta_title' => 'Luật sư tư vấn - Văn phòng luật sư',
                'meta_description' => 'Tìm kiếm luật sư và công ty luật uy tín tư vấn pháp luật chuyên nghiệp.',
                'is_active' => true,
                'sort_order' => 1
            ],
            [
                'title' => 'Giới thiệu về công ty',
                'slug' => 'gioi-thieu-ve-cong-ty',
                'content' => "Về chúng tôi: Nền tảng chuyển đổi số toàn diện cho ngành luật và văn phòng luật sư hàng đầu Việt Nam. Cung cấp các giải pháp quản lý vụ việc, hồ sơ khách hàng, tra cứu án lệ và tự động hoá quy trình làm việc chuẩn mực.",
                'meta_title' => 'Giới thiệu về công ty - Văn phòng luật sư',
                'meta_description' => 'Tìm hiểu về văn phòng luật sư và các dịch vụ pháp lý chuyên nghiệp.',
                'is_active' => true,
                'sort_order' => 2
            ],
            [
                'title' => 'Liên hệ với chúng tôi',
                'slug' => 'lien-he-voi-chung-toi',
                'content' => "Liên hệ đội ngũ luật sư chuyên gia để được tư vấn và giải đáp thắc mắc pháp lý 24/7. Chúng tôi luôn sẵn sàng đồng hành cùng bạn và doanh nghiệp.",
                'meta_title' => 'Liên hệ với chúng tôi - Văn phòng luật sư',
                'meta_description' => 'Liên hệ đội ngũ chuyên gia tư vấn pháp lý.',
                'is_active' => true,
                'sort_order' => 3
            ],
            [
                'title' => 'Chính sách bảo mật',
                'slug' => 'chinh-sach-bao-mat',
                'content' => "Chính sách bảo mật thông tin khách hàng và tài liệu pháp lý với tiêu chuẩn mã hoá đa tầng tiên tiến.",
                'meta_title' => 'Chính sách bảo mật - Bảo vệ dữ liệu pháp lý',
                'meta_description' => 'Chính sách bảo mật an toàn thông tin khách hàng tuyệt đối.',
                'is_active' => true,
                'sort_order' => 4
            ],
            [
                'title' => 'Điều khoản dịch vụ',
                'slug' => 'dieu-khoan-dich-vu',
                'content' => "Các điều khoản và quy định khi sử dụng dịch vụ nền tảng quản lý văn phòng luật.",
                'meta_title' => 'Điều khoản dịch vụ - Nền tảng pháp lý',
                'meta_description' => 'Điều khoản sử dụng dịch vụ và quyền lợi khách hàng.',
                'is_active' => true,
                'sort_order' => 5
            ],
            [
                'title' => 'Câu hỏi thường gặp',
                'slug' => 'cau-hoi-thuong-gap',
                'content' => "Giải đáp các câu hỏi thường gặp về quy trình tư vấn, bảo mật và biểu phí dịch vụ.",
                'meta_title' => 'Câu hỏi thường gặp - FAQ',
                'meta_description' => 'Tổng hợp các câu hỏi thường gặp và hướng dẫn chi tiết.',
                'is_active' => true,
                'sort_order' => 6
            ],
            [
                'title' => 'Chính sách hoàn tiền',
                'slug' => 'chinh-sach-hoan-tien',
                'content' => "Quy định minh bạch về chính sách hoàn phí dịch vụ và bảo đảm quyền lợi khách hàng.",
                'meta_title' => 'Chính sách hoàn tiền',
                'meta_description' => 'Chính sách hoàn tiền minh bạch và cam kết chất lượng.',
                'is_active' => true,
                'sort_order' => 7
            ]
        ];

        foreach ($pages as $pageData) {
            LandingPageCustomPage::firstOrCreate(
                ['slug' => $pageData['slug']],
                $pageData
            );
        }
    }
}
