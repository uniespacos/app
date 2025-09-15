import { Button } from '@/components/ui/button';
import { addDays, endOfWeek, format, startOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type AgendaNavegacaoProps = {
    semanaAtual: Date;
    onAnterior: () => void;
    onProxima: () => void;
};
export default function AgendaNavegacao({ semanaAtual, onAnterior, onProxima }: AgendaNavegacaoProps) {
    // --- LÓGICA CORRIGIDA ---
    // 1. Calcula o início real da semana (Segunda-feira)
    const inicioDaSemana = startOfWeek(semanaAtual, { weekStartsOn: 1 });
    // 2. Calcula o fim real da semana (Domingo)
    const fimDaSemana = endOfWeek(semanaAtual, { weekStartsOn: 1 });

    // 3. Formata o texto usando as datas corretas
    const textoIntervalo = `${format(inicioDaSemana, 'dd/MM', { locale: ptBR })} - ${format(fimDaSemana, 'dd/MM', { locale: ptBR })}`;
    // --- FIM DA LÓGICA ---


    return (
        <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={onAnterior}>
                <ChevronLeft className="mr-1 h-4 w-4" />
                <span className="hidden sm:inline">Semana Anterior</span>
                <span className="sm:hidden">Anterior</span>
            </Button>
            <h2 className="text-sm font-medium sm:text-base">
                {textoIntervalo}
            </h2>
            <Button variant="outline" size="sm" onClick={onProxima}>
                <span className="hidden sm:inline">Próxima Semana</span>
                <span className="sm:hidden">Próxima</span>
                <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
        </div>
    );
}
