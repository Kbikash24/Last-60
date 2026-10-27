# LAST 60 — Complete Game Blueprint & Build Prompt

> **Product:** LAST 60 — One Minute. One Life. One More Run.  
> **Type:** Browser-based 2D arcade survival game  
> **Primary goal:** Build a polished, responsive, replayable web game with a clear path to ethical monetization.  
> **Recommended MVP stack:** Next.js + TypeScript + Phaser 3 + Tailwind CSS  
> **Hosting target:** Vercel for the website; game distribution platforms can be evaluated later.

---

## 1. Product Vision

LAST 60 is a fast-paced arcade survival game. The player controls a character in an arena, avoids obstacles, survives for up to 60 seconds, and tries to beat their previous score.

The game should feel polished, responsive, easy to understand, and rewarding to master. Design for **healthy replayability**, not manipulative or gambling-like engagement.

### Core promise

**One minute. One challenge. One more chance to beat your best.**

### Target platforms
- Desktop browsers
- Android mobile browsers
- Other modern mobile browsers, subject to performance testing

### Primary controls
- Desktop: Arrow keys and WASD
- Mobile: Touch controls or a virtual joystick
- Include pause/resume and sound controls where appropriate

---

## 2. Core Gameplay Loop

1. Player opens the landing page.
2. Player presses **Play**.
3. A short control hint and 3-second countdown appear.
4. A 60-second survival run begins.
5. Player dodges obstacles and earns points.
6. Difficulty changes in clear phases.
7. A collision ends the run, or surviving 60 seconds triggers victory.
8. Results show survival time, score, and personal best.
9. Player can retry instantly or share their result.

Do not require login to play the basic game.

---

## 3. Six Gameplay Phases

| Elapsed time | Phase | Design |
|---|---|---|
| 0–10 seconds | Warm-up | Slow, readable obstacles; teach movement |
| 10–20 seconds | Speed Up | Slightly faster obstacles |
| 20–30 seconds | Crossfire | Multiple directions and combinations |
| 30–40 seconds | Chaos | Moving barriers and changing patterns |
| 40–50 seconds | Survival | Narrower safe zones and harder combinations |
| 50–60 seconds | Final Rush | Fast but readable patterns; intense finish |

### Fairness rules
- Difficulty should rise gradually.
- Never spawn an unavoidable obstacle on top of the player.
- Give players enough warning to react.
- Random patterns must be constrained and tested for fairness.
- Do not make controls unpredictable.
- Respect reduced-motion preferences where practical.
- On reaching 60 seconds, trigger a clear victory state.

An optional endless bonus mode can be added after the core 60-second mode is stable.

---

## 4. Scoring

Use a transparent, easy-to-understand scoring formula.

Suggested initial values for testing:
- Survival: 10 points per second
- Near miss: +10 points
- Consecutive successful dodges: +5 points per qualifying dodge
- Completing a 10-second phase: +25 points
- Surviving all 60 seconds: +100 points

These are initial balancing values, not final values. Avoid awarding bonuses repeatedly due to a single event. Add cooldowns or one-time event IDs where needed.

### Personal statistics
- Best score
- Longest survival time
- Total runs
- Completed 60-second runs
- Best dodge streak

For the first MVP, save personal best and basic statistics in `localStorage`. Clearly explain that local data may be lost when browser data is cleared. Use a database only when online features are added.

---

## 5. Visual and Audio Direction

### Recommended visual style
Premium neon arcade:
- Dark background
- Bright cyan and purple accents
- Readable geometric player and obstacle shapes
- Subtle glow and particles
- Smooth transitions
- Strong contrast and legible HUD
- Responsive layout

Avoid excessive effects that make hazards difficult to see.

### Audio
- Short, optional UI sounds
- Subtle phase-transition cue
- Collision sound
- Victory sound
- Mute toggle enabled
- Do not autoplay loud audio before user interaction

### Accessibility
- Clear controls and readable text
- Keyboard support
- Mobile touch controls
- Sound toggle
- Avoid relying on color alone to communicate hazards
- Support reduced-motion preferences where practical

---

## 6. Recommended Technology Stack

