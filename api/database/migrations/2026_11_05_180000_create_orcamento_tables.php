<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    public function up(): void
    {
        // A edição atual é a de maior ano: ver Edicao::atual().
        Schema::create('edicoes', function (Blueprint $table): void {
            $table->id();
            $table->unsignedSmallInteger('ano')->unique();
            $table->timestamps();
        });

        DB::table('edicoes')->insert([
            ['ano' => 2026, 'created_at' => now(), 'updated_at' => now()],
            ['ano' => 2027, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Dinheiro sempre em centavos e inteiro: soma de float erra centavo.
        Schema::create('orcamento_receitas', function (Blueprint $table): void {
            $table->id();
            // Restrict: apagar edição com lançamento é apagar a contabilidade dela.
            $table->foreignId('edicao_id')->constrained('edicoes')->restrictOnDelete();
            // De onde veio, quando veio do formulário de patrocínio do site.
            $table->foreignId('waitlist_entry_id')->nullable()->constrained()->nullOnDelete();
            $table->string('patrocinador', 160);
            $table->string('cota', 80);
            $table->unsignedInteger('valor_centavos');
            $table->string('status', 20)->default('prospeccao');
            $table->date('pagamento_previsto')->nullable();
            $table->date('recebido_em')->nullable();
            $table->string('anexo_caminho')->nullable();
            $table->string('anexo_nome')->nullable();
            $table->timestamps();

            // A mesma inscrição não entra duas vezes no funil da mesma edição.
            $table->unique(['edicao_id', 'waitlist_entry_id']);
        });

        Schema::create('orcamento_despesas', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('edicao_id')->constrained('edicoes')->restrictOnDelete();
            $table->string('categoria', 40);
            $table->string('descricao', 200);
            $table->string('fornecedor', 160)->nullable();
            $table->string('responsavel', 120)->nullable();
            $table->unsignedInteger('orcado_centavos');
            $table->unsignedInteger('realizado_centavos')->nullable();
            $table->string('status', 20)->default('planejado');
            $table->date('vencimento')->nullable();
            $table->string('anexo_caminho')->nullable();
            $table->string('anexo_nome')->nullable();
            $table->timestamps();

            $table->index(['edicao_id', 'categoria']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orcamento_despesas');
        Schema::dropIfExists('orcamento_receitas');
        Schema::dropIfExists('edicoes');
    }
};
