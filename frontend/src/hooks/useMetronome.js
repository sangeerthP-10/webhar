import { useEffect, useRef, useState } from 'react';

export function useMetronome(onTick) {
  const [isRunning, setIsRunning] = useState(false);
  const [bpm, setBpm] = useState(96);
  const beatRef = useRef(0);

  useEffect(() => {
    if (!isRunning) return undefined;

    const ms = (60 / bpm) * 1000;
    const id = setInterval(() => {
      beatRef.current = (beatRef.current + 1) % 4;
      onTick?.(beatRef.current === 0);
    }, ms);

    return () => clearInterval(id);
  }, [isRunning, bpm, onTick]);

  return { isRunning, setIsRunning, bpm, setBpm };
}
