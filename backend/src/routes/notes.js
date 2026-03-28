import { Router } from 'express';
import { NOTES } from '../notes.js';

const router = Router();

router.get('/notes', (_req, res) => {
  res.json({ notes: NOTES });
});

export default router;
