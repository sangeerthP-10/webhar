import { useCallback, useRef, useState } from 'react';
import { API_BASE } from '../constants';

export function useRecorder(sessionId) {
  const [isRecording, setIsRecording] = useState(false);
  const [clips, setClips] = useState([]);
  const [error, setError] = useState('');
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const loadForSession = useCallback(async (id) => {
    if (!id) return;
    try {
      const response = await fetch(`${API_BASE}/api/recordings/${id}`);
      const data = await response.json();
      setClips((data.recordings || []).map((r) => ({ ...r, localUrl: `${API_BASE}${r.url}` })));
    } catch {
      // Ignore preload failures.
    }
  }, []);

  const start = (stream) => {
    try {
      chunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const localUrl = URL.createObjectURL(blob);
        const form = new FormData();
        form.append('audio', blob, `clip-${Date.now()}.webm`);
        form.append('sessionId', sessionId);

        try {
          const response = await fetch(`${API_BASE}/api/recordings`, {
            method: 'POST',
            body: form
          });
          const data = await response.json();
          setClips((prev) => [{ ...data.recording, localUrl }, ...prev]);
        } catch {
          setClips((prev) => [{ id: crypto.randomUUID(), localUrl, createdAt: new Date().toISOString() }, ...prev]);
          setError('Saved locally only (backend unavailable).');
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError('');
    } catch {
      setError('Recording is not supported in this browser.');
    }
  };

  const stop = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
      setIsRecording(false);
    }
  };

  return { isRecording, clips, error, start, stop, loadForSession };
}
