<?php

declare(strict_types=1);

namespace App\Http\Controllers\Painel;

use App\Http\Controllers\Controller;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Query\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * O que saiu de e-mail. Só admin: é o evento inteiro, não o recorte de um
 * tipo de inscrição.
 */
class EmailsController extends Controller
{
    /** @return LengthAwarePaginator<int, object> */
    public function index(Request $request): LengthAwarePaginator
    {
        $request->validate([
            'busca'      => ['sometimes', 'string', 'max:120'],
            'por_pagina' => ['sometimes', 'integer', 'min:1', 'max:200'],
        ]);

        // DB::table e não model: é como o listener que escreve nesta tabela
        // (App\Listeners\RegistraEmailEnviado) já faz.
        $consulta = DB::table('emails_enviados')->orderByDesc('enviado_em');

        $busca = trim($request->string('busca')->toString());
        if ($busca !== '') {
            $consulta->where(function (Builder $filtro) use ($busca): void {
                $filtro->where('para', 'like', '%'.$busca.'%')
                    ->orWhere('assunto', 'like', '%'.$busca.'%');
            });
        }

        return $consulta->paginate($request->integer('por_pagina') ?: 25)->withQueryString();
    }
}
