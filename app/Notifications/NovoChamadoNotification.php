<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\Chamado;
use App\Models\Espaco;
use Illuminate\Notifications\Messages\MailMessage;

class NovoChamadoNotification extends BaseNotification
{
    public Chamado $chamado;

    public function __construct(Chamado $chamado)
    {
        $alvo = $chamado->reportable;
        $espaco = $alvo instanceof Espaco ? $alvo->nome : 'um espaço sob sua gestão';

        parent::__construct(
            'Novo Chamado Aberto',
            sprintf(
                '%s de %s foi reportado em %s.',
                $chamado->tipo->nome,
                mb_strtolower($chamado->categoria->nome),
                $espaco
            ),
            route('gestor.chamados.index')
        );

        $this->chamado = $chamado;
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $alvo = $this->chamado->reportable;

        return (new MailMessage)
            ->subject('Novo chamado: '.$this->chamado->tipo->nome.' — '.$this->chamado->categoria->nome)
            ->view('emails.chamados.novo_chamado', [
                'chamado' => $this->chamado,
                'espaco' => $alvo instanceof Espaco ? $alvo : null,
                'tipo' => $this->chamado->tipo?->nome,
                'categoria' => $this->chamado->categoria?->nome,
                'url' => $this->url,
            ]);
    }
}
