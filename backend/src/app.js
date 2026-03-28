import express from 'express';
import cors from 'cors';
import path from 'path';
import notesRouter from './routes/notes.js';
import sessionsRouter from './routes/sessions.js';
import recordingsRouter from './routes/recordings.js';
import { recordingsDir } from './store.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'laptop-harmonium-api' });
});

app.use('/recordings', express.static(path.resolve(recordingsDir)));
app.use('/api', notesRouter);
app.use('/api', sessionsRouter);
app.use('/api', recordingsRouter);

export default app;
