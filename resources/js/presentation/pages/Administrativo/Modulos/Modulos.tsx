import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDebouncedSearch } from '@/hooks/use-debounced-search';
import { ColumnDef, DataTable } from '@/presentation/molecules/DataTable';
import DeleteItem from '@/presentation/molecules/DeleteItem';
import GenericHeader from '@/presentation/molecules/GenericHeader';
import { SearchFilter } from '@/presentation/molecules/SearchFilter';
import AppLayout from '@/presentation/templates/AppLayout';
import type { Modulo, Unidade } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Building, ChevronDown, ChevronRight, Edit, Layers, PlusCircle, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

const breadcrumbs = [
    {
        title: 'Gerenciar Módulos',
        href: '/institucional/modulos',
    },
];

const tiposAcessoColors: Record<string, string | undefined> = {
    Livre: 'bg-success-subtle text-success-accent border-success/25',
    Restrito: 'bg-warning-subtle text-warning-accent border-warning/25',
    Controlado: 'bg-destructive-subtle text-destructive-accent border-destructive/25',
};

const nivelLabels: Record<number, string | undefined> = {
    0: 'Térreo',
    1: '1º Andar',
    2: '2º Andar',
    3: '3º Andar',
    4: '4º Andar',
    5: '5º Andar',
    '-1': 'Subsolo',
    '-2': '2º Subsolo',
};

function nomeParaNivel(nome: string): number {
    if (nome === 'terreo') return 0;
    if (nome === 'subsolo') return -1;
    const match = /(\d+)/.exec(nome);
    if (match?.[1]) {
        return parseInt(match[1], 10);
    }
    return 0;
}

function nivelParaLabel(nivel: number): string {
    return nivelLabels[nivel] ?? `${String(nivel)}º Andar`;
}

