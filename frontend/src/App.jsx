import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { HarmoniumKeys } from './components/HarmoniumKeys';
import { WaveformCanvas } from './components/WaveformCanvas';
import { API_BASE, NOTE_LAYOUT } from './constants';
import { useMetronome } from './hooks/useMetronome';
import { usePitchDetector } from './hooks/usePitchDetector';
import { useRecorder } from './hooks/useRecorder';
import { useSynth } from './hooks/useSynth';

function App() {
  const [notes, setNotes] = useState(NOTE_LAYOUT.map((n) => n.note));
  const [activeNote, setActiveNote] = useState('');
  const [sessionId, setSessionId] = useState('');
  const pressedKeys = useRef(new Set());

  const { playNote, clickMetronome, getRecordingStream } = useSynth();
  const { pitch, note: detectedNote, enabled, error: pitchError, enable, analyser } = usePitchDetector();
  const { isRunning, setIsRunning, bpm, setBpm } = useMetronome((accent) => clickMetronome(accent));
  const { isRecording, clips, error: recordingError, start, stop, loadForSession } = useRecorder(sessionId);

  useEffect(() => {
    fetch(`${API_BASE}/api/notes`)
      .then((res) => res.json())
      .then((data) => setNotes(data.notes || NOTE_LAYOUT.map((n) => n.note)))
      .catch(() => setNotes(NOTE_LAYOUT.map((n) => n.note)));

    fetch(`${API_BASE}/api/sessions`, { method: 'POST' })
      .then((res) => res.json())
      .then((data) => {
        setSessionId(data.sessionId);
        loadForSession(data.sessionId);
      })
      .catch(() => setSessionId(crypto.randomUUID()));
  }, [loadForSession]);

  const keyLayout = useMemo(
    () => NOTE_LAYOUT.filter((item) => notes.includes(item.note)),
    [notes]
  );

  const playAndHighlight = useCallback(
    (note) => {
      playNote(note);
      setActiveNote(note);
      setTimeout(() => setActiveNote((prev) => (prev === note ? '' : prev)), 200);
    },
    [playNote]
  );

  useEffect(() => {
    const keyMap = new Map(keyLayout.map((item) => [item.key.toLowerCase(), item.note]));

    const onDown = (event) => {
      const key = event.key.toLowerCase();
      const note = keyMap.get(key);
      if (!note || pressedKeys.current.has(key)) return;
      pressedKeys.current.add(key);
      playAndHighlight(note);
    };

    const onUp = (event) => {
      pressedKeys.current.delete(event.key.toLowerCase());
    };

    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, [keyLayout, playAndHighlight]);

  const toggleRecording = () => {
    if (isRecording) {
      stop();
      return;
    }
    start(getRecordingStream());
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black px-4 py-8 text-slate-100 sm:px-6">
      <div className="mx-auto w-full max-w-6xl rounded-3xl border border-cyan-400/20 bg-gradient-to-b from-slate-900 to-slate-950 p-5 shadow-[0_35px_120px_rgba(0,0,0,0.55)] sm:p-8">
        <header className="mb-6 text-center">
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-300/80">Laptop Harmonium Pro</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Performance Desk</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
            Inspired by Digonto harmonium experiment, rebuilt with keyboard control, pitch detection, metronome and recording.
          </p>
        </header>

        <section className="mb-5 grid gap-3 rounded-2xl border border-slate-700 bg-slate-900/60 p-4 sm:grid-cols-4">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-slate-400">Now Playing</p>
            <p className="mt-1 text-2xl font-bold text-cyan-300">{activeNote || '—'}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-widest text-slate-400">Detected Pitch</p>
            <p className="mt-1 text-2xl font-bold text-emerald-300">{pitch ? `${Math.round(pitch)} Hz` : '—'}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-widest text-slate-400">Detected Note</p>
            <p className="mt-1 text-2xl font-bold text-amber-300">{detectedNote}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-widest text-slate-400">Session</p>
            <p className="mt-1 truncate text-xs text-slate-300">{sessionId || 'creating...'}</p>
          </div>
        </section>

        <HarmoniumKeys layout={keyLayout} activeNote={activeNote} onPlay={playAndHighlight} />

        <section className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-slate-300">Pitch & Waveform</h2>
            <button
              type="button"
              onClick={enable}
              disabled={enabled}
              className="mb-3 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {enabled ? 'Microphone enabled' : 'Enable microphone'}
            </button>
            {pitchError && <p className="mb-3 text-sm text-rose-300">{pitchError}</p>}
            <WaveformCanvas analyser={analyser} />
            <p className="mt-2 text-xs text-slate-400">Waveform appears after microphone permission is granted.</p>
          </div>

          <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-slate-300">Metronome & Recording</h2>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setIsRunning((prev) => !prev)}
                className="rounded-lg bg-violet-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-400"
              >
                {isRunning ? 'Stop metronome' : 'Start metronome'}
              </button>
              <label className="text-sm text-slate-300">
                BPM: {bpm}
                <input
                  className="ml-2 accent-violet-400"
                  type="range"
                  min="40"
                  max="180"
                  value={bpm}
                  onChange={(e) => setBpm(Number(e.target.value))}
                />
              </label>
            </div>

            <button
              type="button"
              onClick={toggleRecording}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                isRecording ? 'bg-rose-500 text-white hover:bg-rose-400' : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
              }`}
            >
              {isRecording ? 'Stop recording' : 'Start recording'}
            </button>
            {recordingError && <p className="mt-2 text-sm text-rose-300">{recordingError}</p>}

            <div className="mt-4 space-y-2">
              {clips.map((clip) => (
                <div key={clip.id} className="rounded-lg border border-slate-700 p-2">
                  <p className="mb-1 text-xs text-slate-400">{new Date(clip.createdAt).toLocaleString()}</p>
                  <audio controls src={clip.localUrl || `${API_BASE}${clip.url}`} className="w-full" />
                </div>
              ))}
              {clips.length === 0 && <p className="text-sm text-slate-400">No recordings yet.</p>}
            </div>
          </div>
        </section>

        <p className="mt-6 text-center text-xs text-slate-500">Keyboard mapping: A W S E D F T G Y H U J K</p>
      </div>
    </main>
  );
}

export default App;
