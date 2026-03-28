import { useMemo, useState } from 'react';

const PATTERNS = [
  { name: 'Straight', pattern: [0, 1, 2, 3, 4, 5, 6] },
  { name: 'Skip', pattern: [0, 2, 1, 3, 2, 4, 3, 5] },
  { name: 'Wave', pattern: [0, 1, 0, 2, 1, 3, 2, 4] }
];

export function AlankarPlayer({ notes, onPlay }) {
  const [playing, setPlaying] = useState(false);
  const [patternName, setPatternName] = useState(PATTERNS[0].name);

  const selected = useMemo(() => PATTERNS.find((p) => p.name === patternName) || PATTERNS[0], [patternName]);

  const startPattern = () => {
    if (playing) return;
    setPlaying(true);

    selected.pattern.forEach((index, step) => {
      const safeIndex = Math.min(index, notes.length - 1);
      setTimeout(() => {
        onPlay(notes[safeIndex].note);
        if (step === selected.pattern.length - 1) setPlaying(false);
      }, step * 320);
    });
  };

  return (
    <div className="panel">
      <h3>Alankar Player</h3>
      <select value={patternName} onChange={(e) => setPatternName(e.target.value)}>
        {PATTERNS.map((item) => (
          <option value={item.name} key={item.name}>{item.name}</option>
        ))}
      </select>
      <button type="button" className="btn btn-cyan" onClick={startPattern} disabled={playing}>
        {playing ? 'Playing...' : 'Play Pattern'}
      </button>
    </div>
  );
}