export default function Modulos() {
    const { modulos, unidades, filters } = usePage<{
        modulos: {
            data: Modulo[];
            links: { url: string | null; label: string; active: boolean }[];
            meta: object;
        };
        unidades: Unidade[];
        filters?: { search: string | null; unidade_id: string | null };
    }>().props;

    const [selectedUnidade, setSelectedUnidade] = useState<string>(filters?.unidade_id ?? 'all');
    const [expandedModulos, setExpandedModulos] = useState<Record<number, boolean>>({});
    const [removerModulo, setRemoverModulo] = useState<Modulo | null>(null);

    const { searchTerm, setSearchTerm } = useDebouncedSearch({
        routeName: 'institucional.modulos.index',
        initialSearch: filters?.search ?? '',
        extraParams: {
            unidade_id: selectedUnidade !== 'all' ? selectedUnidade : '',
        },
    });

    const toggleModulo = (moduloId: number) => {
        setExpandedModulos((prev) => ({
            ...prev,
            [moduloId]: !prev[moduloId],
        }));
    };

    const handleUnidadeChange = (unidadeId: string) => {
        setSelectedUnidade(unidadeId);
        router.get(
            route('institucional.modulos.index'),
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

    const columns = useMemo<ColumnDef<Modulo>[]>(
        () => [
            {
                id: 'modulo',
                header: 'Módulo',
                enableSorting: true,
                cell: (modulo) => (
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-lg">
                            <Layers className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="text-foreground font-semibold">{modulo.nome}</div>
                            <div className="text-muted-foreground text-xs">{String(modulo.andars?.length ?? 0)} andar(es)</div>
                        </div>
                    </div>
                ),
            },
            {
                id: 'unidade',
                header: 'Unidade',
                cell: (modulo) => (
                    <div className="flex items-center gap-2">
                        <Building className="text-muted-foreground h-4 w-4" />
                        <span>{modulo.unidade?.nome ?? 'N/A'}</span>
                        {modulo.unidade?.sigla && (
                            <Badge variant="secondary" className="text-xs">
                                {modulo.unidade.sigla}
                            </Badge>
                        )}
                    </div>
                ),
            },
            {
                id: 'instituicao',
                header: 'Instituição',
                cell: (modulo) => <span className="text-sm font-medium">{modulo.unidade?.instituicao?.sigla ?? 'N/A'}</span>,
            },
            {
                id: 'andares',
                header: 'Andares',
                cell: (modulo) => (
                    <div className="flex flex-wrap gap-1">
                        {modulo.andars && modulo.andars.length > 0 ? (
                            modulo.andars.slice(0, 3).map((andar) => (
                                <Badge key={andar.id} variant="outline" className="text-xs">
                                    {nivelParaLabel(nomeParaNivel(andar.nome))}
                                </Badge>
                            ))
                        ) : (
                            <span className="text-muted-foreground text-xs">Sem andares</span>
                        )}
                        {modulo.andars && modulo.andars.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                                +{String(modulo.andars.length - 3)}
                            </Badge>
                        )}
                    </div>
                ),
            },
        ],
        [],
    );

    const renderCard = (modulo: Modulo) => {
        const isExpanded = expandedModulos[modulo.id] ?? false;
        return (
            <Card key={modulo.id} className="border-border transition-shadow hover:shadow-md">
                <Collapsible
                    open={isExpanded}
                    onOpenChange={() => {
                        toggleModulo(modulo.id);
                    }}
                >
                    <CollapsibleTrigger asChild>
                        <CardHeader className="hover:bg-muted/50 cursor-pointer p-4 transition-colors">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex min-w-0 flex-1 items-center space-x-3">
                                    <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                                        <Layers className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <CardTitle className="truncate text-base font-semibold">{modulo.nome}</CardTitle>
                                        <p className="text-muted-foreground truncate text-xs">
                                            {modulo.unidade?.nome} ({modulo.unidade?.sigla}) • {String(modulo.andars?.length ?? 0)} andar(es)
                                        </p>
                                    </div>
                                </div>
                                <div className="flex shrink-0 items-center gap-1">
                                    <Link
                                        href={route('institucional.modulos.edit', { modulo: modulo.id })}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                        }}
                                    >
                                        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Editar módulo">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive hover:text-destructive h-8 w-8"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setRemoverModulo(modulo);
                                        }}
                                        aria-label="Excluir módulo"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                    {isExpanded ? (
                                        <ChevronDown className="text-muted-foreground h-4 w-4" />
                                    ) : (
                                        <ChevronRight className="text-muted-foreground h-4 w-4" />
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                        <CardContent className="border-border/60 border-t p-4 pt-0">
                            <div className="space-y-4">
                                <div className="bg-muted/30 space-y-1 rounded-lg p-3 text-xs">
                                    <div>
                                        <span className="text-foreground font-semibold">Instituição:</span> {modulo.unidade?.instituicao?.nome} (
                                        {modulo.unidade?.instituicao?.sigla})
                                    </div>
                                    <div>
                                        <span className="text-foreground font-semibold">Endereço:</span> {modulo.unidade?.instituicao?.endereco}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-foreground mb-2 text-xs font-semibold tracking-wider uppercase">Andares do Módulo</h4>
                                    {modulo.andars && modulo.andars.length > 0 ? (
                                        <div className="space-y-2">
                                            {modulo.andars
                                                .sort((a, b) => nomeParaNivel(a.nome) - nomeParaNivel(b.nome))
                                                .map((andar) => (
                                                    <div
                                                        key={andar.id}
                                                        className="bg-card flex items-center justify-between gap-2 rounded-md border p-2.5 text-xs"
                                                    >
                                                        <div>
                                                            <div className="text-foreground font-medium">
                                                                {nivelParaLabel(nomeParaNivel(andar.nome))}
                                                            </div>
                                                            <div className="text-muted-foreground">Nível: {String(nomeParaNivel(andar.nome))}</div>
                                                        </div>
                                                        <div className="flex flex-wrap gap-1">
                                                            {andar.tipo_acesso.map((tipo) => (
                                                                <Badge
                                                                    key={tipo}
                                                                    variant="outline"
                                                                    className={tiposAcessoColors[tipo] ?? 'bg-muted text-foreground'}
                                                                >
                                                                    {tipo}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground text-xs">Nenhum andar cadastrado para este módulo.</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </CollapsibleContent>
                </Collapsible>
            </Card>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Módulos" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <GenericHeader
                    titulo="Gerenciar Módulos"
                    descricao="Aqui você consegue gerenciar os módulos das unidades"
                    buttonText="Criar novo"
                    buttonLink={route('institucional.modulos.create')}
                    ButtonIcon={PlusCircle}
                    canSeeButton={true}
                />

                <Card>
                    <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-end">
                        <div className="w-full flex-1">
                            <SearchFilter
                                searchTerm={searchTerm}
                                onSearchTermChange={setSearchTerm}
                                placeholder="Buscar módulo por nome..."
                                variant="plain"
                            />
                        </div>

                        <div className="space-y-2 sm:w-[220px]">
                            <Label>Unidade</Label>
                            <Select value={selectedUnidade} onValueChange={handleUnidadeChange}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Todas as Unidades" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas as Unidades</SelectItem>
                                    {unidades.map((unidade) => (
                                        <SelectItem key={unidade.id} value={unidade.id.toString()}>
                                            {unidade.nome} ({unidade.sigla})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <DataTable
                    data={modulos.data}
                    columns={columns}
                    autoCardViewOnMobile={true}
                    enableColumnVisibility={true}
                    renderCard={renderCard}
                    gridClassName="grid gap-4 grid-cols-1"
                    pagination={{ links: modulos.links }}
                    emptyState={{
                        title: 'Nenhum módulo encontrado',
                        description: 'Tente ajustar sua busca ou cadastre um novo módulo.',
                    }}
                    actions={(modulo) => (
                        <div className="flex justify-end gap-2">
                            <Link href={route('institucional.modulos.edit', { modulo: modulo.id })}>
                                <Button variant="outline" size="sm" className="gap-1 text-xs">
                                    <Edit className="h-3 w-3" />
                                    Editar
                                </Button>
                            </Link>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                    setRemoverModulo(modulo);
                                }}
                                className="gap-1 text-xs"
                            >
                                <Trash2 className="h-3 w-3" />
                                Excluir
                            </Button>
                        </div>
                    )}
                />

                {removerModulo && (
                    <DeleteItem
                        itemName={removerModulo.nome}
                        isOpen={(open) => {
                            if (!open) {
                                setRemoverModulo(null);
                            }
                        }}
                        route={route('institucional.modulos.destroy', { modulo: removerModulo.id })}
                    />
                )}
            </div>
        </AppLayout>
    );
}
