<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class () extends Migration {
    public function up(): void
    {
        // A 1ª edição: vem antes da de 2026 para receber a lista de participantes dela.
        DB::table('edicoes')->insert(['ano' => 2025, 'created_at' => now(), 'updated_at' => now()]);
    }

    public function down(): void
    {
        // Falha de propósito se já houver participantes: a FK é restrict.
        DB::table('edicoes')->where('ano', 2025)->delete();
    }
};
