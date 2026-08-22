import GenericHeader from '@/presentation/molecules/generic-header';
import AppLayout from '@/presentation/templates/app-layout';
import { Andar, Espaco, Modulo, Unidade, User } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { PlusCircle } from 'lucide-react';
import { useState } from 'react';
import EspacoFiltroBusca from '@/presentation/organisms/EspacoFiltroBusca';
import { GerenciarGestoresDialog } from '@/presentation/organisms/GerenciarGestoresDialog';
import PaginacaoListas from '@/presentation/molecules/paginacao-listas';
import { TabelaEspacos } from '@/presentation/organisms/TabelaEspacos';
const breadcrumbs = [
    {
        title: 'Gerenciar Espaços',
        href: '/institucional/espacos',
    },
];
export default function GerenciarEspacos() {
    const { unidades, modulos, andares, espacos, users, filters, capacidadeEspacos } = usePage<{
        espacos: {
            data: Espaco[];
            links: { url: string | null; label: string; active: boolean }[];
            total: number;
        };
        unidades: Unidade[];
        modulos: Modulo[];
        andares: Andar[];
        users: User[];
        filters: {
            search?: string;
            unidade?: string;
            modulo?: string;
            andar?: string;
            capacidade?: string;
        };
        capacidadeEspacos: number[];
    }>().props;

    const [espacoParaGerenciar, setEspacoParaGerenciar] = useState<Espaco | null>(null);

    const handleCadastrarEspaco = () => {
        router.get(route('institucional.espacos.create'));
    };
    const handleGerenciarGestores = (espaco: Espaco) => {
        setEspacoParaGerenciar(espaco);
    };

    const handleSalvarGestores = (espacoId: number, gestores: Record<string, number | null>) => {
        router.patch(route('institucional.espacos.alterarGestores', espacoId), { gestores: gestores });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gerenciar Espaços" />
            <div className="flex">
                {/* `w-[100vh]` aqui usava a ALTURA da viewport como largura: num
                    celular de 390px o container ficava com 844px e a página
                    inteira rolava lateralmente. */}
                <div className="container mx-auto w-full flex-1 space-y-6 py-6">
                    <div className="space-y-6 p-6">
                        {/* Cabeçalho */}
                        <GenericHeader
                            titulo={'Gerenciar Espaços'}
                            descricao={'Gerencie todos os espaços disponíveis, seus dados e gestores'}
                            buttonText="Cadastrar Espaço"
                            ButtonIcon={PlusCircle}
                            buttonOnClick={handleCadastrarEspaco}
                            canSeeButton // Exibe o botão apenas para
                        />

                        {/* Filtros */}
                        <EspacoFiltroBusca
                            route={route('institucional.espacos.index')}
                            unidades={unidades}
                            modulos={modulos}
                            andares={andares}
                            filters={filters}
                            capacidadeEspacos={capacidadeEspacos}
                        />

                        {/* Tabela de Espaços */}
                        {!espacoParaGerenciar ? (
                            <TabelaEspacos espacos={espacos.data} onGerenciarGestores={handleGerenciarGestores} totalFiltrado={espacos.total} />
                        ) : (
                            <GerenciarGestoresDialog
                                key={espacoParaGerenciar.id}
                                espaco={espacoParaGerenciar}
                                usuarios={users}
                                isOpen={!!espacoParaGerenciar}
                                onClose={() => { setEspacoParaGerenciar(null); }}
                                onSave={handleSalvarGestores}
                            />
                        )}

                        <PaginacaoListas links={espacos.links} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
