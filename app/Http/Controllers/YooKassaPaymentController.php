<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use App\Models\Invoice;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class YooKassaPaymentController extends Controller
{
    public function createPayment(Request $request)
    {
        $validated = validatePaymentRequest($request);

        try {
            $plan = Plan::findOrFail($validated['plan_id']);
            $pricing = calculatePlanPricing($plan, $validated['coupon_code'] ?? null, $validated['billing_cycle']);
            $settings = getPaymentGatewaySettings();

            if (!isset($settings['payment_settings']['yookassa_shop_id'])) {
                return response()->json(['error' => 'YooKassa not configured'], 400);
            }

            $client = new \YooKassa\Client();
            $client->setAuth((int)$settings['payment_settings']['yookassa_shop_id'], $settings['payment_settings']['yookassa_secret_key']);

            $orderID = strtoupper(str_replace('.', '', uniqid('', true)));
            $user = auth()->user();

            $payment = $client->createPayment([
                'amount' => [
                    'value' => number_format($pricing['final_price'], 2, '.', ''),
                    'currency' => 'RUB',
                ],
                'confirmation' => [
                    'type' => 'redirect',
                    'return_url' => route('yookassa.success', [
                        'plan_id' => $plan->id,
                        'order_id' => $orderID,
                        'billing_cycle' => $validated['billing_cycle'],
                        'coupon_code' => $validated['coupon_code'] ?? null
                    ]),
                ],
                'capture' => true,
                'description' => 'Plan: ' . $plan->name,
                'metadata' => [
                    'plan_id' => $plan->id,
                    'user_id' => $user->id,
                    'billing_cycle' => $validated['billing_cycle'],
                    'coupon_code' => $validated['coupon_code'] ?? null,
                    'order_id' => $orderID
                ]
            ], uniqid('', true));

            if ($payment['confirmation']['confirmation_url'] != null) {
                return response()->json([
                    'success' => true,
                    'payment_url' => $payment['confirmation']['confirmation_url'],
                    'payment_id' => $payment['id']
                ]);
            } else {
                return response()->json(['error' => __('Payment creation failed')], 500);
            }

        } catch (\Exception $e) {
            return response()->json(['error' => __('Payment creation failed')], 500);
        }
    }

    public function success(Request $request)
    {
        // The provider return URL is not authenticated. The callback is the
        // only path allowed to settle a verified invoice payment.
        return redirect()->route('plans.index')->with(
            'info',
            __('Your payment is awaiting verified confirmation.'),
        );
    }

    public function callback(Request $request)
    {
        // Do not bind plan ownership from webhook metadata until a persisted
        // pending order and provider-side reconciliation are available.
        Log::warning('Rejected YooKassa plan callback until verified pending orders are implemented.', [
            'request_id' => $request->header('X-Request-Id'),
        ]);

        return response()->json(['error' => __('Verified pending order required')], 503);
    }
    public function processInvoicePayment(Request $request)
    {
        // The browser must not be able to turn an invoice into a paid invoice.
        // YooKassa's verified callback is the only automatic state-changing path.
        return back()->withErrors([
            'error' => __('Payment is awaiting verified confirmation.'),
        ]);
    }

    public function createInvoicePayment(Request $request)
    {

        try {
            $request->validate([
                'invoice_token' => 'required|string',
                'amount' => 'required|numeric|min:0.01'
            ]);
            $invoice = \App\Models\Invoice::where('payment_token', $request->invoice_token)->firstOrFail();

            $paymentSettings = $invoice->getPaymentSettings('yookassa');

            if (empty($paymentSettings['yookassa_shop_id']) || empty($paymentSettings['yookassa_secret_key']) || $paymentSettings['is_yookassa_enabled'] !== '1') {
                throw new \Exception('YooKassa payment not configured');
            }

            $client = new \YooKassa\Client();
            $client->setAuth((int)$paymentSettings['yookassa_shop_id'], $paymentSettings['yookassa_secret_key']);

            $orderId = 'invoice_' . $invoice->id . '_' . time();

            $payment = $client->createPayment([
                'amount' => [
                    'value' => number_format($invoice->remaining_amount, 2, '.', ''),
                    'currency' => 'RUB',
                ],
                'confirmation' => [
                    'type' => 'redirect',
                    'return_url' => route('yookassa.invoice.success') . '?order_id=' . $orderId . '&invoice_token=' . $request->invoice_token . '&test=1',
                ],
                'capture' => true,
                'description' => 'Invoice Payment - ' . $invoice->invoice_number,
                'metadata' => [
                    'invoice_id' => $invoice->id,
                    'invoice_token' => $request->invoice_token,
                    'order_id' => $orderId,
                    'amount' => $invoice->remaining_amount
                ]
            ], uniqid('', true));

            if ($payment['confirmation']['confirmation_url'] != null) {
                $result = [
                    'success' => true,
                    'redirect_url' => $payment['confirmation']['confirmation_url'],
                    'payment_id' => $payment['id']
                ];
            } else {
                throw new \Exception('Payment creation failed');
            }

            return response()->json($result);
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
            $paymentId = $request->input('object.id');
            $invoiceId = $request->input('object.metadata.invoice_id');

            if (!$paymentId || !$invoiceId) {
                return response('Invalid payment callback', 400);
            }

            $invoice = \App\Models\Invoice::find($invoiceId);
            if (!$invoice) {
                return response('Invoice not found', 404);
            }

            $payment = $this->retrieveVerifiedInvoicePayment($paymentId, $invoice);
            if (!$payment) {
                return response('Payment verification failed', 400);
            }

            $metadata = $payment->getMetadata() ?? [];
            $paymentAmount = (float) $payment->getAmount()->getValue();
            $currency = $payment->getAmount()->getCurrency();

            if (
                $payment->getStatus() !== 'succeeded' ||
                ($metadata['invoice_id'] ?? null) != $invoice->id ||
                ($metadata['invoice_token'] ?? null) !== $invoice->payment_token ||
                $currency !== 'RUB' ||
                $paymentAmount <= 0 ||
                $paymentAmount > $invoice->remaining_amount
            ) {
                return response('Payment verification failed', 400);
            }

            DB::transaction(function () use ($invoice, $paymentAmount, $paymentId) {
                $lockedInvoice = \App\Models\Invoice::lockForUpdate()->findOrFail($invoice->id);

                if ($paymentAmount > $lockedInvoice->remaining_amount) {
                    throw new \RuntimeException('Payment amount exceeds the remaining invoice balance.');
                }

                $lockedInvoice->createPaymentRecord($paymentAmount, 'yookassa', $paymentId);
            });

            return response('OK', 200);
        } catch (\Exception $e) {
            return response('FAILED', 400);
        }
    }

    private function retrieveVerifiedInvoicePayment(string $paymentId, Invoice $invoice): mixed
    {
        $settings = $invoice->getPaymentSettings('yookassa');

        if (empty($settings['yookassa_shop_id']) || empty($settings['yookassa_secret_key'])) {
            return null;
        }

        $client = new \YooKassa\Client();
        $client->setAuth((int) $settings['yookassa_shop_id'], $settings['yookassa_secret_key']);

        return $client->getPaymentInfo($paymentId);
    }
}
