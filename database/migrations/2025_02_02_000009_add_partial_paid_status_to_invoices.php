<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropIndex(['created_by', 'status']);
            $table->dropIndex(['client_id', 'status']);
            $table->dropColumn('status');
        });
        
        Schema::table('invoices', function (Blueprint $table) {
            $table->enum('status', ['draft', 'sent', 'paid', 'partial_paid', 'overdue', 'cancelled'])->default('draft');
            $table->index(['created_by', 'status']);
            $table->index(['client_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropIndex(['created_by', 'status']);
            $table->dropIndex(['client_id', 'status']);
            $table->dropColumn('status');
        });
        
        Schema::table('invoices', function (Blueprint $table) {
            $table->enum('status', ['draft', 'sent', 'paid', 'overdue', 'cancelled'])->default('draft');
            $table->index(['created_by', 'status']);
            $table->index(['client_id', 'status']);
        });
    }
};