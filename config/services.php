<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'sepay' => [
        'api_key' => env('SEPAY_API_KEY'),
        'bank_name' => env('SEPAY_BANK_NAME', env('SEPAY_BANK_CODE', '')),
        'account_number' => env('SEPAY_ACCOUNT_NUMBER'),
        'account_holder' => env('SEPAY_ACCOUNT_HOLDER'),
        'order_prefix' => env('SEPAY_ORDER_PREFIX', 'SEPAY_'),
        'qr_base_url' => env('SEPAY_QR_BASE_URL', 'https://qr.sepay.vn/img'),
        'amount_tolerance' => (float) env('SEPAY_AMOUNT_TOLERANCE', 1000),
        'redirect_uri' => env('SEPAY_REDIRECT_URI'),
        'oauth_proxy_url' => env('SEPAY_OAUTH_PROXY_URL', 'https://friendsofbotble.com/oauth/sepay/init'),
        'refresh_token_url' => env('SEPAY_REFRESH_TOKEN_URL', 'https://friendsofbotble.com/oauth/sepay/token'),
        'api_base_url' => env('SEPAY_API_BASE_URL', 'https://my.sepay.vn/api/v1'),
        'profile_endpoint' => env('SEPAY_PROFILE_ENDPOINT', '/me'),
        'bank_accounts_endpoint' => env('SEPAY_BANK_ACCOUNTS_ENDPOINT', '/bank-accounts'),
    ],

];
