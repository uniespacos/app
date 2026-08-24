import type { Andar, Modulo, Unidade } from '@/types';
import { router } from '@inertiajs/react';
import { fireEvent, render, screen } from '@testing-library/react';
import EspacoFiltroBusca from './EspacoFiltroBusca';

jest.mock('@inertiajs/react', () => ({
    router: {
        get: jest.fn(),
    },
}));

const mockUnidades: Unidade[] = [{ id: 1, nome: 'Campus Jequié', sigla: 'JQ' }];

const mockModulos: Modulo[] = [{ id: 1, nome: 'Módulo 1', unidade_id: 1 }];

const mockAndares: Andar[] = [{ id: 1, nome: '1', modulo_id: 1, tipo_acesso: [] }];

describe('EspacoFiltroBusca', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(router, 'get');
        (globalThis as unknown as { route: jest.Mock }).route = jest.fn((name: string) => `https://localhost/${name.replaceAll('.', '/')}`);
    });

    afterEach(() => {
        delete (globalThis as unknown as { route?: unknown }).route;
    });

    it('renderiza campo de busca e selects de filtros', () => {
        render(
            <EspacoFiltroBusca
                route="https://localhost/espacos"
                filters={{}}
                unidades={mockUnidades}
                modulos={mockModulos}
                andares={mockAndares}
                capacidadeEspacos={[20, 50]}
            />,
        );

        expect(screen.getByPlaceholderText('Buscar por nome do espaço, andar ou módulo...')).toBeInTheDocument();
        expect(screen.getByText('Todas as Unidades')).toBeInTheDocument();
    });

    it('atualiza o valor do input ao digitar na busca', () => {
        render(
            <EspacoFiltroBusca
                route="https://localhost/espacos"
                filters={{ search: 'Auditorio' }}
                unidades={mockUnidades}
                modulos={mockModulos}
                andares={mockAndares}
                capacidadeEspacos={[20, 50]}
            />,
        );

        const input = screen.getByPlaceholderText('Buscar por nome do espaço, andar ou módulo...');
        expect(input).toHaveValue('Auditorio');

        fireEvent.change(input, { target: { value: 'Laboratorio' } });
        expect(input).toHaveValue('Laboratorio');
    });
});
