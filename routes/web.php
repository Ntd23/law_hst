<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DirectoryController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\PlanController;
use App\Http\Controllers\PlanOrderController;
use App\Http\Controllers\PlanRequestController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\ReferralController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\CouponController;
use App\Http\Controllers\CurrencyController;
use App\Http\Controllers\ImpersonateController;
use App\Http\Controllers\TranslationController;
use App\Http\Controllers\LandingPageController;
use App\Http\Controllers\LandingPage\CustomPageController;
use App\Http\Controllers\LanguageController;
use App\Http\Controllers\MediaController;
use App\Http\Controllers\RazorpayController;
use App\Http\Controllers\MercadoPagoController;
use App\Http\Controllers\StripePaymentController;
use App\Http\Controllers\PayPalPaymentController;
use App\Http\Controllers\BankPaymentController;
use App\Http\Controllers\PaystackPaymentController;
use App\Http\Controllers\FlutterwavePaymentController;
use App\Http\Controllers\PayTabsPaymentController;
use App\Http\Controllers\SkrillPaymentController;
use App\Http\Controllers\CoinGatePaymentController;
use App\Http\Controllers\PayfastPaymentController;
use App\Http\Controllers\TapPaymentController;
use App\Http\Controllers\XenditPaymentController;
use App\Http\Controllers\PayTRPaymentController;
use App\Http\Controllers\MolliePaymentController;
use App\Http\Controllers\ToyyibPayPaymentController;
use App\Http\Controllers\CashfreeController;
use App\Http\Controllers\IyzipayPaymentController;
use App\Http\Controllers\BenefitPaymentController;
use App\Http\Controllers\OzowPaymentController;
use App\Http\Controllers\EasebuzzPaymentController;
use App\Http\Controllers\KhaltiPaymentController;
use App\Http\Controllers\AuthorizeNetPaymentController;
use App\Http\Controllers\FedaPayPaymentController;
use App\Http\Controllers\PayHerePaymentController;
use App\Http\Controllers\CinetPayPaymentController;
use App\Http\Controllers\PaiementPaymentController;
use App\Http\Controllers\YooKassaPaymentController;
use App\Http\Controllers\AamarpayPaymentController;
use App\Http\Controllers\MidtransPaymentController;
use App\Http\Controllers\PublicFormController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\TaskTypeController;
use App\Http\Controllers\TaskStatusController;
use App\Http\Controllers\WorkflowController;


use App\Http\Controllers\TaskCommentController;
use App\Http\Controllers\GoogleCalendarController;

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// AamarPay invoice success route - must be outside CSRF protection


Route::get('/', [LandingPageController::class, 'show'])->name('home');
Route::get('/directory', [DirectoryController::class, 'index'])->name('directory.index');

// Redirect misspelled 'referal' to correct 'referral'
Route::redirect('referal/{path?}', 'referral/{path?}')->where('path', '.*');

// Payment gateway invoice success routes - completely bypass CSRF
Route::match(['GET', 'POST'], 'iyzipay/invoice/success/{token}', [IyzipayPaymentController::class, 'invoiceSuccess'])
    ->withoutMiddleware([\App\Http\Middleware\VerifyCsrfToken::class])
    ->name('iyzipay.invoice.success');
Route::match(['GET', 'POST'], 'iyzipay/success', [IyzipayPaymentController::class, 'success'])
    ->withoutMiddleware([\App\Http\Middleware\VerifyCsrfToken::class])
    ->name('iyzipay.success');
Route::match(['GET', 'POST'], 'iyzipay/invoice/callback/{token}', [IyzipayPaymentController::class, 'invoiceCallback'])
    ->withoutMiddleware([\App\Http\Middleware\VerifyCsrfToken::class])
    ->name('iyzipay.invoice.callback');
Route::post('iyzipay/invoice/notify/{token}', [IyzipayPaymentController::class, 'invoiceNotify'])
    ->withoutMiddleware([\App\Http\Middleware\VerifyCsrfToken::class])
    ->name('iyzipay.invoice.notify');

Route::match(['GET', 'POST'], 'khalti/invoice/success', [KhaltiPaymentController::class, 'invoiceSuccess'])
    ->withoutMiddleware([\App\Http\Middleware\VerifyCsrfToken::class])
    ->name('khalti.invoice.success');
Route::match(['GET', 'POST'], 'cashfree/invoice/success', [CashfreeController::class, 'invoiceSuccess'])
    ->withoutMiddleware([\App\Http\Middleware\VerifyCsrfToken::class])
    ->name('cashfree.invoice.success');
Route::match(['GET', 'POST'], 'skrill/invoice/success', [SkrillPaymentController::class, 'invoiceSuccess'])
    ->withoutMiddleware([\App\Http\Middleware\VerifyCsrfToken::class])
    ->name('skrill.invoice.success');

// Payment gateway invoice routes (public - no CSRF)
Route::post('mollie/create-invoice-payment', [MolliePaymentController::class, 'createInvoicePayment'])
    ->name('mollie.create-invoice-payment');
Route::post('tap/create-invoice-payment', [TapPaymentController::class, 'createInvoicePayment'])
    ->name('tap.create-invoice-payment');
Route::post('payhere/create-invoice-payment', [PayHerePaymentController::class, 'createInvoicePayment'])
    ->name('payhere.create-invoice-payment');
Route::post('cinetpay/create-invoice-payment', [CinetPayPaymentController::class, 'createInvoicePayment'])
    ->name('cinetpay.create-invoice-payment');
Route::post('fedapay/create-invoice-payment', [FedaPayPaymentController::class, 'createInvoicePayment'])
    ->name('fedapay.create-invoice-payment');
Route::post('paytabs/create-invoice-payment', [PayTabsPaymentController::class, 'createInvoicePayment'])
    ->name('paytabs.create-invoice-payment');
Route::post('khalti/create-invoice-payment', [KhaltiPaymentController::class, 'createInvoicePayment'])
    ->name('khalti.create-invoice-payment');


Route::post('cashfree/create-invoice-payment', [CashfreeController::class, 'createInvoicePayment'])
    ->name('cashfree.create-invoice-payment');


Route::post('toyyibpay/create-invoice-payment', [ToyyibPayPaymentController::class, 'createInvoicePayment'])
    ->name('toyyibpay.create-invoice-payment');
Route::post('skrill/create-invoice-payment', [SkrillPaymentController::class, 'processInvoicePayment'])
    ->withoutMiddleware([\App\Http\Middleware\VerifyCsrfToken::class])
    ->name('skrill.create-invoice-payment');
Route::post('skrill/process-invoice-payment', [SkrillPaymentController::class, 'processInvoicePayment'])
    ->withoutMiddleware([\App\Http\Middleware\VerifyCsrfToken::class])
    ->name('skrill.process-invoice-payment');
Route::post('authorizenet/create-invoice-payment', [AuthorizeNetPaymentController::class, 'createInvoicePayment'])
    ->withoutMiddleware([\App\Http\Middleware\VerifyCsrfToken::class])
    ->name('authorizenet.create-invoice-payment');
Route::post('authorizenet/process-invoice-payment', [AuthorizeNetPaymentController::class, 'processInvoicePayment'])
    ->withoutMiddleware([\App\Http\Middleware\VerifyCsrfToken::class])
    ->name('authorizenet.process-invoice-payment');
Route::post('ozow/create-invoice-payment', [OzowPaymentController::class, 'createInvoicePayment'])
    ->withoutMiddleware([\App\Http\Middleware\VerifyCsrfToken::class])
    ->name('ozow.create-invoice-payment');
Route::post('paiement/create-invoice-payment', [PaiementPaymentController::class, 'createInvoicePayment'])
    ->withoutMiddleware([\App\Http\Middleware\VerifyCsrfToken::class])
    ->name('paiement.create-invoice-payment');
// Invoice Payment Routes (Public - No Auth Required)
Route::match(['GET', 'POST'], 'invoice/pay/{token}', [\App\Http\Controllers\InvoicePaymentController::class, 'show'])
    ->withoutMiddleware([\App\Http\Middleware\VerifyCsrfToken::class])
    ->name('invoice.payment');
Route::post('invoice/pay/{token}/process', [\App\Http\Controllers\InvoicePaymentController::class, 'processPayment'])->name('invoice.payment.process');
Route::get('invoice/pay/{token}/success', [\App\Http\Controllers\InvoicePaymentController::class, 'success'])->name('invoice.payment.success');

// Public form submission routes

// Cashfree webhook (public route)
Route::post('cashfree/webhook', [CashfreeController::class, 'webhook'])->name('cashfree.webhook');
Route::get('cashfree/success', [CashfreeController::class, 'success'])->name('cashfree.success');
Route::post('cashfree/callback', [CashfreeController::class, 'success'])->name('cashfree.callback');

// Benefit webhook (public route)
Route::post('benefit/webhook', [BenefitPaymentController::class, 'webhook'])->name('benefit.webhook');
Route::get('payments/benefit/success', [BenefitPaymentController::class, 'success'])->name('benefit.success');
Route::post('payments/benefit/callback', [BenefitPaymentController::class, 'callback'])->name('benefit.callback');

// FedaPay callback (public route)
Route::match(['GET', 'POST'], 'payments/fedapay/callback', [FedaPayPaymentController::class, 'callback'])->name('fedapay.callback');

// YooKassa success/callback (public routes)
Route::get('payments/yookassa/success', [YooKassaPaymentController::class, 'success'])->name('yookassa.success');
Route::post('payments/yookassa/callback', [YooKassaPaymentController::class, 'callback'])->name('yookassa.callback');



// PayTR callback (public route)
Route::post('payments/paytr/callback', [PayTRPaymentController::class, 'callback'])->name('paytr.callback');

// PayTabs callback (public route)
Route::match(['GET', 'POST'], 'payments/paytabs/callback', [PayTabsPaymentController::class, 'callback'])->name('paytabs.callback');
Route::get('payments/paytabs/success', [PayTabsPaymentController::class, 'success'])->name('paytabs.success');

// Tap payment routes (public routes)
Route::get('payments/tap/success', [TapPaymentController::class, 'success'])->name('tap.success');
Route::post('payments/tap/callback', [TapPaymentController::class, 'callback'])->name('tap.callback');

// PayFast payment routes (public routes)
Route::get('payments/payfast/success', [PayfastPaymentController::class, 'success'])->name('payfast.success');
Route::post('payments/payfast/callback', [PayfastPaymentController::class, 'callback'])->name('payfast.callback');

// CoinGate callback (public route)
Route::match(['GET', 'POST'], 'payments/coingate/callback', [CoinGatePaymentController::class, 'callback'])->name('coingate.callback');

// Skrill callback (public route)
Route::post('payments/skrill/callback', [SkrillPaymentController::class, 'callback'])->name('skrill.callback');
Route::get('payments/skrill/success', [SkrillPaymentController::class, 'success'])->name('skrill.success');
Route::post('skrill/invoice/callback', [SkrillPaymentController::class, 'invoiceCallback'])->name('skrill.invoice.callback');

// Xendit payment routes (public routes)
Route::get('payments/xendit/success', [XenditPaymentController::class, 'success'])->name('xendit.success');
Route::post('payments/xendit/callback', [XenditPaymentController::class, 'callback'])->name('xendit.callback');

// PWA Manifest routes removed

Route::post('/landing-page/contact', [LandingPageController::class, 'submitContact'])->name('landing-page.contact');
Route::post('/landing-page/subscribe', [LandingPageController::class, 'subscribe'])->name('landing-page.subscribe');
Route::post('newsletter/subscribe', [\App\Http\Controllers\NewsletterController::class, 'subscribe'])->name('newsletter.subscribe');
Route::get('newsletter/unsubscribe/{email}', [\App\Http\Controllers\NewsletterController::class, 'unsubscribe'])->name('newsletter.unsubscribe');

// Cookie consent routes
Route::post('/cookie-consent/store', [\App\Http\Controllers\CookieConsentController::class, 'store'])->name('cookie.consent.store');

// Public Custom Page & Company Detail routes
Route::get('/page/{slug}', function (string $slug) {
    $canonicalRoutes = [
        'luat-su-tu-van' => 'vi.cong-ty-tu-van',
        'lien-he-voi-chung-toi' => 'vi.lien-he-voi-chung-toi',
    ];

    if (isset($canonicalRoutes[$slug])) {
        return redirect()->route($canonicalRoutes[$slug]);
    }

    return app(CustomPageController::class)->show($slug);
})->name('custom-page.show');
Route::get('/trang/{slug}', [CustomPageController::class, 'show']);
Route::get('/cong-ty/{id}', [CustomPageController::class, 'showCompanyDetail'])->name('company.detail');
Route::get('/company/{id}', function ($id) {
    return redirect()->route('company.detail', $id);
});

// Friendly Vietnamese URL shortcuts
Route::get('/cong-ty-tu-van', function () {
    return app(CustomPageController::class)->show('luat-su-tu-van');
})->name('vi.cong-ty-tu-van');

Route::get('/luat-su-tu-van', function () {
    return redirect()->route('vi.cong-ty-tu-van');
})->name('vi.luat-su-tu-van');

Route::get('/gioi-thieu-ve-cong-ty', function () {
    return app(CustomPageController::class)->show('gioi-thieu-ve-cong-ty');
})->name('vi.gioi-thieu-ve-cong-ty');

Route::get('/gioi-thieu', function () {
    return redirect()->route('custom-page.show', 'gioi-thieu-ve-cong-ty');
})->name('vi.gioi-thieu');

Route::get('/lien-he-voi-chung-toi', function () {
    return app(CustomPageController::class)->show('lien-he-voi-chung-toi');
})->name('vi.lien-he-voi-chung-toi');

Route::get('/lien-he', function () {
    return redirect()->route('custom-page.show', 'lien-he-voi-chung-toi');
})->name('vi.lien-he');

Route::get('/cau-hoi-thuong-gap', function () {
    return redirect()->route('custom-page.show', 'cau-hoi-thuong-gap');
})->name('vi.cau-hoi-thuong-gap');

Route::get('/chinh-sach-hoan-tien', function () {
    return redirect()->route('custom-page.show', 'chinh-sach-hoan-tien');
})->name('vi.chinh-sach-hoan-tien');

Route::get('/bang-dieu-khien', function () {
    return redirect()->route('dashboard');
})->name('vi.dashboard');

Route::get('/translations/{locale}', [TranslationController::class, 'getTranslations'])->name('translations');
Route::get('/refresh-language/{locale}', [TranslationController::class, 'refreshLanguage'])->name('refresh-language');
Route::get('/initial-locale', [TranslationController::class, 'getInitialLocale'])->name('initial-locale');
Route::post('/refresh-all-languages', [TranslationController::class, 'refreshAllLanguages'])->name('refresh-all-languages');







// Test routes
Route::get('tap-test-get', function () {
    return response()->json(['success' => true, 'message' => 'GET Working']);
});

Route::post('tap-test-post', function () {
    return response()->json(['success' => true, 'message' => 'POST Working']);
});

// Invoice payment routes (public - no auth required)
Route::get('tap/create-invoice-payment/{token}/{amount}', [TapPaymentController::class, 'createInvoicePayment'])->name('tap.create-invoice-payment-get');

// Test route
Route::post('test-mollie', function () {
    return response()->json(['success' => true, 'message' => 'Test route working']);
})->withoutMiddleware([\App\Http\Middleware\VerifyCsrfToken::class]);

Route::middleware([\App\Http\Middleware\VerifyCsrfToken::class])
    ->group(function () {
        Route::post('aamarpay/create-invoice-payment', [AamarpayPaymentController::class, 'createInvoicePayment'])
        ->name('aamarpay.create-invoice-payment');
        Route::post('aamarpay/invoice/callback', [AamarpayPaymentController::class, 'invoiceCallback'])->name('aamarpay.invoice.callback');
        Route::match(['GET', 'POST'], 'aamarpay/invoice-success', [AamarpayPaymentController::class, 'invoiceSuccess'])->name('aamarpay.invoice.success');
    });

