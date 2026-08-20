<?php

namespace Database\Seeders;

use App\Models\KnowledgeArticle;
use App\Models\ResearchCategory;
use App\Models\User;
use Illuminate\Database\Seeder;

class KnowledgeArticleSeeder extends Seeder
{
    public function run(): void
    {
        $superAdmin = User::where('type', 'superadmin')->first();
        $companies = User::where('type', 'company')->get();

        $allCreators = collect([$superAdmin])->merge($companies)->filter();

        // 1. Define standard legal research categories
        $categoriesData = [
            [
                'name' => 'Luật Đất đai & Bất động sản',
                'description' => 'Tư vấn chuyển nhượng, cấp sổ đỏ, giải phóng mặt bằng & Luật Đất đai 2024',
                'color' => '#16a34a',
            ],
            [
                'name' => 'Pháp luật Doanh nghiệp & M&A',
                'description' => 'Tư vấn pháp lý doanh nghiệp, tái cấu trúc, mua bán sáp nhập & hợp đồng thương mại',
                'color' => '#2563eb',
            ],
            [
                'name' => 'Tranh tụng & Bào chữa Hình sự',
                'description' => 'Chiến lược bảo vệ & bào chữa trong các vụ án hình sự kinh tế, chức vụ & dân sự',
                'color' => '#dc2626',
            ],
            [
                'name' => 'Thuế & Tài chính Doanh nghiệp',
                'description' => 'Tuân thủ nghĩa vụ thuế, thanh tra thuế, chuyển giá & kế toán doanh nghiệp',
                'color' => '#ca8a04',
            ],
            [
                'name' => 'Tranh chấp Lao động & Tiền lương',
                'description' => 'Giải quyết tranh chấp lao động, nội quy, bảo hiểm xã hội & kỷ luật sa thải',
                'color' => '#7c3aed',
            ],
            [
                'name' => 'Sở hữu Trí tuệ & Bản quyền',
                'description' => 'Đăng ký bảo hộ nhãn hiệu, sáng chế, bản quyền tác giả & xử lý xâm phạm',
                'color' => '#ea580c',
            ],
        ];

        // Ensure categories exist for each creator
        foreach ($allCreators as $creator) {
            foreach ($categoriesData as $cat) {
                ResearchCategory::firstOrCreate(
                    ['name' => $cat['name'], 'created_by' => $creator->id],
                    [
                        'description' => $cat['description'],
                        'color' => $cat['color'],
                        'status' => 'active',
                        'created_by' => $creator->id,
                    ]
                );
            }
        }

        // 2. Define rich legal articles (matching Homepage & Company showcases)
        $articlesData = [
            [
                'title' => 'Điểm mới của Luật Đất đai 2024: Tác động then chốt đến Doanh nghiệp & Nhà đầu tư',
                'category_name' => 'Luật Đất đai & Bất động sản',
                'content' => "Luật Đất đai 2024 vừa được Quốc hội thông qua và có hiệu lực thi hành mang lại nhiều thay đổi mang tính bước ngoặt đối với việc giao đất, cho thuê đất và thủ tục triển khai dự án đầu tư của các doanh nghiệp tại Việt Nam.\n\nMột trong những sửa đổi đáng chú ý nhất là việc bãi bỏ khung giá đất định kỳ 5 năm của Chính phủ, chuyển sang cơ chế bảng giá đất sát với giá thị trường được cập nhật hàng năm. Điều này tác động trực tiếp và đáng kể đến chi phí bồi thường giải phóng mặt bằng cũng như tiền thuê đất hàng năm của các nhà đầu tư.\n\nNgoài ra, Luật mới đã mở rộng quyền tiếp cận đất đai cho người Việt Nam định cư ở nước ngoài và doanh nghiệp có vốn đầu tư nước ngoài (FDI), đồng thời quy định cụ thể hơn về các trường hợp thu hồi đất để phát triển kinh tế - xã hội vì lợi ích quốc gia, công cộng.\n\nKhuyến nghị từ luật sư: Các doanh nghiệp sở hữu quỹ đất và các nhà đầu tư phát triển dự án bất động sản cần chủ động rà soát lại hiện trạng pháp lý của giấy chứng nhận quyền sử dụng đất (sổ đỏ), cơ cấu hình thức thuê đất trả tiền một lần hoặc hàng năm để tối ưu hoá dòng tài chính và giảm thiểu rủi ro pháp lý phát sinh.",
                'tags' => ['Luật Đất đai', 'Bất động sản', 'Đầu tư', 'Doanh nghiệp'],
                'is_public' => true,
                'status' => 'published',
            ],
            [
                'title' => 'Thẩm định Pháp lý M&A (Legal Due Diligence): 5 Rủi ro Trọng yếu Nhà đầu tư cần kiểm soát',
                'category_name' => 'Pháp luật Doanh nghiệp & M&A',
                'content' => "Hoạt động M&A (Mua bán và Sáp nhập) tại Việt Nam đòi hỏi quy trình thẩm định pháp lý (Legal Due Diligence) vô cùng chặt chẽ nhằm phát hiện các nghĩa vụ tiềm ẩn và sai sót tuân thủ của doanh nghiệp mục tiêu trước khi ký kết thoả thuận chính thức.\n\n5 nhóm rủi ro then chốt cần đặc biệt lưu ý bao gồm:\n1. Rủi ro về tính hợp pháp và lịch sử chuyển nhượng vốn góp / cổ phần giữa các cổ đông sáng lập.\n2. Nợ thuế tồn đọng, nghĩa vụ bảo hiểm xã hội chưa quyết toán và các khoản phạt hành chính tiềm ẩn.\n3. Tuân thủ hợp đồng lao động, bảo hộ quyền lợi nhân sự chủ chốt sau sáp nhập.\n4. Giấy phép con theo ngành nghề kinh doanh có điều kiện, giấy phép môi trường và nghiệm thu PCCC.\n5. Tính toàn vẹn và quyền sở hữu đối với các tài sản vô hình (nhãn hiệu, mã nguồn phần mềm, bí mật kinh doanh).\n\nViệc nhận diện sớm rủi ro giúp bên mua đàm phán các điều khoản cam kết bồi hoàn (Indemnity Clause) hoặc khấu trừ trực tiếp vào giá trị giao dịch chuyển nhượng.",
                'tags' => ['Doanh nghiệp', 'M&A', 'Thẩm định pháp lý', 'Đầu tư'],
                'is_public' => true,
                'status' => 'published',
            ],
            [
                'title' => 'Bào chữa & Bảo vệ trong các vụ án Kinh tế, Chức vụ: Chiến lược & Quyền hạn theo Bộ luật Tố tụng Hình sự',
                'category_name' => 'Tranh tụng & Bào chữa Hình sự',
                'content' => "Trong bối cảnh các cơ quan tiến hành tố tụng tăng cường xử lý các sai phạm kinh tế và quản lý tài chính doanh nghiệp, việc tham gia của luật sư bào chữa ngay từ giai đoạn xác minh nguồn tin báo tội phạm là yếu tố quyết định để bảo vệ quyền và lợi ích hợp pháp của thân chủ.\n\nLuật sư có vai trò trọng yếu trong việc hỗ trợ người bị tố giác hiểu rõ quyền không buộc phải đưa ra lời khai chống lại chính mình, quyền yêu cầu đối chất, kiểm tra tính hợp pháp của quy trình thu giữ tài liệu chứng cứ tài chính, và đánh giá kết luận giám định tư pháp kế toán.\n\nMột chiến lược bào chữa khoa học, dựa trên phân tích dòng tiền thực tế và hồ sơ chứng từ gốc, sẽ giúp làm rõ bản chất kinh tế của giao dịch, ngăn ngừa nguy cơ hình sự hoá các quan hệ kinh tế - dân sự thuần tuý.",
                'tags' => ['Hình sự', 'Án kinh tế', 'Bào chữa', 'Tranh tụng'],
                'is_public' => true,
                'status' => 'published',
            ],
            [
                'title' => 'Quy định Mới về Tuân thủ Thuế đối với Doanh nghiệp Thương mại Điện tử & Công nghệ',
                'category_name' => 'Thuế & Tài chính Doanh nghiệp',
                'content' => "Cơ quan thuế các cấp đang siết chặt thanh tra và áp dụng cơ chế tự động đối soát dữ liệu hoá đơn điện tử đối với các nền tảng thương mại điện tử, dịch vụ số xuyên biên giới và doanh nghiệp công nghệ.\n\nCác nghĩa vụ trọng tâm cần hoàn thiện bao gồm:\n- Thực hiện khấu trừ và nộp thay thuế nhà thầu nước ngoài (Foreign Contractor Tax - FCT) khi thanh toán chi phí quảng cáo, thuê máy chủ cloud nước ngoài.\n- Lập và lưu trữ hồ sơ xác định giá giao dịch liên kết (Transfer Pricing Documentation) đúng theo quy định tại Nghị định 132/2020/NĐ-CP.\n- Hạch toán chứng từ chi phí hợp lý được trừ khi tính thuế TNDN đối với các khoản chiết khấu, khuyến mại trên sàn thương mại điện tử.\n\nDoanh nghiệp cần thiết lập quy trình kế toán - thuế chuẩn mực để hạn chế tối đa rủi ro bị truy thu và xử phạt vi phạm hành chính về thuế.",
                'tags' => ['Thuế', 'Thương mại điện tử', 'Fintech', 'Tuân thủ'],
                'is_public' => true,
                'status' => 'published',
            ],
            [
                'title' => 'Giải quyết Tranh chấp Lao động & Quy trình Xử lý Kỷ luật Theo Bộ luật Lao động',
                'category_name' => 'Tranh chấp Lao động & Tiền lương',
                'content' => "Việc người sử dụng lao động đơn phương chấm dứt hợp đồng lao động trái pháp luật hoặc xử lý kỷ luật sa thải không đúng trình tự có thể dẫn đến tranh chấp kéo dài tại Toà án và gánh chịu nghĩa vụ bồi thường tài chính nặng nề.\n\nQuy trình xử lý kỷ luật lao động hợp pháp bắt buộc phải đáp ứng đủ các điều kiện:\n1. Phải chứng minh được lỗi vi phạm của người lao động căn cứ theo Nội quy lao động đã đăng ký hợp lệ.\n2. Phải có sự tham gia của tổ chức đại diện người lao động tại cơ sở (Công đoàn).\n3. Phải thông báo bằng văn bản cho các bên tham dự trước ít nhất 05 ngày làm việc.\n4. Phải lập biên bản cuộc họp xử lý kỷ luật lao động với đầy đủ chữ ký của các thành phần tham dự.\n\nDoanh nghiệp cần xây dựng bộ quy chế đánh giá mức độ hoàn thành công việc rõ ràng để làm căn cứ pháp lý vững chắc khi chấm dứt HĐLĐ.",
                'tags' => ['Lao động', 'Tranh chấp', 'Kỷ luật lao động', 'Nhân sự'],
                'is_public' => true,
                'status' => 'published',
            ],
            [
                'title' => 'Phòng ngừa Rủi ro & Tranh chấp trong Hợp đồng Thương mại Quốc tế',
                'category_name' => 'Pháp luật Doanh nghiệp & M&A',
                'content' => "Hợp đồng thương mại quốc tế tiềm ẩn nhiều rủi ro về luật áp dụng, cơ quan giải quyết tranh chấp (Trọng tài thương mại quốc tế như VIAC, SIAC) và các điều khoản bất khả kháng (Force Majeure).\n\nBài viết phân tích các yếu tố then chốt khi soạn thảo:\n- Điều khoản thanh toán quốc tế qua thư tín dụng (L/C) và bảo lãnh ngân hàng.\n- Phân định nghĩa vụ giao hàng và rủi ro chuyển giao theo Incoterms 2020 (FOB, CIF, DDP...).\n- Điều khoản giải quyết tranh chấp đa tầng (Multi-tier Dispute Resolution Clause) kết hợp thương lượng, hoà giải và trọng tài.\n\nDoanh nghiệp xuất nhập khẩu cần có sự đồng hành của luật sư chuyên môn để xây dựng khung hợp đồng chặt chẽ, bảo vệ tối đa lợi ích thương mại khi có biến động thị trường.",
                'tags' => ['Hợp đồng', 'Thương mại quốc tế', 'Trọng tài', 'Tranh chấp'],
                'is_public' => true,
                'status' => 'published',
            ],
            [
                'title' => 'Thủ tục Đăng ký & Bảo hộ Nhãn hiệu, Sáng chế Công nghệ Cho Startup',
                'category_name' => 'Sở hữu Trí tuệ & Bản quyền',
                'content' => "Trong nền kinh tế số, tài sản trí tuệ (nhãn hiệu, kiểu dáng công nghiệp, sáng chế công nghệ, bản quyền phần mềm) chiếm tới hơn 70% giá trị của các doanh nghiệp đổi mới sáng tạo.\n\nNguyên tắc nộp đơn đầu tiên (First-to-file) tại Cục Sở hữu Trí tuệ Việt Nam đòi hỏi các nhà sáng lập phải tiến hành tra cứu khả năng bảo hộ và nộp đơn đăng ký sớm nhất có thể trước khi công bố sản phẩm ra thị trường.\n\nBài viết hướng dẫn quy trình thẩm định hình thức, thẩm định nội dung, xử lý phản đối đơn từ bên thứ ba và chiến lược đăng ký bảo hộ quốc tế qua hệ thống Madrid.",
                'tags' => ['Sở hữu trí tuệ', 'Nhãn hiệu', 'Startup', 'Bản quyền'],
                'is_public' => true,
                'status' => 'published',
            ],
            [
                'title' => 'Quy trình Thu hồi Nợ Doanh nghiệp Hợp pháp Qua Kênh Trọng tài & Toà án',
                'category_name' => 'Pháp luật Doanh nghiệp & M&A',
                'content' => "Thu hồi nợ thương mại khó đòi đòi hỏi sự kết hợp linh hoạt giữa đàm phán tái cấu trúc nợ, gửi thư khuyến cáo pháp lý (Legal Notice) và khởi kiện tại Trọng tài thương mại hoặc Toà án nhân dân có thẩm quyền.\n\nLuật sư sẽ hỗ trợ doanh nghiệp:\n- Rà soát hồ sơ công nợ, đối chiếu biên bản giao nhận hàng hoá và biên bản xác nhận công nợ gốc.\n- Yêu cầu áp dụng biện pháp khẩn cấp tạm thời (phong toả tài khoản ngân hàng, kê biên tài sản bảo đảm) nhằm ngăn chặn tẩu tán tài sản.\n- Đại diện tham gia các phiên xét xử và theo dõi thi hành án dân sự để đảm bảo thu hồi tối đa dòng tiền cho doanh nghiệp.",
                'tags' => ['Thu hồi nợ', 'Trọng tài', 'Khởi kiện', 'Doanh nghiệp'],
                'is_public' => true,
                'status' => 'published',
            ],
        ];

        // Seed articles for Super Admin
        if ($superAdmin) {
            foreach ($articlesData as $art) {
                $category = ResearchCategory::where('name', $art['category_name'])
                    ->where('created_by', $superAdmin->id)
                    ->first();

                KnowledgeArticle::firstOrCreate(
                    ['title' => $art['title'], 'created_by' => $superAdmin->id],
                    [
                        'content' => $art['content'],
                        'category_id' => $category?->id,
                        'tags' => $art['tags'],
                        'is_public' => $art['is_public'],
                        'status' => $art['status'],
                        'created_by' => $superAdmin->id,
                    ]
                );
            }
        }

        // Seed articles distributed across companies
        foreach ($companies as $company) {
            // Assign a subset of articles to each company
            $companyArticles = collect($articlesData)->shuffle()->take(5);

            foreach ($companyArticles as $art) {
                $category = ResearchCategory::where('name', $art['category_name'])
                    ->where('created_by', $company->id)
                    ->first();

                KnowledgeArticle::firstOrCreate(
                    ['title' => $art['title'], 'created_by' => $company->id],
                    [
                        'content' => $art['content'],
                        'category_id' => $category?->id,
                        'tags' => $art['tags'],
                        'is_public' => $art['is_public'],
                        'status' => $art['status'],
                        'created_by' => $company->id,
                    ]
                );
            }
        }
    }
}