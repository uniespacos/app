import type { SituacaoReserva } from '@/types';

/**
 * Estilo visual de cada situação de reserva, em um lugar só.
 *
 * Antes existiam quatro definições divergentes do que é "deferida", cada uma
 * com um tom diferente do verde do Tailwind: o badge usava a escala 50/200/700,
 * getStatusReservaColor usava a 500, a célula do calendário a 100/300 e a lista
 * mobile a 500 de novo.
 *
 * Quatro tons para o mesmo significado, e nenhum deles reagia ao modo escuro —
 * um texto na escala 700 sobre fundo escuro fica ilegível. Os tokens semânticos
 * (success/warning/info/destructive) resolvem os dois problemas: uma definição
 * por significado, e o próprio token troca de valor no tema escuro.
 */
export type EstiloSituacao = {
    /** Rótulo em português, já acentuado. */
    label: string;
    /** Preenchimento pálido + texto de contraste, para badges. */
    badge: string;
    /** Tom sólido, para pontos e faixas de status. */
    solido: string;
    /** Preenchimento de célula do calendário. */
    celula: string;
};

export const ESTILO_SITUACAO: Record<SituacaoReserva, EstiloSituacao> = {
    em_analise: {
        label: 'Em Análise',
        badge: 'border-warning-accent/30 bg-warning-subtle text-warning-accent',
        solido: 'bg-warning',
        celula: 'border-warning-accent/30 bg-warning-subtle',
    },
    parcialmente_deferida: {
        label: 'Parcialmente Deferida',
        badge: 'border-info-accent/30 bg-info-subtle text-info-accent',
        solido: 'bg-info',
        celula: 'border-info-accent/30 bg-info-subtle',
    },
    deferida: {
        label: 'Deferida',
        badge: 'border-success-accent/30 bg-success-subtle text-success-accent',
        solido: 'bg-success',
        celula: 'border-success-accent/30 bg-success-subtle',
    },
    indeferida: {
        label: 'Indeferida',
        badge: 'border-destructive-accent/30 bg-destructive-subtle text-destructive-accent',
        solido: 'bg-destructive',
        celula: 'border-destructive-accent/30 bg-destructive-subtle',
    },
    inativa: {
        label: 'Inativa / Cancelada',
        badge: 'border-neutral-accent/30 bg-neutral-subtle text-neutral-accent',
        solido: 'bg-neutral-accent',
        celula: 'border-neutral-accent/30 bg-neutral-subtle',
    },
};

/**
 * Estado do slot no calendário. Não é a mesma coisa que a situação da reserva:
 * um slot pode estar `livre` ou `reservado` por terceiro, que não são
 * situações de reserva nenhuma.
 */
export const ESTILO_SLOT = {
    livre: { label: 'Livre', solido: 'bg-muted-foreground/25' },
    reservado: { label: 'Reservado', solido: 'bg-info' },
    selecionado: { label: 'Selecionado', solido: 'bg-primary' },
    solicitado: { label: 'Em análise', solido: 'bg-warning' },
    deferida: { label: 'Deferida', solido: 'bg-success' },
    indeferida: { label: 'Indeferida', solido: 'bg-destructive' },
} as const;
