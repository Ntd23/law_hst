<?php

return [

    /*
     *
     * Shared translations.
     *
     */
    'title' => 'Thiết lập Dự án',
    'next' => 'Bước tiếp theo',
    'back' => 'Quay lại',
    'finish' => 'Cài đặt',
    'forms' => [
        'errorTitle' => 'Đã xảy ra các lỗi sau:',
    ],

    /*
     *
     * Home page translations.
     *
     */
    'welcome' => [
        'templateTitle' => 'Chào mừng',
        'title'   => 'Chào mừng',
        'message' => 'Trình hướng dẫn cài đặt và thiết lập dễ dàng.',
        'next'    => 'Kiểm tra yêu cầu hệ thống',
    ],

    /*
     *
     * Requirements page translations.
     *
     */
    'requirements' => [
        'templateTitle' => 'Bước 1 | Yêu cầu máy chủ',
        'title' => 'Yêu cầu máy chủ',
        'next'    => 'Kiểm tra quyền truy cập',
    ],

    /*
     *
     * Permissions page translations.
     *
     */
    'permissions' => [
        'templateTitle' => 'Bước 2 | Quyền truy cập',
        'title' => 'Quyền truy cập',
        'next' => 'Cấu hình môi trường',
    ],

    /*
     *
     * Environment page translations.
     *
     */
    'environment' => [
        'menu' => [
            'templateTitle' => 'Bước 3 | Cài đặt môi trường',
            'title' => 'Cài đặt môi trường',
            'desc' => 'Vui lòng chọn cách bạn muốn cấu hình tệp <code>.env</code> của ứng dụng.',
            'wizard-button' => 'Thiết lập qua Form Wizard',
            'classic-button' => 'Trình chỉnh sửa văn bản Classic',
        ],
        'wizard' => [
            'templateTitle' => 'Bước 3 | Cài đặt môi trường | Hướng dẫn Form Wizard',
            'title' => 'Trình hướng dẫn <code>.env</code>',
            'tabs' => [
                'environment' => 'Môi trường',
                'database' => 'Cơ sở dữ liệu',
                'application' => 'Ứng dụng',
            ],
            'form' => [
                'name_required' => 'Bắt buộc nhập tên môi trường.',
                'app_name_label' => 'Tên ứng dụng',
                'app_name_placeholder' => 'Tên ứng dụng',
                'app_environment_label' => 'Môi trường ứng dụng',
                'app_environment_label_local' => 'Local (Cục bộ)',
                'app_environment_label_developement' => 'Development (Phát triển)',
                'app_environment_label_qa' => 'QA (Kiểm thử)',
                'app_environment_label_production' => 'Production (Chính thức)',
                'app_environment_label_other' => 'Khác',
                'app_environment_placeholder_other' => 'Nhập môi trường của bạn...',
                'app_debug_label' => 'Chế độ App Debug',
                'app_debug_label_true' => 'True (Bật)',
                'app_debug_label_false' => 'False (Tắt)',
                'app_log_level_label' => 'Mức độ ghi Log',
                'app_log_level_label_debug' => 'debug',
                'app_log_level_label_info' => 'info',
                'app_log_level_label_notice' => 'notice',
                'app_log_level_label_warning' => 'warning',
                'app_log_level_label_error' => 'error',
                'app_log_level_label_critical' => 'critical',
                'app_log_level_label_alert' => 'alert',
                'app_log_level_label_emergency' => 'emergency',
                'app_url_label' => 'Đường dẫn App (App Url)',
                'app_url_placeholder' => 'Đường dẫn App Url',
                'db_connection_failed' => 'Không thể kết nối đến cơ sở dữ liệu.',
                'db_connection_label' => 'Kết nối cơ sở dữ liệu',
                'db_connection_label_mysql' => 'mysql',
                'db_connection_label_sqlite' => 'sqlite',
                'db_connection_label_pgsql' => 'pgsql',
                'db_connection_label_sqlsrv' => 'sqlsrv',
                'db_host_label' => 'Database Host',
                'db_host_placeholder' => 'Database Host',
                'db_port_label' => 'Database Port',
                'db_port_placeholder' => 'Database Port',
                'db_name_label' => 'Tên cơ sở dữ liệu',
                'db_name_placeholder' => 'Tên cơ sở dữ liệu',
                'db_username_label' => 'Tên người dùng CSDL',
                'db_username_placeholder' => 'Tên người dùng CSDL',
                'db_password_label' => 'Mật khẩu CSDL',
                'db_password_placeholder' => 'Mật khẩu CSDL',

                'app_tabs' => [
                    'more_info' => 'Thông tin thêm',
                    'broadcasting_title' => 'Broadcasting, Caching, Session, &amp; Queue',
                    'broadcasting_label' => 'Broadcast Driver',
                    'broadcasting_placeholder' => 'Broadcast Driver',
                    'cache_label' => 'Cache Driver',
                    'cache_placeholder' => 'Cache Driver',
                    'session_label' => 'Session Driver',
                    'session_placeholder' => 'Session Driver',
                    'queue_label' => 'Queue Driver',
                    'queue_placeholder' => 'Queue Driver',
                    'redis_label' => 'Redis Driver',
                    'redis_host' => 'Redis Host',
                    'redis_password' => 'Redis Password',
                    'redis_port' => 'Redis Port',

                    'mail_label' => 'Email',
                    'mail_driver_label' => 'Mail Driver',
                    'mail_driver_placeholder' => 'Mail Driver',
                    'mail_host_label' => 'Mail Host',
                    'mail_host_placeholder' => 'Mail Host',
                    'mail_port_label' => 'Mail Port',
                    'mail_port_placeholder' => 'Mail Port',
                    'mail_username_label' => 'Tên đăng nhập Email',
                    'mail_username_placeholder' => 'Tên đăng nhập Email',
                    'mail_password_label' => 'Mật khẩu Email',
                    'mail_password_placeholder' => 'Mật khẩu Email',
                    'mail_encryption_label' => 'Mã hóa Email',
                    'mail_encryption_placeholder' => 'Mã hóa Email',

                    'pusher_label' => 'Pusher',
                    'pusher_app_id_label' => 'Pusher App Id',
                    'pusher_app_id_palceholder' => 'Pusher App Id',
                    'pusher_app_key_label' => 'Pusher App Key',
                    'pusher_app_key_palceholder' => 'Pusher App Key',
                    'pusher_app_secret_label' => 'Pusher App Secret',
                    'pusher_app_secret_palceholder' => 'Pusher App Secret',
                ],
                'buttons' => [
                    'setup_database' => 'Cấu hình Cơ sở dữ liệu',
                    'setup_application' => 'Cấu hình Ứng dụng',
                    'install' => 'Cài đặt',
                ],
            ],
        ],
        'classic' => [
            'templateTitle' => 'Bước 3 | Cài đặt môi trường | Classic Editor',
            'title' => 'Trình chỉnh sửa môi trường Classic',
            'save' => 'Lưu .env',
            'back' => 'Sử dụng Form Wizard',
            'install' => 'Lưu và Cài đặt',
        ],
        'success' => 'Cài đặt tệp .env của bạn đã được lưu thành công.',
        'errors' => 'Không thể lưu tệp .env, vui lòng tạo tệp thủ công.',
    ],

    'install' => 'Cài đặt',

    /*
     *
     * Installed Log translations.
     *
     */
    'installed' => [
        'success_log_message' => 'Dự án đã được CÀI ĐẶT thành công vào ',
    ],

    /*
     *
     * Final page translations.
     *
     */
    'final' => [
        'title' => 'Hoàn tất Cài đặt',
        'templateTitle' => 'Hoàn tất Cài đặt',
        'finished' => 'Ứng dụng đã được cài đặt thành công.',
        'migration' => 'Kết xuất Console Migration &amp; Seed:',
        'console' => 'Kết xuất Console Ứng dụng:',
        'log' => 'Nhật ký Cài đặt:',
        'env' => 'Tệp .env cuối cùng:',
        'exit' => 'Nhấn vào đây để thoát',
    ],

    /*
     *
     * Update specific translations
     *
     */
    'updater' => [
        /*
         *
         * Shared translations.
         *
         */
        'title' => 'Trình cập nhật Laravel',

        /*
         *
         * Welcome page translations for update feature.
         *
         */
        'welcome' => [
            'title'   => 'Chào mừng đến với Trình cập nhật',
            'message' => 'Chào mừng bạn đến với trình hướng dẫn cập nhật.',
        ],

        /*
         *
         * Overview page translations for update feature.
         *
         */
        'overview' => [
            'title'   => 'Tổng quan',
            'message' => 'Có 1 bản cập nhật.|Có :number bản cập nhật.',
            'install_updates' => 'Cài đặt bản cập nhật',
        ],

        /*
         *
         * Final page translations.
         *
         */
        'final' => [
            'title' => 'Hoàn tất',
            'finished' => 'Cơ sở dữ liệu ứng dụng đã được cập nhật thành công.',
            'exit' => 'Nhấn vào đây để thoát',
        ],

        'log' => [
            'success_message' => 'Dự án đã được CẬP NHẬT thành công vào ',
        ],
    ],
];
