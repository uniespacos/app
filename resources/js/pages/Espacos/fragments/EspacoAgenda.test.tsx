import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React, { useState } from 'react';
import EspacoAgenda from './EspacoAgenda';
import { Espaco, Reserva } from '@/types';
import { addDays, format } from 'date-fns';

// Mock dependencies
jest.mock('@inertiajs/react', () => ({
    useForm: (initialValues: any) => {
        const [data, setData] = useState(initialValues);
        return {
            data,
            setData: (update: any) => {
                if (typeof update === 'function') {
                    setData((prev: any) => {
                        const newData = update(prev);
                        return newData;
                    });
                } else {
                    setData((prev: any) => ({ ...prev, ...update }));
                }
            },
            post: jest.fn(),
            patch: jest.fn(),
            processing: false,
            reset: jest.fn(),
        };
    },
    router: {
        get: jest.fn(),
    },
    usePage: () => ({ props: {} }),
}));

jest.mock('@/components/ui/button', () => ({ Button: (props: any) => <button {...props}>{props.children}</button> }));
jest.mock('sonner', () => ({ toast: { error: jest.fn(), success: jest.fn() } }));

// Mock children to avoid complex rendering
jest.mock('./AgendaHeader', () => () => <div data-testid="agenda-header">Header</div>);
jest.mock('./AgendaNavegacao', () => () => <div data-testid="agenda-navegacao">Navegacao</div>);
jest.mock('./AgendaEditModeAlert', () => () => <div data-testid="agenda-alert">Alert</div>);

// IMPORTANT: Mock AgendaCalendario to allow selecting slots
jest.mock('./AgendaCalendario', () => ({ alternarSelecaoSlot, slotsDaReserva }: any) => (
    <div data-testid="agenda-calendario">
        <button 
            data-testid="select-slot-btn"
            onClick={() => alternarSelecaoSlot({
                id: '1',
                data: new Date('2024-02-10T10:00:00'),
                horario_inicio: '10:00',
                horario_fim: '11:00',
                status: 'disponivel',
                agenda_id: 1
            })}
        >
            Select Slot
        </button>
        <div data-testid="selected-slots-count">{slotsDaReserva.length}</div>
    </div>
));

// Mock AgendaDialogReserva to expose formData manipulation
jest.mock('./AgendaDialogReserva', () => ({ isOpen, onOpenChange, setFormData, formData }: any) => {
    // We need to render a trigger to open the dialog
    return (
        <div data-testid="agenda-dialog-wrapper">
             <button data-testid="open-dialog-btn" onClick={() => onOpenChange(true)}>Open Dialog</button>
             
             {isOpen && (
                <div data-testid="agenda-dialog-content">
                    <span data-testid="form-data-inicial">{formData.data_inicial ? format(new Date(formData.data_inicial), 'yyyy-MM-dd') : 'null'}</span>
                    <span data-testid="form-data-final">{formData.data_final ? format(new Date(formData.data_final), 'yyyy-MM-dd') : 'null'}</span>
                    <span data-testid="form-recorrencia">{formData.recorrencia}</span>
                    
                    <button 
                        data-testid="set-recorrencia-personalizado" 
                        onClick={() => setFormData('recorrencia', 'personalizado')}
                    >
                        Set Personalizado
                    </button>
                    
                    <button 
                        data-testid="set-data-inicial-feb-15" 
                        onClick={() => setFormData('data_inicial', new Date('2024-02-15T00:00:00'))}
                    >
                        Set Start Date Feb 15
                    </button>

                     <button 
                        data-testid="set-data-final-feb-25" 
                        onClick={() => setFormData('data_final', new Date('2024-02-25T00:00:00'))}
                    >
                        Set End Date Feb 25
                    </button>
                </div>
             )}
        </div>
    );
});

