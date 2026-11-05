<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    public function up(): void
    {
        // Quem olhou ou mexeu em dado pessoal. A LGPD põe o ônus da prova em
        // nós (art. 37): sem este registro, "ninguém baixou a lista" é palavra.
        Schema::create('auditorias', function (Blueprint $table): void {
            $table->id();
            // Sem cascade: se a conta do painel for apagada, o registro fica.
            // Apagar o rastro junto com quem o produziu derrotaria o propósito.
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->string('acao', 60);
            // A quem o ato se refere (e-mail da pessoa, filtro do export...).
            $table->string('alvo')->nullable();
            $table->string('ip', 45)->nullable();
            $table->timestamp('created_at');

            $table->index(['acao', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('auditorias');
    }
};
