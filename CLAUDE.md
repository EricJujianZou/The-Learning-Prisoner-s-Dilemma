# CLAUDE.md — The Prisoner's Game

## Project Overview

A browser game where players face 5 mystery opponents in the Prisoner's Dilemma, then fight a Q-learning AI boss that adapts in real time. Interrogation room aesthetic rendered in first-person POV with CSS 3D perspective. No image assets. Everything is code.

**Audience:** People curious about game theory, strategy, and AI. Ranges from total beginners to CS nerds. The game teaches through play, not lectures.

**Tone:** Dark, tense, minimal. Like you're sitting in a concrete room under fluorescent light and someone is watching you through glass. Not cyberpunk. Not neon. Not startup. Institutional and cold with moments of warmth when you win.

---

## Tech Stack

- **Framework:** React 18+ (single page app, no routing library needed, state machine drives screens)
- **Build:** Vite 5+
- **Styling:** Tailwind CSS 3.4+ with custom config (no component library, everything hand-styled)
- **Fonts:** Google Fonts (loaded via `@import` in CSS, not `<link>`)
- **Deployment:** Vercel (static export)
- **Storage:** `window.storage` API for shared leaderboard, React state for game session
- **No backend. No database. No auth. No analytics.**

---

## Typography

Two fonts only. Load both from Google Fonts.

### Headings / Display: `Space Grotesk`

- Weights: 500, 700
- Use for: title screen, strategy reveal names ("THE MIRROR"), phase indicators, score displays, button labels
- Letter-spacing: -0.02em on large sizes (32px+), 0 on medium sizes
- Never italic. Always uppercase for strategy names and level labels.

### Body / Data / Narrator: `IBM Plex Mono`

