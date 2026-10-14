import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '2mb' }));

// Centralized in-memory room store shared across all devices and sessions
const roomsStore = new Map<string, any>();

// Cleanup rooms older than 12 hours
setInterval(() => {
  const now = Date.now();
  for (const [code, room] of roomsStore.entries()) {
    if (now - (room.createdAt || 0) > 12 * 3600 * 1000) {
      roomsStore.delete(code);
    }
  }
}, 30 * 60 * 1000);

// API Endpoints for cross-device multiplayer
app.get('/api/rooms', (_req, res) => {
  const activeRooms = Array.from(roomsStore.values()).map((r) => ({
    id: r.id,
    code: r.code,
    name: r.name,
    mode: r.mode === 'BINGO_75' ? '75 Bolas' : '90 Bolas',
    playerCount: Object.keys(r.players || {}).length,
    status: r.status,
    createdAt: r.createdAt,
  }));
  res.json(activeRooms);
});

app.get('/api/rooms/:code', (req, res) => {
  const code = (req.params.code || '').trim().toUpperCase();
  const room = roomsStore.get(code);
  if (!room) {
    return res.status(404).json({ error: 'Sala não encontrada com este código' });
  }
  res.json(room);
});

app.post('/api/rooms', (req, res) => {
  const room = req.body;
  if (!room || !room.code) {
    return res.status(400).json({ error: 'Dados da sala incompletos' });
  }
  const cleanCode = String(room.code).trim().toUpperCase();
  roomsStore.set(cleanCode, room);
  res.json({ success: true, code: cleanCode, room });
});

app.post('/api/rooms/:code/sync', (req, res) => {
  const code = (req.params.code || '').trim().toUpperCase();
  const room = req.body;
  if (!room || !room.id) {
    return res.status(400).json({ error: 'Sala inválida para sincronização' });
  }
  roomsStore.set(code, room);
  res.json({ success: true });
});

app.post('/api/rooms/:code/join', (req, res) => {
  const code = (req.params.code || '').trim().toUpperCase();
  const room = roomsStore.get(code);
  if (!room) {
    return res.status(404).json({ error: 'Sala não encontrada' });
  }

  const { player } = req.body;
  if (!player || !player.id) {
    return res.status(400).json({ error: 'Perfil de jogador inválido' });
  }

  if (!room.players) room.players = {};
  room.players[player.id] = player;

  if (!room.chat) room.chat = [];
  room.chat.push({
    id: 'sys_' + Date.now(),
    senderId: 'system',
    senderName: 'Sistema',
    text: `${player.avatar || '🎲'} ${player.name} entrou na sala!`,
    timestamp: Date.now(),
    isSystem: true,
  });

  roomsStore.set(code, room);
  res.json({ success: true, room, playerId: player.id });
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Mount Vite middleware in development
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Bingo Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
