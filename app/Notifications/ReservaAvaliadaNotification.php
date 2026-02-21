<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\BroadcastMessage;
use App\Notifications\BaseNotification;

class ReservaAvaliadaNotification extends BaseNotification
{
    use Queueable;

    public $reserva;

    public $statusAvaliacao; // 'aprovada', 'parcialmente_aprovada', 'rejeitada'

    public function __construct($reserva, $statusAvaliacao)
    {
        parent::__construct(
            'Reserva Avaliada',
            "Sua reserva para '{$reserva->nome}' foi {$statusAvaliacao}.",
            route('reservas.index')
        );
        $this->reserva = $reserva;
        $this->statusAvaliacao = $statusAvaliacao;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    
    }
