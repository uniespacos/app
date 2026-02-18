/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { diasDaSemana, formatDate } from '@/lib/utils';
import { Agenda, Horario, Reserva, SlotCalendario } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { DialogProps } from '@radix-ui/react-dialog';
import { addDays, endOfWeek, format, isAfter, isBefore, parseISO, startOfWeek, subDays } from 'date-fns';
import { CalendarDays, Clock, Edit, FileText, Home, Loader2, User, XCircle } from 'lucide-react'; // Adicionado Loader2
import { useMemo, useState } from 'react';
import AgendaNavegacao from '../Gestor/fragments/AgendaNavegacao';
import CalendarReservationDetails from './CalendarReservationDetails';
import { SituacaoIndicator } from './ReservasList';
type ReservaDetalhesProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    selectedReserva: Reserva;
    isGestor?: boolean;
    setRemoverReserva: (selectedReserva: Reserva) => void;
    routeName: string; // NOVO: Adicione esta prop
} & DialogProps;

export default function ReservaDetalhes({
    isOpen,
    onOpenChange,
    selectedReserva,
    isGestor,
    setRemoverReserva,
    routeName,
    ...props
}: ReservaDetalhesProps) {
    const { semana } = usePage().props as any;

    // NOVO: Estado para controlar o carregamento dos dados da semana
    const [isLoading, setIsLoading] = useState(false);

    // Este estado continua, mas agora não causará o "piscar"
    const [semanaVisivel, setSemanaVisivel] = useState(parseISO(semana.referencia));

    const slotsSelecao = useMemo<SlotCalendario[]>(() => {
        const mapearStatusHorarioParaSlot = (statusHorario: Horario['situacao']): SlotCalendario['status'] => {
            switch (statusHorario) {
                case 'em_analise':
                    return 'solicitado';
                case 'deferida':
                    return 'deferida';
                case 'indeferida':
                    return 'indeferida';
                case 'inativa':
                    return 'reservado';
                default:
                    return 'reservado';
            }
        };

        return selectedReserva.horarios.map((horario) => ({
            id: `${horario.data}|${horario.horario_inicio}`,
            status: mapearStatusHorarioParaSlot(horario.situacao),
            data: parseISO(horario.data + 'T12:00:00'),
            horario_inicio: horario.horario_inicio,
            horario_fim: horario.horario_fim,
            agenda_id: horario.agenda?.id,
            dadosReserva: { horarioDB: horario, autor: selectedReserva.user!.name, reserva_titulo: selectedReserva.titulo },
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

    // ALTERADO: A função de navegação agora controla o estado de loading
    const navegarParaSemana = (novaData: Date) => {
        setSemanaVisivel(novaData);
        const params = {
            reserva: selectedReserva.id,
            semana: format(novaData, 'yyyy-MM-dd'),
        };
        // AQUI ESTÁ A MUDANÇA: Usa a rota dinâmica vinda da prop
        router.get(route(routeName), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onStart: () => setIsLoading(true),
            onFinish: () => setIsLoading(false),
        });
    };

    const handleSemanaAnterior = () => navegarParaSemana(subDays(semanaVisivel, 7));
    const handleProximaSemana = () => navegarParaSemana(addDays(semanaVisivel, 7));

    const dataInicialReserva = useMemo(() => new Date(selectedReserva.data_inicial), [selectedReserva.data_inicial]);
    const dataFinalReserva = useMemo(() => new Date(selectedReserva.data_final), [selectedReserva.data_final]);
    const podeVoltar = useMemo(
        () => isAfter(startOfWeek(semanaVisivel, { weekStartsOn: 1 }), dataInicialReserva),
        [dataInicialReserva, semanaVisivel],
    );
    const podeAvancar = useMemo(() => isBefore(endOfWeek(semanaVisivel, { weekStartsOn: 1 }), dataFinalReserva), [dataFinalReserva, semanaVisivel]);

    return (
        <Dialog {...props} open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] min-w-[80vw] overflow-y-auto">
                {/* ... DialogHeader, Descrição, etc. ... */}
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {selectedReserva.titulo}
                    </DialogTitle>
                    <DialogDescription className="flex-col justify-between">
                        <span className="flex items-center gap-2 p-1">
                            <User className="h-4 w-4" />
                            Solicitado por: {selectedReserva.user?.name}
                        </span>
                        <span className="flex items-center gap-2 p-1">
                            <Home className="h-4 w-4" />
                            Espaço: {selectedReserva.horarios[0]?.agenda?.espaco?.nome ?? ' '}
                        </span>
                        <span className="flex items-center gap-2 p-1">
                            <SituacaoIndicator situacao={selectedReserva.situacao} />
                        </span>
                    </DialogDescription>
                </DialogHeader>
                <span>
                    <h4 className="mb-2 font-medium text-gray-900">Descrição</h4>
                    <p className="rounded-lg bg-gray-50 p-3 text-gray-700">{selectedReserva.descricao}</p>
                </span>
                <Separator />
                <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-gray-500" />
                    <div>
                        <p className="text-sm text-gray-500">Período Total da Reserva</p>
                        <p className="font-medium">
                            {formatDate(selectedReserva.data_inicial)} até {formatDate(selectedReserva.data_final)}
                        </p>
                    </div>
                </div>
                <Separator />
                <div className="mb-4 space-y-4">
                    <h4 className="flex items-center gap-2 font-medium text-gray-900">
                        <Clock className="h-4 w-4" />
                        Horários Solicitados
                    </h4>

                    {/* NOVO: Wrapper para o indicador de loading sobre o calendário */}
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
                            <div className="absolute inset-0 flex items-center justify-center rounded-md bg-white/70 backdrop-blur-sm">
                                <Loader2 className="text-primary h-8 w-8 animate-spin" />
                            </div>
                        )}
                    </div>
                </div>
                {/* ... Restante do Dialog (Justificativa, Footer, etc.) ... */}
                <Separator />
                {justificativaReserva && (
                    <div>
                        <h4 className="mb-2 font-medium text-red-900">Justificativa do indeferimento</h4>
                        <p className="rounded-lg bg-red-50 p-3 text-red-700">{justificativaReserva}</p>
                        <Separator className="mt-10" />
                    </div>
                )}
                {selectedReserva.observacao && (
                    <div>
                        <h4 className="mb-2 font-medium text-blue-900">Observação</h4>
                        <p className="rounded-lg bg-blue-50 p-3 text-blue-700">{selectedReserva.observacao}</p>
                        <Separator className="mt-5" />
                    </div>
                )}
                <DialogFooter>
                    {isGestor ? (
                        <Button variant="outline" onClick={() => router.get(`/gestor/reservas/${selectedReserva.id}`)}>
                            <Edit className="mr-1 h-4 w-4" /> Avaliar
                        </Button>
                    ) : (
                        <div className="flex gap-2">
                            {selectedReserva.situacao === 'em_analise' && (
                                <Button variant="outline" onClick={() => router.get(route('reservas.edit', selectedReserva.id))}>
                                    <Edit className="mr-1 h-4 w-4" /> Editar
                                </Button>
                            )}
                            <Button variant="destructive" onClick={() => setRemoverReserva(selectedReserva)}>
                                <XCircle className="mr-1 h-4 w-4" /> Cancelar
                            </Button>
                        </div>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