| Area | Technology | Purpose |
|---|---|---|
| Web app | Next.js + TypeScript | Landing page, routes, UI |
| Game engine | Phaser 3 | Canvas rendering, input, game loop, collisions |
| Styling | Tailwind CSS | Responsive UI |
| Local persistence | `localStorage` | MVP personal best and preferences |
| Online database, later | Supabase / PostgreSQL | Profiles, scores, leaderboard |
| Hosting | Vercel | Website deployment |
| Analytics, later | Privacy-conscious analytics | Retention and gameplay events |

Use a browser-only/client-side component to initialize Phaser. Do not initialize Phaser during server-side rendering. Ensure the Phaser instance and event listeners are cleaned up when the component unmounts.

---

## 7. Suggested Project Structure

```text
last-60/
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   ├── globals.css
│   ├── game/
│   │   └── page.tsx
│   └── leaderboard/
│       └── page.tsx
├── components/
│   ├── GameCanvas.tsx
│   ├── MainMenu.tsx
│   ├── GameHUD.tsx
│   ├── Countdown.tsx
│   ├── ResultsScreen.tsx
│   └── ShareScore.tsx
├── game/
│   ├── config.ts
│   ├── scenes/
│   │   ├── BootScene.ts
│   │   ├── MenuScene.ts
│   │   └── SurvivalScene.ts
│   ├── entities/
│   │   ├── Player.ts
│   │   └── Obstacle.ts
│   ├── systems/
│   │   ├── DifficultyManager.ts
│   │   ├── ObstacleSpawner.ts
│   │   ├── CollisionSystem.ts
│   │   └── ScoreManager.ts
│   └── types.ts
├── lib/
│   ├── storage.ts
│   └── analytics.ts
└── public/
    ├── audio/
    └── assets/
```

This is the target structure, not a requirement to create every file on day one. Keep the initial implementation simple, then split modules as complexity grows.

---

## 8. Build Roadmap

### Milestone 1 — Core playable prototype
- Set up Next.js, TypeScript, Tailwind CSS, and Phaser.
- Create a responsive landing page.
- Initialize Phaser only on the client.
- Implement player movement.
- Keep the player inside the arena.
- Add obstacle spawning and collision.
- Add elapsed-time tracking and the 60-second end condition.
- Add game-over and victory states.
- Add restart.

**Exit criteria:** A player can start, move, dodge obstacles, lose or win, and restart without refreshing the whole page.

### Milestone 2 — Gameplay polish
- Implement six difficulty phases.
- Add fair, constrained obstacle patterns.
- Add score calculation.
- Add HUD and countdown.
- Add particles, transitions, and optional sound.
- Add responsive keyboard and mobile controls.
- Test frame rate and memory use on common mobile devices.

**Exit criteria:** The game is understandable, fair, responsive, and enjoyable to replay.

### Milestone 3 — Personal progression and sharing
- Save personal best locally.
- Track total runs and longest survival.
- Create a results card.
- Add Web Share API where supported, with copy-link fallback.
- Add a daily challenge using a consistent challenge seed if feasible.

**Exit criteria:** Progress persists locally, and a player can share a result.

### Milestone 4 — Public launch
- Test desktop and mobile layouts.
- Test pause/resume and tab visibility behavior.
- Test reset/retry for stale timers and event listeners.
- Add appropriate privacy and analytics disclosures.
- Deploy to Vercel.
- Collect feedback and review gameplay analytics.

**Exit criteria:** Public build works reliably, has no known critical bugs, and provides a feedback path.

### Milestone 5 — Online features (only after MVP validation)
- Supabase authentication, optional
- Server/database-backed leaderboard
- Server-side score validation and rate limiting
- Daily and weekly challenge boards
- Friend challenge links
- Ghost replay, if performance and data size permit
- Cosmetic unlocks

Do not trust client-submitted scores blindly. Add server-side validation and abuse controls before running a public leaderboard.

---

## 9. Replayability Features

### MVP
- Instant retry
- Personal best
- Six phases
- Clear score feedback
- Shareable results

### Later
- Daily challenge
- Weekly leaderboard
- Friend challenge links
- Ghost replay of a previous run
- Unlockable visual themes
- Additional obstacle sets and modes

Keep challenges skill-based and fair. Do not use deceptive scarcity, pressure tactics, loot boxes, or gambling-like reward loops.

---

## 10. Monetization Plan

Do not add ads before the game is playable and early user feedback indicates that the core loop is enjoyable.

