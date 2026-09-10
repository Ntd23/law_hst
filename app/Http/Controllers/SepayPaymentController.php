<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Payment;
use App\Models\PaymentSetting;
use App\Models\Plan;
use App\Models\PlanOrder;
use App\Services\SepayTransferContentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class SepayPaymentController extends Controller
{
    public function processPayment(Request $request)
    {
        $validated = validatePaymentRequest($request, [
            'amount' => 'required|numeric|min:0',
            'reference_code' => 'nullable|string|max:100',
        ]);

        try {
            $plan = Plan::findOrFail($validated['plan_id']);
            $referenceCode = strtoupper($validated['reference_code'] ?: app(SepayTransferContentService::class)->buildOrderCode('PLAN', auth()->id(), null));

            $existingOrder = PlanOrder::where('payment_method', 'sepay')
                ->where(function ($query) use ($referenceCode) {
                    $query->where('payment_id', $referenceCode)
                        ->orWhere('sepay_order_code', $referenceCode);
                })
                ->first();

            if ($existingOrder) {
                return back()->with('success', __('SePay payment request is ready. Waiting for transfer confirmation.'));
            }

            createPlanOrder([
                'user_id' => auth()->id(),
                'plan_id' => $plan->id,
                'billing_cycle' => $validated['billing_cycle'],
                'payment_method' => 'sepay',
                'coupon_code' => $validated['coupon_code'] ?? null,
                'payment_id' => $referenceCode,
                'status' => 'pending',
            ]);

            PlanOrder::where('payment_method', 'sepay')
                ->where('payment_id', $referenceCode)
                ->latest('id')
                ->first()
                ?->update(['sepay_order_code' => $referenceCode]);

            return back()->with('success', __('SePay payment request submitted. Your plan will be activated after payment verification.'));
        } catch (\Exception $e) {
            return handlePaymentError($e, 'sepay');
        }
    }

    public function planTransferPreview(Request $request, SepayTransferContentService $transferContent)
    {
        $validated = $request->validate([
            'plan_id' => 'required|integer|exists:plans,id',
        ]);

        $settingsUserId = \App\Models\User::where('type', 'superadmin')->first()?->id;
        if (!$settingsUserId) {
            return response()->json([
                'success' => false,
                'message' => 'SePay settings owner was not found.',
            ], 404);
        }

        $settings = PaymentSetting::getUserSettings((int) $settingsUserId);
        $orderCode = $transferContent->buildOrderCode(
            'PLAN',
            auth()->id() . (string) $validated['plan_id'],
            $settings['sepay_payment_prefix'] ?? null
        );

        return response()->json([
            'success' => true,
            'preview' => $transferContent->instruction($settings, $orderCode),
        ]);
    }

    public function processInvoicePayment(Request $request)
    {
        try {
            $request->validate([
                'invoice_token' => 'required|string',
                'amount' => 'required|numeric|min:0.01',
                'reference_code' => 'nullable|string|max:100',
            ]);

            $invoice = Invoice::where('payment_token', $request->invoice_token)->firstOrFail();
            $referenceCode = strtoupper($request->reference_code ?: app(SepayTransferContentService::class)->buildOrderCode('invoice', $invoice->id, null));

            $existingPayment = Payment::where('payment_method', 'sepay')
                ->where('invoice_id', $invoice->id)
                ->where(function ($query) use ($referenceCode) {
                    $query->where('transaction_id', $referenceCode)
                        ->orWhere('sepay_order_code', $referenceCode);
                })
                ->first();

            if ($existingPayment) {
                return redirect()->route('invoice.payment', $invoice->payment_token)
                    ->with('success', __('SePay payment request is ready. Waiting for transfer confirmation.'));
            }

            Payment::create([
                'invoice_id' => $invoice->id,
                'amount' => $request->amount,
                'payment_method' => 'sepay',
                'payment_date' => now(),
                'transaction_id' => $referenceCode,
                'sepay_order_code' => $referenceCode,
                'status' => 'pending',
                'created_by' => $invoice->created_by,
                'notes' => __('Awaiting SePay transfer verification.'),
            ]);

            return redirect()->route('invoice.payment', $invoice->payment_token)
                ->with('success', __('SePay payment request submitted. Invoice will be marked as paid after payment verification.'));
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->withErrors($e->errors());
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return back()->withErrors(['error' => __('Invoice not found. Please check the link and try again.')]);
        } catch (\Exception $e) {
            return back()->withErrors(['error' => __('SePay payment request failed. Please try again or contact support.')]);
        }
    }

    public function webhook(Request $request)
    {
        $rawBody = $request->getContent();
        $settingsUserId = $this->authenticateWebhook($request);

        if (!$settingsUserId) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $payload = $request->isJson()
            ? json_decode($rawBody, true)
            : $request->all();

        if (!is_array($payload)) {
            Log::warning('SePay webhook received invalid payload');
            return response()->json(['success' => false, 'message' => 'Invalid payload'], 422);
        }

        $payloadError = $this->validateWebhookPayload($payload);
        if ($payloadError !== null) {
            Log::warning('SePay webhook received incomplete payload', [
                'message' => $payloadError,
                'payload' => $payload,
            ]);

            return response()->json(['success' => false, 'message' => $payloadError], 422);
        }

        try {
            $result = $this->handleWebhookPayload($payload, $settingsUserId);
        } catch (\Throwable $e) {
            Log::error('SePay webhook processing failed', [
                'message' => $e->getMessage(),
                'payload' => $payload,
            ]);

            return response()->json(['success' => false, 'message' => 'Webhook processing failed'], 500);
        }

        return response()->json(['success' => true, 'message' => $result]);
    }

    private function validateWebhookPayload(array $payload): ?string
    {
        $transferType = strtolower((string) ($payload['transferType'] ?? $payload['transfer_type'] ?? ''));

        if ($transferType === '') {
            return 'Missing transfer type';
        }

        if (!array_key_exists('transferAmount', $payload) && !array_key_exists('transfer_amount', $payload)) {
            return 'Missing transfer amount';
        }

        return null;
    }

    public function callbackPayment(Request $request)
    {
        return $this->webhook($request);
    }

    public function checkStatus(string $orderCode)
    {
        $orderCode = strtoupper(trim($orderCode));

        $planOrder = PlanOrder::where('payment_method', 'sepay')
            ->where(function ($query) use ($orderCode) {
                $query->where('payment_id', $orderCode)
                    ->orWhere('sepay_order_code', $orderCode);
            })
            ->latest('id')
            ->first();

        if ($planOrder) {
            $isPaid = in_array($planOrder->status, ['approved', 'paid', 'completed'], true);

            return response()->json([
                'is_paid' => $isPaid,
                'status' => $isPaid ? 'paid' : $planOrder->status,
                'type' => 'plan',
            ]);
        }

        $payment = Payment::where('payment_method', 'sepay')
            ->where(function ($query) use ($orderCode) {
                $query->where('transaction_id', $orderCode)
                    ->orWhere('sepay_order_code', $orderCode);
            })
            ->latest('id')
            ->first();

        if ($payment) {
            $isPaid = $payment->status === 'completed';

            return response()->json([
                'is_paid' => $isPaid,
                'status' => $isPaid ? 'paid' : $payment->status,
                'type' => 'invoice',
            ]);
        }

        $invoice = $this->findInvoiceFromReferences([$orderCode]);
        if ($invoice) {
            $isPaid = $invoice->status === 'paid' || $invoice->remaining_amount <= 0;

            return response()->json([
                'is_paid' => $isPaid,
                'status' => $isPaid ? 'paid' : $invoice->status,
                'type' => 'invoice',
            ]);
        }

        return response()->json([
            'is_paid' => false,
            'status' => 'not_found',
        ]);
    }

    private function authenticateWebhook(Request $request): ?int
    {
        $apiKey = $this->webhookApiKeyFromRequest($request);

        if ($apiKey === '') {
            Log::warning('SePay webhook rejected: missing API key authorization header');

            return null;
        }

        $matchedUserIds = PaymentSetting::userIdsForDecryptedValue('sepay_webhook_api_key', $apiKey);

        if (count($matchedUserIds) === 1) {
            return $matchedUserIds[0];
        }

        if (count($matchedUserIds) > 1) {
            Log::warning('SePay webhook rejected because API key is connected to multiple user accounts', [
                'settings_user_ids' => $matchedUserIds,
            ]);

            return null;
        }

        Log::warning('SePay webhook rejected: API key does not match any account');

        return null;
    }

    private function webhookApiKeyFromRequest(Request $request): string
    {
        $authorization = (string) $request->header('Authorization', '');

        if (preg_match('/^\s*apikey\s+(.+?)\s*$/i', $authorization, $matches)) {
            return trim($matches[1]);
        }

        return '';
    }

    private function handleWebhookPayload(array $payload, int $settingsUserId): string
    {
        $transferType = strtolower((string) ($payload['transferType'] ?? $payload['transfer_type'] ?? ''));
        if ($transferType !== 'in') {
            Log::info('SePay webhook skipped non-incoming transfer', ['payload' => $payload]);
            return 'Non-incoming transfer skipped';
        }

        $settings = PaymentSetting::getUserSettings($settingsUserId);
        $instruction = app(SepayTransferContentService::class)->instruction($settings, '');
        $configuredAccount = (string) ($instruction['receiving_account'] ?: ($settings['sepay_account_number'] ?? ''));
        $mainAccount = (string) ($settings['sepay_account_number'] ?? '');
        $payloadAccount = $payload['accountNumber'] ?? $payload['account_number'] ?? null;
        $payloadVa = $payload['va'] ?? $payload['va_number'] ?? $payload['virtualAccount'] ?? $payload['virtual_account'] ?? null;

        $acceptedAccounts = array_values(array_filter(array_unique([$configuredAccount, $mainAccount])));
        if (
            $payloadAccount
            && !in_array((string) $payloadAccount, $acceptedAccounts, true)
            && (!$payloadVa || !in_array((string) $payloadVa, $acceptedAccounts, true))
        ) {
            Log::warning('SePay webhook skipped account mismatch', [
                'configured_accounts' => $acceptedAccounts,
                'payload_account' => $payloadAccount,
                'payload_va' => $payloadVa,
            ]);
            return 'Account mismatch skipped';
        }

        $sepayTransactionId = (string) ($payload['id'] ?? $payload['referenceCode'] ?? $payload['reference_code'] ?? Str::uuid()->toString());
        $transactionId = 'sepay:' . $sepayTransactionId;

        if (
            Payment::where('transaction_id', $transactionId)->orWhere('sepay_transaction_id', $sepayTransactionId)->exists() ||
            PlanOrder::where('sepay_transaction_id', $sepayTransactionId)->exists()
        ) {
            Log::info('SePay webhook skipped duplicate transaction', ['transaction_id' => $transactionId]);
            return 'Transaction already processed';
        }

        $amount = (float) ($payload['transferAmount'] ?? $payload['transfer_amount'] ?? 0);
        if ($amount <= 0) {
            Log::warning('SePay webhook skipped invalid amount', ['payload' => $payload]);
            return 'Invalid amount skipped';
        }

        $content = trim((string) ($payload['content'] ?? $payload['description'] ?? ''));
        $code = trim((string) ($payload['code'] ?? ''));
        $configuredPrefix = (string) ($settings['sepay_payment_prefix'] ?? config('sepay.default_order_prefix', 'HD'));
        $references = array_values(array_unique(array_filter([
            $code ? strtoupper($code) : null,
            ...app(SepayTransferContentService::class)->extractOrderCodes($code . ' ' . $content, [$configuredPrefix]),
            ...$this->extractInternalReferences($content),
        ])));

        $processed = DB::transaction(function () use ($references, $transactionId, $sepayTransactionId, $settingsUserId, $content, $amount, $payload) {
            return $this->completePendingInvoicePayment($references, $transactionId, $sepayTransactionId, $settingsUserId, $amount, $payload)
                || $this->createInvoicePaymentFromReference($references, $transactionId, $sepayTransactionId, $settingsUserId, $amount, $payload)
                || $this->approvePendingPlanOrder($references, $content, $sepayTransactionId, $amount, $payload);
        });

        if ($processed) {
            return 'Payment processed successfully';
        }

        Log::info('SePay webhook received but no matching pending payment/order found', [
            'transaction_id' => $transactionId,
            'references' => $references,
            'payload' => $payload,
        ]);

        return 'No matching order found';
    }

    private function completePendingInvoicePayment(array $references, string $transactionId, string $sepayTransactionId, int $settingsUserId, float $amount, array $payload): bool
    {
        if (empty($references)) {
            return false;
        }

        $payment = Payment::with('invoice')
            ->where('payment_method', 'sepay')
            ->where('status', 'pending')
            ->where(function ($query) use ($references) {
                $query->whereIn('transaction_id', $references)
                    ->orWhereIn('sepay_order_code', $references);
            })
            ->get()
            ->first(fn (Payment $payment): bool => $this->invoiceBelongsToSettingsUser($payment->invoice, $settingsUserId));

        if (!$payment) {
            return false;
        }

        if ($amount + $this->amountTolerance() < (float) $payment->amount) {
            Log::warning('SePay invoice payment amount is lower than expected', [
                'payment_id' => $payment->id,
                'expected' => $payment->amount,
                'received' => $amount,
            ]);
            return true;
        }

        $payment->update([
            'transaction_id' => $transactionId,
            'sepay_transaction_id' => $sepayTransactionId,
            'sepay_transaction_date' => $this->parseTransactionDate($payload['transactionDate'] ?? null),
            'sepay_payload' => $payload,
            'status' => 'completed',
            'payment_date' => $this->parseTransactionDate($payload['transactionDate'] ?? null),
            'notes' => trim(($payment->notes ? $payment->notes . "\n" : '') . 'Verified by SePay webhook. Bank reference: ' . ($payload['referenceCode'] ?? '')),
        ]);

        $payment->invoice?->updatePaymentStatus();

        return true;
    }

    private function createInvoicePaymentFromReference(array $references, string $transactionId, string $sepayTransactionId, int $settingsUserId, float $amount, array $payload): bool
    {
        $invoice = $this->findInvoiceFromReferences($references, $settingsUserId);
        if (!$invoice) {
            return false;
        }

        if (Payment::where('transaction_id', $transactionId)->exists()) {
            return true;
        }

        if (in_array($invoice->status, ['paid', 'completed'], true)) {
            return true;
        }

        Payment::create([
            'invoice_id' => $invoice->id,
            'amount' => min($amount, (float) ($invoice->remaining_amount ?: $invoice->total_amount)),
            'payment_method' => 'sepay',
            'payment_date' => $this->parseTransactionDate($payload['transactionDate'] ?? null),
            'transaction_id' => $transactionId,
            'sepay_order_code' => $references[0] ?? null,
            'sepay_transaction_id' => $sepayTransactionId,
            'sepay_transaction_date' => $this->parseTransactionDate($payload['transactionDate'] ?? null),
            'sepay_payload' => $payload,
            'status' => 'completed',
            'created_by' => $invoice->created_by,
            'notes' => 'Verified by SePay webhook. Bank reference: ' . ($payload['referenceCode'] ?? ''),
        ]);

        $invoice->updatePaymentStatus();

        return true;
    }

    private function findInvoiceFromReferences(array $references, ?int $settingsUserId = null): ?Invoice
    {
        foreach ($references as $reference) {
            if (preg_match('/INV[-_]?(\d+)/i', $reference, $matches)) {
                $invoice = Invoice::find((int) $matches[1]);

                if ($invoice && $this->invoiceBelongsToSettingsUser($invoice, $settingsUserId)) {
                    return $invoice;
                }
            }

            if ($settingsUserId) {
                $settings = PaymentSetting::getUserSettings($settingsUserId);
                $prefix = app(SepayTransferContentService::class)->normalizeOrderPrefix($settings['sepay_payment_prefix'] ?? null);

                if (preg_match('/^' . preg_quote($prefix, '/') . '(\d+)$/i', $this->normalizeReference($reference), $matches)) {
                    $invoice = Invoice::find((int) $matches[1]);

                    if ($invoice && $this->invoiceBelongsToSettingsUser($invoice, $settingsUserId)) {
                        return $invoice;
                    }
                }
            }
        }

        $normalizedReferences = collect($references)
            ->map(fn (string $reference): string => $this->normalizeReference($reference))
            ->filter()
            ->values();

        if ($normalizedReferences->isEmpty()) {
            return null;
        }

        return Invoice::query()
            ->whereNotIn('status', ['cancelled'])
            ->get(['id', 'invoice_number', 'status', 'total_amount'])
            ->first(function (Invoice $invoice) use ($normalizedReferences, $settingsUserId) {
                $normalizedInvoiceNumber = $this->normalizeReference((string) $invoice->invoice_number);

                return $this->invoiceBelongsToSettingsUser($invoice, $settingsUserId)
                    && $normalizedInvoiceNumber !== ''
                    && $normalizedReferences->contains(fn (string $reference): bool => Str::endsWith($reference, $normalizedInvoiceNumber));
            });
    }

    private function invoiceBelongsToSettingsUser(?Invoice $invoice, ?int $settingsUserId): bool
    {
        if (!$invoice || !$settingsUserId || $settingsUserId < 1) {
            return $settingsUserId === null && $invoice !== null;
        }

        return (int) $invoice->created_by === $settingsUserId;
    }

    private function normalizeReference(string $reference): string
    {
        return strtoupper((string) preg_replace('/[^A-Z0-9]/i', '', $reference));
    }

    private function approvePendingPlanOrder(array $references, string $content, string $sepayTransactionId, float $amount, array $payload): bool
    {
        $planOrder = null;

        if (!empty($references)) {
            $planOrder = PlanOrder::where('payment_method', 'sepay')
                ->where('status', 'pending')
                ->where(function ($query) use ($references) {
                    $query->whereIn('payment_id', $references)
                        ->orWhereIn('sepay_order_code', $references);
                })
                ->first();
        }

        if (!$planOrder && $content !== '') {
            $planOrder = PlanOrder::where('payment_method', 'sepay')
                ->where('status', 'pending')
                ->whereNotNull('payment_id')
                ->get()
                ->first(fn (PlanOrder $order) => stripos($content, (string) $order->payment_id) !== false);
        }

        if (!$planOrder) {
            return false;
        }

        if ($amount + $this->amountTolerance() < (float) $planOrder->final_price) {
            Log::warning('SePay plan order amount is lower than expected', [
                'plan_order_id' => $planOrder->id,
                'expected' => $planOrder->final_price,
                'received' => $amount,
            ]);
            return true;
        }

        $planOrder->paid_amount = $amount;
        $planOrder->sepay_transaction_id = $sepayTransactionId;
        $planOrder->sepay_transaction_date = $this->parseTransactionDate($payload['transactionDate'] ?? null);
        $planOrder->sepay_payload = $payload;
        $planOrder->notes = trim(($planOrder->notes ? $planOrder->notes . "\n" : '') . 'Verified by SePay webhook. SePay transaction ID: ' . ($payload['id'] ?? '') . '. Bank reference: ' . ($payload['referenceCode'] ?? ''));
        $planOrder->save();
        $planOrder->activateSubscription();

        return true;
    }

    private function extractInternalReferences(string $content): array
    {
        if ($content === '') {
            return [];
        }

        preg_match_all('/\b[A-Z0-9]*?(?:PLAN|INV)[-_]?\d+(?:[-_][A-Z0-9]+)?\b/i', $content, $matches);

        if (empty($matches[0])) {
            return [];
        }

        return array_values(array_unique(array_map(
            static fn (string $reference): string => strtoupper($reference),
            $matches[0],
        )));
    }

    private function parseTransactionDate(?string $date): \Illuminate\Support\Carbon
    {
        if (!$date) {
            return now();
        }

        try {
            return \Carbon\Carbon::parse($date);
        } catch (\Throwable $e) {
            return now();
        }
    }

    private function amountTolerance(): float
    {
        return (float) config('services.sepay.amount_tolerance', 1000);
    }

    private function makeReferenceCode(string $prefix, int|string|null $id = null): string
    {
        return 'SEPAY-' . $prefix . ($id ? '-' . $id : '') . '-' . Str::upper(Str::random(8));
    }

}
