# The Prisoner's Game — Development Spec v1.0

## Overview

A browser game where you play the Prisoner's Dilemma against 5 mystery opponents, then face a Q-learning AI boss that adapts to your play style in real time. Total score across all 6 levels goes to a public leaderboard.

**One liner:** "Can you outscore an AI that learns how you think?"

**Stack:** Static single page app (React preferred). GitHub + Vercel. No backend. localStorage for session state, `window.storage` API (shared=true) for leaderboard.

**Tone:** Minimal, dark, slightly ominous. Interrogation room aesthetic. A narrator called "The Chungus" gives terse commentary between levels.

---

## Visual Concept: The Interrogation Room

The entire game takes place in a first-person POV interrogation room, built with CSS 3D perspective transforms (no image assets). The visual metaphor reinforces the game theory theme: you can't see what the other side is thinking.

### The Room (Game Stage)

The player is sitting in a chair, looking forward. The view uses CSS perspective/transform to create depth and a vanishing point.

**Center:** A one-way mirror takes up the middle of the view. This is where the payoff matrix is displayed, rendered as a translucent blueish glass panel with the 2x2 grid overlaid. The mirror has a subtle reflection/glass effect (CSS gradients, backdrop-filter). Behind the glass, the opponent is implied but not visible. During post-level analysis, the strategy reveal text appears on/through the mirror.

**Left side:** A green COOPERATE button, positioned as if it's a physical button or lever on the left wall/desk of the room. Should feel like it's in the player's left-hand reach.

**Right side:** A red DEFECT button, same treatment on the right side. Mirror positioning of the cooperate button.

**Above the mirror:** Round counter, score comparison, level indicator. Styled as if they're labels/placards on the wall.

**Below the mirror / on the desk surface:** Round history as a strip of colored markers building up as rounds complete. Like tally marks on a desk.

The room should have subtle atmospheric details: slight vignette at edges, faint light source from above, desk surface with perspective, maybe a faint grid pattern on the walls. All achievable with CSS gradients, box-shadows, and transforms. Do NOT use image assets.

### Landing Page (The Door)

The landing page is the approach to the interrogation room. A dark corridor with a door at the end (CSS perspective). The door has:

- Title "The Prisoner's Game" as text on/above the door
- Subtitle "6 opponents. 1 learns." below
- The payoff matrix shown as a notice/poster on the wall beside the door
- One line instruction: "You pick. They pick. You both score. Beat all 6 to make the leaderboard."
- The Chungus intro quote in gold italic: "Figure it out. That's the game."
- START button styled as the door handle or a buzzer beside the door
- Leaderboard top 10 visible below as a clipboard hanging on the wall

Clicking START transitions (animates) into the room, like the door opening and the POV moving inside.

### Leaderboard (The Clipboard)

After the game ends, a clipboard-style element slides into view or expands. It shows the ranked list of scores. The player can type their name and submit. Styled as a physical clipboard with paper texture (CSS only), handwritten-style or monospace font for entries.

The leaderboard is also previewed on the landing page (the clipboard on the wall).

---

## User Flow

### Flow Sequence

```
Landing (Door) → Start → Level 1..5 (random order) → RL Boss → Leaderboard (Clipboard)
                              ↑                |
                              └── retry (fail) ←┘
```

### Landing Page

Single view. Dark corridor + door. Contains:
1. Title + subtitle
2. Payoff matrix as visual 2x2 colored grid
3. Minimal instruction (one sentence)
4. Chungus intro quote
5. Start button
6. Leaderboard top 10 preview

### Game Start

Player taps Start. Door opens (animation). The Chungus introduces the premise:
> "Six opponents. Five are predictable. One is not. Your move."

Level 1 begins immediately.

### Level Flow (repeated 5 times for hardcoded opponents)

**Pre-level:** The Chungus gives a one-liner introducing the opponent (no strategy name). Text appears on the mirror glass.

**Gameplay (10 rounds per level):**
- Payoff matrix visible on the mirror (always)
- Round counter above mirror
- Score comparison (You vs Them) above mirror
- Cooperate button (left, green) and Defect button (right, red)
- After each pick: round result briefly shown (what you picked, what they picked, scores)
- Round history builds up as colored markers on the desk surface
- Player does NOT see: opponent strategy name, any internal stats

**Post-level analysis (same screen, room state changes):**

The mirror transitions to show the analysis. The room lighting might shift slightly (warmer on win, colder on lose).

