import { Agenda, AgendaDiasSemanaType, Horario } from '@/types';
import { fireEvent, render, screen, within } from '@testing-library/react';
import CalendarDiaMobile from './CalendarDiaMobile';

/**
 * A visão mobile substitui a grade de 800px, que não cabe em celular nenhum.
 * O que estes testes travam é a paridade com o desktop: os dois consomem
 * `derivarSlotsDoTurno`, e um slot reservado não pode virar clicável só porque
 * o layout mudou.
 */
describe('CalendarDiaMobile', () => {
    const diasSemana: AgendaDiasSemanaType[] = [
        { data: new Date('2026-09-07T12:00:00'), nome: 'Segunda-feira', abreviado: 'seg.', diaMes: '07/09', valor: 'seg', ehHoje: true },
        { data: new Date('2026-09-08T12:00:00'), nome: 'Terça-feira', abreviado: 'ter.', diaMes: '08/09', valor: 'ter', ehHoje: false },
    ];

    const gestor = { id: 3, name: 'Gestor' } as never;

    function agenda(turno: Agenda['turno'], horarios: Horario[] = []): Agenda {
        return { id: turno === 'manha' ? 1 : turno === 'tarde' ? 2 : 3, turno, user: gestor, horarios };
    }

    function horarioDeferido(data: string, inicio: string): Horario {
        return {
            id: 10,
            data,
            horario_inicio: inicio,
            horario_fim: '08:20:00',
            situacao: 'deferida',
            validation_status: 'completed',
            conflict_cache: null,
            cache_validated_at: null,
            reserva: { id: 99, titulo: 'Aula de Cálculo', user: { id: 5, name: 'Maria' } } as never,
        };
    }

    const props = {
        diasSemana,
        agendas: [agenda('tarde'), agenda('manha')],
        isSlotSelecionado: () => false,
        alternarSelecaoSlot: jest.fn(),
    };

    beforeEach(() => jest.clearAllMocks());

    /** Mesma ordem canônica da issue #101 — turno não sai na ordem do banco. */
    it('renderiza os turnos na ordem canonica, nao na ordem recebida', () => {
        render(<CalendarDiaMobile {...props} />);

        const titulos = screen.getAllByText(/^(Manhã|Tarde|Noite)$/).map((el) => el.textContent);

        expect(titulos).toEqual(['Manhã', 'Tarde']);
    });

    it('abre no dia de hoje', () => {
        render(<CalendarDiaMobile {...props} />);

        expect(screen.getByRole('tab', { name: /segunda-feira/i })).toHaveAttribute('aria-selected', 'true');
    });

    /** O rótulo visível é abreviado; o leitor de tela recebe o dia por extenso. */
    it('expoe o dia por extenso no nome acessivel da aba', () => {
        render(<CalendarDiaMobile {...props} />);

        expect(screen.getByRole('tab', { name: 'Segunda-feira, dia 07/09' })).toBeInTheDocument();
    });

    it('trocar de dia troca os slots exibidos', () => {
        const comReservaNaSegunda = [agenda('manha', [horarioDeferido('2026-09-07', '07:30:00')])];

        render(<CalendarDiaMobile {...props} agendas={comReservaNaSegunda} />);

        expect(screen.getByText('Aula de Cálculo')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('tab', { name: /terça-feira/i }));

        expect(screen.queryByText('Aula de Cálculo')).not.toBeInTheDocument();
    });

    it('clicar num slot livre notifica a selecao', () => {
        render(<CalendarDiaMobile {...props} agendas={[agenda('manha')]} />);

        fireEvent.click(screen.getByRole('button', { name: /07:30 - 08:20/ }));

        expect(props.alternarSelecaoSlot).toHaveBeenCalledTimes(1);
    });

    /** Paridade com o desktop: reservado é intocável nas duas visões. */
    it('slot reservado fica desabilitado e nao notifica', () => {
        const comReserva = [agenda('manha', [horarioDeferido('2026-09-07', '07:30:00')])];

        render(<CalendarDiaMobile {...props} agendas={comReserva} />);

        const linha = screen.getByRole('button', { name: /07:30 - 08:20/ });

        expect(linha).toBeDisabled();

        fireEvent.click(linha);

        expect(props.alternarSelecaoSlot).not.toHaveBeenCalled();
    });

    it('mostra Selecionado quando o slot esta na selecao', () => {
        render(<CalendarDiaMobile {...props} agendas={[agenda('manha')]} isSlotSelecionado={() => true} />);

        const linha = screen.getByRole('button', { name: /07:30 - 08:20/ });

        expect(within(linha).getByText('Selecionado')).toBeInTheDocument();
    });

    /** Turno sem gestor atribuído não aparece — mesma regra do desktop. */
    it('ignora agendas sem gestor', () => {
        const semGestor = [{ id: 9, turno: 'noite', horarios: [] } as Agenda];

        render(<CalendarDiaMobile {...props} agendas={semGestor} />);

        expect(screen.getByText(/Nenhum turno disponível/)).toBeInTheDocument();
    });

    it('nao quebra quando a semana vem vazia', () => {
        const { container } = render(<CalendarDiaMobile {...props} diasSemana={[]} />);

        expect(container).toBeEmptyDOMElement();
    });

    /** Abaixo de ~44px o alvo fica desconfortável para o dedo; usamos 52px. */
    it('usa alvos de toque confortaveis', () => {
        render(<CalendarDiaMobile {...props} agendas={[agenda('manha')]} />);

        expect(screen.getByRole('tab', { name: /segunda-feira/i })).toHaveClass('min-h-[52px]');
        expect(screen.getByRole('button', { name: /07:30 - 08:20/ })).toHaveClass('min-h-[52px]');
    });

    it('exibe as faixas de horario do turno selecionado', () => {
        render(<CalendarDiaMobile {...props} agendas={[agenda('manha')]} />);

        // manha tem 6 faixas
        expect(screen.getAllByRole('button').filter((b) => /\d{2}:\d{2} - \d{2}:\d{2}/.test(b.textContent ?? ''))).toHaveLength(6);
    });
});
