import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Reserva } from '@/types';
import { Pencil } from 'lucide-react';

type AgendaEditModeAlertProps = { reserva: Reserva };

export default function AgendaEditModeAlert({ reserva }: AgendaEditModeAlertProps) {
    return (
        <Alert variant="default" className="border-warning/25 bg-warning-subtle text-warning-accent">
            <Pencil className="h-4 w-4 !text-warning-accent" />
            <AlertTitle className="font-semibold !text-warning-accent">Modo de Edição</AlertTitle>
            <AlertDescription className="!text-warning-accent">
                Você está editando a reserva: <strong>Titulo: {reserva.titulo} </strong> As alterações nos horários e detalhes serão salvas nesta
                reserva.
            </AlertDescription>
        </Alert>
    );
}
