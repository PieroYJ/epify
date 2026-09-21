import fs from 'fs';
import path from 'path';

export interface DBUser {
  id: string;
  username: string;
  name: string;
  avatar: string;
  pin: string; // PIN simple de 4 dígitos para niños (ej: "1234")
  status: 'online' | 'playing' | 'studying' | 'offline';
  statusMessage: string;
  badge?: string;
  createdAt: string;
  blockedUserIds: string[];
}

export interface DBFriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'BLOCKED';
  createdAt: string;
}

export interface DBConversation {
  id: string;
  participantA: string;
  participantB: string;
  createdAt: string;
  isAiAssistant?: boolean;
}

export interface DBMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  status: 'sent' | 'delivered' | 'read';
}

export interface DBReport {
  id: string;
  reporterId: string;
  reportedUserId: string;
  reportedMessageId?: string;
  reason: string;
  details?: string;
  createdAt: string;
}

export interface DatabaseSchema {
  users: DBUser[];
  friendRequests: DBFriendRequest[];
  conversations: DBConversation[];
  messages: DBMessage[];
  reports: DBReport[];
}

const DATA_DIR = path.join(process.cwd(), 'server', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const INITIAL_SEED_USERS: DBUser[] = [
  {
    id: 'user_alex',
    username: 'alex123',
    name: 'Alex',
    avatar: '🧒',
    pin: '1234',
    status: 'offline',
    statusMessage: '¡Listo para jugar y chatear! 🎮',
    badge: 'Explorador 🌟',
    createdAt: '2026-01-10T10:00:00Z',
    blockedUserIds: [],
  },
  {
    id: 'user_mateo',
    username: 'mateo_pro',
    name: 'Mateo',
    avatar: '🧑‍🚀',
    pin: '1234',
    status: 'offline',
    statusMessage: 'Viendo dibujos de astronautas 🚀',
    badge: 'Astro-Fan 🛸',
    createdAt: '2026-01-12T14:30:00Z',
    blockedUserIds: [],
  },
  {
    id: 'user_sofia',
    username: 'sofi_star',
    name: 'Sofía',
    avatar: '👧',
    pin: '1234',
    status: 'offline',
    statusMessage: 'Haciendo la tarea de ciencias 📚',
    badge: 'Científica 🔬',
    createdAt: '2026-01-15T09:20:00Z',
    blockedUserIds: [],
  },
  {
    id: 'user_lucas',
    username: 'lucas_gamer',
    name: 'Lucas',
    avatar: '👦',
    pin: '1234',
    status: 'offline',
    statusMessage: 'En una partida de bloques 🧱',
    badge: 'Constructor 🏰',
    createdAt: '2026-02-01T11:00:00Z',
    blockedUserIds: [],
  },
  {
    id: 'user_ana',
    username: 'ana_arte',
    name: 'Ana',
    avatar: '🎨',
    pin: '1234',
    status: 'offline',
    statusMessage: 'Pintando un arcoíris 🌈',
    badge: 'Artista 🖌️',
    createdAt: '2026-02-05T16:45:00Z',
    blockedUserIds: [],
  },
  {
    id: 'user_leo',
    username: 'leo_dino',
    name: 'Leo',
    avatar: '🦖',
    pin: '1234',
    status: 'offline',
    statusMessage: 'Leyendo sobre el T-Rex 🦕',
    badge: 'Dino-Experto 🌿',
    createdAt: '2026-02-10T12:00:00Z',
    blockedUserIds: [],
  },
  {
    id: 'user_vale',
    username: 'vale_music',
    name: 'Valentina',
    avatar: '🎵',
    pin: '1234',
    status: 'offline',
    statusMessage: 'Practicando el piano 🎹',
    badge: 'Melodía 🎶',
    createdAt: '2026-02-14T08:15:00Z',
    blockedUserIds: [],
  },
  {
    id: 'user_tomas',
    username: 'tomy_soccer',
    name: 'Tomás',
    avatar: '⚽',
    pin: '1234',
    status: 'offline',
    statusMessage: 'En el entrenamiento de fútbol ⚽',
    badge: 'Goleador 🏆',
    createdAt: '2026-02-20T17:00:00Z',
    blockedUserIds: [],
  },
];

const INITIAL_SEED_REQUESTS: DBFriendRequest[] = [
  {
    id: 'req_alex_mateo',
    senderId: 'user_mateo',
    receiverId: 'user_alex',
    status: 'ACCEPTED',
    createdAt: '2026-02-22T10:00:00Z',
  },
  {
    id: 'req_alex_sofia',
    senderId: 'user_alex',
    receiverId: 'user_sofia',
    status: 'ACCEPTED',
    createdAt: '2026-02-23T11:30:00Z',
  },
  {
    id: 'req_lucas_alex',
    senderId: 'user_lucas',
    receiverId: 'user_alex',
    status: 'PENDING',
    createdAt: '2026-03-01T15:20:00Z',
  },
  {
    id: 'req_alex_ana',
    senderId: 'user_alex',
    receiverId: 'user_ana',
    status: 'PENDING',
    createdAt: '2026-03-02T09:10:00Z',
  },
];

const INITIAL_SEED_CONVERSATIONS: DBConversation[] = [
  {
    id: 'conv_alex_mateo',
    participantA: 'user_alex',
    participantB: 'user_mateo',
    createdAt: '2026-02-22T10:05:00Z',
  },
  {
    id: 'conv_alex_sofia',
    participantA: 'user_alex',
    participantB: 'user_sofia',
    createdAt: '2026-02-23T11:35:00Z',
  },
  {
    id: 'conv_epibot',
    participantA: 'user_alex',
    participantB: 'assistant_epibot',
    createdAt: '2026-01-10T10:00:00Z',
    isAiAssistant: true,
  },
];

const INITIAL_SEED_MESSAGES: DBMessage[] = [
  {
    id: 'msg_1',
    conversationId: 'conv_alex_mateo',
    senderId: 'user_mateo',
    content: '¡Hola Alex! 👋 ¿Viste el cohete que despegó ayer?',
    createdAt: '2026-03-02T10:15:00Z',
    status: 'read',
  },
  {
    id: 'msg_2',
    conversationId: 'conv_alex_mateo',
    senderId: 'user_alex',
    content: '¡Sí Mateo! Estuvo genial 🚀 ¿Jugamos más tarde?',
    createdAt: '2026-03-02T10:17:00Z',
    status: 'read',
  },
  {
    id: 'msg_epi_welcome',
    conversationId: 'conv_epibot',
    senderId: 'assistant_epibot',
    content: '¡Hola! Soy Epibot 🧸✨ Tu asistente inteligente y seguro. Puedes preguntarme adivinanzas, chistes sanos o curiosidades.',
    createdAt: '2026-01-10T10:00:00Z',
    status: 'read',
  },
];

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDataDirectory();
    this.data = this.load();
  }

  private ensureDataDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private load(): DatabaseSchema {
    if (!fs.existsSync(DB_FILE)) {
      const initialData: DatabaseSchema = {
        users: INITIAL_SEED_USERS,
        friendRequests: INITIAL_SEED_REQUESTS,
        conversations: INITIAL_SEED_CONVERSATIONS,
        messages: INITIAL_SEED_MESSAGES,
        reports: [],
      };
      this.saveDirect(initialData);
      return initialData;
    }

    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    } catch {
      const fallback: DatabaseSchema = {
        users: INITIAL_SEED_USERS,
        friendRequests: INITIAL_SEED_REQUESTS,
        conversations: INITIAL_SEED_CONVERSATIONS,
        messages: INITIAL_SEED_MESSAGES,
        reports: [],
      };
      this.saveDirect(fallback);
      return fallback;
    }
  }

  private saveDirect(data: DatabaseSchema) {
    this.ensureDataDirectory();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  }

  public save() {
    this.saveDirect(this.data);
  }

  public reset() {
    this.data = {
      users: JSON.parse(JSON.stringify(INITIAL_SEED_USERS)),
      friendRequests: JSON.parse(JSON.stringify(INITIAL_SEED_REQUESTS)),
      conversations: JSON.parse(JSON.stringify(INITIAL_SEED_CONVERSATIONS)),
      messages: JSON.parse(JSON.stringify(INITIAL_SEED_MESSAGES)),
      reports: [],
    };
    this.save();
    return this.data;
  }

  // --- Operaciones de Usuarios ---
  public getUsers(): DBUser[] {
    return this.data.users;
  }

  public findUserById(id: string): DBUser | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public findUserByUsername(username: string): DBUser | undefined {
    const clean = username.replace(/^@/, '').toLowerCase().trim();
    return this.data.users.find((u) => u.username.toLowerCase() === clean);
  }

  public createUser(user: DBUser): DBUser {
    this.data.users.push(user);
    this.save();
    return user;
  }

  public updateUser(userId: string, partial: Partial<DBUser>): DBUser | undefined {
    const user = this.findUserById(userId);
    if (!user) return undefined;
    Object.assign(user, partial);
    this.save();
    return user;
  }

  // --- Operaciones de Amistades ---
  public getFriendRequests(): DBFriendRequest[] {
    return this.data.friendRequests;
  }

  public isFriend(userA: string, userB: string): boolean {
    if (userB === 'assistant_epibot') return true;
    return this.data.friendRequests.some(
      (req) =>
        req.status === 'ACCEPTED' &&
        ((req.senderId === userA && req.receiverId === userB) ||
          (req.senderId === userB && req.receiverId === userA))
    );
  }

  public isBlocked(userA: string, userB: string): boolean {
    const uA = this.findUserById(userA);
    const uB = this.findUserById(userB);
    return (uA?.blockedUserIds.includes(userB) || uB?.blockedUserIds.includes(userA)) ?? false;
  }

  public createFriendRequest(senderId: string, receiverId: string): DBFriendRequest {
    const newReq: DBFriendRequest = {
      id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      senderId,
      receiverId,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    this.data.friendRequests.push(newReq);
    this.save();
    return newReq;
  }

  public updateFriendRequestStatus(
    requestId: string,
    status: 'ACCEPTED' | 'REJECTED' | 'BLOCKED'
  ): DBFriendRequest | undefined {
    const req = this.data.friendRequests.find((r) => r.id === requestId);
    if (!req) return undefined;
    req.status = status;
    this.save();
    return req;
  }

  public deleteFriendRequest(requestId: string): boolean {
    const initialLen = this.data.friendRequests.length;
    this.data.friendRequests = this.data.friendRequests.filter((r) => r.id !== requestId);
    this.save();
    return this.data.friendRequests.length < initialLen;
  }

  // --- Operaciones de Conversaciones y Mensajes ---
  public getOrCreateConversation(participantA: string, participantB: string): DBConversation {
    let conv = this.data.conversations.find(
      (c) =>
        (c.participantA === participantA && c.participantB === participantB) ||
        (c.participantA === participantB && c.participantB === participantA)
    );

    if (!conv) {
      conv = {
        id: `conv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        participantA,
        participantB,
        createdAt: new Date().toISOString(),
        isAiAssistant: participantB === 'assistant_epibot',
      };
      this.data.conversations.push(conv);
      this.save();
    }
    return conv;
  }

  public addMessage(
    conversationId: string,
    senderId: string,
    content: string
  ): DBMessage {
    const msg: DBMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      conversationId,
      senderId,
      content,
      createdAt: new Date().toISOString(),
      status: 'sent',
    };
    this.data.messages.push(msg);
    this.save();
    return msg;
  }

  public getMessagesForConversation(convId: string): DBMessage[] {
    return this.data.messages.filter((m) => m.conversationId === convId);
  }

  public getMessages(): DBMessage[] {
    return this.data.messages;
  }

  public getConversations(): DBConversation[] {
    return this.data.conversations;
  }

  public addReport(report: DBReport): DBReport {
    this.data.reports.push(report);
    this.save();
    return report;
  }
}

export const db = new Database();
