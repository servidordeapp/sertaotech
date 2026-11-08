<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    public function up(): void
    {
        // Um certificado por pessoa e papel em cada edição. Tudo que vai impresso
        // fica copiado aqui, para uma reimportação da planilha não mudar nada.
        // Sem código, é rascunho; com `emitido_em`, o model recusa alteração.
        Schema::create('certificados', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('edicao_id')->constrained('edicoes')->restrictOnDelete();
            // Null: adicionado à mão na revisão, sem ingresso.
            $table->foreignId('participante_id')->nullable()->constrained()->restrictOnDelete();
            $table->string('nome');
            $table->string('email')->index();
            $table->string('tipo', 20);
            // Palestra ou minicurso de palestrante e ministrante.
            $table->string('titulo')->nullable();
            $table->unsignedSmallInteger('carga_horaria');
            // Chaves de config('certificados.edicoes.{ano}.atividades').
            $table->json('atividades');
            $table->string('codigo', 20)->nullable()->unique();
            $table->string('pdf_caminho')->nullable();
            $table->char('pdf_sha256', 64)->nullable();
            $table->timestamp('emitido_em')->nullable();
            // Rascunho descartado fica, para o "Preparar" não recriá-lo.
            $table->timestamp('descartado_em')->nullable();
            $table->timestamp('revogado_em')->nullable();
            $table->string('motivo_revogacao')->nullable();
            $table->timestamps();

            // Faz o "Preparar" idempotente. Reemissão depois de revogar entra
            // sem participante_id, porque a linha revogada ocupa a chave.
            $table->unique(['edicao_id', 'participante_id', 'tipo']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('certificados');
    }
};
