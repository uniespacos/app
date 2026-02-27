<?php

namespace App\Notifications;

use App\Models\User;

class UserRemovedAsManagerNotification extends BaseNotification
{
    public User $user;

    public ?string $espacoNome;

    public ?string $turno;

    public function __construct(User $user, ?string $espacoNome = null, ?string $turno = null)
    {
        $message = 'Você foi removido como gestor de agenda.';
        $url = route('espacos.index');

        if ($espacoNome && $turno) {
            $message = 'Você foi removido como gestor do espaço: '.$espacoNome.' Turno: '.$turno.'.';
            $url = route('espacos.index'); // Or a more specific page if available
        }

        parent::__construct(
            'Gestão de Espaços',
            $message,
            $url
        );

        $this->user = $user;
        $this->espacoNome = $espacoNome;
        $this->turno = $turno;
    }

    public function toMail(object $notifiable): \Illuminate\Notifications\Messages\MailMessage
    {
        return (new \Illuminate\Notifications\Messages\MailMessage)
            ->subject('Você foi removido como gestor de agenda.')
            ->view('emails.users.user_removed_as_manager', ['user' => $this->user, 'espacoNome' => $this->espacoNome, 'turno' => $this->turno, 'url' => $this->url]);
    }
}
