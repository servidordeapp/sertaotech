<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    public function up(): void
    {
        Schema::create('waitlist_entries', function (Blueprint $table): void {
            $table->id();
            $table->string('tipo', 20);
            $table->string('nome');
            $table->string('email');
            $table->string('whatsapp', 20);
            // Campos que só existem em uma das listas (cidade, perfil, tema, cota...).
            $table->json('dados');
            // LGPD art. 37: o ônus da prova é nosso — data e versão do texto aceito.
            $table->string('lgpd_versao', 40);
            $table->timestamp('lgpd_aceito_em');
            $table->string('compartilhamento_versao', 40)->nullable();
            $table->timestamp('compartilhamento_aceito_em')->nullable();
            $table->timestamps();

            $table->unique(['tipo', 'email']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('waitlist_entries');
    }
};
