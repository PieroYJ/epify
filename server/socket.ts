import { Server as SocketIOServer, Socket } from 'socket.io';
import { db } from './db';

interface UserSocketMap {
  [userId: string]: Set<string>; // Soporte para múltiples pestañas del mismo usuario
}

const userSockets: UserSocketMap = {};

// Contenido educativo para Epibot (único bot automatizado del sistema)
const EPIBOT_JOKES = [
  '¿Qué le dice un semáforo a otro? — ¡No me mires que me estoy cambiando! 🚦😂',
  '¿Por qué los pájaros vuelan hacia el sur en invierno? — ¡Porque caminando tardarían mucho! 🐦😄',
  '¿Qué hace una abeja en el gimnasio? — ¡Zumba! 🐝🏋️‍♂️',
  '¿Qué le dijo el mar a la playa? — ¡Hola olas! 🌊😊',
];

const EPIBOT_TRIVIA = [
  '🌟 ¿Sabías que las estrellas de mar no tienen cerebro ni sangre? ¡Usan agua de mar!',
  '🪐 ¿Sabías que en Saturno y Júpiter llueven diamantes debido a la alta presión?',
  '🐝 ¿Sabías que las abejas pueden reconocer rostros humanos como si fueran flores?',
];

const EPIBOT_RIDDLES = [
  '🧩 Oro parece, plata no es... ¿quién no lo adivine, bien tonto es? 👉 (¡El plátano! 🍌)',
  '🧩 Tengo agujas pero no sé coser, tengo números pero no sé leer. ¿Qué soy? 👉 (¡El reloj! ⏰)',
];

export function handleEpibotReply(
  io: SocketIOServer,
  conversation: any,
  userId: string,
  userMessage: string
) {
  setTimeout(() => {
    let replyText = '';
    const lower = userMessage.toLowerCase();

    if (lower.includes('chiste')) {
      replyText = EPIBOT_JOKES[Math.floor(Math.random() * EPIBOT_JOKES.length)];
    } else if (lower.includes('adivinanza')) {
      replyText = EPIBOT_RIDDLES[Math.floor(Math.random() * EPIBOT_RIDDLES.length)];
    } else if (lower.includes('curiosidad') || lower.includes('planeta') || lower.includes('espacio') || lower.includes('estrella')) {
      replyText = EPIBOT_TRIVIA[Math.floor(Math.random() * EPIBOT_TRIVIA.length)];
    } else if (lower.includes('hola') || lower.includes('buenas')) {
      const u = db.findUserById(userId);
      replyText = `¡Hola ${u?.name || 'amigo'}! 🧸✨ ¿Quieres que te cuente un chiste, una adivinanza o una curiosidad?`;
    } else if (lower.includes('seguridad') || lower.includes('consejo')) {
      replyText = '🛡️ Consejo de seguridad: Nunca compartas contraseñas, tu dirección ni tu teléfono con nadie en internet.';
    } else {
      replyText =
        '¡Qué buen mensaje! 🌟 Puedes pedirme: "cuéntame un chiste" 😂 o "dame una adivinanza" 🧩.';
    }

    const botMsg = db.addMessage(conversation.id, 'assistant_epibot', replyText, userId);

    io.to(userId).emit('message_received', {
      message: botMsg,
      conversation,
      conversationId: conversation.id,
      receiverId: 'assistant_epibot',
    });
  }, 800);
}

