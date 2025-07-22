import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AgendaGestoresPorTurnoType, AgendaSlotsPorTurnoType, Horario, Reserva, SlotCalendario } from "@/types";
import { CalendarDays, Clock, Edit, FileText, Home, User, XCircle } from "lucide-react";
import { SituacaoBadge, SituacaoIndicator } from "./ReservasList";
import { Separator } from "@/components/ui/separator";
import { diasSemanaParser, formatDate, identificarTurno } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { router } from "@inertiajs/react";
import { addDays, format, parse, startOfWeek } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import AgendaDetalhesReserva from "./AgendaDetalhesReserva";

type ReservaDetalhesProps = {
    selectedReserva: Reserva; // Defina o tipo correto para a reserva
    setSelectedReserva: (reserva: Reserva | undefined) => void; // Função para fechar
    isGestor?: boolean; // Se o usuário é um gestor
    setRemoverReserva: (selectedReserva: Reserva) => void; // Função para remover a reserva
};


export default function ReservaDetalhes({ selectedReserva, setSelectedReserva, isGestor, setRemoverReserva }: ReservaDetalhesProps) {
    console.log('selectedReserva', selectedReserva);
    const slotsIniciais = useMemo(
        () =>
            selectedReserva.horarios.map(
                (horario) =>
                    ({
                        id: `${horario.data}|${horario.horario_inicio}`,
                        status: 'selecionado',
                        data: parse(horario.data, 'yyyy-MM-dd', new Date()),
                        horario_inicio: horario.horario_inicio,
                        horario_fim: horario.horario_fim,
                        agenda_id: horario.agenda?.id,
                        dadosReserva: { horarioDB: horario, autor: selectedReserva.user!.name, reserva_titulo: selectedReserva.titulo },
                    }) as SlotCalendario,
            ),
        [selectedReserva.horarios, selectedReserva.titulo, selectedReserva.user],
    );
    const agendas = selectedReserva.horarios.map((horario) => horario.agenda).filter((agenda) => agenda !== undefined);
    const [todosSlots, setTodosSlots] = useState<SlotCalendario[]>([]);

    const { gestoresPorTurno, horariosReservadosMap } = useMemo(() => {
        const gestores: AgendaGestoresPorTurnoType = {};
        const reservadosMap = new Map<string, { horario: Horario; autor: string; reserva_titulo: string }>();

        agendas?.forEach((agenda) => {
            if (agenda.user) {
                gestores[agenda.turno] = {
                    nome: agenda.user.name,
                    email: agenda.user.email,
                    departamento: agenda.user.setor?.nome ?? 'N/I',
                    agenda_id: agenda.id,
                };
            }
            agenda.horarios?.forEach((horario) => {
                const reservaValida = horario.reservas?.find((r) => ['deferida', 'parcialmente_deferida'].includes(r.situacao));
                if (reservaValida) {
                    if (reservaValida.id === selectedReserva?.id) return;
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
    }, [agendas, selectedReserva?.id]);
    console.log('gestoresPorTurno', gestoresPorTurno);
    console.log('horariosReservadosMap', horariosReservadosMap);
    
    const [semanaAtual, setSemanaAtual] = useState(() => startOfWeek(slotsIniciais.length > 0 ? slotsIniciais[0].data : hoje, { weekStartsOn: 1 }));

    const [slotsSelecao, setSlotsSelecao] = useState<SlotCalendario[]>(slotsIniciais);
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
    }, []);
    useEffect(() => {
        const gerarSlotsParaSemana = (semanaInicio: Date) => {
            const slotsGerados: SlotCalendario[] = [];
            for (let diaOffset = 0; diaOffset < 7; diaOffset++) {
                const diaAtual = addDays(semanaInicio, diaOffset);
                const diaFormatado = format(diaAtual, 'yyyy-MM-dd');
                for (let hora = 7; hora < 22; hora++) {
                    const turno = identificarTurno(hora);
                    const inicio = `${String(hora).padStart(2, '0')}:00:00`;
                    const chave = `${diaFormatado}|${inicio}`;
                    const horarioReservado = horariosReservadosMap.get(chave);
                    if (horarioReservado) {
                        slotsGerados.push({
                            id: chave,
                            status: 'reservado',
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
                        slotsGerados.push({
                            id: chave,
                            status: 'livre',
                            data: diaAtual,
                            horario_inicio: inicio,
                            horario_fim: `${String(hora).padStart(2, '0')}:50:00`,
                            agenda_id: gestoresPorTurno[turno].agenda_id,
                        });
                    }
                }
            }
            return slotsGerados;
        };
        setTodosSlots(gerarSlotsParaSemana(semanaAtual));
    }, [semanaAtual, horariosReservadosMap, gestoresPorTurno]);
    return (<Dialog
        open={!!selectedReserva}
        onOpenChange={(isOpen) => {
            if (!isOpen) {
                setSelectedReserva(undefined); // Fecha o dialog limpando o estado
            }
        }}
    >
        <DialogContent className="max-h-[90vh] overflow-y-auto">
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
                <div className="grid gap-2">
                    <AgendaDetalhesReserva diasSemana={[]} slotsPorTurno={slotsPorTurno} />
                </div>
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