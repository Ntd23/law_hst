<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MidtransPaymentController extends Controller
{
    public function processPayment(Request $request)
    {
        // Client-provided status is not proof of a successful Midtrans payment.
        return back()->withErrors([
            'error' => __('Midtrans payments are awaiting verified confirmation.'),
        ]);
    }

    public function createPayment(Request $request)
    {
        $validated = validatePaymentRequest($request);

        try {
            $plan = Plan::findOrFail($validated['plan_id']);
            $pricing = calculatePlanPricing($plan, $validated['coupon_code'] ?? null, $validated['billing_cycle']);
            $settings = getPaymentGatewaySettings();

            if (!isset($settings['payment_settings']['midtrans_secret_key'])) {
                return response()->json(['error' => __('Midtrans not configured')], 400);
            }

            $user = auth()->user();
            $orderId = auth()->id() . '_' . $plan->id . '_' . $validated['billing_cycle'] . '_' . time();

            // Convert to IDR (whole numbers only, no cents)
            $amount = intval($pricing['final_price']);

            $paymentData = [
                'transaction_details' => [
                    'order_id' => $orderId,
                    'gross_amount' => $amount
                ],
                'credit_card' => [
                    'secure' => true
                ],
                'customer_details' => [
                    'first_name' => $user->name ?? 'Customer',
                    'email' => $user->email,
                ],
                'item_details' => [
                    [
                        'id' => $plan->id,
                        'price' => $amount,
                        'quantity' => 1,
                        'name' => $plan->name
                    ]
                ],
                'callbacks' => [
                    'finish' => route('midtrans.success') . '?order_id=' . $orderId
                ]
            ];

            $snapResult = $this->createSnapToken($paymentData, $settings['payment_settings']);

            if ($snapResult && isset($snapResult['token'])) {
                return response()->json([
                    'success' => true,
                    'snap_token' => $snapResult['token'],
                    'redirect_url' => $snapResult['redirect_url'] ?? null,
                    'order_id' => $orderId
                ]);
            }

            throw new \Exception(__('Failed to create Midtrans snap token'));

        } catch (\Exception $e) {
            return response()->json(['error' => __('Payment creation failed: ') . $e->getMessage()], 500);
        }
    }

    public function success(Request $request)
    {
        return redirect()->route('plans.index')->with(
            'info',
            __('Midtrans payment is being verified. Your plan will not change until confirmation is verified.')
        );
    }

    public function callback(Request $request)
    {
        // A pending order is required before automatic plan activation can be
        // safely enabled. Do not derive user/plan ownership from a callback.
        \Log::warning('Rejected Midtrans plan callback without a server-side pending order.', [
            'order_id' => $request->input('order_id'),
        ]);

        return response()->json(['error' => __('Midtrans plan callback verification is not configured')], 503);
    }

    private function createSnapToken($paymentData, $settings)
    {
        try {
            $baseUrl = $settings['midtrans_mode'] === 'live'
                ? 'https://app.midtrans.com'
                : 'https://app.sandbox.midtrans.com';

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $baseUrl . '/snap/v1/transactions');
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($paymentData));
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Authorization: Basic ' . base64_encode($settings['midtrans_secret_key'] . ':'),
                'Content-Type: application/json',
                'Accept: application/json'
            ]);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_TIMEOUT, 30);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            curl_close($ch);

            if ($curlError) {
                throw new \Exception('cURL Error: ' . $curlError);
            }

            if ($httpCode !== 201) {
                throw new \Exception('HTTP Error: ' . $httpCode . ' - ' . $response);
            }

            $result = json_decode($response, true);

            if (!isset($result['token'])) {
                throw new \Exception('No token in response: ' . $response);
            }

            return $result;

        } catch (\Exception $e) {
            return false;
        }
    }
    public function createInvoicePayment(Request $request)
    {
        try {
            $request->validate([
                'invoice_token' => 'required|string',
                'amount' => 'required|numeric|min:0.01'
            ]);

            $invoice = \App\Models\Invoice::where('payment_token', $request->invoice_token)->firstOrFail();
            $paymentSettings = $invoice->getPaymentSettings('midtrans');

            if (empty($paymentSettings['midtrans_secret_key']) || $paymentSettings['is_midtrans_enabled'] !== '1') {
                return response()->json(['error' => 'Midtrans payment not configured'], 400);
            }

            $orderId = 'invoice_' . $invoice->id . '_' . time();
            $amount = intval($invoice->remaining_amount);

            $paymentData = [
                'transaction_details' => [
                    'order_id' => $orderId,
                    'gross_amount' => $amount
                ],
                'credit_card' => ['secure' => true],
                'item_details' => [[
                    'id' => $invoice->id,
                    'price' => $amount,
                    'quantity' => 1,
                    'name' => 'Invoice Payment - ' . $invoice->invoice_number
                ]],
                'callbacks' => [
                    'finish' => route('midtrans.invoice.success') . '?order_id=' . $orderId . '&invoice_token=' . $request->invoice_token
                ]
            ];

            $snapResult = $this->createSnapToken($paymentData, $paymentSettings);

            if ($snapResult && isset($snapResult['token'])) {
                return response()->json([
                    'success' => true,
                    'snap_token' => $snapResult['token'],
                    'order_id' => $orderId
                ]);
            }

            return response()->json(['error' => 'Failed to create payment'], 500);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function invoiceSuccess(Request $request)
    {
        $invoiceToken = (string) $request->input('invoice_token', 'invalid');

        return redirect()->route('invoice.payment', $invoiceToken)->with(
            'info',
            __('Payment is being processed. The invoice will update after verified confirmation.')
        );
    }

    public function invoiceCallback(Request $request)
    {
        try {
            $orderId = $request->input('order_id');
            $transactionStatus = $request->input('transaction_status');

            if ($orderId && in_array($transactionStatus, ['capture', 'settlement'], true)) {
                // Extract invoice info from order ID
                $parts = explode('_', $orderId);
                if (count($parts) === 3 && $parts[0] === 'invoice') {
                    $invoiceId = $parts[1];
                    $invoice = \App\Models\Invoice::find($invoiceId);

                    if ($invoice && $this->hasValidInvoiceCallbackSignature($request, $invoice)) {
                        $amount = (float) $request->input('gross_amount');

                        if ($amount <= 0 || $amount > $invoice->remaining_amount) {
                            return response()->json(['error' => __('Invalid payment amount')], 422);
                        }

                        DB::transaction(function () use ($invoice, $amount, $request) {
                            $lockedInvoice = \App\Models\Invoice::lockForUpdate()->findOrFail($invoice->id);

                            if ($amount > $lockedInvoice->remaining_amount) {
                                throw new \RuntimeException('Payment amount exceeds the remaining invoice balance.');
                            }

                            $lockedInvoice->createPaymentRecord(
                                $amount,
                                'midtrans',
                                $request->input('transaction_id') ?: $request->input('order_id')
                            );
                        });

                        return response()->json(['status' => 'success']);
                    }
                }
            }

            return response()->json(['error' => __('Payment verification failed')], 400);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Callback processing failed'], 500);
        }
    }

    private function hasValidInvoiceCallbackSignature(Request $request, \App\Models\Invoice $invoice): bool
    {
        $settings = $invoice->getPaymentSettings('midtrans');
        $serverKey = $settings['midtrans_secret_key'] ?? null;
        $orderId = (string) $request->input('order_id');
        $statusCode = (string) $request->input('status_code');
        $grossAmount = (string) $request->input('gross_amount');
        $signature = (string) $request->input('signature_key');

        if (!$serverKey || !$orderId || !$statusCode || !$grossAmount || !$signature || $statusCode !== '200') {
            return false;
        }

        $expectedSignature = hash('sha512', $orderId . $statusCode . $grossAmount . $serverKey);

        return hash_equals($expectedSignature, $signature);
    }
}
