import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import notesRouter from './routes/notes.js';
import sessionsRouter from './routes/sessions.js';
import recordingsRouter from './routes/recordings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, 'uploads');

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use('/uploads', express.static(uploadsDir));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'laptop-harmonium' });
});

app.use('/', notesRouter);
app.use('/', sessionsRouter);
app.use('/', recordingsRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Laptop Harmonium backend running on port ${PORT}`);
});
