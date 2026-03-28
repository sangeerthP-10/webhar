export function HarmoniumKeys({ layout, activeNote, onPlay }) {
  return (
    <section className="overflow-x-auto rounded-2xl border border-amber-100/15 bg-gradient-to-b from-amber-800/30 to-amber-950/40 p-4 sm:p-6">
      <div className="mx-auto flex min-w-[860px] justify-center gap-2">
        {layout.map(({ note, isSharp, key }) => {
          const isActive = activeNote === note;
          return (
            <button
              key={note}
              type="button"
              onMouseDown={() => onPlay(note)}
              onTouchStart={() => onPlay(note)}
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
                {key}
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
  );
}
