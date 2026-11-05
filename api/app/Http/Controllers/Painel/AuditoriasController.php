<?php

declare(strict_types=1);

namespace App\Http\Controllers\Painel;

use App\Http\Controllers\Controller;
use App\Models\Auditoria;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\Request;

/** O registro de quem olhou ou mexeu em dado pessoal. Leitura e nada mais. */
class AuditoriasController extends Controller
{
    /** @return LengthAwarePaginator<int, Auditoria> */
    public function index(Request $request): LengthAwarePaginator
    {
        $request->validate(['por_pagina' => ['sometimes', 'integer', 'min:1', 'max:200']]);

        return Auditoria::query()
            // Esta lista é o histórico de dado pessoal da tela de LGPD; mexer no
            // orçamento é registrado, mas não é acesso a dado de titular.
            ->where('acao', 'not like', 'orcamento.%')
            ->with('user:id,name')
            ->latest('id')
            ->paginate($request->integer('por_pagina') ?: 25);
    }
}