Route::withoutMiddleware([\App\Http\Middleware\VerifyCsrfToken::class])
    ->group(function () {

        Route::post('aamarpay/create-payment', [AamarpayPaymentController::class, 'createPayment'])->name('aamarpay.create-payment');
        Route::match(['GET', 'POST'], 'payments/aamarpay/success', [AamarpayPaymentController::class, 'success'])->name('aamarpay.success');
        Route::post('payments/aamarpay/callback', [AamarpayPaymentController::class, 'callback'])->name('aamarpay.callback');
        Route::post('easebuzz/create-invoice-payment', [EasebuzzPaymentController::class, 'createInvoicePayment'])->name('easebuzz.create-invoice-payment');
        Route::post('yookassa/create-invoice-payment', [YooKassaPaymentController::class, 'createInvoicePayment'])->name('yookassa.create-invoice-payment');
        Route::post('midtrans/create-invoice-payment', [MidtransPaymentController::class, 'createInvoicePayment'])->name('midtrans.create-invoice-payment');
        Route::post('cashfree/verify-invoice-payment', [CashfreeController::class, 'verifyInvoicePayment'])->name('cashfree.verify-invoice-payment');
        Route::post('razorpay/create-invoice-order', [RazorpayController::class, 'createInvoiceOrder'])->name('razorpay.create-invoice-order');
        Route::post('razorpay/verify-invoice-payment', [RazorpayController::class, 'verifyInvoicePayment'])->name('razorpay.verify-invoice-payment');
        Route::post('mercadopago/invoice-create-preference', [MercadoPagoController::class, 'createInvoicePreference'])->name('invoice.mercadopago.create-preference');
        Route::get('mercadopago/invoice-success', [MercadoPagoController::class, 'InvoiceSuccess'])->name('invoice.mercadopago.success');
        Route::get('mercadopago/invoice-failure', [MercadoPagoController::class, 'InvoiceFailure'])->name('invoice.mercadopago.failure');
        Route::get('mercadopago/invoice-pending', [MercadoPagoController::class, 'InvoicePending'])->name('invoice.mercadopago.pending');
        Route::post('mercadopago/process-invoice-payment', [MercadoPagoController::class, 'processInvoicePayment'])->name('invoice.mercadopago.process-payment');

        Route::post('payfast/create-invoice-payment', [PayfastPaymentController::class, 'createInvoicePayment'])->name('payfast.create-invoice-payment');
        Route::post('paytr/create-invoice-payment', [PayTRPaymentController::class, 'createInvoicePayment'])->name('paytr.create-invoice-payment');
        Route::post('iyzipay/create-invoice-payment', [IyzipayPaymentController::class, 'createInvoicePayment'])->name('iyzipay.create-invoice-payment');



        Route::post('benefit/create-invoice-session', [BenefitPaymentController::class, 'createInvoiceSession'])->name('benefit.create-invoice-session');

        Route::match(['GET', 'POST'], 'authorizenet/invoice/success', [AuthorizeNetPaymentController::class, 'invoiceSuccess'])->name('authorizenet.invoice.success');
        Route::post('ozow/process-invoice-payment', [OzowPaymentController::class, 'processInvoicePayment'])->name('ozow.process-invoice-payment');
    });

// Skrill test page route (outside CSRF group)
Route::get('skrill-test', function (\Illuminate\Http\Request $request) {
    return view('skrill-test', [
        'amount' => $request->amount,
        'orderId' => $request->order_id,
        'invoiceToken' => $request->invoice_token
    ]);
})->name('skrill.test.page');

// Cashfree test page route (outside CSRF group)
Route::get('cashfree-test', function (\Illuminate\Http\Request $request) {
    $successUrl = route('cashfree.invoice.success') . '?order_id=' . $request->order_id . '&invoice_token=' . $request->invoice_token . '&test=1';
    return view('cashfree-test', [
        'amount' => $request->amount,
        'order_id' => $request->order_id,
        'invoice_token' => $request->invoice_token,
        'success_url' => $successUrl
    ]);
})->name('cashfree.test.page');





