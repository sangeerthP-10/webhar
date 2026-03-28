export const NOTE_LAYOUT = [
  { note: 'C4', key: 'A', isSharp: false },
  { note: 'C#4', key: 'W', isSharp: true },
  { note: 'D4', key: 'S', isSharp: false },
  { note: 'D#4', key: 'E', isSharp: true },
  { note: 'E4', key: 'D', isSharp: false },
  { note: 'F4', key: 'F', isSharp: false },
  { note: 'F#4', key: 'T', isSharp: true },
  { note: 'G4', key: 'G', isSharp: false },
  { note: 'G#4', key: 'Y', isSharp: true },
  { note: 'A4', key: 'H', isSharp: false },
  { note: 'A#4', key: 'U', isSharp: true },
  { note: 'B4', key: 'J', isSharp: false },
  { note: 'C5', key: 'K', isSharp: false }
];

const SEMITONES = {
  C: -9,
  'C#': -8,
  D: -7,
  'D#': -6,
  E: -5,
  F: -4,
  'F#': -3,
  G: -2,
  'G#': -1,
  A: 0,
  'A#': 1,
  B: 2
};

export function noteToFrequency(note) {
  const match = note.match(/^([A-G]#?)(\d)$/);
  if (!match) return 440;
  const [, pitch, octaveRaw] = match;
  const octave = Number(octaveRaw);
  const semitoneDistance = SEMITONES[pitch] + (octave - 4) * 12;
  return 440 * 2 ** (semitoneDistance / 12);
}

export function frequencyToNote(frequency) {
  if (!frequency || Number.isNaN(frequency)) return '—';
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const midi = Math.round(69 + 12 * Math.log2(frequency / 440));
  const octave = Math.floor(midi / 12) - 1;
  return `${notes[midi % 12]}${octave}`;
}
