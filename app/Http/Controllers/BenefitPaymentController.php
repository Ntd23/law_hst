<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use App\Models\User;
use App\Models\Setting;
use App\Models\PlanOrder;
use App\Models\PaymentSetting;
use App\Models\Invoice;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BenefitPaymentController extends Controller
{
    public function processPayment(Request $request)
    {
        // A browser-controlled request is never proof of a successful payment.
        // Benefit verification has not been implemented against the provider API yet,
        // so fail closed instead of activating a plan from request data.
        return back()->withErrors([
            'error' => __('Benefit payments are awaiting verified confirmation.'),
        ]);
    }

    public function createPaymentSession(Request $request)
    {
        $validated = validatePaymentRequest($request);

        try {
            $plan = Plan::findOrFail($validated['plan_id']);
                $pricing = calculatePlanPricing($plan, $validated['coupon_code'] ?? null, $validated['billing_cycle']);
            $settings = getPaymentGatewaySettings();

            if (!isset($settings['payment_settings']['benefit_secret_key'])) {
                return response()->json(['error' => __('Benefit payment not configured')], 400);
            }

            $user = auth()->user();
            $orderID = strtoupper(str_replace('.', '', uniqid('', true)));

            $userData = [
                "amount" => $pricing['final_price'],
                "currency" => "BHD",
                "customer_initiated" => true,
                "threeDSecure" => true,
                "save_card" => false,
                "description" => "Plan - " . $plan->name,
                "metadata" => ["udf1" => "Plan Payment"],
                "reference" => ["transaction" => $orderID, "order" => $orderID],
                "receipt" => ["email" => true, "sms" => true],
                "customer" => [
                    "first_name" => $user->name ?? 'Customer',
                    "middle_name" => "",
                    "last_name" => "",
                    "email" => $user->email,
                    "phone" => ["country_code" => "973", "number" => "33123456"]
                ],
                "source" => ["id" => "src_bh.benefit"],
                "post" => ["url" => route('benefit.callback')],
                // Redirects are informational only. They never activate a plan.
                "redirect" => ["url" => route('benefit.success')]
            ];

            $responseData = json_encode($userData);
            $response = \Http::withHeaders([
                'Authorization' => 'Bearer ' . $settings['payment_settings']['benefit_secret_key'],
                'accept' => 'application/json',
                'content-type' => 'application/json',
            ])->post('https://api.tap.company/v2/charges', $userData);

            if ($response->successful()) {
                $res = $response->json();
                if (isset($res['transaction']['url'])) {
                    return response()->json([
                        'success' => true,
                        'payment_url' => $res['transaction']['url'],
                        'transaction_id' => $orderID
                    ]);
                }
            }

            return response()->json(['error' => $response->body()], 500);

        } catch (\Exception $e) {
            return response()->json(['error' => __('Payment session creation failed')], 500);
        }
    }

    public function callback(Request $request)
    {
        return redirect()->route('plans.index')->with(
            'info',
            __('Benefit payment is being verified. Your plan will not change until confirmation is verified.')
        );
    }

    public function success(Request $request)
    {
        // Do not trust plan_id, user_id, amount, or status from a redirect.
        return redirect()->route('plans.index')->with(
            'info',
            __('Benefit payment is being verified. Your plan will not change until confirmation is verified.')
        );
    }

    public function webhook(Request $request)
    {
        \Log::warning('Rejected Benefit webhook because provider signature verification is not implemented.', [
            'has_signature' => $request->hasHeader('X-Benefit-Signature'),
        ]);

        return response()->json(['error' => __('Benefit webhook verification is not configured')], 503);
    }

    private function verifyBenefitPayment($paymentId, $transactionId, $settings)
    {
        // This is a simplified verification - in production, use Benefit API
        // For now, we'll assume the payment is valid if we have the required parameters
        return !empty($paymentId) && !empty($transactionId);
    }

    private function createBenefitSession($paymentData, $settings)
    {
        // This is a simplified session creation - in production, use Benefit API
        // For now, return a mock session
        $baseUrl = $settings['benefit_mode'] === 'live'
            ? 'https://api.benefit.bh'
            : 'https://sandbox-api.benefit.bh';

        return [
            'session_id' => 'benefit_session_' . time(),
            'payment_url' => $baseUrl . '/payment/checkout?session=' . time()
        ];
    }

    private function retrieveBenefitPayment($paymentId, $settings)
    {
        // This is a simplified retrieval - in production, use Benefit API
        // For now, return a mock successful response
        return [
            'status' => 'completed',
            'payment_id' => $paymentId,
            'amount' => '10.000',
            'currency' => 'BHD'
        ];
    }

    private function verifyBenefitWebhook($payload, $signature, $settings)
    {
        // This is a simplified webhook verification - in production, verify the signature
        // using Benefit's webhook secret and HMAC
        return true;
    }

    public function createInvoiceSession(Request $request)
    {
        $validated = $request->validate([
            'invoice_token' => 'required|string',
            'amount' => 'required|numeric|min:0.01'
        ]);

        try {
            $invoice = \App\Models\Invoice::where('payment_token', $validated['invoice_token'])->firstOrFail();

            $settings = getPaymentMethodConfig('benefit');

            if (empty($settings['secret_key'])) {
                return response()->json(['error' => 'Benefit payment not configured'], 400);
            }

            $orderID = 'invoice_' . $invoice->id . '_' . time();

            $userData = [
                "amount" => $validated['amount'],
                "currency" => "BHD",
                "customer_initiated" => true,
                "threeDSecure" => true,
                "save_card" => false,
                "description" => "Invoice Payment - " . $invoice->invoice_number,
                "metadata" => ["udf1" => "Invoice Payment"],
                "reference" => ["transaction" => $orderID, "order" => $orderID],
                "receipt" => ["email" => true, "sms" => true],
                "customer" => [
                    "first_name" => $invoice->client->name ?? 'Customer',
                    "middle_name" => "",
                    "last_name" => "",
                    "email" => $invoice->client->email ?? 'customer@example.com',
                    "phone" => ["country_code" => "973", "number" => "33123456"]
                ],
                "source" => ["id" => "src_bh.benefit"],
                "post" => ["url" => route('benefit.invoice.callback')],
                "redirect" => ["url" => route('benefit.invoice.success') . '?invoice_id=' . $invoice->id . '&amount=' . $validated['amount'] . '&invoice_token=' . $validated['invoice_token']]
            ];

            $response = \Http::withHeaders([
                'Authorization' => 'Bearer ' . $settings['secret_key'],
                'accept' => 'application/json',
                'content-type' => 'application/json',
            ])->post('https://api.tap.company/v2/charges', $userData);

            if ($response->successful()) {
                $res = $response->json();
                if (isset($res['transaction']['url'])) {
                    return response()->json([
                        'success' => true,
                        'redirect_url' => $res['transaction']['url'],
                        'transaction_id' => $orderID
                    ]);
                }
            }

            return response()->json(['error' => 'Payment session creation failed'], 500);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function invoiceSuccess(Request $request)
    {
        $invoiceToken = (string) $request->input('invoice_token', 'invalid');

        return redirect()->route('invoice.payment', $invoiceToken)->with(
            'info',
            __('Benefit payment is being verified. The invoice will update only after verified confirmation.')
        );
    }

    public function invoiceCallback(Request $request)
    {
        return response('OK', 200);
    }

    public function processInvoicePayment(Request $request)
    {
        $validated = $request->validate([
            'invoice_token' => 'required|string',
            'amount' => 'required|numeric|min:0.01'
        ]);

        try {
            $invoice = \App\Models\Invoice::where('payment_token', $validated['invoice_token'])->firstOrFail();

            $paymentSettings = \App\Models\PaymentSetting::where('user_id', $invoice->created_by)
                ->whereIn('key', ['benefit_secret_key', 'is_benefit_enabled'])
                ->pluck('value', 'key')
                ->toArray();

            if (empty($paymentSettings['benefit_secret_key']) || $paymentSettings['is_benefit_enabled'] !== '1') {
                return back()->withErrors(['error' => __('Benefit payment not configured')]);
            }

            $orderID = 'invoice_' . $invoice->id . '_' . time();

            $userData = [
                "amount" => $validated['amount'],
                "currency" => "BHD",
                "customer_initiated" => true,
                "threeDSecure" => true,
                "save_card" => false,
                "description" => "Invoice Payment - " . $invoice->invoice_number,
                "metadata" => ["udf1" => "Invoice Payment"],
                "reference" => ["transaction" => $orderID, "order" => $orderID],
                "receipt" => ["email" => true, "sms" => true],
                "customer" => [
                    "first_name" => $invoice->client->name ?? 'Customer',
                    "middle_name" => "",
                    "last_name" => "",
                    "email" => $invoice->client->email ?? 'customer@example.com',
                    "phone" => ["country_code" => "973", "number" => "33123456"]
                ],
                "source" => ["id" => "src_bh.benefit"],
                "post" => ["url" => route('benefit.invoice.callback')],
                "redirect" => ["url" => route('benefit.invoice.success') . '?invoice_id=' . $invoice->id . '&amount=' . $validated['amount'] . '&invoice_token=' . $validated['invoice_token']]
            ];

            $response = \Http::withHeaders([
                'Authorization' => 'Bearer ' . $paymentSettings['benefit_secret_key'],
                'accept' => 'application/json',
                'content-type' => 'application/json',
            ])->post('https://api.tap.company/v2/charges', $userData);

            if ($response->successful()) {
                $res = $response->json();
                if (isset($res['transaction']['url'])) {
                    return redirect()->away($res['transaction']['url']);
                }
            }

            return back()->withErrors(['error' => __('Payment initialization failed')]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->withErrors($e->errors());
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return back()->withErrors(['error' => __('Invoice not found. Please check the link and try again.')]);
        } catch (\Exception $e) {
            return back()->withErrors(['error' => __('Payment processing failed. Please try again or contact support.')]);
        }

}
}
