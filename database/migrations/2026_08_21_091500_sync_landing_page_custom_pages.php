<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Update legacy records if they exist
        DB::table('landing_page_custom_pages')
            ->where('slug', 'about-us')
            ->update([
                'title' => 'Giới thiệu về công ty',
                'slug' => 'gioi-thieu-ve-cong-ty',
                'meta_title' => 'Giới thiệu về công ty - Văn phòng luật sư',
                'sort_order' => 2
            ]);

        DB::table('landing_page_custom_pages')
            ->where('slug', 'contact-us')
            ->update([
                'title' => 'Liên hệ với chúng tôi',
                'slug' => 'lien-he-voi-chung-toi',
                'meta_title' => 'Liên hệ với chúng tôi - Văn phòng luật sư',
                'sort_order' => 3
            ]);

        DB::table('landing_page_custom_pages')
            ->where('slug', 'privacy-policy')
            ->update([
                'title' => 'Chính sách bảo mật',
                'slug' => 'chinh-sach-bao-mat',
                'sort_order' => 4
            ]);

        DB::table('landing_page_custom_pages')
            ->where('slug', 'terms-of-service')
            ->update([
                'title' => 'Điều khoản dịch vụ',
                'slug' => 'dieu-khoan-dich-vu',
                'sort_order' => 5
            ]);

        DB::table('landing_page_custom_pages')
            ->where('slug', 'faq')
            ->update([
                'title' => 'Câu hỏi thường gặp',
                'slug' => 'cau-hoi-thuong-gap',
                'sort_order' => 6
            ]);

        DB::table('landing_page_custom_pages')
            ->where('slug', 'refund-policy')
            ->update([
                'title' => 'Chính sách hoàn tiền',
                'slug' => 'chinh-sach-hoan-tien',
                'sort_order' => 7
            ]);

        // 2. Ensure "Luật sư tư vấn" exists
        $existsLawyers = DB::table('landing_page_custom_pages')->where('slug', 'luat-su-tu-van')->exists();
        if (!$existsLawyers) {
            DB::table('landing_page_custom_pages')->insert([
                'title' => 'Luật sư tư vấn',
                'slug' => 'luat-su-tu-van',
                'content' => 'Danh bạ tổ chức hành nghề luật sư và luật sư tư vấn pháp luật uy tín.',
                'meta_title' => 'Luật sư tư vấn - Văn phòng luật sư',
                'meta_description' => 'Tìm kiếm luật sư và công ty luật uy tín tư vấn pháp luật chuyên nghiệp.',
                'is_active' => 1,
                'sort_order' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }

        // 3. Ensure "Giới thiệu về công ty" exists
        $existsAbout = DB::table('landing_page_custom_pages')->where('slug', 'gioi-thieu-ve-cong-ty')->exists();
        if (!$existsAbout) {
            DB::table('landing_page_custom_pages')->insert([
                'title' => 'Giới thiệu về công ty',
                'slug' => 'gioi-thieu-ve-cong-ty',
                'content' => 'Giới thiệu về văn phòng luật sư và dịch vụ tư vấn chuyên nghiệp.',
                'meta_title' => 'Giới thiệu về công ty - Văn phòng luật sư',
                'meta_description' => 'Tìm hiểu về văn phòng luật sư và dịch vụ pháp lý.',
                'is_active' => 1,
                'sort_order' => 2,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }

        // 4. Ensure "Liên hệ với chúng tôi" exists
        $existsContact = DB::table('landing_page_custom_pages')->where('slug', 'lien-he-voi-chung-toi')->exists();
        if (!$existsContact) {
            DB::table('landing_page_custom_pages')->insert([
                'title' => 'Liên hệ với chúng tôi',
                'slug' => 'lien-he-voi-chung-toi',
                'content' => 'Liên hệ với chúng tôi để được tư vấn pháp lý.',
                'meta_title' => 'Liên hệ với chúng tôi - Văn phòng luật sư',
                'meta_description' => 'Liên hệ tư vấn pháp lý trực tiếp.',
                'is_active' => 1,
                'sort_order' => 3,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }
    }

    public function down(): void
    {
    }
};
