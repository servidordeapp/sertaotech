<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    public function up(): void
    {
        // A página é pública e não tem login: cada envio é uma linha nova, para que
        // ninguém consiga sobrescrever a resposta de uma empresa conhecendo o link.
        Schema::create('feedbacks_patrocinadores', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('edicao_id')->constrained('edicoes')->restrictOnDelete();
            $table->string('empresa', 80);
            $table->unsignedTinyInteger('nota');
            $table->string('retorno', 20);
            $table->json('mais_valor');
            $table->text('melhorias')->nullable();
            $table->string('interesse', 40);
            // Quem preenche autoriza a publicação, como diz o texto do formulário.
            $table->text('depoimento')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('feedbacks_patrocinadores');
    }
};
