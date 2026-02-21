<?php

namespace App\Notifications;

use App\Models\Setor;
use App\Models\User;
use Illuminate\Notifications\Messages\BroadcastMessage;

class SectorUpdatedNotification extends BaseNotification
{
    public Setor $setor;
    public User $user;

    public function __construct(Setor $setor, User $user)
    {
        parent::__construct(
            'Setor Atualizado',
            'O setor ' . $setor->nome . ' foi atualizado.',
            route('institucional.setors.show', $setor->id)
        );
        $this->setor = $setor;
        $this->user = $user;
    }

    public function toMail(object $notifiable): \Illuminate\Notifications\Messages\MailMessage
    {
        return (new \Illuminate\Notifications\Messages\MailMessage)
            ->subject('Setor Atualizado: ' . $this->setor->nome)
            ->view('emails.users.sector_updated', ['setor' => $this->setor, 'user' => $this->user, 'url' => $this->url]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'setor_id' => $this->setor->id,
            'setor_name' => $this->setor->nome,
            'user_id' => $this->user->id,
            'user_name' => $this->user->name,
            'message' => $this->descricao,
            'url' => $this->url,
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'setor_id' => $this->setor->id,
            'setor_name' => $this->setor->nome,
            'user_id' => $this->user->id,
            'user_name' => $this->user->name,
            'message' => $this->descricao,
            'url' => $this->url,
        ]);
    }
}
