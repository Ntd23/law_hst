<?php

use App\Services\SepayTransferContentService;

function sepayTransferService(): SepayTransferContentService
{
    return app(SepayTransferContentService::class);
}

test('sepay transfer content adds sevqr for vietinbank main account', function () {
    $instruction = sepayTransferService()->instruction([
        'sepay_bank_code' => 'ICB',
        'sepay_bank_name' => 'VietinBank',
        'sepay_account_number' => '106002539744',
        'sepay_account_name' => 'NGUYEN HUY CUONG',
    ], 'HD123456');

    expect($instruction['receiving_account'])->toBe('106002539744')
        ->and($instruction['transfer_content'])->toBe('SEVQR HD123456')
        ->and($instruction['rule_name'])->toBe('SEVQR')
        ->and($instruction['configuration_valid'])->toBeTrue();
});

test('sepay transfer content uses order code only for normal main account', function () {
    $instruction = sepayTransferService()->instruction([
        'sepay_bank_code' => 'MBBank',
        'sepay_bank_name' => 'MBBank',
        'sepay_account_number' => '0123456789',
        'sepay_account_name' => 'NGUYEN VAN A',
    ], 'HD123456');

    expect($instruction['receiving_account'])->toBe('0123456789')
        ->and($instruction['transfer_content'])->toBe('HD123456')
        ->and($instruction['rule_name'])->toBe('Mã hóa đơn');
});

test('sepay transfer content uses official virtual account as receiving account', function () {
    $instruction = sepayTransferService()->instruction([
        'sepay_bank_code' => 'ICB',
        'sepay_account_number' => '106002539744',
        'sepay_account_name' => 'MAIN HOLDER',
        'sepay_sub_account_id' => 'va_1',
        'sepay_sub_accounts' => json_encode([
            [
                'id' => 'va_1',
                'type' => 'official_va',
                'account_number' => '970400001234',
                'account_holder_name' => 'VA HOLDER',
            ],
        ]),
    ], 'HD123456');

    expect($instruction['receiving_account'])->toBe('970400001234')
        ->and($instruction['account_name'])->toBe('VA HOLDER')
        ->and($instruction['transfer_content'])->toBe('HD123456')
        ->and($instruction['rule_name'])->toBe('VA chính thức');
});

test('sepay transfer content adds tkp for content virtual account', function () {
    $instruction = sepayTransferService()->instruction([
        'sepay_bank_code' => 'ICB',
        'sepay_account_number' => '106002539744',
        'sepay_account_name' => 'MAIN HOLDER',
        'sepay_sub_account_id' => 'tkp_1',
        'sepay_sub_accounts' => json_encode([
            [
                'id' => 'tkp_1',
                'type' => 'content_va',
                'code' => '001',
            ],
        ]),
    ], 'HD123456');

    expect($instruction['receiving_account'])->toBe('106002539744')
        ->and($instruction['transfer_content'])->toBe('SEVQR TKP001 HD123456')
        ->and($instruction['rule_name'])->toBe('SEVQR + TKP')
        ->and($instruction['configuration_valid'])->toBeTrue();
});

test('sepay transfer content extracts order codes from supported content formats', function (string $content) {
    expect(sepayTransferService()->extractOrderCodes($content, ['HD']))->toContain('HD123456');
})->with([
    'HD123456',
    'SEVQR HD123456',
    'TKP001 HD123456',
    'SEVQR TKP001 HD123456',
]);

test('sepay order prefix rejects transfer rule words as prefixes', function () {
    expect(sepayTransferService()->normalizeOrderPrefix('SEVQR'))->toBe('HD')
        ->and(sepayTransferService()->normalizeOrderPrefix('TKP001'))->toBe('HD')
        ->and(sepayTransferService()->normalizeOrderPrefix('HD'))->toBe('HD');
});
