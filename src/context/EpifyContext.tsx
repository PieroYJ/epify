import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import confetti from 'canvas-confetti';
import type {
  User,
  FriendRequest,
  Conversation,
  Message,
  ReportItem,
  ActiveTab,
  UserStatus,
} from '../types';
import {
  getUserDataApi,
  getAllUsersApi,
  loginApi,
  registerApi,
  updateStatusApi,
  blockUserApi,
  unblockUserApi,
  reportUserApi,
  resetServerDataApi,
  adminCreateUserApi,
  adminDeleteUserApi,
  sendMessageApi,
  deleteMessageApi,
  clearChatApi,
} from '../services/api';
import { connectSocket, disconnectSocket, getSocket } from '../services/socket';

interface EpifyContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  users: User[];
  friendRequests: FriendRequest[];
  conversations: Conversation[];
  messages: Message[];
  reports: ReportItem[];
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  activeChatUserId: string | null;
  openChatWithUser: (userId: string) => boolean;
  closeChat: () => void;
  login: (username: string, pin?: string) => Promise<{ success: boolean; error?: string }>;
  register: (
    name: string,
    username: string,
    avatar: string,
    pin: string
  ) => Promise<{ success: boolean; error?: string }>;
  adminCreateUser: (userData: {
    name: string;
    username: string;
    avatar: string;
    pin: string;
    role?: 'admin' | 'user';
    badge?: string;
    statusMessage?: string;
  }) => Promise<{ success: boolean; user?: User; error?: string }>;
  adminDeleteUser: (targetUserId: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  sendFriendRequest: (targetUserId: string) => { success: boolean; message: string };
  acceptFriendRequest: (requestId: string) => void;
  rejectFriendRequest: (requestId: string) => void;
  cancelFriendRequest: (requestId: string) => void;
  sendMessage: (receiverId: string, content: string) => { success: boolean; error?: string };
  deleteMessage: (messageId: string, targetUserId?: string) => Promise<{ success: boolean }>;
  clearChat: (targetUserId: string) => Promise<{ success: boolean }>;
  blockUser: (targetUserId: string) => void;
  unblockUser: (targetUserId: string) => void;
  reportUser: (targetUserId: string, reason: string, details?: string) => void;
  updateCurrentUserStatus: (status: UserStatus, statusMessage?: string, avatar?: string) => void;
  getFriends: (userId?: string) => User[];
  getPendingReceivedRequests: (userId?: string) => { request: FriendRequest; user: User }[];
  getPendingSentRequests: (userId?: string) => { request: FriendRequest; user: User }[];
  isFriend: (userIdA: string, userIdB: string) => boolean;
  hasPendingRequest: (userIdA: string, userIdB: string) => boolean;
  isBlocked: (userIdA: string, userIdB: string) => boolean;
  getConversationWith: (targetUserId: string) => Message[];
  resetDemoData: () => Promise<void>;
  unreadRequestsCount: number;
  onlineUserIds: string[];
}

const EpifyContext = createContext<EpifyContextType | undefined>(undefined);

// Usamos sessionStorage para permitir que diferentes pestañas en el mismo navegador tengan usuarios distintos
const SESSION_STORAGE_KEY = 'epify_tab_user_id';

