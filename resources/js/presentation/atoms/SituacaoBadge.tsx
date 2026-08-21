import { Badge } from '@/components/ui/badge';
import { ESTILO_SITUACAO } from '@/constants/situacao-reserva';
import { cn } from '@/lib/utils';
import { SituacaoReserva } from '@/types';
import { CheckCircle, Clock, XSquare } from 'lucide-react';
import type { ComponentType } from 'react';

interface SituacaoBadgeProps {
    situacao: SituacaoReserva;
}

const ICONE: Record<SituacaoReserva, ComponentType<{ className?: string }>> = {
    em_analise: Clock,
    parcialmente_deferida: CheckCircle,
    deferida: CheckCircle,
    indeferida: XSquare,
    inativa: XSquare,
};

/**
 * As cores vêm de ESTILO_SITUACAO, não de classes soltas do Tailwind. Antes
 * cada situação repetia aqui o próprio trio de border/bg/text, divergindo dos
 * outros três lugares que também pintam situação.
 *
 * O caso `inativa` carregava `border-black-200 text-black-700` — classes que
 * não existem no Tailwind. Nenhuma cor era aplicada e ninguém percebia, porque
 * o texto simplesmente herdava a cor do pai.
 */
export function SituacaoBadge({ situacao }: SituacaoBadgeProps) {
    const estilo = ESTILO_SITUACAO[situacao];

    if (!estilo) {
        return null;
    }

    const Icone = ICONE[situacao];

    return (
        <Badge variant="outline" className={cn('flex items-center gap-1', estilo.badge)}>
            <Icone className="h-3 w-3" />
            {estilo.label}
        </Badge>
    );
}
