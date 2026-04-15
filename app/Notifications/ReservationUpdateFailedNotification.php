<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\Reserva;
use App\Models\User;
use Illuminate\Notifications\Messages\MailMessage;

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

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Falha ao Atualizar Reserva: '.$this->reserva->titulo)
            ->view('emails.reservations.reservation_failed', [
                'reservationTitle' => $this->reserva->titulo,
                'user' => $this->user,
                'url' => $this->url,
            ]);
    }
}
