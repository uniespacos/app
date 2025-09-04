import GenericHeader from '@/components/generic-header';
import AppLayout from '@/layouts/app-layout';
import { Andar, Espaco, Modulo, Unidade, User } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import EspacoCard from './fragments/EspacoCard';
import EspacoFiltroBusca from './fragments/EspacoFiltroBusca';
const breadcrumbs = [
    {
        title: 'Consultar Espaços',
        href: '/espacos',
    },
];

export default function EspacosPage() {
    const {
        andares,
        modulos,
        unidades,
        user: { permission_type_id },
        espacos: { data: espacos, links },
        filters,
        capacidadeEspacos
    } = usePage<{
        espacos: {
            data: Espaco[];
            links: { url: string | null; label: string; active: boolean }[];
            meta: object; // Contém 'from', 'to', 'total', etc.
        };
        unidades: Unidade[];
        modulos: Modulo[];
        andares: Andar[];
        filters: {
            // Recebe os filtros atuais do controller
            search?: string;
            unidade?: string;
            modulo?: string;
            andar?: string;
            capacidade?: string;
        };
        user: User;
        capacidadeEspacos: number[]; // Mapeia capacidade para total de espaços
    }>().props;
    // Função para solicitar reserva
    const handleSolicitarReserva = (espacoId: string) => {
        router.get(`/espacos/${espacoId}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Espacos" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="container mx-auto space-y-6 py-6">
                    <div className="container mx-auto space-y-6 p-6">
                        <GenericHeader
                            titulo="Consultar espaços"
                            descricao="Gerencie todos os espaços disponíveis, cadastre novos,exclua ou edite os existentes"
                        />

                        {/* Todo o conteúdo a partir dos filtros até o final em uma única div */}
                        <div>
                            <EspacoFiltroBusca
                                route={route('espacos.index')}
                                unidades={unidades}
                                modulos={modulos}
                                andares={andares}
                                filters={filters}
                                capacidadeEspacos={capacidadeEspacos}
                            />
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                                {espacos.map((espaco) => (
                                    <EspacoCard
                                        key={espaco.id}
                                        espaco={espaco}
                                        userType={permission_type_id}
                                        handleSolicitarReserva={handleSolicitarReserva}
                                    />
                                ))}
                            </div>
                        </div>
                        {/* Componente de Paginação */}
                        <div className="mt-6 flex justify-center">
                            <div className="flex gap-1">
                                {links.map((link, index) =>
                                    link.url ? (
                                        <Link
                                            key={index}
                                            href={link.url}
                                            className={`rounded-md border px-4 py-2 text-sm ${link.active ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-accent'}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ) : (
                                        <span
                                            key={index}
                                            className="text-muted-foreground rounded-md border px-4 py-2 text-sm"
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ),
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
