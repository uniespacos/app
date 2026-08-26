import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FiltroChips } from '@/presentation/molecules/FiltroChips';
import { FiltrosRelatorio, SituacaoReserva } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { useState } from 'react';

interface Props {
    filtros: Partial<FiltrosRelatorio>;
    onChange: (filtros: Partial<FiltrosRelatorio>) => void;
}

export function FiltrosReservasPeriodo({ filtros, onChange }: Props) {
    const [dataInicio, setDataInicio] = useState<Date | undefined>(filtros.data_inicio ? new Date(filtros.data_inicio) : undefined);
    const [dataFim, setDataFim] = useState<Date | undefined>(filtros.data_fim ? new Date(filtros.data_fim) : undefined);

    const situacoes: Array<{ value: SituacaoReserva; label: string }> = [
        { value: 'em_analise', label: 'Em Análise' },
        { value: 'deferida', label: 'Deferida' },
        { value: 'indeferida', label: 'Indeferida' },
        { value: 'parcialmente_deferida', label: 'Parcialmente Deferida' },
    ];

    const turnos = [
        { value: 'manha', label: 'Manhã' },
        { value: 'tarde', label: 'Tarde' },
        { value: 'noite', label: 'Noite' },
    ];

    const handleDataInicioChange = (date: Date | undefined) => {
        setDataInicio(date);
        onChange({
            ...filtros,
            data_inicio: date ? format(date, 'yyyy-MM-dd') : undefined,
        });
    };

    const handleDataFimChange = (date: Date | undefined) => {
        setDataFim(date);
        onChange({
            ...filtros,
            data_fim: date ? format(date, 'yyyy-MM-dd') : undefined,
        });
    };

    return (
        <div className="space-y-2">
            <div className="grid gap-4 md:grid-cols-2">
                <div>
                    <Label className="mb-2 block">Data Início</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dataInicio ? format(dataInicio, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecione...'}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={dataInicio} onSelect={handleDataInicioChange} />
                        </PopoverContent>
                    </Popover>
                </div>

                <div>
                    <Label className="mb-2 block">Data Fim</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dataFim ? format(dataFim, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecione...'}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={dataFim} onSelect={handleDataFimChange} />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            <div className="space-y-2 pt-2">
                <FiltroChips
                    label="Situações"
                    opcoes={situacoes}
                    selecionados={filtros.situacoes ?? []}
                    onChange={(valores) => onChange({ ...filtros, situacoes: valores as SituacaoReserva[] })}
                />

                <FiltroChips
                    label="Turnos"
                    opcoes={turnos}
                    selecionados={filtros.turnos ?? []}
                    onChange={(valores) =>
                        onChange({
                            ...filtros,
                            turnos: valores as Array<'manha' | 'tarde' | 'noite'>,
                        })
                    }
                />
            </div>
        </div>
    );
}
