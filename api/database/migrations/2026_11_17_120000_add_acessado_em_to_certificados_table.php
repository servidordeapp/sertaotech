<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    public function up(): void
    {
        // Primeira vez que a página do certificado (botão do e-mail) foi aberta.
        Schema::table('certificados', function (Blueprint $table): void {
            $table->timestamp('acessado_em')->nullable()->after('revogado_em');
        });
    }

    public function down(): void
    {
        Schema::table('certificados', function (Blueprint $table): void {
            $table->dropColumn('acessado_em');
        });
    }
};
