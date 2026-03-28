const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export function RecordingPanel({ isRecording, error, clips, onToggle }) {
  return (
    <div className="panel">
      <h3>Recording</h3>
      <button type="button" className={`btn ${isRecording ? 'btn-red' : 'btn-green'}`} onClick={onToggle}>
        {isRecording ? 'Stop recording' : 'Start recording'}
      </button>
      {error && <p className="error-text">{error}</p>}
      <div className="clips-list">
        {clips.length === 0 && <p className="hint-text">No recordings yet.</p>}
        {clips.map((clip) => (
          <div key={clip.id} className="clip-item">
            <p>{new Date(clip.createdAt).toLocaleString()}</p>
            <audio controls src={clip.localUrl || `${API_BASE}${clip.url}`} />
            <a href={clip.localUrl || `${API_BASE}${clip.url}`} download={`harmonium-${clip.id}.webm`}>
              Download
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
