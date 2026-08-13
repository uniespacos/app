import { SidebarProvider } from '@/components/ui/sidebar';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { NavMain } from './nav-main';

const mockUsePage = jest.fn();

jest.mock('@inertiajs/react', () => ({
    usePage: () => mockUsePage(),
    // forwardRef porque o Slot do Radix repassa ref para o filho.
    Link: React.forwardRef<HTMLAnchorElement, { href: string; children: React.ReactNode; prefetch?: boolean }>(
        ({ href, children, prefetch, ...props }, ref) => (
            <a href={href} ref={ref} data-prefetch={prefetch ? 'true' : undefined} {...props}>
                {children}
            </a>
        ),
    ),
}));

jest.mock('@/hooks/use-mobile', () => ({
    useIsMobile: jest.fn(() => false),
}));

const renderNav = (items: Parameters<typeof NavMain>[0]['items'], url = '/dashboard') => {
    mockUsePage.mockReturnValue({ url });

    return render(
        <SidebarProvider>
            <NavMain label="Gerir" items={items} />
        </SidebarProvider>,
    );
};

describe('NavMain', () => {
    beforeEach(() => {
        mockUsePage.mockReset();
    });

    it('renderiza item sem subitens como link direto', () => {
        renderNav([{ title: 'Gerir Espaços', href: '/institucional/espacos' }]);

        expect(screen.getByRole('link', { name: 'Gerir Espaços' })).toHaveAttribute('href', '/institucional/espacos');
    });

    it('acha submenu de um unico item no menu principal, usando o titulo do subitem', () => {
        renderNav([
            {
                title: 'Chamados',
                href: '/gestor/chamados',
                items: [{ title: 'Fila de Chamados', href: '/gestor/chamados' }],
            },
        ]);

        expect(screen.getByRole('link', { name: 'Fila de Chamados' })).toHaveAttribute('href', '/gestor/chamados');
        expect(screen.queryByRole('button', { name: /Chamados/ })).not.toBeInTheDocument();
    });

    it('agrupa dois ou mais subitens sob um item recolhivel, fechado fora do contexto', () => {
        renderNav([
            {
                title: 'Chamados',
                href: '/gestor/chamados',
                items: [
                    { title: 'Fila de Chamados', href: '/gestor/chamados' },
                    { title: 'Espaços sem Responsável', href: '/institucional/chamados' },
                ],
            },
        ]);

        const gatilho = screen.getByRole('button', { name: /Chamados/ });

        expect(gatilho).toHaveAttribute('data-state', 'closed');
        expect(screen.queryByRole('link', { name: 'Fila de Chamados' })).not.toBeInTheDocument();

        fireEvent.click(gatilho);

        expect(screen.getByRole('link', { name: 'Fila de Chamados' })).toHaveAttribute('href', '/gestor/chamados');
        expect(screen.getByRole('link', { name: 'Espaços sem Responsável' })).toHaveAttribute('href', '/institucional/chamados');
    });

    it('abre o grupo e marca o subitem ativo quando a url atual e de um subitem', () => {
        renderNav(
            [
                {
                    title: 'Chamados',
                    href: '/gestor/chamados',
                    items: [
                        { title: 'Fila de Chamados', href: '/gestor/chamados' },
                        { title: 'Espaços sem Responsável', href: '/institucional/chamados' },
                    ],
                },
            ],
            '/institucional/chamados',
        );

        expect(screen.getByRole('button', { name: /Chamados/ })).toHaveAttribute('data-state', 'open');
        expect(screen.getByRole('link', { name: 'Espaços sem Responsável' }).closest('[data-active]')).toHaveAttribute('data-active', 'true');
    });
});