### Stage 1: Validate
- Free game
- No mandatory login
- Minimal analytics
- Collect qualitative feedback

### Stage 2: Improve retention
- Daily challenges
- Better onboarding
- Shareable results
- Cosmetic unlocks

### Stage 3: Test monetization
Possible options, depending on platform rules:
- Platform-approved ads between runs
- Optional rewarded ads for noncompetitive cosmetic rewards
- Cosmetic theme packs
- Premium challenge packs
- Relevant sponsorships after an audience develops

Never show ads mid-run or obscure critical controls. Avoid making paid upgrades necessary to compete. Review the current policies of every ad network and distribution platform before integrating it.

### Illustrative ad revenue formula

`Estimated gross ad revenue = monetized impressions / 1,000 × effective revenue per 1,000 impressions`

Any example RPM is only an assumption. Real revenue varies by audience geography, ad format, fill rate, platform share, and advertiser demand. Traffic and retention are not guaranteed.

---

## 11. Analytics and Success Metrics

Measure only what is necessary and provide appropriate privacy disclosures.

Suggested events:
- `game_start`
- `run_complete`
- `run_failed`
- `retry_clicked`
- `phase_reached`
- `challenge_shared`

Suggested metrics:
- First-run completion rate
- Retry rate
- Day-1 and Day-7 retention
- Average session duration
- Share rate
- Crash/error rate
- Revenue per 1,000 monetized impressions, after monetization is enabled

Use results to improve controls, fairness, onboarding, and challenge quality. Do not assume a specific retention rate or revenue outcome in advance.

---

## 12. QA Checklist

### Gameplay
- [ ] Keyboard controls work.
- [ ] Mobile touch controls work.
- [ ] Player stays inside the arena.
- [ ] Collision ends a run exactly once.
- [ ] Timer and score are consistent.
- [ ] Victory triggers at 60 seconds.
- [ ] Restart resets all game state.
- [ ] No duplicate timers or event handlers.
- [ ] Obstacles are avoidable and fair.

### Performance
- [ ] Test common mobile browsers.
- [ ] Avoid excessive particles and expensive effects.
- [ ] Test resizing and orientation changes.
- [ ] Handle browser tab visibility sensibly.
- [ ] Clean up Phaser instances and listeners.
- [ ] Optimize asset sizes.

### Product
- [ ] First-time instructions are brief and clear.
- [ ] Personal best persists.
- [ ] Share works where supported.
- [ ] Mute control works.
- [ ] UI remains readable on small screens.
- [ ] Privacy disclosures are appropriate.

### Online features, when added
- [ ] Validate score submissions on the server.
- [ ] Add rate limits and abuse controls.
- [ ] Protect database access with appropriate policies.
- [ ] Never expose service-role secrets in frontend code.

---

## 13. Suggested 30-Day Schedule

| Days | Focus | Deliverable |
|---|---|---|
| 1–7 | Core game | Movement, obstacles, collisions, timer |
| 8–14 | Polish | Phases, scoring, UI, sound, mobile support |
| 15–21 | Replay features | Personal best, results sharing, daily challenge |
| 22–30 | Testing and launch | QA, deployment, feedback, analytics |

This is a planning target, not a guarantee. Prioritize a reliable playable game over an unfinished list of features.

---

# 14. MASTER BUILD PROMPT

Copy the prompt below into your coding agent (for example, an IDE agent) to build the project. Ask it to work in small, testable milestones rather than attempting the entire game in one unverified step.

---

## Prompt: Build LAST 60

You are a senior browser-game developer, game designer, UI/UX designer, and TypeScript engineer.

Build **LAST 60**, a polished, responsive, browser-based 2D arcade survival game using **Next.js, TypeScript, Tailwind CSS, and Phaser 3**.

### Product goal
Create a playable, visually polished game that is easy to understand, skill-based, fair, and replayable. The core run lasts 60 seconds. Players move around an arena, dodge obstacles, earn points, and try to beat their personal best. Optimize for player enjoyment and mastery rather than manipulative engagement.

