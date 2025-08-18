import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { calcularDataInicioSemana, diasDaSemana, formatDate, getStatusReservaColor, getStatusReservaText } from '@/lib/utils';
import { Agenda, BreadcrumbItem, Reserva, SituacaoReserva, SlotCalendario, User as UserType } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { AlertCircle, CalendarDays, CheckCircle, Clock, FileText, User, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import CalendarReservationDetails from '../fragments/CalendarReservationDetails';
import { format, startOfWeek } from 'date-fns';
import { useReservationSlots } from '@/hooks/use-reservation-slots'; // Importa o novo hook
import EvaluationForm from './fragments/EvaluationForm'; // Importa o novo componente

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Gerenciar Reservas', href: '/gestor/reservas' },
    { title: 'Avaliar reserva', href: '/gestor/reservas' },
];

// Define o tipo de dados para o formulário do Inertia, mantendo a estrutura original.
type FormAvaliacaoType = {
    situacao: SituacaoReserva;
    motivo: string;
    horarios_avaliados: SlotCalendario[]; // Mantém o tipo original esperado pelo backend
    observacao: string | null;
    [key: string]: SituacaoReserva | string | (string | null) | any; // Permite outras propriedades dinâmicas
};

// Funções de ajuda podem permanecer aqui ou serem movidas para 'utils' se forem reutilizadas.
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
    if (slotsAvaliáveis.length === 0) return 'em_analise'; // Se todos os slots estiverem bloqueados

    const todosIndeferidos = slotsAvaliáveis.every(slot => slot.status === 'indeferida');
    if (todosIndeferidos) return 'indeferida';

    const todosDeferidos = slotsAvaliáveis.every(slot => slot.status === 'deferida');
    if (todosDeferidos) return 'deferida';

    const temDeferidos = slotsAvaliáveis.some(slot => slot.status === 'deferida');
    if (temDeferidos) return 'parcialmente_deferida';

    return 'em_analise';
};

