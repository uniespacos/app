<?php

namespace App\Notifications;

use App\Models\Reserva;
use App\Models\User;
use Illuminate\Notifications\Messages\BroadcastMessage;

class ReservationCanceledNotification extends BaseNotification
{
    public Reserva $reserva;
    public User $canceler;

    public function __construct(Reserva $reserva, User $canceler)
    {
        parent::__construct(
            'Reserva Cancelada',
            'O usuário ' . $canceler->name . ' cancelou a reserva "' . $reserva->titulo . '".',
            route('gestor.reservas.index')
        );
        $this->reserva = $reserva;
        $this->canceler = $canceler;
    }

    public function toMail(object $notifiable): \Illuminate\Notifications\Messages\MailMessage
    {
        return (new \Illuminate\Notifications\Messages\MailMessage)
            ->subject('Reserva Cancelada: ' . $this->reserva->titulo)
            ->view('emails.reservations.reservation_canceled', ['reserva' => $this->reserva, 'canceler' => $this->canceler, 'url' => $this->url]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'reserva_id' => $this->reserva->id,
            'reserva_titulo' => $this->reserva->titulo,
            'canceler_id' => $this->canceler->id,
            'canceler_name' => $this->canceler->name,
            'message' => $this->descricao,
            'url' => $this->url,
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'reserva_id' => $this->reserva->id,
            'reserva_titulo' => $this->reserva->titulo,
            'canceler_id' => $this->canceler->id,
            'canceler_name' => $this->canceler->name,
            'message' => $this->descricao,
            'url' => $this->url,
        ]);
    }
}
