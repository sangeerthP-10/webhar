import { Router } from 'express';
import { createSession } from '../store.js';

const router = Router();

router.post('/sessions', (_req, res) => {
  const session = createSession();
  res.status(201).json(session);
});

export default router;
