import { getStatusReservaColor, getStatusReservaText } from '@/lib/utils';
import { SituacaoReserva } from '@/types';

interface SituacaoIndicatorProps {
    situacao: SituacaoReserva;
}

export function SituacaoIndicator({ situacao }: SituacaoIndicatorProps) {
    return (
        <span className="flex items-center gap-2">
            <span className={`h-3 w-3 rounded-full ${getStatusReservaColor(situacao)}`}></span>
            <span className="text-sm font-medium">{getStatusReservaText(situacao)}</span>
        </span>
    );
}
