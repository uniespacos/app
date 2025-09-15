import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { diasDaSemana, formatDate, getStatusReservaColor, getStatusReservaText } from '@/lib/utils';
import { Agenda, BreadcrumbItem, Reserva, SituacaoReserva, SlotCalendario, User as UserType } from '@/types';
import { Head, router, useForm } from '@inertiajs/react'; // Removido usePage
import { AlertCircle, CalendarDays, CheckCircle, Clock, FileText, Loader2, User, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import CalendarReservationDetails from '../fragments/CalendarReservationDetails';
import { addWeeks, endOfWeek, format, isAfter, isBefore, parse, parseISO, startOfWeek, subWeeks } from 'date-fns';
import EvaluationForm from './fragments/EvaluationForm';
import AgendaNavegacao from './fragments/AgendaNavegacao';
import { useReservationSlots } from '@/hooks/use-reservation-slots';


const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Gerenciar Reservas', href: '/gestor/reservas' },
    { title: 'Avaliar reserva', href: '#' },
];

type FormAvaliacaoType = {
    situacao: SituacaoReserva;
    motivo: string;
    horarios_avaliados: { id: number; status: string; }[];
    observacao: string;
    evaluation_scope: 'single' | 'recurring';
};

const getSituacaoIcon = (situacao: string) => {
    switch (situacao) {
        case 'deferida': return <CheckCircle className="h-4 w-4 text-green-600" />;
        case 'indeferida': return <XCircle className="h-4 w-4 text-red-600" />;
        default: return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
};

const verificarStatusReserva = (slots: SlotCalendario[]): SituacaoReserva => {
    if (slots.length === 0) return 'em_analise';
    const slotsAvaliáveis = slots.filter(slot => !slot.isLocked);
    if (slotsAvaliáveis.length === 0) return 'em_analise';
    const todosIndeferidos = slotsAvaliáveis.every(slot => slot.status === 'indeferida');
    if (todosIndeferidos) return 'indeferida';
    const todosDeferidos = slotsAvaliáveis.every(slot => slot.status === 'deferida');
    if (todosDeferidos) return 'deferida';
    const temDeferidos = slotsAvaliáveis.some(slot => slot.status === 'deferida');
    if (temDeferidos) return 'parcialmente_deferida';
    return 'em_analise';
};

export default function AvaliarReserva({ reserva, semana, todosOsConflitos }: {
    reserva: Reserva, auth: { user: UserType }, semana: { referencia: string },
    todosOsConflitos: Record<string, any> // O tipo pode ser mais específico se desejar
}) {
    const [isLoading, setIsLoading] = useState(false);
    const [semanaVisivel, setSemanaVisivel] = useState(() => parseISO(semana.referencia));

    const isReavaliacao = useMemo(() => {
        // A reserva já foi avaliada se algum de seus horários já está 'deferida' ou 'indeferida'
        return reserva.horarios.some(h => h.situacao === 'deferida' || h.situacao === 'indeferida');
    }, [reserva.horarios]);

    // HOOK useEffect para sincronizar a semana visível com as props
    useEffect(() => {
        setSemanaVisivel(parseISO(semana.referencia));
    }, [semana.referencia]);

    const agendas = useMemo(() => {
        return reserva.horarios
            .map((horario) => horario.agenda)
            .filter((agenda): agenda is Agenda => agenda !== undefined)
            .reduce((acc: Agenda[], agenda) => acc.find(item => item.id === agenda.id) ? acc : [...acc, agenda], []);
    }, [reserva.horarios]);

    const hoje = useMemo(() => new Date(new Date().setHours(0, 0, 0, 0)), []);

    // O hook useReservationSlots precisa ser ajustado para receber a reserva que muda
    const { slotsSelecao, avaliarSlot, handleDecisaoGlobalChange } = useReservationSlots(reserva, agendas);

    const { data, setData, patch, processing } = useForm<FormAvaliacaoType>({
        situacao: reserva.situacao,
        motivo: reserva.horarios.find(h => h.justificativa)?.justificativa || '',
        observacao: reserva.observacao || '',
        horarios_avaliados: [],
        evaluation_scope: 'recurring',
    });

    useEffect(() => {
        // 1. Converte o objeto de conflitos em um array.
        const conflitos = Object.values(todosOsConflitos);

        // 2. Se houver conflitos, formata a mensagem de justificativa.
        if (conflitos.length > 0) {
            // Precisamos dos horários originais para pegar a data e hora
            const horariosOriginaisMap = new Map(reserva.horarios.map(h => [h.id, h]));

            const motivoConflitos = conflitos
                .map((conflito) => {
                    // Busca o horário original pelo ID para obter a data e hora
                    const horarioOriginal = horariosOriginaisMap.get(conflito.horario_checado_id);
                    if (!horarioOriginal) return null; // Segurança

                    const horarioFormatado = horarioOriginal.horario_inicio.substring(0, 5);
                    const dataFormatada = format(parse(horarioOriginal.data, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy');
                    const detalheDoConflito = `Conflito com a reserva '${conflito.conflito_reserva_titulo}' de ${conflito.conflito_user_name}.`;

                    return `- Horário das ${horarioFormatado} do dia ${dataFormatada}: Indeferido. ${detalheDoConflito}`;
                })
                .filter(Boolean) // Remove qualquer linha nula
                .join('\n');

            // 3. Atualiza o estado do formulário com a justificativa completa.
            setData('motivo', motivoConflitos);
        } else {
            setData('motivo', '');
        }
        // A dependência agora é a prop 'todosOsConflitos'.
    }, [setData, reserva.horarios, todosOsConflitos]);


    useEffect(() => {
        const horariosParaEnviar = slotsSelecao
            .filter(slot => slot.dadosReserva?.horarioDB?.id)
            .map(slot => ({
                id: slot.dadosReserva!.horarioDB.id,
                status: slot.status,
            }));

        setData(prevData => ({
            ...prevData,
            situacao: verificarStatusReserva(slotsSelecao),
            horarios_avaliados: horariosParaEnviar,
        }));
    }, [setData, slotsSelecao]);

    const [decisao, setDecisao] = useState<SituacaoReserva>(reserva.situacao);

    const isRadioGroupDisabled = useMemo(() => {
        const statusUnicos = new Set(slotsSelecao.filter(slot => !slot.isLocked).map(slot => slot.status));
        return statusUnicos.size > 1;
    }, [slotsSelecao]);

    useEffect(() => {
        const slotsAvaliáveis = slotsSelecao.filter(slot => !slot.isLocked);
        if (slotsAvaliáveis.length > 0) {
            const primeiroStatus = slotsAvaliáveis[0].status;
            const todosComMesmoStatus = slotsAvaliáveis.every(s => s.status === primeiroStatus);
            setDecisao(todosComMesmoStatus ? (primeiroStatus as SituacaoReserva) : 'em_analise');
        } else {
            setDecisao('em_analise');
        }
    }, [slotsSelecao]);

    const dataInicialReserva = useMemo(() => new Date(reserva.data_inicial), [reserva.data_inicial]);
    const dataFinalReserva = useMemo(() => new Date(reserva.data_final), [reserva.data_final]);

    const podeVoltar = useMemo(() => isAfter(startOfWeek(semanaVisivel, { weekStartsOn: 1 }), dataInicialReserva), [semanaVisivel, dataInicialReserva]);
    const podeAvancar = useMemo(() => isBefore(endOfWeek(semanaVisivel, { weekStartsOn: 1 }), dataFinalReserva), [semanaVisivel, dataFinalReserva]);

    const navegarParaSemana = (novaData: Date) => {
        router.get(route('gestor.reservas.show', { reserva: reserva.id }), { semana: format(novaData, 'yyyy-MM-dd') }, {
            preserveState: true, preserveScroll: true, replace: true,
            onStart: () => setIsLoading(true), onFinish: () => setIsLoading(false),
        });
    };
    const irParaSemanaAnterior = () => podeVoltar && navegarParaSemana(subWeeks(semanaVisivel, 1));
    const irParaProximaSemana = () => podeAvancar && navegarParaSemana(addWeeks(semanaVisivel, 1));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (data.situacao === 'indeferida' && !data.motivo.trim()) {
            toast.error('Motivo é obrigatório para reservas indeferidas');
            return;
        }
        patch(route('gestor.reservas.update', reserva.id), {
            onSuccess: () => toast.success('Reserva avaliada com sucesso!'),
            onError: (errors) => toast.error(Object.values(errors)[0] || 'Ocorreu um erro.'),
        });
    };

    const handleDecisaoChange = (novaDecisao: SituacaoReserva) => {
        setDecisao(novaDecisao);
        handleDecisaoGlobalChange(novaDecisao);
    };

    const situacaoHeader = verificarStatusReserva(slotsSelecao);
    if (reserva.validation_status === 'processing' || reserva.validation_status === 'pending') {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <h2 className="text-xl font-semibold">Processando Conflitos...</h2>
                <p className="text-muted-foreground">A validação para esta reserva grande está sendo executada em segundo plano. A página será atualizada automaticamente.</p>
            </div>
        );
    }
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Avaliar reserva" />
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="mx-auto max-w-4xl space-y-6">
                    <div className="container mx-auto space-y-6 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Avaliar Reserva</h1>
                                <p className="mt-1 text-gray-600">
                                    Espaço: {reserva.horarios[0]?.agenda?.espaco?.nome} / {reserva.horarios[0]?.agenda?.espaco?.andar?.nome}
                                </p>
                            </div>
                            <Badge className={`${getStatusReservaColor(situacaoHeader)} flex items-center gap-1`}>
                                {getSituacaoIcon(situacaoHeader)}
                                {getStatusReservaText(situacaoHeader)}
                            </Badge>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />{reserva.titulo}</CardTitle>
                                <CardDescription className="flex items-center gap-2"><User className="h-4 w-4" />Solicitado por: {reserva.user?.name}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="mb-2 font-medium text-gray-900">Descrição</h4>
                                    <p className="rounded-lg bg-gray-50 p-3 text-gray-700">{reserva.descricao}</p>
                                </div>
                                <Separator />
                                <div className="flex items-center gap-2">
                                    <CalendarDays className="h-4 w-4 text-gray-500" />
                                    <div>
                                        <p className="text-sm text-gray-500">Período</p>
                                        <p className="font-medium">{formatDate(reserva.data_inicial)} até {formatDate(reserva.data_final)}</p>
                                    </div>
                                </div>
                                <Separator />
                                <div>
                                    <h4 className="mb-3 flex items-center gap-2 font-medium text-gray-900"><Clock className="h-4 w-4" />Horários Solicitados</h4>
                                    <AgendaNavegacao
                                        semanaAtual={semanaVisivel}
                                        onAnterior={irParaSemanaAnterior}
                                        onProxima={irParaProximaSemana}
                                        desabilitarAnterior={!podeVoltar || isLoading}
                                        desabilitarProxima={!podeAvancar || isLoading}
                                    />
                                    <div className="relative mt-2">
                                        <CalendarReservationDetails
                                            agendas={agendas}
                                            diasSemana={diasDaSemana(semanaVisivel, hoje)}
                                            slotsSolicitados={slotsSelecao}
                                            alternarSelecaoSlot={avaliarSlot}
                                        />
                                        {isLoading && (
                                            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-white/70 backdrop-blur-sm">
                                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <EvaluationForm
                            isReavaliacao={isReavaliacao}
                            data={data}
                            setData={setData}
                            decisao={decisao}
                            isSubmitting={processing}
                            isRadioGroupDisabled={isRadioGroupDisabled}
                            slotsSelecao={slotsSelecao}
                            onDecisaoChange={handleDecisaoChange}
                            onSubmit={handleSubmit}
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}