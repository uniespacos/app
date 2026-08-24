import { mapearStatusBackendParaSlot } from '@/application/reservas/helpers/reserva-status.helpers';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { diasDaSemana, formatDate } from '@/lib/utils';
import { SituacaoIndicator } from '@/presentation/atoms/SituacaoIndicator';
import AgendaNavegacao from '@/presentation/molecules/AgendaNavegacao';
import AvaliacaoGestoresResumo from '@/presentation/molecules/AvaliacaoGestoresResumo';
import CalendarReservationDetails from '@/presentation/molecules/CalendarReservationDetails';
import { Modal } from '@/presentation/molecules/Modal';
import { Agenda, Reserva, SlotCalendario } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { addDays, endOfWeek, format, isAfter, isBefore, parseISO, startOfWeek, subDays } from 'date-fns';
import { CalendarDays, Clock, Edit, ExternalLink, FileText, Home, Loader2, User, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';

interface ReservaDetalhesProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    selectedReserva: Reserva;
    isGestor?: boolean;
    setRemoverReserva: (selectedReserva: Reserva) => void;
    routeName: string;
}

export default function ReservaDetalhes({ isOpen, onOpenChange, selectedReserva, isGestor, setRemoverReserva, routeName }: ReservaDetalhesProps) {
    const { semana } = usePage<{ semana?: { referencia: string } }>().props;

    const [isLoading, setIsLoading] = useState(false);

    const [semanaVisivel, setSemanaVisivel] = useState(semana?.referencia ? parseISO(semana.referencia) : new Date());

    const slotsSelecao = useMemo<SlotCalendario[]>(() => {
        return selectedReserva.horarios.map((horario) => ({
            id: `${horario.data}|${horario.horario_inicio}`,
            status: mapearStatusBackendParaSlot(horario.situacao),
            data: parseISO(horario.data + 'T12:00:00'),
            horario_inicio: horario.horario_inicio,
            horario_fim: horario.horario_fim,
            agenda_id: horario.agenda?.id,
            dadosReserva: { horarioDB: horario, autor: selectedReserva.user?.name ?? '', reserva_titulo: selectedReserva.titulo },
            isShowReservation: true,
        }));
    }, [selectedReserva.horarios, selectedReserva.user, selectedReserva.titulo]);

    const agendas = useMemo(
        () =>
            selectedReserva.horarios
                .map((horario) => horario.agenda)
                .filter((agenda): agenda is Agenda => agenda !== undefined)
                .reduce((acc: Agenda[], agenda) => (acc.find((item) => item.id === agenda.id) ? acc : [...acc, agenda]), []),
        [selectedReserva.horarios],
    );

    const justificativaReserva = selectedReserva.horarios.find((horario) => horario.situacao === 'indeferida')?.justificativa;
    const espaco = selectedReserva.horarios[0]?.agenda?.espaco;

    const navegarParaSemana = (novaData: Date) => {
        setSemanaVisivel(novaData);
        const params = {
            reserva: selectedReserva.id,
            semana: format(novaData, 'yyyy-MM-dd'),
        };
        router.get(route(routeName), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onStart: () => {
                setIsLoading(true);
            },
            onFinish: () => {
                setIsLoading(false);
            },
            only: ['reservaToShow', 'semana'],
        });
    };

    const handleSemanaAnterior = () => {
        navegarParaSemana(subDays(semanaVisivel, 7));
    };
    const handleProximaSemana = () => {
        navegarParaSemana(addDays(semanaVisivel, 7));
    };

    const dataInicialReserva = useMemo(() => new Date(selectedReserva.data_inicial), [selectedReserva.data_inicial]);
    const dataFinalReserva = useMemo(() => new Date(selectedReserva.data_final), [selectedReserva.data_final]);
    const podeVoltar = useMemo(
        () => isAfter(startOfWeek(semanaVisivel, { weekStartsOn: 1 }), dataInicialReserva),
        [dataInicialReserva, semanaVisivel],
    );
    const podeAvancar = useMemo(() => isBefore(endOfWeek(semanaVisivel, { weekStartsOn: 1 }), dataFinalReserva), [dataFinalReserva, semanaVisivel]);

    return (
        <Modal
            open={isOpen}
            onOpenChange={onOpenChange}
            size="xl"
            className="max-h-[90vh] overflow-y-auto sm:max-w-[80vw]"
            title={
                <span className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {selectedReserva.titulo}
                </span>
            }
            description={
                <span className="flex flex-col justify-between">
                    <span className="flex items-center gap-2 p-1">
                        <User className="h-4 w-4" />
                        Solicitado por: {selectedReserva.user?.name}
                    </span>
                    <span className="flex items-center gap-2 p-1">
                        <Home className="h-4 w-4" />
                        Espaço: {espaco?.nome ?? ' '}
                        {espaco && (
                            <Button
                                variant="link"
                                size="sm"
                                className="h-auto p-0 text-xs"
                                onClick={() => {
                                    router.get(route('espacos.show', espaco.id));
                                }}
                            >
                                Ver agenda do espaço <ExternalLink className="ml-1 h-3 w-3" />
                            </Button>
                        )}
                    </span>
                    <span className="flex items-center gap-2 p-1">
                        <SituacaoIndicator situacao={selectedReserva.situacao} />
                    </span>
                </span>
            }
            footer={
                isGestor ? (
                    <Button
                        variant="outline"
                        onClick={() => {
                            router.get(`/gestor/reservas/${selectedReserva.id}`);
                        }}
                    >
                        <Edit className="mr-1 h-4 w-4" /> Avaliar
                    </Button>
                ) : (
                    <div className="flex gap-2">
                        {selectedReserva.can_update && (
                            <Button
                                variant="outline"
                                onClick={() => {
                                    router.get(route('reservas.edit', selectedReserva.id));
                                }}
                            >
                                <Edit className="mr-1 h-4 w-4" /> Editar
                            </Button>
                        )}
                        <Button
                            variant="destructive"
                            onClick={() => {
                                setRemoverReserva(selectedReserva);
                            }}
                        >
                            <XCircle className="mr-1 h-4 w-4" /> Cancelar
                        </Button>
                    </div>
                )
            }
        >
            <span>
                <h4 className="text-foreground mb-2 font-medium">Descrição</h4>
                <p className="bg-muted/50 text-foreground rounded-lg p-3">{selectedReserva.descricao}</p>
            </span>
            <Separator />
            <div className="flex items-center gap-2">
                <CalendarDays className="text-muted-foreground h-4 w-4" />
                <div>
                    <p className="text-muted-foreground text-sm">Período Total da Reserva</p>
                    <p className="font-medium">
                        {formatDate(selectedReserva.data_inicial)} até {formatDate(selectedReserva.data_final)}
                    </p>
                </div>
            </div>
            <Separator />
            <div className="mb-4 space-y-4">
                <h4 className="text-foreground flex items-center gap-2 font-medium">
                    <Clock className="h-4 w-4" />
                    Horários Solicitados
                </h4>

                <div className="relative mb-4 space-y-4">
                    <AgendaNavegacao
                        semanaAtual={semanaVisivel}
                        onAnterior={handleSemanaAnterior}
                        onProxima={handleProximaSemana}
                        desabilitarAnterior={!podeVoltar}
                        desabilitarProxima={!podeAvancar}
                    />
                    <CalendarReservationDetails
                        agendas={agendas}
                        diasSemana={diasDaSemana(semanaVisivel, new Date())}
                        slotsSolicitados={slotsSelecao}
                    />
                    {isLoading && (
                        <div className="bg-background/70 absolute inset-0 flex items-center justify-center rounded-md backdrop-blur-sm">
                            <Loader2 className="text-primary h-8 w-8 animate-spin" />
                        </div>
                    )}
                </div>
            </div>

            <Separator />
            <AvaliacaoGestoresResumo horarios={selectedReserva.horarios} />

            <Separator />
            {justificativaReserva && (
                <div>
                    <h4 className="text-destructive mb-2 font-medium">Justificativa do indeferimento</h4>
                    <p className="bg-destructive-subtle text-destructive rounded-lg p-3">{justificativaReserva}</p>
                    <Separator className="mt-10" />
                </div>
            )}
            {selectedReserva.observacao && (
                <div>
                    <h4 className="text-info-accent mb-2 font-medium">Observação</h4>
                    <p className="bg-info-subtle text-info-accent rounded-lg p-3">{selectedReserva.observacao}</p>
                    <Separator className="mt-5" />
                </div>
            )}
        </Modal>
    );
}
