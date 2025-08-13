import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { diasDaSemana, formatDate, getStatusReservaColor, getStatusReservaText, getTurnoText } from '@/lib/utils';
import { Agenda, BreadcrumbItem, Reserva, SituacaoReserva, SlotCalendario, User as UserType } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { AlertCircle, CalendarDays, CheckCircle, Clock, FileText, User, XCircle } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import CalendarReservationDetails from '../fragments/CalendarReservationDetails';
import { parse, startOfWeek } from 'date-fns';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Gerenciar Reservas',
        href: '/gestor/reservas',
    },
    {
        title: 'Avaliar reserva',
        href: '/gestor/reservas',
    },
];

type FormAvaliacaoType = {
    situacao: SituacaoReserva;
    motivo: string;
    horarios_avaliados: SlotCalendario[]; // Horários que o usuário seleciona
    observacao: string | null;
    [key: string]: any; // Permite adicionar outros campos dinamicamente
};

export default function AvaliarReserva() {
    const { reserva, auth: { user }, agendas, agendasHorariosAprovados } = usePage<{ reserva: Reserva, auth: { user: UserType }, agendasHorariosAprovados: Agenda[], agendas: Agenda[] }>().props;
    console.log(agendas);
    const [slotsSelecao, setSlotsSelecao] = useState<SlotCalendario[]>([]);
    useEffect(() => {

        setSlotsSelecao(reserva.horarios.map(
            (horario) => {
                if (horario.pivot?.situacao === "em_analise") {
                    const hasConflict = agendasHorariosAprovados.some((agenda) => {
                        return agenda.horarios?.some(h => {
                            return h.horario_inicio === horario.horario_inicio && h.data === horario.data
                        });
                    })
                    if (hasConflict) {
                        setMotivo(`
                            O horário ${horario.horario_inicio} - ${horario.horario_fim} do dia ${formatDate(horario.data)}
                            conflita com outra reserva já aprovada.    
                        `);
                        return ({
                            id: `${horario.data}|${horario.horario_inicio}`,
                            status: 'indeferida',
                            data: parse(horario.data, 'yyyy-MM-dd', new Date()),
                            horario_inicio: horario.horario_inicio,
                            horario_fim: horario.horario_fim,
                            agenda_id: horario.agenda?.id,
                            dadosReserva: { horarioDB: horario, autor: reserva.user!.name, reserva_titulo: reserva.titulo },
                            isShowReservation: true,
                            isLocked: true
                        }) as SlotCalendario
                    }
                }
                return ({
                    id: `${horario.data}|${horario.horario_inicio}`,
                    status: horario.pivot?.situacao === 'em_analise' ? 'solicitado' :
                        (horario.pivot?.situacao === 'deferida' || horario.pivot?.situacao === 'indeferida') ?
                            horario.pivot.situacao : 'solicitado',
                    data: parse(horario.data, 'yyyy-MM-dd', new Date()),
                    horario_inicio: horario.horario_inicio,
                    horario_fim: horario.horario_fim,
                    agenda_id: horario.agenda?.id,
                    dadosReserva: { horarioDB: horario, autor: reserva.user!.name, reserva_titulo: reserva.titulo },
                    isShowReservation: true,
                }) as SlotCalendario
            },
        ))
    }, [reserva.horarios, agendas, reserva.user, reserva.titulo, agendasHorariosAprovados]);

    const { setData, patch, reset } = useForm<FormAvaliacaoType>({
        situacao: reserva.situacao,
        motivo: '',
        horarios_avaliados: [],
        observacao: reserva.observacao,
    });
    const [observacao, setObservacao] = useState(reserva.observacao || '');
    const [decisao, setDecisao] = useState<SituacaoReserva>(reserva.situacao);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [semanaDaReserva] = useState(() => startOfWeek(reserva.horarios[0].data, { weekStartsOn: 1 }));
    const hoje = useMemo(() => new Date(new Date().setHours(0, 0, 0, 0)), []);
    const [motivo, setMotivo] = useState('');

    useEffect(() => {
        // Inicializa o estado da decisão com a situação atual da reserva
        setDecisao(reserva.situacao as SituacaoReserva);
        // Se a reserva já tiver uma justificativa, define o motivo
        if (reserva.horarios.length > 0 && reserva.horarios[0].pivot?.justificativa) {
            setMotivo(reserva.horarios[0].pivot.justificativa);
        } else {
            setMotivo('');
        }
    }, [reserva.horarios, reserva.situacao]);
    const situaçãoReserva = () => {
        const horariosQueGerencio = reserva.horarios.filter((horario) => {
            return horario.agenda?.user?.id === user.id;
        });

        if (reserva.situacao === 'parcialmente_deferida' || reserva.situacao === 'em_analise') {
            const situacoes = horariosQueGerencio.map((horario) => horario.pivot?.situacao);
            if (situacoes.includes('em_analise')) {
                return 'em_analise' as SituacaoReserva;
            }
            if (situacoes.includes('deferida')) {
                return 'deferida' as SituacaoReserva;
            }
            if (situacoes.includes('indeferida')) {
                return 'indeferida' as SituacaoReserva;
            }
        }
        return 'em_analise' as SituacaoReserva;
    }
    function verificarStatusReserva(slots: SlotCalendario[]): SituacaoReserva {
        if (slots.length === 0) {
            return 'em_analise';
        }

        const todosIndeferidos = slots.every(slot => slot.status === 'indeferida');
        if (todosIndeferidos) {
            return 'indeferida';
        }

        const todosDeferidos = slots.every(slot => slot.status === 'deferida');
        if (todosDeferidos) {
            return 'deferida';
        }

        const temDeferidos = slots.some(slot => slot.status === 'deferida');
        const temIndeferidos = slots.some(slot => slot.status === 'indeferida');
        const temSolicitados = slots.some(slot => slot.status === 'solicitado');

        if ((temDeferidos && temIndeferidos) || (temDeferidos && temSolicitados)) {
            return 'parcialmente_deferida';
        }

        if (temIndeferidos && temSolicitados && !temDeferidos) {
            return 'em_analise';
        }

        return 'em_analise';
    }

    useEffect(() => {
        const horariosAvaliados = slotsSelecao.filter(slot => {
            return reserva.horarios.some(horario => `${horario.data}|${horario.horario_inicio}` === slot.id);
        });
        setData((prevData) => ({
            ...prevData,
            horarios_avaliados: horariosAvaliados,
        }));

    }, [reserva.horarios, setData, slotsSelecao]);

    useEffect(() => {
        setData((prevData) => ({
            ...prevData,
            observacao: observacao,
        }));
    }, [observacao, setData]);

    useEffect(() => {
        setData((prevData) => ({
            ...prevData,
            situacao: verificarStatusReserva(slotsSelecao),
        }));
    }, [slotsSelecao, setData]);
    const avaliarSlot = (slot: SlotCalendario) => {

        setSlotsSelecao((prevSlots) => {
            const novosSlots = [...prevSlots];
            const index = novosSlots.findIndex((s) => s.id === slot.id);

            if (index !== -1) {
                const slotAtual = novosSlots[index];
                let proximoStatus: 'solicitado' | 'deferida' | 'indeferida';

                // A lógica de alternância: solicitado -> deferida -> indeferida -> solicitado
                if (slotAtual.status === 'solicitado' || slotAtual.status === 'selecionado') {
                    proximoStatus = 'deferida';
                } else if (slotAtual.status === 'deferida') {
                    proximoStatus = 'indeferida';
                } else {
                    // de 'indeferida' ou qualquer outro estado, volta para 'solicitado'
                    proximoStatus = 'solicitado';
                }
                novosSlots[index] = { ...slotAtual, status: proximoStatus };
            }
            return novosSlots;
        });
    };


    useEffect(() => {
        setData(prev => ({ ...prev, motivo: motivo }));
    }, [motivo, setData]);
    const getSituacaoIcon = (situacao: string) => {
        switch (situacao) {
            case 'deferida':
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'indeferida':
                return <XCircle className="h-4 w-4 text-red-600" />;
            default:
                return <AlertCircle className="h-4 w-4 text-yellow-600" />;
        }
    };
    function handleSubmit(e: React.FormEvent) {

        e.preventDefault();
        if (!decisao) return;
        if (decisao === 'indeferida' && !motivo.trim()) {
            alert('Motivo é obrigatório para reservas indeferidas');
            return;
        }
        setIsSubmitting(true);

        patch(route('gestor.reservas.update', reserva.id), {
            onSuccess: () => {
                reset();
            },
            onError: (error) => {
                const firstError = Object.values(error)[0];
                toast.error(firstError || 'Ocorreu um erro de validação. Verifique os campos');
            },
        });
        setIsSubmitting(false);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Avaliar reserva" />
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="mx-auto max-w-4xl space-y-6">
                    <div className="container mx-auto space-y-6 p-6">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Avaliar Reserva</h1>
                                <p className="mt-1 text-gray-600">
                                    Espaço: {reserva.horarios[0].agenda?.espaco?.nome} / {reserva.horarios[0].agenda?.espaco?.andar?.nome}/{' '}
                                    {reserva.horarios[0].agenda?.espaco?.andar?.modulo?.nome} / {getTurnoText(reserva.horarios[0].agenda!.turno)}{' '}
                                </p>
                            </div>
                            <Badge className={`${getStatusReservaColor(situaçãoReserva())} flex items-center gap-1`}>
                                {getSituacaoIcon(situaçãoReserva())}
                                {getStatusReservaText(situaçãoReserva())}
                            </Badge>
                        </div>

                        {/* Informações da Reserva */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    {reserva.titulo}
                                </CardTitle>
                                <CardDescription className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Solicitado por: {reserva.user?.name}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="mb-2 font-medium text-gray-900">Descrição</h4>
                                    <p className="rounded-lg bg-gray-50 p-3 text-gray-700">{reserva.descricao}</p>
                                </div>

                                <Separator />

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="flex items-center gap-2">
                                        <CalendarDays className="h-4 w-4 text-gray-500" />
                                        <div>
                                            <p className="text-sm text-gray-500">Período</p>
                                            <p className="font-medium">
                                                {formatDate(reserva.data_inicial)} até {formatDate(reserva.data_final)}
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
                                        alternarSelecaoSlot={avaliarSlot}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Avaliação */}
                        <form onSubmit={handleSubmit}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Avaliação da Reserva</CardTitle>
                                    <CardDescription>Defina se a reserva será deferida ou indeferida</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label className="text-base font-medium">Decisão</Label>
                                        <RadioGroup value={decisao} onValueChange={(value) => {
                                            setSlotsSelecao((prev) => {
                                                return prev.map((slot) => ({
                                                    ...slot,
                                                    status: value === 'em_analise' ? 'solicitado' :
                                                        value === 'deferida' ? 'deferida' :
                                                            value === 'indeferida' ? 'indeferida' : 'solicitado'
                                                }));
                                            });
                                            setDecisao(value as 'deferida' | 'indeferida')
                                        }}>
                                            <div className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-green-50">
                                                <RadioGroupItem value="deferida" id="deferida" />
                                                <Label htmlFor="deferida" className="flex cursor-pointer items-center gap-2">
                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                    Deferir Reserva
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-red-50">
                                                <RadioGroupItem value="indeferida" id="indeferida" />
                                                <Label htmlFor="indeferida" className="flex cursor-pointer items-center gap-2">
                                                    <XCircle className="h-4 w-4 text-red-600" />
                                                    Indeferir Reserva
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                    </div>

                                    {(decisao === 'indeferida' || slotsSelecao.some((slot) => slot.status === 'indeferida')) && (
                                        <div className="space-y-2">
                                            <Label htmlFor="motivo" className="text-base font-medium text-red-700">
                                                Motivo do Indeferimento *
                                            </Label>
                                            <Textarea
                                                id="motivo"
                                                placeholder="Descreva o motivo pelo qual a reserva está sendo indeferida..."
                                                value={motivo}
                                                onChange={(e) => setMotivo(e.target.value)}
                                                className="min-h-[100px] border-red-200 focus:border-red-500"
                                            />
                                            <p className="text-sm text-red-600">Este campo é obrigatório para reservas indeferidas</p>
                                        </div>
                                    )}<div className="space-y-2">
                                        <Label htmlFor="obsevacao" className="text-base font-medium text-blue-700">
                                            Obsevação
                                        </Label>
                                        <Textarea
                                            id="obsevacao"
                                            placeholder="Caso haja uma observação adicional, descreva aqui..."
                                            value={observacao}
                                            onChange={(e) => setObservacao(e.target.value)}
                                            className="min-h-[100px] border-blue-200 focus:border-blue-500"
                                        />
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <Button
                                            onClick={handleSubmit}
                                            disabled={!decisao || (decisao === 'indeferida' && !motivo.trim()) || isSubmitting}
                                            className="flex-1"
                                        >
                                            {isSubmitting ? 'Processando...' : 'Confirmar Avaliação'}
                                        </Button>
                                        <Button variant="outline" className="px-8">
                                            Cancelar
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