### Technical requirements
1. Use the existing repository and inspect its current structure before changing files.
2. If the repository is empty, set up Next.js with TypeScript and Tailwind CSS.
3. Use Phaser 3 for gameplay and Next.js for surrounding UI.
4. Initialize Phaser only in the browser; prevent server-side rendering errors.
5. Clean up Phaser instances, timers, and event listeners on unmount/restart.
6. Use reusable components and clear TypeScript types.
7. Avoid unnecessary dependencies.
8. Make the game responsive for desktop and mobile.
9. Do not add authentication, online database, ads, or payments in the first milestone.
10. Do not leave core gameplay as placeholders or fake buttons.

### Visual direction
Use a premium neon arcade aesthetic:
- Dark arena background
- Cyan and purple accents
- Clear geometric player and obstacles
- Smooth movement and transitions
- Restrained particles and glow
- High-contrast timer and score
- Polished landing page, HUD, countdown, and results screen
- Responsive mobile layout

Use procedural geometric graphics initially if custom assets are unavailable. Do not depend on external images or paid assets to make the core game work.

### Core gameplay
1. Create a player controlled with arrow keys and WASD.
2. Add mobile touch controls or a virtual joystick.
3. Constrain the player to the arena.
4. Spawn moving obstacles using fair, constrained patterns.
5. Detect collisions reliably.
6. Start each run with a 3-second countdown.
7. Run a 60-second survival timer based on elapsed game time, not a fragile chain of `setInterval` callbacks.
8. Increase difficulty across six phases:
   - 0–10 seconds: Warm-up
   - 10–20 seconds: Speed Up
   - 20–30 seconds: Crossfire
   - 30–40 seconds: Chaos
   - 40–50 seconds: Survival
   - 50–60 seconds: Final Rush
9. Do not spawn unavoidable obstacles or place obstacles directly on top of the player.
10. Collision ends the run once and displays the results screen.
11. Surviving 60 seconds triggers victory.
12. Implement scoring with clearly defined, testable rules.
13. Add instant retry without reloading the page.
14. Save personal best and basic stats in `localStorage`.
15. Add sound mute and pause/resume controls.
16. Provide a share-result button using Web Share API when available and a copy-link fallback.

### Required screens
- Landing/main menu with game title, short instructions, and Play button
- Gameplay HUD with timer, score, phase, and pause/mute controls
- Countdown overlay
- Game-over screen
- Victory screen
- Results summary with survival time, score, and personal best
- Responsive mobile controls

### Suggested modules
- `GameCanvas`
- `BootScene`
- `MenuScene` if needed
- `SurvivalScene`
- `Player`
- `Obstacle`
- `DifficultyManager`
- `ObstacleSpawner`
- `ScoreManager`
- `storage` utilities

Use a structure appropriate to the existing repository. Do not over-engineer the first version.

### Reliability requirements
- Ensure collision and game-over events execute only once.
- Reset all state on retry.
- Prevent duplicate timers, duplicate input listeners, and stale React state.
- Handle window resize and browser-tab visibility.
- Avoid excessive particle effects and unnecessary per-frame allocations.
- Keep the player and hazards visible against the background.
- Add useful error handling and clear code comments where needed.
- Make keyboard controls accessible and touch controls usable on small screens.

### Working process
Work in milestones:

**Milestone 1:** Inspect the repository, summarize the plan, and build the complete core playable game.

**Milestone 2:** Run available lint, type-check, and build commands. Fix errors rather than merely listing them. If a command is unavailable, say so honestly.

**Milestone 3:** Test game states and reset behavior. Add a concise manual testing checklist.

**Milestone 4:** Polish responsive design, animations, and accessibility.

After each milestone:
- List files created or changed.
- Explain what now works.
- Report commands run and their actual outcomes.
- List remaining issues honestly.
- Do not claim a build or test passed unless you actually ran it.

### Scope boundaries
Do not implement online leaderboards, authentication, payments, or advertising until the core game is stable. Do not expose secrets in frontend code. Do not invent performance or revenue metrics.

### Definition of done
A user can open the website, start a game, control the player, dodge obstacles, experience six difficulty phases, lose or survive 60 seconds, see an accurate result, retry immediately, and retain their personal best after a refresh. The interface works on desktop and mobile, and the project passes the available checks.

Begin by inspecting the existing repository. Then implement Milestone 1 end to end.

---

## 15. Final Development Principle

Build the smallest complete version first:

**Playable core → fair difficulty → polished feedback → repeat-play features → real user testing → monetization.**

Do not spend weeks building accounts, leaderboards, ads, and cosmetics before proving that the basic one-minute game is fun.
