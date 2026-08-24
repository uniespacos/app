import GenericHeader from '@/presentation/molecules/generic-header';
import EspacoFiltroBusca from '@/presentation/organisms/EspacoFiltroBusca';
import { GerenciarGestoresModal } from '@/presentation/organisms/GerenciarGestoresModal';
import { TabelaEspacos } from '@/presentation/organisms/TabelaEspacos';
import AppLayout from '@/presentation/templates/app-layout';
import { Andar, Espaco, Modulo, Unidade, User } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { PlusCircle } from 'lucide-react';
import { useState } from 'react';

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
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <GenericHeader
                    titulo={'Gerenciar Espaços'}
                    descricao={'Gerencie todos os espaços disponíveis, seus dados e gestores'}
                    buttonText="Cadastrar Espaço"
                    ButtonIcon={PlusCircle}
                    buttonOnClick={handleCadastrarEspaco}
                    canSeeButton
                />

                <EspacoFiltroBusca
                    route={route('institucional.espacos.index')}
                    unidades={unidades}
                    modulos={modulos}
                    andares={andares}
                    filters={filters}
                    capacidadeEspacos={capacidadeEspacos}
                />

                <TabelaEspacos
                    espacos={espacos.data}
                    onGerenciarGestores={handleGerenciarGestores}
                    totalFiltrado={espacos.total}
                    pagination={{ links: espacos.links }}
                />

                {espacoParaGerenciar && (
                    <GerenciarGestoresModal
                        key={espacoParaGerenciar.id}
                        espaco={espacoParaGerenciar}
                        usuarios={users}
                        isOpen={!!espacoParaGerenciar}
                        onClose={() => {
                            setEspacoParaGerenciar(null);
                        }}
                        onSave={handleSalvarGestores}
                    />
                )}
            </div>
        </AppLayout>
    );
}
