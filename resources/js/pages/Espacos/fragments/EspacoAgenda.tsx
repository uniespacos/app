import { Button } from '@/components/ui/button';
import {
    AgendaGestoresPorTurnoType,
    Espaco,
    OpcoesRecorrencia,
    Reserva,
    ReservaFormData,
    SlotCalendario,
    ValorOcorrenciaType,
} from '@/types';
import { useForm } from '@inertiajs/react';
import { addDays, addMonths, addWeeks, format,  parse, startOfWeek, subWeeks } from 'date-fns';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import AgendaCalendario from './AgendaCalendario';
import AgendaDialogReserva from './AgendaDialogReserva';
import AgendaEditModeAlert from './AgendaEditModeAlert';
import AgendaHeader from './AgendaHeader';
import AgendaNavegacao from './AgendaNavegacao';
import { diasDaSemana } from '@/lib/utils';

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
};

export default function AgendaEspaço({ isEditMode = false, espaco, reserva }: AgendaEspacoProps) {
    const { agendas } = espaco;
    const hoje = useMemo(() => new Date(new Date().setHours(0, 0, 0, 0)), []);

    const slotsIniciais = useMemo(
        () =>
            !isEditMode || !reserva?.horarios
                ? []
                : reserva.horarios.map(
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
                ),
        [isEditMode, reserva],
    );

    const [semanaAtual, setSemanaAtual] = useState(() => startOfWeek(slotsIniciais.length > 0 ? slotsIniciais[0].data : hoje, { weekStartsOn: 1 }));
    const [slotsSelecao, setSlotsSelecao] = useState<SlotCalendario[]>(slotsIniciais);
    const [dialogAberto, setDialogAberto] = useState(false);
    const [recorrencia, setRecorrencia] = useState<ValorOcorrenciaType>(reserva?.recorrencia || 'unica');

    const { data, setData, post, patch, reset, processing } = useForm<ReservaFormData>({
        titulo: reserva?.titulo ?? '',
        descricao: reserva?.descricao ?? '',
        data_inicial: reserva?.data_inicial ? new Date(reserva.data_inicial) : hoje,
        data_final: reserva?.data_final ? new Date(reserva.data_final) : addMonths(hoje, 1),
        recorrencia: reserva?.recorrencia ?? 'unica',
        horarios_solicitados: reserva?.horarios ?? [],
    });

    const { gestoresPorTurno } = useMemo(() => {
        const gestores = new Map<string, AgendaGestoresPorTurnoType>();
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
        return { gestoresPorTurno: gestores };
    }, [agendas]);

    useEffect(() => {
        // Se não existir recorrecia
        const opcaoRecorrencia = opcoesRecorrencia.find((op) => op.valor === recorrencia);
        if (!opcaoRecorrencia || slotsSelecao.length === 0) return;
        const dataInicialCalculada = new Date(Math.min(...slotsSelecao.map((s) => s.data.getTime())));

        const dataFinalCalculada =
            recorrencia !== 'personalizado'
                ? recorrencia === 'unica'
                    ? new Date(Math.max(...slotsSelecao.map((s) => s.data.getTime())))
                    : opcaoRecorrencia.calcularDataFinal(dataInicialCalculada)
                : data.data_final;

        setData((prevData) => ({
            ...prevData,
            data_inicial: dataInicialCalculada,
            data_final: dataFinalCalculada,
        }));
    }, [recorrencia, setData, slotsSelecao]);

    const diasSemana = useMemo(
        () => diasDaSemana(semanaAtual, hoje),
        [semanaAtual, hoje],
    );


    const irParaSemanaAnterior = () => setSemanaAtual(subWeeks(semanaAtual, 1));
    const irParaProximaSemana = () => setSemanaAtual(addWeeks(semanaAtual, 1));
    const limparSelecao = () => setSlotsSelecao([]);
    const isSlotSelecionado = (slot: SlotCalendario) => slotsSelecao.some((s) => s.id === slot.id);

    const alternarSelecaoSlot = (slot: SlotCalendario) => {
        if (slot.status !== 'livre') return;
        const novaSelecao = isSlotSelecionado(slot)
            ? slotsSelecao.filter((s) => s.id !== slot.id)
            : [...slotsSelecao, slot].sort((a, b) => a.data.getTime() - b.data.getTime() || a.horario_inicio.localeCompare(b.horario_inicio));
        setSlotsSelecao(novaSelecao);
    };
    useEffect(() => {
        setData((prevData) => ({
            ...prevData,
            horarios_solicitados: slotsSelecao.map((s) => ({
                data: format(s.data, 'yyyy-MM-dd'),
                horario_inicio: s.horario_inicio,
                horario_fim: s.horario_fim,
                agenda_id: s.agenda_id,
            })),
        }));
    }, [setData, slotsSelecao]);

    const handleFormSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (slotsSelecao.length === 0) {
            toast.error('Selecione pelo menos um horário para reservar.');
            return;
        }
        const options = {
            onSuccess: () => {
                limparSelecao();
                setDialogAberto(false);
                reset();
                toast.success(isEditMode ? 'Reserva atualizada com sucesso!' : 'Reserva solicitada com sucesso!');
            },
            onError: (errors: Record<string, string>) => {
                toast.error((Object.values(errors)[0] as string) || 'Ocorreu um erro de validação.');
            },
        };
        if (isEditMode) {
            patch(route('reservas.update', { reserva: reserva?.id }), options);
        } else {
            post(route('reservas.store'), options);
        }
    };

    return (
        <div className="container mx-auto max-w-7xl space-y-4 py-4">
            {isEditMode && reserva && <AgendaEditModeAlert reserva={reserva} />}
            <AgendaHeader espaco={espaco} gestoresPorTurno={gestoresPorTurno} />
            <AgendaNavegacao semanaAtual={semanaAtual} onAnterior={irParaSemanaAnterior} onProxima={irParaProximaSemana} />
            <AgendaCalendario
                diasSemana={diasSemana}
                isSlotSelecionado={isSlotSelecionado}
                alternarSelecaoSlot={alternarSelecaoSlot}
                semanaInicio={semanaAtual}
                agendas={agendas || []} />

            {slotsSelecao.length > 0 && (
                <div className="fixed right-4 bottom-4 z-20 flex flex-col items-end gap-2">
                    <AgendaDialogReserva
                        isOpen={dialogAberto}
                        isEditMode={isEditMode}
                        onOpenChange={setDialogAberto}
                        onSubmit={handleFormSubmit}
                        formData={data}
                        setFormData={setData}
                        recorrencia={recorrencia}
                        setRecorrencia={setRecorrencia}
                        slotsSelecao={slotsSelecao}
                        hoje={hoje}
                        isSubmitting={processing}
                    />
                    <Button variant="outline" size="sm" onClick={limparSelecao}>
                        Limpar seleção
                    </Button>
                </div>
            )}
        </div>
    );
}
