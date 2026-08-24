import { Button } from '@/components/ui/button';
import { useDebouncedSearch } from '@/hooks/use-debounced-search';
import { ColumnDef, DataTable } from '@/presentation/molecules/DataTable';
import DeleteItem from '@/presentation/molecules/delete-item';
import GenericHeader from '@/presentation/molecules/generic-header';
import { SearchFilter } from '@/presentation/molecules/SearchFilter';
import AppLayout from '@/presentation/templates/app-layout';
import { Instituicao, Unidade } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { FilePenLine, PlusCircle, Trash2 } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs = [
    {
        title: 'Gerenciar Unidades',
        href: '/institucional/unidades',
    },
];

const columns: ColumnDef<Unidade>[] = [
    { header: 'Nome', accessorKey: 'nome' },
    { header: 'Sigla', accessorKey: 'sigla', width: '120px' },
    { header: 'Instituição', cell: (unidade) => unidade.instituicao?.sigla ?? 'N/A' },
];

export default function UnidadesPage() {
    const { unidades, filters } = usePage<{
        unidades: {
            data: Unidade[];
            links: { url: string | null; label: string; active: boolean }[];
            meta: object;
        };
        instituicoes: Instituicao[];
        filters?: { search: string | null };
    }>().props;

    const [removerUnidade, setRemoverUnidade] = useState<Unidade | null>(null);
    const { searchTerm, setSearchTerm } = useDebouncedSearch({
        routeName: 'institucional.unidades.index',
        initialSearch: filters?.search ?? '',
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Unidades" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="container mx-auto space-y-6 py-6">
                    <div className="container mx-auto space-y-6 p-6">
                        <GenericHeader
                            titulo="Gerenciar Unidades"
                            descricao="Aqui você consegue gerenciar as unidades cadastradas"
                            buttonText="Criar nova"
                            buttonLink={route('institucional.unidades.create')}
                            ButtonIcon={PlusCircle}
                            canSeeButton={true}
                        />
                        <SearchFilter
                            searchTerm={searchTerm}
                            onSearchTermChange={setSearchTerm}
                            placeholder="Buscar por nome ou sigla"
                            variant="card"
                        />
                        <DataTable
                            data={unidades.data}
                            columns={columns}
                            pagination={{ links: unidades.links }}
                            emptyState={{
                                title: 'Nenhuma unidade encontrada',
                                description: 'Tente ajustar sua busca ou cadastre uma nova unidade.',
                            }}
                            actions={(unidade) => (
                                <div className="flex justify-end gap-2">
                                    <Link href={route('institucional.unidades.edit', { unidade: unidade.id })}>
                                        <Button variant="outline" size="icon">
                                            <FilePenLine className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        onClick={() => {
                                            setRemoverUnidade(unidade);
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        />
                        {removerUnidade && (
                            <DeleteItem
                                isOpen={(open) => {
                                    if (!open) {
                                        setRemoverUnidade(null);
                                    }
                                }}
                                itemName={removerUnidade.nome}
                                route={route('institucional.unidades.destroy', removerUnidade.id)}
                            />
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
