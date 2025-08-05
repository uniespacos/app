import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Agenda, Reserva, SlotCalendario } from "@/types";
import { CalendarDays, Clock, Edit, FileText, Home, User, XCircle } from "lucide-react";
import { SituacaoIndicator } from "./ReservasList";
import { Separator } from "@/components/ui/separator";
import { diasDaSemana, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { router } from "@inertiajs/react";
import { parse, startOfWeek } from "date-fns";
import { useMemo, useState } from "react";
import CalendarReservationDetails from "./CalendarReservationDetails";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ReservaDetalhesProps = {
    selectedReserva: Reserva; // Defina o tipo correto para a reserva
    setSelectedReserva: (reserva: Reserva | undefined) => void; // Função para fechar
    isGestor?: boolean; // Se o usuário é um gestor
    setRemoverReserva: (selectedReserva: Reserva) => void; // Função para remover a reserva
};


export default function ReservaDetalhes({ selectedReserva, setSelectedReserva, isGestor, setRemoverReserva }: ReservaDetalhesProps) {
    const [semanaDaReserva] = useState(() => startOfWeek(selectedReserva.horarios[0].data, { weekStartsOn: 1 }));
    const hoje = useMemo(() => new Date(new Date().setHours(0, 0, 0, 0)), []);
    const agendas = selectedReserva.horarios.map((horario) => horario.agenda)
        .filter((agenda): agenda is Agenda => agenda !== undefined)
        .reduce((acc: Agenda[], agenda) => acc.find(item => item.id === agenda.id) ? acc : [...acc, agenda], []);
    const [slotsSelecao] = useState<SlotCalendario[]>(selectedReserva.horarios.map(
        (horario) =>
            ({
                id: `${horario.data}|${horario.horario_inicio}`,
                status: horario.pivot?.situacao === 'em_analise' ? 'solicitado' :
                    (horario.pivot?.situacao === 'deferida' || horario.pivot?.situacao === 'indeferida') ?
                        horario.pivot.situacao : 'solicitado',
                data: parse(horario.data, 'yyyy-MM-dd', new Date()),
                horario_inicio: horario.horario_inicio,
                horario_fim: horario.horario_fim,
                agenda_id: horario.agenda?.id,
                dadosReserva: { horarioDB: horario, autor: selectedReserva.user!.name, reserva_titulo: selectedReserva.titulo },
                isShowReservation: true,
            }) as SlotCalendario,
    ));
    const justificativaReserva = selectedReserva.horarios.find((horario) => horario.pivot?.situacao === 'indeferida')?.pivot?.justificativa;
    return (
        <Dialog  open={!!selectedReserva} onOpenChange={() => setSelectedReserva(undefined)}>
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

                <div>
                    <h4 className="mb-3 flex items-center gap-2 font-medium text-gray-900">
                        <Clock className="h-4 w-4" />
                        Horários Solicitados
                    </h4>
                    <CalendarReservationDetails
                        agendas={agendas}
                        semanaInicio={startOfWeek(new Date(), { weekStartsOn: 1 })}
                        diasSemana={diasDaSemana(semanaDaReserva, hoje)}
                        slotsSolicitados={slotsSelecao}
                    />

                </div>
                <Separator />
                {
                    justificativaReserva && (
                        <div>
                            <h4 className="mb-2 font-medium text-red-900">Justificativa do indeferimento</h4>
                            <p className="rounded-lg bg-red-50 p-3 text-red-700">{justificativaReserva}</p>
                            <Separator className="mt-10" />

                        </div>)
                }

                {
                    selectedReserva.observacao && (
                        <div>
                            <h4 className="mb-2 font-medium text-blue-900">Observação</h4>
                            <p className="rounded-lg bg-blue-50 p-3 text-blue-700">{selectedReserva.observacao}</p>
                            <Separator className="mt-5" />
                        </div>)
                }
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
        </Dialog>
    );
}