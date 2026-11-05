<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    public function up(): void
    {
        // Quem teve ingresso em uma edição, vindo da plataforma de venda. Não é a
        // lista de espera: aqui não há aceite de LGPD a provar, e sim uma linha por
        // ingresso. O e-mail não identifica a pessoa, porque há quem compre para
        // outros com o mesmo endereço; por isso a chave é o ingresso.
        Schema::create('participantes', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('edicao_id')->constrained('edicoes')->restrictOnDelete();
            $table->string('ingresso', 40);
            // Cada caravana é um pedido só; guardar permite agrupar por caravana.
            $table->string('pedido', 40);
            $table->string('nome');
            $table->string('email')->index();
            $table->string('telefone', 20)->nullable();
            $table->string('tipo_ingresso', 60);
            $table->unsignedInteger('valor_centavos');
            // PALESTRANTE, ORGANIZACAO, UFDPAR...: separa o público de quem trabalhou no evento.
            $table->string('cupom', 80)->nullable();
            $table->boolean('compareceu');
            $table->timestamp('check_in_em')->nullable();
            // dateTime: timestamp obrigatório depois de outro timestamp ganha o padrão
            // 0000-00-00 no MySQL de produção, que recusa essa data (erro 1067).
            $table->dateTime('comprado_em');
            $table->timestamp('anonimizado_em')->nullable();
            $table->timestamps();

            $table->unique(['edicao_id', 'ingresso']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('participantes');
    }
};