Content shown:
- Win/Lose indicator
- Strategy name reveal (fade in on the mirror): e.g., "THE MIRROR — Tit for Tat"
- One-sentence explanation of how the strategy works
- Round-by-round history visualization (color-coded moves, full width)
- Pivot round highlighted (where player behavior shifted)
- Score summary with threshold shown: "You scored X. Needed Y to pass."
- Chungus comment (gold text)
- Buttons: "Retry" (always visible) and "Next" (only visible if score meets threshold)

On win, the analysis screen celebrates briefly. On fail, the Chungus roasts gently.

### RL Boss Level

Unlocked after beating all 5 hardcoded opponents.

**Pre-level:** The room changes. Maybe the lighting shifts, the mirror flickers. The Chungus warns:
> "This one is different. It's watching you. It's learning. 20 rounds. Good luck."

**Gameplay (20 rounds):**
- Same room interface
- Phase indicator above mirror:
  - Rounds 1–10: "Phase 1: It's studying you."
  - Rounds 11–20: "Phase 2: It has adapted."
- Visual shift at round 11 (subtle color change, lighting shift, mirror flickers)
- No Q table or agent stats visible during play

**Win condition:** Outscore the agent across 20 rounds.

**Post-level analysis:**
- Everything from hardcoded analysis
- Plus: Strategy convergence label (what known strategy the Q table resembles)
- Plus: Phase comparison (score in rounds 1–10 vs 11–20)
- Plus: Q Table behind a toggle button: "View Q Table — skip this if you're not a nerd"
  - Shows final Q table with visited/unvisited states labeled, policy per state

### Leaderboard Entry

After RL boss (win or lose):
1. Show total score across all 6 levels prominently
2. Clipboard slides in showing full leaderboard with player's position highlighted
3. Text field to enter name (anything goes, no validation)
4. Submit button adds to shared leaderboard
5. Option to return to landing / play again

---

## Game Design

### Payoff Matrix

Standard Prisoner's Dilemma:

|              | They Cooperate | They Defect |
|--------------|---------------|-------------|
| You Cooperate | You: 3 / Them: 3 | You: 0 / Them: 5 |
| You Defect    | You: 5 / Them: 0 | You: 1 / Them: 1 |

Displayed as a 2x2 grid on the one-way mirror. Green tint for cooperate cells, red tint for defect cells. The matrix is always visible during gameplay.

### Opponent Roster

5 hardcoded opponents served in RANDOM order each playthrough. Strategy names are hidden during play and revealed in post-level analysis.

#### Level: "The Pushover" — Always Cooperate
- **Behavior:** Returns 'C' every round regardless of history.
- **Win threshold:** Outscore them (playerScore > opponentScore)
- **Teaches:** Exploitation is possible. Introduces the temptation payoff.
- **Chungus pre-level:** "This one never learned to fight back."
- **Implementation:** `() => 'C'`

#### Level: "The Wall" — Always Defect
- **Behavior:** Returns 'D' every round regardless of history.
- **Win threshold:** Score >= 5
- **Teaches:** You can't cooperate with everyone. Mutual defection is sometimes the only stable outcome.
- **Chungus pre-level:** "This one has made up its mind. Have you?"
- **Implementation:** `() => 'D'`

#### Level: "The Mirror" — Tit for Tat
- **Behavior:** Starts with 'C'. Then copies the player's previous move.
- **Win threshold:** Score >= 12
- **Teaches:** Reciprocity. Your moves have consequences next round.
- **Chungus pre-level:** "Whatever you do, it does. Eventually."
- **Implementation:** `(history) => history.length === 0 ? 'C' : history[history.length - 1].playerMove`

#### Level: "The Grudge" — Grim Trigger
- **Behavior:** Cooperates until the player defects once. Then defects forever.
- **Win threshold:** Score >= 10
- **Teaches:** Reputation matters. One betrayal can be permanent.
- **Chungus pre-level:** "It remembers everything. Especially the first cut."
- **Implementation:** `(history) => history.some(r => r.playerMove === 'D') ? 'D' : 'C'`

#### Level: "The Coin" — Pavlov (Win-Stay, Lose-Shift)
- **Behavior:** Starts with 'C'. If last round's payoff was good (3 or 5), repeats last move. If bad (0 or 1), switches.
- **Win threshold:** Score >= 8
- **Teaches:** Pattern reading. Opponent logic is based on their own outcomes, not just your moves.
- **Chungus pre-level:** "It doesn't care what you did. It cares what happened to it."
- **Implementation:**
```javascript
function pavlov(history) {
  if (history.length === 0) return 'C';
  const lastRound = history[history.length - 1];
  const lastPayoff = lastRound.opponentReward;
  const lastMove = lastRound.opponentMove;
  if (lastPayoff >= 3) return lastMove; // good outcome, stay
  return lastMove === 'C' ? 'D' : 'C'; // bad outcome, switch
}
```

