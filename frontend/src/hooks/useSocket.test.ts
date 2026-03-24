import { renderHook } from '@testing-library/react';
import { useSocket } from './useSocket';

const mockOff = jest.fn();
const mockOn = jest.fn();
const mockDisconnect = jest.fn();

jest.mock('socket.io-client', () => ({
  io: () => ({
    on: mockOn,
    off: mockOff,
    disconnect: mockDisconnect,
  }),
}));

describe('useSocket hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('subscribes to the given event on mount', () => {
    const callback = jest.fn();

    renderHook(() => useSocket('refresh', callback));

    expect(mockOn).toHaveBeenCalledWith('refresh', callback);
  });

  it('unsubscribes and disconnects on unmount', () => {
    const callback = jest.fn();

    const { unmount } = renderHook(() => useSocket('refresh', callback));

    unmount();

    expect(mockOff).toHaveBeenCalledWith('refresh', callback);
    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('calls the callback when the event is received', () => {
    const callback = jest.fn();

    renderHook(() => useSocket('refresh', callback));

    const registeredHandler = (mockOn.mock.calls[0] as [string, () => void])[1];
    registeredHandler();

    expect(callback).toHaveBeenCalledTimes(1);
  });
});
