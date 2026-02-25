<?php

namespace App\Notifications;

use App\Models\Setor;
use App\Models\User;

class SectorUpdatedNotification extends BaseNotification
{
    public Setor $setor;

    public User $user;

    public function __construct(Setor $setor, User $user)
    {
        parent::__construct(
            'Setor Atualizado',
            'O setor '.$setor->nome.' foi atualizado.',
            route('institucional.setors.show', $setor->id)
        );
        $this->setor = $setor;
        $this->user = $user;
    }

    public function toMail(object $notifiable): \Illuminate\Notifications\Messages\MailMessage
    {
        return (new \Illuminate\Notifications\Messages\MailMessage)
            ->subject('Setor Atualizado: '.$this->setor->nome)
            ->view('emails.users.sector_updated', ['setor' => $this->setor, 'user' => $this->user, 'url' => $this->url]);
    }
}
