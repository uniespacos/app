<?php

namespace App\Notifications;

use App\Models\User;

class ReservationFailedNotification extends BaseNotification
{
    public string $reservationTitle;

    public User $user;

    public function __construct(string $reservationTitle, User $user)
    {
        parent::__construct(
            'Falha na sua solicitação de reserva',
            'Houve um erro ao processar sua solicitação para "'.$reservationTitle.'". Por favor, tente novamente ou contate o suporte.',
            route('reservas.index')
        );
        $this->reservationTitle = $reservationTitle;
        $this->user = $user;
    }

    public function toMail(object $notifiable): \Illuminate\Notifications\Messages\MailMessage
    {
        return (new \Illuminate\Notifications\Messages\MailMessage)
            ->subject('Falha na sua solicitação de reserva: '.$this->reservationTitle)
            ->view('emails.reservations.reservation_failed', ['reservationTitle' => $this->reservationTitle, 'userName' => $this->user->name, 'url' => $this->url]);
    }
}
