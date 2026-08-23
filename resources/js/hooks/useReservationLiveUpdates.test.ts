import { renderHook } from '@testing-library/react';
import { useReservationLiveUpdates } from './useReservationLiveUpdates';

describe('useReservationLiveUpdates', () => {
    let mockListen: jest.Mock;
    let mockStopListening: jest.Mock;
    let mockChannel: jest.Mock;

    beforeEach(() => {
        mockListen = jest.fn();
        mockStopListening = jest.fn();
        mockChannel = jest.fn(() => ({
            listen: mockListen,
            stopListening: mockStopListening,
        }));

        Object.defineProperty(window, 'Echo', {
            value: {
                channel: mockChannel,
            },
            writable: true,
            configurable: true,
        });

        jest.spyOn(document, 'dispatchEvent');
    });

    afterEach(() => {
        jest.restoreAllMocks();
        delete (window as unknown as { Echo?: unknown }).Echo;
    });

    it('should call window.Echo.channel with the correct channel name', () => {
        renderHook(() => useReservationLiveUpdates());

        expect(mockChannel).toHaveBeenCalledWith('reserva-channel');
    });

    it('should listen for .reserva-event with leading dot to prevent namespace prefixing', () => {
        renderHook(() => useReservationLiveUpdates());

        expect(mockListen).toHaveBeenCalledWith('.reserva-event', expect.any(Function));
    });

    it('should stop listening for .reserva-event when unmounting', () => {
        const { unmount } = renderHook(() => useReservationLiveUpdates());

        unmount();

        expect(mockStopListening).toHaveBeenCalledWith('.reserva-event');
    });

    it('should dispatch reserva:updated event when callback receives created action', () => {
        renderHook(() => useReservationLiveUpdates());

        const callback = mockListen.mock.calls[0][1] as (event: {
            action: string;
            reservaId: number;
        }) => void;

        callback({ action: 'created', reservaId: 1 });

        expect(document.dispatchEvent).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'reserva:updated',
            })
        );
    });

    it('should dispatch reserva:updated event when callback receives validated action', () => {
        renderHook(() => useReservationLiveUpdates());

        const callback = mockListen.mock.calls[0][1] as (event: {
            action: string;
            reservaId: number;
        }) => void;

        callback({ action: 'validated', reservaId: 2 });

        expect(document.dispatchEvent).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'reserva:updated',
            })
        );
    });

    it('should not dispatch event when callback receives unknown action', () => {
        renderHook(() => useReservationLiveUpdates());

        const callback = mockListen.mock.calls[0][1] as (event: {
            action: string;
            reservaId: number;
        }) => void;

        jest.clearAllMocks();

        callback({ action: 'ignorada', reservaId: 1 });

        expect(document.dispatchEvent).not.toHaveBeenCalled();
    });

    it('should handle undefined window.Echo gracefully', () => {
        delete (window as unknown as { Echo?: unknown }).Echo;

        expect(() => {
            renderHook(() => useReservationLiveUpdates());
        }).not.toThrow();

        expect(mockChannel).not.toHaveBeenCalled();
    });
});
