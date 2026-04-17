# Café Aurora

An interactive isometric 3D landing page for a fictional coffee shop, built with Three.js, GSAP, and Next.js. Scroll through the story; the scene animates alongside.

## Stack

- [Next.js](https://nextjs.org/) — React framework and deployment
- [Three.js](https://threejs.org/) — 3D rendering
- [GSAP](https://gsap.com/) — scroll-driven animation
- [lil-gui](https://lil-gui.georgealways.com/) — debug controls

## Getting started

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run start` — serve the production build

## Deployment

Push to GitHub and connect the repo in [Vercel](https://vercel.com). Next.js is auto-detected — no extra configuration needed.

## Project structure

```
app/
  layout.jsx          root layout (metadata, global CSS)
  page.jsx            scroll narrative sections (JSX)
  globals.css         global styles and theme variables
components/
  SceneCanvas.jsx     client component — Three.js renderer and scene bootstrap
lib/
  room.js             3D scene setup (models, lights, procedural textures)
  landing.js          scroll-driven camera/animation choreography (GSAP)
  interaction.js      hover tooltips and pointer interactions
public/
  models/             .glb assets (food, furniture, props)
  favicon.svg
  icons.svg
```

## Asset credits

3D models under `public/models/` are from [Kenney](https://kenney.nl/)'s asset packs.
