import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;
let activeUserId: string | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io('/', {
      autoConnect: false,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 15,
    });

    // Re-autenticar automáticamente ante reconexiones de red
    socket.on('connect', () => {
      if (activeUserId) {
        socket?.emit('authenticate', { userId: activeUserId });
      }
    });

    socket.on('reconnect', () => {
      if (activeUserId) {
        socket?.emit('authenticate', { userId: activeUserId });
      }
    });
  }
  return socket;
}

export function connectSocket(userId: string) {
  activeUserId = userId;
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  } else {
    s.emit('authenticate', { userId });
  }
  return s;
}

export function disconnectSocket() {
  activeUserId = null;
  if (socket && socket.connected) {
    socket.disconnect();
  }
}
