export type UserStatus = 'online' | 'playing' | 'studying' | 'offline';

export interface User {
  id: string;
  username: string; // ej: "alex123"
  name: string; // ej: "Alex"
  avatar: string; // emoji o avatar url
  status: UserStatus;
  statusMessage: string; // ej: "¡Construyendo naves espaciales! 🚀"
  badge?: string; // ej: "Explorador 🌟", "Artista 🎨"
  createdAt: string;
  blockedUserIds: string[];
}

export type RequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'BLOCKED';

export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: RequestStatus;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  status: 'sent' | 'delivered' | 'read';
  reaction?: string;
}

export interface Conversation {
  id: string;
  participantA: string;
  participantB: string;
  createdAt: string;
  isAiAssistant?: boolean;
}

export interface ReportItem {
  id: string;
  reporterId: string;
  reportedUserId: string;
  reportedMessageId?: string;
  reason: string;
  details?: string;
  createdAt: string;
}

export type ActiveTab = 'home' | 'friends' | 'search' | 'requests' | 'assistant' | 'profile';
