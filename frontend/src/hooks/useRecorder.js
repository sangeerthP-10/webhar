import { useRef, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export function useRecorder(sessionId) {
  const [isRecording, setIsRecording] = useState(false);
  const [clips, setClips] = useState([]);
  const [error, setError] = useState('');
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = (stream) => {
    try {
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      recorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const localUrl = URL.createObjectURL(blob);
        const formData = new FormData();
        formData.append('audio', blob, `take-${Date.now()}.webm`);
        formData.append('sessionId', sessionId);

        try {
          const response = await fetch(`${API_BASE}/recordings`, {
            method: 'POST',
            body: formData
          });
          const data = await response.json();
          setClips((prev) => [{ ...data.recording, localUrl }, ...prev]);
        } catch {
          setClips((prev) => [{ id: crypto.randomUUID(), createdAt: new Date().toISOString(), localUrl }, ...prev]);
          setError('Saved only in browser (backend unavailable).');
        }
      };

      recorder.start();
      setIsRecording(true);
      setError('');
    } catch {
      setError('Recording not supported in this browser.');
    }
  };

  const stopRecording = () => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return { isRecording, clips, error, startRecording, stopRecording };
}
