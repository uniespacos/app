import { Label } from '@/components/ui/label';
import { TURNOS_ORDENADOS, TURNO_LABEL, Turno } from '@/constants/turnos';
import { DatePicker } from '@/presentation/molecules/DatePicker';
import { FiltroChips } from '@/presentation/molecules/FiltroChips';
import { FiltrosRelatorio } from '@/types';
import { format } from 'date-fns';
import { useState } from 'react';

interface Props {
    filtros: Partial<FiltrosRelatorio>;
    onChange: (filtros: Partial<FiltrosRelatorio>) => void;
}

export function FiltrosOcupacaoEspacos({ filtros, onChange }: Props) {
    const [dataInicio, setDataInicio] = useState<Date | undefined>(filtros.data_inicio ? new Date(filtros.data_inicio) : undefined);
    const [dataFim, setDataFim] = useState<Date | undefined>(filtros.data_fim ? new Date(filtros.data_fim) : undefined);

    const turnos = TURNOS_ORDENADOS.map((turno) => ({
        value: turno,
        label: TURNO_LABEL[turno],
    }));

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
                    <DatePicker value={dataInicio} onSelect={handleDataInicioChange} placeholder="Selecione..." />
                </div>

                <div>
                    <Label className="mb-2 block">Data Fim</Label>
                    <DatePicker value={dataFim} onSelect={handleDataFimChange} placeholder="Selecione..." />
                </div>
            </div>

            <div className="pt-2">
                <FiltroChips
                    label="Turnos"
                    opcoes={turnos}
                    selecionados={filtros.turnos ?? []}
                    onChange={(valores) => {
                        onChange({
                            ...filtros,
                            turnos: valores as Turno[],
                        });
                    }}
                />
            </div>
        </div>
    );
}