export const EpifyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    return sessionStorage.getItem(SESSION_STORAGE_KEY) || null;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reports] = useState<ReportItem[]>([]);
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);

  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [activeChatUserId, setActiveChatUserId] = useState<string | null>(null);

  // 1. Cargar datos del servidor cuando cambia currentUserId
  const syncUserData = async (userId: string) => {
    const data = await getUserDataApi(userId);
    if (data) {
      setCurrentUser(data.user);
      setUsers(data.users);
      setFriendRequests(data.friendRequests);
      setConversations(data.conversations);
      setMessages(data.messages);
    } else {
      // Si el usuario no existe en backend, cerrar sesión
      setCurrentUserId(null);
      setCurrentUser(null);
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }
  };

  useEffect(() => {
    // Cargar todos los usuarios inicialmente para la pantalla de login
    getAllUsersApi().then((all) => {
      if (all.length > 0) setUsers(all);
    });

    if (currentUserId) {
      syncUserData(currentUserId);
    }
  }, [currentUserId]);

  // 2. Conectar WebSockets en tiempo real cuando hay usuario autenticado
  useEffect(() => {
    if (!currentUserId) {
      disconnectSocket();
      return;
    }

    const socket = connectSocket(currentUserId);

    // Lista de usuarios online
    socket.on('online_users', (ids: string[]) => {
      setOnlineUserIds(ids);
    });

    // Cambio de estado de un usuario (online, offline, jugando, etc.)
    socket.on(
      'user_status_changed',
      ({
        userId,
        status,
        statusMessage,
        avatar,
      }: {
        userId: string;
        status: UserStatus;
        statusMessage?: string;
        avatar?: string;
      }) => {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId
              ? {
                  ...u,
                  status,
                  ...(statusMessage !== undefined && { statusMessage }),
                  ...(avatar && { avatar }),
                }
              : u
          )
        );

        if (status === 'online') {
          setOnlineUserIds((prev) => [...new Set([...prev, userId])]);
        } else if (status === 'offline') {
          setOnlineUserIds((prev) => prev.filter((id) => id !== userId));
        }

        if (userId === currentUserId) {
          setCurrentUser((prev) => (prev ? { ...prev, status, ...(statusMessage !== undefined && { statusMessage }), ...(avatar && { avatar }) } : null));
        }
      }
    );

    // Mensaje entrante en tiempo real (de otro niño real o de Epibot)
    socket.on(
      'message_received',
      ({
        message,
        conversation,
        conversationId,
        receiverId,
      }: {
        message: Message;
        conversation?: Conversation;
        conversationId: string;
        receiverId: string;
      }) => {
        setMessages((prev) => {
          // Si el mensaje real ya existe por id, no hacer nada
          if (prev.some((m) => m.id === message.id)) return prev;

          // Reemplazar mensaje temporal optimista correspondiente
          const tempIndex = prev.findIndex(
            (m) =>
              m.id.startsWith('temp_') &&
              m.senderId === message.senderId &&
              m.content === message.content
          );

          if (tempIndex >= 0) {
            const updated = [...prev];
            updated[tempIndex] = message;
            return updated;
          }

          return [...prev, message];
        });

        // Asegurar que la conversación exista y esté completa en el estado local
        setConversations((prev) => {
          if (conversation) {
            const idx = prev.findIndex((c) => c.id === conversation.id);
            if (idx >= 0) {
              const copy = [...prev];
              copy[idx] = conversation;
              return copy;
            }
            return [...prev, conversation];
          }

          if (prev.some((c) => c.id === conversationId)) return prev;

          // Fallback seguro si la conversación aún no existía en memoria
          const otherParticipant =
            message.senderId === currentUserId ? receiverId : message.senderId;

          return [
            ...prev,
            {
              id: conversationId,
              participantA: currentUserId || message.senderId,
              participantB: otherParticipant,
              createdAt: message.createdAt,
            },
          ];
        });
      }
    );

    // Mensaje eliminado en tiempo real
    socket.on('message_deleted', ({ messageId }: { messageId: string }) => {
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    });

    // Conversación limpiada en tiempo real
    socket.on(
      'conversation_cleared',
      ({
        conversationId,
        userId,
        targetUserId,
      }: {
        conversationId: string;
        userId?: string;
        targetUserId?: string;
      }) => {
        setMessages((prev) =>
          prev.filter((m) => {
            if (m.conversationId === conversationId) return false;
            if (userId && targetUserId) {
              if (
                (m.senderId === userId && m.receiverId === targetUserId) ||
                (m.senderId === targetUserId && m.receiverId === userId)
              ) {
                return false;
              }
            }
            return true;
          })
        );
      }
    );

    // Solicitud de amistad recibida en tiempo real
    socket.on(
      'friend_request_received',
      ({ request, senderUser }: { request: FriendRequest; senderUser: User }) => {
        setFriendRequests((prev) => {
          if (prev.some((r) => r.id === request.id)) return prev;
          return [...prev, request];
        });

        if (senderUser) {
          setUsers((prev) => {
            if (prev.some((u) => u.id === senderUser.id)) return prev;
            return [...prev, senderUser];
          });
        }
      }
    );

    // Solicitud de amistad confirmada enviada
    socket.on('friend_request_sent', ({ request }: { request: FriendRequest }) => {
      setFriendRequests((prev) => [...prev, request]);
    });

    // Solicitud de amistad aceptada en tiempo real
    socket.on(
      'friend_request_accepted',
      ({ request, newFriend }: { request: FriendRequest; newFriend?: User }) => {
        setFriendRequests((prev) =>
          prev.map((r) => (r.id === request.id ? { ...r, status: 'ACCEPTED' } : r))
        );

        if (newFriend) {
          setUsers((prev) =>
            prev.map((u) => (u.id === newFriend.id ? { ...u, ...newFriend } : u))
          );
        }

        // Celebración con confeti
        try {
          confetti({
            particleCount: 70,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#FF6B8B', '#FFD166', '#06D6A0', '#118AB2', '#A370F7'],
          });
        } catch {
          // Ignorar
        }
      }
    );

    // Solicitud actualizada (rechazada, etc.)
    socket.on('friend_request_updated', ({ request }: { request: FriendRequest }) => {
      setFriendRequests((prev) =>
        prev.map((r) => (r.id === request.id ? { ...r, ...request } : r))
      );
    });

    // Solicitud cancelada
    socket.on('friend_request_cancelled', ({ requestId }: { requestId: string }) => {
      setFriendRequests((prev) => prev.filter((r) => r.id !== requestId));
    });

    // Error de mensaje
    socket.on('error_message', ({ error }: { error: string }) => {
      alert(`🛡️ Epify: ${error}`);
    });

    // Reinicio de datos en el servidor
    socket.on('data_reset', () => {
      if (currentUserId) {
        syncUserData(currentUserId);
      }
    });

    // Usuario creado en tiempo real
    socket.on('user_created', (newUser: User) => {
      setUsers((prev) => {
        if (prev.some((u) => u.id === newUser.id)) return prev;
        return [...prev, newUser];
      });
    });

    // Usuario eliminado en tiempo real
    socket.on('user_deleted', ({ userId }: { userId: string }) => {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setFriendRequests((prev) => prev.filter((r) => r.senderId !== userId && r.receiverId !== userId));
      setConversations((prev) => prev.filter((c) => c.participantA !== userId && c.participantB !== userId));
      setMessages((prev) => prev.filter((m) => m.senderId !== userId));
      setActiveChatUserId((currentChat) => (currentChat === userId ? null : currentChat));
    });

    // Lista de usuarios actualizada
    socket.on('users_updated', (updatedUsers: User[]) => {
      if (Array.isArray(updatedUsers)) {
        setUsers(updatedUsers);
      }
    });

    return () => {
      socket.off('online_users');
      socket.off('user_status_changed');
      socket.off('message_received');
      socket.off('friend_request_received');
      socket.off('friend_request_sent');
      socket.off('friend_request_accepted');
      socket.off('friend_request_updated');
      socket.off('friend_request_cancelled');
      socket.off('error_message');
      socket.off('data_reset');
      socket.off('user_created');
      socket.off('user_deleted');
      socket.off('users_updated');
    };
  }, [currentUserId]);

  // Login de usuario
  const login = async (username: string, pin?: string): Promise<{ success: boolean; error?: string }> => {
    const res = await loginApi(username, pin);
    if (res.success && res.user) {
      setCurrentUserId(res.user.id);
      setCurrentUser(res.user);
      sessionStorage.setItem(SESSION_STORAGE_KEY, res.user.id);
      await syncUserData(res.user.id);
      return { success: true };
    }
    return { success: false, error: res.error || 'Error al iniciar sesión' };
  };

  // Registro de nuevo usuario
  const register = async (
    name: string,
    username: string,
    avatar: string,
    pin: string
  ): Promise<{ success: boolean; error?: string }> => {
    const res = await registerApi(name, username, avatar, pin);
    if (res.success && res.user) {
      setCurrentUserId(res.user.id);
      setCurrentUser(res.user);
      sessionStorage.setItem(SESSION_STORAGE_KEY, res.user.id);
      await syncUserData(res.user.id);
      return { success: true };
    }
    return { success: false, error: res.error || 'Error al registrar' };
  };

  // Crear cuenta desde el panel de administración
  const adminCreateUser = async (userData: {
    name: string;
    username: string;
    avatar: string;
    pin: string;
    role?: 'admin' | 'user';
    badge?: string;
    statusMessage?: string;
  }) => {
    if (!currentUser || currentUser.role !== 'admin') {
      return { success: false, error: 'Acceso denegado: se requieren permisos de administrador' };
    }
    const res = await adminCreateUserApi(currentUser.id, userData);
    if (res.success && res.user) {
      setUsers((prev) => {
        if (prev.some((u) => u.id === res.user!.id)) return prev;
        return [...prev, res.user!];
      });
    }
    return res;
  };

  // Eliminar cuenta desde el panel de administración
  const adminDeleteUser = async (targetUserId: string) => {
    if (!currentUser || currentUser.role !== 'admin') {
      return { success: false, error: 'Acceso denegado: se requieren permisos de administrador' };
    }
    if (currentUser.id === targetUserId) {
      return { success: false, error: 'No puedes eliminar tu propia cuenta de administrador' };
    }
    const res = await adminDeleteUserApi(currentUser.id, targetUserId);
    if (res.success) {
      setUsers((prev) => prev.filter((u) => u.id !== targetUserId));
      setFriendRequests((prev) => prev.filter((r) => r.senderId !== targetUserId && r.receiverId !== targetUserId));
      setConversations((prev) => prev.filter((c) => c.participantA !== targetUserId && c.participantB !== targetUserId));
      setMessages((prev) => prev.filter((m) => m.senderId !== targetUserId));
      setActiveChatUserId((currentChat) => (currentChat === targetUserId ? null : currentChat));
    }
    return res;
  };

  // Cerrar sesión en esta pestaña
  const logout = () => {
    disconnectSocket();
    setCurrentUserId(null);
    setCurrentUser(null);
    setActiveChatUserId(null);
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  };

  // Comprobar si dos usuarios son amigos aceptados
  const isFriend = (userIdA: string, userIdB: string): boolean => {
    if (userIdB === 'assistant_epibot') return true;
    return friendRequests.some(
      (req) =>
        req.status === 'ACCEPTED' &&
        ((req.senderId === userIdA && req.receiverId === userIdB) ||
          (req.senderId === userIdB && req.receiverId === userIdA))
    );
  };

  // Comprobar si hay solicitud pendiente
  const hasPendingRequest = (userIdA: string, userIdB: string): boolean => {
    return friendRequests.some(
      (req) =>
        req.status === 'PENDING' &&
        ((req.senderId === userIdA && req.receiverId === userIdB) ||
          (req.senderId === userIdB && req.receiverId === userIdA))
    );
  };

  // Comprobar si un usuario está bloqueado
  const isBlocked = (userIdA: string, userIdB: string): boolean => {
    const userA = users.find((u) => u.id === userIdA);
    const userB = users.find((u) => u.id === userIdB);
    return (
      (userA?.blockedUserIds?.includes(userIdB) || userB?.blockedUserIds?.includes(userIdA)) ??
      false
    );
  };

  // Lista de amigos aceptados
  const getFriends = (userId: string = currentUserId || ''): User[] => {
    if (!userId) return [];
    const user = users.find((u) => u.id === userId);
    const blocked = user?.blockedUserIds || [];

    const friendIds = friendRequests
      .filter(
        (req) =>
          req.status === 'ACCEPTED' && (req.senderId === userId || req.receiverId === userId)
      )
      .map((req) => (req.senderId === userId ? req.receiverId : req.senderId));

    return users
      .filter((u) => friendIds.includes(u.id) && !blocked.includes(u.id))
      .map((u) => ({
        ...u,
        status: onlineUserIds.includes(u.id) ? u.status : 'offline',
      }));
  };

  // Solicitudes recibidas pendientes
  const getPendingReceivedRequests = (userId: string = currentUserId || '') => {
    if (!userId) return [];
    const user = users.find((u) => u.id === userId);
    const blocked = user?.blockedUserIds || [];

    return friendRequests
      .filter((req) => req.receiverId === userId && req.status === 'PENDING')
      .map((req) => ({
        request: req,
        user: users.find((u) => u.id === req.senderId)!,
      }))
      .filter((item) => item.user && !blocked.includes(item.user.id));
  };

  // Solicitudes enviadas pendientes
  const getPendingSentRequests = (userId: string = currentUserId || '') => {
    if (!userId) return [];
    return friendRequests
      .filter((req) => req.senderId === userId && req.status === 'PENDING')
      .map((req) => ({
        request: req,
        user: users.find((u) => u.id === req.receiverId)!,
      }))
      .filter((item) => item.user);
  };

  // Abrir chat
  const openChatWithUser = (userId: string): boolean => {
    if (userId === 'assistant_epibot') {
      setActiveChatUserId('assistant_epibot');
      return true;
    }

    if (!currentUserId) return false;

    if (isBlocked(currentUserId, userId)) {
      alert('No puedes chatear con un usuario bloqueado 🚫');
      return false;
    }

    if (!isFriend(currentUserId, userId)) {
      alert('🛡️ Regla de Epify: Solamente puedes conversar cuando ambos han aceptado la solicitud de amistad.');
      return false;
    }

    setActiveChatUserId(userId);
    return true;
  };

  const closeChat = () => {
    setActiveChatUserId(null);
  };

  // Enviar solicitud de amistad en tiempo real por WebSockets
  const sendFriendRequest = (targetUserId: string): { success: boolean; message: string } => {
    if (!currentUserId) return { success: false, message: 'No autenticado' };
    if (targetUserId === currentUserId) return { success: false, message: 'No puedes agregarte a ti mismo.' };

    const socket = getSocket();
    socket.emit('send_friend_request', { targetUserId });

    return { success: true, message: '¡Solicitud de amistad enviada con éxito! 🚀' };
  };

  // Aceptar solicitud de amistad por WebSockets
  const acceptFriendRequest = (requestId: string) => {
    const socket = getSocket();
    socket.emit('accept_friend_request', { requestId });
  };

  // Rechazar solicitud de amistad por WebSockets
  const rejectFriendRequest = (requestId: string) => {
    const socket = getSocket();
    socket.emit('reject_friend_request', { requestId });
  };

  // Cancelar solicitud enviada por WebSockets
  const cancelFriendRequest = (requestId: string) => {
    const socket = getSocket();
    socket.emit('cancel_friend_request', { requestId });
  };

  // Obtener mensajes de una conversación de forma altamente resiliente
  const getConversationWith = (targetUserId: string): Message[] => {
    if (!currentUserId) return [];

    // 1. Buscar conversación formal
    const conv = conversations.find(
      (c) =>
        (c.participantA === currentUserId && c.participantB === targetUserId) ||
        (c.participantA === targetUserId && c.participantB === currentUserId)
    );

    if (conv) {
      return messages.filter(
        (m) =>
          m.conversationId === conv.id ||
          (m.senderId === currentUserId && m.receiverId === targetUserId) ||
          (m.senderId === targetUserId && (m.receiverId === currentUserId || !m.receiverId))
      );
    }

    // 2. Fallback resiliente: buscar directamente por remitente y destinatario
    return messages.filter(
      (m) =>
        (m.senderId === currentUserId && (m.receiverId === targetUserId || targetUserId === 'assistant_epibot')) ||
        (m.senderId === targetUserId && (m.receiverId === currentUserId || !m.receiverId))
    );
  };

  // Enviar mensaje en tiempo real por WebSockets con renderizado optimista y respaldo HTTP
  const sendMessage = (
    receiverId: string,
    content: string
  ): { success: boolean; error?: string } => {
    const cleanContent = content.trim();
    if (!cleanContent) return { success: false, error: 'El mensaje no puede estar vacío' };

    if (!currentUserId) return { success: false, error: 'No autenticado' };

    // Regla de autorización estricta en frontend
    if (receiverId !== 'assistant_epibot' && !isFriend(currentUserId, receiverId)) {
      return {
        success: false,
        error: 'No autorizado: Solo puedes enviar mensajes a amigos aceptados.',
      };
    }

    // 1. Asegurar la conversación en memoria con los participantes correctos
    let existingConv = conversations.find(
      (c) =>
        (c.participantA === currentUserId && c.participantB === receiverId) ||
        (c.participantA === receiverId && c.participantB === currentUserId)
    );

    const convId = existingConv ? existingConv.id : `conv_${currentUserId}_${receiverId}`;
    if (!existingConv) {
      existingConv = {
        id: convId,
        participantA: currentUserId,
        participantB: receiverId,
        createdAt: new Date().toISOString(),
        isAiAssistant: receiverId === 'assistant_epibot',
      };
      setConversations((prev) => [...prev, existingConv!]);
    }

    // 2. Renderizado optimista inmediato: el mensaje aparece en pantalla al instante (0ms lag)
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const optimisticMessage: Message = {
      id: tempId,
      conversationId: convId,
      senderId: currentUserId,
      receiverId,
      content: cleanContent,
      createdAt: new Date().toISOString(),
      status: 'sent',
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    // 3. Enviar vía WebSockets
    const socket = getSocket();
    if (socket.connected) {
      socket.emit('send_message', { senderId: currentUserId, receiverId, content: cleanContent });
    } else {
      // Si el socket está reconectando o desconectado, forzar reconexión y respaldar vía HTTP
      connectSocket(currentUserId);
      sendMessageApi(currentUserId, receiverId, cleanContent).then((res) => {
        if (res.success && res.message) {
          setMessages((prev) => {
            const exists = prev.some((m) => m.id === res.message!.id);
            if (exists) return prev;
            return prev.map((m) => (m.id === tempId ? res.message! : m));
          });
          if (res.conversation) {
            setConversations((prev) => {
              const idx = prev.findIndex((c) => c.id === res.conversation!.id);
              if (idx >= 0) {
                const copy = [...prev];
                copy[idx] = res.conversation!;
                return copy;
              }
              return [...prev, res.conversation!];
            });
          }
        }
      });
    }

    return { success: true };
  };

  // Eliminar mensaje individual
  const deleteMessage = async (messageId: string, targetUserId?: string): Promise<{ success: boolean }> => {
    const msgToDelete = messages.find((m) => m.id === messageId);
    setMessages((prev) => prev.filter((m) => m.id !== messageId));

    const effectiveTarget = targetUserId || msgToDelete?.receiverId || (msgToDelete?.senderId !== currentUserId ? msgToDelete?.senderId : undefined);
    const convId = msgToDelete?.conversationId;

    const socket = getSocket();
    if (socket.connected) {
      socket.emit('delete_message', {
        messageId,
        conversationId: convId,
        targetUserId: effectiveTarget,
      });
    }

    if (currentUserId) {
      await deleteMessageApi(messageId, currentUserId, effectiveTarget, convId);
    }

    return { success: true };
  };

  // Limpiar conversación completa
  const clearChat = async (targetUserId: string): Promise<{ success: boolean }> => {
    if (!currentUserId) return { success: false };

    const conv = conversations.find(
      (c) =>
        (c.participantA === currentUserId && c.participantB === targetUserId) ||
        (c.participantA === targetUserId && c.participantB === currentUserId)
    );
    const convId = conv?.id || `conv_${[currentUserId, targetUserId].sort().join('_')}`;

    setMessages((prev) =>
      prev.filter((m) => {
        if (conv && m.conversationId === conv.id) return false;
        if (
          (m.senderId === currentUserId && m.receiverId === targetUserId) ||
          (m.senderId === targetUserId && m.receiverId === currentUserId)
        ) {
          return false;
        }
        return true;
      })
    );

    const socket = getSocket();
    if (socket.connected) {
      socket.emit('clear_chat', {
        conversationId: convId,
        targetUserId,
      });
    }

    await clearChatApi(convId, currentUserId, targetUserId);
    return { success: true };
  };

  // Bloquear usuario
  const blockUser = async (targetUserId: string) => {
    if (!currentUserId) return;
    await blockUserApi(currentUserId, targetUserId);
    setUsers((prev) =>
      prev.map((u) =>
        u.id === currentUserId
          ? {
              ...u,
              blockedUserIds: [...new Set([...(u.blockedUserIds || []), targetUserId])],
            }
          : u
      )
    );
    if (activeChatUserId === targetUserId) {
      setActiveChatUserId(null);
    }
  };

  // Desbloquear usuario
  const unblockUser = async (targetUserId: string) => {
    if (!currentUserId) return;
    await unblockUserApi(currentUserId, targetUserId);
    setUsers((prev) =>
      prev.map((u) =>
        u.id === currentUserId
          ? {
              ...u,
              blockedUserIds: (u.blockedUserIds || []).filter((id) => id !== targetUserId),
            }
          : u
      )
    );
  };

  // Reportar usuario
  const reportUser = async (targetUserId: string, reason: string, details?: string) => {
    if (!currentUserId) return;
    await reportUserApi(currentUserId, targetUserId, reason, details);
  };

  // Actualizar estado del usuario
  const updateCurrentUserStatus = async (
    status: UserStatus,
    statusMessage?: string,
    avatar?: string
  ) => {
    if (!currentUserId) return;
    await updateStatusApi(currentUserId, status, statusMessage, avatar);
  };

  // Reiniciar datos en el servidor
  const resetDemoData = async () => {
    await resetServerDataApi();
  };

  const unreadRequestsCount = getPendingReceivedRequests().length;

  return (
    <EpifyContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isAdmin: currentUser?.role === 'admin',
        users,
        friendRequests,
        conversations,
        messages,
        reports,
        activeTab,
        setActiveTab,
        activeChatUserId,
        openChatWithUser,
        closeChat,
        login,
        register,
        adminCreateUser,
        adminDeleteUser,
        logout,
        sendFriendRequest,
        acceptFriendRequest,
        rejectFriendRequest,
        cancelFriendRequest,
        sendMessage,
        deleteMessage,
        clearChat,
        blockUser,
        unblockUser,
        reportUser,
        updateCurrentUserStatus,
        getFriends,
        getPendingReceivedRequests,
        getPendingSentRequests,
        isFriend,
        hasPendingRequest,
        isBlocked,
        getConversationWith,
        resetDemoData,
        unreadRequestsCount,
        onlineUserIds,
      }}
    >
      {children}
    </EpifyContext.Provider>
  );
};

export const useEpify = () => {
  const context = useContext(EpifyContext);
  if (!context) {
    throw new Error('useEpify debe utilizarse dentro de un EpifyProvider');
  }
  return context;
};
