/* eslint-disable @typescript-eslint/no-explicit-any */
import { verificarStatusReserva } from '@/application/reservas/helpers/reserva-status.helpers';
import { useAvaliarReservaUseCase } from '@/application/reservas/use-cases/use-avaliar-reserva-usecase';
import { useReservationSlots } from '@/application/reservas/use-reservation-slots';
import { Badge } from '@/components/ui/badge';
import { useAgendaNavigation } from '@/hooks/use-agenda-navigation';
import { diasDaSemana, getStatusReservaColor, getStatusReservaText } from '@/lib/utils';
import { getAndarLabelByValue } from '@/lib/utils/andars/AndarOptions';
import { SituacaoIcon } from '@/presentation/atoms/SituacaoIcon';
import AgendaNavegacao from '@/presentation/molecules/AgendaNavegacao';
import CalendarReservationDetails from '@/presentation/molecules/CalendarReservationDetails';
import EvaluationForm from '@/presentation/organisms/EvaluationForm';
import { ReservaInfoCard } from '@/presentation/organisms/ReservaInfoCard';
import AppLayout from '@/presentation/templates/app-layout';
import { Agenda, BreadcrumbItem, Reserva, SituacaoReserva, User as UserType } from '@/types';
import { Head } from '@inertiajs/react';
import { format, parse, parseISO } from 'date-fns';
import { Clock, Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Gerenciar Reservas', href: '/gestor/reservas' },
    { title: 'Avaliar reserva', href: '#' },
];

