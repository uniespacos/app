<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\User;
use Illuminate\Notifications\Messages\MailMessage;

class UserRemovedAsManagerNotification extends BaseNotification
{
    public User $user;

    public ?string $espacoNome;

    public ?string $turno;

    public function __construct(User $user, ?string $espacoNome = null, ?string $turno = null)
    {
        $message = 'Você foi removido como gestor de agenda.';

        if ($espacoNome && $turno) {
            $message = 'Você foi removido como gestor do espaço: '.$espacoNome.' Turno: '.$turno.'.';
        }

        parent::__construct('Gestão de Espaços', $message, route('espacos.index'));

        $this->user = $user;
        $this->espacoNome = $espacoNome;
        $this->turno = $turno;
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Você foi removido como gestor de agenda.')
            ->view('emails.users.user_removed_as_manager', [
                'user' => $this->user,
                'espacoNome' => $this->espacoNome,
                'turno' => $this->turno,
                'url' => $this->url,
            ]);
    }
}
