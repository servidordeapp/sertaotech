<?php

declare(strict_types=1);

namespace App\Http\Controllers\Painel;

use App\Http\Controllers\Controller;
use App\Http\Resources\FeedbackPatrocinadorResource;
use App\Models\Edicao;
use App\Models\FeedbackPatrocinador;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/** Respostas de uma edição. Sem paginação: são poucas empresas por edição. */
class FeedbacksController extends Controller
{
    public function index(Edicao $edicao): AnonymousResourceCollection
    {
        $respostas = FeedbackPatrocinador::query()
            ->where('edicao_id', $edicao->id)
            ->latest()
            ->orderByDesc('id')
            ->get();

        $total      = $respostas->count();
        $promotores = $respostas->filter(fn (FeedbackPatrocinador $resposta): bool => $resposta->nota >= 9)->count();
        $detratores = $respostas->filter(fn (FeedbackPatrocinador $resposta): bool => $resposta->nota <= 6)->count();

        return FeedbackPatrocinadorResource::collection($respostas)->additional([
            'resumo' => [
                'respostas'      => $total,
                'empresas'       => $respostas->pluck('empresa')->unique()->count(),
                'patrocinadores' => count(FeedbackPatrocinador::PATROCINADORES[$edicao->ano] ?? []),
                'nota_media'     => $total > 0 ? round($respostas->sum(fn (FeedbackPatrocinador $resposta): int => $resposta->nota) / $total, 1) : null,
                'nps'            => $total > 0 ? (int) round(($promotores - $detratores) / $total * 100) : null,
                'querem_voltar'  => $respostas->whereIn('interesse', FeedbackPatrocinador::QUEREM_VOLTAR)->count(),
            ],
        ]);
    }
}
