import AppLayout from '@/layouts/app-layout';
import AgendaEspaço from '@/pages/Espacos/fragments/EspacoAgenda';
import { BreadcrumbItem, Espaco, Reserva } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function VisualizarEspaço({ espaco, reserva, isEditMode, semana, navegacao }: {
    espaco: Espaco; reserva?: Reserva; isEditMode?: boolean, semana: {
        inicio: string;
        fim: string;
        referencia: string;
    },
    navegacao: {
        anterior: Espaco | null;
        seguinte: Espaco | null;
    }
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
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">{espaco.nome}</h1>
                    <div className="flex gap-2">
                        <Link href={navegacao.anterior ? route('espacos.show', navegacao.anterior.id) : '#'} disabled={!navegacao.anterior}>
                            <Button variant="outline" disabled={!navegacao.anterior}>
                                <ChevronLeft className="h-4 w-4" />
                                Anterior
                            </Button>
                        </Link>
                        <Link href={navegacao.seguinte ? route('espacos.show', navegacao.seguinte.id) : '#'} disabled={!navegacao.seguinte}>
                            <Button variant="outline" disabled={!navegacao.seguinte}>
                                Próximo
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
                <AgendaEspaço isEditMode={!!reserva} reserva={reserva} espaco={espaco} semana={semana} />
            </div>
        </AppLayout>
    );
}
