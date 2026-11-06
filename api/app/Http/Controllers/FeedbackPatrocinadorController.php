<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Edicao;
use App\Models\FeedbackPatrocinador;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class FeedbackPatrocinadorController extends Controller
{
    public function store(Request $request, Edicao $edicao): JsonResponse
    {
        $patrocinadores = FeedbackPatrocinador::PATROCINADORES[$edicao->ano] ?? null;
        abort_if($patrocinadores === null, 404);

        /** @var array<string, mixed> $dados */
        $dados = $request->validate([
            'empresa'      => ['required', Rule::in($patrocinadores)],
            'nota'         => ['required', 'integer', 'between:0,10'],
            'retorno'      => ['required', Rule::in(FeedbackPatrocinador::RETORNOS)],
            'mais_valor'   => ['required', 'array', 'min:1'],
            'mais_valor.*' => ['distinct', Rule::in(FeedbackPatrocinador::MAIS_VALOR)],
            'melhorias'    => ['nullable', 'string', 'max:2000'],
            'interesse'    => ['required', Rule::in(FeedbackPatrocinador::INTERESSES)],
            'depoimento'   => ['nullable', 'string', 'max:2000'],
        ]);

        FeedbackPatrocinador::create([...$dados, 'edicao_id' => $edicao->id]);

        return response()->json(['ok' => true], 201);
    }
}
