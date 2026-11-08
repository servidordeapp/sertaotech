<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    public function up(): void
    {
        // Cancelado a pedido do titular (LGPD): nome, e-mail e PDF saem, código e
        // hash ficam. Não é revogação: o certificado foi emitido de verdade.
        Schema::table('certificados', function (Blueprint $table): void {
            $table->timestamp('anonimizado_em')->nullable()->after('motivo_revogacao');
        });
    }

    public function down(): void
    {
        Schema::table('certificados', function (Blueprint $table): void {
            $table->dropColumn('anonimizado_em');
        });
    }
};
