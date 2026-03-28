import { useCallback, useEffect, useRef, useState } from 'react';
import './App.css';
import { HarmoniumKeys } from './components/HarmoniumKeys';
import { PitchVisualizer } from './components/PitchVisualizer';
import { Metronome } from './components/Metronome';
import { RecordingPanel } from './components/RecordingPanel';
import { AlankarPlayer } from './components/AlankarPlayer';
import { NOTE_LAYOUT } from './utils/noteLayout';
import { useAudioEngine } from './hooks/useAudioEngine';
import { usePitchDetection } from './hooks/usePitchDetection';
import { useRecorder } from './hooks/useRecorder';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

function App() {
  const [notes, setNotes] = useState(NOTE_LAYOUT);
  const [activeNote, setActiveNote] = useState('—');
  const [sessionId, setSessionId] = useState('');
  const [bpm, setBpm] = useState(96);
  const [metroOn, setMetroOn] = useState(false);
  const held = useRef(new Set());

  const { playNote, clickMetronome, getRecordingStream } = useAudioEngine();
  const { enabled, pitchHz, noteName, error: pitchError, enableMic, analyser } = usePitchDetection();
  const { isRecording, clips, error: recordingError, startRecording, stopRecording } = useRecorder(sessionId);

  useEffect(() => {
    fetch(`${API_BASE}/notes`)
      .then((res) => res.json())
      .then((data) => {
        const available = new Set(data.notes || []);
        setNotes(NOTE_LAYOUT.filter((item) => available.has(item.note)));
      })
      .catch(() => setNotes(NOTE_LAYOUT));

    fetch(`${API_BASE}/sessions`, { method: 'POST' })
      .then((res) => res.json())
      .then((data) => setSessionId(data.sessionId))
      .catch(() => setSessionId(crypto.randomUUID()));
  }, []);

  const playAndFlash = useCallback(
    (note) => {
      playNote(note);
      setActiveNote(note);
      setTimeout(() => setActiveNote((current) => (current === note ? '—' : current)), 220);
    },
    [playNote]
  );

  useEffect(() => {
    const keyMap = new Map(notes.map((n) => [n.key.toLowerCase(), n.note]));

    const down = (event) => {
      const key = event.key.toLowerCase();
      const note = keyMap.get(key);
      if (!note || held.current.has(key)) return;
      held.current.add(key);
      playAndFlash(note);
    };

    const up = (event) => held.current.delete(event.key.toLowerCase());
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [notes, playAndFlash]);

  useEffect(() => {
    if (!metroOn) return undefined;
    let beat = 0;
    const id = setInterval(() => {
      clickMetronome(beat === 0);
      beat = (beat + 1) % 4;
    }, (60 / bpm) * 1000);

    return () => clearInterval(id);
  }, [metroOn, bpm, clickMetronome]);

  const toggleRecording = () => {
    if (isRecording) stopRecording();
    else startRecording(getRecordingStream());
  };

  return (
    <main className="app-shell">
      <div className="app-inner">
        <header>
          <p style={{ letterSpacing: '0.25em', textTransform: 'uppercase', color: '#67e8f9', fontSize: '0.75rem' }}>
            Laptop Harmonium Pro
          </p>
          <h1 style={{ margin: '0.2rem 0 0.6rem' }}>Modern Harmonium Studio</h1>
          <p style={{ color: '#94a3b8', marginBottom: '0.8rem' }}>
            Real harmonium-style keys, keyboard controls, pitch detection, metronome, recording, and alankar playback.
          </p>
        </header>

        <section className="top-grid">
          <div className="stat-box"><small>Now Playing</small><h3>{activeNote}</h3></div>
          <div className="stat-box"><small>Pitch</small><h3>{pitchHz ? `${Math.round(pitchHz)} Hz` : '—'}</h3></div>
          <div className="stat-box"><small>Detected Note</small><h3>{noteName}</h3></div>
          <div className="stat-box"><small>Session ID</small><p style={{ fontSize: '0.75rem' }}>{sessionId || 'creating...'}</p></div>
        </section>

        <HarmoniumKeys notes={notes} activeNote={activeNote} onTrigger={playAndFlash} />

        <div className="panel" style={{ marginBottom: '1rem' }}>
          <h3>Pitch Detection</h3>
          <button type="button" className="btn btn-cyan" onClick={enableMic} disabled={enabled}>
            {enabled ? 'Microphone Enabled' : 'Enable Microphone'}
          </button>
          {pitchError && <p className="error-text">{pitchError}</p>}
          <PitchVisualizer analyser={analyser} pitchHz={pitchHz} />
        </div>

        <section className="bottom-grid">
          <Metronome bpm={bpm} isRunning={metroOn} onToggle={() => setMetroOn((v) => !v)} onBpmChange={setBpm} />
          <RecordingPanel isRecording={isRecording} clips={clips} error={recordingError} onToggle={toggleRecording} />
          <AlankarPlayer notes={notes} onPlay={playAndFlash} />
        </section>

        <p style={{ marginTop: '1rem', color: '#94a3b8', fontSize: '0.85rem' }}>
          Keyboard mapping: A W S E D F T G Y H U J K (includes requested A/S/D/F controls).
        </p>
import { useEffect, useMemo, useRef, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

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

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/notes`);
        const data = await response.json();
        setNotes(data.notes || []);
      } catch {
        setNotes(['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5']);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);

  const keyLayout = useMemo(
    () =>
      notes.map((note) => ({
        note,
        isSharp: note.includes('#')
      })),
    [notes]
  );

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
    gainNode.gain.exponentialRampToValueAtTime(0.25, now + 0.03);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.start(now);
    oscillator.stop(now + 0.55);

    setActiveNote(note);
    setTimeout(() => setActiveNote((prev) => (prev === note ? '' : prev)), 280);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-900 px-4 py-12 text-slate-100">
      <div className="mx-auto w-full max-w-5xl rounded-3xl border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur-xl sm:p-10">
        <header className="mb-8 text-center sm:mb-10">
          <p className="mb-2 text-xs uppercase tracking-[0.25em] text-purple-300">Laptop Harmonium</p>
          <h1 className="text-3xl font-semibold sm:text-4xl">Play notes with a single click</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-slate-300 sm:text-base">
            A minimal digital harmonium with quick response, smooth animation, and rich synth tones.
          </p>
        </header>

        <section className="mb-8 rounded-2xl border border-white/10 bg-black/20 p-4 text-center sm:mb-10">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Now Playing</p>
          <div className="mt-2 h-10 text-3xl font-bold text-cyan-300 transition-all duration-300">
            {activeNote || '—'}
          </div>
        </section>

        {loading ? (
          <div className="py-16 text-center text-slate-300">Loading notes...</div>
        ) : (
          <section className="overflow-x-auto pb-4">
            <div className="mx-auto flex min-w-[740px] justify-center gap-2">
              {keyLayout.map(({ note, isSharp }) => (
                <button
                  key={note}
                  type="button"
                  onClick={() => playNote(note)}
                  className={`group relative h-52 w-20 rounded-b-2xl border transition-all duration-200 active:translate-y-1 active:scale-[0.99] ${
                    isSharp
                      ? 'z-10 -mx-2 h-36 w-14 rounded-xl border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800'
                      : 'border-slate-200/40 bg-gradient-to-b from-white to-slate-300 text-slate-900 hover:from-white hover:to-slate-200'
                  } ${activeNote === note ? 'ring-4 ring-cyan-300/60' : ''}`}
                >
                  <span
                    className={`absolute bottom-3 left-1/2 -translate-x-1/2 text-sm font-semibold transition-transform duration-200 group-hover:-translate-y-0.5 ${
                      isSharp ? 'text-slate-200' : 'text-slate-800'
                    }`}
                  >
                    {note}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

export default App;
