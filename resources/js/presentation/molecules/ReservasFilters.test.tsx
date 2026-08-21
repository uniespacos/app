import { fireEvent, render, screen } from '@testing-library/react';
import { ReservasFilters } from './ReservasFilters';

/**
 * Issue #108 — o filtro de arquivamento é um eixo próprio, separado da situação.
 *
 * Antes desta issue a única forma de ver arquivadas era a opção 'inativa' dentro
 * do select de situação, e ela só existia para o gestor. O usuário comum não
 * tinha caminho nenhum — e, mesmo que tivesse, o backend devolveria vazio.
 */
describe('ReservasFilters', () => {
    const props = {
        searchTerm: '',
        onSearchTermChange: jest.fn(),
        selectedSituacao: '',
        onSituacaoChange: jest.fn(),
        selectedArquivo: 'ativas',
        onArquivoChange: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('oferece o seletor de arquivamento', () => {
        render(<ReservasFilters {...props} />);

        expect(screen.getByLabelText('Exibir')).toBeInTheDocument();
    });

    it('mostra o modo selecionado', () => {
        render(<ReservasFilters {...props} selectedArquivo="arquivadas" />);

        expect(screen.getByLabelText('Exibir')).toHaveTextContent('Arquivadas');
    });

    /** Sem valor vindo do servidor, o padrão do backend é o que aparece. */
    it('cai em Ativas quando nao recebe valor', () => {
        render(<ReservasFilters {...props} selectedArquivo="" />);

        expect(screen.getByLabelText('Exibir')).toHaveTextContent('Ativas');
    });

    /**
     * 'inativa' saiu do select de situação: enquanto dividia o campo com os
     * estados de avaliação, filtrar por arquivadas contradizia o padrão do
     * backend e devolvia lista vazia.
     */
    it('nao oferece mais inativa entre as situacoes', () => {
        render(<ReservasFilters {...props} />);

        fireEvent.click(screen.getByLabelText('Situação'));

        expect(screen.queryByText('Inativa')).not.toBeInTheDocument();
        expect(screen.getByText('Em Análise')).toBeInTheDocument();
    });

    /** O rótulo passou a ser verdade: só decide situação, não arquivamento. */
    it('rotula o item vazio de situacao como Todas as situacoes', () => {
        render(<ReservasFilters {...props} />);

        fireEvent.click(screen.getByLabelText('Situação'));

        expect(screen.getAllByText('Todas as situações').length).toBeGreaterThan(0);
    });

    /**
     * Sem o valor padrão mapeado para um item real, o trigger caía no
     * placeholder cinza-claro — parecendo "nada selecionado" ao lado do select
     * "Exibir", que sempre mostra um valor concreto ("Ativas"). Os dois devem
     * ter o mesmo peso visual no estado padrão.
     */
    it('mostra Todas as situacoes no trigger quando nao ha filtro', () => {
        render(<ReservasFilters {...props} />);

        expect(screen.getByLabelText('Situação')).toHaveTextContent('Todas as situações');
    });

    it('notifica o pai ao escolher Arquivadas', () => {
        render(<ReservasFilters {...props} />);

        fireEvent.click(screen.getByLabelText('Exibir'));
        fireEvent.click(screen.getByText('Arquivadas'));

        expect(props.onArquivoChange).toHaveBeenCalledWith('arquivadas');
    });
});
