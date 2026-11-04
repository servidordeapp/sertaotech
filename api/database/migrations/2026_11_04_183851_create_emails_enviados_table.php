<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    public function up(): void
    {
        // Uma linha por e-mail que saiu de fato. Serve para auditoria (provar o que
        // foi enviado, para quem e quando) e para número de marketing ("já enviamos
        // X e-mails"). E-mail que falhou não entra aqui: só conta o que saiu.
        Schema::create('emails_enviados', function (Blueprint $table): void {
            $table->id();
            $table->string('para');
            $table->string('assunto');
            // Classe do Mailable. Nulo quando o e-mail não veio de um Mailable.
            $table->string('mailable')->nullable();
            // Message-ID devolvido pelo provedor, para cruzar com o painel dele.
            $table->string('message_id')->nullable();
            $table->timestamp('enviado_em');

            $table->index('enviado_em');
            $table->index('para');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('emails_enviados');
    }
};
