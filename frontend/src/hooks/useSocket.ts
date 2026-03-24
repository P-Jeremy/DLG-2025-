import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '../api/config';

const SOCKET_SERVER_URL = API_BASE_URL || '/';

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
