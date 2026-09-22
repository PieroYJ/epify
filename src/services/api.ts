import type { User, FriendRequest, Conversation, Message, UserStatus } from '../types';

const API_BASE = '/api';

export async function loginApi(username: string, pin?: string): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, pin }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Error al iniciar sesión' };
    }
    return { success: true, user: data.user };
  } catch {
    return { success: false, error: 'No se pudo conectar con el servidor Epify' };
  }
}

export async function registerApi(
  name: string,
  username: string,
  avatar: string,
  pin: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, username, avatar, pin }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Error al registrar usuario' };
    }
    return { success: true, user: data.user };
  } catch {
    return { success: false, error: 'No se pudo conectar con el servidor Epify' };
  }
}

export async function getAllUsersApi(): Promise<User[]> {
  try {
    const res = await fetch(`${API_BASE}/users`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function getUserDataApi(userId: string): Promise<{
  user: User;
  users: User[];
  friendRequests: FriendRequest[];
  conversations: Conversation[];
  messages: Message[];
} | null> {
  try {
    const res = await fetch(`${API_BASE}/data/${userId}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function updateStatusApi(
  userId: string,
  status?: UserStatus,
  statusMessage?: string,
  avatar?: string
): Promise<{ success: boolean; user?: User }> {
  try {
    const res = await fetch(`${API_BASE}/user/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, status, statusMessage, avatar }),
    });
    return await res.json();
  } catch {
    return { success: false };
  }
}

export async function blockUserApi(userId: string, targetUserId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/user/block`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, targetUserId }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function unblockUserApi(userId: string, targetUserId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/user/unblock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, targetUserId }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function reportUserApi(
  reporterId: string,
  reportedUserId: string,
  reason: string,
  details?: string
): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/user/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reporterId, reportedUserId, reason, details }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function resetServerDataApi(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/reset`, { method: 'POST' });
    return res.ok;
  } catch {
    return false;
  }
}

export async function adminCreateUserApi(
  adminId: string,
  userData: {
    name: string;
    username: string;
    avatar: string;
    pin: string;
    role?: 'admin' | 'user';
    badge?: string;
    statusMessage?: string;
  }
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/admin/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminId, ...userData }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Error al crear la cuenta' };
    }
    return { success: true, user: data.user };
  } catch {
    return { success: false, error: 'No se pudo conectar con el servidor Epify' };
  }
}

export async function adminDeleteUserApi(
  adminId: string,
  targetUserId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/admin/users/${targetUserId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminId }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Error al eliminar la cuenta' };
    }
    return { success: true };
  } catch {
    return { success: false, error: 'No se pudo conectar con el servidor Epify' };
  }
}

export async function sendMessageApi(
  senderId: string,
  receiverId: string,
  content: string
): Promise<{ success: boolean; message?: Message; conversation?: Conversation; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senderId, receiverId, content }),
    });
    const data = await res.json();
    return data;
  } catch {
    return { success: false, error: 'Error al enviar mensaje vía API' };
  }
}

