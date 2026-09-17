<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\PaymentSetting;
use App\Services\SepayClient;
use App\Services\SepayTransferContentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PaymentSettingController extends Controller
{
    public function index()
    {
        $paymentSettings = getPaymentSettings();

        return Inertia::render('settings/index', [
            'paymentSettings' => $paymentSettings,
        ]);
    }

    public function getPaymentMethods()
    {
        $superAdminId = \App\Models\User::where('type', 'superadmin')->first()?->id;

        if (!$superAdminId) {
            return response()->json([]);
        }

        $paymentSettings = getPaymentSettings($superAdminId);

        // Filter out sensitive credentials and only return safe configuration
        $safeSettings = $this->filterSensitiveData($paymentSettings);

        // Add default currency to payment settings
        $settings = settings($superAdminId);
        $safeSettings['defaultCurrency'] = $settings['defaultCurrency'] ?? 'usd';

        return response()->json($safeSettings);
    }
    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'stripe_key' => 'nullable|string',
                'stripe_secret' => 'nullable|string',
                'paypal_client_id' => 'nullable|string',
                'paypal_secret_key' => 'nullable|string',
                'paypal_mode' => 'in:sandbox,live',
                'bank_detail' => 'nullable|string',
                'sepay_bank_code' => 'nullable|string',
                'sepay_account_number' => 'nullable|string',
                'sepay_account_name' => 'nullable|string',
                'sepay_api_key' => 'nullable|string|max:500',
                'sepay_payment_prefix' => 'nullable|string|max:30',
                'sepay_bank_account_id' => 'nullable|string|max:100',
                'sepay_sub_account_id' => 'nullable|string|max:100',
                'sepay_gateway_name' => 'nullable|string|max:100',
                'sepay_payment_note' => 'nullable|string|max:500',
                'razorpay_key' => 'nullable|string',
                'razorpay_secret' => 'nullable|string',
                'mercadopago_mode' => 'in:sandbox,live',
                'mercadopago_access_token' => 'nullable|string',
                'paystack_public_key' => 'nullable|string',
                'paystack_secret_key' => 'nullable|string',
                'flutterwave_public_key' => 'nullable|string',
                'flutterwave_secret_key' => 'nullable|string',
                'paytabs_profile_id' => 'nullable|string',
                'paytabs_server_key' => 'nullable|string',
                'paytabs_region' => 'nullable|string',
                'paytabs_mode' => 'in:sandbox,live',
                'skrill_merchant_id' => 'nullable|string',
                'skrill_secret_word' => 'nullable|string',
                'coingate_api_token' => 'nullable|string',
                'coingate_mode' => 'in:sandbox,live',
                'payfast_merchant_id' => 'nullable|string',
                'payfast_merchant_key' => 'nullable|string',
                'payfast_passphrase' => 'nullable|string',
                'payfast_mode' => 'in:sandbox,live',
                'tap_secret_key' => 'nullable|string',
                'xendit_api_key' => 'nullable|string',
                'paytr_merchant_id' => 'nullable|string',
                'paytr_merchant_key' => 'nullable|string',
                'paytr_merchant_salt' => 'nullable|string',
                'mollie_api_key' => 'nullable|string',
                'toyyibpay_category_code' => 'nullable|string',
                'toyyibpay_secret_key' => 'nullable|string',
                'benefit_mode' => 'in:sandbox,live',
                'benefit_secret_key' => 'nullable|string',
                'benefit_public_key' => 'nullable|string',
                'iyzipay_mode' => 'in:sandbox,live',
                'iyzipay_secret_key' => 'nullable|string',
                'iyzipay_public_key' => 'nullable|string',
                'aamarpay_store_id' => 'nullable|string',
                'aamarpay_signature' => 'nullable|string',
                'aamarpay_mode' => 'in:sandbox,live',
                'midtrans_mode' => 'in:sandbox,live',
                'midtrans_secret_key' => 'nullable|string',
                'yookassa_shop_id' => 'nullable|string',
                'yookassa_secret_key' => 'nullable|string',
                'nepalste_mode' => 'in:sandbox,live',
                'nepalste_secret_key' => 'nullable|string',
                'nepalste_public_key' => 'nullable|string',
                'paiement_merchant_id' => 'nullable|string',
                'cinetpay_site_id' => 'nullable|string',
                'cinetpay_api_key' => 'nullable|string',
                'cinetpay_secret_key' => 'nullable|string',
                'payhere_mode' => 'in:sandbox,live',
                'payhere_merchant_id' => 'nullable|string',
                'payhere_merchant_secret' => 'nullable|string',
                'payhere_app_id' => 'nullable|string',
                'payhere_app_secret' => 'nullable|string',
                'fedapay_mode' => 'in:sandbox,live',
                'fedapay_secret_key' => 'nullable|string',
                'fedapay_public_key' => 'nullable|string',
                'authorizenet_mode' => 'in:sandbox,live',
                'authorizenet_merchant_id' => 'nullable|string',
                'authorizenet_transaction_key' => 'nullable|string',
                'khalti_secret_key' => 'nullable|string',
                'khalti_public_key' => 'nullable|string',
                'easebuzz_merchant_key' => 'nullable|string',
                'easebuzz_salt_key' => 'nullable|string',
                'easebuzz_environment' => 'nullable|string',
                'ozow_mode' => 'in:sandbox,live',
                'ozow_site_key' => 'nullable|string',
                'ozow_private_key' => 'nullable|string',
                'ozow_api_key' => 'nullable|string',
                'cashfree_mode' => 'in:sandbox,live',
                'cashfree_secret_key' => 'nullable|string',
                'cashfree_public_key' => 'nullable|string',
            ]);

            $settingsUserId = getPaymentSettingsUserId() ?: auth()->id();
            $currentSettings = PaymentSetting::getUserSettings((int) $settingsUserId);
            $settings = $this->preparePaymentSettings($request, $validatedData);
            if (!$request->filled('sepay_api_key')) {
                unset($settings['sepay_api_key']);
            }

            $this->validateEnabledPaymentMethods($request, $validatedData);
            if ($request->boolean('is_sepay_enabled') && empty($validatedData['sepay_api_key'] ?? '') && empty($currentSettings['sepay_api_key'] ?? '')) {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'sepay_api_key' => [__('Please enter a SePay API key before enabling this payment method.')],
                ]);
            }
            if (
                $request->boolean('is_sepay_enabled')
                && (
                    empty($currentSettings['sepay_api_key'] ?? '')
                    || empty($currentSettings['sepay_connected_at'] ?? '')
                    || ($currentSettings['sepay_connection_status'] ?? '') !== 'connected'
                )
            ) {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'sepay' => [__('Please connect SePay successfully before enabling this payment method.')],
                ]);
            }
            if ($request->boolean('is_sepay_enabled') && empty($validatedData['sepay_bank_account_id'] ?? '') && empty($currentSettings['sepay_bank_account_id'] ?? '')) {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'sepay_bank_account_id' => [__('Please select a SePay receiving bank account before enabling this payment method.')],
                ]);
            }
            if ($request->filled('sepay_api_key') && $this->apiKeyBelongsToAnotherSettingsUser(trim((string) $validatedData['sepay_api_key']), (int) $settingsUserId)) {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'sepay_api_key' => [__('This SePay API key is already connected to another account. Please use a separate SePay API key for this account.')],
                ]);
            }
            $this->validateSepayOrderPrefix($validatedData['sepay_payment_prefix'] ?? null);

            $this->savePaymentSettings($settings, (int) $settingsUserId);
            $this->configureSepayAutomation($request);

            if (auth()?->user()?->type == 'superadmin') {
                \Cache::forget('admin_settings');
            }

            return back()->with('success', __('Payment settings saved successfully.'));
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->withErrors($e->errors());
        } catch (\Exception $e) {
            return back()->withErrors(['error' => __('Failed to save payment settings: :message', ['message' => $e->getMessage()])]);
        }
    }

    private function preparePaymentSettings(Request $request, array $validatedData): array
    {
        $value = fn (string $key, string $default = ''): string => (string) ($validatedData[$key] ?? $default);

        return [
            'is_manually_enabled' => $request->boolean('is_manually_enabled'),
            'is_bank_enabled' => $request->boolean('is_bank_enabled'),
            'is_sepay_enabled' => $request->boolean('is_sepay_enabled'),
            'is_stripe_enabled' => $request->boolean('is_stripe_enabled'),
            'is_paypal_enabled' => $request->boolean('is_paypal_enabled'),
            'is_razorpay_enabled' => $request->boolean('is_razorpay_enabled'),
            'is_mercadopago_enabled' => $request->boolean('is_mercadopago_enabled'),
            'is_paystack_enabled' => $request->boolean('is_paystack_enabled'),
            'is_flutterwave_enabled' => $request->boolean('is_flutterwave_enabled'),
            'is_paytabs_enabled' => $request->boolean('is_paytabs_enabled'),
            'is_skrill_enabled' => $request->boolean('is_skrill_enabled'),
            'is_coingate_enabled' => $request->boolean('is_coingate_enabled'),
            'is_payfast_enabled' => $request->boolean('is_payfast_enabled'),
            'is_tap_enabled' => $request->boolean('is_tap_enabled'),
            'is_xendit_enabled' => $request->boolean('is_xendit_enabled'),
            'is_paytr_enabled' => $request->boolean('is_paytr_enabled'),
            'is_mollie_enabled' => $request->boolean('is_mollie_enabled'),
            'is_toyyibpay_enabled' => $request->boolean('is_toyyibpay_enabled'),
            'is_benefit_enabled' => $request->boolean('is_benefit_enabled'),
            'is_iyzipay_enabled' => $request->boolean('is_iyzipay_enabled'),
            'is_aamarpay_enabled' => $request->boolean('is_aamarpay_enabled'),
            'is_midtrans_enabled' => $request->boolean('is_midtrans_enabled'),
            'is_yookassa_enabled' => $request->boolean('is_yookassa_enabled'),
            'is_nepalste_enabled' => $request->boolean('is_nepalste_enabled'),
            'is_paiement_enabled' => $request->boolean('is_paiement_enabled'),
            'is_cinetpay_enabled' => $request->boolean('is_cinetpay_enabled'),
            'is_payhere_enabled' => $request->boolean('is_payhere_enabled'),
            'is_fedapay_enabled' => $request->boolean('is_fedapay_enabled'),
            'is_authorizenet_enabled' => $request->boolean('is_authorizenet_enabled'),
            'is_khalti_enabled' => $request->boolean('is_khalti_enabled'),
            'is_easebuzz_enabled' => $request->boolean('is_easebuzz_enabled'),
            'is_ozow_enabled' => $request->boolean('is_ozow_enabled'),
            'is_cashfree_enabled' => $request->boolean('is_cashfree_enabled'),
            'paypal_mode' => $value('paypal_mode', 'sandbox'),
            'mercadopago_mode' => $value('mercadopago_mode', 'sandbox'),
            'bank_detail' => $value('bank_detail'),
            'sepay_bank_code' => $value('sepay_bank_code'),
            'sepay_account_number' => $value('sepay_account_number'),
            'sepay_account_name' => $value('sepay_account_name'),
            'sepay_api_key' => $value('sepay_api_key'),
            'sepay_payment_prefix' => $value('sepay_payment_prefix', config('sepay.default_order_prefix', 'HD')),
            'sepay_bank_account_id' => $value('sepay_bank_account_id'),
            'sepay_sub_account_id' => $value('sepay_sub_account_id'),
            'sepay_gateway_name' => $value('sepay_gateway_name', 'SePay'),
            'sepay_payment_note' => $value('sepay_payment_note'),
            'stripe_key' => $value('stripe_key'),
            'stripe_secret' => $value('stripe_secret'),
            'paypal_client_id' => $value('paypal_client_id'),
            'paypal_secret_key' => $value('paypal_secret_key'),
            'razorpay_key' => $value('razorpay_key'),
            'razorpay_secret' => $value('razorpay_secret'),
            'mercadopago_access_token' => $value('mercadopago_access_token'),
            'paystack_public_key' => $value('paystack_public_key'),
            'paystack_secret_key' => $value('paystack_secret_key'),
            'flutterwave_public_key' => $value('flutterwave_public_key'),
            'flutterwave_secret_key' => $value('flutterwave_secret_key'),
            'paytabs_profile_id' => $value('paytabs_profile_id'),
            'paytabs_server_key' => $value('paytabs_server_key'),
            'paytabs_region' => $value('paytabs_region'),
            'paytabs_mode' => $value('paytabs_mode', 'sandbox'),
            'skrill_merchant_id' => $value('skrill_merchant_id'),
            'skrill_secret_word' => $value('skrill_secret_word'),
            'coingate_api_token' => $value('coingate_api_token'),
            'coingate_mode' => $value('coingate_mode', 'sandbox'),
            'payfast_merchant_id' => $value('payfast_merchant_id'),
            'payfast_merchant_key' => $value('payfast_merchant_key'),
            'payfast_passphrase' => $value('payfast_passphrase'),
            'payfast_mode' => $value('payfast_mode', 'sandbox'),
            'tap_secret_key' => $value('tap_secret_key'),
            'xendit_api_key' => $value('xendit_api_key'),
            'paytr_merchant_id' => $value('paytr_merchant_id'),
            'paytr_merchant_key' => $value('paytr_merchant_key'),
            'paytr_merchant_salt' => $value('paytr_merchant_salt'),
            'mollie_api_key' => $value('mollie_api_key'),
            'toyyibpay_category_code' => $value('toyyibpay_category_code'),
            'toyyibpay_secret_key' => $value('toyyibpay_secret_key'),
            'benefit_mode' => $value('benefit_mode', 'sandbox'),
            'benefit_secret_key' => $value('benefit_secret_key'),
            'benefit_public_key' => $value('benefit_public_key'),
            'iyzipay_mode' => $value('iyzipay_mode', 'sandbox'),
            'iyzipay_secret_key' => $value('iyzipay_secret_key'),
            'iyzipay_public_key' => $value('iyzipay_public_key'),
            'aamarpay_store_id' => $value('aamarpay_store_id'),
            'aamarpay_signature' => $value('aamarpay_signature'),
            'aamarpay_mode' => $value('aamarpay_mode', 'sandbox'),
            'midtrans_mode' => $value('midtrans_mode', 'sandbox'),
            'midtrans_secret_key' => $value('midtrans_secret_key'),
            'yookassa_shop_id' => $value('yookassa_shop_id'),
            'yookassa_secret_key' => $value('yookassa_secret_key'),
            'nepalste_mode' => $value('nepalste_mode', 'sandbox'),
            'nepalste_secret_key' => $value('nepalste_secret_key'),
            'nepalste_public_key' => $value('nepalste_public_key'),
            'paiement_merchant_id' => $value('paiement_merchant_id'),
            'cinetpay_site_id' => $value('cinetpay_site_id'),
            'cinetpay_api_key' => $value('cinetpay_api_key'),
            'cinetpay_secret_key' => $value('cinetpay_secret_key'),
            'payhere_mode' => $value('payhere_mode', 'sandbox'),
            'payhere_merchant_id' => $value('payhere_merchant_id'),
            'payhere_merchant_secret' => $value('payhere_merchant_secret'),
            'payhere_app_id' => $value('payhere_app_id'),
            'payhere_app_secret' => $value('payhere_app_secret'),
            'fedapay_mode' => $value('fedapay_mode', 'sandbox'),
            'fedapay_secret_key' => $value('fedapay_secret_key'),
            'fedapay_public_key' => $value('fedapay_public_key'),
            'authorizenet_mode' => $value('authorizenet_mode', 'sandbox'),
            'authorizenet_merchant_id' => $value('authorizenet_merchant_id'),
            'authorizenet_transaction_key' => $value('authorizenet_transaction_key'),
            'khalti_secret_key' => $value('khalti_secret_key'),
            'khalti_public_key' => $value('khalti_public_key'),
            'easebuzz_merchant_key' => $value('easebuzz_merchant_key'),
            'easebuzz_salt_key' => $value('easebuzz_salt_key'),
            'easebuzz_environment' => $value('easebuzz_environment'),
            'ozow_mode' => $value('ozow_mode', 'sandbox'),
            'ozow_site_key' => $value('ozow_site_key'),
            'ozow_private_key' => $value('ozow_private_key'),
            'ozow_api_key' => $value('ozow_api_key'),
            'cashfree_mode' => $value('cashfree_mode', 'sandbox'),
            'cashfree_secret_key' => $value('cashfree_secret_key'),
            'cashfree_public_key' => $value('cashfree_public_key'),
        ];
    }

    private function validateEnabledPaymentMethods(Request $request, array $validatedData): void
    {
        $errors = [];
        $value = fn (string $key, ?string $default = ''): ?string => $validatedData[$key] ?? $default;

        if ($request->boolean('is_stripe_enabled')) {
            $config = ['key' => $value('stripe_key'), 'secret' => $value('stripe_secret')];
            $validation = validatePaymentMethodConfig('stripe', $config);
            if (!$validation['valid']) {
                $errors = array_merge($errors, $validation['errors']);
            }
        }

        if ($request->boolean('is_paypal_enabled')) {
            $config = ['client_id' => $value('paypal_client_id'), 'secret' => $value('paypal_secret_key')];
            $validation = validatePaymentMethodConfig('paypal', $config);
            if (!$validation['valid']) {
                $errors = array_merge($errors, $validation['errors']);
            }
        }

        if ($request->boolean('is_razorpay_enabled')) {
            $config = ['key' => $value('razorpay_key'), 'secret' => $value('razorpay_secret')];
            $validation = validatePaymentMethodConfig('razorpay', $config);
            if (!$validation['valid']) {
                $errors = array_merge($errors, $validation['errors']);
            }
        }

        if ($request->boolean('is_mercadopago_enabled')) {
            $config = ['access_token' => $value('mercadopago_access_token')];
            $validation = validatePaymentMethodConfig('mercadopago', $config);
            if (!$validation['valid']) {
                $errors = array_merge($errors, $validation['errors']);
            }
        }

        if ($request->boolean('is_paystack_enabled')) {
            $config = ['public_key' => $value('paystack_public_key'), 'secret_key' => $value('paystack_secret_key')];
            $validation = validatePaymentMethodConfig('paystack', $config);
            if (!$validation['valid']) {
                $errors = array_merge($errors, $validation['errors']);
            }
        }

        if ($request->boolean('is_flutterwave_enabled')) {
            $config = ['public_key' => $value('flutterwave_public_key'), 'secret_key' => $value('flutterwave_secret_key')];
            $validation = validatePaymentMethodConfig('flutterwave', $config);
            if (!$validation['valid']) {
                $errors = array_merge($errors, $validation['errors']);
            }
        }

        if ($request->boolean('is_bank_enabled')) {
            $config = ['details' => $value('bank_detail')];
            $validation = validatePaymentMethodConfig('bank', $config);
            if (!$validation['valid']) {
                $errors = array_merge($errors, $validation['errors']);
            }
        }

        if ($request->boolean('is_sepay_enabled')) {
            if (empty($value('sepay_bank_account_id'))) {
                $config = [
                    'bank_code' => $value('sepay_bank_code', null),
                    'account_number' => $value('sepay_account_number', null),
                    'account_name' => $value('sepay_account_name', null),
                ];
                $validation = validatePaymentMethodConfig('sepay', $config);
                if (!$validation['valid']) {
                    $errors = array_merge($errors, $validation['errors']);
                }
            }
        }

        if ($request->boolean('is_paytabs_enabled')) {
            $config = ['server_key' => $value('paytabs_server_key'), 'profile_id' => $value('paytabs_profile_id'), 'region' => $value('paytabs_region')];
            $validation = validatePaymentMethodConfig('paytabs', $config);
            if (!$validation['valid']) {
                $errors = array_merge($errors, $validation['errors']);
            }
        }

        if ($request->boolean('is_skrill_enabled')) {
            $config = ['merchant_id' => $value('skrill_merchant_id'), 'secret_word' => $value('skrill_secret_word')];
            $validation = validatePaymentMethodConfig('skrill', $config);
            if (!$validation['valid']) {
                $errors = array_merge($errors, $validation['errors']);
            }
        }

        if ($request->boolean('is_coingate_enabled')) {
            $config = ['api_token' => $value('coingate_api_token')];
            $validation = validatePaymentMethodConfig('coingate', $config);
            if (!$validation['valid']) {
                $errors = array_merge($errors, $validation['errors']);
            }
        }

        if ($request->boolean('is_payfast_enabled')) {
            $config = ['merchant_id' => $value('payfast_merchant_id'), 'merchant_key' => $value('payfast_merchant_key')];
            $validation = validatePaymentMethodConfig('payfast', $config);
            if (!$validation['valid']) {
                $errors = array_merge($errors, $validation['errors']);
            }
        }

        if ($request->boolean('is_tap_enabled')) {
            $config = ['secret_key' => $value('tap_secret_key')];
            $validation = validatePaymentMethodConfig('tap', $config);
            if (!$validation['valid']) {
                $errors = array_merge($errors, $validation['errors']);
            }
        }

        if ($request->boolean('is_xendit_enabled')) {
            $config = ['api_key' => $value('xendit_api_key')];
            $validation = validatePaymentMethodConfig('xendit', $config);
            if (!$validation['valid']) {
                $errors = array_merge($errors, $validation['errors']);
            }
        }

        if ($request->boolean('is_paytr_enabled')) {
            $config = ['merchant_id' => $value('paytr_merchant_id'), 'merchant_key' => $value('paytr_merchant_key'), 'merchant_salt' => $value('paytr_merchant_salt')];
            $validation = validatePaymentMethodConfig('paytr', $config);
            if (!$validation['valid']) {
                $errors = array_merge($errors, $validation['errors']);
            }
        }

        if ($request->boolean('is_mollie_enabled')) {
            $config = ['api_key' => $value('mollie_api_key')];
            $validation = validatePaymentMethodConfig('mollie', $config);
            if (!$validation['valid']) {
                $errors = array_merge($errors, $validation['errors']);
            }
        }

        if ($request->boolean('is_toyyibpay_enabled')) {
            $config = ['category_code' => $value('toyyibpay_category_code'), 'secret_key' => $value('toyyibpay_secret_key')];
            $validation = validatePaymentMethodConfig('toyyibpay', $config);
            if (!$validation['valid']) {
                $errors = array_merge($errors, $validation['errors']);
            }
        }

        if ($request->boolean('is_cashfree_enabled')) {
            $config = ['public_key' => $value('cashfree_public_key'), 'secret_key' => $value('cashfree_secret_key')];
            $validation = validatePaymentMethodConfig('cashfree', $config);
            if (!$validation['valid']) {
                $errors = array_merge($errors, $validation['errors']);
            }
        }

        if ($request->boolean('is_ozow_enabled')) {
            $config = ['site_key' => $value('ozow_site_key'), 'private_key' => $value('ozow_private_key')];
            $validation = validatePaymentMethodConfig('ozow', $config);
            if (!$validation['valid']) {
                $errors = array_merge($errors, $validation['errors']);
            }
        }

        if ($request->boolean('is_easebuzz_enabled')) {
            $config = ['merchant_key' => $value('easebuzz_merchant_key'), 'salt_key' => $value('easebuzz_salt_key')];
            $validation = validatePaymentMethodConfig('easebuzz', $config);
            if (!$validation['valid']) {
                $errors = array_merge($errors, $validation['errors']);
            }
        }

        if ($request->boolean('is_khalti_enabled')) {
            $config = ['public_key' => $value('khalti_public_key'), 'secret_key' => $value('khalti_secret_key')];
            $validation = validatePaymentMethodConfig('khalti', $config);
            if (!$validation['valid']) {
                $errors = array_merge($errors, $validation['errors']);
            }
        }

        if ($request->boolean('is_authorizenet_enabled')) {
            $config = ['merchant_id' => $value('authorizenet_merchant_id'), 'transaction_key' => $value('authorizenet_transaction_key')];
            $validation = validatePaymentMethodConfig('authorizenet', $config);
            if (!$validation['valid']) {
                $errors = array_merge($errors, $validation['errors']);
            }
        }

        if ($request->boolean('is_fedapay_enabled')) {
            $config = ['public_key' => $value('fedapay_public_key'), 'secret_key' => $value('fedapay_secret_key')];
            $validation = validatePaymentMethodConfig('fedapay', $config);
            if (!$validation['valid']) {
                $errors = array_merge($errors, $validation['errors']);
            }
        }

        if ($request->boolean('is_payhere_enabled')) {
            $config = ['merchant_id' => $value('payhere_merchant_id'), 'merchant_secret' => $value('payhere_merchant_secret')];
            $validation = validatePaymentMethodConfig('payhere', $config);
            if (!$validation['valid']) {
                $errors = array_merge($errors, $validation['errors']);
            }
        }

        if ($request->boolean('is_cinetpay_enabled')) {
            $config = ['site_id' => $value('cinetpay_site_id'), 'api_key' => $value('cinetpay_api_key')];
            $validation = validatePaymentMethodConfig('cinetpay', $config);
            if (!$validation['valid']) {
                $errors = array_merge($errors, $validation['errors']);
            }
        }

        if ($request->boolean('is_paiement_enabled')) {
            $config = ['merchant_id' => $value('paiement_merchant_id')];
            $validation = validatePaymentMethodConfig('paiement', $config);
            if (!$validation['valid']) {
                $errors = array_merge($errors, $validation['errors']);
            }
        }

        if ($request->boolean('is_nepalste_enabled')) {
            $config = ['public_key' => $value('nepalste_public_key'), 'secret_key' => $value('nepalste_secret_key')];
            $validation = validatePaymentMethodConfig('nepalste', $config);
            if (!$validation['valid']) {
                $errors = array_merge($errors, $validation['errors']);
            }
        }

        if ($request->boolean('is_yookassa_enabled')) {
            $config = ['shop_id' => $value('yookassa_shop_id'), 'secret_key' => $value('yookassa_secret_key')];
            $validation = validatePaymentMethodConfig('yookassa', $config);
            if (!$validation['valid']) {
                $errors = array_merge($errors, $validation['errors']);
            }
        }

        if ($request->boolean('is_midtrans_enabled')) {
            $config = ['secret_key' => $value('midtrans_secret_key')];
            $validation = validatePaymentMethodConfig('midtrans', $config);
            if (!$validation['valid']) {
                $errors = array_merge($errors, $validation['errors']);
            }
        }

        if ($request->boolean('is_aamarpay_enabled')) {
            $config = [
                'store_id' => $value('aamarpay_store_id'),
                'signature' => $value('aamarpay_signature'),
                'mode' => $value('aamarpay_mode', 'sandbox')
            ];
            $validation = validatePaymentMethodConfig('aamarpay', $config);
            if (!$validation['valid']) {
                $errors = array_merge($errors, $validation['errors']);
            }
        }

        if ($request->boolean('is_iyzipay_enabled')) {
            $config = ['public_key' => $value('iyzipay_public_key'), 'secret_key' => $value('iyzipay_secret_key')];
            $validation = validatePaymentMethodConfig('iyzipay', $config);
            if (!$validation['valid']) {
                $errors = array_merge($errors, $validation['errors']);
            }
        }

        if ($request->boolean('is_benefit_enabled')) {
            $config = ['public_key' => $value('benefit_public_key'), 'secret_key' => $value('benefit_secret_key')];
            $validation = validatePaymentMethodConfig('benefit', $config);
            if (!$validation['valid']) {
                $errors = array_merge($errors, $validation['errors']);
            }
        }

        if (!empty($errors)) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'payment_methods' => $errors
            ]);
        }
    }

    private function savePaymentSettings(array $settings, int $settingsUserId): void
    {
        foreach ($settings as $key => $value) {
            updatePaymentSetting($key, $value, $settingsUserId);
        }
        if (auth()?->user()?->type == 'superadmin') {
            \Cache::forget('admin_settings');
        }
    }

    private function configureSepayAutomation(Request $request): void
    {
        if (!$request->boolean('is_sepay_enabled') || !$request->filled('sepay_bank_account_id')) {
            return;
        }

        $settingsUserId = getPaymentSettingsUserId() ?: auth()->id();
        $settings = PaymentSetting::getUserSettings($settingsUserId);

        if (
            empty($settings['sepay_api_key'])
            || empty($settings['sepay_connected_at'])
            || ($settings['sepay_connection_status'] ?? '') !== 'connected'
        ) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'sepay' => [__('Please connect SePay with an API key before selecting a receiving bank account.')],
            ]);
        }

        $client = new SepayClient($settingsUserId);
        $bankAccountId = $request->string('sepay_bank_account_id')->toString();
        $bankAccount = $this->findStoredSepayBankAccount($settings, $bankAccountId);

        if (empty($bankAccount)) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'sepay_bank_account_id' => [__('Selected SePay bank account does not belong to this account. Please sync again.')],
            ]);
        }

        try {
            $freshBankAccount = $client->bankAccount($bankAccountId);
            if (!empty($freshBankAccount)) {
                $bankAccount = array_merge($bankAccount, $this->normalizeBankAccountForSettings($freshBankAccount));
            }
        } catch (\Throwable $e) {
            Log::warning('SePay bank account lookup failed while saving payment settings', [
                'settings_user_id' => $settingsUserId,
                'bank_account_id' => $bankAccountId,
                'message' => $e->getMessage(),
            ]);
        }

        $bankCode = $bankAccount['bank_code'] ?? '';
        $accountNumber = $bankAccount['account_number'] ?? '';
        $accountName = $bankAccount['account_name'] ?? '';

        if ($bankCode === '' || $accountNumber === '' || $accountName === '') {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'sepay_bank_account_id' => [__('Could not read selected SePay bank account information. Please reconnect SePay and try again.')],
            ]);
        }

        updatePaymentSetting('sepay_bank_code', $bankCode, $settingsUserId);
        updatePaymentSetting('sepay_bank_name', $bankAccount['bank_name'] ?? '', $settingsUserId);
        updatePaymentSetting('sepay_bank_brand_name', $bankAccount['brand_name'] ?? $bankAccount['bank_short_name'] ?? '', $settingsUserId);
        updatePaymentSetting('sepay_bank_bin', $bankAccount['bank_bin'] ?? '', $settingsUserId);
        updatePaymentSetting('sepay_account_number', $accountNumber, $settingsUserId);
        updatePaymentSetting('sepay_account_name', $accountName, $settingsUserId);
        updatePaymentSetting('sepay_account_type', $bankAccount['account_type'] ?? '', $settingsUserId);
        updatePaymentSetting('sepay_bank_account_metadata', json_encode($bankAccount['metadata'] ?? $bankAccount, JSON_UNESCAPED_UNICODE), $settingsUserId);
        updatePaymentSetting('sepay_bank_logo', $bankAccount['logo'] ?? $bankAccount['bank_logo'] ?? '', $settingsUserId);

        $subAccounts = $client->syncSelectedSubAccounts();
        $selectedSubAccountId = $request->string('sepay_sub_account_id')->toString();

        if ($selectedSubAccountId === '_none_') {
            $selectedSubAccountId = '';
        }

        if ($selectedSubAccountId !== '') {
            $selectedSubAccount = collect($subAccounts)->first(fn ($account) => (string) ($account['id'] ?? '') === $selectedSubAccountId);
            if (!$selectedSubAccount) {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'sepay_sub_account_id' => [__('Selected SePay VA/sub-account does not belong to this bank account. Please sync again.')],
                ]);
            }

            updatePaymentSetting('sepay_sub_account_id', $selectedSubAccount['id'], $settingsUserId);
            updatePaymentSetting('sepay_sub_account_number', $selectedSubAccount['account_number'], $settingsUserId);
            updatePaymentSetting('sepay_sub_account_name', $selectedSubAccount['account_holder_name'], $settingsUserId);
            updatePaymentSetting('sepay_sub_account_code', $selectedSubAccount['code'], $settingsUserId);
            updatePaymentSetting('sepay_sub_account_type', $selectedSubAccount['type'], $settingsUserId);
            updatePaymentSetting('sepay_sub_account_metadata', json_encode($selectedSubAccount['metadata'] ?? $selectedSubAccount, JSON_UNESCAPED_UNICODE), $settingsUserId);
        } else {
            foreach ([
                'sepay_sub_account_id',
                'sepay_sub_account_number',
                'sepay_sub_account_name',
                'sepay_sub_account_code',
                'sepay_sub_account_type',
                'sepay_sub_account_metadata',
            ] as $key) {
                updatePaymentSetting($key, '', $settingsUserId);
            }
        }

        $settings = PaymentSetting::getUserSettings($settingsUserId);
        $instruction = app(SepayTransferContentService::class)->instruction(
            $settings,
            app(SepayTransferContentService::class)->buildOrderCode('invoice', '123456', $settings['sepay_payment_prefix'] ?? null)
        );

        if (!$instruction['configuration_valid']) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'sepay' => [__('SePay receiving account configuration is incomplete. Please sync the account again.')],
            ]);
        }

        $apiKey = (string) ($settings['sepay_webhook_api_key'] ?? '');
        if ($apiKey === '') {
            $apiKey = bin2hex(random_bytes(24));
            updatePaymentSetting('sepay_webhook_api_key', $apiKey, $settingsUserId);
        }

        $payload = [
            'name' => 'Webhook - ' . config('app.name'),
            'bank_account_id' => $request->string('sepay_bank_account_id')->toString(),
            'event_type' => 'In_only',
            'authen_type' => 'Api_Key',
            'api_key' => $apiKey,
            'webhook_url' => url('/api/sepay/webhook'),
            'is_verify_payment' => 1,
            'skip_if_no_code' => 1,
            'request_content_type' => 'Json',
            'only_va' => 0,
        ];

        try {
            if (!empty($settings['sepay_webhook_id'])) {
                $webhook = $client->updateWebhook($settings['sepay_webhook_id'], $payload);
            } else {
                $webhook = $client->createWebhook($payload);
            }

            updatePaymentSetting('sepay_webhook_id', $webhook['id'] ?? $webhook['webhook_id'] ?? $settings['sepay_webhook_id'] ?? '', $settingsUserId);
            updatePaymentSetting('sepay_last_synced_at', now()->toDateTimeString(), $settingsUserId);
        } catch (\Throwable $e) {
            Log::warning('SePay webhook auto registration failed', [
                'settings_user_id' => $settingsUserId,
                'message' => $e->getMessage(),
            ]);

            return;
        }
    }

    private function findStoredSepayBankAccount(array $settings, string $bankAccountId): array
    {
        $accounts = json_decode((string) ($settings['sepay_bank_accounts'] ?? '[]'), true);

        if (!is_array($accounts)) {
            return [];
        }

        return collect($accounts)->first(function ($account) use ($bankAccountId) {
            return (string) ($account['id'] ?? '') === $bankAccountId;
        }) ?? [];
    }

    private function normalizeBankAccountForSettings(array $bankAccount): array
    {
        $bank = $bankAccount['bank'] ?? [];
        $bankCode = $bankAccount['bank_code'] ?? $bankAccount['bankCode'] ?? $bankAccount['bank_short_name'] ?? $bankAccount['bankShortName'] ?? $bank['code'] ?? $bank['short_name'] ?? '';
        $bankName = $bankAccount['bank_name'] ?? $bankAccount['bankName'] ?? $bankAccount['bank_full_name'] ?? $bankAccount['bankFullName'] ?? $bank['full_name'] ?? $bank['name'] ?? '';
        $bankShortName = $bankAccount['brand_name'] ?? $bankAccount['brandName'] ?? $bankAccount['bank_short_name'] ?? $bankAccount['bankShortName'] ?? $bank['short_name'] ?? $bankCode;

        return [
            'id' => (string) ($bankAccount['id'] ?? $bankAccount['bank_account_id'] ?? $bankAccount['bankAccountId'] ?? $bankAccount['account_id'] ?? ''),
            'bank_name' => $bankName,
            'bank_code' => $bankCode,
            'bank_short_name' => $bankShortName,
            'brand_name' => $bankShortName,
            'bank_bin' => $bankAccount['bank_bin'] ?? $bankAccount['bankBin'] ?? $bank['bin'] ?? '',
            'account_number' => $bankAccount['account_number'] ?? $bankAccount['accountNumber'] ?? $bankAccount['bank_account_number'] ?? $bankAccount['bankAccountNumber'] ?? $bankAccount['number'] ?? '',
            'account_name' => $bankAccount['account_name'] ?? $bankAccount['accountName'] ?? $bankAccount['account_holder_name'] ?? $bankAccount['accountHolderName'] ?? $bankAccount['account_holder'] ?? $bankAccount['accountHolder'] ?? $bankAccount['name'] ?? '',
            'account_type' => $bankAccount['account_type'] ?? $bankAccount['accountType'] ?? $bankAccount['type'] ?? '',
            'active' => $bankAccount['active'] ?? $bankAccount['status'] ?? '',
            'logo' => $bankAccount['logo'] ?? $bankAccount['bank_logo'] ?? $bank['logo_url'] ?? $bank['logo'] ?? '',
            'metadata' => $bankAccount,
        ];
    }

    private function validateSepayOrderPrefix(?string $prefix): void
    {
        if ($prefix === null || $prefix === '') {
            return;
        }

        $normalized = strtoupper((string) preg_replace('/[^A-Z0-9]/i', '', $prefix));

        if ($normalized === 'SEVQR' || str_starts_with($normalized, 'TKP')) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'sepay_payment_prefix' => [__('SEVQR/TKP is a transfer rule, not an order prefix. Please use a prefix like HD.')],
            ]);
        }
    }

    private function apiKeyBelongsToAnotherSettingsUser(string $apiKey, int $settingsUserId): bool
    {
        return collect(PaymentSetting::userIdsForDecryptedValue('sepay_api_key', $apiKey))
            ->contains(fn (int $userId) => $userId !== $settingsUserId);
    }

    public function getEnabledMethods()
    {
        $enabledMethods = getEnabledPaymentMethods();

        return response()->json($enabledMethods);
    }

    /**
     * Filter out sensitive payment gateway credentials
     *
     * @param array $settings
     * @return array
     */
    private function filterSensitiveData(array $settings): array
    {
        $safeSettings = [];

        // Only include enabled status and safe configuration
        $enabledKeys = [
            'is_manually_enabled',
            'is_bank_enabled',
            'is_sepay_enabled',
            'is_stripe_enabled',
            'is_paypal_enabled',
            'is_razorpay_enabled',
            'is_mercadopago_enabled',
            'is_paystack_enabled',
            'is_flutterwave_enabled',
            'is_paytabs_enabled',
            'is_skrill_enabled',
            'is_coingate_enabled',
            'is_payfast_enabled',
            'is_tap_enabled',
            'is_xendit_enabled',
            'is_paytr_enabled',
            'is_mollie_enabled',
            'is_toyyibpay_enabled',
            'is_benefit_enabled',
            'is_iyzipay_enabled',
            'is_aamarpay_enabled',
            'is_midtrans_enabled',
            'is_yookassa_enabled',
            'is_nepalste_enabled',
            'is_paiement_enabled',
            'is_cinetpay_enabled',
            'is_payhere_enabled',
            'is_fedapay_enabled',
            'is_authorizenet_enabled',
            'is_khalti_enabled',
            'is_easebuzz_enabled',
            'is_ozow_enabled',
            'is_cashfree_enabled'
        ];

        $modeKeys = [
            'paypal_mode',
            'mercadopago_mode',
            'paytabs_mode',
            'coingate_mode',
            'payfast_mode',
            'benefit_mode',
            'iyzipay_mode',
            'midtrans_mode',
            'nepalste_mode',
            'payhere_mode',
            'fedapay_mode',
            'authorizenet_mode',
            'ozow_mode',
            'cashfree_mode',
            'aamarpay_mode'
        ];

        // Keys needed by frontend payment components (safe to expose)
        $frontendKeys = [
            // Public keys for SDK initialization
            'stripe_key',
            'razorpay_key',
            'paystack_public_key',
            'flutterwave_public_key',
            'khalti_public_key',
            'cashfree_public_key',
            'iyzipay_public_key',
            'benefit_public_key',
            'fedapay_public_key',
            'nepalste_public_key',

            // Client/Merchant IDs and category codes (non-sensitive identifiers)
            'paypal_client_id',
            'toyyibpay_category_code',
            'aamarpay_store_id',
            'authorizenet_merchant_id',
            'cinetpay_site_id',
            'easebuzz_merchant_key',
            'ozow_site_key',
            'paiement_merchant_id',
            'payfastMerchantId',
            'payhere_merchant_id',
            'paytr_merchant_id',
            'skrill_merchant_id',
            'yookassa_shop_id',

            // Bank details (non-sensitive display info)
            'bank_detail',
            'sepay_bank_code',
            'sepay_bank_name',
            'sepay_bank_brand_name',
            'sepay_bank_bin',
            'sepay_account_number',
            'sepay_account_name',
            'sepay_account_type',
            'sepay_payment_prefix',
            'sepay_bank_account_id',
            'sepay_sub_accounts',
            'sepay_sub_account_id',
            'sepay_sub_account_number',
            'sepay_sub_account_name',
            'sepay_sub_account_code',
            'sepay_sub_account_type',
            'sepay_gateway_name',
            'sepay_payment_note',
            'sepay_bank_accounts',
            'sepay_account_email',
            'sepay_account_display_name',
            'sepay_account_avatar',
            'sepay_oauth_connected',
            'sepay_connected_at',
            'sepay_last_synced_at',
            'sepay_connection_status'
        ];

        // Include enabled status, modes, and frontend keys only
        foreach (array_merge($enabledKeys, $modeKeys, $frontendKeys) as $key) {
            if (isset($settings[$key])) {
                $safeSettings[$key] = $settings[$key];
            }
        }

        $sepayConfigured = !empty($settings['sepay_api_key'])
            && !empty($settings['sepay_connected_at'])
            && ($settings['sepay_connection_status'] ?? '') === 'connected'
            && !empty($settings['sepay_bank_account_id'])
            && !empty($settings['sepay_bank_code'])
            && !empty($settings['sepay_account_number'])
            && !empty($settings['sepay_account_name']);

        if (!isset($safeSettings['is_sepay_enabled']) && $sepayConfigured) {
            $safeSettings['is_sepay_enabled'] = true;
        }

        if (($safeSettings['is_sepay_enabled'] ?? false) === true || ($safeSettings['is_sepay_enabled'] ?? null) === '1') {
            $transferContent = app(SepayTransferContentService::class);
            $orderCode = $transferContent->buildOrderCode('invoice', '123456', $settings['sepay_payment_prefix'] ?? null);
            $instruction = $transferContent->instruction($settings, $orderCode);

            $safeSettings['sepay_bank_code'] = $instruction['bank_code'];
            $safeSettings['sepay_bank_name'] = $instruction['bank_name'];
            $safeSettings['sepay_account_number'] = $instruction['receiving_account'];
            $safeSettings['sepay_account_name'] = $instruction['account_name'];
            $safeSettings['sepay_payment_prefix'] = $transferContent->normalizeOrderPrefix($settings['sepay_payment_prefix'] ?? null);
            $safeSettings['sepay_rule_name'] = $instruction['rule_name'];
            $safeSettings['sepay_configuration_valid'] = $instruction['configuration_valid'];
        }

        return $safeSettings;
    }
}
