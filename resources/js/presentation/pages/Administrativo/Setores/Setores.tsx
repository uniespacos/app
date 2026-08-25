import { useDebouncedSearch } from '@/hooks/use-debounced-search';
import { useTranslation } from '@/i18n';
import GenericHeader from '@/presentation/molecules/GenericHeader';
import { ModaisSetor } from '@/presentation/organisms/ModaisSetor';
import { FiltrosSetor } from '@/presentation/organisms/FiltrosSetor';
import { TabelaSetores } from '@/presentation/organisms/TabelaSetores';
import AppLayout from '@/presentation/templates/AppLayout';
import { Instituicao, Setor, Unidade } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { PlusCircle } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs = [
    {
        title: 'Gerenciar Setores',
        href: '/institucional/setores',
    },
];

export default function SetoresPage() {
    const { t } = useTranslation();
    const { instituicao, unidades, setores, filters } = usePage<{
        instituicao: Instituicao;
        unidades: Unidade[];
        setores: {
            data: Setor[];
            links: { url: string | null; label: string; active: boolean }[];
            total: number;
        };
        filters?: { search: string | null; unidade_id: number | null };
    }>().props;

    const [selectedUnidade, setSelectedUnidade] = useState<string>(filters?.unidade_id ? String(filters.unidade_id) : 'all');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingSetor, setEditingSetor] = useState<Setor | null>(null);
    const [viewingUsuarios, setViewingUsuarios] = useState<Setor | null>(null);

    const { searchTerm, setSearchTerm } = useDebouncedSearch({
        routeName: 'institucional.setors.index',
        initialSearch: filters?.search ?? '',
        extraParams: {
            unidade_id: selectedUnidade !== 'all' ? selectedUnidade : undefined,
        },
    });

    const handleUnidadeChange = (unidadeId: string) => {
        setSelectedUnidade(unidadeId);
        router.get(
            route('institucional.setors.index'),
            {
                search: searchTerm || undefined,
                unidade_id: unidadeId !== 'all' ? unidadeId : undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setSelectedUnidade('all');
        router.get(
            route('institucional.setors.index'),
            {},
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('admin.setores.titulo')} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <GenericHeader
                    titulo={t('admin.setores.titulo')}
                    descricao={t('admin.setores.desc')}
                    canSeeButton
                    buttonText={t('admin.setores.novo')}
                    ButtonIcon={PlusCircle}
                    buttonOnClick={() => {
                        setIsCreateModalOpen(true);
                    }}
                />

                <FiltrosSetor
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    selectedUnidade={selectedUnidade}
                    setSelectedUnidade={handleUnidadeChange}
                    unidades={unidades}
                    filteredUnidades={unidades}
                    onClearFilters={handleClearFilters}
                />

                <TabelaSetores
                    setores={setores.data}
                    pagination={{ links: setores.links }}
                    onEdit={setEditingSetor}
                    onViewUsuarios={setViewingUsuarios}
                />

                <ModaisSetor
                    isCreateModalOpen={isCreateModalOpen}
                    setIsCreateModalOpen={setIsCreateModalOpen}
                    editingSetor={editingSetor}
                    setEditingSetor={setEditingSetor}
                    viewingUsuarios={viewingUsuarios}
                    setViewingUsuarios={setViewingUsuarios}
                    instituicao={instituicao}
                    unidades={unidades}
                />
            </div>
        </AppLayout>
    );
}
