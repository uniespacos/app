<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ReservaAvaliadaNotification extends Notification
{
    use Queueable;

    public $reserva;

    public $statusAvaliacao; // 'aprovada', 'parcialmente_aprovada', 'rejeitada'

    public function __construct($reserva, $statusAvaliacao)
    {
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
        // Dados para serem salvos no banco de dados
        return [
            'reserva_id' => $this->reserva->id,
            'status_avaliacao' => $this->statusAvaliacao,
            'mensagem' => "Sua reserva para '{$this->reserva->nome}' foi {$this->statusAvaliacao}.",
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        // Dados para serem enviados via Pusher
        return new BroadcastMessage([
            'reserva_id' => $this->reserva->id,
            'status_avaliacao' => $this->statusAvaliacao,
            'mensagem' => "Sua reserva para '{$this->reserva->nome}' foi {$this->statusAvaliacao}.",
            'url' => route('reservas.index'), // Exemplo de URL
        ]);
    }
}
