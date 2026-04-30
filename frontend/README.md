# RootsEgypt Frontend

A specialized genealogy and cultural heritage platform focused on the Nile Valley and Egyptian history. Helps users discover, build, and preserve family histories through interactive family trees, archival records, and oral traditions.

## Project Structure

- `frontend/` - React + Vite application (TypeScript)
- `photos/` - Project imagery assets

## Tech Stack

- **Framework**: React 19
- **Build Tool**: Vite 6 with `@vitejs/plugin-react-swc`
- **Styling**: Tailwind CSS v4 + Framer Motion + GSAP
- **State**: Zustand + TanStack Query v5
- **Data Viz**: D3.js (family tree), Leaflet (maps)
- **Routing**: React Router DOM v7
- **Language**: TypeScript
- **Package Manager**: npm

## Key Features

- Family Tree Builder (D3-based, GEDCOM 5.5.1/7.0 support)
- Genealogy Library (manuscripts, Ottoman records, Coptic registers, Greco-Roman papyri)
- Oral History recording/playback (Audio Library)
- Historical Timeline (Pharaonic to Contemporary)
- Multi-language support: English, French, Arabic (RTL), Spanish
- Mock mode for prototype demos (enabled by default)

## Development

```bash
cd frontend
npm install
npm run dev   # Runs on port 5000
```

## Mock Prototype Mode

The app ships with a full mock layer that intercepts all API calls and returns realistic Egyptian-heritage data from localStorage + in-memory fixtures. Mock mode is **enabled by default**.

### How it works

- **`src/lib/mockApi.ts`** — Axios adapter that intercepts every request and routes it to mock handlers. Enabled when `localStorage.getItem("rootsegypt_mock_mode") !== "false"` (default ON).
- **`src/lib/mockData.ts`** — All fixture data: 7 GEDCOM family trees, 20+ books/documents, 28 gallery images, 8 articles, 15 audio tracks, 10 users, admin stats, notifications, activity feed.
- **`src/lib/seedMockStorage.ts`** — Seeds localStorage with articles, comments, like/share counts, and 15 Egyptian audio tracks on first load (version key: `rootsegypt_mock_seed_v5`).
- **`src/components/BackendPanel.tsx`** — Floating panel (bottom-right) to toggle mock mode, set real backend URL (default `http://localhost:5000`), and clear localStorage.

### Demo credentials (click-to-fill on login page)

| Role       | Email                     | Password    |
| ---------- | ------------------------- | ----------- |
| Admin      | admin@rootsegypt.com      | password123 |
| Researcher | researcher@rootsegypt.com | research123 |
| Member     | demo@rootsegypt.com       | demo123     |

Any other email/password combination → auto-creates a Member account.

### Mock Data Coverage

| Content      | Count | Notes                                                                                                                                |
| ------------ | ----- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Family Trees | 7     | 5 modern Egyptian families + Ottoman-Cairo (1720-1890) + Greco-Roman Alexandria (30 BCE – 350 CE) — all with full valid GEDCOM 5.5.1 |
| Books        | 15+   | Covers genealogy guides, Ottoman archives, Coptic registers, Roman papyri                                                            |
| Documents    | 8+    | Ottoman tax registers, census records, court sijill, papyrus contracts                                                               |
| Gallery      | 28    | Ottoman firmans, Roman papyri, family portraits, Nubian village photos                                                               |
| Articles     | 8     | Genealogy guides, Ottoman history, Nubian heritage, Roman papyri research                                                            |
| Audio Tracks | 15    | Recitations, poetry, lectures, interviews, music — Egyptian heritage themes                                                          |
| Users        | 10    | Including admin, researcher, and member roles                                                                                        |

## Configuration

- `frontend/vite.config.js` — Vite config (port 5000, host 0.0.0.0)
- `frontend/.env.example` — Environment variable template
- `frontend/tailwind.config.js` — Tailwind configuration
- `frontend/tsconfig.json` — TypeScript configuration

## Deployment

Build the application:

```bash
cd frontend
npm run build
```

The built files will be in `frontend/dist/` directory.

## Real Backend Integration

When connecting a real backend:

1. Open the BackendPanel (bottom-right floating button)
2. Disable mock mode
3. Set the API URL to your backend (e.g. `http://localhost:5000`)
4. Save — all API calls will go to the real backend
