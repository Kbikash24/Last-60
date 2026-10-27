# LAST 60

One minute. One life. One more run. A browser arcade survival game built with Next.js, TypeScript, Tailwind CSS and Phaser.

## Run

```bash
npm install
npm run dev     # http://localhost:3000
npm run lint
npx tsc --noEmit
npm run build
```

## Structure

- `app/` – routes (`/` menu, `/game`)
- `components/` – React UI (menu, HUD, countdown, results, share)
- `game/` – Phaser scene, entities, and systems (difficulty, spawner, scoring); `controller.ts` bridges the scene to React
- `lib/` – `localStorage` stats and the WebAudio synth

## Scoring

10 points per second survived, +10 per near miss (+5 more at a streak of 3 or more; a streak resets after 4 s without one), +25 per completed phase, +100 for surviving all 60 s.

## Manual test checklist

- [ ] Arrow keys and WASD move the player; it never leaves the arena; diagonals are not faster.
- [ ] Touch: dragging anywhere steers; releasing stops; page does not scroll or zoom.
- [ ] 3-2-1 countdown, then GO; the timer starts only after GO.
- [ ] Every hazard shows a warning before entering; nothing appears on the player.
- [ ] Phases change every 10 s (banner, border colour, HUD label).
- [ ] Collision ends the run exactly once and shows Game Over.
- [ ] Victory screen shows at 60 s with a score of at least 850 (600 survival + 150 phases + 100 bonus).
- [ ] Retry (button or R) fully resets timer, score, hazards and warnings.
- [ ] P / Esc / pause button pauses and resumes; switching tabs auto-pauses.
- [ ] Mute toggle silences sound and persists after refresh.
- [ ] Personal best and stats persist after refresh.
- [ ] Share uses the native sheet where available, otherwise copies text.
- [ ] Rotate or resize the window: the canvas rescales and stays playable.
- [ ] With "reduce motion" enabled: no shake, no particles, no pulsing warnings.
