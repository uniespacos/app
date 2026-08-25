import { Button } from '@/components/ui/button';
import { useDebouncedSearch } from '@/hooks/use-debounced-search';
import { ColumnDef, DataTable } from '@/presentation/molecules/DataTable';
import DeleteItem from '@/presentation/molecules/DeleteItem';
import GenericHeader from '@/presentation/molecules/GenericHeader';
import { SearchFilter } from '@/presentation/molecules/SearchFilter';
import AppLayout from '@/presentation/templates/AppLayout';
import type { Instituicao } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { FilePenLine, PlusCircle, Trash2 } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs = [
    {
        title: 'Gerenciar Instituições',
        href: '/institucional/instituicoes',
    },
];

const columns: ColumnDef<Instituicao>[] = [
    { id: 'nome', header: 'Nome', accessorKey: 'nome', enableSorting: true },
    { id: 'sigla', header: 'Sigla', accessorKey: 'sigla', width: '120px', enableSorting: true },
    { id: 'endereco', header: 'Endereço', accessorKey: 'endereco' },
];

export default function InstituicoesPage() {
    const { instituicoes, filters } = usePage<{
        instituicoes: {
            data: Instituicao[];
            links: { url: string | null; label: string; active: boolean }[];
            meta: object;
        };
        filters?: { search: string | null };
    }>().props;

    const [removerInstituicao, setRemoverInstituicao] = useState<Instituicao | null>(null);
    const { searchTerm, setSearchTerm } = useDebouncedSearch({
        routeName: 'institucional.instituicoes.index',
        initialSearch: filters?.search ?? '',
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Instituições" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <GenericHeader
                    titulo="Gerenciar Instituições"
                    descricao="Aqui você consegue gerenciar as instituicoes cadastradas"
                    buttonText="Criar Nova"
                    buttonLink={route('institucional.instituicoes.create')}
                    ButtonIcon={PlusCircle}
                    canSeeButton={true}
                />
                <SearchFilter searchTerm={searchTerm} onSearchTermChange={setSearchTerm} placeholder="Buscar por nome ou sigla" variant="card" />
                <DataTable
                    data={instituicoes.data}
                    columns={columns}
                    autoCardViewOnMobile={true}
                    enableColumnVisibility={true}
                    pagination={{ links: instituicoes.links }}
                    emptyState={{
                        title: 'Nenhuma instituição encontrada',
                        description: 'Tente ajustar sua busca ou cadastre uma nova instituição.',
                    }}
                    actions={(instituicao) => (
                        <div className="flex justify-end gap-2">
                            <Link href={route('institucional.instituicoes.edit', { instituico: instituicao.id })}>
                                <Button variant="outline" size="icon" aria-label="Editar instituição">
                                    <FilePenLine className="h-4 w-4" />
                                </Button>
                            </Link>
                            <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => {
                                    setRemoverInstituicao(instituicao);
                                }}
                                aria-label="Excluir instituição"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                />
                {removerInstituicao && (
                    <DeleteItem
                        isOpen={(open) => {
                            if (!open) {
                                setRemoverInstituicao(null);
                            }
                        }}
                        itemName={removerInstituicao.nome}
                        route={route('institucional.instituicoes.destroy', removerInstituicao.id)}
                    />
                )}
            </div>
        </AppLayout>
    );
}
