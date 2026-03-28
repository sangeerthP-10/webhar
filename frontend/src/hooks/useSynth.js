import { useEffect, useRef } from 'react';
import { noteToFrequency } from '../constants';

export function useSynth() {
  const audioCtxRef = useRef(null);
  const masterGainRef = useRef(null);
  const recordDestRef = useRef(null);

  const ensureContext = () => {
    if (!audioCtxRef.current) {
      const ctx = new window.AudioContext();
      const gain = ctx.createGain();
      const destination = ctx.createMediaStreamDestination();
      gain.gain.value = 0.8;
      gain.connect(ctx.destination);
      gain.connect(destination);
      audioCtxRef.current = ctx;
      masterGainRef.current = gain;
      recordDestRef.current = destination;
    }
    return audioCtxRef.current;
  };

  const playNote = (note, duration = 0.5) => {
    const ctx = ensureContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.value = noteToFrequency(note);

    env.gain.setValueAtTime(0.0001, now);
    env.gain.exponentialRampToValueAtTime(0.3, now + 0.03);
    env.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(env);
    env.connect(masterGainRef.current);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  };

  const clickMetronome = (accent = false) => {
    const ctx = ensureContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();

    osc.type = 'square';
    osc.frequency.value = accent ? 1300 : 950;
    env.gain.setValueAtTime(0.001, now);
    env.gain.exponentialRampToValueAtTime(0.18, now + 0.002);
    env.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(env);
    env.connect(masterGainRef.current);
    osc.start(now);
    osc.stop(now + 0.065);
  };

  const getRecordingStream = () => {
    ensureContext();
    return recordDestRef.current.stream;
  };

  useEffect(
    () => () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    },
    []
  );

  return { playNote, clickMetronome, getRecordingStream };
}
