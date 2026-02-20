import { Button } from '@/components/ui/button';
import { diasDaSemana } from '@/lib/utils';
import { Espaco, OpcoesRecorrencia, Reserva, ReservaFormData, SlotCalendario } from '@/types';
import { router, useForm } from '@inertiajs/react'; // ALTERADO: Importar useForm
import { addDays, addMonths, addWeeks, format, parse, parseISO, subWeeks } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import AgendaCalendario from './AgendaCalendario';
import AgendaDialogReserva from './AgendaDialogReserva';
import AgendaEditModeAlert from './AgendaEditModeAlert';
import AgendaHeader from './AgendaHeader';
import AgendaNavegacao from './AgendaNavegacao';

const opcoesRecorrencia: OpcoesRecorrencia[] = [
    {
        valor: 'unica',
        label: 'Apenas esta semana',
        descricao: 'A reserva será feita apenas para os dias selecionados nesta semana',
        calcularDataFinal: (dataInicial: Date) => addDays(dataInicial, 6),
    },
    {
        valor: '15dias',
        label: 'Próximos 15 dias',
        descricao: 'A reserva será replicada pelos próximos 15 dias',
        calcularDataFinal: (dataInicial: Date) => addDays(dataInicial, 14),
    },
    {
        valor: '1mes',
        label: '1 mês',
        descricao: 'A reserva será replicada por 1 mês',
        calcularDataFinal: (dataInicial: Date) => addMonths(dataInicial, 1),
    },
    {
        valor: 'personalizado',
        label: 'Período personalizado',
        descricao: 'Defina um período personalizado para a recorrência',
        calcularDataFinal: (dataInicial: Date) => dataInicial,
    },
];

type AgendaEspacoProps = {
    isEditMode?: boolean;
    espaco: Espaco;
    reserva?: Reserva;
    semana: { referencia: string };
};

