import { Badge } from '@/components/ui/badge';
import { SituacaoReserva } from '@/types';
import { CheckCircle, Clock, XSquare } from 'lucide-react';

interface SituacaoBadgeProps {
    situacao: SituacaoReserva;
}

export function SituacaoBadge({ situacao }: SituacaoBadgeProps) {
    switch (situacao) {
        case 'em_analise':
            return (
                <Badge variant="outline" className="flex items-center gap-1 border-yellow-200 bg-yellow-50 text-yellow-700">
                    <Clock className="h-3 w-3" />
                    Em analise
                </Badge>
            );
        case 'parcialmente_deferida':
            return (
                <Badge variant="outline" className="flex items-center gap-1 border-blue-200 bg-blue-50 text-blue-700">
                    <CheckCircle className="h-3 w-3" />
                    Parcialmente Deferida
                </Badge>
            );
        case 'deferida':
            return (
                <Badge variant="outline" className="flex items-center gap-1 border-green-200 bg-green-50 text-green-700">
                    <CheckCircle className="h-3 w-3" />
                    Deferida
                </Badge>
            );
        case 'indeferida':
            return (
                <Badge variant="outline" className="flex items-center gap-1 border-red-200 bg-red-50 text-red-700">
                    <XSquare className="h-3 w-3" />
                    Indeferida
                </Badge>
            );
        case 'inativa':
            return (
                <Badge variant="outline" className="border-black-200 text-black-700 flex items-center gap-1 bg-gray-50">
                    <XSquare className="h-3 w-3" />
                    Inativa / Cancelada
                </Badge>
            );
        default:
            return null;
    }
}
