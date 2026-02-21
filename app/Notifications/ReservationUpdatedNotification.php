<?php

namespace App\Notifications;

use App\Models\Reserva;
use Illuminate\Notifications\Messages\BroadcastMessage;

class ReservationUpdatedNotification extends BaseNotification
{
    public Reserva $reserva;

    public function __construct(Reserva $reserva)
    {
        parent::__construct(
            'Reserva Atualizada',
            "Sua reserva '{$reserva->titulo}' foi atualizada com sucesso.",
            route('reservas.show', $reserva->id)
        );
        $this->reserva = $reserva;
    }

    public function toMail(object $notifiable): \Illuminate\Notifications\Messages\MailMessage
    {
        return (new \Illuminate\Notifications\Messages\MailMessage)
            ->subject('Reserva Atualizada: ' . $this->reserva->titulo)
            ->view('emails.reservations.reservation_updated', ['reserva' => $this->reserva, 'url' => $this->url]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'reserva_id' => $this->reserva->id,
            'reserva_titulo' => $this->reserva->titulo,
            'message' => $this->descricao,
            'url' => $this->url,
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'reserva_id' => $this->reserva->id,
            'reserva_titulo' => $this->reserva->titulo,
            'message' => $this->descricao,
            'url' => $this->url,
        ]);
    }
}
