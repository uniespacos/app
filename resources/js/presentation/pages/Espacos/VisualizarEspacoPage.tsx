import { useEffect } from 'react';
import AppLayout from '@/presentation/templates/app-layout';
import AgendaEspaço from '@/presentation/organisms/EspacoAgenda';
import { BreadcrumbItem, Espaco, Reserva } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useReservationLiveUpdates } from '@/hooks/useReservationLiveUpdates';

export default function VisualizarEspaço({
    espaco,
    reserva,
    isEditMode,
    semana,
}: {
    espaco: Espaco;
    reserva?: Reserva;
    isEditMode?: boolean;
    semana: {
        // A página agora espera receber a prop 'semana'
        inicio: string;
        fim: string;
        referencia: string;
    };
}) {
    useReservationLiveUpdates();

    useEffect(() => {
        const handleUpdate = () => {
            router.reload();
        };

        document.addEventListener('reserva:updated', handleUpdate);

        return () => {
            document.removeEventListener('reserva:updated', handleUpdate);
        };
    }, []);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: isEditMode ? 'Reservas' : 'Espaços',
            href: isEditMode ? '/reservas' : '/espacos',
        },
        {
            title: isEditMode ? 'Editar' : 'Visualizar agenda',
            href: isEditMode ? `reservas/${reserva?.id}/edit` : '/espaço/agenda',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Agenda - ${espaco.nome}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <AgendaEspaço isEditMode={!!reserva} reserva={reserva} espaco={espaco} semana={semana} />
            </div>
        </AppLayout>
    );
}
