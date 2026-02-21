<?php

namespace App\Notifications;

use App\Models\Reserva;
use App\Models\User;
use Illuminate\Notifications\Messages\BroadcastMessage;

class ReservationUpdateFailedNotification extends BaseNotification
{
    public Reserva $reserva;
    public User $user;

    public function __construct(Reserva $reserva, User $user)
    {
        parent::__construct(
            'Falha ao Atualizar Reserva',
            "Ocorreu um erro ao processar a atualização da sua reserva '{$reserva->titulo}'. Por favor, tente novamente.",
            route('reservas.edit', $reserva->id)
        );
        $this->reserva = $reserva;
        $this->user = $user;
    }

    public function toMail(object $notifiable): \Illuminate\Notifications\Messages\MailMessage
    {
        return (new \Illuminate\Notifications\Messages\MailMessage)
            ->subject('Falha ao Atualizar Reserva: ' . $this->reserva->titulo)
            ->view('emails.reservations.reservation_failed', ['reservationTitle' => $this->reserva->titulo, 'user' => $this->user, 'url' => $this->url]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'reserva_id' => $this->reserva->id,
            'reserva_titulo' => $this->reserva->titulo,
            'user_id' => $this->user->id,
            'user_name' => $this->user->name,
            'message' => $this->descricao,
            'url' => $this->url,
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'reserva_id' => $this->reserva->id,
            'reserva_titulo' => $this->reserva->titulo,
            'user_id' => $this->user->id,
            'user_name' => $this->user->name,
            'message' => $this->descricao,
            'url' => $this->url,
        ]);
    }
}
