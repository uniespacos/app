<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Enums\Chamado\StatusChamadoEnum;
use App\Models\Chamado;
use App\Models\Espaco;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Enviada ao reportante anonimo que deixou e-mail no formulario publico.
 *
 * Nao estende BaseNotification de proposito: o destinatario nao tem conta,
 * entao os canais 'database' e 'broadcast' nao se aplicam — e uma
 * on-demand notification, entregue apenas por e-mail.
 */
class ChamadoResolvidoNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Chamado $chamado,
    ) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $alvo = $this->chamado->reportable;

        return (new MailMessage)
            ->subject('Seu report foi '.mb_strtolower(StatusChamadoEnum::labelDe($this->chamado->status)))
            ->view('emails.chamados.chamado_resolvido', [
                'chamado' => $this->chamado,
                'espaco' => $alvo instanceof Espaco ? $alvo : null,
                'tipo' => $this->chamado->tipo?->nome,
                'categoria' => $this->chamado->categoria?->nome,
                'status' => StatusChamadoEnum::labelDe($this->chamado->status),
            ]);
    }
}