describe('EspacoAgenda Logic', () => {
    const mockEspaco: any = {
        id: 1,
        nome: 'Sala 1',
        capacidade: 10,
        agendas: [],
    };

    const mockSemana = { referencia: '2024-02-05' }; // Feb 5th 2024 is Monday

    it('reproduces the bug: data_inicial resets when data_final changes in personalizado mode', async () => {
        // Use fake timers to control async effects if needed, but here simple waitFor is usually enough
        // However, the effect runs immediately on render/update.

        render(<EspacoAgenda espaco={mockEspaco} semana={mockSemana} />);

        // 1. Select a slot (Feb 10th)
        // This sets slotsSelecao -> triggers effect -> sets data_inicial/final based on 'unica' (default)
        // Default: start = Feb 10, end = Feb 10 (unica is max of slots)
        
        // We need to trigger the slot selection via our mocked AgendaCalendario
        // The mock renders children directly in the test file scope? No, mock is defined outside.
        // We need to find the button inside the rendered component.
        
        // The mock is functional component, so it renders.
        const selectSlotBtn = await screen.findByTestId('select-slot-btn');
        fireEvent.click(selectSlotBtn);
        
        // Wait for slots to be updated and dialog wrapper to appear
        const openDialogBtn = await screen.findByTestId('open-dialog-btn');
        fireEvent.click(openDialogBtn);
        
        // Verify initial state (Unica)
        const recorrenciaEl = await screen.findByTestId('form-recorrencia');
        expect(recorrenciaEl.textContent).toBe('unica');
        
        const dataInicialEl = screen.getByTestId('form-data-inicial');
        expect(dataInicialEl.textContent).toBe('2024-02-10'); // Slot date

        // 2. Change to Personalizado
        const setPersonalizadoBtn = screen.getByTestId('set-recorrencia-personalizado');
        fireEvent.click(setPersonalizadoBtn);
        
        // Expect recorrencia to be personalizado
        await waitFor(() => expect(screen.getByTestId('form-recorrencia').textContent).toBe('personalizado'));
        
        // 3. Change Data Inicial to Feb 15
        const setDataInicialBtn = screen.getByTestId('set-data-inicial-feb-15');
        fireEvent.click(setDataInicialBtn);
        
        // Verify Data Inicial changed to Feb 15
        await waitFor(() => expect(screen.getByTestId('form-data-inicial').textContent).toBe('2024-02-15'));
        
        // 4. Change Data Final to Feb 25
        // This is the bug trigger: changing data_final causes the effect to run and reset data_inicial to Feb 10
        const setDataFinalBtn = screen.getByTestId('set-data-final-feb-25');
        fireEvent.click(setDataFinalBtn);
        
        // 5. Verify Data Final is Feb 25 AND Data Inicial is STILL Feb 15
        // If bug exists, Data Inicial will revert to Feb 10
        await waitFor(() => {
             expect(screen.getByTestId('form-data-final').textContent).toBe('2024-02-25');
        });

        // This assertion fails if the bug is present
        expect(screen.getByTestId('form-data-inicial').textContent).toBe('2024-02-15');
    });

    it('should not reset data_inicial when it is manually changed in personalizado mode', async () => {
        render(<EspacoAgenda espaco={mockEspaco} semana={mockSemana} />);

        // 1. Select a slot from Feb 10th
        const selectSlotBtn = await screen.findByTestId('select-slot-btn');
        fireEvent.click(selectSlotBtn);
        
        // 2. Open the dialog
        const openDialogBtn = await screen.findByTestId('open-dialog-btn');
        fireEvent.click(openDialogBtn);

        // Verify initial date is based on selected slot
        const dataInicialEl = await screen.findByTestId('form-data-inicial');
        expect(dataInicialEl.textContent).toBe('2024-02-10');

        // 3. Change to Personalizado mode
        const setPersonalizadoBtn = screen.getByTestId('set-recorrencia-personalizado');
        fireEvent.click(setPersonalizadoBtn);
        await waitFor(() => expect(screen.getByTestId('form-recorrencia').textContent).toBe('personalizado'));

        // 4. Manually change the start date to Feb 15
        const setDataInicialBtn = screen.getByTestId('set-data-inicial-feb-15');
        fireEvent.click(setDataInicialBtn);

        // 5. Assert that the start date is updated and STAYS updated.
        // With the bug, the useEffect would immediately revert this change back to Feb 10.
        await waitFor(() => {
            expect(screen.getByTestId('form-data-inicial').textContent).toBe('2024-02-15');
        });

        // Final check to ensure no reverts happened after state update
        expect(screen.getByTestId('form-data-inicial').textContent).toBe('2024-02-15');
    });
});
