import { fireEvent, render, screen } from '@testing-library/react';
import { ReservasFilters } from './ReservasFilters';

describe('ReservasFilters', () => {
    const props = {
        searchTerm: '',
        onSearchTermChange: jest.fn(),
        selectedSituacao: '',
        onSituacaoChange: jest.fn(),
        selectedArquivo: 'ativas',
        onArquivoChange: jest.fn(),
        selectedOrdenar: 'data_solicitacao',
        onOrdenarChange: jest.fn(),
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

    it('cai em Ativas quando nao recebe valor', () => {
        render(<ReservasFilters {...props} selectedArquivo="" />);

        expect(screen.getByLabelText('Exibir')).toHaveTextContent('Ativas');
    });

    it('nao oferece mais inativa entre as situacoes', () => {
        render(<ReservasFilters {...props} />);

        fireEvent.click(screen.getByLabelText('Situação'));

        expect(screen.queryByText('Inativa')).not.toBeInTheDocument();
        expect(screen.getByText('Em Análise')).toBeInTheDocument();
    });

    it('rotula o item vazio de situacao como Todas as situacoes', () => {
        render(<ReservasFilters {...props} />);

        fireEvent.click(screen.getByLabelText('Situação'));

        expect(screen.getAllByText('Todas as situações').length).toBeGreaterThan(0);
    });

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

    it('oferece o seletor de ordenacao com Data de solicitacao como padrao', () => {
        render(<ReservasFilters {...props} />);

        expect(screen.getByLabelText('Ordenar por')).toHaveTextContent('Data de solicitação');
    });

    it('notifica o pai ao escolher ordenar por Situacao', () => {
        render(<ReservasFilters {...props} />);

        fireEvent.click(screen.getByLabelText('Ordenar por'));
        fireEvent.click(screen.getByRole('option', { name: 'Situação' }));

        expect(props.onOrdenarChange).toHaveBeenCalledWith('situacao');
    });
});