### RL Boss: The Q Learner

| Parameter | Value | Why |
|-----------|-------|-----|
| Rounds | 20 | Enough to learn a real policy. Split visually into 10+10. |
| Learning rate (α) | 0.2 | Fast enough to adapt in 20 rounds. |
| Discount factor (γ) | 0.95 | Values future rewards. Makes agent plan ahead. |
| Epsilon start | 0.5 | High initial exploration. |
| Epsilon decay | 0.9 per round | Decays to ~0.07 by round 20. Explore early, exploit late. |
| Q initialization | 2.5 | Neutral (average payoff). Prevents bias toward first-explored action. |
| State space | 5 states | 'start', 'CC', 'CD', 'DC', 'DD' (last round's joint action) |
| Win condition | Outscore the agent | playerScore > opponentScore across 20 rounds |

**Q-Learning Update Rule:**
```
Q(s, a) ← Q(s, a) + α × [r + γ × max_a'(Q(s', a')) − Q(s, a)]
```

**Agent choose function:**
```javascript
function agentChoose(state, Q, epsilon) {
  // Explore: random action
  if (Math.random() < epsilon) {
    return Math.random() < 0.5 ? 'C' : 'D';
  }
  // Exploit: best Q value
  if (Q[state].C > Q[state].D) return 'C';
  if (Q[state].D > Q[state].C) return 'D';
  // Tie: random
  return Math.random() < 0.5 ? 'C' : 'D';
}
```

**Strategy Identification (post-game):**
Only evaluate states the agent actually visited. Match the policy to known strategies:
- Tit for Tat: CC→C, CD→D, DC→C, DD→D
- Always Defect: all visited states → D
- Always Cooperate: all visited states → C
- Pavlov: CC→C, CD→D, DC→D, DD→C
- Grim Trigger: CC→C, CD→D, DC→D, DD→D
- If no match: "Mostly Defect" / "Mostly Cooperate" / "Mixed" based on ratio

---

## The Chungus (Narrator)

Terse. Slightly ominous. Dry humor. Short sentences. Not friendly, not hostile. Observing.

### Landing / Intro
> "Six opponents. Five are predictable. One is not. Your move."

### Pre-level lines (one per opponent, strategy names NOT shown)
- **The Pushover:** "This one never learned to fight back."
- **The Wall:** "This one has made up its mind. Have you?"
- **The Mirror:** "Whatever you do, it does. Eventually."
- **The Grudge:** "It remembers everything. Especially the first cut."
- **The Coin:** "It doesn't care what you did. It cares what happened to it."

### Pre RL Boss
> "This one is different. It's watching you. It's learning. 20 rounds. Good luck."

### Post-level (win) — pick one randomly
- "You figured it out. Most don't."
- "Clean. Next."
- "That was the easy part."

### Post-level (fail) — pick one randomly
- "Hm. Try again."
- "It's not random. Think."
- "You're smarter than that. Probably."

### Post RL Boss (win)
> "It studied you and you still won. Interesting."

### Post RL Boss (lose)
> "It learned faster than you adapted. That happens."

### Leaderboard
> "Put your name down. Let them know you were here."

---

## Post-Level Analysis

Shown after every level. Same screen as gameplay (the room), but the mirror transitions to display analysis content.

### Hardcoded Levels
1. **Win/Lose indicator** with Chungus comment
2. **Strategy reveal:** Name + one-sentence explanation (appears on the mirror)
3. **Round history:** Visual timeline of all 10 rounds, color-coded (green=C, red=D) for both players
4. **Pivot round:** Highlighted round where player's behavior pattern shifted (detected by comparing cooperation rate in first half vs second half; if delta > 0.3, mark the midpoint as pivot)
5. **Score summary:** "You scored X. Needed Y to pass."
6. **Buttons:** "Retry" (always visible), "Next" (only if score >= threshold)

### RL Boss Level
Everything from hardcoded analysis, plus:
1. **Strategy convergence:** What known strategy the final Q table most closely resembles
2. **Phase comparison:** Score in rounds 1–10 vs 11–20
3. **Q Table toggle:** Button labeled "View Q Table — skip this if you're not a nerd"
   - Shows Q values per state
   - Labels each state as visited or unvisited
   - Shows the derived policy per visited state

---

## Leaderboard

**Storage:** Shared persistent storage via `window.storage` API.

```javascript
// Write
await window.storage.set(
  'lb:' + Date.now() + ':' + name,
  JSON.stringify({ name, score, timestamp: Date.now() }),
  true // shared = true, visible to all users
);

// Read all entries
const keys = await window.storage.list('lb:', true);
// For each key, get the value, parse JSON, sort by score descending
```

**Score composition:**
- 5 hardcoded levels × 10 rounds × max 5 per round = max 250
- RL boss × 20 rounds × max 5 per round = max 100
- Theoretical max: 350
- Realistic high score: 220–260

**Display:** Ranked by total score descending. Name + score. Top 10 on landing page. Full list after game. Player's position highlighted.

**Entry:** Free text name field. No validation. No censorship. No accounts.

---

## Technical Specification

### Game State

```javascript
const gameState = {
  phase: 'landing', // 'landing' | 'playing' | 'postLevel' | 'rlBoss' | 'leaderboard'
  levelOrder: [],    // randomized array of 5 indices [0..4]
  currentLevelIndex: 0, // 0–4 for hardcoded, 5 for RL boss
  round: 1,
  playerScore: 0,    // current level
  opponentScore: 0,  // current level
  totalScore: 0,     // cumulative across all levels
  roundHistory: [],   // [{playerMove, opponentMove, playerReward, opponentReward}]
  completedLevels: new Set(),
  // RL boss only
  qTable: {},
  epsilon: 0.5,
  visitedStates: {},
};
```

### Win Condition Thresholds

```javascript
const WIN_THRESHOLDS = {
  alwaysCooperate: { type: 'outscore' },  // playerScore > opponentScore
  alwaysDefect:    { type: 'minimum', value: 5 },
  titForTat:       { type: 'minimum', value: 12 },
  grimTrigger:     { type: 'minimum', value: 10 },
  pavlov:          { type: 'minimum', value: 8 },
  qLearner:        { type: 'outscore' },  // playerScore > opponentScore
};
```

### Pivot Round Detection

```javascript
function detectPivot(history) {
  if (history.length < 4) return null;
  const mid = Math.floor(history.length / 2);
  const firstHalfCoopRate = history.slice(0, mid).filter(r => r.playerMove === 'C').length / mid;
  const secondHalfCoopRate = history.slice(mid).filter(r => r.playerMove === 'C').length / (history.length - mid);
  if (Math.abs(firstHalfCoopRate - secondHalfCoopRate) > 0.3) {
    return mid + 1; // 1-indexed round number
  }
  return null;
}
```

### Mobile Considerations
- Cooperate (left) and Defect (right) buttons side by side, full height tap targets, minimum 44px
- Payoff matrix scales to fit mobile width
- Round history wraps if needed
- Q table (post-game only) horizontally scrollable
- `touch-action: manipulation` on all interactive elements
- `:active` states instead of `:hover` for touch feedback

---

## Screens Summary

| Screen | Visual Metaphor | Route/State |
|--------|----------------|-------------|
| Landing | Dark corridor with door at end | phase: 'landing' |
| Game (playing) | Inside interrogation room, POV from chair | phase: 'playing' |
| Game (analysis) | Same room, mirror shows analysis | phase: 'postLevel' |
| RL Boss | Same room, visual shift (lighting, flicker) | phase: 'rlBoss' |
| Leaderboard | Clipboard slides in / expands | phase: 'leaderboard' |

Transitions between screens should be animated and feel like one continuous experience (door opens → enter room → play → analysis on mirror → next opponent → ... → clipboard slides in). Not page loads. Not routes. State transitions with CSS animations.

---

## Scope

### v1 (this build)
- Landing page (the door) with payoff matrix, instruction, leaderboard preview
- 5 hardcoded opponents in random order with post-level analysis
- 1 RL boss (20 rounds) with Q table reveal
- Shared leaderboard (no backend)
- Mobile responsive
- The Chungus narrator
- CSS 3D interrogation room aesthetic

### v2 (if it does well)
- Information theory metrics (entropy, mutual information) as unlockable skills
- Player vs player mode
- Additional games (Chicken, Stag Hunt, Battle of the Sexes) as "worlds"
- Simulation viewer: pit beaten opponents against the RL agent
- Tournament mode: submit strategies as natural language
- Pretrained RL agents with personality presets

### Not in v1
- User accounts / auth
- Backend / database
- Information theory metrics
- Strategy editor
- Multiple game types
- Social sharing
- Analytics
