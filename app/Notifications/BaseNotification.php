<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

abstract class BaseNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $titulo; // A solicitação de reserva

    public $descricao; // Descrição da solicitação

    public $url;

    public function __construct($titulo, $descricao, $url)
    {
        $this->titulo = $titulo; // Título da notificação
        $this->descricao = $descricao; // Descrição da notificação
        // A "mágica" da substituição
        $baseUrlCorreta = config('app.url'); // Pega a URL do .env (ex: http://192.168.1.105)
        $this->url = str_replace('http://localhost', $baseUrlCorreta, $url);
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        $channels = ['database', 'broadcast'];

        // Se a notificação estiver ligada a uma reserva
        if (property_exists($this, 'reserva') && $this->reserva instanceof \App\Models\Reserva) {

            // Verifica se o usuário sendo notificado é o solicitante da reserva
            $isApplicant = $this->reserva->user_id === $notifiable->id;

            // Busca os IDs dos gestores das agendas associadas a esta reserva
            $managerIds = \App\Models\Agenda::whereIn(
                'id',
                \App\Models\Horario::where('reserva_id', $this->reserva->id)->select('agenda_id')
            )->pluck('user_id')->unique();

            // Verifica se o solicitante é o ÚNICO gestor envolvido em todos os horários da reserva
            $isSoleManager = $managerIds->count() === 1 && $managerIds->first() === $notifiable->id;

            // Se um gestor cria uma reserva para a própria agenda,
            // suprime o e-mail, enviando apenas notificação interna (database/broadcast)
            if ($isApplicant && $isSoleManager) {
                return $channels;
            }
        }

        // Para os demais casos, envia também por e-mail
        $channels[] = 'mail';

        return $channels;
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->line($this->titulo)
            ->action('Notification Action', $this->url)
            ->line($this->descricao);
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'titulo' => $this->titulo,
            'descricao' => $this->descricao,
            'url' => $this->url,
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'titulo' => $this->titulo,
            'descricao' => $this->descricao,
            'url' => $this->url,
        ]);
    }
}
