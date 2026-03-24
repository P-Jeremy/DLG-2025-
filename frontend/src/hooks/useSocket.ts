import { useEffect } from 'react';
import { io } from 'socket.io-client';

const SOCKET_SERVER_URL = '/';

export function useSocket(event: string, onEvent: () => void): void {
  useEffect(() => {
    const socket = io(SOCKET_SERVER_URL, { transports: ['websocket'] });

    socket.on(event, onEvent);

    return () => {
      socket.off(event, onEvent);
      socket.disconnect();
    };
  }, [event, onEvent]);
}
