<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    public function up(): void
    {
        Schema::table('waitlist_entries', function (Blueprint $table): void {
            // Quando a pessoa pediu para sair. A linha continua existindo com
            // a data e a versão do aceite — é a prova de que o consentimento
            // existiu — mas sem nada que identifique quem era.
            $table->timestamp('anonimizado_em')->nullable()->after('compartilhamento_aceito_em');
        });
    }

    public function down(): void
    {
        Schema::table('waitlist_entries', function (Blueprint $table): void {
            $table->dropColumn('anonimizado_em');
        });
    }
};
