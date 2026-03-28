# Laptop Harmonium Web App

A modern full-stack harmonium studio inspired by Digonto's harmonium experiment, rebuilt with a cleaner modular architecture and richer features.

## Final project structure

```text
harmonium/
├── frontend/
│   ├── public/index.html
│   ├── package.json
│   └── src/
│       ├── App.jsx
│       ├── App.css
│       ├── hooks/
│       │   ├── useAudioEngine.js
│       │   ├── usePitchDetection.js
│       │   └── useRecorder.js
│       ├── components/
│       │   ├── HarmoniumKeys.jsx
│       │   ├── PitchVisualizer.jsx
│       │   ├── Metronome.jsx
│       │   ├── RecordingPanel.jsx
│       │   └── AlankarPlayer.jsx
│       └── utils/
│           └── noteLayout.js
│
└── backend/
    ├── server.js
    ├── package.json
    ├── routes/
    │   ├── notes.js
    │   ├── recordings.js
    │   └── sessions.js
    └── uploads/
```

## Features

- Harmonium / piano-style keys with dark modern UI
- Keyboard play controls (A, S, D, F and extended keys)
- Real-time synth playback (Web Audio API)
- Pitch detection from microphone (YIN algorithm)
- Waveform + pitch visualizer
- Metronome with BPM slider
- Recording + playback + download
- Session creation and recordings persistence backend

## Run locally

```bash
npm install
npm run dev
```

- Frontend: Vite URL (usually `http://localhost:5173`)
- Backend: `http://localhost:4000`

## Backend routes

- `GET /health`
- `GET /notes`
- `POST /sessions`
- `GET /sessions/:sessionId`
- `POST /recordings`
- `GET /recordings/:sessionId`
- `DELETE /recordings/:sessionId/:recordingId`
