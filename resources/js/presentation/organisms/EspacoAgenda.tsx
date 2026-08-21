import { Button } from '@/components/ui/button';
import { cn, diasDaSemana } from '@/lib/utils';
import { Espaco, Reserva } from '@/types';
import { Loader2 } from 'lucide-react';
import { useMemo } from 'react';
import AgendaCalendario from '@/presentation/organisms/AgendaCalendario';
import AgendaDialogReserva from '@/presentation/organisms/AgendaDialogReserva';
import AgendaEditModeAlert from '@/presentation/molecules/AgendaEditModeAlert';
import AgendaHeader from '@/presentation/molecules/AgendaHeader';
import AgendaNavegacao from '@/presentation/molecules/AgendaNavegacao';
import { useAgendaSelectionUseCase } from '@/application/espacos/use-cases/use-agenda-selection-usecase';
import { useAgendaNavigation } from '@/hooks/use-agenda-navigation';
import { parseISO } from 'date-fns';

type AgendaEspacoProps = {
    isEditMode?: boolean;
    espaco: Espaco;
    reserva?: Reserva;
    semana: { referencia: string };
};

export default function AgendaEspaço({ isEditMode = false, espaco, reserva, semana }: AgendaEspacoProps) {
    const { agendas } = espaco;
    const hoje = useMemo(() => new Date(new Date().setHours(0, 0, 0, 0)), []);

    const semanaInicial = useMemo(() => parseISO(semana.referencia), [semana.referencia]);
    const routeName = isEditMode ? 'reservas.edit' : 'espacos.show';
    const routeParams = useMemo(() => (isEditMode ? { reserva: reserva!.id } : { espaco: espaco.id }), [isEditMode, reserva, espaco.id]);

    const {
        semanaVisivel,
        isLoading,
        irParaSemanaAnterior,
        irParaProximaSemana,
        irParaSemanaAtual,
    } = useAgendaNavigation({
        semanaInicial,
        routeName,
        routeParams,
    });

    const {
        slotsSelecao,
        alternarSelecaoSlot,
        isSlotSelecionado,
        limparSelecao,
        setSlotsSelecao,
        dialogAberto,
        setDialogAberto,
        formData,
        setFormData,
        processing,
        handleFormSubmit,
    } = useAgendaSelectionUseCase({
        espaco,
        reserva,
        isEditMode,
        semanaVisivel,
    });

    const diasSemana = useMemo(() => diasDaSemana(semanaVisivel, hoje), [semanaVisivel, hoje]);

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
        /*
            O painel de ação é `fixed`, e a lista de horários do mobile não tem
            scroll próprio — é a página inteira que rola. Sem espaço reservado
            no fim, o último horário ficava fisicamente atrás do painel fixo:
            visível, mas o clique caía no painel, não no slot. `pb-40` no
            mobile abre espaço suficiente para rolar o último item para cima do
            painel (dois botões empilhados + padding do card); `sm:pb-24` cobre
            o layout em linha do desktop, mais raso.
        */
        <div className={cn('container mx-auto max-w-7xl space-y-4 py-4', slotsSelecao.length > 0 && 'pb-40 sm:pb-24')}>
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
                    slotsDaReserva={slotsSelecao}
                />
                {isLoading && (
                    <div className="bg-background/70 absolute inset-0 z-10 flex items-center justify-center rounded-md backdrop-blur-sm">
                        <Loader2 className="text-primary h-8 w-8 animate-spin" />
                    </div>
                )}
            </div>

            {slotsSelecao.length > 0 && (
                /*
                    Antes eram dois elementos soltos, cada um com sua própria
                    largura intrínseca: o botão "Reservar" virava uma faixa azul
                    cheia (whitespace-normal + w-full) e "Limpar seleção"
                    boiava, pequeno, à direita — sem nada os ligando visualmente,
                    e sem contraste contra a lista rolando por trás, então
                    parecia flutuar sobre o conteúdo em vez de ser uma barra de
                    ação. Envolvê-los num painel elevado (mesma linguagem visual
                    dos cards do app: bg-card, border, shadow) resolve as duas
                    coisas — os dois botões passam a pertencer ao mesmo grupo, e
                    o painel se separa claramente do que está atrás dele.
                */
                <div className="fixed right-4 bottom-4 left-4 z-20 sm:left-auto sm:max-w-sm">
                    <div className="bg-card flex flex-col-reverse gap-2 rounded-xl border p-3 shadow-lg sm:flex-row sm:items-center">
                        <Button variant="outline" onClick={limparSelecao} className="sm:w-auto">
                            Limpar seleção
                        </Button>
                        <AgendaDialogReserva
                            isOpen={dialogAberto}
                            onOpenChange={setDialogAberto}
                            onSubmit={handleFormSubmit}
                            slotsSelecao={slotsSelecao}
                            hoje={hoje}
                            isSubmitting={processing}
                            isEditMode={isEditMode}
                            espaco={espaco}
                            formData={formData}
                            setFormData={setFormData}
                            setSlotsSelecao={setSlotsSelecao}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
