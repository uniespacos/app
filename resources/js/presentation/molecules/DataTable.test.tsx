import { render, screen } from '@testing-library/react';
import { ColumnDef, DataTable } from './DataTable';

interface TestItem extends Record<string, unknown> {
    id: number;
    nome: string;
    sigla: string;
}

const mockData: TestItem[] = [
    { id: 1, nome: 'Item Alfa', sigla: 'IA' },
    { id: 2, nome: 'Item Beta', sigla: 'IB' },
];

const mockColumns: ColumnDef<TestItem>[] = [
    { header: 'Nome', accessorKey: 'nome' },
    { header: 'Sigla', accessorKey: 'sigla' },
];

describe('DataTable', () => {
    it('renders column headers and cell values', () => {
        render(<DataTable data={mockData} columns={mockColumns} />);

        expect(screen.getByText('Nome')).toBeInTheDocument();
        expect(screen.getByText('Sigla')).toBeInTheDocument();
        expect(screen.getByText('Item Alfa')).toBeInTheDocument();
        expect(screen.getByText('Item Beta')).toBeInTheDocument();
    });

    it('renders custom actions column when provided', () => {
        render(<DataTable data={mockData} columns={mockColumns} actions={(item) => <button type="button">Editar {item.sigla}</button>} />);

        expect(screen.getByText('Ações')).toBeInTheDocument();
        expect(screen.getByText('Editar IA')).toBeInTheDocument();
        expect(screen.getByText('Editar IB')).toBeInTheDocument();
    });

    it('renders empty state when data array is empty', () => {
        render(
            <DataTable
                data={[]}
                columns={mockColumns}
                emptyState={{
                    title: 'Nenhum item cadastrado',
                    description: 'Cadastre seu primeiro item para visualizar aqui.',
                }}
            />,
        );

        expect(screen.getByText('Nenhum item cadastrado')).toBeInTheDocument();
        expect(screen.getByText('Cadastre seu primeiro item para visualizar aqui.')).toBeInTheDocument();
    });

    it('renders card title and description when cardWrapper is true', () => {
        render(<DataTable data={mockData} columns={mockColumns} cardTitle="Itens do Sistema" cardDescription="Listagem geral de itens" />);

        expect(screen.getByText('Itens do Sistema')).toBeInTheDocument();
        expect(screen.getByText('Listagem geral de itens')).toBeInTheDocument();
    });
});
