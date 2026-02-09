import { Button } from '@/components/ui/button';
// Importa as funções 'startOfWeek' e 'endOfWeek'
import { endOfWeek, format, startOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type AgendaNavegacaoProps = {
    semanaAtual: Date;
    onAnterior: () => void;
    onProxima: () => void;
    desabilitarAnterior?: boolean;
    desabilitarProxima?: boolean;
};

export default function AgendaNavegacao({
    semanaAtual,
    onAnterior,
    onProxima,
    desabilitarAnterior = false,
    desabilitarProxima = false,
}: AgendaNavegacaoProps) {
    // --- LÓGICA CORRIGIDA ---
    // 1. Garante que o cálculo do início e fim da semana seja consistente
    const inicioDaSemana = startOfWeek(semanaAtual, { weekStartsOn: 1 });
    const fimDaSemana = endOfWeek(semanaAtual, { weekStartsOn: 1 });

    // 2. Formata o texto usando as datas corretas
    const textoIntervalo = `${format(inicioDaSemana, 'dd/MM', { locale: ptBR })} - ${format(fimDaSemana, 'dd/MM/yyyy', { locale: ptBR })}`;

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
