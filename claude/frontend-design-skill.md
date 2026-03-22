# frontend-design-skill.md — The Prisoner's Game

## Creative Direction

This is not a game that looks like a game. It looks like a place. The player is physically inside a concrete interrogation room, sitting in a chair, staring at a one-way mirror. Everything on screen exists in that room. There are no floating UI panels. There are no sidebars. There is no nav bar. The room IS the interface.

The feeling is: you are being watched. You are making decisions under observation. The person on the other side of the glass knows something you don't. Every choice you make is being recorded.

---

## The Mirror as UI Surface

The one-way mirror is the central UI element. It serves three purposes depending on game state:

**During gameplay:** The mirror displays the payoff matrix. It's rendered as translucent data overlaid on blueish glass. Think heads-up display projected onto a window. The matrix is always visible, never hidden behind a tab or accordion. The player should never have to remember the payoffs.

**During analysis:** The mirror transitions (crossfade, 400ms) to show the post-level results. The strategy name types in like a terminal printout. The round history appears as a timeline. The matrix is gone. The glass now shows what was behind it all along.

**During the RL boss:** The mirror behaves the same as gameplay but with added visual tension. Faint scan lines (a repeating-linear-gradient at 2px intervals and 0.02 opacity). A slightly brighter edge glow. The implication: the thing behind the glass is computing.

