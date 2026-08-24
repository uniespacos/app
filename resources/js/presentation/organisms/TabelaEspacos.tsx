import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { getAndarLabelByValue } from '@/lib/utils/andars/AndarOptions';
import { ColumnDef, DataTable } from '@/presentation/molecules/DataTable';
import DeleteItem from '@/presentation/molecules/DeleteItem';
import { GestoresEspaco } from '@/presentation/organisms/GestoresEspaco';
import { ViewMode, ViewModeToggle } from '@/presentation/molecules/ViewModeToggle';
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
    const [viewMode, setViewMode] = useState<ViewMode>('table');
    const [removerEspaco, setRemoverEspaco] = useState<Espaco | undefined>(undefined);

    const renderEspacoActions = (espaco: Espaco) => (
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
    );

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

    const renderCard = (espaco: Espaco) => (
        <Card key={espaco.id} className="transition-shadow hover:shadow-md">
            <CardContent className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                        <h4 className="truncate text-base font-semibold">{espaco.nome}</h4>
                        <p className="text-muted-foreground line-clamp-2 text-sm">{espaco.descricao}</p>
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                        {espaco.capacidade_pessoas} pessoas
                    </Badge>
                </div>
                <div className="text-muted-foreground space-y-0.5 text-sm">
                    <p className="truncate">
                        {espaco.andar?.modulo?.unidade?.instituicao?.sigla} - {espaco.andar?.modulo?.unidade?.nome}
                    </p>
                    <p className="truncate">
                        {espaco.andar?.modulo?.nome} - {espaco.andar?.nome ? getAndarLabelByValue(espaco.andar.nome) : null}
                    </p>
                </div>
                <div className="border-t pt-2">
                    <GestoresEspaco agendas={espaco.agendas} />
                </div>
                <div className="flex justify-end border-t pt-2">{renderEspacoActions(espaco)}</div>
            </CardContent>
        </Card>
    );

    return (
        <>
            <DataTable
                data={espacos}
                columns={columns}
                viewMode={viewMode}
                renderCard={renderCard}
                gridClassName="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                cardTitle={`Espaços Cadastrados (${String(totalFiltrado)})`}
                cardHeaderAction={<ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />}
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
                actions={renderEspacoActions}
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
