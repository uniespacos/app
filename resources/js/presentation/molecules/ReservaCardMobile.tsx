import { Button } from '@/components/ui/button';
import { ESTILO_SITUACAO } from '@/constants/situacao-reserva';
import { formatDate } from '@/lib/utils';
import { SituacaoBadge } from '@/presentation/atoms/SituacaoBadge';
import { Reserva } from '@/types';
import { Calendar, Edit, FileText, MapPin, XCircle } from 'lucide-react';

type ReservaCardMobileProps = {
    reserva: Reserva;
    isGestor: boolean;
    onDetalhes: (reserva: Reserva) => void;
    onAvaliar: (id: number) => void;
    onEditar: (id: number) => void;
    onCancelar: (reserva: Reserva) => void;
};

/**
 * A tabela de reservas tem 5 colunas; no celular só Título sobra visível
 * (Local/Período/Situação já são `hidden md:table-cell`), e a coluna Ações
 * com 2-3 botões de texto completo empurra a linha para rolagem lateral
 * dentro da tabela. Um card por reserva resolve porque cada informação ganha
 * sua própria linha em vez de disputar largura de coluna.
 *
 * A faixa colorida no topo repete o token `solido` de ESTILO_SITUACAO (o
 * mesmo já usado no badge) — dá pra reconhecer a situação num relance, antes
 * mesmo de ler o texto do badge.
 */
export function ReservaCardMobile({ reserva, isGestor, onDetalhes, onAvaliar, onEditar, onCancelar }: ReservaCardMobileProps) {
    const estilo = ESTILO_SITUACAO[reserva.situacao];
    const espaco = reserva.horarios[0]?.agenda?.espaco;
    const local = [espaco?.nome, espaco?.andar?.modulo?.nome, espaco?.andar?.nome].filter(Boolean).join(' - ');

    return (
        <div className="bg-card overflow-hidden rounded-lg border">
            {estilo && <div className={estilo.solido + ' h-1'} />}
            <div className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                    <p className="text-foreground min-w-0 truncate font-medium" title={reserva.titulo}>
                        {reserva.titulo}
                    </p>
                    <SituacaoBadge situacao={reserva.situacao} className="shrink-0" />
                </div>

                <div className="text-muted-foreground space-y-1.5 text-sm">
                    <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{local || 'Local não informado'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        <span>
                            {formatDate(reserva.data_inicial)} à {formatDate(reserva.data_final)}
                        </span>
                    </div>
                </div>

                <div className="flex gap-2 border-t pt-3">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => onDetalhes(reserva)}>
                        <FileText className="mr-1.5 h-4 w-4" />
                        Detalhes
                    </Button>

                    {reserva.situacao !== 'inativa' &&
                        (isGestor ? (
                            <Button variant="outline" size="sm" className="flex-1" onClick={() => onAvaliar(reserva.id)}>
                                <Edit className="mr-1.5 h-4 w-4" />
                                {reserva.situacao === 'em_analise' ? 'Avaliar' : 'Reavaliar'}
                            </Button>
                        ) : (
                            <>
                                {reserva.can_update && (
                                    <Button variant="outline" size="sm" className="flex-1" onClick={() => onEditar(reserva.id)}>
                                        <Edit className="mr-1.5 h-4 w-4" />
                                        Editar
                                    </Button>
                                )}
                                <Button variant="destructive" size="sm" className="flex-1" onClick={() => onCancelar(reserva)}>
                                    <XCircle className="mr-1.5 h-4 w-4" />
                                    Cancelar
                                </Button>
                            </>
                        ))}
                </div>
            </div>
        </div>
    );
}
