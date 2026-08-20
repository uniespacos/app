export const HORARIOS_PADRAO = {
    manha: ['07:30 - 08:20', '08:20 - 09:10', '09:10 - 10:00', '10:10 - 11:00', '11:00 - 11:50', '11:50 - 12:40'],
    tarde: ['13:10 - 14:00', '14:00 - 14:50', '14:50 - 15:40', '15:50 - 16:40', '16:40 - 17:30', '17:30 - 18:20'],
    noite: ['18:20 - 19:10', '19:10 - 20:00', '20:00 - 20:50', '20:50 - 21:40', '21:40 - 22:30'],
} as const;

export type Turno = keyof typeof HORARIOS_PADRAO;

/**
 * Ordem canônica de exibição dos turnos (issue #101).
 *
 * Nem `Espaco::agendas()` nem `EspacoRepositoryEloquent::getAllByInstituicao`
 * aplicam ORDER BY, então a ordem em que as agendas chegam do backend é a que o
 * banco resolver dar. Qualquer lista de turnos na UI precisa impor esta ordem —
 * e a partir daqui, de um único lugar.
 */
export const TURNOS_ORDENADOS: readonly Turno[] = ['manha', 'tarde', 'noite'];

export const TURNO_LABEL: Record<Turno, string> = {
    manha: 'Manhã',
    tarde: 'Tarde',
    noite: 'Noite',
};
