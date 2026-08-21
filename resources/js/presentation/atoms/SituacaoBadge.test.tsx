import { render, screen } from '@testing-library/react';
import { SituacaoBadge } from './SituacaoBadge';

/**
 * O badge passou a ler cor e rótulo de ESTILO_SITUACAO em vez de repetir um
 * trio de classes por caso. O caso `inativa` é o que mais importa aqui: o
 * código anterior tinha `border-black-200 text-black-700`, que não existem no
 * Tailwind — nenhuma cor era de fato aplicada, e ninguém percebia porque o
 * texto simplesmente herdava a cor do elemento pai.
 */
describe('SituacaoBadge', () => {
    it.each([
        ['em_analise', 'Em Análise'],
        ['parcialmente_deferida', 'Parcialmente Deferida'],
        ['deferida', 'Deferida'],
        ['indeferida', 'Indeferida'],
        ['inativa', 'Inativa / Cancelada'],
    ] as const)('renderiza o rótulo de %s', (situacao, rotulo) => {
        render(<SituacaoBadge situacao={situacao} />);

        expect(screen.getByText(rotulo)).toBeInTheDocument();
    });

    /** Regressão do bug: a cor precisa vir de uma classe que o Tailwind gera. */
    it('aplica uma classe de token de tema, nunca uma classe inexistente', () => {
        render(<SituacaoBadge situacao="inativa" />);

        const badge = screen.getByText('Inativa / Cancelada').closest('[class]');

        expect(badge?.className).not.toMatch(/\bblack-\d/);
        expect(badge?.className).toMatch(/neutral-accent/);
    });
});
