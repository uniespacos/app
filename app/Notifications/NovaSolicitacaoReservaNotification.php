<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;

class NovaSolicitacaoReservaNotification extends BaseNotification
{
    use Queueable;

    public $solicitacao; // A solicitação de reserva

    public function __construct($solicitacao)
    {
        parent::__construct(
            'Nova Solicitação de Reserva',
            "Nova solicitação de reserva de '{$solicitacao->user->name}' para '{$solicitacao->nome}'.",
            route('gestor.reservas.index')
        );
        $this->solicitacao = $solicitacao;
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
