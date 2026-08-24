import { Label } from '@/components/ui/label';
import { DatePicker } from '@/presentation/molecules/DatePicker';
import { FiltrosRelatorio } from '@/types';
import { format } from 'date-fns';
import { useState } from 'react';

interface Props {
    filtros: Partial<FiltrosRelatorio>;
    onChange: (filtros: Partial<FiltrosRelatorio>) => void;
}

export function FiltrosIndicadoresConsolidados({ filtros, onChange }: Props) {
    const [dataInicio, setDataInicio] = useState<Date | undefined>(filtros.data_inicio ? new Date(filtros.data_inicio) : undefined);
    const [dataFim, setDataFim] = useState<Date | undefined>(filtros.data_fim ? new Date(filtros.data_fim) : undefined);

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
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label className="mb-2 block">Data Início</Label>
                    <DatePicker value={dataInicio} onSelect={handleDataInicioChange} placeholder="Selecione..." />
                </div>

                <div>
                    <Label className="mb-2 block">Data Fim</Label>
                    <DatePicker value={dataFim} onSelect={handleDataFimChange} placeholder="Selecione..." />
                </div>
            </div>
        </div>
    );
}
