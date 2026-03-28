import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const recordings = new Map();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.webm';
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});

const upload = multer({ storage });

router.post('/recordings', upload.single('audio'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'audio file is required' });
  const sessionId = req.body.sessionId || 'anonymous';
  const record = {
    id: randomUUID(),
    sessionId,
    url: `/uploads/${req.file.filename}`,
    createdAt: new Date().toISOString()
  };
  if (!recordings.has(sessionId)) recordings.set(sessionId, []);
  recordings.get(sessionId).unshift(record);
  return res.status(201).json({ recording: record });
});

router.get('/recordings/:sessionId', (req, res) => {
  res.json({ recordings: recordings.get(req.params.sessionId) || [] });
});

router.delete('/recordings/:sessionId/:recordingId', (req, res) => {
  const list = recordings.get(req.params.sessionId) || [];
  const filtered = list.filter((item) => item.id !== req.params.recordingId);
  recordings.set(req.params.sessionId, filtered);
  res.json({ ok: true, recordings: filtered });
});

export default router;
