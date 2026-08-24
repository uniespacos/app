import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ColumnDef, DataTable } from '@/presentation/molecules/DataTable';
import DeleteItem from '@/presentation/molecules/delete-item';
import { Setor, User } from '@/types';
import { Edit, Trash2, Users } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

interface Props {
    setores: Setor[];
    usuarios?: User[];
    onEdit: (setor: Setor) => void;
    onViewUsuarios: (setor: Setor) => void;
}

export function TabelaSetores({ setores, usuarios, onEdit, onViewUsuarios }: Props) {
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

    return (
        <>
            <DataTable
                data={setores}
                columns={columns}
                cardTitle="Setores Cadastrados"
                cardDescription={`${String(setores.length)} setor(es) encontrado(s)`}
                emptyState={{
                    title: 'Nenhum setor encontrado',
                    description: 'Nenhum setor cadastrado para a unidade selecionada.',
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
