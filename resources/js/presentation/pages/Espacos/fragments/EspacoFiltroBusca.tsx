import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
        capacidade: filters.capacidade || '',
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
                        <div className="relative sm:col-span-4 lg:col-span-4">
                            <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                            <Input
                                placeholder="Buscar por nome do espaço, andar ou módulo..."
                                className="pl-8"
                                value={localFilters.search}
                                onChange={(value) => handleFilterChange('search', value.target.value)}
                            />
                        </div>

                        {/* Filtro de Unidade */}
                        <Select value={localFilters.unidade} onValueChange={(value) => handleFilterChange('unidade', value)}>
                            <SelectTrigger>
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

                        {/* Filtro de Módulo */}
                        <Select
                            value={localFilters.modulo}
                            onValueChange={(value) => handleFilterChange('modulo', value)}
                            disabled={localFilters.unidade === 'all'}
                        >
                            <SelectTrigger>
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

                        {/* Filtro de Andar */}
                        <Select
                            value={localFilters.andar}
                            onValueChange={(value) => handleFilterChange('andar', value)}
                            disabled={localFilters.modulo === 'all'}
                        >
                            <SelectTrigger>
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

                        {/* Filtro de Capacidade */}
                        <Select value={localFilters.capacidade} onValueChange={(value) => handleFilterChange('capacidade', value)}>
                            <SelectTrigger>
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
                </CardContent>
            </Card>
        </>
    );
}
