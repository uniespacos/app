import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Reserva } from '@/types';
import { Pencil } from 'lucide-react';

type AgendaEditModeAlertProps = { reserva: Reserva };

export default function AgendaEditModeAlert({ reserva }: AgendaEditModeAlertProps) {
    return (
        <Alert variant="default" className="border-yellow-400 bg-yellow-50 text-yellow-800">
            <Pencil className="h-4 w-4 !text-yellow-600" />
            <AlertTitle className="font-semibold !text-yellow-900">Modo de Edição</AlertTitle>
            <AlertDescription className="!text-yellow-700">
                Você está editando a reserva: <strong>Titulo: {reserva.titulo} </strong> As alterações nos horários e detalhes serão salvas nesta
                reserva.
            </AlertDescription>
        </Alert>
    );
}
