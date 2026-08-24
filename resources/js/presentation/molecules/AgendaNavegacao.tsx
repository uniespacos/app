import { Button } from '@/components/ui/button';
import { endOfWeek, format, startOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AgendaNavegacaoProps {
    semanaAtual: Date;
    onAnterior: () => void;
    onProxima: () => void;
    onReset?: () => void;
    desabilitarAnterior?: boolean;
    desabilitarProxima?: boolean;
    variant?: 'full' | 'compact';
}

export default function AgendaNavegacao({
    semanaAtual,
    onAnterior,
    onProxima,
    onReset,
    desabilitarAnterior = false,
    desabilitarProxima = false,
    variant = 'full',
}: AgendaNavegacaoProps) {
    const inicioDaSemana = startOfWeek(semanaAtual, { weekStartsOn: 1 });
    const fimDaSemana = endOfWeek(semanaAtual, { weekStartsOn: 1 });
    const formatoFim = variant === 'compact' ? 'dd/MM/yyyy' : 'dd/MM';
    const textoIntervalo = `${format(inicioDaSemana, 'dd/MM', { locale: ptBR })} - ${format(fimDaSemana, formatoFim, { locale: ptBR })}`;

    if (variant === 'compact') {
        return (
            <div className="flex items-center justify-between">
                <Button variant="outline" size="sm" onClick={onAnterior} disabled={desabilitarAnterior}>
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    <span className="hidden sm:inline">Semana Anterior</span>
                    <span className="sm:hidden">Anterior</span>
                </Button>

                <h2 className="text-sm font-medium sm:text-base">{textoIntervalo}</h2>

                <Button variant="outline" size="sm" onClick={onProxima} disabled={desabilitarProxima}>
                    <span className="hidden sm:inline">Próxima Semana</span>
                    <span className="sm:hidden">Próxima</span>
                    <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
            </div>
        );
    }

    return (
        <div className="bg-muted/30 flex flex-col gap-2 rounded-lg border px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
            <div className="flex items-center justify-between gap-2 sm:justify-start">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onAnterior}
                    disabled={desabilitarAnterior}
                    aria-label="Semana anterior"
                    className="h-9 w-9 shrink-0 p-0 sm:h-8 sm:w-auto sm:px-3"
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="ml-1 hidden sm:inline">Semana Anterior</span>
                </Button>

                <h2 className="text-sm font-medium tabular-nums sm:hidden">{textoIntervalo}</h2>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={onProxima}
                    disabled={desabilitarProxima}
                    aria-label="Próxima semana"
                    className="h-9 w-9 shrink-0 p-0 sm:hidden"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            <h2 className="hidden text-base font-medium tabular-nums sm:block">{textoIntervalo}</h2>

            <div className="flex items-center gap-2 sm:justify-end">
                {onReset && (
                    <Button variant="outline" size="sm" onClick={onReset} className="h-9 w-full sm:h-8 sm:w-auto">
                        <span className="hidden sm:inline">Voltar para semana atual</span>
                        <span className="sm:hidden">Voltar para a semana atual</span>
                    </Button>
                )}

                <Button variant="outline" size="sm" onClick={onProxima} disabled={desabilitarProxima} className="hidden sm:inline-flex">
                    Próxima Semana
                    <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
