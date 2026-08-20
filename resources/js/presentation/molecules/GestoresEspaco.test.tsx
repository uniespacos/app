import type { Agenda } from '@/types';
import { render, screen } from '@testing-library/react';
import { GestoresEspaco } from './GestoresEspaco';

/**
 * Regression guard for issue #101 (admin "Gestores por Turno" out of order).
 *
 * The component used to map over `agendas` in whatever order the API returned
 * them. Neither Espaco::agendas() nor EspacoRepositoryEloquent::getAllByInstituicao
 * applies an ORDER BY, so the sequence was left to the database.
 */

const agenda = (id: number, turno: Agenda['turno'], nomeGestor?: string): Agenda => ({
    id,
    turno,
    ...(nomeGestor ? { user: { id, name: nomeGestor, email: `${nomeGestor}@uesb.edu.br` } as Agenda['user'] } : {}),
});

/** Reads the shift labels in the order they appear in the DOM. */
const turnosRenderizados = (): string[] => screen.getAllByTestId('turno-label').map((el) => el.textContent ?? '');

describe('GestoresEspaco', () => {
    it('renders shifts as Manhã, Tarde, Noite regardless of the order received', () => {
        render(<GestoresEspaco agendas={[agenda(3, 'noite', 'Carlos'), agenda(1, 'manha', 'Ana'), agenda(2, 'tarde', 'Bruno')]} />);

        expect(turnosRenderizados()).toEqual(['Manhã', 'Tarde', 'Noite']);
    });

    it('keeps the order when the agendas arrive already sorted', () => {
        render(<GestoresEspaco agendas={[agenda(1, 'manha', 'Ana'), agenda(2, 'tarde', 'Bruno'), agenda(3, 'noite', 'Carlos')]} />);

        expect(turnosRenderizados()).toEqual(['Manhã', 'Tarde', 'Noite']);
    });

    /**
     * The issue asks for the three shifts "regardless of whether a manager is
     * assigned to that shift or if the shift is empty". This mirrors what the
     * assignment dialog (GerenciarGestoresDialog) already does.
     */
    it('renders all three shifts even when an agenda is missing', () => {
        render(<GestoresEspaco agendas={[agenda(1, 'manha', 'Ana')]} />);

        expect(turnosRenderizados()).toEqual(['Manhã', 'Tarde', 'Noite']);
        expect(screen.getAllByText('Sem gestor')).toHaveLength(2);
    });

    it('shows "Sem gestor" for an existing agenda with no manager assigned', () => {
        render(<GestoresEspaco agendas={[agenda(1, 'manha'), agenda(2, 'tarde', 'Bruno'), agenda(3, 'noite', 'Carlos')]} />);

        expect(turnosRenderizados()).toEqual(['Manhã', 'Tarde', 'Noite']);
        expect(screen.getAllByText('Sem gestor')).toHaveLength(1);
    });

    it('pairs each manager with their own shift', () => {
        render(<GestoresEspaco agendas={[agenda(3, 'noite', 'Carlos'), agenda(1, 'manha', 'Ana'), agenda(2, 'tarde', 'Bruno')]} />);

        const linhas = screen.getAllByTestId('turno-linha').map((el) => el.textContent ?? '');

        expect(linhas[0]).toContain('Manhã');
        expect(linhas[0]).toContain('Ana');
        expect(linhas[1]).toContain('Tarde');
        expect(linhas[1]).toContain('Bruno');
        expect(linhas[2]).toContain('Noite');
        expect(linhas[2]).toContain('Carlos');
    });

    it('falls back to "Nenhum gestor" when the space has no agendas at all', () => {
        const { rerender } = render(<GestoresEspaco agendas={[]} />);
        expect(screen.getByText('Nenhum gestor')).toBeInTheDocument();
        expect(screen.queryAllByTestId('turno-label')).toHaveLength(0);

        rerender(<GestoresEspaco agendas={undefined} />);
        expect(screen.getByText('Nenhum gestor')).toBeInTheDocument();
    });
});
