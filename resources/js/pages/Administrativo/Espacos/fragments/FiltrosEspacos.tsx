import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { nivelParaLabel, nomeParaNivel } from '@/lib/utils/andars/AndarHelpers';
import { Andar, FiltrosEspacosType, Modulo, Unidade } from '@/types';
import { Search } from 'lucide-react';

interface FiltrosEspacosProps {
    filtros: FiltrosEspacosType;
    setFiltros: (filtros: FiltrosEspacosType) => void;
    unidades: Unidade[];
    modulos: Modulo[];
    andares: Andar[];
}

export function FiltrosEspacos({ filtros, setFiltros, unidades, modulos, andares }: FiltrosEspacosProps) {
    // Filtrar módulos baseado na unidade selecionada
    const modulosFiltrados = filtros.unidade ? modulos.filter((modulo) => modulo.unidade?.id.toString() === filtros.unidade) : modulos;

    // Filtrar andares baseado no módulo selecionado
    const andaresFiltrados = filtros.modulo ? andares.filter((andar) => andar.modulo?.id.toString() === filtros.modulo) : andares;

    const handleUnidadeChange = (value: string) => {
        setFiltros({
            ...filtros,
            unidade: value === '0' ? undefined : value,
            modulo: undefined, // Reset módulo quando unidade muda
            andar: undefined, // Reset andar quando unidade muda
        });
    };

    const handleModuloChange = (value: string) => {
        setFiltros({
            ...filtros,
            modulo: value === '0' ? undefined : value,
            andar: undefined, // Reset andar quando módulo muda
        });
    };

    const handleAndarChange = (value: string) => {
        setFiltros({
            ...filtros,
            andar: value === '0' ? undefined : value,
        });
    };
    // Função para limpar todos os filtros
    const handleLimparFiltros = () => {
        setFiltros({
            search: '',
            unidade: undefined,
            modulo: undefined,
            andar: undefined,
            capacidade: '',
        });
    };
    return (
        <Card>
            <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
                    {/* Filtro por Unidade */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Unidade</label>
                        <Select value={filtros.unidade || '0'} onValueChange={handleUnidadeChange}>
                            <SelectTrigger>
                                <SelectValue placeholder={filtros.unidade ? 'Selecione uma unidade' : 'Selecione uma instituição primeiro'} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="0">Todas as unidades</SelectItem>
                                {unidades.map((unidade) => (
                                    <SelectItem key={unidade.id} value={unidade.id.toString()}>
                                        {unidade.sigla} - {unidade.nome}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Filtro por Módulo */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Módulo</label>
                        <Select value={filtros.modulo || '0'} onValueChange={handleModuloChange} disabled={!filtros.unidade}>
                            <SelectTrigger>
                                <SelectValue placeholder={filtros.unidade ? 'Selecione um módulo' : 'Selecione uma unidade primeiro'} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="0">Todos os módulos</SelectItem>
                                {modulosFiltrados.map((modulo) => (
                                    <SelectItem key={modulo.id} value={modulo.id.toString()}>
                                        {modulo.nome}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Filtro por Andar */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Andar</label>
                        <Select value={filtros.andar || '0'} onValueChange={handleAndarChange} disabled={!filtros.modulo}>
                            <SelectTrigger>
                                <SelectValue placeholder={filtros.modulo ? 'Selecione um andar' : 'Selecione um módulo primeiro'} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="0">Todos os andares</SelectItem>
                                {andaresFiltrados.map((andar) => (
                                    <SelectItem key={andar.id} value={andar.id.toString()}>
                                        {nivelParaLabel(nomeParaNivel(andar.nome))}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Filtro por Capacidade */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Capacidade mín.</label>
                        <Input
                            type="number"
                            placeholder="Ex: 20"
                            value={filtros.capacidade || ''}
                            onChange={(e) => setFiltros({ ...filtros, capacidade: e.target.value })}
                        />
                    </div>
                </div>

                {/* Botão de filtrar e limpar */}
                <div className="mt-4 grid grid-cols-2 gap-2">
                    {/* Busca por nome */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Buscar</label>
                        <Input
                            placeholder="Nome do espaço..."
                            value={filtros.search || ''}
                            onChange={(e) => setFiltros({ ...filtros, search: e.target.value })}
                        />
                    </div>
                    <div className="flex items-end justify-end space-x-2">
                        <Button onClick={handleLimparFiltros} className='flex-1'>
                            <Search className="mr-2 h-4 w-4" />
                            Aplicar Filtros
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() =>
                                setFiltros({
                                    search: '',
                                    unidade: undefined,
                                    modulo: undefined,
                                    andar: undefined,
                                    capacidade: '',
                                })
                            }
                        >
                            Limpar
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
