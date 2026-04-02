import { SocketEventEmitter } from '../../src/infrastructure/services/SocketEventEmitter';
import type { Server } from 'socket.io';

describe('SocketEventEmitter', () => {
  it('should call io.emit with the given event', () => {
    const mockIo = { emit: jest.fn() } as unknown as Server;
    const emitter = new SocketEventEmitter(mockIo);

    emitter.emit('songs:refresh');

    expect(mockIo.emit).toHaveBeenCalledWith('songs:refresh');
  });

  it('should forward any event name as-is', () => {
    const mockIo = { emit: jest.fn() } as unknown as Server;
    const emitter = new SocketEventEmitter(mockIo);

    emitter.emit('custom:event');

    expect(mockIo.emit).toHaveBeenCalledWith('custom:event');
  });
});