- Weights: 300, 400, 500
- Use for: all numbers, scores, round counters, Q-table data, The Chungus narrator text, payoff matrix values, round history labels, instructions
- Letter-spacing: 0.01em
- The Chungus lines: weight 300, italic, gold color (#D4A843)
- Data/scores: weight 500
- Body text: weight 400

### Rules

- No font below 12px rendered size on any screen
- Monospace (IBM Plex Mono) for anything that is a number, a data point, or spoken by The Chungus
- Sans-serif (Space Grotesk) for anything that is a label, a heading, or a button
- Line height: 1.4 for body, 1.1 for headings, 1.6 for narrator text
- Never use Inter, Roboto, Arial, system-ui, Outfit, JetBrains Mono, or any other font

---

## Color System

Every color must be defined as a CSS custom property in `:root` and referenced via Tailwind config extension. Never use raw hex in component code.

```css
:root {
  /* Backgrounds */
  --color-void: #07070b; /* deepest background, corridor, edges */
  --color-room: #0c0c14; /* interrogation room floor/walls */
  --color-surface: #111119; /* cards, panels, desk surface */
  --color-surface-raised: #18182a; /* elevated elements, clipboard, buttons at rest */

  /* Glass / Mirror */
  --color-glass: #1a2a3a; /* one-way mirror base */
  --color-glass-tint: rgba(34, 90, 140, 0.12); /* mirror reflection overlay */
  --color-glass-edge: rgba(100, 160, 220, 0.15); /* mirror border glow */

  /* Actions */
  --color-cooperate: #2db563; /* green, cooperate button, C indicators */
  --color-cooperate-glow: rgba(
    45,
    181,
    99,
    0.25
  ); /* button glow, hover state */
  --color-cooperate-dim: #1a5c38; /* cooperate button border at rest */
  --color-defect: #d94545; /* red, defect button, D indicators */
  --color-defect-glow: rgba(217, 69, 69, 0.25);
  --color-defect-dim: #6b2222;

  /* Accent */
  --color-accent: #5b5fe6; /* UI elements, highlights, progress indicators */
  --color-accent-bright: #7b7fff; /* hover states, active elements */

  /* Narrator */
  --color-chungus: #d4a843; /* The Chungus gold, narrator text, special highlights */
  --color-chungus-dim: rgba(
    212,
    168,
    67,
    0.15
  ); /* background behind narrator text */

  /* Text */
  --color-text-primary: #e0e0ec; /* main readable text */
  --color-text-secondary: #6e6e8a; /* labels, placeholders, muted info */
  --color-text-ghost: #3a3a52; /* disabled states, empty round slots */

  /* Borders */
  --color-border: #222236; /* default borders */
  --color-border-light: #2e2e48; /* subtle dividers */

  /* Feedback */
  --color-win: #2db563; /* same as cooperate, used for win states */
  --color-lose: #d94545; /* same as defect, used for lose states */
  --color-neutral: #6e6e8a; /* ties, unknown states */
}
```

### Usage Rules

- Background layering: void → room → surface → surface-raised. Never skip a level.
- The cooperate/defect colors are ONLY for game actions. Do not use green/red for generic success/error states outside the game context.
- The Chungus gold (#D4A843) is reserved exclusively for narrator text and leaderboard position highlights. Do not use it for buttons, borders, or decorative elements.
- Glass colors are only for the mirror panel. Do not use blue-tinted colors elsewhere.
- All text on `--color-void` or `--color-room` backgrounds must be `--color-text-primary`. Never `--color-text-secondary` on the darkest backgrounds (contrast ratio will fail).

---

## Layout Philosophy

### Perspective and Depth

The entire game uses a CSS perspective container to create the interrogation room POV.

```css
.room-container {
  perspective: 1200px;
  perspective-origin: 50% 45%; /* slightly above center, looking slightly down */
}
```

Elements at different "depths" use `translateZ()` to position them in the 3D space. The mirror is at z=0 (base plane). Buttons are at z=50px (closer to player). Wall labels are at z=-20px (slightly behind the mirror plane). This is subtle. Do not make it extreme or it looks like a bad 90s website.

### Spatial Rules

- Max content width: 720px for the game area, 480px for the clipboard/leaderboard
- Mobile: 100vw with 16px horizontal padding
- Vertical rhythm: 8px base unit. All spacing is multiples of 8.
- The mirror panel takes up approximately 60% of viewport height on desktop, 50% on mobile
- Cooperate and defect buttons are side by side with 16px gap. Each takes 50% minus gap.
- On mobile (< 480px), buttons are still side by side (left thumb / right thumb), minimum height 56px
- Round history strip: fixed at bottom of the game area, max 10 or 20 slots, evenly distributed

### Grid

No CSS Grid for the game layout. Use flexbox for the room composition (vertical: wall labels → mirror → desk/buttons → history strip). The payoff matrix on the mirror is a 2x2 CSS Grid.

The leaderboard is a simple flex column. The landing page corridor is a single centered flex column with perspective.

### Whitespace

Generous inside the mirror panel (32px padding). Tight on the desk surface and history strip (8px gaps). The contrast between the open mirror space and the dense desk creates visual hierarchy.

---

## Animation Rules

### What Animates

- **Screen transitions:** Fade + translateY. Landing → game: 400ms ease-out. Between levels: 300ms. Never instant cuts.
- **Door opening (landing → game):** Scale from 1 → 1.05 on the door element, opacity 1 → 0, then the room fades in. Total: 600ms.
- **Button press feedback:** Scale 0.97 on active, 100ms. Background color fill from border-only to filled, 150ms.
- **Round result reveal:** Fade in 200ms with translateY(-4px → 0). Staggered: your move first (0ms delay), their move second (100ms delay), score third (200ms delay).
- **Strategy reveal (post-level):** The name types in character by character, 40ms per character. Monospace font makes this look like a terminal printout.
- **Chungus text:** Fade in 500ms. Slow. Deliberate. Like someone speaking carefully.
- **Mirror transition (gameplay → analysis):** Crossfade, 400ms. The matrix fades out, analysis fades in. No slide. No flip. Just a dissolve.
- **Clipboard (leaderboard):** Slides up from bottom, 400ms ease-out. Can be dismissed by sliding back down.
- **Phase shift (RL boss round 10 → 11):** Brief screen flicker (opacity 1 → 0.7 → 1 over 200ms), then color temperature shifts. Not dramatic. Subtle.
- **Q-table values updating (post-game reveal only):** Numbers count up from 0 to their actual value, 300ms per cell, staggered by 50ms per row. Use `requestAnimationFrame`, not CSS transitions for number interpolation.

### Easing

- All transitions: `cubic-bezier(0.25, 0.1, 0.25, 1)` (smooth deceleration)
- Button presses: `cubic-bezier(0.4, 0, 0.2, 1)` (snappy)
- Clipboard slide: `cubic-bezier(0.16, 1, 0.3, 1)` (fast start, gentle stop)

### What Does NOT Animate

- The payoff matrix. It's always there, always static. Stability communicates reliability.
- Score numbers during gameplay. They update instantly. No counting animation mid-game (it would slow the pace).
- Round history markers. They appear instantly when a round completes. Snap, not fade.
- Anything on the landing page below the fold (leaderboard preview). Static. No scroll animations. No parallax.

### Library

Do not import Framer Motion, GSAP, or any animation library. Use CSS transitions and keyframes for everything. Use `requestAnimationFrame` only for the number counting effect on Q-table reveal. The project is small enough that a library adds bloat without value.

---

## Backgrounds and Texture

### The Corridor (Landing Page)

```css
.corridor {
  background:
    radial-gradient(
      ellipse at 50% 30%,
      rgba(30, 40, 60, 0.3) 0%,
      transparent 60%
    ),
    linear-gradient(180deg, #07070b 0%, #0c0c14 100%);
}
```

Add a faint grid pattern on the walls using a repeating-linear-gradient at very low opacity (0.03):

```css
.corridor-walls {
  background-image:
    repeating-linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.03) 0px,
      transparent 1px,
      transparent 60px
    ),
    repeating-linear-gradient(
      0deg,
      rgba(255, 255, 255, 0.03) 0px,
      transparent 1px,
      transparent 60px
    );
}
```

### The Room (Game Stage)

```css
.room {
  background:
    radial-gradient(
      ellipse at 50% 20%,
      rgba(40, 50, 70, 0.2) 0%,
      transparent 50%
    ),
    var(--color-room);
}
```

Vignette effect on the room container:

```css
.room::after {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse at center,
    transparent 50%,
    rgba(7, 7, 11, 0.6) 100%
  );
  pointer-events: none;
}
```

### The Mirror

```css
.mirror {
  background:
    linear-gradient(
      170deg,
      rgba(20, 50, 80, 0.15) 0%,
      rgba(10, 20, 40, 0.05) 100%
    ),
    var(--color-glass);
  border: 1px solid var(--color-glass-edge);
  box-shadow:
    0 0 40px rgba(34, 90, 140, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(1px);
}
```

### The Desk Surface

A subtle horizontal gradient suggesting a flat surface receding in perspective:

```css
.desk {
  background: linear-gradient(
    180deg,
    var(--color-surface) 0%,
    var(--color-surface-raised) 100%
  );
  border-top: 1px solid var(--color-border);
}
```

### RL Boss Phase 2 Shift

When the RL boss enters phase 2, apply a CSS filter to the room container:

```css
.room--phase2 {
  filter: hue-rotate(-10deg) brightness(0.95);
}
.room--phase2 .mirror {
  box-shadow:
    0 0 60px rgba(34, 90, 140, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.03);
}
```

### Noise / Grain

Do NOT add film grain or noise texture. The aesthetic is institutional and clean, not analog or vintage. The darkness and the glass reflections provide enough visual interest. Grain would fight the precision of the monospace typography and the data-display elements.

---

## What to Avoid

These patterns will ruin the aesthetic. Do not use any of them.

- **Purple gradient hero sections.** No gradient backgrounds on large surfaces. The background is dark and flat with subtle radial light spots only.
- **Rounded-2xl on everything.** Max border-radius is 8px for panels and 6px for buttons. The mirror has 4px. The clipboard has 2px. Roundness is institutional, not friendly.
- **Card soup.** Do not decompose the UI into generic card components with shadows and borders. The room IS the layout. Elements are positioned in 3D space, not floated in cards.
- **Gradient text.** Never. Text is solid colors only.
- **Blur-heavy glassmorphism.** The mirror has `blur(1px)` which is barely perceptible. That's the max. No frosted glass panels, no blur(20px), no backdrop-filter parties.
- **Drop shadows on text.** Never.
- **Hover scale transforms on non-buttons.** Only buttons scale. Nothing else.
- **Rainbow or multi-color accents.** Two action colors (green, red), one accent (indigo), one narrator color (gold). That's it. No teal, no orange, no pink anywhere.
- **Loading skeletons or shimmer effects.** The game loads instantly (it's static). If something takes time, show nothing, then show the thing. No intermediate states.
- **Emoji anywhere.** Not in the UI, not in The Chungus text, not in the leaderboard.
- **"Powered by" or "Built with" badges.** Nothing.
- **Floating action buttons, toast notifications, modal dialogs.** None. The clipboard is the only overlay and it's a slide-up sheet, not a modal.
- **Any font other than Space Grotesk and IBM Plex Mono.**
- **White backgrounds or light-mode anything.** There is no light mode. The lightest color in the entire app is `--color-text-primary` (#E0E0EC) and it's only used for text.
- **Stock illustrations, SVG decorations, emoji icons, icon libraries.** No icons at all except possibly a simple chevron (>) for list items, rendered in text. No Font Awesome, no Lucide, no Heroicons.
- **Tailwind's default color palette names.** Do not use `bg-gray-800` or `text-blue-500`. Every color references the custom CSS variables through Tailwind config extension.

---

## File Structure

```
prisoners-game/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
├── CLAUDE.md
├── public/
│   └── (empty, no static assets)
├── src/
│   ├── main.jsx
│   ├── index.css              (CSS variables, font imports, global styles, perspective setup)
│   ├── App.jsx                (state machine, screen transitions, main container)
│   ├── game/
│   │   ├── GameEngine.js      (round logic, payoff calculation, opponent dispatch)
│   │   ├── opponents.js       (all 5 hardcoded strategy functions + Q-learner)
│   │   ├── qlearner.js        (Q-table init, update, choose, strategy identification)
│   │   └── analysis.js        (pivot detection, win condition checks, stats computation)
│   ├── screens/
│   │   ├── Landing.jsx        (the door, corridor, start button, leaderboard preview)
│   │   ├── GameRoom.jsx       (the interrogation room, mirror, buttons, round history)
│   │   ├── PostLevel.jsx      (analysis overlay on the mirror, strategy reveal)
│   │   └── Leaderboard.jsx    (clipboard slide-up, score entry, full rankings)
│   ├── components/
│   │   ├── PayoffMatrix.jsx   (2x2 grid, displayed on the mirror)
│   │   ├── RoundHistory.jsx   (colored marker strip on the desk)
│   │   ├── ActionButton.jsx   (cooperate/defect button with glow states)
│   │   ├── Narrator.jsx       (The Chungus text display with fade-in)
│   │   └── QTableReveal.jsx   (post-game Q-table with number counting animation)
│   └── storage/
│       └── leaderboard.js     (window.storage read/write for shared leaderboard)
```

---

## Key Commands

```bash
# Initial setup
npm create vite@latest prisoners-game -- --template react
cd prisoners-game
npm install
npm install -D tailwindcss @tailwindcss/vite

# Dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy (Vercel CLI, optional)
npx vercel --prod
```

### Tailwind Config Skeleton

```javascript
// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        void: "#07070B",
        room: "#0C0C14",
        surface: "#111119",
        "surface-raised": "#18182A",
        glass: "#1A2A3A",
        cooperate: "#2DB563",
        "cooperate-dim": "#1A5C38",
        defect: "#D94545",
        "defect-dim": "#6B2222",
        accent: "#5B5FE6",
        "accent-bright": "#7B7FFF",
        chungus: "#D4A843",
        "text-primary": "#E0E0EC",
        "text-secondary": "#6E6E8A",
        "text-ghost": "#3A3A52",
        border: "#222236",
        "border-light": "#2E2E48",
      },
      fontFamily: {
        display: ['"Space Grotesk"', "sans-serif"],
        mono: ['"IBM Plex Mono"', "monospace"],
      },
      borderRadius: {
        panel: "8px",
        button: "6px",
        mirror: "4px",
        clipboard: "2px",
      },
      spacing: {
        // 8px base unit enforced through Tailwind defaults (which use 4px base)
        // Use p-2 (8px), p-4 (16px), p-6 (24px), p-8 (32px) etc.
      },
    },
  },
  plugins: [],
};
```
