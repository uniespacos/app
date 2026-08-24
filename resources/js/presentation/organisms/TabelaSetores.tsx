import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ColumnDef, DataTable } from '@/presentation/molecules/DataTable';
import DeleteItem from '@/presentation/molecules/delete-item';
import { ViewMode, ViewModeToggle } from '@/presentation/molecules/ViewModeToggle';
import { Setor, User } from '@/types';
import { Edit, Trash2, Users } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

interface Props {
    setores: Setor[];
    usuarios?: User[];
    pagination?: {
        links: { url?: string | null; label: string; active?: boolean }[];
        meta?: object;
    };
    onEdit: (setor: Setor) => void;
    onViewUsuarios: (setor: Setor) => void;
}

export function TabelaSetores({ setores, usuarios, pagination, onEdit, onViewUsuarios }: Props) {
    const [viewMode, setViewMode] = useState<ViewMode>('table');
    const [removerSetor, setRemoverSetor] = useState<Setor | undefined>();

    const getUsuariosDoSetor = useCallback(
        (setor: Setor) => {
            if (typeof setor.users_count === 'number') {
                return setor.users_count;
            }
            return usuarios?.filter((user) => user.setor?.id === setor.id).length ?? 0;
        },
        [usuarios],
    );

    const columns = useMemo<ColumnDef<Setor>[]>(
        () => [
            {
                header: 'Setor',
                cell: (setor) => (
                    <div>
                        <div className="font-medium">{setor.nome}</div>
                        <div className="text-muted-foreground text-sm">Sigla: {setor.sigla}</div>
                    </div>
                ),
            },
            {
                header: 'Unidade',
                cell: (setor) => (
                    <div>
                        <div className="font-medium">{setor.unidade?.nome}</div>
                        <div className="text-muted-foreground text-sm">{setor.unidade?.sigla}</div>
                    </div>
                ),
            },
            {
                header: 'Instituição',
                cell: (setor) => (
                    <div>
                        <div className="font-medium">{setor.unidade?.instituicao?.nome}</div>
                        <div className="text-muted-foreground text-sm">{setor.unidade?.instituicao?.sigla}</div>
                    </div>
                ),
            },
            {
                header: 'Usuários',
                align: 'center',
                width: '110px',
                cell: (setor) => (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            onViewUsuarios(setor);
                        }}
                        className="flex items-center gap-1"
                    >
                        <Users className="h-4 w-4" />
                        <Badge variant="secondary">{getUsuariosDoSetor(setor)}</Badge>
                    </Button>
                ),
            },
        ],
        [getUsuariosDoSetor, onViewUsuarios],
    );

    const renderCard = (setor: Setor) => (
        <Card key={setor.id} className="transition-shadow hover:shadow-md">
            <CardContent className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                        <h4 className="truncate text-base font-semibold">{setor.nome}</h4>
                        <p className="text-muted-foreground text-sm">Sigla: {setor.sigla}</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            onViewUsuarios(setor);
                        }}
                        className="flex shrink-0 items-center gap-1"
                    >
                        <Users className="h-4 w-4" />
                        <Badge variant="secondary">{getUsuariosDoSetor(setor)}</Badge>
                    </Button>
                </div>
                <div className="text-muted-foreground space-y-0.5 text-sm">
                    <p className="truncate">
                        Unidade: {setor.unidade?.nome} ({setor.unidade?.sigla})
                    </p>
                    <p className="truncate">Instituição: {setor.unidade?.instituicao?.sigla}</p>
                </div>
                <div className="flex justify-end gap-2 border-t pt-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            onEdit(setor);
                        }}
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                            setRemoverSetor(setor);
                        }}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <>
            <DataTable
                data={setores}
                columns={columns}
                viewMode={viewMode}
                renderCard={renderCard}
                gridClassName="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                cardTitle="Setores Cadastrados"
                cardDescription={`${String(setores.length)} setor(es) encontrado(s)`}
                cardHeaderAction={<ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />}
                pagination={pagination}
                emptyState={{
                    title: 'Nenhum setor encontrado',
                    description: 'Nenhum setor cadastrado para os filtros selecionados.',
                }}
                actions={(setor) => (
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                onEdit(setor);
                            }}
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                                setRemoverSetor(setor);
                            }}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            />
            {removerSetor && (
                <DeleteItem
                    itemName={removerSetor.sigla}
                    route={route('institucional.setors.destroy', { setor: removerSetor.id })}
                    isOpen={(open) => {
                        if (!open) {
                            setRemoverSetor(undefined);
                        }
                    }}
                />
            )}
        </>
    );
}
