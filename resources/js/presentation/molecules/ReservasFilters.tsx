import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Filter, Search } from 'lucide-react';

type ReservasFiltersProps = {
    searchTerm: string;
    onSearchTermChange: (value: string) => void;
    selectedSituacao: string;
    onSituacaoChange: (value: string) => void;
    /** Eixo de arquivamento (issue #108): 'ativas' | 'arquivadas' | 'todas'. */
    selectedArquivo: string;
    onArquivoChange: (value: string) => void;
    /** Critério de ordenação: 'data_solicitacao' | 'situacao'. */
    selectedOrdenar: string;
    onOrdenarChange: (value: string) => void;
    selectedDate?: Date; // Adicionei para o filtro de data
    onDateChange?: (date: Date | undefined) => void; // Função opcional para lidar com a mudança de data
};

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
}: ReservasFiltersProps) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
            <div className="relative flex-1">
                <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                <Input
                    type="search"
                    placeholder="Buscar por título ou descrição..."
                    className="w-full pl-8"
                    value={searchTerm} // 3. O valor vem das props
                    onChange={(e) => onSearchTermChange(e.target.value)} // 4. A mudança notifica o pai
                />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
                {/*
                    Issue #108: este select cobre apenas o resultado da avaliação.
                    'inativa' saiu daqui — é estado de arquivamento, e enquanto
                    dividia este campo com os demais o filtro por arquivadas
                    entrava em contradição com o padrão do backend.
                */}
                <Select
                    // Sem o `|| 'todas'`, o valor vazio de "todas as situações"
                    // não batia com nenhum SelectItem e o Select caía no
                    // placeholder — cinza-claro, como se nada tivesse sido
                    // escolhido. Ao lado, o select "Exibir" mostra "Ativas" em
                    // texto normal no mesmo tipo de estado padrão. Mesmo padrão
                    // aqui: valor padrão mapeado para um item real.
                    value={selectedSituacao || 'todas'}
                    onValueChange={(value) => onSituacaoChange(value === 'todas' ? '' : value)} // 6. A mudança notifica o pai
                >
                    <SelectTrigger className="w-full sm:w-[180px]" aria-label="Situação">
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

                <Select value={selectedArquivo || 'ativas'} onValueChange={onArquivoChange}>
                    <SelectTrigger className="w-full sm:w-[180px]" aria-label="Exibir">
                        <SelectValue placeholder="Exibir" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ativas">Ativas</SelectItem>
                        <SelectItem value="arquivadas">Arquivadas</SelectItem>
                        <SelectItem value="todas">Todas</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={selectedOrdenar || 'data_solicitacao'} onValueChange={onOrdenarChange}>
                    <SelectTrigger className="w-full sm:w-[200px]" aria-label="Ordenar por">
                        <SelectValue placeholder="Ordenar por" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="data_solicitacao">Data de solicitação</SelectItem>
                        <SelectItem value="situacao">Situação</SelectItem>
                    </SelectContent>
                </Select>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal sm:w-[240px]">
                            <Filter className="mr-2 h-4 w-4" />
                            {selectedDate ? format(selectedDate, 'PPP', { locale: ptBR }) : 'Filtrar por data'}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={selectedDate} onSelect={onDateChange} initialFocus />
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    );
}
