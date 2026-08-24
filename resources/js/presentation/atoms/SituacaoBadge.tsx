import { Badge } from '@/components/ui/badge';
import { ESTILO_SITUACAO } from '@/constants/situacao-reserva';
import { cn } from '@/lib/utils';
import { SituacaoReserva } from '@/types';
import { CheckCircle, Clock, XSquare } from 'lucide-react';
import type { ComponentType } from 'react';

interface SituacaoBadgeProps {
    situacao: SituacaoReserva;
    className?: string;
}

const ICONE: Record<SituacaoReserva, ComponentType<{ className?: string }>> = {
    em_analise: Clock,
    parcialmente_deferida: CheckCircle,
    deferida: CheckCircle,
    indeferida: XSquare,
    inativa: XSquare,
};

export function SituacaoBadge({ situacao, className }: SituacaoBadgeProps) {
    const estilo = ESTILO_SITUACAO[situacao];

    if (!estilo) {
        return null;
    }

    const Icone = ICONE[situacao];

    return (
        <Badge variant="outline" className={cn('flex items-center gap-1', estilo.badge, className)}>
            <Icone className="h-3 w-3" />
            {estilo.label}
        </Badge>
    );
}
