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
        let timer: ReturnType<typeof setTimeout> | undefined;

        const handleUpdate = () => {
            // Uma única reserva emite 'created' e logo em seguida 'validated';
            // o debounce colapsa a rajada num único request.
            clearTimeout(timer);
            timer = setTimeout(() => {
                // `only: ['espaco']` mantém 'semana' e, principalmente, 'flash'
                // fora da resposta — sem isso, a reserva feita por outro usuário
                // dispararia um toast sem sentido aqui (app-layout.tsx observa
                // `flash`). preserveScroll/preserveState não aparecem aqui porque
                // `reload()` já os força internamente (por isso ReloadOptions os omite).
                router.reload({ only: ['espaco'] });
            }, 400);
        };

        document.addEventListener('reserva:updated', handleUpdate);

        return () => {
            document.removeEventListener('reserva:updated', handleUpdate);
            clearTimeout(timer);
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
