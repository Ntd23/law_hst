<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            if (!Schema::hasColumn('payments', 'sepay_order_code')) {
                $table->string('sepay_order_code')->nullable()->index()->after('transaction_id');
            }
            if (!Schema::hasColumn('payments', 'sepay_transaction_id')) {
                $table->string('sepay_transaction_id')->nullable()->unique()->after('sepay_order_code');
            }
            if (!Schema::hasColumn('payments', 'sepay_transaction_date')) {
                $table->timestamp('sepay_transaction_date')->nullable()->after('sepay_transaction_id');
            }
            if (!Schema::hasColumn('payments', 'sepay_payload')) {
                $table->json('sepay_payload')->nullable()->after('sepay_transaction_date');
            }
        });

        Schema::table('plan_orders', function (Blueprint $table) {
            if (!Schema::hasColumn('plan_orders', 'paid_amount')) {
                $table->decimal('paid_amount', 15, 2)->nullable()->after('payment_id');
            }
            if (!Schema::hasColumn('plan_orders', 'sepay_order_code')) {
                $table->string('sepay_order_code')->nullable()->index()->after('paid_amount');
            }
            if (!Schema::hasColumn('plan_orders', 'sepay_transaction_id')) {
                $table->string('sepay_transaction_id')->nullable()->unique()->after('sepay_order_code');
            }
            if (!Schema::hasColumn('plan_orders', 'sepay_transaction_date')) {
                $table->timestamp('sepay_transaction_date')->nullable()->after('sepay_transaction_id');
            }
            if (!Schema::hasColumn('plan_orders', 'sepay_payload')) {
                $table->json('sepay_payload')->nullable()->after('sepay_transaction_date');
            }
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            foreach (['sepay_payload', 'sepay_transaction_date', 'sepay_transaction_id', 'sepay_order_code'] as $column) {
                if (Schema::hasColumn('payments', $column)) {
                    $table->dropColumn($column);
                }
            }
        });

        Schema::table('plan_orders', function (Blueprint $table) {
            foreach (['sepay_payload', 'sepay_transaction_date', 'sepay_transaction_id', 'sepay_order_code', 'paid_amount'] as $column) {
                if (Schema::hasColumn('plan_orders', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
