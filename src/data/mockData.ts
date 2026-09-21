import type { User, FriendRequest, Conversation, Message } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user_alex',
    username: 'alex123',
    name: 'Alex',
    avatar: '🧒',
    status: 'online',
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
    status: 'online',
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
    status: 'playing',
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
    status: 'online',
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
    status: 'studying',
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
    status: 'online',
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
    status: 'offline',
    statusMessage: 'En el entrenamiento de fútbol ⚽',
    badge: 'Goleador 🏆',
    createdAt: '2026-02-20T17:00:00Z',
    blockedUserIds: [],
  },
];

export const INITIAL_REQUESTS: FriendRequest[] = [
  // Alex y Mateo ya son amigos
  {
    id: 'req_alex_mateo',
    senderId: 'user_mateo',
    receiverId: 'user_alex',
    status: 'ACCEPTED',
    createdAt: '2026-02-22T10:00:00Z',
  },
  // Alex y Sofía ya son amigos
  {
    id: 'req_alex_sofia',
    senderId: 'user_alex',
    receiverId: 'user_sofia',
    status: 'ACCEPTED',
    createdAt: '2026-02-23T11:30:00Z',
  },
  // Lucas envió solicitud a Alex (Pendiente por recibir de Alex)
  {
    id: 'req_lucas_alex',
    senderId: 'user_lucas',
    receiverId: 'user_alex',
    status: 'PENDING',
    createdAt: '2026-03-01T15:20:00Z',
  },
  // Alex envió solicitud a Ana (Pendiente de aprobación de Ana)
  {
    id: 'req_alex_ana',
    senderId: 'user_alex',
    receiverId: 'user_ana',
    status: 'PENDING',
    createdAt: '2026-03-02T09:10:00Z',
  },
];

export const INITIAL_CONVERSATIONS: Conversation[] = [
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

export const INITIAL_MESSAGES: Message[] = [
  // Chat Alex y Mateo
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
    id: 'msg_3',
    conversationId: 'conv_alex_mateo',
    senderId: 'user_mateo',
    content: '¡Claro! En cuanto termine mi dibujo te aviso 😊',
    createdAt: '2026-03-02T10:20:00Z',
    status: 'delivered',
  },
  // Chat Alex y Sofía
  {
    id: 'msg_4',
    conversationId: 'conv_alex_sofia',
    senderId: 'user_sofia',
    content: 'Hola Alex, mañana llevo las fichas de dinosaurios a la escuela 🦕',
    createdAt: '2026-03-01T18:00:00Z',
    status: 'read',
  },
  {
    id: 'msg_5',
    conversationId: 'conv_alex_sofia',
    senderId: 'user_alex',
    content: '¡Súper! Yo llevaré las mías de animales marinos 🐬',
    createdAt: '2026-03-01T18:05:00Z',
    status: 'read',
  },
  // Asistente Epibot
  {
    id: 'msg_epi_1',
    conversationId: 'conv_epibot',
    senderId: 'assistant_epibot',
    content: '¡Hola! Soy Epibot 🧸✨ Tu compañero seguro en Epify. Puedes preguntarme adivinanzas, chistes sanos, curiosidades sobre animales o el espacio, o consejos para hacer nuevos amigos.',
    createdAt: '2026-01-10T10:00:00Z',
    status: 'read',
  },
];

// Respuestas interactivas divertidas para amigos simulados
export const SIMULATED_FRIEND_RESPONSES: Record<string, string[]> = {
  user_mateo: [
    '¡Qué genial! 🚀',
    'Jaja, totalmente de acuerdo 😄',
    '¡Ahorita te mando un emoji espacial! 🌌⭐',
    '¿Terminaste tu tarea de hoy? 📝',
    '¡Vamos a jugar en un rato! 🎮',
  ],
  user_sofia: [
    '¡Increíble! ¿Sabías que los pulpos tienen 3 corazones? 🐙',
    '¡Me encanta esa idea! ✨',
    '¡Nos vemos mañana en el recreo! 🥪',
    '¡Qué divertido! 🎈',
  ],
  user_lucas: [
    '¡Construí un castillo gigante de obsidiana! 🏰',
    '¡Hola amigo! Gracias por aceptar mi solicitud 🙌',
    '¡Está súper divertido! 👾',
  ],
  user_ana: [
    '¡Hola! Estaba mezclando azul y amarillo para hacer verde esmeralda 🎨🖌️',
    '¡Qué lindo mensaje! 💖',
    '¡Dibujemos juntos pronto! 🖍️',
  ],
  default: [
    '¡Hola amigo! ¡Me alegra saludarte! 😊',
    '¡Súper genial! 🌟',
    '¡Qué buen mensaje! 🎉',
    '¡Nos vemos pronto para jugar! 🕹️',
  ],
};

// Contenido educativo y divertido para Epibot
export const EPIBOT_KNOWLEDGE = {
  jokes: [
    '¿Qué le dice un semáforo a otro? — ¡No me mires que me estoy cambiando! 🚦😂',
    '¿Por qué los pájaros vuelan hacia el sur en invierno? — ¡Porque caminando tardarían mucho! 🐦😄',
    '¿Qué hace una abeja en el gimnasio? — ¡Zumba! 🐝🏋️‍♂️',
    '¿Qué le dijo el mar a la playa? — ¡Hola olas! 🌊😊',
    '¿Cómo se despiden los químicos? — ¡Ácido un placer! 🧪😁',
  ],
  trivia: [
    '🌟 ¿Sabías que las estrellas de mar no tienen cerebro ni sangre? ¡Usan agua de mar para mover sus patitas!',
    '🌍 ¿Sabías que el corazón de una ballena azul es tan grande como un auto pequeño?',
    '🪐 ¿Sabías que en Saturno y Júpiter llueven diamantes debido a la alta presión de su atmósfera?',
    '🐝 ¿Sabías que las abejas pueden reconocer rostros humanos como si fuéramos sus flores favoritas?',
    '🐱 ¿Sabías que los gatos pasan cerca del 70% de sus vidas durmiendo?',
  ],
  riddles: [
    '🧩 Oro parece, plata no es... ¿quién no lo adivine, bien tonto es? 👉 (¡El plátano! 🍌)',
    '🧩 Blanco por dentro, verde por fuera. Si quieres que te lo diga, espera. 👉 (¡La pera! 🍐)',
    '🧩 Tengo agujas pero no sé coser, tengo números pero no sé leer. ¿Qué soy? 👉 (¡El reloj! ⏰)',
    '🧩 Vuelo sin alas, lloro sin ojos, y por donde paso dejo todo mojado. ¿Qué soy? 👉 (¡La nube! ☁️)',
  ],
  safetyTips: [
    '🛡️ **Consejo seguro:** Nunca compartas tu dirección real, nombre de escuela o contraseñas por internet.',
    '🤝 **Consejo de amistad:** Un verdadero amigo siempre respeta tus gustos y nunca te pide hacer algo que te haga sentir incómodo.',
    '⚠️ **Recuerda:** Si alguien te envía un mensaje que te asuste o confunda, cuéntaselo de inmediato a tus papás o a un adulto de confianza.',
    '🧸 **Regla Epify:** Solo puedes chatear con amigos que tú y ellos hayan aceptado con cariño y cuidado.',
  ],
};