export default function AvaliarReserva({ reserva }: { reserva: Reserva, auth: { user: UserType } }) {
    const agendas = useMemo(() => {
        return reserva.horarios
            .map((horario) => horario.agenda)
            .filter((agenda): agenda is Agenda => agenda !== undefined)
            .reduce((acc: Agenda[], agenda) => acc.find(item => item.id === agenda.id) ? acc : [...acc, agenda], []);
    }, [reserva.horarios]);

    const semanaDaReserva = useMemo(() => calcularDataInicioSemana(new Date(reserva.data_inicial)), [reserva.data_inicial]);
    const hoje = useMemo(() => new Date(new Date().setHours(0, 0, 0, 0)), []);

    // --- HOOKS CUSTOMIZADOS ---
    const { initialSlots, slotsSelecao, avaliarSlot, handleDecisaoGlobalChange } = useReservationSlots(reserva, agendas);

    // --- ESTADO DO FORMULÁRIO E LÓGICA DE AVALIAÇÃO ---
    const [decisao, setDecisao] = useState<SituacaoReserva>(reserva.situacao);
    const [motivo, setMotivo] = useState<string>('');
    const [observacao, setObservacao] = useState<string>(reserva.observacao || '');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const { data, setData, patch, reset } = useForm<FormAvaliacaoType>({
        situacao: reserva.situacao,
        motivo: '',
        horarios_avaliados: [],
        observacao: reserva.observacao,
    });

    // Lógica para desabilitar o RadioGroup
    const isRadioGroupDisabled = useMemo(() => {
        const statusUnicos = new Set(slotsSelecao.filter(slot => !slot.isLocked).map(slot => slot.status));
        return statusUnicos.values.length > 0 && statusUnicos.has('deferida') && statusUnicos.has('indeferida');
    }, [slotsSelecao]);

    // Sincroniza o estado 'decisao' com o estado dos slots
    useEffect(() => {
        const slotsAvaliáveis = slotsSelecao.filter(slot => !slot.isLocked);
        if (slotsAvaliáveis.length === 0) {
            setDecisao('em_analise');
            return;
        }
        const primeiroStatus = slotsAvaliáveis[0].status;
        const todosComMesmoStatus = slotsAvaliáveis.every(s => s.status === primeiroStatus);
        if (todosComMesmoStatus) {
            setDecisao(primeiroStatus as SituacaoReserva);
        } else {
            setDecisao('em_analise');
        }
    }, [slotsSelecao]);

    // Efeito para definir o motivo inicial (conflito ou justificativas)
    useEffect(() => {
        const justificativasUnicas = Array.from(new Set(reserva.horarios.map(h => h.justificativa).filter(j => !!j && j.trim() !== '')));
        const conflitos = initialSlots.filter(slot => slot.isLocked === true);

        if (conflitos.length > 0) {
            const motivoConflito = conflitos
                .map(slot => `Horário ${format(slot.data, 'dd/MM/yyyy')} às ${slot.horario_inicio.substring(0, 5)} indeferido por já haver reserva aprovada para do dia e horario.`)
                .join('\n');
            setMotivo(motivoConflito);
            return;
        }

        if (justificativasUnicas.length === 1) {
            setMotivo(justificativasUnicas[0]!);
        } else if (justificativasUnicas.length > 1) {
            setMotivo(justificativasUnicas.map(j => `- ${j}`).join('\n'));
        }
    }, [initialSlots, reserva.horarios]);

    // Efeitos para sincronizar o estado com o formulário do Inertia
    useEffect(() => { setData(prevData => ({ ...prevData, situacao: verificarStatusReserva(slotsSelecao) })); }, [slotsSelecao, setData]);


    useEffect(() => {
        const horariosAvaliados = slotsSelecao.filter(slot => {
            return reserva.horarios.some(horario => `${horario.data}|${horario.horario_inicio}` === slot.id);
        });
        setData((prevData) => ({
            ...prevData,
            horarios_avaliados: horariosAvaliados,
        }));
    }, [slotsSelecao, setData, reserva.horarios]);

    useEffect(() => { setData(prevData => ({ ...prevData, motivo: motivo })) }, [motivo, setData]);
    useEffect(() => { setData(prevData => ({ ...prevData, observacao: observacao })) }, [observacao, setData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (data.situacao === 'indeferida' && !data.motivo.trim()) {
            toast.error('Motivo é obrigatório para reservas indeferidas');
            return;
        }
        setIsSubmitting(true);
        patch(route('gestor.reservas.update', reserva.id), {
            onSuccess: () => {
                toast.success('Reserva avaliada com sucesso!');
                reset();
            },
            onError: (errors) => {
                const firstError = Object.values(errors)[0];
                toast.error(firstError || 'Ocorreu um erro de validação.');
            },
            onFinish: () => setIsSubmitting(false),
        });
    };

    const handleDecisaoChange = (novaDecisao: SituacaoReserva) => {
        setDecisao(novaDecisao);
        handleDecisaoGlobalChange(novaDecisao);
    }

    const situacaoHeader = verificarStatusReserva(slotsSelecao);

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
                                    Espaço: {reserva.horarios[0].agenda?.espaco?.nome} / {reserva.horarios[0].agenda?.espaco?.andar?.nome}
                                </p>
                            </div>
                            <Badge className={`${getStatusReservaColor(situacaoHeader)} flex items-center gap-1`}>
                                {getSituacaoIcon(situacaoHeader)}
                                {getStatusReservaText(situacaoHeader)}
                            </Badge>
                        </div>

                        {/* Informações da Reserva */}
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
                                    <CalendarReservationDetails
                                        agendas={agendas}
                                        semanaInicio={startOfWeek(semanaDaReserva, { weekStartsOn: 1 })}
                                        diasSemana={diasDaSemana(semanaDaReserva, hoje)}
                                        slotsSolicitados={slotsSelecao}
                                        alternarSelecaoSlot={avaliarSlot}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Formulário de Avaliação */}
                        <EvaluationForm
                            decisao={decisao}
                            motivo={motivo}
                            observacao={observacao}
                            isSubmitting={isSubmitting}
                            isRadioGroupDisabled={isRadioGroupDisabled}
                            slotsSelecao={slotsSelecao}
                            onDecisaoChange={handleDecisaoChange}
                            onMotivoChange={setMotivo}
                            onObservacaoChange={setObservacao}
                            onSubmit={handleSubmit}
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
