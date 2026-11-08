<?php

declare(strict_types=1);

namespace App\Http\Controllers\Painel;

use App\Http\Controllers\Controller;
use App\Http\Resources\ParticipanteResource;
use App\Models\Edicao;
use App\Models\Participante;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

/**
 * Quem teve ingresso em cada edição. O resumo e a lista de cupons ignoram os
 * filtros: são a foto da edição, e o filtro serve para olhar uma parte dela.
 */
class ParticipantesController extends Controller
{
    /** Valores de `?cupom=` que não são um cupom. Cupom é gravado em maiúsculas, então não colidem. */
    private const SOMENTE_PUBLICO = 'publico';

    private const SEM_CUPOM = 'sem-cupom';

    public function index(Request $request, Edicao $edicao): AnonymousResourceCollection
    {
        $request->validate([
            'presenca'   => ['sometimes', Rule::in(['compareceu', 'faltou'])],
            'cupom'      => ['sometimes', 'string', 'max:80'],
            'busca'      => ['sometimes', 'string', 'max:120'],
            'por_pagina' => ['sometimes', 'integer', 'min:1', 'max:200'],
        ]);

        $daEdicao = Participante::query()->where('edicao_id', $edicao->id);

        return ParticipanteResource::collection(
            $this->filtra((clone $daEdicao), $request)
                ->orderBy('nome')
                ->orderBy('id')
                ->paginate($request->integer('por_pagina') ?: 25)
                ->withQueryString(),
        )->additional([
            'resumo' => [
                'ingressos'    => (clone $daEdicao)->count(),
                'compareceram' => (clone $daEdicao)->where('compareceu', true)->count(),
                'da_equipe'    => (clone $daEdicao)->where('compareceu', true)->whereIn('cupom', Participante::CUPONS_DA_EQUIPE)->count(),
            ],
            'cupons'        => (clone $daEdicao)->whereNotNull('cupom')->distinct()->orderBy('cupom')->pluck('cupom'),
            'emails_unicos' => $this->emailsUnicos(),
        ]);
    }

    /**
     * Quantas pessoas o evento alcança, somando todas as edições: e-mails de
     * ingresso, da lista de espera e de certificado (a equipe sem ingresso). O
     * UNION já tira repetidos, e anonimizado não conta: não é mais ninguém.
     */
    private function emailsUnicos(): int
    {
        $email = 'lower(trim(email)) as email';

        return DB::query()->fromSub(
            DB::table('participantes')->whereNull('anonimizado_em')->selectRaw($email)
                ->union(DB::table('waitlist_entries')->whereNull('anonimizado_em')->selectRaw($email))
                ->union(DB::table('certificados')->whereNull('anonimizado_em')->selectRaw($email)),
            'emails',
        )->count();
    }

    /**
     * @param  Builder<Participante>  $consulta
     * @return Builder<Participante>
     */
    private function filtra(Builder $consulta, Request $request): Builder
    {
        $presenca = $request->string('presenca')->toString();
        if ($presenca !== '') {
            $consulta->where('compareceu', $presenca === 'compareceu');
        }

        $cupom = $request->string('cupom')->toString();
        if ($cupom === self::SEM_CUPOM) {
            $consulta->whereNull('cupom');
        } elseif ($cupom === self::SOMENTE_PUBLICO) {
            // O OR é necessário: em SQL, NULL NOT IN (...) não é verdadeiro, e quem
            // comprou sem cupom, a maior parte do público, sumiria da lista.
            $consulta->where(function (Builder $filtro): void {
                $filtro->whereNull('cupom')->orWhereNotIn('cupom', Participante::CUPONS_DA_EQUIPE);
            });
        } elseif ($cupom !== '') {
            $consulta->where('cupom', $cupom);
        }

        $busca = trim($request->string('busca')->toString());
        if ($busca !== '') {
            $consulta->where(function (Builder $filtro) use ($busca): void {
                $filtro->where('nome', 'like', '%'.$busca.'%')
                    ->orWhere('email', 'like', '%'.$busca.'%');
            });
        }

        return $consulta;
    }
}
