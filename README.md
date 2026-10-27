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

- `app/` – routes (`/` menu, `/game`, `/leaderboard`, `/api/*`)
- `components/` – React UI (menu, HUD, countdown, results, share)
- `game/` – Phaser scene, entities, and systems (difficulty, spawner, scoring); `controller.ts` bridges the scene to React
- `lib/` – `localStorage` stats and the WebAudio synth

## Leaderboard setup

The global leaderboard uses Supabase through server-only API routes (`app/api`). Without the variables below the game still works and the leaderboard simply stays hidden.

1. Create a Supabase project and run `supabase/schema.sql` in the SQL editor.
2. Set these environment variables (Vercel: Project Settings > Environment Variables; locally: `.env.local`, which is git-ignored):
   - `SUPABASE_URL` – the project URL
   - `SUPABASE_SERVICE_ROLE_KEY` – the service-role key (server only, never expose it to the browser)
   - `RUN_TOKEN_SECRET` – any long random string, used to sign run-start tokens
3. Redeploy.

Scores are checked on the server against the scoring rules and the time a run actually took, and each run token works once. This stops casual tampering but cannot make a client-side game fully cheat-proof.

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
