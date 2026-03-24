// music.js — Configure background music per game phase.
// Drop audio files into /public/music/ and update paths below.
// Set enabled: false to silence all music without touching anything else.

export const MUSIC_CONFIG = {
  enabled: true,          // ← one-liner kill switch
  volume:  0.35,          // master volume (0–1)
  fadeMs:  1000,          // crossfade duration in ms

  // One path per game phase. Set to null to play silence for that phase.
  // Files should be loopable (seamless loop point at end).
  tracks: {
    landing:   '/music/landing.mp3',    // corridor ambience, waiting
    playing:   '/music/tension.mp3',    // interrogation — levels 1–5
    postLevel: '/music/analysis.mp3',   // quiet, contemplative — after each level
    rlBoss:    '/music/boss.mp3',       // AI boss phase 1 — exploring
    rlPhase2:  '/music/boss_phase2.mp3',// AI boss phase 2 — exploiting (more intense)
    card:      '/music/results.mp3',    // end screen / personality card
  },
};
