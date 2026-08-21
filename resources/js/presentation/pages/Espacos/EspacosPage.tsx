import GenericHeader from '@/presentation/molecules/generic-header';
import AppLayout from '@/presentation/templates/app-layout';
import { Andar, Espaco, Modulo, Unidade, User } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import EspacoCard from '@/presentation/organisms/EspacoCard';
import EspacoFiltroBusca from '@/presentation/organisms/EspacoFiltroBusca';
import PaginacaoListas from '@/presentation/molecules/paginacao-listas';
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
        user,
        espacos: { data: espacos, links },
        filters,
        capacidadeEspacos,
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
            <div className="flex">
                {/* Container duplicado (mx-auto duas vezes, py-6 + p-6
                    empilhados) somava ~48px de padding vertical sem motivo —
                    mesmo padrão já corrigido em ReservasPage/GerenciarEspacos. */}
                <div className="container mx-auto w-full flex-1 space-y-6 py-6">
                    <div className="space-y-6 p-6">
                        {/* A descrição falava de cadastrar/excluir/editar espaços —
                            texto da tela administrativa de gerenciamento, copiado
                            para a tela de consulta onde o usuário só vê e reserva. */}
                        <GenericHeader titulo="Consultar espaços" descricao="Veja os espaços disponíveis e solicite sua reserva" />

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
                                <EspacoCard key={espaco.id} espaco={espaco} user={user} handleSolicitarReserva={handleSolicitarReserva} />
                            ))}
                        </div>

                        {/* Paginação reimplementada na mão aqui, sem `flex-wrap`
                            (uma lista longa de páginas vazava/rolava na horizontal
                            no celular) e sem preserveState/preserveScroll no Link
                            (cada clique perdia a posição de rolagem e o estado da
                            página). PaginacaoListas já resolve os dois. */}
                        <PaginacaoListas links={links} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
