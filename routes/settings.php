<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\EmailSettingController;
use App\Http\Controllers\Settings\SettingsController;
use App\Http\Controllers\Settings\SystemSettingsController;
use App\Http\Controllers\Settings\CurrencySettingController;
use App\Http\Controllers\PlanOrderController;
use App\Http\Controllers\Settings\PaymentSettingController;
use App\Http\Controllers\Settings\WebhookController;
use App\Http\Controllers\Settings\EmailNotificationController;
use App\Http\Controllers\NotificationTemplateController;
use App\Http\Controllers\StripePaymentController;
use App\Http\Controllers\PayPalPaymentController;
use App\Http\Controllers\BankPaymentController;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Settings Routes
|--------------------------------------------------------------------------
|
| Here are the routes for settings management
|
*/

// Payment routes accessible without plan check
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/payment-methods', [PaymentSettingController::class, 'getPaymentMethods'])->name('payment.methods');
    Route::get('/enabled-payment-methods', [PaymentSettingController::class, 'getEnabledMethods'])->name('payment.enabled-methods');
    Route::post('/plan-orders', [PlanOrderController::class, 'create'])->name('plan-orders.create');
    Route::post('/stripe-payment', [StripePaymentController::class, 'processPayment'])->name('settings.stripe.payment');
});

