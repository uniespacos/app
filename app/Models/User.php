<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'telefone',
        'profile_pic',
        'permission_type_id',
        'setor_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
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
            'password' => 'hashed',
        ];
    }

    public function setor()
    {
        return $this->belongsTo(Setor::class);
    }

    public function agendas()
    {
        return $this->hasMany(Agenda::class);
    }

    public function reservas()
    {
        return $this->hasMany(Reserva::class);
    }

    public function favoritos()
    {
        return $this->belongsToMany(Espaco::class, 'espaco_user', 'user_id', 'espaco_id');
    }

    public function horariosAvaliados()
    {
        return $this->hasMany(Horario::class, 'user_id');
    }

    /**
     * Define o canal de broadcast privado para as notificações do usuário.
     * Isso garante que o nome do canal seja consistente em toda a aplicação.
     */
    public function receivesBroadcastNotificationsOn(): string
    {
        return 'App.Models.User.'.$this->getKey();
    }
}
