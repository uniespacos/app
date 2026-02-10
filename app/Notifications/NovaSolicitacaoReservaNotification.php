<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NovaSolicitacaoReservaNotification extends Notification
{
    use Queueable;

    public $solicitacao; // A solicitação de reserva

    public function __construct($solicitacao)
    {
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
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->line('The introduction to the notification.')
            ->action('Notification Action', url('/'))
            ->line('Thank you for using our application!');
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
            'mensagem' => "Nova solicitação de reserva de '{$this->solicitacao->user->name}' para '{$this->solicitacao->nome}'.",
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'solicitacao_id' => $this->solicitacao->id,
            'usuario_nome' => $this->solicitacao->user->name,
            'mensagem' => "Nova solicitação de reserva de '{$this->solicitacao->user->name}' para '{$this->solicitacao->nome}'.",
            'url' => route('gestor.reservas.index'), // Exemplo de URL para o gestor
        ]);
    }
}
