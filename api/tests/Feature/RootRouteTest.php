<?php

declare(strict_types=1);

test('a raiz responde JSON com runtime e o convite da lista de espera', function () {
    $response = $this->getJson('/');

    $response->assertOk()
        ->assertJsonPath('runtime.php', PHP_VERSION)
        ->assertJsonPath('runtime.laravel', app()->version())
        ->assertJsonPath('inscricao.url', 'https://osertaotech.com.br/#lista-de-espera')
        ->assertJsonStructure(['service', 'message', 'inscricao' => ['label', 'url']]);
});
