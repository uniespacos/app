import AppLayout from '@/layouts/app-layout';
import AgendaEspaço from '@/pages/Espacos/fragments/EspacoAgenda';
import { BreadcrumbItem, Espaco, Reserva } from '@/types';
import { Head } from '@inertiajs/react';

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
            <Head />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <AgendaEspaço isEditMode={!!reserva} reserva={reserva} espaco={espaco} semana={semana} />
            </div>
        </AppLayout>
    );
}