export default function AgendaEspaço({ isEditMode = false, espaco, reserva, semana }: AgendaEspacoProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [semanaVisivel, setSemanaVisivel] = useState(() => parseISO(semana.referencia));
    useEffect(() => {
        setSemanaVisivel(parseISO(semana.referencia));
    }, [semana.referencia]);
    const { agendas } = espaco;
    const hoje = useMemo(() => new Date(new Date().setHours(0, 0, 0, 0)), []);

    // Gera a lista de slots selecionados inicialmente caso seja modo de edição
    const slotsIniciais = useMemo(() => {
        if (!isEditMode || !reserva?.horarios) return [];
        return reserva.horarios.map(
            (horario) =>
                ({
                    id: `${horario.data}|${horario.horario_inicio}`,
                    status: 'selecionado',
                    data: parse(horario.data, 'yyyy-MM-dd', new Date()),
                    horario_inicio: horario.horario_inicio,
                    horario_fim: horario.horario_fim,
                    agenda_id: horario.agenda?.id,
                    dadosReserva: { horarioDB: horario, autor: reserva.user!.name, reserva_titulo: reserva.titulo },
                }) as SlotCalendario,
        );
    }, [isEditMode, reserva]);

    const [slotsSelecao, setSlotsSelecao] = useState<SlotCalendario[]>(slotsIniciais);

    useEffect(() => {
        if (!reserva?.horarios) {
            setSlotsSelecao([]); // Limpa a seleção se não houver horários
            return;
        }

        // Mapeia os novos horários recebidos do backend para o formato de SlotCalendario
        const novosSlots = reserva.horarios.map(
            (horario) =>
                ({
                    id: `${horario.data}|${horario.horario_inicio}`,
                    status: 'selecionado', // No modo de edição, os horários da reserva estão sempre "selecionados"
                    data: parse(horario.data, 'yyyy-MM-dd', new Date()),
                    horario_inicio: horario.horario_inicio,
                    horario_fim: horario.horario_fim,
                    agenda_id: horario.agenda?.id,
                    dadosReserva: {
                        horarioDB: horario,
                        autor: reserva.user!.name,
                        reserva_titulo: reserva.titulo,
                    },
                }) as SlotCalendario,
        );

        // Atualiza o estado, fazendo com que o calendário redesenhe com os horários corretos
        setSlotsSelecao(novosSlots);
    }, [reserva]); // A dependência é o objeto 'reserva' inteiro, para reagir a qualquer mudança nele.
    // --- FIM DA CORREÇÃO ---

    const [dialogAberto, setDialogAberto] = useState(false);

    // ALTERAÇÃO PRINCIPAL: Centralizando o estado do formulário com useForm
    const { data, setData, post, patch, processing, reset } = useForm<ReservaFormData>({
        titulo: reserva?.titulo ?? '',
        descricao: reserva?.descricao ?? '',
        data_inicial: reserva?.data_inicial ? new Date(reserva.data_inicial) : hoje,
        data_final: reserva?.data_final ? new Date(reserva.data_final) : addMonths(hoje, 1),
        recorrencia: reserva?.recorrencia ?? 'unica',
        horarios_solicitados: [], // Começa vazio, será populado pelo useEffect
        edit_scope: 'recurring',
        edited_week_date: format(semanaVisivel, 'yyyy-MM-dd'),
    });

    // Efeito para sincronizar os slots selecionados com o formulário do Inertia
    useEffect(() => {
        const horariosParaEnviar = slotsSelecao.map((s) => ({
            data: format(s.data, 'yyyy-MM-dd'),
            horario_inicio: s.horario_inicio,
            horario_fim: s.horario_fim,
            agenda_id: s.agenda_id,
        }));
        
        setData((prevData) => {
            // Se os horários solicitados mudaram (mudança na seleção do calendário),
            // recalculamos as datas iniciais e finais sugeridas.
            const novaDataInicial = slotsSelecao.length > 0 
                ? new Date(Math.min(...slotsSelecao.map((s) => s.data.getTime())))
                : prevData.data_inicial;
            
            let novaDataFinal = prevData.data_final;
            if (slotsSelecao.length > 0 && prevData.recorrencia !== 'personalizado') {
                const opcaoRecorrencia = opcoesRecorrencia.find((op) => op.valor === prevData.recorrencia);
                if (opcaoRecorrencia) {
                    novaDataFinal = prevData.recorrencia === 'unica'
                        ? new Date(Math.max(...slotsSelecao.map((s) => s.data.getTime())))
                        : opcaoRecorrencia.calcularDataFinal(novaDataInicial);
                }
            }

            return { 
                ...prevData, 
                horarios_solicitados: horariosParaEnviar,
                // Só atualizamos as datas se for uma mudança real na seleção de slots
                // para não sobrescrever mudanças manuais feitas no modal.
                data_inicial: novaDataInicial,
                data_final: novaDataFinal
            };
        });
    }, [slotsSelecao]); // Removemos data.recorrencia e setData como dependências diretas

    // Efeito para reagir apenas à mudança de recorrência
    useEffect(() => {
        if (slotsSelecao.length === 0) return;

        setData((prevData) => {
            if (prevData.recorrencia === 'personalizado') return prevData;

            const opcaoRecorrencia = opcoesRecorrencia.find((op) => op.valor === prevData.recorrencia);
            if (!opcaoRecorrencia) return prevData;

            const novaDataFinal = prevData.recorrencia === 'unica'
                ? new Date(Math.max(...slotsSelecao.map((s) => s.data.getTime())))
                : opcaoRecorrencia.calcularDataFinal(prevData.data_inicial);

            return { ...prevData, data_final: novaDataFinal };
        });
    }, [data.recorrencia]);

    const diasSemana = useMemo(() => diasDaSemana(semanaVisivel, hoje), [semanaVisivel, hoje]);

    const navegarParaSemana = (novaData: Date) => {
        const routeName = isEditMode ? 'reservas.edit' : 'espacos.show';
        const routeParams = isEditMode ? { reserva: reserva!.id } : { espaco: espaco.id };
        router.get(
            route(routeName, routeParams),
            { semana: format(novaData, 'yyyy-MM-dd') },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onStart: () => setIsLoading(true),
                onFinish: () => setIsLoading(false),
            },
        );
    };

    const irParaSemanaAnterior = () => navegarParaSemana(subWeeks(semanaVisivel, 1));
    const irParaProximaSemana = () => navegarParaSemana(addWeeks(semanaVisivel, 1));
    const irParaSemanaAtual = () => navegarParaSemana(hoje);

    const limparSelecao = () => setSlotsSelecao([]);
    const isSlotSelecionado = (slot: SlotCalendario) => slotsSelecao.some((s) => s.id === slot.id);

    const alternarSelecaoSlot = (slot: SlotCalendario) => {
        if (slot.status === 'reservado') {
            return;
        }

        // Determina o slot alvo: o slot original ou um novo slot deslocado para o futuro.
        let targetSlot = slot;
        const isPast = slot.data < hoje;
        if (isPast) {
            const novaData = addWeeks(slot.data, 1);
            targetSlot = {
                ...slot,
                data: novaData,
                id: `${format(novaData, 'yyyy-MM-dd')}|${slot.horario_inicio}`,
            };
            toast.info(`O horário de ${format(slot.data, 'EEEE', { locale: ptBR })} foi movido para o dia ${format(novaData, 'dd/MM/yyyy')}.`);
        }

        // Verifica se o slot alvo (possivelmente deslocado) já está na seleção.
        const isCurrentlySelected = slotsSelecao.some((s) => s.id === targetSlot.id);

        let novaSelecao;
        if (isCurrentlySelected) {
            // Remove o slot alvo se já estiver selecionado.
            novaSelecao = slotsSelecao.filter((s) => s.id !== targetSlot.id);
        } else {
            // Adiciona o slot alvo se não estiver selecionado.
            novaSelecao = [...slotsSelecao, targetSlot].sort(
                (a, b) => a.data.getTime() - b.data.getTime() || a.horario_inicio.localeCompare(b.horario_inicio),
            );
        }

        setSlotsSelecao(novaSelecao);
    };

    const handleFormSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (data.horarios_solicitados.length === 0) {
            toast.error('Selecione pelo menos um horário para reservar.');
            return;
        }

        // Atualiza a data da semana de edição antes de enviar
        setData((prevData) => ({ ...prevData, edited_week_date: format(semanaVisivel, 'yyyy-MM-dd') }));

        const options = {
            onSuccess: () => {
                limparSelecao();
                setDialogAberto(false);
                reset(); // Reseta o formulário do Inertia
                toast.success(isEditMode ? 'Sua reserva foi enviada para atualização!' : 'Solicitação enviada para processamento!');
            },
            onError: (formErrors: Record<string, string>) => {
                toast.error(Object.values(formErrors)[0] || 'Ocorreu um erro de validação.');
            },
        };

        if (isEditMode) {
            patch(route('reservas.update', { reserva: reserva?.id }), options);
        } else {
            post(route('reservas.store'), options);
        }
    };

    const gestoresPorTurno = useMemo(() => {
        const gestores = new Map();
        agendas?.forEach((agenda) => {
            if (agenda.user) {
                gestores.set(agenda.turno, {
                    nome: agenda.user.name,
                    email: agenda.user.email,
                    departamento: agenda.user.setor?.nome ?? 'N/I',
                    agenda_id: agenda.id,
                });
            }
        });
        return gestores;
    }, [agendas]);

    return (
        <div className="container mx-auto max-w-7xl space-y-4 py-4">
            {isEditMode && reserva && <AgendaEditModeAlert reserva={reserva} />}
            <AgendaHeader espaco={espaco} gestoresPorTurno={gestoresPorTurno} />
            <AgendaNavegacao
                semanaAtual={semanaVisivel}
                onAnterior={irParaSemanaAnterior}
                onProxima={irParaProximaSemana}
                onReset={irParaSemanaAtual}
            />

            <div className="relative">
                <AgendaCalendario
                    diasSemana={diasSemana}
                    isSlotSelecionado={isSlotSelecionado}
                    alternarSelecaoSlot={alternarSelecaoSlot}
                    semanaInicio={semanaVisivel}
                    agendas={agendas || []}
                    slotsDaReserva={slotsSelecao} // ADICIONE ESTA LINHA
                />
                {isLoading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-white/70 backdrop-blur-sm">
                        <Loader2 className="text-primary h-8 w-8 animate-spin" />
                    </div>
                )}
            </div>

            {slotsSelecao.length > 0 && (
                <div className="fixed right-4 bottom-4 z-20 flex flex-col items-end gap-2">
                    <AgendaDialogReserva
                        isOpen={dialogAberto}
                        onOpenChange={setDialogAberto}
                        onSubmit={handleFormSubmit}
                        slotsSelecao={slotsSelecao}
                        hoje={hoje}
                        isSubmitting={processing} // Usar o 'processing' do useForm
                        isEditMode={isEditMode}
                        espaco={espaco}
                        // Passar o objeto 'data' e a função 'setData' do useForm
                        formData={data}
                        setFormData={setData}
                        setSlotsSelecao={setSlotsSelecao}
                    />
                    <Button variant="outline" size="sm" onClick={limparSelecao}>
                        Limpar seleção
                    </Button>
                </div>
            )}
        </div>
    );
}
