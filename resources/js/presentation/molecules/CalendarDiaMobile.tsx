import { derivarSlotsDoTurno, type SlotDerivado } from '@/application/espacos/helpers/derivar-slots-do-turno';
import { TURNOS_ORDENADOS, TURNO_LABEL, type Turno } from '@/constants/turnos';
import { cn } from '@/lib/utils';
import { Agenda, AgendaDiasSemanaType, SlotCalendario } from '@/types';
import { useMemo, useState } from 'react';

type CalendarDiaMobileProps = {
    diasSemana: AgendaDiasSemanaType[];
    agendas: Agenda[];
    isSlotSelecionado: (slot: SlotCalendario) => boolean;
    alternarSelecaoSlot: (slot: SlotCalendario) => void;
    slotsDaReserva?: SlotCalendario[];
};

const ROTULO_STATUS: Record<SlotCalendario['status'], string> = {
    livre: 'Livre',
    reservado: 'Reservado',
    selecionado: 'Selecionado',
    solicitado: 'Em análise',
    deferida: 'Deferida',
    indeferida: 'Indeferida',
};

/**
 * Mesma semântica de cor da célula do desktop (calendar-slot-cell), aplicada
 * numa faixa lateral em vez do fundo da linha inteira: em tela estreita o fundo
 * colorido competia com o texto e derrubava o contraste.
 */
const COR_STATUS: Record<SlotCalendario['status'], string> = {
    livre: 'bg-muted-foreground/25',
    reservado: 'bg-blue-400',
    selecionado: 'bg-primary',
    solicitado: 'bg-yellow-400',
    deferida: 'bg-green-500',
    indeferida: 'bg-red-400',
};

/**
 * Visão do calendário para telas estreitas.
 *
 * A grade semanal tem `min-w-[800px]` por construção — sete colunas de dia mais
 * a coluna de horas não cabem em celular nenhum, e forçá-las produz rolagem
 * lateral dentro de rolagem vertical, que é onde os usuários se perdiam.
 *
 * Aqui a semana vira um dia por vez. Mostrar os sete dias empilhados daria por
 * volta de 120 linhas de rolagem (3 turnos x ~6 faixas x 7 dias), o que não é
 * navegável.
 *
 * Os slots vêm de `derivarSlotsDoTurno`, a mesma função que alimenta a grade do
 * desktop. Isso é deliberado: derivação duplicada faria as visões divergirem, e
 * um slot livre no celular que está reservado no desktop vira reserva sobreposta.
 */
export default function CalendarDiaMobile({ diasSemana, agendas, isSlotSelecionado, alternarSelecaoSlot, slotsDaReserva }: CalendarDiaMobileProps) {
    const indiceInicial = Math.max(
        diasSemana.findIndex((dia) => dia.ehHoje),
        0,
    );
    const [indiceDia, setIndiceDia] = useState(indiceInicial);

    const diaVisivel = diasSemana[indiceDia];

    const agendasOrdenadas = useMemo(
        () => [...agendas].filter((a) => a.user).sort((a, b) => TURNOS_ORDENADOS.indexOf(a.turno) - TURNOS_ORDENADOS.indexOf(b.turno)),
        [agendas],
    );

    const slotsPorTurno = useMemo(() => {
        if (!diaVisivel) {
            return [] as Array<{ turno: Turno; slots: SlotDerivado[] }>;
        }

        return agendasOrdenadas.map((agenda) => ({
            turno: agenda.turno as Turno,
            slots: derivarSlotsDoTurno(agenda, [diaVisivel], slotsDaReserva),
        }));
    }, [agendasOrdenadas, diaVisivel, slotsDaReserva]);

    if (!diaVisivel) {
        return null;
    }

    return (
        <div className="rounded-xl border">
            {/* Seletor de dia — alvos de toque de 44px, o mínimo confortável para o dedo */}
            <div className="flex border-b" role="tablist" aria-label="Dia da semana">
                {diasSemana.map((dia, indice) => {
                    const ativo = indice === indiceDia;

                    return (
                        <button
                            key={dia.valor}
                            type="button"
                            role="tab"
                            aria-selected={ativo}
                            aria-label={`${dia.nome}, dia ${dia.diaMes}`}
                            onClick={() => setIndiceDia(indice)}
                            className={cn(
                                'relative flex min-h-[52px] flex-1 flex-col items-center justify-center gap-0.5 py-2 transition-colors',
                                'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset',
                                ativo ? 'text-primary' : 'text-muted-foreground hover:bg-muted/50',
                            )}
                        >
                            <span className="text-[11px] leading-none font-medium capitalize">{dia.abreviado}</span>
                            <span
                                className={cn(
                                    'flex h-7 w-7 items-center justify-center rounded-full text-sm tabular-nums',
                                    ativo && 'bg-primary text-primary-foreground font-semibold',
                                    !ativo && dia.ehHoje && 'text-primary font-semibold',
                                )}
                            >
                                {dia.diaMes.split('/')[0]}
                            </span>

                            {/* Indicador de hoje quando o dia não é o selecionado */}
                            {dia.ehHoje && !ativo && <span className="bg-primary absolute bottom-1 h-1 w-1 rounded-full" />}
                        </button>
                    );
                })}
            </div>

            {slotsPorTurno.length === 0 && <p className="text-muted-foreground p-4 text-center text-sm">Nenhum turno disponível neste espaço.</p>}

            {slotsPorTurno.map(({ turno, slots }) => (
                <div key={turno}>
                    <div className="text-muted-foreground bg-muted/60 px-3 py-1.5 text-[11px] font-semibold tracking-wide uppercase">
                        {TURNO_LABEL[turno] ?? turno}
                    </div>

                    {slots.map(({ horaLabel, slot }) => {
                        const selecionado = isSlotSelecionado(slot);
                        const clicavel = slot.status !== 'reservado' && !slot.isLocked;
                        const status = selecionado ? 'selecionado' : slot.status;

                        return (
                            <button
                                key={slot.id}
                                type="button"
                                disabled={!clicavel}
                                onClick={clicavel ? () => alternarSelecaoSlot(slot) : undefined}
                                className={cn(
                                    'flex min-h-[52px] w-full items-center gap-3 border-b px-3 py-2 text-left transition-colors last:border-b-0',
                                    'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset',
                                    clicavel ? 'hover:bg-muted/50' : 'cursor-not-allowed',
                                    selecionado && 'bg-primary/10',
                                    slot.isPast && !selecionado && 'opacity-55',
                                )}
                            >
                                {/* Faixa de cor à esquerda: o status fica legível sem
                                    depender de tingir a linha inteira, que empastelava
                                    o texto. */}
                                <span className={cn('h-8 w-1 shrink-0 rounded-full', COR_STATUS[status])} aria-hidden />

                                <span className="text-sm font-medium tabular-nums">{horaLabel}</span>

                                {/* Ao contrário da célula da grade, aqui há largura
                                    para o título inteiro da reserva. */}
                                <span className="text-muted-foreground ml-auto truncate text-right text-xs">
                                    {slot.status === 'reservado' && !selecionado ? slot.dadosReserva?.reserva_titulo : ROTULO_STATUS[status]}
                                </span>
                            </button>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}
