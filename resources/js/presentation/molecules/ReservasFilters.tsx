import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ViewMode, ViewModeToggle } from '@/presentation/molecules/ViewModeToggle';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Search } from 'lucide-react';

interface ReservasFiltersProps {
    searchTerm: string;
    onSearchTermChange: (value: string) => void;
    selectedSituacao: string;
    onSituacaoChange: (value: string) => void;
    /** Eixo de arquivamento: 'ativas' | 'arquivadas' | 'todas'. */
    selectedArquivo: string;
    onArquivoChange: (value: string) => void;
    /** Critério de ordenação: 'data_solicitacao' | 'situacao'. */
    selectedOrdenar: string;
    onOrdenarChange: (value: string) => void;
    selectedDate?: Date;
    onDateChange?: (date: Date | undefined) => void;
    viewMode?: ViewMode;
    onViewModeChange?: (mode: ViewMode) => void;
}

export function ReservasFilters({
    searchTerm,
    onSearchTermChange,
    selectedSituacao,
    onSituacaoChange,
    selectedArquivo,
    onArquivoChange,
    selectedOrdenar,
    onOrdenarChange,
    selectedDate,
    onDateChange,
    viewMode,
    onViewModeChange,
}: ReservasFiltersProps) {
    return (
        <Card className="w-full">
            <CardContent className="flex flex-col gap-4 p-4">
                {/* Linha superior: Busca e ViewModeToggle */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative flex-1">
                        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                        <Input
                            id="reservas-busca"
                            type="search"
                            placeholder="Buscar por título ou descrição..."
                            className="w-full pl-9"
                            value={searchTerm}
                            onChange={(e) => {
                                onSearchTermChange(e.target.value);
                            }}
                        />
                    </div>
                    {viewMode && onViewModeChange && (
                        <div className="shrink-0 self-end sm:self-auto">
                            <ViewModeToggle viewMode={viewMode} onViewModeChange={onViewModeChange} />
                        </div>
                    )}
                </div>

                {/* Linha inferior: Filtros em Grid responsivo e harmonioso */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="reservas-situacao" className="text-muted-foreground text-xs font-medium">
                            Situação
                        </Label>
                        <Select
                            value={selectedSituacao || 'todas'}
                            onValueChange={(value) => {
                                onSituacaoChange(value === 'todas' ? '' : value);
                            }}
                        >
                            <SelectTrigger id="reservas-situacao" className="w-full" aria-label="Situação">
                                <SelectValue placeholder="Situação" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todas">Todas as situações</SelectItem>
                                <SelectItem value="em_analise">Em Análise</SelectItem>
                                <SelectItem value="indeferida">Indeferida</SelectItem>
                                <SelectItem value="parcialmente_deferida">Parcialmente Deferida</SelectItem>
                                <SelectItem value="deferida">Deferida</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="reservas-exibir" className="text-muted-foreground text-xs font-medium">
                            Exibir
                        </Label>
                        <Select value={selectedArquivo || 'ativas'} onValueChange={onArquivoChange}>
                            <SelectTrigger id="reservas-exibir" className="w-full" aria-label="Exibir">
                                <SelectValue placeholder="Exibir" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ativas">Ativas</SelectItem>
                                <SelectItem value="arquivadas">Arquivadas</SelectItem>
                                <SelectItem value="todas">Todas</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="reservas-ordenar" className="text-muted-foreground text-xs font-medium">
                            Ordenar por
                        </Label>
                        <Select value={selectedOrdenar || 'data_solicitacao'} onValueChange={onOrdenarChange}>
                            <SelectTrigger id="reservas-ordenar" className="w-full" aria-label="Ordenar por">
                                <SelectValue placeholder="Ordenar por" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="data_solicitacao">Data de solicitação</SelectItem>
                                <SelectItem value="situacao">Situação</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="reservas-data" className="text-muted-foreground text-xs font-medium">
                            Data
                        </Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button id="reservas-data" variant="outline" className="w-full justify-start text-left font-normal">
                                    <CalendarIcon className="text-muted-foreground mr-2 h-4 w-4 shrink-0" />
                                    <span className="truncate">
                                        {selectedDate ? format(selectedDate, 'dd/MM/yyyy', { locale: ptBR }) : 'Todas as datas'}
                                    </span>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={(date) => {
                                        onDateChange?.(date);
                                    }}
                                    initialFocus
                                />
                                {selectedDate && (
                                    <div className="border-t p-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="w-full justify-center text-xs"
                                            onClick={() => {
                                                onDateChange?.(undefined);
                                            }}
                                        >
                                            Limpar filtro de data
                                        </Button>
                                    </div>
                                )}
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
