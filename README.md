# Laptop Harmonium

A modern full-stack web app with a responsive React + Tailwind frontend and Node.js + Express backend for musical notes.

## Project structure

- `frontend/` — UI with clickable harmonium keys and synthesized note playback.
- `backend/` — API server that serves musical note data with CORS enabled.

## Run locally

### 1) Backend

```bash
cd backend
npm install
npm run dev
```

Server starts on `http://localhost:4000`.

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

Set optional API base URL if needed:

```bash
# frontend/.env
VITE_API_URL=http://localhost:4000
```

Then open the Vite URL shown in your terminal.
