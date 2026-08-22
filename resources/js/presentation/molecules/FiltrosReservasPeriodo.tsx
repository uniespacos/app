import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/presentation/molecules/DatePicker';
import { FiltroChips } from '@/presentation/molecules/FiltroChips';
import { FiltrosRelatorio, SituacaoReserva } from '@/types';
import { format } from 'date-fns';

interface Props {
    filtros: Partial<FiltrosRelatorio>;
    onChange: (filtros: Partial<FiltrosRelatorio>) => void;
}

export function FiltrosReservasPeriodo({ filtros, onChange }: Props) {
    const [dataInicio, setDataInicio] = useState<Date | undefined>(
        filtros.data_inicio ? new Date(filtros.data_inicio) : undefined
    );
    const [dataFim, setDataFim] = useState<Date | undefined>(
        filtros.data_fim ? new Date(filtros.data_fim) : undefined
    );

    const situacoes: { value: SituacaoReserva; label: string }[] = [
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
                    <DatePicker value={dataInicio} onSelect={handleDataInicioChange} />
                </div>

                <div>
                    <Label className="mb-2 block">Data Fim</Label>
                    <DatePicker value={dataFim} onSelect={handleDataFimChange} />
                </div>
            </div>

            <div className="pt-2 space-y-2">
                <FiltroChips
                    label="Situações"
                    opcoes={situacoes}
                    selecionados={filtros.situacoes ?? []}
                    onChange={(valores) =>
                        { onChange({ ...filtros, situacoes: valores as SituacaoReserva[] }); }
                    }
                />

                <FiltroChips
                    label="Turnos"
                    opcoes={turnos}
                    selecionados={filtros.turnos ?? []}
                    onChange={(valores) =>
                        { onChange({
                            ...filtros,
                            turnos: valores as ('manha' | 'tarde' | 'noite')[],
                        }); }
                    }
                />
            </div>
        </div>
    );
}
