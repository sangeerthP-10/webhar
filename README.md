# Laptop Harmonium Web App

A modern full-stack musical web app inspired by https://www.digonto.in/experiments/harmonium, with keyboard-playable harmonium keys, pitch detection, waveform visualization, metronome, and recording.

## Tech stack

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express
- **Audio:** Web Audio API + MediaRecorder + Microphone input

## Suggested folder structure

```text
.
├─ frontend/
│  ├─ src/
│  │  ├─ components/
│  │  │  ├─ HarmoniumKeys.jsx
│  │  │  └─ WaveformCanvas.jsx
│  │  ├─ hooks/
│  │  │  ├─ useSynth.js
│  │  │  ├─ usePitchDetector.js
│  │  │  ├─ useMetronome.js
│  │  │  └─ useRecorder.js
│  │  ├─ constants.js
│  │  ├─ App.jsx
│  │  ├─ main.jsx
│  │  └─ index.css
│  └─ package.json
├─ backend/
│  ├─ recordings/
│  ├─ src/
│  │  ├─ routes/
│  │  │  ├─ notes.js
│  │  │  ├─ sessions.js
│  │  │  └─ recordings.js
│  │  ├─ app.js
│  │  ├─ notes.js
│  │  ├─ server.js
│  │  └─ store.js
│  └─ package.json
└─ package.json
```

## Features implemented

- Harmonium/piano style key UI
- Keyboard controls (`A W S E D F T G Y H U J K`)
- Real-time synth playback on key press
- Pitch detection from microphone
- Waveform visualization canvas
- Built-in metronome with BPM control
- Record synth output and playback recordings
- Backend session creation
- Backend recording upload + listing

## Quick start (single command)

```bash
npm install
npm run dev
```

- Frontend: Vite URL shown in terminal (usually `http://localhost:5173`)
- Backend: `http://localhost:4000`

## Backend API

- `GET /health`
- `GET /api/notes`
- `POST /api/sessions`
- `POST /api/recordings` (multipart form field: `audio`, optional `sessionId`)
- `GET /api/recordings/:sessionId`
- `GET /recordings/:filename`

## Performance notes

- Uses lightweight hooks and memoized mappings to avoid unnecessary re-renders.
- Pitch detection runs only after explicit microphone enable.
- Audio synthesis avoids loading large sample assets for fast startup.
