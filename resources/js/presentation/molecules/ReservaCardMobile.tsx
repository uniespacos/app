import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { LocalReserva } from '@/presentation/molecules/LocalReserva';
import { SituacaoBadge } from '@/presentation/atoms/SituacaoBadge';
import { Reserva } from '@/types';
import { Edit, FileText, XCircle } from 'lucide-react';

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
 */
export function ReservaCardMobile({ reserva, isGestor, onDetalhes, onAvaliar, onEditar, onCancelar }: ReservaCardMobileProps) {
    return (
        <div className="space-y-2 rounded-lg border p-3">
            <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-foreground">
                    {reserva.titulo.substring(0, 30)}
                    {reserva.titulo.length > 30 ? '...' : ''}
                </p>
                <SituacaoBadge situacao={reserva.situacao} />
            </div>

            <LocalReserva espaco={reserva.horarios[0]?.agenda?.espaco} />

            <p className="text-muted-foreground text-sm">
                {formatDate(reserva.data_inicial)} à {formatDate(reserva.data_final)}
            </p>

            <div className="flex flex-wrap justify-end gap-2 pt-1">
                <Button variant="outline" size="sm" onClick={() => onDetalhes(reserva)}>
                    <FileText className="mr-1 h-4 w-4" />
                    Detalhes
                </Button>

                {reserva.situacao !== 'inativa' &&
                    (isGestor ? (
                        <Button variant="outline" size="sm" onClick={() => onAvaliar(reserva.id)}>
                            <Edit className="mr-1 h-4 w-4" />
                            {reserva.situacao === 'em_analise' ? 'Avaliar' : 'Reavaliar'}
                        </Button>
                    ) : (
                        <>
                            {reserva.can_update && (
                                <Button variant="outline" size="sm" onClick={() => onEditar(reserva.id)}>
                                    <Edit className="mr-1 h-4 w-4" />
                                    Editar
                                </Button>
                            )}
                            <Button variant="destructive" size="sm" onClick={() => onCancelar(reserva)}>
                                <XCircle className="mr-1 h-4 w-4" />
                                Cancelar
                            </Button>
                        </>
                    ))}
            </div>
        </div>
    );
}
