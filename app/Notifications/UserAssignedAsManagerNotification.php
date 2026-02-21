<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Notifications\Messages\BroadcastMessage;

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
            $message = 'Você foi designado como gestor do espaço: ' . $espacoNome . ' Turno: ' . $turno . '.';
            $url = route('espacos.show', $manager->agendas->first()->espaco->id); // Assuming manager is assigned to at least one agenda with an associated space
        }

        parent::__construct(
            'Gestão de Espaços',
            $message,
            $url
        );

        $this->manager = $manager;
        $this->espacoNome = $espacoNome;
        $this->turno = $turno;
    }

    public function toMail(object $notifiable): \Illuminate\Notifications\Messages\MailMessage
    {
        return (new \Illuminate\Notifications\Messages\MailMessage)
            ->subject('Você foi designado como gestor de agenda.')
            ->view('emails.users.user_assigned_as_manager', ['manager' => $this->manager, 'espacoNome' => $this->espacoNome, 'turno' => $this->turno, 'url' => $this->url]);
    }

    }
