<?php

namespace App\Notifications;

use App\Models\Reserva;
use Illuminate\Notifications\Messages\MailMessage;

class NewReservationNotification extends BaseNotification
{
    public Reserva $reserva;

    public function __construct(Reserva $reserva)
    {
        parent::__construct(
            'Nova Solicitação de Reserva',
            "Uma nova solicitação de reserva para '{$reserva->nome}' foi criada por '{$reserva->user->name}'.",
            route('gestor.reservas.show', $reserva->id)
        );
        $this->reserva = $reserva;
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Nova Solicitação de Reserva: '.$this->reserva->nome)
            ->view('emails.reservations.new_reservation', ['reserva' => $this->reserva, 'url' => $this->url]);
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
}
