import { Router } from 'express';
import { randomUUID } from 'crypto';

const router = Router();
const sessions = new Map();

router.post('/sessions', (req, res) => {
  const sessionId = randomUUID();
  const session = {
    sessionId,
    createdAt: new Date().toISOString(),
    preferences: req.body?.preferences || {}
  };
  sessions.set(sessionId, session);
  res.status(201).json(session);
});

router.get('/sessions/:sessionId', (req, res) => {
  const session = sessions.get(req.params.sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  return res.json(session);
});

export default router;
