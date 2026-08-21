import { Button } from '@/components/ui/button';
import { diasDaSemana } from '@/lib/utils';
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
                    slotsDaReserva={slotsSelecao}
                />
                {isLoading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-white/70 backdrop-blur-sm">
                        <Loader2 className="text-primary h-8 w-8 animate-spin" />
                    </div>
                )}
            </div>

            {slotsSelecao.length > 0 && (
                /*
                    Sem limite de largura, o botão "Reservar N horários em M
                    dias" — texto dinâmico, `whitespace-nowrap` por padrão —
                    podia crescer além da tela em 360px com só `right-4`
                    ancorando um dos lados. `left-4` mais `max-w-[calc(100%-2rem)]`
                    mantêm o balão sempre dentro da viewport.
                */
                <div className="fixed right-4 bottom-4 left-4 z-20 flex flex-col items-end gap-2 sm:left-auto sm:max-w-[calc(100%-2rem)]">
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
                    <Button variant="outline" size="sm" onClick={limparSelecao}>
                        Limpar seleção
                    </Button>
                </div>
            )}
        </div>
    );
}
