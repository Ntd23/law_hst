<?php

return [
    'default_order_prefix' => env('SEPAY_ORDER_PREFIX', 'HD'),

    'qr_base_url' => env('SEPAY_QR_BASE_URL', 'https://qr.sepay.vn/img'),

    'api' => [
        'base_url' => env('SEPAY_API_BASE_URL', 'https://userapi.sepay.vn/v2'),
        'profile_endpoint' => env('SEPAY_PROFILE_ENDPOINT', ''),
        'bank_accounts_endpoint' => env('SEPAY_BANK_ACCOUNTS_ENDPOINT', '/bank-accounts'),
        'sub_accounts_endpoint' => env('SEPAY_SUB_ACCOUNTS_ENDPOINT', '/bank-accounts/{id}/va'),
    ],

    'bank_rules' => [
        'ICB' => [
            'requires_sevqr' => true,
            'rule_name' => 'SEVQR',
        ],
    ],
];
