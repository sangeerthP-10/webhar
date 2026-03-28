export function Metronome({ bpm, isRunning, onToggle, onBpmChange }) {
  return (
    <div className="panel">
      <h3>Metronome</h3>
      <button type="button" className="btn btn-purple" onClick={onToggle}>
        {isRunning ? 'Stop' : 'Start'}
      </button>
      <label className="range-label">
        BPM: {bpm}
        <input type="range" min="40" max="180" value={bpm} onChange={(e) => onBpmChange(Number(e.target.value))} />
      </label>
    </div>
  );
}
