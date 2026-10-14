// Vercel Serverless Function handler for /api/rooms
import type { Request, Response } from 'express';

// Shared global in-memory rooms store
const globalRooms = (globalThis as any).__BINGO_ROOMS__ || new Map<string, any>();
(globalThis as any).__BINGO_ROOMS__ = globalRooms;

export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method, url, query, body } = req;
  const urlParts = (url || '').split('?')[0].split('/').filter(Boolean);
  // url could be /api/rooms or /api/rooms/123456
  const code = urlParts[2] || (query && query.code) || '';

  if (method === 'GET') {
    if (code) {
      const room = globalRooms.get(String(code).toUpperCase());
      if (!room) {
        return res.status(404).json({ error: 'Sala não encontrada' });
      }
      return res.status(200).json(room);
    }
    const list = Array.from(globalRooms.values()).map((r: any) => ({
      id: r.id,
      code: r.code,
      name: r.name,
      mode: r.mode === 'BINGO_75' ? '75 Bolas' : '90 Bolas',
      playerCount: Object.keys(r.players || {}).length,
      status: r.status,
      createdAt: r.createdAt,
    }));
    return res.status(200).json(list);
  }

  if (method === 'POST') {
    if (code && urlParts[3] === 'join') {
      const room = globalRooms.get(String(code).toUpperCase());
      if (!room) return res.status(404).json({ error: 'Sala não encontrada' });
      const { player } = body || {};
      if (!player) return res.status(400).json({ error: 'Player inválido' });
      if (!room.players) room.players = {};
      room.players[player.id] = player;
      globalRooms.set(String(code).toUpperCase(), room);
      return res.status(200).json({ success: true, room });
    }

    if (code && urlParts[3] === 'sync') {
      if (!body) return res.status(400).json({ error: 'Body vazio' });
      globalRooms.set(String(code).toUpperCase(), body);
      return res.status(200).json({ success: true });
    }

    const room = body;
    if (!room || !room.code) {
      return res.status(400).json({ error: 'Sala inválida' });
    }
    const cleanCode = String(room.code).trim().toUpperCase();
    globalRooms.set(cleanCode, room);
    return res.status(200).json({ success: true, room });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
