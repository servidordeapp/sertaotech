<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    public function up(): void
    {
        // Um aviso por e-mail em cada edição, no máximo. A chave única é a
        // primeira garantia: só quem insere a linha enfileira o envio, então
        // clique duplo ou disparo repetido não reenviam.
        Schema::create('avisos_certificado', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('edicao_id')->constrained('edicoes')->restrictOnDelete();
            $table->string('email');
            // Null: na fila. O job marca antes de enviar e desmarca se falhar.
            $table->timestamp('enviado_em')->nullable();
            $table->timestamps();

            $table->unique(['edicao_id', 'email']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('avisos_certificado');
    }
};
