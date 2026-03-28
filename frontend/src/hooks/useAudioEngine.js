import { useRef } from 'react';
import { noteToFrequency } from '../utils/noteLayout';

export function useAudioEngine() {
  const audioCtxRef = useRef(null);
  const masterRef = useRef(null);
  const analyserRef = useRef(null);
  const recordDestRef = useRef(null);

  const ensureAudio = () => {
    if (!audioCtxRef.current) {
      const context = new window.AudioContext();
      const master = context.createGain();
      const analyser = context.createAnalyser();
      const recordDest = context.createMediaStreamDestination();

      analyser.fftSize = 2048;
      master.gain.value = 0.85;
      master.connect(analyser);
      analyser.connect(context.destination);
      analyser.connect(recordDest);

      audioCtxRef.current = context;
      masterRef.current = master;
      analyserRef.current = analyser;
      recordDestRef.current = recordDest;
    }
    return audioCtxRef.current;
  };

  const playNote = (note, duration = 0.45) => {
    const context = ensureAudio();
    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = 'triangle';
    oscillator.frequency.value = noteToFrequency(note);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.26, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    oscillator.connect(gain);
    gain.connect(masterRef.current);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.03);
  };

  const clickMetronome = (accent = false) => {
    const context = ensureAudio();
    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = 'square';
    oscillator.frequency.value = accent ? 1240 : 880;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.2, now + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);

    oscillator.connect(gain);
    gain.connect(masterRef.current);
    oscillator.start(now);
    oscillator.stop(now + 0.06);
  };

  const getRecordingStream = () => {
    ensureAudio();
    return recordDestRef.current.stream;
  };

  return {
    playNote,
    clickMetronome,
    getRecordingStream,
    synthAnalyser: analyserRef.current
  };
}