Route::middleware(['auth', 'verified'])->group(function () {
    // Plans routes - accessible without plan check
    Route::get('goi-dich-vu', [PlanController::class, 'index'])->name('plans.index');
    Route::get('plans', function () {
        return redirect()->route('plans.index');
    });
    Route::post('plans/request', [PlanController::class, 'requestPlan'])->name('plans.request');
    Route::post('plans/trial', [PlanController::class, 'startTrial'])->name('plans.trial');
    Route::post('plans/subscribe', [PlanController::class, 'subscribe'])->name('plans.subscribe');
    Route::post('plans/coupons/validate', [CouponController::class, 'validate'])->name('coupons.validate');

    // Payment routes - accessible without plan check
    Route::post('payments/stripe', [StripePaymentController::class, 'processPayment'])->name('stripe.payment');
    Route::post('payments/paypal', [PayPalPaymentController::class, 'processPayment'])->name('paypal.payment');
    Route::post('payments/bank', [BankPaymentController::class, 'processPayment'])->name('bank.payment');
    Route::post('payments/paystack', [PaystackPaymentController::class, 'processPayment'])->name('paystack.payment');
    Route::post('payments/flutterwave', [FlutterwavePaymentController::class, 'processPayment'])->name('flutterwave.payment');
    Route::post('payments/paytabs', [PayTabsPaymentController::class, 'processPayment'])->name('paytabs.payment');
    Route::post('payments/skrill', [SkrillPaymentController::class, 'processPayment'])->name('skrill.payment');
    Route::post('payments/coingate', [CoinGatePaymentController::class, 'processPayment'])->name('coingate.payment');
    Route::post('payments/payfast', [PayfastPaymentController::class, 'processPayment'])->name('payfast.payment');
    Route::post('payments/mollie', [MolliePaymentController::class, 'processPayment'])->name('mollie.payment');
    Route::post('payments/toyyibpay', [ToyyibPayPaymentController::class, 'processPayment'])->name('toyyibpay.payment');
    Route::post('payments/iyzipay', [IyzipayPaymentController::class, 'processPayment'])->name('iyzipay.payment');
    Route::post('payments/benefit', [BenefitPaymentController::class, 'processPayment'])->name('benefit.payment');
    Route::post('payments/ozow', [OzowPaymentController::class, 'processPayment'])->name('ozow.payment');
    Route::post('payments/easebuzz', [EasebuzzPaymentController::class, 'processPayment'])->name('easebuzz.payment');
    Route::post('payments/khalti', [KhaltiPaymentController::class, 'processPayment'])->name('khalti.payment');
    Route::post('payments/authorizenet', [AuthorizeNetPaymentController::class, 'processPayment'])->name('authorizenet.payment');
    Route::post('payments/fedapay', [FedaPayPaymentController::class, 'processPayment'])->name('fedapay.payment');
    Route::post('payments/payhere', [PayHerePaymentController::class, 'processPayment'])->name('payhere.payment');
    Route::post('payments/cinetpay', [CinetPayPaymentController::class, 'processPayment'])->name('cinetpay.payment');
    Route::post('payments/paiement', [PaiementPaymentController::class, 'processPayment'])->name('paiement.payment');

    Route::post('payments/yookassa', [YooKassaPaymentController::class, 'processPayment'])->name('yookassa.payment');
    Route::post('payments/aamarpay', [AamarpayPaymentController::class, 'processPayment'])->name('aamarpay.payment');
    Route::post('payments/midtrans', [MidtransPaymentController::class, 'processPayment'])->name('midtrans.payment');

    // Midtrans success/callback routes
    Route::match(['GET', 'POST'], 'payments/midtrans/success', [MidtransPaymentController::class, 'success'])->name('midtrans.success');
    Route::post('payments/midtrans/callback', [MidtransPaymentController::class, 'callback'])->name('midtrans.callback');
    Route::get('mercadopago/success', [MercadoPagoController::class, 'success'])->name('mercadopago.success');
    Route::get('mercadopago/failure', [MercadoPagoController::class, 'failure'])->name('mercadopago.failure');
    Route::get('mercadopago/pending', [MercadoPagoController::class, 'pending'])->name('mercadopago.pending');
    Route::post('mercadopago/webhook', [MercadoPagoController::class, 'webhook'])->name('mercadopago.webhook');
    Route::post('mercadopago/create-preference', [MercadoPagoController::class, 'createPreference'])->name('mercadopago.create-preference');
    Route::post('mercadopago/process-payment', [MercadoPagoController::class, 'processPayment'])->name('mercadopago.process-payment');

    // Payment gateway specific routes
    Route::post('razorpay/create-order', [RazorpayController::class, 'createOrder'])->name('razorpay.create-order');
    Route::post('razorpay/verify-payment', [RazorpayController::class, 'verifyPayment'])->name('razorpay.verify-payment');
    Route::post('cashfree/create-session', [CashfreeController::class, 'createPaymentSession'])->name('cashfree.create-session');
    Route::post('cashfree/verify-payment', [CashfreeController::class, 'verifyPayment'])->name('cashfree.verify-payment');

    // Other payment creation routes
    Route::post('tap/create-payment', [TapPaymentController::class, 'createPayment'])->name('tap.create-payment');
    Route::post('xendit/create-payment', [XenditPaymentController::class, 'createPayment'])->name('xendit.create-payment');
    Route::post('payments/paytr/create-token', [PayTRPaymentController::class, 'createPaymentToken'])->name('paytr.create-token');
    Route::post('iyzipay/create-form', [IyzipayPaymentController::class, 'createPaymentForm'])->name('iyzipay.create-form');
    Route::post('benefit/create-session', [BenefitPaymentController::class, 'createPaymentSession'])->name('benefit.create-session');
    Route::post('ozow/create-payment', [OzowPaymentController::class, 'createPayment'])->name('ozow.create-payment');
    Route::post('easebuzz/create-payment', [EasebuzzPaymentController::class, 'createPayment'])->name('easebuzz.create-payment');
    Route::post('khalti/create-payment', [KhaltiPaymentController::class, 'createPayment'])->name('khalti.create-payment');
    Route::post('authorizenet/create-form', [AuthorizeNetPaymentController::class, 'createPaymentForm'])->name('authorizenet.create-form');
    Route::post('fedapay/create-payment', [FedaPayPaymentController::class, 'createPayment'])->name('fedapay.create-payment');
    Route::post('payhere/create-payment', [PayHerePaymentController::class, 'createPayment'])->name('payhere.create-payment');
    Route::post('cinetpay/create-payment', [CinetPayPaymentController::class, 'createPayment'])->name('cinetpay.create-payment');

    Route::post('yookassa/create-payment', [YooKassaPaymentController::class, 'createPayment'])->name('yookassa.create-payment');

    Route::post('midtrans/create-payment', [MidtransPaymentController::class, 'createPayment'])->name('midtrans.create-payment');

    // Payment success/callback routes
    Route::get('payments/paytr/success', [PayTRPaymentController::class, 'success'])->name('paytr.success');
    Route::get('payments/paytr/failure', [PayTRPaymentController::class, 'failure'])->name('paytr.failure');
    Route::get('payments/mollie/success', [MolliePaymentController::class, 'success'])->name('mollie.success');
    Route::post('payments/mollie/callback', [MolliePaymentController::class, 'callback'])->name('mollie.callback');
    Route::match(['GET', 'POST'], 'payments/toyyibpay/success', [ToyyibPayPaymentController::class, 'success'])->name('toyyibpay.success');
    Route::post('payments/toyyibpay/callback', [ToyyibPayPaymentController::class, 'callback'])->name('toyyibpay.callback');
    Route::post('payments/iyzipay/callback', [IyzipayPaymentController::class, 'callback'])->name('iyzipay.callback');

    Route::get('payments/ozow/success', [OzowPaymentController::class, 'success'])->name('ozow.success');
    Route::post('payments/ozow/callback', [OzowPaymentController::class, 'callback'])->name('ozow.callback');
    Route::get('payments/payhere/success', [PayHerePaymentController::class, 'success'])->name('payhere.success');
    Route::post('payments/payhere/callback', [PayHerePaymentController::class, 'callback'])->name('payhere.callback');
    Route::get('payments/cinetpay/success', [CinetPayPaymentController::class, 'success'])->name('cinetpay.success');
    Route::post('payments/cinetpay/callback', [CinetPayPaymentController::class, 'callback'])->name('cinetpay.callback');
    Route::post('paiement/create-payment', [PaiementPaymentController::class, 'createPayment'])->name('paiement.create-payment');
    Route::get('payments/paiement/success', [PaiementPaymentController::class, 'success'])
        ->withoutMiddleware([\App\Http\Middleware\VerifyCsrfToken::class])
        ->name('paiement.success');
    Route::post('payments/paiement/callback', [PaiementPaymentController::class, 'callback'])
        ->withoutMiddleware([\App\Http\Middleware\VerifyCsrfToken::class])
        ->name('paiement.callback');
    Route::post('authorizenet/test-connection', [AuthorizeNetPaymentController::class, 'testConnection'])->name('authorizenet.test-connection');

    // All other routes require plan access check
    Route::middleware('plan.access')->group(function () {
        Route::get('bang-dieu-khien', [DashboardController::class, 'index'])->name('dashboard');
        Route::get('dashboard', function () {
            return redirect()->route('dashboard');
        });
        Route::get('dashboard/redirect', [DashboardController::class, 'redirectToFirstAvailablePage'])->name('dashboard.redirect');

        // Analytics routes
        Route::get('thong-ke-bao-cao', [\App\Http\Controllers\DashboardAnalyticsController::class, 'index'])->name('analytics.index');
        Route::get('analytics', function () {
            return redirect()->route('analytics.index');
        });

        Route::get('thu-vien-media', function () {
            $storageSettings = \App\Services\StorageConfigService::getStorageConfig();
            $planLimits = null;
            if (auth()->user()->type === 'company') {
                $user = auth()->user();
                $plan = $user->getCurrentPlan();

                if ($plan && $plan->storage_limit > 0) {
                    $companyUsers = \App\Models\User::where('created_by', $user->id)->pluck('id')->push($user->id);
                    $currentStorageUsage = \Spatie\MediaLibrary\MediaCollections\Models\Media::whereIn('user_id', $companyUsers)->sum('size');
                    $storageLimit = $plan->storage_limit * 1024 * 1024 * 1024;
                    $planLimits = [
                        'current_storage' => $currentStorageUsage,
                        'max_storage' => $storageLimit,
                        'can_create' => $currentStorageUsage < $storageLimit
                    ];
                }
            }

            return Inertia::render('media-library', [
                'storageSettings' => $storageSettings,
                'planLimits' => $planLimits
            ]);
        })->middleware('permission:manage-media')->name('media-library');

        Route::get('media-library', function () {
            return redirect()->route('media-library');
        });



        // Media Library API routes
        Route::get('api/media', [MediaController::class, 'index'])->middleware('permission:manage-media')->name('api.media.index');
        Route::post('api/media/batch', [MediaController::class, 'batchStore'])->middleware('permission:create-media')->name('api.media.batch');
        Route::get('api/media/{id}/download', [MediaController::class, 'download'])->middleware('permission:download-media')->name('api.media.download');
        Route::delete('api/media/{id}', [MediaController::class, 'destroy'])->middleware('permission:delete-media')->name('api.media.destroy');

        // Document API routes
        Route::get('api/documents/{document}/download', [\App\Http\Controllers\DocumentController::class, 'apiDownload'])->middleware('permission:download-documents')->name('api.documents.download');

        // Permissions routes with granular permissions
        Route::middleware('permission:manage-permissions')->group(function () {
            Route::get('permissions', [PermissionController::class, 'index'])->middleware('permission:manage-permissions')->name('permissions.index');
            Route::get('permissions/create', [PermissionController::class, 'create'])->middleware('permission:create-permissions')->name('permissions.create');
            Route::post('permissions', [PermissionController::class, 'store'])->middleware('permission:create-permissions')->name('permissions.store');
            Route::get('permissions/{permission}', [PermissionController::class, 'show'])->middleware('permission:view-permissions')->name('permissions.show');
            Route::get('permissions/{permission}/edit', [PermissionController::class, 'edit'])->middleware('permission:edit-permissions')->name('permissions.edit');
            Route::put('permissions/{permission}', [PermissionController::class, 'update'])->middleware('permission:edit-permissions')->name('permissions.update');
            Route::patch('permissions/{permission}', [PermissionController::class, 'update'])->middleware('permission:edit-permissions');
            Route::delete('permissions/{permission}', [PermissionController::class, 'destroy'])->middleware('permission:delete-permissions')->name('permissions.destroy');
        });

        // Roles routes with granular permissions
        Route::middleware('permission:manage-roles')->group(function () {
            Route::get('vai-tro-phan-quyen', [RoleController::class, 'index'])->middleware('permission:manage-roles')->name('roles.index');
            Route::get('roles', function () {
                return redirect()->route('roles.index');
            });
            Route::get('vai-tro-phan-quyen/tao', [RoleController::class, 'create'])->middleware('permission:create-roles')->name('roles.create');
            Route::post('roles', [RoleController::class, 'store'])->middleware('permission:create-roles')->name('roles.store');
            Route::get('vai-tro-phan-quyen/{role}', [RoleController::class, 'show'])->middleware('permission:view-roles')->name('roles.show');
            Route::get('vai-tro-phan-quyen/{role}/chinh-sua', [RoleController::class, 'edit'])->middleware('permission:edit-roles')->name('roles.edit');
            Route::put('roles/{role}', [RoleController::class, 'update'])->middleware('permission:edit-roles')->name('roles.update');
            Route::patch('roles/{role}', [RoleController::class, 'update'])->middleware('permission:edit-roles');
            Route::delete('roles/{role}', [RoleController::class, 'destroy'])->middleware('permission:delete-roles')->name('roles.destroy');
            Route::get('roles/create', fn () => redirect()->route('roles.create'));
            Route::get('roles/{role}/edit', fn ($role) => redirect()->route('roles.edit', $role));
            Route::get('roles/{role}', fn ($role) => redirect()->route('roles.show', $role));
        });

        // Users routes with granular permissions
        Route::middleware('permission:manage-users')->group(function () {
            Route::get('thanh-vien', [UserController::class, 'index'])->middleware('permission:manage-users')->name('users.index');
            Route::get('users', function () {
                return redirect()->route('users.index');
            });
            Route::get('thanh-vien/tao', [UserController::class, 'create'])->middleware('permission:create-users')->name('users.create');
            Route::post('users', [UserController::class, 'store'])->middleware('permission:create-users')->name('users.store');
            Route::get('thanh-vien/{user}', [UserController::class, 'show'])->middleware('permission:view-users')->name('users.show');
            Route::get('thanh-vien/{user}/chinh-sua', [UserController::class, 'edit'])->middleware('permission:edit-users')->name('users.edit');
            Route::put('users/{user}', [UserController::class, 'update'])->middleware('permission:edit-users')->name('users.update');
            Route::patch('users/{user}', [UserController::class, 'update'])->middleware('permission:edit-users');
            Route::delete('users/{user}', [UserController::class, 'destroy'])->middleware('permission:delete-users')->name('users.destroy');
            Route::get('user-logs', [UserController::class, 'loginhistory'])->middleware('permission:view-users-log-history')->name('user-logs.index');
            Route::delete('user-logs/{loginHistory}', [UserController::class, 'destroyLoginHistory'])->middleware('permission:delete-users-log-history')->name('user-logs.destroy');

            // Additional user routes
            Route::put('users/{user}/reset-password', [UserController::class, 'resetPassword'])->middleware('permission:reset-password-users')->name('users.reset-password');
            Route::put('users/{user}/toggle-status', [UserController::class, 'toggleStatus'])->middleware('permission:toggle-status-users')->name('users.toggle-status');
            Route::get('users/create', fn () => redirect()->route('users.create'));
            Route::get('users/{user}/edit', fn ($user) => redirect()->route('users.edit', $user));
            Route::get('users/{user}', fn ($user) => redirect()->route('users.show', $user));
        });



        // Client Type routes
        Route::middleware('permission:manage-client-types')->group(function () {
            Route::get('khach-hang/loai-khach-hang', [\App\Http\Controllers\ClientTypeController::class, 'index'])->name('clients.client-types.index');
            Route::redirect('client/client-types', 'khach-hang/loai-khach-hang');
            Route::post('client/client-types', [\App\Http\Controllers\ClientTypeController::class, 'store'])->middleware('permission:create-client-types')->name('clients.client-types.store');
            Route::put('client/client-types/{clientType}', [\App\Http\Controllers\ClientTypeController::class, 'update'])->middleware('permission:edit-client-types')->name('clients.client-types.update');
            Route::delete('client/client-types/{clientType}', [\App\Http\Controllers\ClientTypeController::class, 'destroy'])->middleware('permission:delete-client-types')->name('clients.client-types.destroy');
            Route::put('client/client-types/{clientType}/toggle-status', [\App\Http\Controllers\ClientTypeController::class, 'toggleStatus'])->middleware('permission:toggle-status-client-types')->name('clients.client-types.toggle-status');
        });

        // Client routes
        Route::middleware('permission:manage-clients')->group(function () {
            Route::get('khach-hang', [\App\Http\Controllers\ClientController::class, 'index'])->name('clients.index');
            Route::get('clients', function () {
                return redirect()->route('clients.index');
            });
            Route::get('khach-hang/{client}', [\App\Http\Controllers\ClientController::class, 'show'])->middleware('permission:view-clients')->name('clients.show');
            Route::post('clients', [\App\Http\Controllers\ClientController::class, 'store'])->middleware('permission:create-clients')->name('clients.store');
            Route::put('clients/{client}', [\App\Http\Controllers\ClientController::class, 'update'])->middleware('permission:edit-clients')->name('clients.update');
            Route::delete('clients/{client}', [\App\Http\Controllers\ClientController::class, 'destroy'])->middleware('permission:delete-clients')->name('clients.destroy');
            Route::put('clients/{client}/toggle-status', [\App\Http\Controllers\ClientController::class, 'toggleStatus'])->middleware('permission:toggle-status-clients')->name('clients.toggle-status');
            Route::put('clients/{client}/reset-password', [\App\Http\Controllers\ClientController::class, 'resetPassword'])->middleware('permission:reset-client-password')->name('clients.reset-password');
            Route::post('clients/{client}/assign-lawyer', [\App\Http\Controllers\ClientController::class, 'assignLawyer'])->name('clients.assign-lawyer');
            Route::get('clients/{client}', fn ($client) => redirect()->route('clients.show', $client));
        });



        // Client Document routes
        Route::middleware('permission:manage-client-documents')->group(function () {
            Route::get('khach-hang/tai-lieu', [\App\Http\Controllers\ClientDocumentController::class, 'index'])->name('clients.documents.index');
            Route::redirect('client/documents', 'khach-hang/tai-lieu');
            Route::post('client/documents', [\App\Http\Controllers\ClientDocumentController::class, 'store'])->middleware('permission:create-client-documents')->name('clients.documents.store');
            Route::put('client/documents/{document}', [\App\Http\Controllers\ClientDocumentController::class, 'update'])->middleware('permission:edit-client-documents')->name('clients.documents.update');
            Route::delete('client/documents/{document}', [\App\Http\Controllers\ClientDocumentController::class, 'destroy'])->middleware('permission:delete-client-documents')->name('clients.documents.destroy');
            Route::get('khach-hang/tai-lieu/{document}/tai-xuong', [\App\Http\Controllers\ClientDocumentController::class, 'download'])->middleware('permission:download-client-documents')->name('clients.documents.download');
        });

        // Client Billing Info routes
        Route::middleware('permission:manage-client-billing')->group(function () {
            Route::get('khach-hang/thong-tin-thanh-toan', [\App\Http\Controllers\ClientBillingInfoController::class, 'index'])->name('clients.billing.index');
            Route::redirect('client/billing', 'khach-hang/thong-tin-thanh-toan');
            Route::post('client/billing', [\App\Http\Controllers\ClientBillingInfoController::class, 'store'])->middleware('permission:create-client-billing')->name('clients.billing.store');
            Route::put('client/billing/{billing}', [\App\Http\Controllers\ClientBillingInfoController::class, 'update'])->middleware('permission:edit-client-billing')->name('clients.billing.update');
            Route::delete('client/billing/{billing}', [\App\Http\Controllers\ClientBillingInfoController::class, 'destroy'])->middleware('permission:delete-client-billing')->name('clients.billing.destroy');
        });

        // Client Billing Currency routes
        Route::middleware('permission:manage-client-billing-currencies')->group(function () {
            Route::get('tien-te-khach-hang', [\App\Http\Controllers\ClientBillingCurrencyController::class, 'index'])->name('client-billing-currencies.index');
            Route::redirect('client-billing-currencies', 'tien-te-khach-hang');
            Route::post('client-billing-currencies', [\App\Http\Controllers\ClientBillingCurrencyController::class, 'store'])->middleware('permission:create-client-billing-currencies')->name('client-billing-currencies.store');
            Route::put('client-billing-currencies/{clientBillingCurrency}', [\App\Http\Controllers\ClientBillingCurrencyController::class, 'update'])->middleware('permission:edit-client-billing-currencies')->name('client-billing-currencies.update');
            Route::delete('client-billing-currencies/{clientBillingCurrency}', [\App\Http\Controllers\ClientBillingCurrencyController::class, 'destroy'])->middleware('permission:delete-client-billing-currencies')->name('client-billing-currencies.destroy');
            Route::get('api/client-billing-currencies', [\App\Http\Controllers\ClientBillingCurrencyController::class, 'getAllCurrencies'])->name('api.client-billing-currencies');
        });

        // Company Profile routes
        Route::middleware('permission:manage-company-profiles')->group(function () {
            Route::get('ho-so-to-chuc', [\App\Http\Controllers\CompanyProfileController::class, 'index'])->name('advocate.company-profiles.index');
            Route::get('advocate/ho-so-to-chuc', function () {
                return redirect()->route('advocate.company-profiles.index');
            });
            Route::get('advocate/company-profiles', function () {
                return redirect()->route('advocate.company-profiles.index');
            });
            Route::post('advocate/company-profiles', [\App\Http\Controllers\CompanyProfileController::class, 'store'])->middleware('permission:create-company-profiles')->name('advocate.company-profiles.store');
            Route::put('advocate/company-profiles/{profile}', [\App\Http\Controllers\CompanyProfileController::class, 'update'])->middleware('permission:edit-company-profiles')->name('advocate.company-profiles.update');
            Route::delete('advocate/company-profiles/{profile}', [\App\Http\Controllers\CompanyProfileController::class, 'destroy'])->middleware('permission:delete-company-profiles')->name('advocate.company-profiles.destroy');
            Route::put('advocate/company-profiles/{profile}/toggle-status', [\App\Http\Controllers\CompanyProfileController::class, 'toggleStatus'])->middleware('permission:toggle-status-company-profiles')->name('advocate.company-profiles.toggle-status');
        });

        // Practice Area routes
        Route::middleware('permission:manage-practice-areas')->group(function () {
            Route::get('linh-vuc-hanh-nghe', [\App\Http\Controllers\PracticeAreaController::class, 'index'])->name('advocate.practice-areas.index');
            Route::redirect('advocate/practice-areas', 'linh-vuc-hanh-nghe');
            Route::post('advocate/practice-areas', [\App\Http\Controllers\PracticeAreaController::class, 'store'])->middleware('permission:create-practice-areas')->name('advocate.practice-areas.store');
            Route::put('advocate/practice-areas/{area}', [\App\Http\Controllers\PracticeAreaController::class, 'update'])->middleware('permission:edit-practice-areas')->name('advocate.practice-areas.update');
            Route::delete('advocate/practice-areas/{area}', [\App\Http\Controllers\PracticeAreaController::class, 'destroy'])->middleware('permission:delete-practice-areas')->name('advocate.practice-areas.destroy');
            Route::put('advocate/practice-areas/{area}/toggle-status', [\App\Http\Controllers\PracticeAreaController::class, 'toggleStatus'])->middleware('permission:toggle-status-practice-areas')->name('advocate.practice-areas.toggle-status');
        });

        // Company Setting routes
        Route::middleware('permission:manage-company-settings')->group(function () {
            Route::get('advocate/company-settings', [\App\Http\Controllers\CompanySettingController::class, 'index'])->name('advocate.company-settings.index');
            Route::put('advocate/company-settings/{setting}', [\App\Http\Controllers\CompanySettingController::class, 'update'])->middleware('permission:edit-company-settings')->name('advocate.company-settings.update');
        });

        // Case Document routes
        Route::middleware('permission:manage-case-documents')->group(function () {
            Route::get('advocate/case-documents', [\App\Http\Controllers\CaseDocumentController::class, 'index'])->name('advocate.case-documents.index');
            Route::post('advocate/case-documents', [\App\Http\Controllers\CaseDocumentController::class, 'store'])->middleware('permission:create-case-documents')->name('advocate.case-documents.store');
            Route::put('advocate/case-documents/{document}', [\App\Http\Controllers\CaseDocumentController::class, 'update'])->middleware('permission:edit-case-documents')->name('advocate.case-documents.update');
            Route::delete('advocate/case-documents/{document}', [\App\Http\Controllers\CaseDocumentController::class, 'destroy'])->middleware('permission:delete-case-documents')->name('advocate.case-documents.destroy');
            Route::get('advocate/case-documents/{document}/download', [\App\Http\Controllers\CaseDocumentController::class, 'download'])->middleware('permission:download-case-documents')->name('advocate.case-documents.download');
        });

        // Case Note routes
        Route::middleware('permission:manage-case-notes')->group(function () {
            Route::get('advocate/case-notes', [\App\Http\Controllers\CaseNoteController::class, 'index'])->name('advocate.case-notes.index');
            Route::post('advocate/case-notes', [\App\Http\Controllers\CaseNoteController::class, 'store'])->middleware('permission:create-case-notes')->name('advocate.case-notes.store');
            Route::put('advocate/case-notes/{note}', [\App\Http\Controllers\CaseNoteController::class, 'update'])->middleware('permission:edit-case-notes')->name('advocate.case-notes.update');
            Route::delete('advocate/case-notes/{note}', [\App\Http\Controllers\CaseNoteController::class, 'destroy'])->middleware('permission:delete-case-notes')->name('advocate.case-notes.destroy');
        });

        // Document Type routes
        Route::middleware('permission:manage-document-types')->group(function () {
            Route::get('advocate/document-types', [\App\Http\Controllers\DocumentTypeController::class, 'index'])->name('advocate.document-types.index');
            Route::post('advocate/document-types', [\App\Http\Controllers\DocumentTypeController::class, 'store'])->middleware('permission:create-document-types')->name('advocate.document-types.store');
            Route::put('advocate/document-types/{documentType}', [\App\Http\Controllers\DocumentTypeController::class, 'update'])->middleware('permission:edit-document-types')->name('advocate.document-types.update');
            Route::delete('advocate/document-types/{documentType}', [\App\Http\Controllers\DocumentTypeController::class, 'destroy'])->middleware('permission:delete-document-types')->name('advocate.document-types.destroy');
            Route::put('advocate/document-types/{documentType}/toggle-status', [\App\Http\Controllers\DocumentTypeController::class, 'toggleStatus'])->middleware('permission:toggle-status-document-types')->name('advocate.document-types.toggle-status');
        });

        // Document Category routes
        Route::middleware('permission:manage-document-categories')->group(function () {
            Route::get('tai-lieu/danh-muc', [\App\Http\Controllers\DocumentCategoryController::class, 'index'])->name('document-management.categories.index');
            Route::redirect('document-management/categories', 'tai-lieu/danh-muc');
            Route::post('document-management/categories', [\App\Http\Controllers\DocumentCategoryController::class, 'store'])->middleware('permission:create-document-categories')->name('document-management.categories.store');
            Route::put('document-management/categories/{category}', [\App\Http\Controllers\DocumentCategoryController::class, 'update'])->middleware('permission:edit-document-categories')->name('document-management.categories.update');
            Route::delete('document-management/categories/{category}', [\App\Http\Controllers\DocumentCategoryController::class, 'destroy'])->middleware('permission:delete-document-categories')->name('document-management.categories.destroy');
            Route::put('document-management/categories/{category}/toggle-status', [\App\Http\Controllers\DocumentCategoryController::class, 'toggleStatus'])->middleware('permission:toggle-status-document-categories')->name('document-management.categories.toggle-status');
        });

        // Document routes
        Route::middleware('permission:manage-documents')->group(function () {
            Route::get('tai-lieu', [\App\Http\Controllers\DocumentController::class, 'gallery'])->name('document-management.documents.index');
            Route::get('document-management/tai-lieu', function () {
                return redirect()->route('document-management.documents.index');
            });
            Route::get('document-management/documents', function () {
                return redirect()->route('document-management.documents.index');
            });
            Route::get('tai-lieu/{document}', [\App\Http\Controllers\DocumentController::class, 'show'])->middleware('permission:view-documents')->name('document-management.documents.show');
            Route::get('tai-lieu/phien-ban/{version}', [\App\Http\Controllers\DocumentController::class, 'version'])->middleware('permission:view-document-versions')->name('document-management.documents.version');
            Route::get('tai-lieu/{document}/binh-luan', [\App\Http\Controllers\DocumentController::class, 'comments'])->middleware('permission:view-document-comments')->name('document-management.documents.comments');
            Route::post('document-management/documents', [\App\Http\Controllers\DocumentController::class, 'store'])->middleware('permission:create-documents')->name('document-management.documents.store');
            Route::put('document-management/documents/{document}', [\App\Http\Controllers\DocumentController::class, 'update'])->middleware('permission:edit-documents')->name('document-management.documents.update');
            Route::delete('document-management/documents/{document}', [\App\Http\Controllers\DocumentController::class, 'destroy'])->middleware('permission:delete-documents')->name('document-management.documents.destroy');
            Route::put('document-management/documents/{document}/toggle-status', [\App\Http\Controllers\DocumentController::class, 'toggleStatus'])->middleware('permission:toggle-status-documents')->name('document-management.documents.toggle-status');
            Route::get('tai-lieu/{document}/tai-xuong', [\App\Http\Controllers\DocumentController::class, 'download'])->middleware('permission:download-documents')->name('document-management.documents.download');
            Route::get('document-management/documents/version/{version}', fn ($version) => redirect()->route('document-management.documents.version', $version));
            Route::get('document-management/documents/comments/{document}', fn ($document) => redirect()->route('document-management.documents.comments', $document));
            Route::get('document-management/documents/{document}', fn ($document) => redirect()->route('document-management.documents.show', $document));
            Route::get('document-management/documents/{document}/download', fn ($document) => redirect()->route('document-management.documents.download', $document));
        });



        // Document Version routes
        Route::middleware('permission:manage-document-versions')->group(function () {
            Route::get('tai-lieu/phien-ban', [\App\Http\Controllers\DocumentVersionController::class, 'index'])->name('document-management.versions.index');
            Route::redirect('document-management/versions', 'tai-lieu/phien-ban');
            Route::post('document-management/versions', [\App\Http\Controllers\DocumentVersionController::class, 'store'])->middleware('permission:create-document-versions')->name('document-management.versions.store');
            Route::delete('document-management/versions/{version}', [\App\Http\Controllers\DocumentVersionController::class, 'destroy'])->middleware('permission:delete-document-versions')->name('document-management.versions.destroy');
            Route::get('tai-lieu/phien-ban/{version}/tai-xuong', [\App\Http\Controllers\DocumentVersionController::class, 'download'])->middleware('permission:download-document-versions')->name('document-management.versions.download');
            Route::get('document-management/versions/{version}/download', fn ($version) => redirect()->route('document-management.versions.download', $version));
            Route::put('document-management/versions/{version}/restore', [\App\Http\Controllers\DocumentVersionController::class, 'restore'])->middleware('permission:restore-document-versions')->name('document-management.versions.restore');
        });

        // Document Comment routes
        Route::middleware('permission:manage-document-comments')->group(function () {
            Route::get('tai-lieu/binh-luan', [\App\Http\Controllers\DocumentCommentController::class, 'index'])->name('document-management.comments.index');
            Route::redirect('document-management/comments', 'tai-lieu/binh-luan');
            Route::post('document-management/comments', [\App\Http\Controllers\DocumentCommentController::class, 'store'])->middleware('permission:create-document-comments')->name('document-management.comments.store');
            Route::put('document-management/comments/{comment}', [\App\Http\Controllers\DocumentCommentController::class, 'update'])->middleware('permission:edit-document-comments')->name('document-management.comments.update');
            Route::delete('document-management/comments/{comment}', [\App\Http\Controllers\DocumentCommentController::class, 'destroy'])->middleware('permission:delete-document-comments')->name('document-management.comments.destroy');
            Route::put('document-management/comments/{comment}/toggle-resolve', [\App\Http\Controllers\DocumentCommentController::class, 'toggleResolve'])->middleware('permission:resolve-document-comments')->name('document-management.comments.toggle-resolve');
        });

        // Document Permission routes
        Route::middleware('permission:manage-document-permissions')->group(function () {
            Route::get('tai-lieu/phan-quyen', [\App\Http\Controllers\DocumentPermissionController::class, 'index'])->name('document-management.permissions.index');
            Route::redirect('document-management/permissions', 'tai-lieu/phan-quyen');
            Route::post('document-management/permissions', [\App\Http\Controllers\DocumentPermissionController::class, 'store'])->middleware('permission:create-document-permissions')->name('document-management.permissions.store');
            Route::put('document-management/permissions/{permission}', [\App\Http\Controllers\DocumentPermissionController::class, 'update'])->middleware('permission:edit-document-permissions')->name('document-management.permissions.update');
            Route::delete('document-management/permissions/{permission}', [\App\Http\Controllers\DocumentPermissionController::class, 'destroy'])->middleware('permission:delete-document-permissions')->name('document-management.permissions.destroy');
        });



        // Research Project routes
        Route::middleware('permission:manage-research-projects')->group(function () {
            Route::get('nghien-cuu-phap-ly/du-an', [\App\Http\Controllers\ResearchProjectController::class, 'index'])->name('legal-research.projects.index');
            Route::redirect('legal-research/projects', 'nghien-cuu-phap-ly/du-an');
            Route::get('nghien-cuu-phap-ly/du-an/{project}', [\App\Http\Controllers\ResearchProjectController::class, 'show'])->middleware('permission:view-research-projects')->name('legal-research.projects.show');
            Route::post('legal-research/projects', [\App\Http\Controllers\ResearchProjectController::class, 'store'])->middleware('permission:create-research-projects')->name('legal-research.projects.store');
            Route::put('legal-research/projects/{project}', [\App\Http\Controllers\ResearchProjectController::class, 'update'])->middleware('permission:edit-research-projects')->name('legal-research.projects.update');
            Route::delete('legal-research/projects/{project}', [\App\Http\Controllers\ResearchProjectController::class, 'destroy'])->middleware('permission:delete-research-projects')->name('legal-research.projects.destroy');
            Route::put('legal-research/projects/{project}/toggle-status', [\App\Http\Controllers\ResearchProjectController::class, 'toggleStatus'])->middleware('permission:toggle-status-research-projects')->name('legal-research.projects.toggle-status');
            Route::get('legal-research/projects/{project}', fn ($project) => redirect()->route('legal-research.projects.show', $project));
        });

        // Research Source routes
        Route::middleware('permission:manage-research-sources')->group(function () {
            Route::get('nghien-cuu-phap-ly/nguon', [\App\Http\Controllers\ResearchSourceController::class, 'index'])->name('legal-research.sources.index');
            Route::redirect('legal-research/sources', 'nghien-cuu-phap-ly/nguon');
            Route::post('legal-research/sources', [\App\Http\Controllers\ResearchSourceController::class, 'store'])->middleware('permission:create-research-sources')->name('legal-research.sources.store');
            Route::put('legal-research/sources/{source}', [\App\Http\Controllers\ResearchSourceController::class, 'update'])->middleware('permission:edit-research-sources')->name('legal-research.sources.update');
            Route::delete('legal-research/sources/{source}', [\App\Http\Controllers\ResearchSourceController::class, 'destroy'])->middleware('permission:delete-research-sources')->name('legal-research.sources.destroy');
            Route::put('legal-research/sources/{source}/toggle-status', [\App\Http\Controllers\ResearchSourceController::class, 'toggleStatus'])->middleware('permission:toggle-status-research-sources')->name('legal-research.sources.toggle-status');
        });

        // Research Category routes
        Route::middleware('permission:manage-research-categories')->group(function () {
            Route::get('nghien-cuu-phap-ly/danh-muc', [\App\Http\Controllers\ResearchCategoryController::class, 'index'])->name('legal-research.categories.index');
            Route::redirect('legal-research/categories', 'nghien-cuu-phap-ly/danh-muc');
            Route::post('legal-research/categories', [\App\Http\Controllers\ResearchCategoryController::class, 'store'])->middleware('permission:create-research-categories')->name('legal-research.categories.store');
            Route::put('legal-research/categories/{category}', [\App\Http\Controllers\ResearchCategoryController::class, 'update'])->middleware('permission:edit-research-categories')->name('legal-research.categories.update');
            Route::delete('legal-research/categories/{category}', [\App\Http\Controllers\ResearchCategoryController::class, 'destroy'])->middleware('permission:delete-research-categories')->name('legal-research.categories.destroy');
            Route::put('legal-research/categories/{category}/toggle-status', [\App\Http\Controllers\ResearchCategoryController::class, 'toggleStatus'])->middleware('permission:toggle-status-research-categories')->name('legal-research.categories.toggle-status');
        });

        // Knowledge Article routes
        Route::middleware('permission:manage-knowledge-articles')->group(function () {
            Route::get('quan-ly-bai-viet', [\App\Http\Controllers\KnowledgeArticleController::class, 'index'])->name('legal-research.knowledge.index');
            Route::get('legal-research/quan-ly-bai-viet', function () {
                return redirect()->route('legal-research.knowledge.index');
            });
            Route::get('legal-research/knowledge', function () {
                return redirect()->route('legal-research.knowledge.index');
            });
            Route::post('legal-research/knowledge', [\App\Http\Controllers\KnowledgeArticleController::class, 'store'])->middleware('permission:create-knowledge-articles')->name('legal-research.knowledge.store');
            Route::put('legal-research/knowledge/{article}', [\App\Http\Controllers\KnowledgeArticleController::class, 'update'])->middleware('permission:edit-knowledge-articles')->name('legal-research.knowledge.update');
            Route::delete('legal-research/knowledge/{article}', [\App\Http\Controllers\KnowledgeArticleController::class, 'destroy'])->middleware('permission:delete-knowledge-articles')->name('legal-research.knowledge.destroy');
            Route::put('legal-research/knowledge/{article}/publish', [\App\Http\Controllers\KnowledgeArticleController::class, 'publish'])->middleware('permission:publish-knowledge-articles')->name('legal-research.knowledge.publish');
        });

        // Legal Precedent routes
        Route::middleware('permission:manage-legal-precedents')->group(function () {
            Route::get('nghien-cuu-phap-ly/tien-le', [\App\Http\Controllers\LegalPrecedentController::class, 'index'])->name('legal-research.precedents.index');
            Route::redirect('legal-research/precedents', 'nghien-cuu-phap-ly/tien-le');
            Route::post('legal-research/precedents', [\App\Http\Controllers\LegalPrecedentController::class, 'store'])->middleware('permission:create-legal-precedents')->name('legal-research.precedents.store');
            Route::put('legal-research/precedents/{precedent}', [\App\Http\Controllers\LegalPrecedentController::class, 'update'])->middleware('permission:edit-legal-precedents')->name('legal-research.precedents.update');
            Route::delete('legal-research/precedents/{precedent}', [\App\Http\Controllers\LegalPrecedentController::class, 'destroy'])->middleware('permission:delete-legal-precedents')->name('legal-research.precedents.destroy');
            Route::put('legal-research/precedents/{precedent}/toggle-status', [\App\Http\Controllers\LegalPrecedentController::class, 'toggleStatus'])->middleware('permission:toggle-status-legal-precedents')->name('legal-research.precedents.toggle-status');
        });

        // Research Note routes
        Route::middleware('permission:manage-research-notes')->group(function () {
            Route::get('nghien-cuu-phap-ly/ghi-chu', [\App\Http\Controllers\ResearchNoteController::class, 'index'])->name('legal-research.notes.index');
            Route::redirect('legal-research/notes', 'nghien-cuu-phap-ly/ghi-chu');
            Route::post('legal-research/notes', [\App\Http\Controllers\ResearchNoteController::class, 'store'])->middleware('permission:create-research-notes')->name('legal-research.notes.store');
            Route::put('legal-research/notes/{note}', [\App\Http\Controllers\ResearchNoteController::class, 'update'])->middleware('permission:edit-research-notes')->name('legal-research.notes.update');
            Route::delete('legal-research/notes/{note}', [\App\Http\Controllers\ResearchNoteController::class, 'destroy'])->middleware('permission:delete-research-notes')->name('legal-research.notes.destroy');
        });

        // Research Citation routes
        Route::middleware('permission:manage-research-citations')->group(function () {
            Route::get('nghien-cuu-phap-ly/trich-dan', [\App\Http\Controllers\ResearchCitationController::class, 'index'])->name('legal-research.citations.index');
            Route::redirect('legal-research/citations', 'nghien-cuu-phap-ly/trich-dan');
            Route::post('legal-research/citations', [\App\Http\Controllers\ResearchCitationController::class, 'store'])->middleware('permission:create-research-citations')->name('legal-research.citations.store');
            Route::put('legal-research/citations/{citation}', [\App\Http\Controllers\ResearchCitationController::class, 'update'])->middleware('permission:edit-research-citations')->name('legal-research.citations.update');
            Route::delete('legal-research/citations/{citation}', [\App\Http\Controllers\ResearchCitationController::class, 'destroy'])->middleware('permission:delete-research-citations')->name('legal-research.citations.destroy');
        });

        // Research Type routes
        Route::middleware('permission:manage-research-types')->group(function () {
            Route::get('nghien-cuu-phap-ly/loai-nghien-cuu', [\App\Http\Controllers\ResearchTypeController::class, 'index'])->name('legal-research.research-types.index');
            Route::redirect('legal-research/research-types', 'nghien-cuu-phap-ly/loai-nghien-cuu');
            Route::post('legal-research/research-types', [\App\Http\Controllers\ResearchTypeController::class, 'store'])->middleware('permission:create-research-types')->name('legal-research.research-types.store');
            Route::put('legal-research/research-types/{researchType}', [\App\Http\Controllers\ResearchTypeController::class, 'update'])->middleware('permission:edit-research-types')->name('legal-research.research-types.update');
            Route::delete('legal-research/research-types/{researchType}', [\App\Http\Controllers\ResearchTypeController::class, 'destroy'])->middleware('permission:delete-research-types')->name('legal-research.research-types.destroy');
            Route::put('legal-research/research-types/{researchType}/toggle-status', [\App\Http\Controllers\ResearchTypeController::class, 'toggleStatus'])->middleware('permission:toggle-status-research-types')->name('legal-research.research-types.toggle-status');
        });

        // Event Type routes
        Route::middleware('permission:manage-event-types')->group(function () {
            Route::get('loai-su-kien', [\App\Http\Controllers\EventTypeController::class, 'index'])->name('advocate.event-types.index');
            Route::redirect('event/event-types', 'loai-su-kien');
            Route::post('event/event-types', [\App\Http\Controllers\EventTypeController::class, 'store'])->middleware('permission:create-event-types')->name('advocate.event-types.store');
            Route::put('event/event-types/{eventType}', [\App\Http\Controllers\EventTypeController::class, 'update'])->middleware('permission:edit-event-types')->name('advocate.event-types.update');
            Route::delete('event/event-types/{eventType}', [\App\Http\Controllers\EventTypeController::class, 'destroy'])->middleware('permission:delete-event-types')->name('advocate.event-types.destroy');
            Route::put('event/event-types/{eventType}/toggle-status', [\App\Http\Controllers\EventTypeController::class, 'toggleStatus'])->middleware('permission:toggle-status-event-types')->name('advocate.event-types.toggle-status');
        });

        // Court Type routes
        Route::middleware('permission:manage-court-types')->group(function () {
            Route::get('toa-an/loai-toa-an', [\App\Http\Controllers\CourtTypeController::class, 'index'])->name('advocate.court-types.index');
            Route::redirect('court/court-types', 'toa-an/loai-toa-an');
            Route::post('court/court-types', [\App\Http\Controllers\CourtTypeController::class, 'store'])->middleware('permission:create-court-types')->name('advocate.court-types.store');
            Route::put('court/court-types/{courtType}', [\App\Http\Controllers\CourtTypeController::class, 'update'])->middleware('permission:edit-court-types')->name('advocate.court-types.update');
            Route::delete('court/court-types/{courtType}', [\App\Http\Controllers\CourtTypeController::class, 'destroy'])->middleware('permission:delete-court-types')->name('advocate.court-types.destroy');
            Route::put('court/court-types/{courtType}/toggle-status', [\App\Http\Controllers\CourtTypeController::class, 'toggleStatus'])->middleware('permission:toggle-status-court-types')->name('advocate.court-types.toggle-status');
        });

        // Hearing routes
        Route::middleware('permission:manage-hearings')->group(function () {
            Route::get('phien-toa', [\App\Http\Controllers\HearingController::class, 'index'])->name('hearings.index');
            Route::get('hearings', function () {
                return redirect()->route('hearings.index');
            });
            Route::post('hearings', [\App\Http\Controllers\HearingController::class, 'store'])->middleware('permission:create-hearings')->name('hearings.store');
            Route::put('hearings/{hearing}', [\App\Http\Controllers\HearingController::class, 'update'])->middleware('permission:edit-hearings')->name('hearings.update');
            Route::delete('hearings/{hearing}', [\App\Http\Controllers\HearingController::class, 'destroy'])->middleware('permission:delete-hearings')->name('hearings.destroy');
            Route::get('api/hearings/court-judges/{court}', [\App\Http\Controllers\HearingController::class, 'getCourtJudges'])->name('api.hearings.court-judges');
        });

        // Calendar route
        Route::get('lich-lam-viec', [\App\Http\Controllers\CalendarController::class, 'index'])->name('calendar.index');
        Route::get('calendar', function () {
            return redirect()->route('calendar.index');
        });

        // Google Calendar API routes
        Route::get('api/google-calendar/events', [\App\Http\Controllers\GoogleCalendarController::class, 'getEvents'])->name('google-calendar.events');
        Route::post('api/google-calendar/sync', [\App\Http\Controllers\GoogleCalendarController::class, 'syncEvents'])->name('google-calendar.sync');
        Route::get('google-calendar/auth', [\App\Http\Controllers\GoogleCalendarController::class, 'authorize'])->name('google-calendar.auth');
        Route::get('google-calendar/callback', [\App\Http\Controllers\GoogleCalendarController::class, 'callback'])->name('google-calendar.callback');

        // Court Management routes
        Route::middleware('permission:manage-courts')->group(function () {
            Route::get('toa-an', [\App\Http\Controllers\CourtController::class, 'index'])->name('courts.index');
            Route::get('courts', function () {
                return redirect()->route('courts.index');
            });
            Route::get('toa-an/{court}', [\App\Http\Controllers\CourtController::class, 'show'])->middleware('permission:view-courts')->name('courts.show');
            Route::post('courts', [\App\Http\Controllers\CourtController::class, 'store'])->middleware('permission:create-courts')->name('courts.store');
            Route::put('courts/{court}', [\App\Http\Controllers\CourtController::class, 'update'])->middleware('permission:edit-courts')->name('courts.update');
            Route::delete('courts/{court}', [\App\Http\Controllers\CourtController::class, 'destroy'])->middleware('permission:delete-courts')->name('courts.destroy');
            Route::put('courts/{court}/toggle-status', [\App\Http\Controllers\CourtController::class, 'toggleStatus'])->middleware('permission:toggle-status-courts')->name('courts.toggle-status');
            Route::get('courts/{court}', fn ($court) => redirect()->route('courts.show', $court));
        });

        // Judge Management routes
        Route::middleware('permission:manage-judges')->group(function () {
            Route::get('tham-phan', [\App\Http\Controllers\JudgeController::class, 'index'])->name('judges.index');
            Route::get('judges', function () {
                return redirect()->route('judges.index');
            });
            Route::get('tham-phan/{judge}', [\App\Http\Controllers\JudgeController::class, 'show'])->middleware('permission:view-judges')->name('judges.show');
            Route::post('judges', [\App\Http\Controllers\JudgeController::class, 'store'])->middleware('permission:create-judges')->name('judges.store');
            Route::put('judges/{judge}', [\App\Http\Controllers\JudgeController::class, 'update'])->middleware('permission:edit-judges')->name('judges.update');
            Route::delete('judges/{judge}', [\App\Http\Controllers\JudgeController::class, 'destroy'])->middleware('permission:delete-judges')->name('judges.destroy');
            Route::put('judges/{judge}/toggle-status', [\App\Http\Controllers\JudgeController::class, 'toggleStatus'])->middleware('permission:toggle-status-judges')->name('judges.toggle-status');
            Route::get('judges/{judge}', fn ($judge) => redirect()->route('judges.show', $judge));
        });

        // Hearing Type Management routes
        Route::middleware('permission:manage-hearing-types')->group(function () {
            Route::get('loai-phien-toa', [\App\Http\Controllers\HearingTypeController::class, 'index'])->name('hearing-types.index');
            Route::redirect('hearing-types', 'loai-phien-toa');
            Route::get('loai-phien-toa/{hearingType}', [\App\Http\Controllers\HearingTypeController::class, 'show'])->middleware('permission:view-hearing-types')->name('hearing-types.show');
            Route::post('hearing-types', [\App\Http\Controllers\HearingTypeController::class, 'store'])->middleware('permission:create-hearing-types')->name('hearing-types.store');
            Route::put('hearing-types/{hearingType}', [\App\Http\Controllers\HearingTypeController::class, 'update'])->middleware('permission:edit-hearing-types')->name('hearing-types.update');
            Route::delete('hearing-types/{hearingType}', [\App\Http\Controllers\HearingTypeController::class, 'destroy'])->middleware('permission:delete-hearing-types')->name('hearing-types.destroy');
            Route::put('hearing-types/{hearingType}/toggle-status', [\App\Http\Controllers\HearingTypeController::class, 'toggleStatus'])->middleware('permission:toggle-status-hearing-types')->name('hearing-types.toggle-status');
            Route::get('hearing-types/{hearingType}', fn ($hearingType) => redirect()->route('hearing-types.show', $hearingType));
        });

        // Company Settings in Settings page routes
        Route::middleware('permission:manage-company-settings')->group(function () {
            Route::post('settings/company', [\App\Http\Controllers\Settings\SettingsController::class, 'storeCompanySetting'])->name('settings.company.store');
            Route::put('settings/company/{id}', [\App\Http\Controllers\Settings\SettingsController::class, 'updateCompanySetting'])->name('settings.company.update');
            Route::delete('settings/company/{id}', [\App\Http\Controllers\Settings\SettingsController::class, 'destroyCompanySetting'])->name('settings.company.destroy');
        });

        // Case Management routes
        Route::middleware('permission:manage-cases')->group(function () {
            Route::get('vu-viec', [\App\Http\Controllers\CaseController::class, 'index'])->name('cases.index');
            Route::get('cases', function () {
                return redirect()->route('cases.index');
            });
            Route::get('vu-viec/{case}', [\App\Http\Controllers\CaseController::class, 'show'])->middleware('permission:view-cases')->name('cases.show');
            Route::post('cases', [\App\Http\Controllers\CaseController::class, 'store'])->middleware('permission:create-cases')->name('cases.store');
            Route::put('cases/{case}', [\App\Http\Controllers\CaseController::class, 'update'])->middleware('permission:edit-cases')->name('cases.update');
            Route::delete('cases/{case}', [\App\Http\Controllers\CaseController::class, 'destroy'])->middleware('permission:delete-cases')->name('cases.destroy');
            Route::put('cases/{case}/toggle-status', [\App\Http\Controllers\CaseController::class, 'toggleStatus'])->middleware('permission:toggle-status-cases')->name('cases.toggle-status');
            Route::get('cases/{case}', fn ($case) => redirect()->route('cases.show', $case));
        });

        // Case Types routes
        Route::middleware('permission:manage-case-types')->group(function () {
            Route::get('vu-viec/loai-vu-viec', [\App\Http\Controllers\CaseTypeController::class, 'index'])->name('cases.case-types.index');
            Route::redirect('case/case-types', 'vu-viec/loai-vu-viec');
            Route::post('case/case-types', [\App\Http\Controllers\CaseTypeController::class, 'store'])->middleware('permission:create-case-types')->name('cases.case-types.store');
            Route::put('case/case-types/{caseType}', [\App\Http\Controllers\CaseTypeController::class, 'update'])->middleware('permission:edit-case-types')->name('cases.case-types.update');
            Route::delete('case/case-types/{caseType}', [\App\Http\Controllers\CaseTypeController::class, 'destroy'])->middleware('permission:delete-case-types')->name('cases.case-types.destroy');
            Route::put('case/case-types/{caseType}/toggle-status', [\App\Http\Controllers\CaseTypeController::class, 'toggleStatus'])->middleware('permission:toggle-status-case-types')->name('cases.case-types.toggle-status');
        });

        // Case Status routes
        Route::middleware('permission:manage-case-statuses')->group(function () {
            Route::get('vu-viec/trang-thai-vu-viec', [\App\Http\Controllers\CaseStatusController::class, 'index'])->name('cases.case-statuses.index');
            Route::redirect('case/case-statuses', 'vu-viec/trang-thai-vu-viec');
            Route::post('case/case-statuses', [\App\Http\Controllers\CaseStatusController::class, 'store'])->middleware('permission:create-case-statuses')->name('cases.case-statuses.store');
            Route::put('case/case-statuses/{caseStatus}', [\App\Http\Controllers\CaseStatusController::class, 'update'])->middleware('permission:edit-case-statuses')->name('cases.case-statuses.update');
            Route::delete('case/case-statuses/{caseStatus}', [\App\Http\Controllers\CaseStatusController::class, 'destroy'])->middleware('permission:delete-case-statuses')->name('cases.case-statuses.destroy');
            Route::put('case/case-statuses/{caseStatus}/toggle-status', [\App\Http\Controllers\CaseStatusController::class, 'toggleStatus'])->middleware('permission:toggle-status-case-statuses')->name('cases.case-statuses.toggle-status');
        });

        // Case Timelines routes
        Route::middleware('permission:manage-case-timelines')->group(function () {
            Route::get('vu-viec/lich-su', [\App\Http\Controllers\CaseTimelineController::class, 'index'])->name('cases.case-timelines.index');
            Route::redirect('cases/case-timelines', 'vu-viec/lich-su');
            Route::post('cases/case-timelines', [\App\Http\Controllers\CaseTimelineController::class, 'store'])->middleware('permission:create-case-timelines')->name('cases.case-timelines.store');
            Route::put('cases/case-timelines/{timeline}', [\App\Http\Controllers\CaseTimelineController::class, 'update'])->middleware('permission:edit-case-timelines')->name('cases.case-timelines.update');
            Route::delete('cases/case-timelines/{timeline}', [\App\Http\Controllers\CaseTimelineController::class, 'destroy'])->middleware('permission:delete-case-timelines')->name('cases.case-timelines.destroy');
            Route::put('cases/case-timelines/{timeline}/toggle-status', [\App\Http\Controllers\CaseTimelineController::class, 'toggleStatus'])->middleware('permission:toggle-status-case-timelines')->name('cases.case-timelines.toggle-status');
        });

        // Case Team Members routes
        Route::middleware('permission:manage-case-team-members')->group(function () {
            Route::get('vu-viec/thanh-vien-phu-trach', [\App\Http\Controllers\CaseTeamMemberController::class, 'index'])->name('cases.case-team-members.index');
            Route::redirect('cases/case-team-members', 'vu-viec/thanh-vien-phu-trach');
            Route::post('cases/case-team-members', [\App\Http\Controllers\CaseTeamMemberController::class, 'store'])->middleware('permission:create-case-team-members')->name('cases.case-team-members.store');
            Route::put('cases/case-team-members/{teamMember}', [\App\Http\Controllers\CaseTeamMemberController::class, 'update'])->middleware('permission:edit-case-team-members')->name('cases.case-team-members.update');
            Route::delete('cases/case-team-members/{teamMember}', [\App\Http\Controllers\CaseTeamMemberController::class, 'destroy'])->middleware('permission:delete-case-team-members')->name('cases.case-team-members.destroy');
            Route::put('cases/case-team-members/{teamMember}/toggle-status', [\App\Http\Controllers\CaseTeamMemberController::class, 'toggleStatus'])->middleware('permission:toggle-status-case-team-members')->name('cases.case-team-members.toggle-status');
        });

        // Plans management routes (admin only)
        Route::middleware('permission:manage-plans')->group(function () {
            Route::get('goi-dich-vu/tao', [PlanController::class, 'create'])->middleware('permission:create-plans')->name('plans.create');
            Route::post('plans', [PlanController::class, 'store'])->middleware('permission:create-plans')->name('plans.store');
            Route::get('goi-dich-vu/{plan}/chinh-sua', [PlanController::class, 'edit'])->middleware('permission:edit-plans')->name('plans.edit');
            Route::put('plans/{plan}', [PlanController::class, 'update'])->middleware('permission:edit-plans')->name('plans.update');
            Route::delete('plans/{plan}', [PlanController::class, 'destroy'])->middleware('permission:delete-plans')->name('plans.destroy');
            Route::post('plans/{plan}/toggle-status', [PlanController::class, 'toggleStatus'])->name('plans.toggle-status');
            Route::get('plans/create', fn () => redirect()->route('plans.create'));
            Route::get('plans/{plan}/edit', fn ($plan) => redirect()->route('plans.edit', $plan));
        });

        // Plan Orders routes
        Route::middleware('permission:manage-plan-orders')->group(function () {
            Route::get('don-hang-goi-dich-vu', [PlanOrderController::class, 'index'])->middleware('permission:manage-plan-orders')->name('plan-orders.index');
            Route::get('plan-orders', function () {
                return redirect()->route('plan-orders.index');
            });
            Route::post('plan-orders/{planOrder}/approve', [PlanOrderController::class, 'approve'])->middleware('permission:approve-plan-orders')->name('plan-orders.approve');
            Route::post('plan-orders/{planOrder}/reject', [PlanOrderController::class, 'reject'])->middleware('permission:reject-plan-orders')->name('plan-orders.reject');
        });

        // Plan Requests routes (placeholder)
        Route::get('yeu-cau-goi-dich-vu', function () {
            return Inertia::render('plans/plan-requests');
        })->name('plan-requests.index');
        Route::get('plan-requests', function () {
            return redirect()->route('plan-requests.index');
        });

        // Companies routes
        Route::middleware('permission:manage-companies')->group(function () {
            Route::get('cong-ty-thanh-vien', [CompanyController::class, 'index'])->middleware('permission:manage-companies')->name('companies.index');
            Route::get('companies', function () {
                return redirect()->route('companies.index');
            });
            Route::post('companies', [CompanyController::class, 'store'])->middleware('permission:create-companies')->name('companies.store');
            Route::put('companies/{company}', [CompanyController::class, 'update'])->middleware('permission:edit-companies')->name('companies.update');
            Route::delete('companies/{company}', [CompanyController::class, 'destroy'])->middleware('permission:delete-companies')->name('companies.destroy');
            Route::put('companies/{company}/reset-password', [CompanyController::class, 'resetPassword'])->middleware('permission:reset-password-companies')->name('companies.reset-password');
            Route::put('companies/{company}/toggle-status', [CompanyController::class, 'toggleStatus'])->middleware('permission:toggle-status-companies')->name('companies.toggle-status');
            Route::get('cong-ty-thanh-vien/{company}/goi-dich-vu', [CompanyController::class, 'getPlans'])->middleware('permission:manage-plans-companies')->name('companies.plans');
            Route::get('companies/{company}/plans', fn ($company) => redirect()->route('companies.plans', $company));
            Route::put('companies/{company}/upgrade-plan', [CompanyController::class, 'upgradePlan'])->middleware('permission:upgrade-plan-companies')->name('companies.upgrade-plan');
        });


        // Coupons routes
        Route::middleware('permission:manage-coupons')->group(function () {
            Route::get('ma-giam-gia', [CouponController::class, 'index'])->middleware('permission:manage-coupons')->name('coupons.index');
            Route::get('coupons', function () {
                return redirect()->route('coupons.index');
            });
            Route::get('coupons/{coupon}', [CouponController::class, 'show'])->middleware('permission:view-coupons')->name('coupons.show');
            Route::post('coupons', [CouponController::class, 'store'])->middleware('permission:create-coupons')->name('coupons.store');
            Route::put('coupons/{coupon}', [CouponController::class, 'update'])->middleware('permission:edit-coupons')->name('coupons.update');
            Route::put('coupons/{coupon}/toggle-status', [CouponController::class, 'toggleStatus'])->middleware('permission:toggle-status-coupons')->name('coupons.toggle-status');
            Route::delete('coupons/{coupon}', [CouponController::class, 'destroy'])->middleware('permission:delete-coupons')->name('coupons.destroy');
        });

        // Plan Requests routes
        Route::middleware('permission:manage-plan-requests')->group(function () {
            Route::get('plan-requests/all', [PlanRequestController::class, 'index'])->middleware('permission:manage-plan-requests')->name('plan-requests.all');
            Route::post('plan-requests/{planRequest}/approve', [PlanRequestController::class, 'approve'])->middleware('permission:approve-plan-requests')->name('plan-requests.approve');
            Route::post('plan-requests/{planRequest}/reject', [PlanRequestController::class, 'reject'])->middleware('permission:reject-plan-requests')->name('plan-requests.reject');
        });

        // Plan request cancel route (accessible to all authenticated users)
        Route::post('plan-requests/{planRequest}/cancel', [PlanRequestController::class, 'cancel'])->name('plan-requests.cancel');



        // Referral routes
        Route::middleware('permission:manage-referral')->group(function () {
            Route::get('chuong-trinh-gioi-thieu', [ReferralController::class, 'index'])->middleware('permission:manage-referral')->name('referral.index');
            Route::get('referral', function () {
                return redirect()->route('referral.index');
            });
            Route::get('referral/referred-users', [ReferralController::class, 'getReferredUsers'])->middleware('permission:manage-users-referral')->name('referral.referred-users');
            Route::post('referral/settings', [ReferralController::class, 'updateSettings'])->middleware('permission:manage-setting-referral')->name('referral.settings.update');
            Route::post('referral/payout-request', [ReferralController::class, 'createPayoutRequest'])->middleware('permission:manage-payout-referral')->name('referral.payout-request.create');
            Route::post('referral/payout-request/{payoutRequest}/approve', [ReferralController::class, 'approvePayoutRequest'])->middleware('permission:approve-payout-referral')->name('referral.payout-request.approve');
            Route::post('referral/payout-request/{payoutRequest}/reject', [ReferralController::class, 'rejectPayoutRequest'])->middleware('permission:reject-payout-referral')->name('referral.payout-request.reject');
        });

        // Contact Us routes
        Route::middleware('permission:manage-contact-us')->group(function () {
            Route::get('hop-thu-lien-he', [\App\Http\Controllers\ContactUsController::class, 'index'])->name('contact-us.index');
            Route::get('contact-us', function () {
                return redirect()->route('contact-us.index');
            });
            Route::get('contact-us/{contact}', [\App\Http\Controllers\ContactUsController::class, 'show'])->name('contact-us.show');
            Route::put('contact-us/{contact}/status', [\App\Http\Controllers\ContactUsController::class, 'updateStatus'])->name('contact-us.update-status');
            Route::delete('contact-us/{contact}', [\App\Http\Controllers\ContactUsController::class, 'destroy'])->name('contact-us.destroy');
        });

        // Newsletter routes
        Route::middleware('permission:manage-contact-us')->group(function () {
            Route::get('quan-ly-ban-tin', [\App\Http\Controllers\NewsletterController::class, 'index'])->name('newsletter.index');
            Route::get('newsletter', function () {
                return redirect()->route('newsletter.index');
            });
            Route::post('newsletter/send', [\App\Http\Controllers\NewsletterController::class, 'send'])->name('newsletter.send');
            Route::delete('newsletter/{subscription}', [\App\Http\Controllers\NewsletterController::class, 'destroy'])->name('newsletter.destroy');
        });



        // Currencies routes
        Route::middleware('permission:manage-currencies')->group(function () {
            Route::get('tien-te', [CurrencyController::class, 'index'])->middleware('permission:manage-currencies')->name('currencies.index');
            Route::get('currencies', function () {
                return redirect()->route('currencies.index');
            });
            Route::post('currencies', [CurrencyController::class, 'store'])->middleware('permission:create-currencies')->name('currencies.store');
            Route::put('currencies/{currency}', [CurrencyController::class, 'update'])->middleware('permission:edit-currencies')->name('currencies.update');
            Route::delete('currencies/{currency}', [CurrencyController::class, 'destroy'])->middleware('permission:delete-currencies')->name('currencies.destroy');
        });

        // ChatGPT routes
        Route::post('api/chatgpt/generate', [\App\Http\Controllers\ChatGptController::class, 'generate'])->name('chatgpt.generate');

        // Compliance Requirements routes
        Route::middleware('permission:manage-compliance-requirements')->group(function () {
            Route::get('quan-ly-tuan-thu/yeu-cau', [\App\Http\Controllers\ComplianceRequirementController::class, 'index'])->name('compliance.requirements.index');
            Route::redirect('compliance/requirements', 'quan-ly-tuan-thu/yeu-cau');
            Route::post('compliance/requirements', [\App\Http\Controllers\ComplianceRequirementController::class, 'store'])->middleware('permission:create-compliance-requirements')->name('compliance.requirements.store');
            Route::put('compliance/requirements/{requirement}', [\App\Http\Controllers\ComplianceRequirementController::class, 'update'])->middleware('permission:edit-compliance-requirements')->name('compliance.requirements.update');
            Route::delete('compliance/requirements/{requirement}', [\App\Http\Controllers\ComplianceRequirementController::class, 'destroy'])->middleware('permission:delete-compliance-requirements')->name('compliance.requirements.destroy');
            Route::put('compliance/requirements/{requirement}/toggle-status', [\App\Http\Controllers\ComplianceRequirementController::class, 'toggleStatus'])->middleware('permission:toggle-status-compliance-requirements')->name('compliance.requirements.toggle-status');
        });

        // Compliance Categories routes
        Route::middleware('permission:manage-compliance-categories')->group(function () {
            Route::get('quan-ly-tuan-thu/danh-muc', [\App\Http\Controllers\ComplianceCategoryController::class, 'index'])->name('compliance.categories.index');
            Route::redirect('compliance/categories', 'quan-ly-tuan-thu/danh-muc');
            Route::post('compliance/categories', [\App\Http\Controllers\ComplianceCategoryController::class, 'store'])->middleware('permission:create-compliance-categories')->name('compliance.categories.store');
            Route::put('compliance/categories/{category}', [\App\Http\Controllers\ComplianceCategoryController::class, 'update'])->middleware('permission:edit-compliance-categories')->name('compliance.categories.update');
            Route::delete('compliance/categories/{category}', [\App\Http\Controllers\ComplianceCategoryController::class, 'destroy'])->middleware('permission:delete-compliance-categories')->name('compliance.categories.destroy');
            Route::put('compliance/categories/{category}/toggle-status', [\App\Http\Controllers\ComplianceCategoryController::class, 'toggleStatus'])->middleware('permission:toggle-status-compliance-categories')->name('compliance.categories.toggle-status');
        });

        // Compliance Frequencies routes
        Route::middleware('permission:manage-compliance-frequencies')->group(function () {
            Route::get('quan-ly-tuan-thu/tan-suat', [\App\Http\Controllers\ComplianceFrequencyController::class, 'index'])->name('compliance.frequencies.index');
            Route::redirect('compliance/frequencies', 'quan-ly-tuan-thu/tan-suat');
            Route::post('compliance/frequencies', [\App\Http\Controllers\ComplianceFrequencyController::class, 'store'])->middleware('permission:create-compliance-frequencies')->name('compliance.frequencies.store');
            Route::put('compliance/frequencies/{frequency}', [\App\Http\Controllers\ComplianceFrequencyController::class, 'update'])->middleware('permission:edit-compliance-frequencies')->name('compliance.frequencies.update');
            Route::delete('compliance/frequencies/{frequency}', [\App\Http\Controllers\ComplianceFrequencyController::class, 'destroy'])->middleware('permission:delete-compliance-frequencies')->name('compliance.frequencies.destroy');
            Route::put('compliance/frequencies/{frequency}/toggle-status', [\App\Http\Controllers\ComplianceFrequencyController::class, 'toggleStatus'])->middleware('permission:toggle-status-compliance-frequencies')->name('compliance.frequencies.toggle-status');
        });

        // Professional Licenses routes
        Route::middleware('permission:manage-professional-licenses')->group(function () {
            Route::get('quan-ly-tuan-thu/chung-chi-hanh-nghe', [\App\Http\Controllers\ProfessionalLicenseController::class, 'index'])->name('compliance.professional-licenses.index');
            Route::redirect('compliance/professional-licenses', 'quan-ly-tuan-thu/chung-chi-hanh-nghe');
            Route::post('compliance/professional-licenses', [\App\Http\Controllers\ProfessionalLicenseController::class, 'store'])->middleware('permission:create-professional-licenses')->name('compliance.professional-licenses.store');
            Route::put('compliance/professional-licenses/{license}', [\App\Http\Controllers\ProfessionalLicenseController::class, 'update'])->middleware('permission:edit-professional-licenses')->name('compliance.professional-licenses.update');
            Route::delete('compliance/professional-licenses/{license}', [\App\Http\Controllers\ProfessionalLicenseController::class, 'destroy'])->middleware('permission:delete-professional-licenses')->name('compliance.professional-licenses.destroy');
            Route::put('compliance/professional-licenses/{license}/toggle-status', [\App\Http\Controllers\ProfessionalLicenseController::class, 'toggleStatus'])->middleware('permission:toggle-status-professional-licenses')->name('compliance.professional-licenses.toggle-status');
        });

        // Regulatory Bodies routes
        Route::middleware('permission:manage-regulatory-bodies')->group(function () {
            Route::get('quan-ly-tuan-thu/co-quan-quan-ly', [\App\Http\Controllers\RegulatoryBodyController::class, 'index'])->name('compliance.regulatory-bodies.index');
            Route::redirect('compliance/regulatory-bodies', 'quan-ly-tuan-thu/co-quan-quan-ly');
            Route::post('compliance/regulatory-bodies', [\App\Http\Controllers\RegulatoryBodyController::class, 'store'])->middleware('permission:create-regulatory-bodies')->name('compliance.regulatory-bodies.store');
            Route::put('compliance/regulatory-bodies/{body}', [\App\Http\Controllers\RegulatoryBodyController::class, 'update'])->middleware('permission:edit-regulatory-bodies')->name('compliance.regulatory-bodies.update');
            Route::delete('compliance/regulatory-bodies/{body}', [\App\Http\Controllers\RegulatoryBodyController::class, 'destroy'])->middleware('permission:delete-regulatory-bodies')->name('compliance.regulatory-bodies.destroy');
            Route::put('compliance/regulatory-bodies/{body}/toggle-status', [\App\Http\Controllers\RegulatoryBodyController::class, 'toggleStatus'])->middleware('permission:toggle-status-regulatory-bodies')->name('compliance.regulatory-bodies.toggle-status');
        });

        // CLE Tracking routes
        Route::middleware('permission:manage-cle-tracking')->group(function () {
            Route::get('quan-ly-tuan-thu/theo-doi-boi-duong', [\App\Http\Controllers\CleTrackingController::class, 'index'])->name('compliance.cle-tracking.index');
            Route::redirect('compliance/cle-tracking', 'quan-ly-tuan-thu/theo-doi-boi-duong');
            Route::post('compliance/cle-tracking', [\App\Http\Controllers\CleTrackingController::class, 'store'])->middleware('permission:create-cle-tracking')->name('compliance.cle-tracking.store');
            Route::put('compliance/cle-tracking/{cleTracking}', [\App\Http\Controllers\CleTrackingController::class, 'update'])->middleware('permission:edit-cle-tracking')->name('compliance.cle-tracking.update');
            Route::delete('compliance/cle-tracking/{cleTracking}', [\App\Http\Controllers\CleTrackingController::class, 'destroy'])->middleware('permission:delete-cle-tracking')->name('compliance.cle-tracking.destroy');
            Route::get('quan-ly-tuan-thu/theo-doi-boi-duong/{cleTracking}/tai-xuong', [\App\Http\Controllers\CleTrackingController::class, 'download'])->middleware('permission:download-cle-tracking')->name('compliance.cle-tracking.download');
            Route::get('compliance/cle-tracking/{cleTracking}/download', fn ($cleTracking) => redirect()->route('compliance.cle-tracking.download', $cleTracking));
        });

        // Compliance Policies routes
        Route::middleware('permission:manage-compliance-policies')->group(function () {
            Route::get('quan-ly-tuan-thu/chinh-sach', [\App\Http\Controllers\CompliancePolicyController::class, 'index'])->name('compliance.policies.index');
            Route::get('quan-ly-tuan-thu/chinh-sach/tao', [\App\Http\Controllers\CompliancePolicyController::class, 'create'])->middleware('permission:create-compliance-policies')->name('compliance.policies.create');
            Route::post('compliance/policies', [\App\Http\Controllers\CompliancePolicyController::class, 'store'])->middleware('permission:create-compliance-policies')->name('compliance.policies.store');
            Route::get('quan-ly-tuan-thu/chinh-sach/{policy}', [\App\Http\Controllers\CompliancePolicyController::class, 'show'])->middleware('permission:view-compliance-policies')->name('compliance.policies.show');
            Route::get('quan-ly-tuan-thu/chinh-sach/{policy}/chinh-sua', [\App\Http\Controllers\CompliancePolicyController::class, 'edit'])->middleware('permission:edit-compliance-policies')->name('compliance.policies.edit');
            Route::redirect('compliance/policies', 'quan-ly-tuan-thu/chinh-sach');
            Route::get('compliance/policies/create', fn () => redirect()->route('compliance.policies.create'));
            Route::get('compliance/policies/{policy}/edit', fn ($policy) => redirect()->route('compliance.policies.edit', $policy));
            Route::get('compliance/policies/{policy}', fn ($policy) => redirect()->route('compliance.policies.show', $policy));
            Route::put('compliance/policies/{policy}', [\App\Http\Controllers\CompliancePolicyController::class, 'update'])->middleware('permission:edit-compliance-policies')->name('compliance.policies.update');
            Route::delete('compliance/policies/{policy}', [\App\Http\Controllers\CompliancePolicyController::class, 'destroy'])->middleware('permission:delete-compliance-policies')->name('compliance.policies.destroy');
            Route::put('compliance/policies/{policy}/toggle-status', [\App\Http\Controllers\CompliancePolicyController::class, 'toggleStatus'])->middleware('permission:toggle-status-compliance-policies')->name('compliance.policies.toggle-status');
        });

        // Risk Categories routes
        Route::middleware('permission:manage-risk-categories')->group(function () {
            Route::get('quan-ly-tuan-thu/danh-muc-rui-ro', [\App\Http\Controllers\RiskCategoryController::class, 'index'])->name('compliance.risk-categories.index');
            Route::redirect('compliance/risk-categories', 'quan-ly-tuan-thu/danh-muc-rui-ro');
            Route::post('compliance/risk-categories', [\App\Http\Controllers\RiskCategoryController::class, 'store'])->middleware('permission:create-risk-categories')->name('compliance.risk-categories.store');
            Route::put('compliance/risk-categories/{category}', [\App\Http\Controllers\RiskCategoryController::class, 'update'])->middleware('permission:edit-risk-categories')->name('compliance.risk-categories.update');
            Route::delete('compliance/risk-categories/{category}', [\App\Http\Controllers\RiskCategoryController::class, 'destroy'])->middleware('permission:delete-risk-categories')->name('compliance.risk-categories.destroy');
            Route::put('compliance/risk-categories/{category}/toggle-status', [\App\Http\Controllers\RiskCategoryController::class, 'toggleStatus'])->middleware('permission:toggle-status-risk-categories')->name('compliance.risk-categories.toggle-status');
        });

        // Risk Assessments routes
        Route::middleware('permission:manage-risk-assessments')->group(function () {
            Route::get('quan-ly-tuan-thu/danh-gia-rui-ro', [\App\Http\Controllers\RiskAssessmentController::class, 'index'])->name('compliance.risk-assessments.index');
            Route::redirect('compliance/risk-assessments', 'quan-ly-tuan-thu/danh-gia-rui-ro');
            Route::post('compliance/risk-assessments', [\App\Http\Controllers\RiskAssessmentController::class, 'store'])->middleware('permission:create-risk-assessments')->name('compliance.risk-assessments.store');
            Route::put('compliance/risk-assessments/{riskAssessment}', [\App\Http\Controllers\RiskAssessmentController::class, 'update'])->middleware('permission:edit-risk-assessments')->name('compliance.risk-assessments.update');
            Route::delete('compliance/risk-assessments/{riskAssessment}', [\App\Http\Controllers\RiskAssessmentController::class, 'destroy'])->middleware('permission:delete-risk-assessments')->name('compliance.risk-assessments.destroy');
        });

        // Audit Types routes
        Route::middleware('permission:manage-audit-types')->group(function () {
            Route::get('quan-ly-tuan-thu/loai-kiem-toan', [\App\Http\Controllers\AuditTypeController::class, 'index'])->name('compliance.audit-types.index');
            Route::redirect('compliance/audit-types', 'quan-ly-tuan-thu/loai-kiem-toan');
            Route::post('compliance/audit-types', [\App\Http\Controllers\AuditTypeController::class, 'store'])->middleware('permission:create-audit-types')->name('compliance.audit-types.store');
            Route::put('compliance/audit-types/{auditType}', [\App\Http\Controllers\AuditTypeController::class, 'update'])->middleware('permission:edit-audit-types')->name('compliance.audit-types.update');
            Route::delete('compliance/audit-types/{auditType}', [\App\Http\Controllers\AuditTypeController::class, 'destroy'])->middleware('permission:delete-audit-types')->name('compliance.audit-types.destroy');
            Route::put('compliance/audit-types/{auditType}/toggle-status', [\App\Http\Controllers\AuditTypeController::class, 'toggleStatus'])->middleware('permission:toggle-status-audit-types')->name('compliance.audit-types.toggle-status');
        });

        // Compliance Audits routes
        Route::middleware('permission:manage-compliance-audits')->group(function () {
            Route::get('quan-ly-tuan-thu/kiem-toan', [\App\Http\Controllers\ComplianceAuditController::class, 'index'])->name('compliance.audits.index');
            Route::redirect('compliance/audits', 'quan-ly-tuan-thu/kiem-toan');
            Route::post('compliance/audits', [\App\Http\Controllers\ComplianceAuditController::class, 'store'])->middleware('permission:create-compliance-audits')->name('compliance.audits.store');
            Route::put('compliance/audits/{audit}', [\App\Http\Controllers\ComplianceAuditController::class, 'update'])->middleware('permission:edit-compliance-audits')->name('compliance.audits.update');
            Route::delete('compliance/audits/{audit}', [\App\Http\Controllers\ComplianceAuditController::class, 'destroy'])->middleware('permission:delete-compliance-audits')->name('compliance.audits.destroy');
        });

        // Time Entry routes
        Route::middleware('permission:manage-time-entries')->group(function () {
            Route::get('api/time-entries/case-users/{case}', [\App\Http\Controllers\TimeEntryController::class, 'getCaseUsers'])->name('api.time-entries.case-users');
            Route::get('cham-cong', [\App\Http\Controllers\TimeEntryController::class, 'weeklyView'])->name('billing.time-entries.index');
            Route::get('billing/cham-cong', function () {
                return redirect()->route('billing.time-entries.index');
            });
            Route::get('billing/time-entries', function () {
                return redirect()->route('billing.time-entries.index');
            });
            Route::post('billing/time-entries', [\App\Http\Controllers\TimeEntryController::class, 'store'])->middleware('permission:create-time-entries')->name('billing.time-entries.store');
            Route::put('billing/time-entries/{timeEntry}', [\App\Http\Controllers\TimeEntryController::class, 'update'])->middleware('permission:edit-time-entries')->name('billing.time-entries.update');
            Route::delete('billing/time-entries/{timeEntry}', [\App\Http\Controllers\TimeEntryController::class, 'destroy'])->middleware('permission:delete-time-entries')->name('billing.time-entries.destroy');
            Route::put('billing/time-entries/{timeEntry}/approve', [\App\Http\Controllers\TimeEntryController::class, 'approve'])->middleware('permission:approve-time-entries')->name('billing.time-entries.approve');
            // Route::post('billing/time-entries/start-timer', [\App\Http\Controllers\TimeEntryController::class, 'startTimer'])->middleware('permission:start-timer')->name('billing.time-entries.start-timer');
            // Route::put('billing/time-entries/{timeEntry}/stop-timer', [\App\Http\Controllers\TimeEntryController::class, 'stopTimer'])->middleware('permission:stop-timer')->name('billing.time-entries.stop-timer');
        });

        // Billing Rate routes
        Route::middleware('permission:manage-billing-rates')->group(function () {
            Route::get('billing/billing-rates', [\App\Http\Controllers\BillingRateController::class, 'index'])->name('billing.billing-rates.index');
            Route::post('billing/billing-rates', [\App\Http\Controllers\BillingRateController::class, 'store'])->middleware('permission:create-billing-rates')->name('billing.billing-rates.store');
            Route::put('billing/billing-rates/{billingRate}', [\App\Http\Controllers\BillingRateController::class, 'update'])->middleware('permission:edit-billing-rates')->name('billing.billing-rates.update');
            Route::delete('billing/billing-rates/{billingRate}', [\App\Http\Controllers\BillingRateController::class, 'destroy'])->middleware('permission:delete-billing-rates')->name('billing.billing-rates.destroy');
            Route::put('billing/billing-rates/{billingRate}/toggle-status', [\App\Http\Controllers\BillingRateController::class, 'toggleStatus'])->middleware('permission:toggle-status-billing-rates')->name('billing.billing-rates.toggle-status');
        });

        // Fee Type routes
        Route::middleware('permission:manage-fee-types')->group(function () {
            Route::get('billing/fee-types', [\App\Http\Controllers\FeeTypeController::class, 'index'])->name('billing.fee-types.index');
            Route::post('billing/fee-types', [\App\Http\Controllers\FeeTypeController::class, 'store'])->middleware('permission:create-fee-types')->name('billing.fee-types.store');
            Route::put('billing/fee-types/{feeType}', [\App\Http\Controllers\FeeTypeController::class, 'update'])->middleware('permission:edit-fee-types')->name('billing.fee-types.update');
            Route::delete('billing/fee-types/{feeType}', [\App\Http\Controllers\FeeTypeController::class, 'destroy'])->middleware('permission:delete-fee-types')->name('billing.fee-types.destroy');
            Route::put('billing/fee-types/{feeType}/toggle-status', [\App\Http\Controllers\FeeTypeController::class, 'toggleStatus'])->middleware('permission:toggle-status-fee-types')->name('billing.fee-types.toggle-status');
        });

        // Fee Structure routes
        Route::middleware('permission:manage-fee-structures')->group(function () {
            Route::get('billing/fee-structures', [\App\Http\Controllers\FeeStructureController::class, 'index'])->name('billing.fee-structures.index');
            Route::post('billing/fee-structures', [\App\Http\Controllers\FeeStructureController::class, 'store'])->middleware('permission:create-fee-structures')->name('billing.fee-structures.store');
            Route::put('billing/fee-structures/{feeStructure}', [\App\Http\Controllers\FeeStructureController::class, 'update'])->middleware('permission:edit-fee-structures')->name('billing.fee-structures.update');
            Route::delete('billing/fee-structures/{feeStructure}', [\App\Http\Controllers\FeeStructureController::class, 'destroy'])->middleware('permission:delete-fee-structures')->name('billing.fee-structures.destroy');
            Route::put('billing/fee-structures/{feeStructure}/toggle-status', [\App\Http\Controllers\FeeStructureController::class, 'toggleStatus'])->middleware('permission:toggle-status-fee-structures')->name('billing.fee-structures.toggle-status');
        });

        // Expense routes
        Route::middleware('permission:manage-expenses')->group(function () {
            Route::get('chi-phi', [\App\Http\Controllers\ExpenseController::class, 'index'])->name('billing.expenses.index');
            Route::get('billing/chi-phi', function () {
                return redirect()->route('billing.expenses.index');
            });
            Route::get('billing/expenses', function () {
                return redirect()->route('billing.expenses.index');
            });
            Route::post('billing/expenses', [\App\Http\Controllers\ExpenseController::class, 'store'])->middleware('permission:create-expenses')->name('billing.expenses.store');
            Route::put('billing/expenses/{expense}', [\App\Http\Controllers\ExpenseController::class, 'update'])->middleware('permission:edit-expenses')->name('billing.expenses.update');
            Route::delete('billing/expenses/{expense}', [\App\Http\Controllers\ExpenseController::class, 'destroy'])->middleware('permission:delete-expenses')->name('billing.expenses.destroy');
            Route::put('billing/expenses/{expense}/approve', [\App\Http\Controllers\ExpenseController::class, 'approve'])->middleware('permission:approve-expenses')->name('billing.expenses.approve');
            Route::put('billing/expenses/{expense}/reject', [\App\Http\Controllers\ExpenseController::class, 'reject'])->middleware('permission:approve-expenses')->name('billing.expenses.reject');
        });

        // Expense Category routes
        Route::middleware('permission:manage-expense-categories')->group(function () {
            Route::get('billing/expense-categories', [\App\Http\Controllers\ExpenseCategoryController::class, 'index'])->name('billing.expense-categories.index');
            Route::post('billing/expense-categories', [\App\Http\Controllers\ExpenseCategoryController::class, 'store'])->middleware('permission:create-expense-categories')->name('billing.expense-categories.store');
            Route::put('billing/expense-categories/{expenseCategory}', [\App\Http\Controllers\ExpenseCategoryController::class, 'update'])->middleware('permission:edit-expense-categories')->name('billing.expense-categories.update');
            Route::delete('billing/expense-categories/{expenseCategory}', [\App\Http\Controllers\ExpenseCategoryController::class, 'destroy'])->middleware('permission:delete-expense-categories')->name('billing.expense-categories.destroy');
            Route::put('billing/expense-categories/{expenseCategory}/toggle-status', [\App\Http\Controllers\ExpenseCategoryController::class, 'toggleStatus'])->middleware('permission:toggle-status-expense-categories')->name('billing.expense-categories.toggle-status');
        });

        // Invoice routes
        Route::middleware('permission:manage-invoices')->group(function () {
            Route::get('hoa-don', [\App\Http\Controllers\InvoiceController::class, 'index'])->name('billing.invoices.index');
            Route::get('billing/hoa-don', function () {
                return redirect()->route('billing.invoices.index');
            });
            Route::get('billing/invoices', function () {
                return redirect()->route('billing.invoices.index');
            });
            Route::get('billing/invoices/create', [\App\Http\Controllers\InvoiceController::class, 'create'])->middleware('permission:create-invoices')->name('billing.invoices.create');
            Route::get('billing/invoices/{invoice}', [\App\Http\Controllers\InvoiceController::class, 'show'])->middleware('permission:view-invoices')->name('billing.invoices.show');
            Route::get('billing/invoices/{invoice}/edit', [\App\Http\Controllers\InvoiceController::class, 'edit'])->middleware('permission:edit-invoices')->name('billing.invoices.edit');
            Route::get('billing/invoices/{invoice}/generate', [\App\Http\Controllers\InvoiceController::class, 'generate'])->middleware('permission:view-invoices')->name('billing.invoices.generate');
            Route::get('billing/invoices/{invoice}/print', [\App\Http\Controllers\InvoiceController::class, 'print'])->middleware('permission:view-invoices')->name('billing.invoices.print');
            Route::post('billing/invoices', [\App\Http\Controllers\InvoiceController::class, 'store'])->middleware('permission:create-invoices')->name('billing.invoices.store');
            Route::put('billing/invoices/{invoice}', [\App\Http\Controllers\InvoiceController::class, 'update'])->middleware('permission:edit-invoices')->name('billing.invoices.update');
            Route::delete('billing/invoices/{invoice}', [\App\Http\Controllers\InvoiceController::class, 'destroy'])->middleware('permission:delete-invoices')->name('billing.invoices.destroy');
            Route::put('billing/invoices/{invoice}/send', [\App\Http\Controllers\InvoiceController::class, 'send'])->middleware('permission:send-invoices')->name('billing.invoices.send');
            Route::post('billing/invoices/generate-from-time-and-expenses', [\App\Http\Controllers\InvoiceController::class, 'generateFromTimeAndExpenses'])->middleware('permission:create-invoices')->name('billing.invoices.generate-from-time-and-expenses');
        });

        // Payment routes
        Route::middleware('permission:manage-payments')->group(function () {
            Route::post('billing/payments/{payment}/approve', [\App\Http\Controllers\PaymentController::class, 'approvePayment'])->name('billing.payments.approve');
            Route::post('billing/payments/{payment}/reject', [\App\Http\Controllers\PaymentController::class, 'rejectPayment'])->name('billing.payments.reject');
            Route::get('thanh-toan', [\App\Http\Controllers\PaymentController::class, 'index'])->name('billing.payments.index');
            Route::get('billing/thanh-toan', function () {
                return redirect()->route('billing.payments.index');
            });
            Route::get('billing/payments', function () {
                return redirect()->route('billing.payments.index');
            });
            Route::post('billing/payments', [\App\Http\Controllers\PaymentController::class, 'store'])->middleware('permission:create-payments')->name('billing.payments.store');
            Route::put('billing/payments/{payment}', [\App\Http\Controllers\PaymentController::class, 'update'])->middleware('permission:edit-payments')->name('billing.payments.update');
            Route::delete('billing/payments/{payment}', [\App\Http\Controllers\PaymentController::class, 'destroy'])->middleware('permission:delete-payments')->name('billing.payments.destroy');
        });

        // Task Management routes
        Route::middleware('permission:manage-tasks')->group(function () {
            Route::get('cong-viec', [\App\Http\Controllers\TaskController::class, 'index'])->name('tasks.index');
            Route::get('tasks', function () {
                return redirect()->route('tasks.index');
            });
            Route::get('tasks/{task}', [\App\Http\Controllers\TaskController::class, 'show'])->middleware('permission:view-tasks')->name('tasks.show');
            Route::post('tasks', [\App\Http\Controllers\TaskController::class, 'store'])->middleware('permission:create-tasks')->name('tasks.store');
            Route::put('tasks/{task}', [\App\Http\Controllers\TaskController::class, 'update'])->middleware('permission:edit-tasks')->name('tasks.update');
            Route::delete('tasks/{task}', [\App\Http\Controllers\TaskController::class, 'destroy'])->middleware('permission:delete-tasks')->name('tasks.destroy');
            Route::put('tasks/{task}/toggle-status', [\App\Http\Controllers\TaskController::class, 'toggleStatus'])->middleware('permission:toggle-status-tasks')->name('tasks.toggle-status');
            Route::get('api/tasks/case-users/{case}', [\App\Http\Controllers\TaskController::class, 'getCaseUsers'])->name('api.tasks.case-users');
            Route::get('api/clients/{client}/cases', [\App\Http\Controllers\InvoiceController::class, 'getClientCases'])->name('api.clients.cases');
            Route::get('api/cases/{case}/time-entries', [\App\Http\Controllers\InvoiceController::class, 'getCaseTimeEntries'])->name('api.cases.time-entries');
            Route::get('api/clients/{client}/time-entries', [\App\Http\Controllers\InvoiceController::class, 'getClientTimeEntries'])->name('api.clients.time-entries');
        });

        // Task Type routes
        Route::middleware('permission:manage-task-types')->group(function () {
            Route::get('cong-viec/loai-cong-viec', [\App\Http\Controllers\TaskTypeController::class, 'index'])->name('tasks.task-types.index');
            Route::redirect('task/task-types', 'cong-viec/loai-cong-viec');
            Route::post('task/task-types', [\App\Http\Controllers\TaskTypeController::class, 'store'])->middleware('permission:create-task-types')->name('tasks.task-types.store');
            Route::put('task/task-types/{taskType}', [\App\Http\Controllers\TaskTypeController::class, 'update'])->middleware('permission:edit-task-types')->name('tasks.task-types.update');
            Route::delete('task/task-types/{taskType}', [\App\Http\Controllers\TaskTypeController::class, 'destroy'])->middleware('permission:delete-task-types')->name('tasks.task-types.destroy');
            Route::put('task/task-types/{taskType}/toggle-status', [\App\Http\Controllers\TaskTypeController::class, 'toggleStatus'])->middleware('permission:toggle-status-task-types')->name('tasks.task-types.toggle-status');
        });

        // Task Status routes
        Route::middleware('permission:manage-task-statuses')->group(function () {
            Route::get('cong-viec/trang-thai', [\App\Http\Controllers\TaskStatusController::class, 'index'])->name('tasks.task-statuses.index');
            Route::redirect('task/task-statuses', 'cong-viec/trang-thai');
            Route::post('task/task-statuses', [\App\Http\Controllers\TaskStatusController::class, 'store'])->middleware('permission:create-task-statuses')->name('tasks.task-statuses.store');
            Route::put('task/task-statuses/{taskStatus}', [\App\Http\Controllers\TaskStatusController::class, 'update'])->middleware('permission:edit-task-statuses')->name('tasks.task-statuses.update');
            Route::delete('task/task-statuses/{taskStatus}', [\App\Http\Controllers\TaskStatusController::class, 'destroy'])->middleware('permission:delete-task-statuses')->name('tasks.task-statuses.destroy');
            Route::put('task/task-statuses/{taskStatus}/toggle-status', [\App\Http\Controllers\TaskStatusController::class, 'toggleStatus'])->middleware('permission:toggle-status-task-statuses')->name('tasks.task-statuses.toggle-status');
        });

        // Workflow routes
        Route::middleware('permission:manage-workflows')->group(function () {
            Route::get('cong-viec/quy-trinh', [\App\Http\Controllers\WorkflowController::class, 'index'])->name('tasks.workflows.index');
            Route::redirect('task/workflows', 'cong-viec/quy-trinh');
            Route::post('task/workflows', [\App\Http\Controllers\WorkflowController::class, 'store'])->middleware('permission:create-workflows')->name('tasks.workflows.store');
            Route::put('task/workflows/{workflow}', [\App\Http\Controllers\WorkflowController::class, 'update'])->middleware('permission:edit-workflows')->name('tasks.workflows.update');
            Route::delete('task/workflows/{workflow}', [\App\Http\Controllers\WorkflowController::class, 'destroy'])->middleware('permission:delete-workflows')->name('tasks.workflows.destroy');
            Route::put('task/workflows/{workflow}/toggle-status', [\App\Http\Controllers\WorkflowController::class, 'toggleStatus'])->middleware('permission:toggle-status-workflows')->name('tasks.workflows.toggle-status');
        });







        // Task Comment routes
        Route::middleware('permission:manage-task-comments')->group(function () {
            Route::get('task/task-comments', [\App\Http\Controllers\TaskCommentController::class, 'index'])->name('tasks.task-comments.index');
            Route::post('task/task-comments', [\App\Http\Controllers\TaskCommentController::class, 'store'])->middleware('permission:create-task-comments')->name('tasks.task-comments.store');
            Route::put('task/task-comments/{taskComment}', [\App\Http\Controllers\TaskCommentController::class, 'update'])->middleware('permission:edit-task-comments')->name('tasks.task-comments.update');
            Route::delete('task/task-comments/{taskComment}', [\App\Http\Controllers\TaskCommentController::class, 'destroy'])->middleware('permission:delete-task-comments')->name('tasks.task-comments.destroy');
        });

        // Communication & Collaboration Routes
        Route::prefix('communication')->name('communication.')->group(function () {
            // Messages
            Route::middleware('permission:manage-messages')->group(function () {
                Route::get('/tin-nhan', [\App\Http\Controllers\MessageController::class, 'index'])->name('messages.index');
                Route::get('/messages', function () {
                    return redirect()->route('communication.messages.index');
                });
                Route::post('/messages/{conversation}/mark-read', [\App\Http\Controllers\MessageController::class, 'markRead'])->name('messages.markRead');
                Route::get('/messages/start/{user}', [\App\Http\Controllers\MessageController::class, 'startConversation'])->name('messages.start');
                Route::get('/messages/{conversation}', [\App\Http\Controllers\MessageController::class, 'show'])->middleware('permission:view-messages')->name('messages.show');
                Route::post('/messages', [\App\Http\Controllers\MessageController::class, 'store'])->middleware('permission:send-messages')->name('messages.store');
                Route::delete('/messages/{conversation}', [\App\Http\Controllers\MessageController::class, 'destroy'])->middleware('permission:delete-messages')->name('messages.destroy');

                // API endpoints for polling
                Route::get('/api/unread-count', [\App\Http\Controllers\MessageController::class, 'getUnreadCount'])->name('messages.unread-count');
                Route::get('/api/recent-messages', [\App\Http\Controllers\MessageController::class, 'getRecentMessages'])->name('messages.recent');
                Route::get('/messages/user/{user}', [\App\Http\Controllers\MessageController::class, 'getUserDetails'])->name('messages.getUserDetails');
            });
        });

        // Language management
        Route::get('manage-language/{lang?}', [LanguageController::class, 'managePage'])->middleware('permission:manage-language')->name('manage-language');
        Route::get('language/load', [LanguageController::class, 'load'])->name('language.load');
        Route::match(['POST', 'PATCH'], 'language/save', [LanguageController::class, 'save'])->middleware('permission:edit-language')->name('language.save');
        Route::post('language/create', [LanguageController::class, 'createLanguage'])->middleware('permission:manage-language')->name('language.create');
        Route::delete('languages/{languageCode}', [LanguageController::class, 'deleteLanguage'])->middleware('permission:manage-language')->name('languages.delete');
        Route::patch('languages/{languageCode}/toggle', [LanguageController::class, 'toggleLanguageStatus'])->middleware('permission:manage-language')->name('languages.toggle');
        Route::post('languages/change', [LanguageController::class, 'changeLanguage'])->name('languages.change');

        // Landing Page content management (Super Admin only)
        Route::middleware('App\Http\Middleware\SuperAdminMiddleware')->group(function () {
            // Email Templates
            Route::get('mau-email', [\App\Http\Controllers\EmailTemplateController::class, 'index'])->name('email-templates.index');
            Route::get('email-templates', function () {
                return redirect()->route('email-templates.index');
            });
            Route::get('mau-email/{emailTemplate}', [\App\Http\Controllers\EmailTemplateController::class, 'show'])->name('email-templates.show');
            Route::put('mau-email/{emailTemplate}/settings', [\App\Http\Controllers\EmailTemplateController::class, 'updateSettings'])->name('email-templates.update-settings');
            Route::put('mau-email/{emailTemplate}/content', [\App\Http\Controllers\EmailTemplateController::class, 'updateContent'])->name('email-templates.update-content');

            Route::get('cai-dat-trang-chu', [LandingPageController::class, 'settings'])->name('landing-page');
            Route::get('chinh-sua-giao-dien-trang-chu', [LandingPageController::class, 'appearanceSettings'])->name('landing-page.appearance');
            Route::get('landing-page', function () {
                return redirect()->route('landing-page');
            });
            Route::post('landing-page/settings', [LandingPageController::class, 'updateSettings'])->name('landing-page.settings.update');

            Route::resource('quan-ly-trang', CustomPageController::class)->names('landing-page.custom-pages');
            Route::get('custom-pages', function () {
                return redirect()->route('landing-page.custom-pages.index');
            });

            // Cookie consent download (Super Admin only)
            Route::get('/cookie-consent/download', [\App\Http\Controllers\CookieConsentController::class, 'download'])->name('cookie.consent.download');
        });
        // Impersonation routes
        Route::middleware('App\Http\Middleware\SuperAdminMiddleware')->group(function () {
            Route::get('impersonate/{userId}', [ImpersonateController::class, 'start'])->name('impersonate.start');
        });
    }); // End plan.access middleware group
    Route::post('impersonate/leave', [ImpersonateController::class, 'leave'])->name('impersonate.leave');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';

Route::match(['GET', 'POST'], 'payments/easebuzz/success', [EasebuzzPaymentController::class, 'success'])->name('easebuzz.success');
Route::post('payments/easebuzz/callback', [EasebuzzPaymentController::class, 'callback'])->name('easebuzz.callback');
Route::match(['GET', 'POST'], 'easebuzz/invoice/success', [EasebuzzPaymentController::class, 'invoiceSuccess'])->name('easebuzz.invoice.success');

// Payment gateway invoice success/callback routes (public - no auth required)
Route::match(['GET', 'POST'], 'mollie/invoice/success/{token}', [MolliePaymentController::class, 'invoiceSuccess'])->name('mollie.invoice.success');
Route::post('mollie/invoice/callback', [MolliePaymentController::class, 'invoiceCallback'])->name('mollie.invoice.callback');
Route::match(['GET', 'POST'], 'tap/invoice/success/{token}', [TapPaymentController::class, 'invoiceSuccess'])->name('tap.invoice.success');
Route::post('tap/invoice/callback', [TapPaymentController::class, 'invoiceCallback'])->name('tap.invoice.callback');
Route::match(['GET', 'POST'], 'payhere/invoice/success/{token}', [PayHerePaymentController::class, 'invoiceSuccess'])->name('payhere.invoice.success');
Route::post('payhere/invoice/notify', [PayHerePaymentController::class, 'invoiceNotify'])->name('payhere.invoice.notify');

Route::post('payhere/invoice/callback', [PayHerePaymentController::class, 'invoiceCallback'])->name('payhere.invoice.callback');
Route::match(['GET', 'POST'], 'cinetpay/invoice/success', [CinetPayPaymentController::class, 'invoiceSuccess'])->name('cinetpay.invoice.success');
Route::post('cinetpay/invoice/callback', [CinetPayPaymentController::class, 'invoiceCallback'])->name('cinetpay.invoice.callback');
Route::match(['GET', 'POST'], 'fedapay/invoice/callback', [FedaPayPaymentController::class, 'invoiceCallback'])->name('fedapay.invoice.callback');
Route::match(['GET', 'POST'], 'paytabs/invoice/success', [PayTabsPaymentController::class, 'invoiceSuccess'])->name('paytabs.invoice.success');
Route::post('paytabs/invoice/callback', [PayTabsPaymentController::class, 'invoiceCallback'])->name('paytabs.invoice.callback');
Route::match(['GET', 'POST'], 'paiement/invoice/success', [PaiementPaymentController::class, 'invoiceSuccess'])
    ->withoutMiddleware([\App\Http\Middleware\VerifyCsrfToken::class])
    ->name('paiement.invoice.success');
Route::post('paiement/invoice/callback', [PaiementPaymentController::class, 'invoiceCallback'])
    ->withoutMiddleware([\App\Http\Middleware\VerifyCsrfToken::class])
    ->name('paiement.invoice.callback');
Route::get('cashfree/invoice/success/{token}', [CashfreeController::class, 'invoiceSuccess'])->name('cashfree.invoice.success.token');
Route::post('cashfree/invoice/callback', [CashfreeController::class, 'invoiceCallback'])->name('cashfree.invoice.callback');
Route::match(['GET', 'POST'], 'skrill/invoice/success', [SkrillPaymentController::class, 'invoiceSuccess'])->name('skrill.invoice.success');
Route::post('skrill/invoice/callback', [SkrillPaymentController::class, 'invoiceCallback'])->name('skrill.invoice.callback');
Route::match(['GET', 'POST'], 'yookassa/invoice/success', [YooKassaPaymentController::class, 'invoiceSuccess'])->name('yookassa.invoice.success');
Route::post('yookassa/invoice/callback', [YooKassaPaymentController::class, 'invoiceCallback'])->name('yookassa.invoice.callback');
Route::match(['GET', 'POST'], 'midtrans/invoice/success', [MidtransPaymentController::class, 'invoiceSuccess'])->name('midtrans.invoice.success');
Route::post('midtrans/invoice/callback', [MidtransPaymentController::class, 'invoiceCallback'])->name('midtrans.invoice.callback');
// Move Aamarpay invoice success to CSRF-exempt group



Route::match(['GET', 'POST'], 'payfast/invoice/success', [PayfastPaymentController::class, 'invoiceSuccess'])->name('payfast.invoice.success');
Route::post('payfast/invoice/callback', [PayfastPaymentController::class, 'invoiceCallback'])->name('payfast.invoice.callback');
Route::match(['GET', 'POST'], 'xendit/invoice/success/{token}', [XenditPaymentController::class, 'invoiceSuccess'])->name('xendit.invoice.success');
Route::match(['GET', 'POST'], 'paytr/invoice/success', [PayTRPaymentController::class, 'invoiceSuccess'])->name('paytr.invoice.success');
Route::match(['GET', 'POST'], 'toyyibpay/invoice/success', [ToyyibPayPaymentController::class, 'invoiceSuccess'])->name('toyyibpay.invoice.success');
Route::post('toyyibpay/invoice/callback', [ToyyibPayPaymentController::class, 'invoiceCallback'])->name('toyyibpay.invoice.callback');
Route::match(['GET', 'POST'], 'benefit/invoice/success', [BenefitPaymentController::class, 'invoiceSuccess'])->name('benefit.invoice.success');
Route::post('benefit/invoice/callback', [BenefitPaymentController::class, 'invoiceCallback'])->name('benefit.invoice.callback');
Route::match(['GET', 'POST'], 'ozow/invoice/success', [OzowPaymentController::class, 'invoiceSuccess'])->name('ozow.invoice.success');
Route::post('ozow/invoice/callback', [OzowPaymentController::class, 'invoiceCallback'])->name('ozow.invoice.callback');
