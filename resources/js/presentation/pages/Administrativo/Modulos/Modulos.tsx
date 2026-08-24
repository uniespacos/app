import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDebouncedSearch } from '@/hooks/use-debounced-search';
import DeleteItem from '@/presentation/molecules/delete-item';
import GenericHeader from '@/presentation/molecules/generic-header';
import PaginacaoListas from '@/presentation/molecules/paginacao-listas';
import AppLayout from '@/presentation/templates/app-layout';
import { Modulo, Unidade } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Building, ChevronDown, ChevronRight, Edit, Layers, MapPin, PlusCircle, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs = [
    {
        title: 'Gerenciar Módulos',
        href: '/institucional/modulos',
    },
];

const tiposAcessoColors: Record<string, string> = {
    Livre: 'bg-success-subtle text-success-accent border-success/25',
    Restrito: 'bg-warning-subtle text-warning-accent border-warning/25',
    Controlado: 'bg-destructive-subtle text-destructive-accent border-destructive/25',
};

const nivelLabels: Record<number, string> = {
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
    return nivelLabels[nivel] || `${String(nivel)}º Andar`;
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

    const handleClearFilters = () => {
        setSearchTerm('');
        setSelectedUnidade('all');
        router.get(
            route('institucional.modulos.index'),
            {},
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Módulos" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <GenericHeader
                    titulo="Gerenciar Módulos"
                    descricao="Gerencie os módulos e andares das unidades organizacionais"
                    buttonText="Cadastrar módulo"
                    ButtonIcon={PlusCircle}
                    buttonLink={route('institucional.modulos.create')}
                    canSeeButton={true}
                />

                <Card>
                    <CardContent className="p-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            <div className="space-y-2">
                                <Label>Buscar</Label>
                                <div className="relative">
                                    <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                                    <Input
                                        placeholder="Nome ou sigla do módulo..."
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                        }}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Unidade</Label>
                                <Select value={selectedUnidade} onValueChange={handleUnidadeChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Todas as unidades" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todas as unidades</SelectItem>
                                        {unidades.map((unidade) => (
                                            <SelectItem key={unidade.id} value={unidade.id.toString()}>
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4" />
                                                    {unidade.nome} ({unidade.sigla})
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-end gap-2">
                                <Button variant="outline" onClick={handleClearFilters} className="flex-1 bg-transparent">
                                    Limpar Filtros
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    {modulos.data.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                                <Building className="text-muted-foreground mb-4 h-12 w-12" />
                                <h3 className="text-lg font-semibold">Nenhum módulo encontrado</h3>
                                <p className="text-muted-foreground mt-2 text-sm">
                                    {searchTerm || selectedUnidade !== 'all'
                                        ? 'Tente ajustar os filtros de busca'
                                        : 'Comece criando o primeiro módulo da instituição'}
                                </p>
                                {!searchTerm && selectedUnidade === 'all' && (
                                    <Link href={route('institucional.modulos.create')}>
                                        <Button className="mt-4 gap-2">
                                            <PlusCircle className="h-4 w-4" />
                                            Cadastrar Primeiro Módulo
                                        </Button>
                                    </Link>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        modulos.data.map((modulo) => (
                            <div key={modulo.id}>
                                <Card>
                                    <Collapsible
                                        open={expandedModulos[modulo.id]}
                                        onOpenChange={() => {
                                            toggleModulo(modulo.id);
                                        }}
                                    >
                                        <CollapsibleTrigger asChild>
                                            <CardHeader className="hover:bg-muted/50 cursor-pointer transition-colors">
                                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                                    <div className="flex items-start gap-4">
                                                        <div className="bg-primary/10 text-primary mt-1 rounded-lg p-2">
                                                            <Building className="h-6 w-6" />
                                                        </div>
                                                        <div>
                                                            <CardTitle className="text-lg">{modulo.nome}</CardTitle>
                                                            <CardDescription className="mt-1 flex flex-wrap items-center gap-2">
                                                                <span className="flex items-center gap-1">
                                                                    <MapPin className="h-3 w-3" />
                                                                    {modulo.unidade?.nome} ({modulo.unidade?.sigla})
                                                                </span>
                                                                <span>•</span>
                                                                <span className="flex items-center gap-1">
                                                                    <Layers className="h-3 w-3" />
                                                                    {modulo.andars?.length ?? 0} andares
                                                                </span>
                                                            </CardDescription>
                                                        </div>
                                                    </div>

                                                    <div
                                                        className="flex items-center gap-2"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                        }}
                                                    >
                                                        <Link href={route('institucional.modulos.edit', modulo.id)}>
                                                            <Button variant="outline" size="sm" className="gap-1">
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
                                                            className="gap-1"
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                            Excluir
                                                        </Button>
                                                        {expandedModulos[modulo.id] ? (
                                                            <ChevronDown className="h-4 w-4" />
                                                        ) : (
                                                            <ChevronRight className="h-4 w-4" />
                                                        )}
                                                    </div>
                                                </div>
                                            </CardHeader>
                                        </CollapsibleTrigger>

                                        <CollapsibleContent>
                                            <CardContent className="pt-0">
                                                <div className="space-y-4">
                                                    <div className="bg-muted/30 rounded-lg p-4">
                                                        <h4 className="mb-2 font-semibold">Informações da Instituição</h4>
                                                        <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
                                                            <div>
                                                                <span className="font-medium">Nome:</span> {modulo.unidade?.instituicao?.nome}
                                                            </div>
                                                            <div>
                                                                <span className="font-medium">Sigla:</span> {modulo.unidade?.instituicao?.sigla}
                                                            </div>
                                                            <div className="md:col-span-2">
                                                                <span className="font-medium">Endereço:</span> {modulo.unidade?.instituicao?.endereco}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <h4 className="mb-3 font-semibold">Andares do Módulo</h4>
                                                        {modulo.andars && modulo.andars.length > 0 ? (
                                                            <div className="space-y-3">
                                                                {modulo.andars
                                                                    .sort((a, b) => nomeParaNivel(a.nome) - nomeParaNivel(b.nome))
                                                                    .map((andar) => (
                                                                        <div key={andar.id} className="bg-card rounded-lg border p-4">
                                                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                                                <div>
                                                                                    <h5 className="font-medium">
                                                                                        {nivelParaLabel(nomeParaNivel(andar.nome))}
                                                                                    </h5>
                                                                                    <p className="text-muted-foreground text-sm">
                                                                                        Nível: {nomeParaNivel(andar.nome)}
                                                                                    </p>
                                                                                </div>
                                                                                <div className="flex flex-wrap gap-2">
                                                                                    {andar.tipo_acesso.map((tipo) => (
                                                                                        <Badge
                                                                                            key={tipo}
                                                                                            variant="outline"
                                                                                            className={
                                                                                                tiposAcessoColors[tipo] || 'bg-muted text-foreground'
                                                                                            }
                                                                                        >
                                                                                            {tipo}
                                                                                        </Badge>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                            </div>
                                                        ) : (
                                                            <p className="text-muted-foreground text-sm">Nenhum andar cadastrado para este módulo.</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </CollapsibleContent>
                                    </Collapsible>
                                </Card>
                                {removerModulo && removerModulo.id === modulo.id && (
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
                        ))
                    )}
                </div>

                <PaginacaoListas links={modulos.links} />
            </div>
        </AppLayout>
    );
}
