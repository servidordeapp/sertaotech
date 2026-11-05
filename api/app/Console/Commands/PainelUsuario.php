<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

use function Laravel\Prompts\password as perguntaSenha;
use function Laravel\Prompts\select;
use function Laravel\Prompts\text;

/**
 * Cria ou atualiza quem entra no painel. Não há tela de cadastro de propósito:
 * conta nova sai daqui, por SSH, e só.
 */
class PainelUsuario extends Command
{
    protected $signature = 'painel:usuario
                            {--email= : E-mail de quem entra}
                            {--nome= : Nome exibido}
                            {--papel= : admin, comercial ou curadoria}';

    protected $description = 'Cria (ou atualiza) um usuário do painel';

    public function handle(): int
    {
        $papeis = array_keys(User::PAPEIS);

        $email = $this->option('email') ?? text('E-mail', required: true);
        $nome  = $this->option('nome') ?? text('Nome', required: true);
        $papel = $this->option('papel') ?? select('Papel', $papeis);
        $senha = perguntaSenha('Senha', required: true);

        $dados = ['email' => $email, 'name' => $nome, 'papel' => $papel, 'password' => $senha];

        $validacao = Validator::make($dados, [
            'email'    => ['required', 'email'],
            'name'     => ['required', 'string', 'max:120'],
            'papel'    => ['required', Rule::in($papeis)],
            'password' => ['required', Password::min(12)],
        ]);

        if ($validacao->fails()) {
            foreach ($validacao->errors()->all() as $erro) {
                $this->error($erro);
            }

            return self::FAILURE;
        }

        // updateOrCreate: rodar de novo com o mesmo e-mail troca a senha ou o
        // papel, em vez de estourar no índice único.
        $usuario = User::updateOrCreate(['email' => $email], [
            'name'     => $nome,
            'papel'    => $papel,
            'password' => $senha,
        ]);

        $this->info(sprintf(
            '%s %s (%s) como %s.',
            $usuario->wasRecentlyCreated ? 'Criado' : 'Atualizado',
            $nome,
            $email,
            $papel,
        ));

        return self::SUCCESS;
    }
}
