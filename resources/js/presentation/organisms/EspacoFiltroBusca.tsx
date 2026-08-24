import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { nivelParaLabel, nomeParaNivel } from '@/lib/utils/andars/AndarHelpers';
import { Andar, Modulo, Unidade } from '@/types';
import { router } from '@inertiajs/react';
import { ChevronDown, Search, SlidersHorizontal } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

interface FiltroBuscaEspacosProps {
    route: string;
    unidades: Unidade[];
    modulos: Modulo[];
    andares: Andar[];
    filters: {
        search?: string;
        unidade?: string;
        modulo?: string;
        andar?: string;
        capacidade?: string;
    };
    capacidadeEspacos: number[];
}

export default function EspacoFiltroBusca(props: FiltroBuscaEspacosProps) {
    const { route, filters, unidades, modulos, andares, capacidadeEspacos } = props;
    const [localFilters, setLocalFilters] = useState({
        search: filters.search || '',
        unidade: filters.unidade || 'all',
        modulo: filters.modulo || 'all',
        andar: filters.andar || 'all',
        capacidade: filters.capacidade || 'qualquer',
    });
    const isInitialMount = useRef(true);

    const filteredModulos = useMemo(() => {
        if (localFilters.unidade === 'all') {
            return [];
        }
        const resultado = modulos.filter((m) => {
            return m.unidade_id.toString() === localFilters.unidade;
        });
        return resultado;
    }, [localFilters.unidade, modulos]);

    const filteredAndares = useMemo(() => {
        if (localFilters.modulo === 'all') {
            return [];
        }
        return andares.filter((a) => a.modulo_id.toString() === localFilters.modulo);
    }, [localFilters.modulo, andares]);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        const handler = setTimeout(() => {
            const queryParams = Object.fromEntries(
                Object.entries(localFilters).filter(([key, value]) => {
                    if (!value) return false;
                    if (['unidade', 'modulo', 'andar'].includes(key) && value === 'all') return false;
                    if (key === 'capacidade' && value === 'qualquer') return false;
                    return true;
                }),
            );

            router.get(route, queryParams, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 400);

        return () => {
            clearTimeout(handler);
        };
    }, [localFilters, route]);

    const handleFilterChange = (name: keyof typeof localFilters, value: string) => {
        setLocalFilters((prev) => {
            const newFilters = { ...prev, [name]: value };

            if (name === 'unidade') {
                newFilters.modulo = 'all';
                newFilters.andar = 'all';
            }
            if (name === 'modulo') {
                newFilters.andar = 'all';
            }

            return newFilters;
        });
    };

    const [filtrosAbertos, setFiltrosAbertos] = useState(false);
    const quantidadeFiltrosAtivos = [
        localFilters.unidade !== 'all',
        localFilters.modulo !== 'all',
        localFilters.andar !== 'all',
        localFilters.capacidade !== 'qualquer',
    ].filter(Boolean).length;

    return (
        <Card className="mb-6">
            <CardContent className="space-y-4">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Label htmlFor="espacos-busca" className="sr-only">
                            Buscar
                        </Label>
                        <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                        <Input
                            id="espacos-busca"
                            placeholder="Buscar por nome do espaço, andar ou módulo..."
                            className="pl-8"
                            value={localFilters.search}
                            onChange={(value) => {
                                handleFilterChange('search', value.target.value);
                            }}
                        />
                    </div>

                    <Collapsible open={filtrosAbertos} onOpenChange={setFiltrosAbertos} className="sm:hidden">
                        <CollapsibleTrigger asChild>
                            <Button variant="outline" className="relative">
                                <SlidersHorizontal className="h-4 w-4" />
                                Filtros
                                {quantidadeFiltrosAtivos > 0 && (
                                    <Badge className="absolute -top-2 -right-2 h-5 min-w-5 justify-center rounded-full px-1">
                                        {quantidadeFiltrosAtivos}
                                    </Badge>
                                )}
                                <ChevronDown className={cn('h-4 w-4 transition-transform', filtrosAbertos && 'rotate-180')} />
                            </Button>
                        </CollapsibleTrigger>
                    </Collapsible>
                </div>

                <div className={cn('grid grid-cols-2 gap-4 lg:grid-cols-4', !filtrosAbertos && 'hidden sm:grid')}>
                    <div className="col-span-2 space-y-2 sm:col-span-1">
                        <Label htmlFor="espacos-unidade">Unidade</Label>
                        <Select
                            value={localFilters.unidade}
                            onValueChange={(value) => {
                                handleFilterChange('unidade', value);
                            }}
                        >
                            <SelectTrigger id="espacos-unidade" className="w-full">
                                <SelectValue placeholder="Unidade" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas as Unidades</SelectItem>
                                {unidades.map((unidade) => (
                                    <SelectItem key={unidade.id} value={unidade.id.toString()}>
                                        {unidade.nome}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="espacos-modulo">Módulo</Label>
                        <Select
                            value={localFilters.modulo}
                            onValueChange={(value) => {
                                handleFilterChange('modulo', value);
                            }}
                            disabled={localFilters.unidade === 'all'}
                        >
                            <SelectTrigger id="espacos-modulo" className="w-full">
                                <SelectValue placeholder="Módulo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos os Módulos</SelectItem>
                                {filteredModulos.map((modulo) => (
                                    <SelectItem key={modulo.id} value={modulo.id.toString()}>
                                        {modulo.nome}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="espacos-andar">Andar</Label>
                        <Select
                            value={localFilters.andar}
                            onValueChange={(value) => {
                                handleFilterChange('andar', value);
                            }}
                            disabled={localFilters.modulo === 'all'}
                        >
                            <SelectTrigger id="espacos-andar" className="w-full">
                                <SelectValue placeholder="Andar" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos os Andares</SelectItem>
                                {filteredAndares.map((andar) => (
                                    <SelectItem key={andar.id} value={andar.id.toString()}>
                                        {nivelParaLabel(nomeParaNivel(andar.nome))}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="espacos-capacidade">Capacidade</Label>
                        <Select
                            value={localFilters.capacidade}
                            onValueChange={(value) => {
                                handleFilterChange('capacidade', value);
                            }}
                        >
                            <SelectTrigger id="espacos-capacidade" className="w-full">
                                <SelectValue placeholder="Capacidade" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="qualquer">Qualquer</SelectItem>
                                {capacidadeEspacos.map((capacidade) => {
                                    return (
                                        <SelectItem key={capacidade} value={capacidade.toString()}>
                                            {capacidade} Lugares
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
