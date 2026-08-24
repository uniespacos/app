import { SituacaoReserva } from '@/types';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface SituacaoIconProps {
    situacao: SituacaoReserva | string;
    className?: string;
}

export function SituacaoIcon({ situacao, className = 'h-4 w-4' }: SituacaoIconProps) {
    switch (situacao) {
        case 'deferida':
            return <CheckCircle className={`${className} text-success-accent`} />;
        case 'indeferida':
            return <XCircle className={`${className} text-destructive`} />;
        default:
            return <AlertCircle className={`${className} text-warning-accent`} />;
    }
}
