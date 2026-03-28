import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

const recordingsBySession = new Map();
const sessions = new Map();

export const recordingsDir = path.resolve(process.cwd(), 'recordings');
if (!fs.existsSync(recordingsDir)) fs.mkdirSync(recordingsDir, { recursive: true });

export function createSession() {
  const sessionId = randomUUID();
  const session = { sessionId, createdAt: new Date().toISOString() };
  sessions.set(sessionId, session);
  if (!recordingsBySession.has(sessionId)) recordingsBySession.set(sessionId, []);
  return session;
}

export function saveRecording(sessionId, fileName) {
  const record = {
    id: randomUUID(),
    fileName,
    url: `/recordings/${fileName}`,
    createdAt: new Date().toISOString()
  };
  if (!recordingsBySession.has(sessionId)) recordingsBySession.set(sessionId, []);
  recordingsBySession.get(sessionId).unshift(record);
  return record;
}

export function listRecordings(sessionId) {
  return recordingsBySession.get(sessionId) || [];
}
