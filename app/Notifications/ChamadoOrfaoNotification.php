<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Enums\Chamado\CategoriaChamadoEnum;
use App\Models\Chamado;
use App\Models\Espaco;
use Illuminate\Notifications\Messages\MailMessage;

/**
 * Enviada ao pessoal institucional quando chega um chamado para um espaco
 * que nao tem gestor em nenhuma agenda. Sem isso o report ficaria invisivel.
 */
class ChamadoOrfaoNotification extends BaseNotification
{
    public Chamado $chamado;

    public function __construct(Chamado $chamado)
    {
        $alvo = $chamado->reportable;
        $espaco = $alvo instanceof Espaco ? $alvo->nome : 'um espaço';

        parent::__construct(
            'Chamado em Espaço sem Gestor',
            sprintf(
                'Um problema foi reportado em %s, que não tem gestor atribuído em nenhum turno.',
                $espaco
            ),
            route('institucional.chamados.index')
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
            ->subject('Chamado sem gestor responsável: '.($alvo instanceof Espaco ? $alvo->nome : 'espaço'))
            ->view('emails.chamados.chamado_orfao', [
                'chamado' => $this->chamado,
                'espaco' => $alvo instanceof Espaco ? $alvo : null,
                'categoria' => CategoriaChamadoEnum::labelDe($this->chamado->categoria),
                'url' => $this->url,
            ]);
    }
}
