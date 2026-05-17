<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Auth\MustVerifyEmail as MustVerifyEmailTrait;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Notifications\DatabaseNotificationCollection;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

/**
 * @property-read DatabaseNotificationCollection<int, DatabaseNotification> $unreadNotifications
 */
class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, MustVerifyEmailTrait, Notifiable, HasRoles;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'telefone',
        'profile_pic',
        'setor_id',
    ];

    /**
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * @return BelongsTo<Setor, $this>
     */
    public function setor(): BelongsTo
    {
        return $this->belongsTo(Setor::class);
    }

    /**
     * @return HasMany<Agenda, $this>
     */
    public function agendas(): HasMany
    {
        return $this->hasMany(Agenda::class);
    }

    /**
     * @return HasMany<Reserva, $this>
     */
    public function reservas(): HasMany
    {
        return $this->hasMany(Reserva::class);
    }

    /**
     * @return BelongsToMany<Espaco, $this>
     */
    public function favoritos(): BelongsToMany
    {
        return $this->belongsToMany(Espaco::class, 'espaco_user', 'user_id', 'espaco_id');
    }

    /**
     * Returns horarios evaluated by this user (where user_id is the evaluator).
     *
     * @return HasMany<Horario, $this>
     */
    public function horariosAvaliados(): HasMany
    {
        return $this->hasMany(Horario::class, 'user_id');
    }

    /**
     * Returns the private broadcast channel name for this user's notifications.
     */
    public function receivesBroadcastNotificationsOn(): string
    {
        return 'App.Models.User.'.$this->getKey();
    }
}