The mirror should always feel like glass. It has:
- A base color that's darker than the room walls (#1A2A3A)
- A gradient overlay that simulates directional light hitting glass (lighter at top-left)
- A 1px border with low-opacity blue (#64A0DC at 15% opacity)
- A faint outer glow (box-shadow, 40px spread, blue at 8% opacity)
- An inner top highlight (inset box-shadow, 1px, white at 3% opacity)
- `backdrop-filter: blur(1px)` and nothing more

Do NOT make the mirror look like a frosted card. Do NOT give it heavy blur, heavy border, or visible padding. It's glass, not a panel.

---

## The Buttons as Physical Objects

The cooperate and defect buttons are not flat rectangles floating in space. They are physical buttons on a desk surface, viewed from above at a slight angle.

**At rest:** Dark background matching the desk surface, with a colored border (green-dim for cooperate, red-dim for defect). The text label is in the action color. They look like dormant controls.

**On hover/focus (desktop):** The border brightens to full action color. A glow appears around the button (box-shadow with the action color at 25% opacity). The background stays dark. This is the "your hand is hovering over the button" state.

**On press (active):** The background fills with the action color. The text goes dark (#07070B). The button scales to 0.97. This is the "you pressed it" state. Duration: 100ms. The commit is instant.

**Disabled (between rounds, during analysis):** Opacity 0.3. No cursor. No hover effect. The buttons are physically still there but inactive.

Button shape: rectangular, 6px border-radius, 56px minimum height on mobile. They sit side by side with 16px gap. On a 375px screen, each button is roughly 170px wide. The text is uppercase Space Grotesk 500, 14px, letter-spacing 0.08em.

---

## The Desk Surface

Below the mirror, there's a horizontal surface that functions as the desk/table the player is sitting at. This is where the round history markers live.

The desk is a subtle gradient from surface (#111119) at the top to surface-raised (#18182A) at the bottom, creating the illusion of a flat plane receding in perspective. It has a top border (1px, border color) separating it from the mirror above.

Round history markers sit on this surface as small rectangular indicators (20px wide, 6px tall, 3px border-radius). Two per round stacked vertically: player's move on top, opponent's move below. Colored: cooperate green or defect red. Unplayed rounds are ghost-colored (#3A3A52). They're evenly spaced across the desk width.

---

## Light and Atmosphere

There is one implied light source: directly above, slightly forward (like a ceiling fluorescent in an interrogation room). This creates:

- A radial gradient on the room background that's slightly lighter at the top-center
- The mirror having a brighter gradient at the top (light hitting the glass)
- A vignette effect at screen edges (darker at all four corners)

The vignette is critical. It creates the feeling of tunnel vision, of focus on the center of the screen where the mirror and buttons are. Use a pseudo-element with a radial-gradient from transparent (center) to rgba(7,7,11,0.6) at the edges.

### Win State
When the player wins a level, the room gets a subtle warm shift. The overhead light takes on a faint green tint. Use a full-screen overlay at rgba(45, 181, 99, 0.03). Barely perceptible. The feeling is relief, not celebration.

### Lose State
The room gets colder. The overhead light dims. Overlay at rgba(217, 69, 69, 0.03). The Chungus text appears. The retry button is the only warm-colored element.

### RL Boss Phase 2
At round 11, the room shifts. Apply `hue-rotate(-10deg) brightness(0.95)` to the room container. The mirror's glow intensifies (box-shadow spread goes from 40px at 8% to 60px at 12%). These are small changes. The player should feel something shifted without being able to pinpoint exactly what. That unease is the point.

---

## The Corridor (Landing Page)

The landing page is a view down a dark corridor toward a closed door. The corridor uses CSS perspective to create depth. The door is at the vanishing point.

The walls of the corridor have the faint grid pattern (repeating-linear-gradient, white at 3% opacity, 60px intervals). The floor is darker than the walls. There's a single light source above the door, creating a bright spot on the door surface and the floor in front of it.

The door itself is a rectangle at the vanishing point. It's slightly lighter than the walls (#18182A). The title text sits above or on the door. The START button is integrated into the door (a handle, a buzzer, or simply a button overlaid on the door surface).

The corridor is static. Nothing moves. Nothing animates on load. The stillness is part of the atmosphere. The only animated element is the START button having a very slow pulse on its glow (4 second cycle, opacity 0.5 to 1 on the box-shadow).

When START is pressed: the door element scales up slightly (1 → 1.05) and fades out (opacity 1 → 0) over 600ms while the room behind it fades in. This creates the sensation of the door opening and the player entering.

---

## The Clipboard (Leaderboard)

The clipboard is a physical object that slides up from the bottom of the screen. It overlaps the room (which dims/blurs behind it).

It has:
- A slightly off-white background (#1A1A24, which reads as "paper" in this dark context)
- A top edge with a metallic clip rendered as a small darker rectangle with a subtle gradient and 1px highlights
- Monospace font (IBM Plex Mono 400) for all entries
- Each row is: rank number (text-secondary), name (text-primary), score (text-primary, weight 500, right-aligned)
- The player's row has a gold left border (4px, chungus color) and a faint gold background (chungus at 5% opacity)
- The name input field is styled as a line on the paper: no visible box, just a bottom border (1px, border-light) with blinking cursor. Placeholder text: "your name here" in text-ghost color
- The submit button is small, accent-colored, sits next to the input field

The clipboard dismisses by sliding back down (same easing as entry, reversed). Behind the clipboard, the room is visible but at 30% opacity with a 4px blur.

---

## Responsive Breakpoints

Only two breakpoints matter:

**Mobile (< 480px):** This is the primary design target. Everything must work here first. Buttons are side by side at 50% width minus gap. Mirror fills available width. Round history markers may be smaller (16px wide). Clipboard fills the full screen.

**Desktop (>= 480px):** Max-width 720px, centered. More breathing room around the mirror. Buttons can be slightly larger. The corridor on the landing page can show more wall detail. The clipboard maxes out at 480px wide, centered.

Do not design for tablet specifically. It will be fine between these two breakpoints.

---

## What This Is NOT

This is not a dashboard. Do not add sidebars, top navs, breadcrumbs, or settings panels.

This is not a tutorial app. Do not add progress bars, step indicators, or "next: learn about X" CTAs. The Chungus handles all guidance and he uses three words where others use thirty.

This is not a social app. Do not add share buttons, profile pictures, avatars, or comment sections.

This is not a SaaS product. Do not add pricing, testimonials, feature grids, or "how it works" sections. The landing page has a door. You open it. That's the onboarding.

This is a place. The player walks in, sits down, and plays. The design serves that spatial metaphor and nothing else.
