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
      </div>
    </main>
  );
}

export default App;
