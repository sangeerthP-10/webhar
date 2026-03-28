import { useEffect, useRef, useState } from 'react';
import { frequencyToNote } from '../constants';

function autoCorrelate(buf, sampleRate) {
  let rms = 0;
  for (let i = 0; i < buf.length; i += 1) rms += buf[i] * buf[i];
  rms = Math.sqrt(rms / buf.length);
  if (rms < 0.01) return -1;

  let r1 = 0;
  let r2 = buf.length - 1;
  const threshold = 0.2;
  for (let i = 0; i < buf.length / 2; i += 1) if (Math.abs(buf[i]) < threshold) { r1 = i; break; }
  for (let i = 1; i < buf.length / 2; i += 1) if (Math.abs(buf[buf.length - i]) < threshold) { r2 = buf.length - i; break; }

  const trimmed = buf.slice(r1, r2);
  const c = new Array(trimmed.length).fill(0);
  for (let i = 0; i < trimmed.length; i += 1) {
    for (let j = 0; j < trimmed.length - i; j += 1) c[i] += trimmed[j] * trimmed[j + i];
  }
  let d = 0;
  while (c[d] > c[d + 1]) d += 1;

  let maxVal = -1;
  let maxPos = -1;
  for (let i = d; i < trimmed.length; i += 1) {
    if (c[i] > maxVal) {
      maxVal = c[i];
      maxPos = i;
    }
  }
  if (maxPos <= 0) return -1;
  return sampleRate / maxPos;
}

export function usePitchDetector() {
  const [pitch, setPitch] = useState(0);
  const [note, setNote] = useState('—');
  const [enabled, setEnabled] = useState(false);
  const [error, setError] = useState('');
  const analyserRef = useRef(null);
  const rafRef = useRef(null);
  const streamRef = useRef(null);
  const contextRef = useRef(null);

  const enable = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new window.AudioContext();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);

      streamRef.current = stream;
      contextRef.current = ctx;
      analyserRef.current = analyser;
      setEnabled(true);
      setError('');
    } catch {
      setError('Microphone access denied');
    }
  };

  useEffect(() => {
    if (!enabled || !analyserRef.current || !contextRef.current) return undefined;
    const analyser = analyserRef.current;
    const buf = new Float32Array(analyser.fftSize);

    const tick = () => {
      analyser.getFloatTimeDomainData(buf);
      const currentPitch = autoCorrelate(buf, contextRef.current.sampleRate);
      if (currentPitch > 0) {
        setPitch(currentPitch);
        setNote(frequencyToNote(currentPitch) ?? '—');
      } else {
        setPitch(0);
        setNote('—');
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    tick();
    return () => cancelAnimationFrame(rafRef.current);
  }, [enabled]);

  useEffect(
    () => () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      if (contextRef.current) contextRef.current.close();
    },
    []
  );

  return { pitch, note, enabled, error, enable, analyser: analyserRef.current };
}