export default function AvaliarReserva({
    reserva,
    semana,
    todosOsConflitos,
}: {
    reserva: Reserva;
    auth: { user: UserType };
    semana: { referencia: string };
    todosOsConflitos: Record<string, any>;
}) {
    const isReavaliacao = useMemo(() => {
        return reserva.situacao !== 'em_analise' || reserva.horarios.some((h) => h.situacao === 'deferida' || h.situacao === 'indeferida');
    }, [reserva.situacao, reserva.horarios]);

    const agendas = useMemo(() => {
        return reserva.horarios
            .map((horario) => horario.agenda)
            .filter((agenda): agenda is Agenda => agenda !== undefined)
            .reduce((acc: Agenda[], agenda) => (acc.find((item) => item.id === agenda.id) ? acc : [...acc, agenda]), []);
    }, [reserva.horarios]);

    const hoje = useMemo(() => new Date(new Date().setHours(0, 0, 0, 0)), []);

    const { slotsSelecao, avaliarSlot, handleDecisaoGlobalChange } = useReservationSlots(reserva);

    const { form, submitEvaluation } = useAvaliarReservaUseCase({
        reserva,
    });
    const { setData } = form;

    const semanaInicial = useMemo(() => parseISO(semana.referencia), [semana.referencia]);
    const dataInicialReserva = useMemo(() => new Date(reserva.data_inicial), [reserva.data_inicial]);
    const dataFinalReserva = useMemo(() => new Date(reserva.data_final), [reserva.data_final]);

    const { semanaVisivel, isLoading, podeVoltar, podeAvancar, irParaSemanaAnterior, irParaProximaSemana } = useAgendaNavigation({
        semanaInicial,
        routeName: 'gestor.reservas.show',
        routeParams: useMemo(() => ({ reserva: reserva.id }), [reserva.id]),
        dataInicial: dataInicialReserva,
        dataFinal: dataFinalReserva,
    });

    useEffect(() => {
        const conflitos = Object.values(todosOsConflitos);

        if (conflitos.length > 0) {
            const horariosOriginaisMap = new Map(reserva.horarios.map((h) => [h.id, h]));

            const motivoConflitos = conflitos
                .map((conflito) => {
                    const horarioOriginal = horariosOriginaisMap.get(conflito.horario_checado_id);
                    if (!horarioOriginal) return null;

                    const horarioFormatado = horarioOriginal.horario_inicio.substring(0, 5);
                    const dataFormatada = format(parse(horarioOriginal.data, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy');
                    const detalheDoConflito = `Conflito com a reserva '${conflito.conflito_reserva_titulo}' de ${conflito.conflito_user_name}.`;

                    return `- Horário das ${horarioFormatado} do dia ${dataFormatada}: Indeferido. ${detalheDoConflito}`;
                })
                .filter(Boolean)
                .join('\n');

            setData('motivo', motivoConflitos);
        }
    }, [setData, reserva.horarios, todosOsConflitos]);

    useEffect(() => {
        const horariosParaEnviar = slotsSelecao
            .filter((slot) => slot.dadosReserva?.horarioDB.id)
            .map((slot) => ({
                id: slot.dadosReserva!.horarioDB.id,
                status: slot.status,
            }));

        setData((prevData) => ({
            ...prevData,
            situacao: verificarStatusReserva(slotsSelecao),
            horarios_avaliados: horariosParaEnviar,
        }));
    }, [setData, slotsSelecao]);

    const [decisao, setDecisao] = useState<SituacaoReserva>(reserva.situacao);

    const isRadioGroupDisabled = useMemo(() => {
        const statusUnicos = new Set(slotsSelecao.filter((slot) => !slot.isLocked).map((slot) => slot.status));
        return statusUnicos.size > 1;
    }, [slotsSelecao]);

    useEffect(() => {
        const slotsAvaliáveis = slotsSelecao.filter((slot) => !slot.isLocked);
        if (slotsAvaliáveis.length > 0) {
            const primeiroStatus = slotsAvaliáveis[0].status;
            const todosComMesmoStatus = slotsAvaliáveis.every((s) => s.status === primeiroStatus);
            setDecisao(todosComMesmoStatus ? (primeiroStatus as SituacaoReserva) : 'em_analise');
        } else {
            setDecisao('em_analise');
        }
    }, [slotsSelecao]);

    const handleSubmit = (e: React.FormEvent) => {
        submitEvaluation(e);
    };

    const handleDecisaoChange = (novaDecisao: SituacaoReserva) => {
        setDecisao(novaDecisao);
        if (novaDecisao === 'deferida' || novaDecisao === 'indeferida') {
            handleDecisaoGlobalChange(novaDecisao);
        }
    };

    const situacaoHeader = verificarStatusReserva(slotsSelecao);

    if (reserva.validation_status === 'processing' || reserva.validation_status === 'pending') {
        return (
            <div className="flex h-full flex-col items-center justify-center">
                <Loader2 className="text-primary mb-4 h-12 w-12 animate-spin" />
                <h2 className="text-xl font-semibold">Processando Conflitos...</h2>
                <p className="text-muted-foreground">
                    A validação para esta reserva grande está sendo executada em segundo plano. A página será atualizada automaticamente.
                </p>
            </div>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Avaliar reserva" />
            <div className="bg-muted/50 min-h-screen p-6">
                <div className="mx-auto max-w-4xl space-y-6">
                    <div className="container mx-auto space-y-6 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-foreground text-3xl font-bold">Avaliar Reserva</h1>
                                <p className="text-muted-foreground mt-1">
                                    Espaço: {reserva.horarios[0]?.agenda?.espaco?.nome} /{' '}
                                    {reserva.horarios[0]?.agenda?.espaco?.andar?.nome
                                        ? getAndarLabelByValue(reserva.horarios[0].agenda.espaco.andar.nome)
                                        : null}
                                </p>
                            </div>
                            <Badge className={`${getStatusReservaColor(situacaoHeader)} flex items-center gap-1`}>
                                <SituacaoIcon situacao={situacaoHeader} />
                                {getStatusReservaText(situacaoHeader)}
                            </Badge>
                        </div>

                        <ReservaInfoCard reserva={reserva}>
                            <div>
                                <h4 className="text-foreground mb-3 flex items-center gap-2 font-medium">
                                    <Clock className="h-4 w-4" />
                                    Horários Solicitados
                                </h4>
                                <AgendaNavegacao
                                    variant="compact"
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
                                        <div className="bg-background/70 absolute inset-0 z-10 flex items-center justify-center rounded-md backdrop-blur-sm">
                                            <Loader2 className="text-primary h-8 w-8 animate-spin" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </ReservaInfoCard>

                        <EvaluationForm
                            isReavaliacao={isReavaliacao}
                            data={form.data}
                            setData={form.setData}
                            decisao={decisao}
                            isSubmitting={form.processing}
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
