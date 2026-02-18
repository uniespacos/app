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
    selectedDate?: Date; // Adicionei para o filtro de data
    onDateChange?: (date: Date | undefined) => void; // Função opcional para lidar com a mudança de data
    isGestor?: boolean;
};

export function ReservasFilters({
    searchTerm,
    onSearchTermChange,
    selectedSituacao,
    onSituacaoChange,
    selectedDate,
    onDateChange,
    isGestor = false,
}: ReservasFiltersProps) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row">
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
                <Select
                    value={selectedSituacao} // 5. O valor vem das props
                    onValueChange={(value) => onSituacaoChange(value === 'todas' ? '' : value)} // 6. A mudança notifica o pai
                >
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Situação" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="todas">Todas</SelectItem>
                        <SelectItem value="em_analise">Em Análise</SelectItem>
                        <SelectItem value="indeferida">Indeferida</SelectItem>
                        <SelectItem value="parcialmente_deferida">Parcialmente Deferida</SelectItem>
                        <SelectItem value="deferida">Deferida</SelectItem>
                        {isGestor && <SelectItem value="inativa">Inativa</SelectItem>}
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
                        <Calendar mode="single" selected={selectedDate} onSelect={onDateChange} locale={ptBR} initialFocus />
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    );
}
