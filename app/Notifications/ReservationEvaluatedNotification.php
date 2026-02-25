<?php

namespace App\Notifications;

use App\Models\Reserva;
use Illuminate\Notifications\Messages\MailMessage;

class ReservationEvaluatedNotification extends BaseNotification
{
    public Reserva $reserva;

    public string $statusAvaliacao;

    public function __construct(Reserva $reserva, string $statusAvaliacao)
    {
        parent::__construct(
            'Reserva Avaliada',
            "Sua reserva para '{$reserva->nome}' foi {$statusAvaliacao}.",
            route('reservas.show', $reserva->id)
        );
        $this->reserva = $reserva;
        $this->statusAvaliacao = $statusAvaliacao;
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Reserva Avaliada: '.$this->reserva->nome)
            ->view('emails.reservations.reservation_evaluated', ['reserva' => $this->reserva, 'statusAvaliacao' => $this->statusAvaliacao, 'url' => $this->url]);
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
}
