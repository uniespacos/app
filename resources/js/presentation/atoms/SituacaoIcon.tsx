import { SituacaoReserva } from '@/types';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface SituacaoIconProps {
    situacao: SituacaoReserva | string;
    className?: string;
}

export function SituacaoIcon({ situacao, className = 'h-4 w-4' }: SituacaoIconProps) {
    switch (situacao) {
        case 'deferida':
            return <CheckCircle className={`${className} text-green-600`} />;
        case 'indeferida':
            return <XCircle className={`${className} text-red-600`} />;
        default:
            return <AlertCircle className={`${className} text-yellow-600`} />;
    }
}
