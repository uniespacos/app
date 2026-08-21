import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { nivelParaLabel, nomeParaNivel } from '@/lib/utils/andars/AndarHelpers';
import { Andar, Modulo, Unidade } from '@/types';
import { router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

type FiltroBuscaEspacosProps = {
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
};

export default function EspacoFiltroBusca(props: FiltroBuscaEspacosProps) {
    const { route, filters, unidades, modulos, andares, capacidadeEspacos } = props;
    const [localFilters, setLocalFilters] = useState({
        search: filters.search || '',
        unidade: filters.unidade || 'all',
        modulo: filters.modulo || 'all',
        andar: filters.andar || 'all',
        // '' não batia com nenhum SelectItem (o padrão é 'qualquer'), então o
        // trigger caía no placeholder cinza — parecia "nada selecionado" ao
        // lado dos outros três selects, que sempre mostram um valor concreto.
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

    return (
        <>
            {/* Filtros e Busca */}
            <Card className="mb-6">
                <CardContent>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Busca */}
                        <div className="space-y-2 sm:col-span-4 lg:col-span-4">
                            <Label htmlFor="espacos-busca">Buscar</Label>
                            <div className="relative">
                                <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                                <Input
                                    id="espacos-busca"
                                    placeholder="Buscar por nome do espaço, andar ou módulo..."
                                    className="pl-8"
                                    value={localFilters.search}
                                    onChange={(value) => handleFilterChange('search', value.target.value)}
                                />
                            </div>
                        </div>

                        {/* Filtro de Unidade */}
                        <div className="space-y-2">
                            <Label htmlFor="espacos-unidade">Unidade</Label>
                            <Select value={localFilters.unidade} onValueChange={(value) => handleFilterChange('unidade', value)}>
                                <SelectTrigger id="espacos-unidade">
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

                        {/* Filtro de Módulo */}
                        <div className="space-y-2">
                            <Label htmlFor="espacos-modulo">Módulo</Label>
                            <Select
                                value={localFilters.modulo}
                                onValueChange={(value) => handleFilterChange('modulo', value)}
                                disabled={localFilters.unidade === 'all'}
                            >
                                <SelectTrigger id="espacos-modulo">
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

                        {/* Filtro de Andar */}
                        <div className="space-y-2">
                            <Label htmlFor="espacos-andar">Andar</Label>
                            <Select
                                value={localFilters.andar}
                                onValueChange={(value) => handleFilterChange('andar', value)}
                                disabled={localFilters.modulo === 'all'}
                            >
                                <SelectTrigger id="espacos-andar">
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

                        {/* Filtro de Capacidade */}
                        <div className="space-y-2">
                            <Label htmlFor="espacos-capacidade">Capacidade</Label>
                            <Select value={localFilters.capacidade} onValueChange={(value) => handleFilterChange('capacidade', value)}>
                                <SelectTrigger id="espacos-capacidade">
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
        </>
    );
}
