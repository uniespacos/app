import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { nivelParaLabel, nomeParaNivel } from '@/lib/utils/andars/AndarHelpers';
import DeleteItem from '@/presentation/molecules/delete-item';
import GenericHeader from '@/presentation/molecules/generic-header';
import Paginacao from '@/presentation/molecules/paginacao-listas';
import AppLayout from '@/presentation/templates/app-layout';
import { Modulo, Unidade } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Building, ChevronDown, ChevronRight, Edit, Layers, MapPin, PlusCircle, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const breadcrumbs = [
    {
        title: 'Gerenciar Modulos',
        href: '/institucional/modulos',
    },
];

const tiposAcessoColors: Record<string, string> = {
    terreo: 'bg-success-subtle text-success-accent border-success/25',
    escada: 'bg-info-subtle text-info-accent border-info/25',
    elevador: 'bg-warning-subtle text-warning-accent border-warning/25',
    rampa: 'bg-neutral-subtle text-neutral-accent border-neutral-accent/25',
};

export default function ModulosPage() {
    const { modulos, unidades, filters } = usePage<{
        modulos: {
            data: Modulo[];
            links: { url: string | null; label: string; active: boolean }[];
            meta: object;
        };
        unidades?: Unidade[];
        filters?: { search: string | null; unidade: string | null };
    }>().props;

    const [filtroNome, setFiltroNome] = useState(filters?.search ?? '');
    const [filtroUnidade, setFiltroUnidade] = useState(filters?.unidade ?? 'all');
    const [expandedModulos, setExpandedModulos] = useState<Set<number>>(new Set());
    const [removerModulo, setRemoverModulo] = useState<Modulo | null>(null);
    const isInitialMount = useRef(true);

    const toggleModulo = (moduloId: number) => {
        const newExpanded = new Set(expandedModulos);
        if (newExpanded.has(moduloId)) {
            newExpanded.delete(moduloId);
        } else {
            newExpanded.add(moduloId);
        }
        setExpandedModulos(newExpanded);
    };

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        const timeout = setTimeout(() => {
            router.get(
                route('institucional.modulos.index'),
                {
                    search: filtroNome || undefined,
                    unidade: filtroUnidade !== 'all' ? filtroUnidade : undefined,
                },
                { preserveState: true, preserveScroll: true, replace: true },
            );
        }, 400);

        return () => {
            clearTimeout(timeout);
        };
    }, [filtroNome, filtroUnidade]);

    const listaUnidades =
        unidades && unidades.length > 0 ? unidades.map((u) => u.nome) : Array.from(new Set(modulos.data.map((m) => m.unidade?.nome).filter(Boolean)));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Modulos" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="container mx-auto space-y-6 py-6">
                    <div className="container mx-auto space-y-6 p-6">
                        <GenericHeader
                            titulo="Módulos Cadastrados"
                            descricao="Visualize todos os módulos, unidades e andares do sistema"
                            canSeeButton
                            buttonLink={route('institucional.modulos.create')}
                            buttonText="Cadastrar modulo"
                            ButtonIcon={PlusCircle}
                        />

                        <Card>
                            <CardContent>
                                <div className="flex flex-col gap-4 sm:flex-row">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Buscar</Label>
                                        <Input
                                            placeholder="Filtrar por nome do módulo..."
                                            value={filtroNome}
                                            onChange={(e) => {
                                                setFiltroNome(e.target.value);
                                            }}
                                            className="w-full max-w-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Unidade</Label>
                                        <Select value={filtroUnidade} onValueChange={setFiltroUnidade}>
                                            <SelectTrigger className="w-full sm:w-[200px]">
                                                <SelectValue placeholder="Filtrar por unidade" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Todas as unidades</SelectItem>
                                                {listaUnidades.map((unidade) => (
                                                    <SelectItem key={unidade} value={unidade!}>
                                                        {unidade}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="space-y-4">
                            {modulos.data.length === 0 ? (
                                <Card>
                                    <CardContent className="flex flex-col items-center justify-center py-12">
                                        <Layers className="text-muted-foreground mb-4 h-12 w-12" />
                                        <h3 className="mb-2 text-lg font-semibold">Nenhum módulo encontrado</h3>
                                        <p className="text-muted-foreground text-center">Não há módulos que correspondam aos filtros aplicados.</p>
                                    </CardContent>
                                </Card>
                            ) : (
                                modulos.data.map((modulo) => (
                                    <div key={modulo.id}>
                                        <Card className="overflow-hidden">
                                            <Collapsible
                                                open={expandedModulos.has(modulo.id)}
                                                onOpenChange={() => {
                                                    toggleModulo(modulo.id);
                                                }}
                                            >
                                                <CollapsibleTrigger asChild>
                                                    <CardHeader className="hover:bg-muted/50 cursor-pointer transition-colors">
                                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                                            <div className="flex items-center space-x-4">
                                                                <div className="bg-primary/10 rounded-lg p-2">
                                                                    <Building className="text-primary h-6 w-6" />
                                                                </div>
                                                                <div>
                                                                    <CardTitle className="text-lg">{modulo.nome}</CardTitle>
                                                                    <CardDescription className="flex items-center gap-2">
                                                                        <MapPin className="h-4 w-4" />
                                                                        {modulo.unidade?.nome} - {modulo.unidade?.instituicao?.sigla}
                                                                    </CardDescription>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        router.visit(route('institucional.modulos.edit', { modulo: modulo.id }));
                                                                    }}
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="destructive"
                                                                    size="icon"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setRemoverModulo(modulo);
                                                                    }}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                                {expandedModulos.has(modulo.id) ? (
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
                                                                        <span className="font-medium">Sigla:</span>{' '}
                                                                        {modulo.unidade?.instituicao?.sigla}
                                                                    </div>
                                                                    <div className="md:col-span-2">
                                                                        <span className="font-medium">Endereço:</span>{' '}
                                                                        {modulo.unidade?.instituicao?.endereco}
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
                                                                                                        tiposAcessoColors[tipo] ||
                                                                                                        'bg-muted text-foreground'
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
                                                                    <p className="text-muted-foreground text-sm">
                                                                        Nenhum andar cadastrado para este módulo.
                                                                    </p>
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

                        <Paginacao links={modulos.links} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
