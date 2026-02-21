<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\BroadcastMessage;
use App\Notifications\BaseNotification;

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
    public function toArray(object $notifiable): array
    {
        return [
            'solicitacao_id' => $this->solicitacao->id,
            'usuario_nome' => $this->solicitacao->user->name, // Supondo que a solicitação tem um usuário
            'mensagem' => $this->descricao,
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'solicitacao_id' => $this->solicitacao->id,
            'usuario_nome' => $this->solicitacao->user->name,
            'mensagem' => $this->descricao,
            'url' => $this->url,
        ]);
    }
}
