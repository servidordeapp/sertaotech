<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            // Papel decide que tipo de inscrição o usuário enxerga; o mapa está
            // em User::PAPEIS. Sem default de propósito: linha antiga (ou criada
            // sem papel) fica com '' e não casa com nenhum papel, então não vê
            // nada — erro fecha a porta em vez de abrir.
            $table->string('papel', 20)->after('email');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn('papel');
        });
    }
};
