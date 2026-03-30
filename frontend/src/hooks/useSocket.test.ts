import { renderHook } from '@testing-library/react';
import { useSocket } from './useSocket';
import { SONG_EVENTS } from '../constants/events';

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

    renderHook(() => useSocket(SONG_EVENTS.REFRESH, callback));

    expect(mockOn).toHaveBeenCalledWith(SONG_EVENTS.REFRESH, callback);
  });

  it('unsubscribes and disconnects on unmount', () => {
    const callback = jest.fn();

    const { unmount } = renderHook(() => useSocket(SONG_EVENTS.REFRESH, callback));

    unmount();

    expect(mockOff).toHaveBeenCalledWith(SONG_EVENTS.REFRESH, callback);
    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('calls the callback when the event is received', () => {
    const callback = jest.fn();

    renderHook(() => useSocket(SONG_EVENTS.REFRESH, callback));

    const registeredHandler = (mockOn.mock.calls[0] as [string, () => void])[1];
    registeredHandler();

    expect(callback).toHaveBeenCalledTimes(1);
  });
});
