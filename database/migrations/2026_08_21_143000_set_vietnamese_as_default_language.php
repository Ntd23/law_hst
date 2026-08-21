<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('settings')
            ->where('key', 'defaultLanguage')
            ->update(['value' => 'vi']);

        DB::table('users')
            ->whereNull('lang')
            ->orWhere('lang', 'en')
            ->update(['lang' => 'vi']);
    }

    public function down(): void
    {
        //
    }
};
