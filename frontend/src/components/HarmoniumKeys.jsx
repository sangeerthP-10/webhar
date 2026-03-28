export function HarmoniumKeys({ notes, activeNote, onTrigger }) {
  return (
    <section className="keys-wrap">
      <div className="keys-row">
        {notes.map(({ note, key, isSharp }) => (
          <button
            key={note}
            type="button"
            className={`harmonium-key ${isSharp ? 'sharp' : 'white'} ${activeNote === note ? 'active' : ''}`}
            onMouseDown={() => onTrigger(note)}
            onTouchStart={() => onTrigger(note)}
          >
            <span className="kbd-label">{key}</span>
            <span className="note-label">{note}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
