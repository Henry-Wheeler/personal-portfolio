# Henry Wheeler — Personal Portfolio

A Wii Menu–inspired personal portfolio built with React and Three.js. Each "channel" on the home screen opens a full-screen experience styled after a different Wii application.

**Live:** [henrywheeler.dev](https://henrywheeler.dev) <!-- update with your Vercel URL -->

---

## Channels

| Channel | Wii Inspiration | Description |
|---------|----------------|-------------|
| **About Mii** | Mii Channel | Rigged 3D Mii character walks in, waves, and types out a personal intro in a thought bubble. Background Miis populate the plaza. |
| **Skills Forecast** | Forecast Channel | Five-card weather forecast layout mapping technical and soft skills to weather icons. Toggle between hard and soft skills via the top nav. |
| News Channel | News Channel | Scrolling ticker + expandable timeline of experience and education. *(In progress)* |
| Project Plaza | Wii Plaza | Project showcase — D3tection, InfoCraftic, and more. *(Planned)* |

---

## Tech

- **React + Vite** — UI and build tooling
- **Three.js / @react-three/fiber** — 3D Mii rendering, skeletal animation, and bone-driven walk cycle
- **framer-motion** — channel open/close transitions and typewriter effect
- **M PLUS Rounded 1c** — closest open-source match to the Wii's FOT-RodinBokutoh Pro typeface

The entire UI is authored at 1920×1080 and scaled to fit any viewport via `transform: scale()`.

---

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).
