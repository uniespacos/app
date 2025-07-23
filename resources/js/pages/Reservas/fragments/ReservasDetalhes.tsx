import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AgendaGestoresPorTurnoType, AgendaSlotsPorTurnoType, Horario, Reserva, SlotCalendario } from "@/types";
import { CalendarDays, Clock, Edit, FileText, Home, User, XCircle } from "lucide-react";
import { SituacaoIndicator } from "./ReservasList";
import { Separator } from "@/components/ui/separator";
import { formatDate, identificarTurno } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { router } from "@inertiajs/react";
import { addDays, format, isSameDay, startOfWeek } from "date-fns";
import { useCallback, useMemo } from "react";
import AgendaDetalhesReserva from "./AgendaDetalhesReserva";

type ReservaDetalhesProps = {
    selectedReserva: Reserva; // Defina o tipo correto para a reserva
    setSelectedReserva: (reserva: Reserva | undefined) => void; // Função para fechar
    isGestor?: boolean; // Se o usuário é um gestor
    setRemoverReserva: (selectedReserva: Reserva) => void; // Função para remover a reserva
};


export default function ReservaDetalhes({ selectedReserva, setSelectedReserva, isGestor, setRemoverReserva }: ReservaDetalhesProps) {
    const agendas = selectedReserva.horarios.map((horario) => horario.agenda).reduce((acc, agenda) => {
        return acc.find(item => item?.id === agenda?.id) ? acc : [...acc, agenda]; // Remove duplicatas
    }, [] as (typeof selectedReserva.horarios[0]['agenda'])[]);
    const { gestoresPorTurno, horariosReservadosMap } = useMemo(() => {
        const gestores: AgendaGestoresPorTurnoType = {};
        const reservadosMap = new Map<string, { horario: Horario; autor: string; reserva_titulo: string }>();

        agendas?.forEach((agenda) => {
            if (agenda?.user) {
                gestores[agenda.turno] = {
                    nome: agenda.user.name,
                    email: agenda.user.email,
                    departamento: agenda.user.setor?.nome ?? 'N/I',
                    agenda_id: agenda.id,
                };
            }
            agenda?.horarios?.forEach((horario) => {

                const reservaValida = horario.reservas?.find((r) => ['deferida', 'parcialmente_deferida'].includes(r.situacao));
                if (reservaValida) {
                    const chave = `${horario.data}|${horario.horario_inicio}`;
                    reservadosMap.set(chave, {
                        horario: horario,
                        autor: reservaValida.user?.name ?? 'Indefinido',
                        reserva_titulo: reservaValida.titulo,
                    });
                }
            });
        });
        return { gestoresPorTurno: gestores, horariosReservadosMap: reservadosMap };
    }, [agendas]);

    const gerarSlotsParaSemana = useCallback((semanaInicio: Date) => {
        const slotsGerados: SlotCalendario[] = [];
        for (let diaOffset = 0; diaOffset < 7; diaOffset++) {
            const diaAtual = addDays(semanaInicio, diaOffset);
            const diaFormatado = format(diaAtual, 'yyyy-MM-dd');
            const slotStatus = (situacao: 'em_analise' | 'indeferida' | 'deferida' | 'inativa') => {
                console.log('slotStatus', situacao);
                switch (situacao) {
                    case 'deferida':
                        return 'deferida';
                    case 'em_analise':
                        return 'solicitado';
                    case 'indeferida':
                        return 'indeferida';
                    default:
                        return 'livre';
                }
            }
            for (let hora = 7; hora < 22; hora++) {
                const turno = identificarTurno(hora);
                const inicio = `${String(hora).padStart(2, '0')}:00:00`;
                const chave = `${diaFormatado}|${inicio}`;
                const horarioReservado = horariosReservadosMap.get(chave);
                if (horarioReservado) {
                    const reservaStatus = selectedReserva?.horarios.find(h => h.id === horarioReservado.horario.id);
                    const status = reservaStatus ? slotStatus(reservaStatus.pivot?.situacao ?? 'em_analise') : 'reservado';
                    slotsGerados.push({
                        id: chave,
                        status: status,
                        data: diaAtual,
                        horario_inicio: inicio,
                        horario_fim: `${String(hora).padStart(2, '0')}:50:00`,
                        dadosReserva: {
                            horarioDB: horarioReservado.horario,
                            autor: horarioReservado.autor,
                            reserva_titulo: horarioReservado.reserva_titulo,
                        },
                    });
                } else if (gestoresPorTurno[turno]) {
                    const status = selectedReserva?.horarios.some(h => h.horario_inicio === inicio && isSameDay(h.data, diaAtual) && h.agenda?.id === gestoresPorTurno[turno].agenda_id)
                        ? slotStatus(selectedReserva.horarios?.find(h => h.horario_inicio === inicio && isSameDay(h.data, diaAtual))?.pivot?.situacao ?? 'em_analise') : 'livre';
                    slotsGerados.push({
                        id: chave,
                        status: status,
                        data: diaAtual,
                        horario_inicio: inicio,
                        horario_fim: `${String(hora).padStart(2, '0')}:50:00`,
                        agenda_id: gestoresPorTurno[turno].agenda_id,
                    });
                }
            }
        }
        return slotsGerados;
    }, [gestoresPorTurno, horariosReservadosMap, selectedReserva?.horarios]);

    const todosSlots = useMemo<SlotCalendario[]>(
        () => gerarSlotsParaSemana(startOfWeek(new Date(), { weekStartsOn: 1 })), [gerarSlotsParaSemana]);



    const slotsPorTurno = useMemo(() => {
        // Primeiro, agrupa todos os slots por hora (07:00, 08:00, etc.), como na lógica original.
        const slotsPorHora: Record<string, SlotCalendario[]> = {};
        for (let hora = 7; hora < 22; hora++) {
            const horaFormatada = `${String(hora).padStart(2, '0')}:00`;
            slotsPorHora[horaFormatada] = todosSlots.filter((slot) => slot.horario_inicio.startsWith(horaFormatada));
        }

        // Depois, distribui essas horas nos seus respectivos turnos.
        const resultado: AgendaSlotsPorTurnoType = {
            manha: {},
            tarde: {},
            noite: {},
        };

        Object.entries(slotsPorHora).forEach(([hora, slotsDaHora]) => {
            const horaNum = parseInt(hora.split(':')[0], 10);
            const turno = identificarTurno(horaNum);
            if (slotsDaHora.length > 0) {
                // Só adiciona a linha se houver slots
                resultado[turno][hora] = slotsDaHora;
            }
        });

        return resultado;
    }, [todosSlots]);

    return (<Dialog
        open={!!selectedReserva}
        onOpenChange={(isOpen) => {
            if (!isOpen) {
                setSelectedReserva(undefined); // Fecha o dialog limpando o estado
            }
        }}
    >
        <DialogContent className="max-h-[90vh] min-w-[100vh] overflow-auto">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {selectedReserva.titulo}
                </DialogTitle>
                <DialogDescription className="flex-col justify-between">
                    <div className="flex items-center gap-2 p-1">
                        <User className="h-4 w-4" />
                        Solicitado por: {selectedReserva.user?.name}
                    </div>
                    <div className="flex items-center gap-2 p-1">
                        <Home className="h-4 w-4" />
                        Espaço: {selectedReserva.horarios[0]?.agenda?.espaco?.nome ?? ' '}
                    </div>
                    <div className="flex items-center gap-2 p-1">
                        <SituacaoIndicator situacao={selectedReserva.situacao} />
                    </div>
                </DialogDescription>
            </DialogHeader>
            <div>
                <h4 className="mb-2 font-medium text-gray-900">Descrição</h4>
                <p className="rounded-lg bg-gray-50 p-3 text-gray-700">{selectedReserva.descricao}</p>
            </div>

            <Separator />
            <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-gray-500" />
                    <div>
                        <p className="text-sm text-gray-500">Período</p>
                        <p className="font-medium">
                            {formatDate(selectedReserva.data_inicial)} até {formatDate(selectedReserva.data_final)}
                        </p>
                    </div>
                </div>
            </div>
            <Separator />

            <Separator />

            <div>
                <h4 className="mb-3 flex items-center gap-2 font-medium text-gray-900">
                    <Clock className="h-4 w-4" />
                    Horários Solicitados
                </h4>
                    <AgendaDetalhesReserva diasSemana={[]} slotsPorTurno={slotsPorTurno} reservaSolicitada={selectedReserva} />
                
            </div>

            <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedReserva(undefined)}>
                    Fechar
                </Button>
                {isGestor ? (
                    <div>
                        <Button
                            variant="outline"
                            onClick={() => {
                                router.get(`/gestor/reservas/${selectedReserva.id}`);
                            }}
                        >
                            <Edit className="mr-1 h-4 w-4" />
                            Avaliar
                        </Button>
                    </div>
                ) : (
                    <div>
                        {selectedReserva.situacao === 'em_analise' && (
                            <Button variant="outline" onClick={() => router.get(route('reservas.edit', selectedReserva.id))}>
                                <Edit className="mr-1 h-4 w-4" />
                                Editar
                            </Button>
                        )}
                        <Button variant="destructive" onClick={() => setRemoverReserva(selectedReserva)}>
                            <XCircle className="mr-1 h-4 w-4" />
                            Cancelar
                        </Button>
                    </div>
                )}
            </DialogFooter>
        </DialogContent>
    </Dialog>)
}