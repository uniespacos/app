<?php

namespace App\Notifications;

use App\Models\Reserva;

class ReservationCreatedNotification extends BaseNotification
{
    public Reserva $reserva;

    public function __construct(Reserva $reserva)
    {
        parent::__construct(
            'Sua reserva foi criada!',
            'Sua solicitação de reserva para "'.$reserva->titulo.'" foi processada com sucesso.',
            route('reservas.show', $reserva->id)
        );
        $this->reserva = $reserva;
    }

    public function toMail(object $notifiable): \Illuminate\Notifications\Messages\MailMessage
    {
        return (new \Illuminate\Notifications\Messages\MailMessage)
            ->subject('Sua reserva foi criada!: '.$this->reserva->titulo)
            ->view('emails.reservations.reservation_created', ['reserva' => $this->reserva, 'url' => $this->url]);
    }
}
