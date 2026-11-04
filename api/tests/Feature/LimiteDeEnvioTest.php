<?php

declare(strict_types=1);

use Illuminate\Queue\Middleware\RateLimited;

test('passar do limite diário segura o e-mail na fila em vez de estourar o provedor', function () {
    config(['mail.limite_diario' => 2]);

    $job = new class () {
        public ?int $soltoEm = null;

        public function release(int $delay): void
        {
            $this->soltoEm = $delay;
        }
    };

    $enviados = 0;
    $envia    = function () use (&$enviados): void {
        $enviados++;
    };

    foreach (range(1, 5) as $ignored) {
        (new RateLimited('smtp'))->handle($job, $envia);
    }

    expect($enviados)->toBe(2)
        ->and($job->soltoEm)->toBeGreaterThan(23 * 60 * 60);
});
