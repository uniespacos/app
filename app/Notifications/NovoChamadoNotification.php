<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Enums\Chamado\CategoriaChamadoEnum;
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
                'Um problema de %s foi reportado em %s.',
                mb_strtolower(CategoriaChamadoEnum::labelDe($chamado->categoria)),
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
            ->subject('Novo chamado: '.CategoriaChamadoEnum::labelDe($this->chamado->categoria))
            ->view('emails.chamados.novo_chamado', [
                'chamado' => $this->chamado,
                'espaco' => $alvo instanceof Espaco ? $alvo : null,
                'categoria' => CategoriaChamadoEnum::labelDe($this->chamado->categoria),
                'url' => $this->url,
            ]);
    }
}
