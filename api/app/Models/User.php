<?php

declare(strict_types=1);

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'password', 'papel'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory;
    use Notifiable;

    /**
     * Papel do painel => tipos de inscrição que ele enxerga.
     *
     * Três papéis fixos não pagam um pacote de permissões. Papel que não está
     * aqui não vê nada (ver `tiposVisiveis()`).
     *
     * @var array<string, list<string>>
     */
    public const PAPEIS = [
        'admin'     => WaitlistEntry::TIPOS,
        'comercial' => ['patrocinador'],
        'curadoria' => ['palestrante'],
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
        ];
    }

    /** @return list<string> */
    public function tiposVisiveis(): array
    {
        return self::PAPEIS[$this->papel] ?? [];
    }

    public function ehAdmin(): bool
    {
        return $this->papel === 'admin';
    }
}
