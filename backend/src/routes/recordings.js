import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { listRecordings, recordingsDir, saveRecording } from '../store.js';

const router = Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, recordingsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.webm';
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});

const upload = multer({ storage });

router.post('/recordings', upload.single('audio'), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'audio file is required' });
    return;
  }

  const sessionId = req.body.sessionId || 'anonymous';
  const recording = saveRecording(sessionId, req.file.filename);
  res.status(201).json({ recording });
});

router.get('/recordings/:sessionId', (req, res) => {
  const recordings = listRecordings(req.params.sessionId);
  res.json({ recordings });
});

export default router;