Route::middleware(['auth', 'verified', 'plan.access'])->group(function () {
    // Payment Settings (admin only)
    Route::post('/payment-settings', [PaymentSettingController::class, 'store'])->middleware('permission:manage-payment-settings')->name('payment.settings');

    // Profile settings page with profile and password sections
    Route::get('ho-so-ca-nhan', function () {
        return Inertia::render('settings/profile-settings');
    })->name('profile');
    Route::get('profile', function () {
        return redirect()->route('profile');
    });

    // Routes for form submissions
    Route::patch('profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::post('profile', [ProfileController::class, 'update']); // For file uploads with method spoofing
    Route::delete('profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::put('profile/password', [PasswordController::class, 'update'])->name('password.update');

    // Email settings page
    Route::get('cai-dat/email', function () {
        return Inertia::render('settings/components/email-settings');
    })->middleware('permission:manage-email-settings')->name('settings.email');
    Route::get('settings/email', function () {
        return redirect()->route('settings.email');
    });

    // Email settings routes
    Route::get('settings/email/get', [EmailSettingController::class, 'getEmailSettings'])->middleware('permission:manage-email-settings')->name('settings.email.get');
    Route::post('settings/email/update', [EmailSettingController::class, 'updateEmailSettings'])->middleware('permission:manage-email-settings')->name('settings.email.update');
    Route::post('settings/email/test', [EmailSettingController::class, 'sendTestEmail'])->middleware('permission:manage-email-settings')->name('settings.email.test');

    // General settings page with system and company settings
    Route::get('cai-dat', [SettingsController::class, 'index'])->middleware('permission:manage-system-settings')->name('settings');
    Route::get('settings', function () {
        return redirect()->route('settings');
    });
    Route::get('api/settings', [SettingsController::class, 'getSettings'])->name('settings.api');
    Route::post('settings/layout-direction', [SettingsController::class, 'updateLayoutDirection'])->name('settings.layout-direction.update');

    // System Settings routes
    Route::post('settings/system', [SystemSettingsController::class, 'update'])->middleware('permission:manage-system-settings')->name('settings.system.update');
    Route::post('settings/brand', [SystemSettingsController::class, 'updateBrand'])->middleware('permission:manage-brand-settings')->name('settings.brand.update');
    Route::post('settings/storage', [SystemSettingsController::class, 'updateStorage'])->middleware('permission:manage-storage-settings')->name('settings.storage.update');
    Route::post('settings/recaptcha', [SystemSettingsController::class, 'updateRecaptcha'])->middleware('permission:manage-recaptcha-settings')->name('settings.recaptcha.update');
    Route::post('settings/chatgpt', [SystemSettingsController::class, 'updateChatgpt'])->middleware('permission:manage-chatgpt-settings')->name('settings.chatgpt.update');
    Route::post('settings/cookie', [SystemSettingsController::class, 'updateCookie'])->middleware('permission:manage-cookie-settings')->name('settings.cookie.update');
    Route::post('settings/seo', [SystemSettingsController::class, 'updateSeo'])->middleware('permission:manage-seo-settings')->name('settings.seo.update');
    Route::post('settings/cache/clear', [SystemSettingsController::class, 'clearCache'])->middleware('permission:manage-cache-settings')->name('settings.cache.clear');

    // Currency Settings routes
    Route::post('settings/currency', [CurrencySettingController::class, 'update'])->middleware('permission:manage-currency-settings')->name('settings.currency.update');

    // Webhook Settings routes
    Route::get('settings/webhooks', [WebhookController::class, 'index'])->middleware('permission:manage-webhook-settings')->name('settings.webhooks.index');
    Route::post('settings/webhooks', [WebhookController::class, 'store'])->middleware('permission:manage-webhook-settings')->name('settings.webhooks.store');
    Route::put('settings/webhooks/{webhook}', [WebhookController::class, 'update'])->middleware('permission:manage-webhook-settings')->name('settings.webhooks.update');
    Route::delete('settings/webhooks/{webhook}', [WebhookController::class, 'destroy'])->middleware('permission:manage-webhook-settings')->name('settings.webhooks.destroy');

    // Google Calendar Settings routes
    Route::post('settings/google-calendar', [SystemSettingsController::class, 'updateGoogleCalendar'])->middleware('permission:manage-google-calendar-settings')->name('settings.google-calendar.update');
    Route::post('settings/google-calendar/sync', [SystemSettingsController::class, 'syncGoogleCalendar'])->middleware('permission:manage-google-calendar-settings')->name('settings.google-calendar.sync');

    // Google Wallet Settings routes
    Route::post('settings/google-wallet', [SystemSettingsController::class, 'updateGoogleWallet'])->middleware('permission:manage-system-settings')->name('settings.google-wallet.update');

    // Email Notification Settings routes
    Route::get('settings/email-notifications/get', [EmailNotificationController::class, 'getNotificationSettings'])->middleware('permission:manage-email-notifications')->name('settings.email-notifications.get');
    Route::post('settings/email-notifications/update', [EmailNotificationController::class, 'updateNotificationSettings'])->middleware('permission:manage-email-notifications')->name('settings.email-notifications.update');

    // Slack Settings routes
    // Route::get('settings/slack/get', [SlackSettingController::class, 'getSlackSettings'])->name('slack.settings.get');
    // Route::post('settings/slack/update', [SlackSettingController::class, 'updateSlackSettings'])->name('slack.settings.update');
    // Route::post('settings/slack/test-webhook', [SlackSettingController::class, 'testSlackWebhook'])->name('slack.test-webhook');
    Route::get('settings/slack-notifications/available', [SystemSettingsController::class, 'getAvailableSlackNotifications'])->middleware('permission:manage-slack-notifications')->name('settings.slack-notifications.available');
    Route::get('settings/slack-notifications', [SystemSettingsController::class, 'getSlackNotifications'])->middleware('permission:manage-slack-notifications')->name('settings.slack-notifications.get');
    Route::get('settings/slack-config', [SystemSettingsController::class, 'getSlackConfig'])->middleware('permission:manage-slack-notifications')->name('settings.slack-config.get');
    Route::post('settings/slack-notifications', [SystemSettingsController::class, 'updateSlackNotifications'])->middleware('permission:manage-slack-notifications')->name('settings.slack-notifications.update');

    // Twilio Settings routes
    Route::get('settings/twilio-notifications/available', [SystemSettingsController::class, 'getAvailableTwilioNotifications'])->middleware('permission:manage-twilio-notifications')->name('settings.twilio-notifications.available');
    Route::get('settings/twilio-notifications', [SystemSettingsController::class, 'getTwilioNotifications'])->middleware('permission:manage-twilio-notifications')->name('settings.twilio-notifications.get');
    Route::get('settings/twilio-config', [SystemSettingsController::class, 'getTwilioConfig'])->middleware('permission:manage-twilio-notifications')->name('settings.twilio-config.get');
    Route::post('settings/twilio-notifications', [SystemSettingsController::class, 'updateTwilioNotifications'])->middleware('permission:manage-twilio-notifications')->name('settings.twilio-notifications.update');
    Route::post('settings/sms/test', [SystemSettingsController::class, 'testTwilioSMS'])->middleware('permission:manage-twilio-notifications')->name('settings.sms.test');
    Route::post('settings/slack/test', [SystemSettingsController::class, 'testSlackWebhook'])->middleware('permission:manage-slack-notifications')->name('settings.slack.test');

    // Notification Template routes
    Route::get('mau-thong-bao', [NotificationTemplateController::class, 'index'])->name('notification-templates.index');
    Route::get('notification-templates', function () {
        return redirect()->route('notification-templates.index');
    });
    Route::get('mau-thong-bao/{notificationTemplate}', [NotificationTemplateController::class, 'show'])->name('notification-templates.show');
    Route::match(['POST', 'PUT'], 'mau-thong-bao/{notificationTemplate}/settings', [NotificationTemplateController::class, 'updateSettings'])->name('notification-templates.update-settings');
    Route::match(['POST', 'PUT'], 'mau-thong-bao/{notificationTemplate}/content', [NotificationTemplateController::class, 'updateContent'])->name('notification-templates.update-content');
});