export function setupSocketServer(io: SocketIOServer) {
  io.on('connection', (socket: Socket) => {
    let currentUserId: string | null = null;

    // Autenticación de socket
    socket.on('authenticate', ({ userId }: { userId: string }) => {
      currentUserId = userId;
      socket.join(userId);

      if (!userSockets[userId]) {
        userSockets[userId] = new Set();
      }
      userSockets[userId].add(socket.id);

      // Actualizar estado en DB si no está jugando o estudiando
      const user = db.findUserById(userId);
      if (user && user.status === 'offline') {
        db.updateUser(userId, { status: 'online' });
      }

      // Notificar a todos los usuarios conectados que este niño está online
      io.emit('user_status_changed', {
        userId,
        status: user?.status || 'online',
        statusMessage: user?.statusMessage,
      });

      // Enviar lista de usuarios actualmente conectados al socket recién autenticado
      const onlineUserIds = Object.keys(userSockets).filter(
        (uid) => userSockets[uid] && userSockets[uid].size > 0
      );
      socket.emit('online_users', onlineUserIds);
    });

    // Enviar mensaje en tiempo real
    socket.on(
      'send_message',
      (
        { senderId, receiverId, content }: { senderId?: string; receiverId: string; content: string },
        callback?: (res: any) => void
      ) => {
        const effectiveSenderId = currentUserId || senderId;
        if (!effectiveSenderId) {
          socket.emit('error_message', { error: 'No autenticado' });
          if (typeof callback === 'function') callback({ success: false, error: 'No autenticado' });
          return;
        }

        // Si este socket aún no tenía el room asignado, vincularlo
        if (!currentUserId) {
          currentUserId = effectiveSenderId;
          socket.join(effectiveSenderId);
          if (!userSockets[effectiveSenderId]) userSockets[effectiveSenderId] = new Set();
          userSockets[effectiveSenderId].add(socket.id);
        }

        const cleanContent = content.trim();
        if (!cleanContent) {
          if (typeof callback === 'function') callback({ success: false, error: 'Mensaje vacío' });
          return;
        }

        // REGLA FUNDAMENTAL DE EPIFY:
        // Solo amigos aceptados pueden comunicarse (o el asistente Epibot)
        if (receiverId !== 'assistant_epibot') {
          const areFriends = db.isFriend(effectiveSenderId, receiverId);
          if (!areFriends) {
            socket.emit('error_message', {
              error: 'Regla de Epify: Solamente dos amigos aceptados pueden chatear.',
            });
            if (typeof callback === 'function') callback({ success: false, error: 'No amigos' });
            return;
          }

          if (db.isBlocked(effectiveSenderId, receiverId)) {
            socket.emit('error_message', { error: 'No puedes enviar mensajes a un usuario bloqueado.' });
            if (typeof callback === 'function') callback({ success: false, error: 'Bloqueado' });
            return;
          }
        }

        // Crear o buscar conversación
        const conversation = db.getOrCreateConversation(effectiveSenderId, receiverId);
        const newMsg = db.addMessage(conversation.id, effectiveSenderId, cleanContent, receiverId);

        // Emitir mensaje al remitente (todas sus pestañas / dispositivos)
        io.to(effectiveSenderId).emit('message_received', {
          message: newMsg,
          conversation,
          conversationId: conversation.id,
          receiverId,
        });

        // Si el destinatario es un niño real, emitir a sus pestañas
        if (receiverId !== 'assistant_epibot') {
          io.to(receiverId).emit('message_received', {
            message: newMsg,
            conversation,
            conversationId: conversation.id,
            receiverId: effectiveSenderId,
          });
        } else {
          // Asistente Epibot
          handleEpibotReply(io, conversation, effectiveSenderId, cleanContent);
        }

        if (typeof callback === 'function') {
          callback({ success: true, message: newMsg, conversation });
        }
      }
    );

    // Enviar solicitud de amistad en tiempo real
    socket.on('send_friend_request', ({ targetUserId }: { targetUserId: string }) => {
      if (!currentUserId || currentUserId === targetUserId) return;

      if (db.isBlocked(currentUserId, targetUserId) || db.isFriend(currentUserId, targetUserId)) {
        return;
      }

      // Verificar si ya existe solicitud
      const existing = db
        .getFriendRequests()
        .find(
          (r) =>
            (r.senderId === currentUserId && r.receiverId === targetUserId) ||
            (r.senderId === targetUserId && r.receiverId === currentUserId)
        );

      if (existing) {
        if (existing.status === 'PENDING' && existing.senderId === targetUserId) {
          // Si el otro ya había mandado, la aceptamos
          const updated = db.updateFriendRequestStatus(existing.id, 'ACCEPTED');
          notifyFriendshipAccepted(io, updated!);
          return;
        }
        return;
      }

      const req = db.createFriendRequest(currentUserId, targetUserId);
      const senderUser = db.findUserById(currentUserId);

      // Notificar al destinatario en tiempo real
      if (userSockets[targetUserId]) {
        userSockets[targetUserId].forEach((sId) => {
          io.to(sId).emit('friend_request_received', {
            request: req,
            senderUser,
          });
        });
      }

      // Confirmar al remitente
      socket.emit('friend_request_sent', { request: req });
    });

    // Aceptar solicitud de amistad en tiempo real
    socket.on('accept_friend_request', ({ requestId }: { requestId: string }) => {
      const updated = db.updateFriendRequestStatus(requestId, 'ACCEPTED');
      if (updated) {
        notifyFriendshipAccepted(io, updated);
      }
    });

    // Rechazar solicitud de amistad
    socket.on('reject_friend_request', ({ requestId }: { requestId: string }) => {
      const updated = db.updateFriendRequestStatus(requestId, 'REJECTED');
      if (updated) {
        if (userSockets[updated.senderId]) {
          userSockets[updated.senderId].forEach((sId) => {
            io.to(sId).emit('friend_request_updated', { request: updated });
          });
        }
        if (userSockets[updated.receiverId]) {
          userSockets[updated.receiverId].forEach((sId) => {
            io.to(sId).emit('friend_request_updated', { request: updated });
          });
        }
      }
    });

    // Cancelar solicitud enviada
    socket.on('cancel_friend_request', ({ requestId }: { requestId: string }) => {
      const req = db.getFriendRequests().find((r) => r.id === requestId);
      if (req) {
        db.deleteFriendRequest(requestId);
        if (userSockets[req.receiverId]) {
          userSockets[req.receiverId].forEach((sId) => {
            io.to(sId).emit('friend_request_cancelled', { requestId });
          });
        }
        socket.emit('friend_request_cancelled', { requestId });
      }
    });

    // Desconexión
    socket.on('disconnect', () => {
      if (currentUserId && userSockets[currentUserId]) {
        userSockets[currentUserId].delete(socket.id);
        if (userSockets[currentUserId].size === 0) {
          delete userSockets[currentUserId];
          db.updateUser(currentUserId, { status: 'offline' });

          io.emit('user_status_changed', {
            userId: currentUserId,
            status: 'offline',
          });
        }
      }
    });
  });
}

function notifyFriendshipAccepted(io: SocketIOServer, request: any) {
  const userA = db.findUserById(request.senderId);
  const userB = db.findUserById(request.receiverId);

  // Notificar al sender
  io.to(request.senderId).emit('friend_request_accepted', {
    request,
    newFriend: userB,
  });

  // Notificar al receiver
  io.to(request.receiverId).emit('friend_request_accepted', {
    request,
    newFriend: userA,
  });
}
