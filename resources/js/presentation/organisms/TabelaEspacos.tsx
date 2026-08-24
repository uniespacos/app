import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { getAndarLabelByValue } from '@/lib/utils/andars/AndarOptions';
import { ColumnDef, DataTable } from '@/presentation/molecules/DataTable';
import DeleteItem from '@/presentation/molecules/delete-item';
import { GestoresEspaco } from '@/presentation/molecules/GestoresEspaco';
import { Espaco } from '@/types';
import { router } from '@inertiajs/react';
import { Edit, MoreHorizontal, Trash2, Users } from 'lucide-react';
import { useMemo, useState } from 'react';

interface TabelaEspacosProps {
    espacos: Espaco[];
    totalFiltrado: number;
    pagination?: {
        links: { url?: string | null; label: string; active?: boolean }[];
        meta?: object;
    };
    onGerenciarGestores: (espaco: Espaco) => void;
}

export function TabelaEspacos({ espacos, totalFiltrado, pagination, onGerenciarGestores }: TabelaEspacosProps) {
    const [removerEspaco, setRemoverEspaco] = useState<Espaco | undefined>(undefined);

    const columns = useMemo<ColumnDef<Espaco>[]>(
        () => [
            {
                header: 'Espaço',
                cell: (espaco) => (
                    <div>
                        <div className="font-medium">{espaco.nome}</div>
                        <div className="text-muted-foreground max-w-[200px] truncate text-sm">{espaco.descricao}</div>
                    </div>
                ),
            },
            {
                header: 'Localização',
                cell: (espaco) => (
                    <div className="text-sm">
                        <div className="font-medium">{espaco.andar?.modulo?.unidade?.instituicao?.sigla}</div>
                        <div>{espaco.andar?.modulo?.unidade?.nome}</div>
                        <div className="text-muted-foreground">
                            {espaco.andar?.modulo?.nome} - {espaco.andar?.nome ? getAndarLabelByValue(espaco.andar.nome) : null}
                        </div>
                    </div>
                ),
            },
            {
                header: 'Capacidade',
                cell: (espaco) => <Badge variant="secondary">{espaco.capacidade_pessoas} pessoas</Badge>,
            },
            {
                header: 'Gestores por Turno',
                cell: (espaco) => <GestoresEspaco agendas={espaco.agendas} />,
            },
        ],
        [],
    );

    return (
        <>
            <DataTable
                data={espacos}
                columns={columns}
                cardTitle={`Espaços Cadastrados (${totalFiltrado})`}
                pagination={pagination}
                emptyState={{
                    title: 'Nenhum espaço encontrado',
                    description: 'Tente ajustar os filtros ou cadastre um novo espaço para que ele apareça aqui.',
                    action: (
                        <Button
                            onClick={() => {
                                router.get(route('institucional.espacos.create'));
                            }}
                        >
                            Cadastrar Primeiro Espaço
                        </Button>
                    ),
                }}
                actions={(espaco) => (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={() => {
                                    router.get(route('institucional.espacos.edit', { espaco: espaco.id }));
                                }}
                            >
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => {
                                    onGerenciarGestores(espaco);
                                }}
                            >
                                <Users className="mr-2 h-4 w-4" />
                                Gerenciar Gestores
                            </DropdownMenuItem>
                            <Separator />
                            <DropdownMenuItem
                                onClick={() => {
                                    setRemoverEspaco(espaco);
                                }}
                                className="text-destructive"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            />
            {removerEspaco && (
                <DeleteItem
                    showHeading={false}
                    itemName={removerEspaco.nome}
                    route={route('institucional.espacos.destroy', { espaco: removerEspaco.id })}
                    isOpen={(open) => {
                        if (!open) {
                            setRemoverEspaco(undefined);
                        }
                    }}
                />
            )}
        </>
    );
}
