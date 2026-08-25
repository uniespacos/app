import type { Reserva } from '@/types';
import { fireEvent, render, screen } from '@testing-library/react';
import { ReservaCardMobile } from './ReservaCardMobile';

const mockReserva: Reserva = {
    id: 42,
    titulo: 'Seminário de Inteligência Artificial',
    descricao: 'Apresentação de trabalhos finais',
    situacao: 'deferida',
    data_inicial: new Date('2026-09-01T09:00:00Z'),
    data_final: new Date('2026-09-01T12:00:00Z'),
    can_update: true,
    horarios: [
        {
            agenda: {
                espaco: {
                    id: 5,
                    nome: 'Laboratório 3',
                    andar: {
                        id: 1,
                        nome: 'andar-2',
                        modulo: {
                            id: 1,
                            nome: 'Módulo Central',
                            unidade_id: 1,
                        },
                    },
                },
            },
        } as any,
    ],
} as unknown as Reserva;

describe('ReservaCardMobile', () => {
    it('renderiza título, localização, datas e badge de situação', () => {
        render(
            <ReservaCardMobile
                reserva={mockReserva}
                isGestor={false}
                onDetalhes={jest.fn()}
                onAvaliar={jest.fn()}
                onEditar={jest.fn()}
                onCancelar={jest.fn()}
            />,
        );

        expect(screen.getByText('Seminário de Inteligência Artificial')).toBeInTheDocument();
        expect(screen.getByText('Laboratório 3 - Módulo Central - 2º Andar')).toBeInTheDocument();
        expect(screen.getByText('Deferida')).toBeInTheDocument();
    });

    it('executa ações de usuário comum (Detalhes, Editar, Cancelar)', () => {
        const onDetalhes = jest.fn();
        const onEditar = jest.fn();
        const onCancelar = jest.fn();

        render(
            <ReservaCardMobile
                reserva={mockReserva}
                isGestor={false}
                onDetalhes={onDetalhes}
                onAvaliar={jest.fn()}
                onEditar={onEditar}
                onCancelar={onCancelar}
            />,
        );

        fireEvent.click(screen.getByRole('button', { name: /Detalhes/i }));
        expect(onDetalhes).toHaveBeenCalledWith(mockReserva);

        fireEvent.click(screen.getByRole('button', { name: /Editar/i }));
        expect(onEditar).toHaveBeenCalledWith(42);

        fireEvent.click(screen.getByRole('button', { name: /Cancelar/i }));
        expect(onCancelar).toHaveBeenCalledWith(mockReserva);
    });

    it('executa ação de gestor (Avaliar/Reavaliar)', () => {
        const onAvaliar = jest.fn();
        const reservaEmAnalise: Reserva = {
            ...mockReserva,
            situacao: 'em_analise',
        };

        render(
            <ReservaCardMobile
                reserva={reservaEmAnalise}
                isGestor={true}
                onDetalhes={jest.fn()}
                onAvaliar={onAvaliar}
                onEditar={jest.fn()}
                onCancelar={jest.fn()}
            />,
        );

        fireEvent.click(screen.getByRole('button', { name: /Avaliar/i }));
        expect(onAvaliar).toHaveBeenCalledWith(42);
    });
});
