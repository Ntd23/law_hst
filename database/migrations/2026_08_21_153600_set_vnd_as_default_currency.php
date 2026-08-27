<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('currencies')->updateOrInsert(
            ['code' => 'VND'],
            [
                'name' => 'Việt Nam Đồng',
                'symbol' => 'VNĐ',
                'description' => 'Vietnamese Dong',
                'is_default' => true,
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );

        DB::table('currencies')->updateOrInsert(
            ['code' => 'USD'],
            [
                'name' => 'US Dollar',
                'symbol' => '$',
                'description' => 'United States Dollar',
                'is_default' => false,
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );

        DB::table('currencies')
            ->whereNotIn('code', ['VND'])
            ->update(['is_default' => false]);

        DB::table('settings')
            ->where('key', 'defaultCurrency')
            ->update(['value' => 'VND']);

        DB::table('settings')
            ->where('key', 'currencySymbolSpace')
            ->update(['value' => '1']);

        DB::table('settings')
            ->where('key', 'currencySymbolPosition')
            ->update(['value' => 'after']);
    }

    public function down(): void
    {
        DB::table('currencies')
            ->where('code', 'VND')
            ->update([
                'name' => 'Vietnamese Dong',
                'symbol' => '₫',
                'is_default' => false,
            ]);

        DB::table('currencies')
            ->where('code', 'USD')
            ->update(['is_default' => true]);

        DB::table('settings')
            ->where('key', 'defaultCurrency')
            ->update(['value' => 'USD']);

        DB::table('settings')
            ->where('key', 'currencySymbolSpace')
            ->update(['value' => '0']);

        DB::table('settings')
            ->where('key', 'currencySymbolPosition')
            ->update(['value' => 'before']);
    }
};
