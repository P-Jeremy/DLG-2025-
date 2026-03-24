import type { Server } from 'socket.io';
import type { IEventEmitter } from '../../application/interfaces/IEventEmitter';

export class SocketEventEmitter implements IEventEmitter {
  constructor(private readonly io: Server) {}

  emit(event: string): void {
    this.io.emit(event);
  }
}
