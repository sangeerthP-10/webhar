import { useEffect, useMemo, useRef, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';
const FALLBACK_NOTES = ['C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4', 'C5'];
const KEYBOARD_LAYOUT = ['A', 'W', 'S', 'E', 'D', 'F', 'T', 'G', 'Y', 'H', 'U', 'J', 'K'];

function createFrequency(note) {
  const match = note.match(/^([A-G]#?)(\d)$/);
  if (!match) return 440;

  const semitones = {
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

  const [, pitch, octaveRaw] = match;
  const octave = Number(octaveRaw);
  const semitoneDistance = semitones[pitch] + (octave - 4) * 12;
  return 440 * 2 ** (semitoneDistance / 12);
}

function App() {
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState('');
  const [loading, setLoading] = useState(true);
  const audioCtxRef = useRef(null);
  const pressedKeysRef = useRef(new Set());

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/notes`);
        const data = await response.json();
        setNotes(data.notes || FALLBACK_NOTES);
      } catch {
        setNotes(FALLBACK_NOTES);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);

  const keyLayout = useMemo(
    () =>
      notes.map((note, index) => ({
        note,
        isSharp: note.includes('#'),
        triggerKey: KEYBOARD_LAYOUT[index] ?? ''
      })),
    [notes]
  );

  const keyToNote = useMemo(() => {
    const map = new Map();
    keyLayout.forEach(({ note, triggerKey }) => {
      if (triggerKey) {
        map.set(triggerKey.toLowerCase(), note);
      }
    });
    return map;
  }, [keyLayout]);

  const playNote = (note) => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new window.AudioContext();
    }

    const context = audioCtxRef.current;
    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.type = 'triangle';
    oscillator.frequency.value = createFrequency(note);
    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.exponentialRampToValueAtTime(0.24, now + 0.03);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.start(now);
    oscillator.stop(now + 0.55);

    setActiveNote(note);
    setTimeout(() => {
      setActiveNote((prev) => (prev === note ? '' : prev));
    }, 220);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase();
      const note = keyToNote.get(key);

      if (!note || pressedKeysRef.current.has(key)) {
        return;
      }

      pressedKeysRef.current.add(key);
      playNote(note);
    };

    const handleKeyUp = (event) => {
      pressedKeysRef.current.delete(event.key.toLowerCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [keyToNote]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 px-4 py-10 text-slate-100 sm:py-12">
      <div className="mx-auto w-full max-w-6xl rounded-[2rem] border border-amber-200/20 bg-gradient-to-b from-amber-900/35 via-amber-950/20 to-black/20 p-4 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur sm:p-8">
        <header className="mb-6 text-center sm:mb-8">
          <p className="mb-2 text-xs uppercase tracking-[0.28em] text-amber-200/80">Laptop Harmonium</p>
          <h1 className="text-3xl font-semibold sm:text-4xl">Play with mouse or keyboard</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-amber-50/80 sm:text-base">
            Inspired by Indian harmonium layouts — press mapped keys (A, W, S, E...) or click the reeds below.
          </p>
        </header>

        <section className="mb-6 grid gap-3 rounded-2xl border border-amber-100/20 bg-black/30 p-4 text-center sm:mb-8 sm:grid-cols-3 sm:text-left">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-amber-100/60">Now Playing</p>
            <p className="mt-1 text-2xl font-bold text-cyan-300">{activeNote || '—'}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-amber-100/60">Keyboard Mode</p>
            <p className="mt-1 text-sm text-amber-50/85">Tap A W S E D F T G Y H U J K</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-amber-100/60">Tip</p>
            <p className="mt-1 text-sm text-amber-50/85">Use headphones for cleaner synth tone.</p>
          </div>
        </section>

        {loading ? (
          <div className="py-20 text-center text-amber-100/80">Loading notes...</div>
        ) : (
          <section className="overflow-x-auto rounded-2xl border border-amber-100/15 bg-gradient-to-b from-amber-800/30 to-amber-950/40 p-4 sm:p-6">
            <div className="mx-auto flex min-w-[860px] justify-center gap-2">
              {keyLayout.map(({ note, isSharp, triggerKey }) => {
                const isActive = activeNote === note;

                return (
                  <button
                    key={note}
                    type="button"
                    onClick={() => playNote(note)}
                    className={`group relative border transition-all duration-150 active:translate-y-1 ${
                      isSharp
                        ? 'z-10 -mx-2 h-44 w-16 rounded-xl border-slate-700 bg-gradient-to-b from-slate-700 to-slate-950 text-slate-100 hover:from-slate-600 hover:to-slate-900'
                        : 'h-64 w-20 rounded-b-2xl border-slate-200/40 bg-gradient-to-b from-white via-slate-100 to-slate-300 text-slate-900 hover:from-white hover:to-slate-200'
                    } ${isActive ? 'scale-[1.01] ring-4 ring-cyan-300/60' : ''}`}
                  >
                    <span
                      className={`absolute left-1/2 top-3 -translate-x-1/2 rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider ${
                        isSharp ? 'bg-slate-200/15 text-slate-100' : 'bg-slate-800/80 text-slate-100'
                      }`}
                    >
                      {triggerKey || '—'}
                    </span>
                    <span
                      className={`absolute bottom-3 left-1/2 -translate-x-1/2 text-sm font-semibold transition-transform duration-200 group-hover:-translate-y-0.5 ${
                        isSharp ? 'text-slate-200' : 'text-slate-800'
                      }`}
                    >
                      {note}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

export default App;
