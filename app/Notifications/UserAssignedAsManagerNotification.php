<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\User;
use Illuminate\Notifications\Messages\MailMessage;

class UserAssignedAsManagerNotification extends BaseNotification
{
    public User $manager;

    public ?string $espacoNome;

    public ?string $turno;

    public function __construct(User $manager, ?string $espacoNome = null, ?string $turno = null)
    {
        $message = 'Você foi designado como gestor de agenda.';
        $url = route('espacos.index');

        if ($espacoNome && $turno) {
            $message = 'Você foi designado como gestor do espaço: '.$espacoNome.' Turno: '.$turno.'.';
            $espaco = $manager->agendas->first()?->espaco;
            $url = $espaco ? route('espacos.show', $espaco->id) : route('espacos.index');
        }

        parent::__construct('Gestão de Espaços', $message, $url);

        $this->manager = $manager;
        $this->espacoNome = $espacoNome;
        $this->turno = $turno;
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Você foi designado como gestor de agenda.')
            ->view('emails.users.user_assigned_as_manager', [
                'manager' => $this->manager,
                'espacoNome' => $this->espacoNome,
                'turno' => $this->turno,
                'url' => $this->url,
            ]);
    }
}
