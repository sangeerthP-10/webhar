import { useEffect, useRef, useState } from 'react';
import { frequencyToNote } from '../utils/noteLayout';

function yinPitch(buffer, sampleRate) {
  const threshold = 0.12;
  const yin = new Float32Array(buffer.length / 2);

  for (let tau = 1; tau < yin.length; tau += 1) {
    let sum = 0;
    for (let i = 0; i < yin.length; i += 1) {
      const delta = buffer[i] - buffer[i + tau];
      sum += delta * delta;
    }
    yin[tau] = sum;
  }

  yin[0] = 1;
  let runningSum = 0;
  for (let tau = 1; tau < yin.length; tau += 1) {
    runningSum += yin[tau];
    yin[tau] = yin[tau] * tau / runningSum;
  }

  let tauEstimate = -1;
  for (let tau = 2; tau < yin.length; tau += 1) {
    if (yin[tau] < threshold) {
      while (tau + 1 < yin.length && yin[tau + 1] < yin[tau]) tau += 1;
      tauEstimate = tau;
      break;
    }
  }

  if (tauEstimate === -1) return 0;
  return sampleRate / tauEstimate;
}

export function usePitchDetection() {
  const [enabled, setEnabled] = useState(false);
  const [pitchHz, setPitchHz] = useState(0);
  const [noteName, setNoteName] = useState('—');
  const [error, setError] = useState('');
  const analyserRef = useRef(null);
  const contextRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);

  const enableMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const context = new window.AudioContext();
      const source = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);

      analyserRef.current = analyser;
      contextRef.current = context;
      streamRef.current = stream;
      setEnabled(true);
      setError('');
    } catch {
      setError('Microphone permission denied.');
    }
  };

  useEffect(() => {
    if (!enabled || !analyserRef.current || !contextRef.current) return undefined;
    const analyser = analyserRef.current;
    const buffer = new Float32Array(analyser.fftSize);

    const loop = () => {
      analyser.getFloatTimeDomainData(buffer);
      const pitch = yinPitch(buffer, contextRef.current.sampleRate);
      setPitchHz(pitch);
      setNoteName(pitch ? frequencyToNote(pitch) : '—');
      rafRef.current = requestAnimationFrame(loop);
    };

    loop();
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

  return { enabled, pitchHz, noteName, error, enableMic, analyser: analyserRef.current };
}
