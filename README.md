# Ethan Pacheco — Portfolio

A Persona 5-inspired personal portfolio built with React, CSS, and a Canvas animation player. It includes Profile, Projects, Experience, Skills, Résumé, and Contact sections, keyboard navigation, project filters, Quick View, and optional sound and motion.

## Run locally

The prebuilt site is included. With Node.js installed:

```sh
node serve.mjs dist
```

Open http://localhost:4173/. The server binds to `127.0.0.1`. Windows users can also run `Start-Local.ps1`.

## Develop

Use Node.js 22 or newer and npm:

```sh
npm ci
npm run build
npm start
```

For rebuilds while editing, run `npm run dev` in one terminal and `npm start` in another. Refresh the browser after changes. The build preserves the existing animation assets in `dist/assets/`.

## Deploy to Vercel

Import this repository with the repository root as the Root Directory. `vercel.json` selects the **Other** framework preset, installs the locked dependencies with `npm ci --include=dev --include=optional`, runs `npm run build`, and publishes `dist/`. The explicit install includes esbuild and its platform binary even when the deployment environment omits development or optional dependencies by default.

This is a static React site: Vercel serves the compiled JavaScript, CSS, images, and audio. It does not run `serve.mjs`, Python, or C++. The pre-rendered animation frames are already included, so no game installation, rendering tools, backend, database, or environment variables are required for deployment. Hash routes such as `/#profile` work without server rewrites.

## Project structure

- `src/App.jsx`: navigation, modal state, keyboard controls, and settings.
- `src/components/Navigation.jsx`: menu and original bitmap lettering.
- `src/components/Sections.jsx`: portfolio content, filters, and project details.
- `src/components/JokerTransition.jsx`: React wrapper around the Canvas player.
- `src/components/StarBackground.jsx`: code-drawn SVG stars, anchored to each illustration's size and position; CSS animates a single bounded layer without color filters.
- `src/lib/data.js`: education, projects, experience, skills, and links.
- `src/lib/motion.js` and `native-flights.js`: animation sequencing and frame playback.
- `scripts/build.mjs`: esbuild bundle and static-file build.
- `dist/`: prebuilt site and required runtime assets, ready to serve.
- `provenance/`: saved browser checks and Profile frame checks.

Edit the source under `src/`, then rebuild. React controls the interface; the Canvas player manages animation frames without updating React state on every frame. React is bundled locally, with no runtime CDN dependency.

## Controls

Up/Down selects a section; Enter opens it; Escape goes back; Home/End selects the first/last command; Q opens Quick View. Motion preferences are saved locally. Sound starts off.

## Animation and verification

The seven transitions use 297 pre-rendered frames prepared from the installed Steam model, animation clips, and artwork. Python and C++ were used for offline asset preparation; running or rebuilding this interface does not require them. Profile uses clip 45 with the original head and neck transforms, followed by the original Stats illustration. Framing, interpolation, retiming, and the transition into the illustration are custom web adaptations.

Desktop and mobile browser checks passed for all six section animations, keyboard navigation, filtering, project details, Quick View, settings persistence, deep links, and cancellation during delayed frame loading. The same Canvas and player remain mounted across interface updates. See `provenance/REACT-MIGRATION.json`.

The SVG background was compared against the previous filtered PNG in headless Chromium. At 1280×720, Profile playback settled around 16.7 ms between draws; at 2560×1392, the median improved from roughly 93 ms to 53 ms. The larger view still falls short of smooth 60 Hz playback in that environment. These are controlled browser measurements, not guarantees for every device. All six background layouts and the motion toggle were checked on desktop and mobile. Results: `provenance/SVG-STARS.json`.

The résumé download is a text portfolio summary; the Contact section provides an email link to request the latest résumé. Game asset attribution and conversion details are in [ASSETS.md](ASSETS.md).
