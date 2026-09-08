<?php

use App\Http\Controllers\SepayPaymentController;
use Illuminate\Support\Facades\Route;

Route::post('sepay/webhook', [SepayPaymentController::class, 'webhook'])
    ->name('sepay.webhook.api');
