import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server as SocketIOServer } from 'socket.io';
import { db, DBUser } from './db';
import { setupSocketServer } from './socket';

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

setupSocketServer(io);

// Helper para limpiar PIN antes de enviar al frontend
function sanitizeUser(user: DBUser) {
  const { pin, ...safeUser } = user;
  return safeUser;
}

// 1. Endpoint Login (Niños con PIN de 4 dígitos)
app.post('/api/auth/login', (req, res) => {
  const { username, pin } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'El nombre de usuario es requerido' });
  }

  const user = db.findUserByUsername(username);
  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  if (pin && user.pin !== pin) {
    return res.status(401).json({ error: 'PIN incorrecto' });
  }

  return res.json({ success: true, user: sanitizeUser(user) });
});

// 2. Endpoint Registro de nuevo niño
app.post('/api/auth/register', (req, res) => {
  const { name, username, avatar, pin, statusMessage } = req.body;
  if (!name || !username) {
    return res.status(400).json({ error: 'Nombre y @usuario son requeridos' });
  }

  const existing = db.findUserByUsername(username);
  if (existing) {
    return res.status(409).json({ error: 'Ese @usuario ya está en uso. ¡Elige otro divertido!' });
  }

  const cleanUsername = username.replace(/^@/, '').toLowerCase().trim();
  const newUser: DBUser = {
    id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: name.trim(),
    username: cleanUsername,
    avatar: avatar || '🧒',
    pin: pin || '1234',
    status: 'online',
    statusMessage: statusMessage || '¡Nuevo en Epify! 👋',
    badge: 'Nuevo Amigo ✨',
    createdAt: new Date().toISOString(),
    blockedUserIds: [],
  };

  db.createUser(newUser);
  return res.status(201).json({ success: true, user: sanitizeUser(newUser) });
});

// 3. Obtener lista pública de usuarios
app.get('/api/users', (_req, res) => {
  const safeUsers = db.getUsers().map(sanitizeUser);
  return res.json(safeUsers);
});

// 4. Obtener todos los datos sincronizados para un usuario
app.get('/api/data/:userId', (req, res) => {
  const { userId } = req.params;
  const user = db.findUserById(userId);
  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  const users = db.getUsers().map(sanitizeUser);
  const friendRequests = db.getFriendRequests();
  const conversations = db.getConversations();
  const messages = db.getMessages();

  return res.json({
    user: sanitizeUser(user),
    users,
    friendRequests,
    conversations,
    messages,
  });
});

// 5. Actualizar estado / mensaje de estado
app.post('/api/user/status', (req, res) => {
  const { userId, status, statusMessage, avatar } = req.body;
  const updated = db.updateUser(userId, {
    ...(status && { status }),
    ...(statusMessage !== undefined && { statusMessage }),
    ...(avatar && { avatar }),
  });

  if (!updated) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  io.emit('user_status_changed', {
    userId,
    status: updated.status,
    statusMessage: updated.statusMessage,
    avatar: updated.avatar,
  });

  return res.json({ success: true, user: sanitizeUser(updated) });
});

// 6. Bloquear usuario
app.post('/api/user/block', (req, res) => {
  const { userId, targetUserId } = req.body;
  const user = db.findUserById(userId);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

  if (!user.blockedUserIds.includes(targetUserId)) {
    user.blockedUserIds.push(targetUserId);
    db.save();
  }

  return res.json({ success: true, user: sanitizeUser(user) });
});

// 7. Desbloquear usuario
app.post('/api/user/unblock', (req, res) => {
  const { userId, targetUserId } = req.body;
  const user = db.findUserById(userId);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

  user.blockedUserIds = user.blockedUserIds.filter((id) => id !== targetUserId);
  db.save();

  return res.json({ success: true, user: sanitizeUser(user) });
});

// 8. Reportar usuario
app.post('/api/user/report', (req, res) => {
  const { reporterId, reportedUserId, reportedMessageId, reason, details } = req.body;
  const report = db.addReport({
    id: `rep_${Date.now()}`,
    reporterId,
    reportedUserId,
    reportedMessageId,
    reason,
    details,
    createdAt: new Date().toISOString(),
  });
  return res.status(201).json({ success: true, report });
});

// 9. Reiniciar demo
app.post('/api/reset', (_req, res) => {
  const freshData = db.reset();
  io.emit('data_reset');
  return res.json({ success: true, users: freshData.users.map(sanitizeUser) });
});

// Servir frontend compilado de React (dist) en producción
import path from 'path';
import fs from 'fs';
const distPath = path.join(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🧸 Epify Realtime Backend activo en http://localhost:${PORT}`);
});
