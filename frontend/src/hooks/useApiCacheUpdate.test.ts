import { renderHook } from '@testing-library/react';
import { useApiCacheUpdate } from './useApiCacheUpdate';

const mockClose = jest.fn();
let capturedOnMessage: (() => void) | null = null;

type GlobalWithBroadcastChannel = typeof globalThis & { BroadcastChannel: unknown };

const MockBroadcastChannel = jest.fn().mockImplementation(() => {
  const instance = {
    onmessage: null as (() => void) | null,
    close: mockClose,
  };
  Object.defineProperty(instance, 'onmessage', {
    set(handler: () => void) { capturedOnMessage = handler; },
    get() { return capturedOnMessage; },
    configurable: true,
  });
  return instance;
});

describe('useApiCacheUpdate hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    capturedOnMessage = null;
    (globalThis as GlobalWithBroadcastChannel).BroadcastChannel = MockBroadcastChannel;
  });

  afterEach(() => {
    (globalThis as GlobalWithBroadcastChannel).BroadcastChannel = undefined as unknown as typeof BroadcastChannel;
  });

  it('opens a BroadcastChannel named "api-updates" on mount', () => {
    const callback = jest.fn();

    renderHook(() => useApiCacheUpdate(callback));

    expect(MockBroadcastChannel).toHaveBeenCalledWith('api-updates');
  });

  it('calls the callback when a message is received on the channel', () => {
    const callback = jest.fn();

    renderHook(() => useApiCacheUpdate(callback));

    expect(capturedOnMessage).not.toBeNull();
    capturedOnMessage!();

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('closes the channel on unmount', () => {
    const callback = jest.fn();

    const { unmount } = renderHook(() => useApiCacheUpdate(callback));

    unmount();

    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it('does not throw when BroadcastChannel is not available in window', () => {
    (globalThis as GlobalWithBroadcastChannel).BroadcastChannel = undefined as unknown as typeof BroadcastChannel;

    const callback = jest.fn();

    expect(() => {
      const { unmount } = renderHook(() => useApiCacheUpdate(callback));
      unmount();
    }).not.toThrow();
  });
});
