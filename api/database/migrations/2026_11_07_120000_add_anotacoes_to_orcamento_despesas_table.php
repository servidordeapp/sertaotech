<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    public function up(): void
    {
        Schema::table('orcamento_despesas', function (Blueprint $table): void {
            $table->text('anotacoes')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('orcamento_despesas', function (Blueprint $table): void {
            $table->dropColumn('anotacoes');
        });
    }
};
