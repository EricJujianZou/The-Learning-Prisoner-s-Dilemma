// ─────────────────────────────────────────────────────────────────────────────
// Q-LEARNING PARAMETERS
// Adjust these to test different agent behaviors.
// ─────────────────────────────────────────────────────────────────────────────
export const QL_CONFIG = {
  // How fast the agent updates its beliefs (0–1).
  // Higher = learns faster but overshoots; lower = slower but more stable.
  ALPHA: 0.2,

  // How much the agent values future rewards vs immediate ones (0–1).
  // 1.0 = infinite future horizon; 0.0 = purely greedy.
  GAMMA: 0.95,

  // Initial exploration rate (0–1).
  // 0.5 = 50% random actions at round 1.
  EPSILON_START: 0.3,

  // Decay multiplier applied to epsilon each round (0–1).
  // 0.9 → epsilon drops to ~0.07 by round 20.
  // Lower values = exploits earlier; higher = stays random longer.
  EPSILON_DECAY: 0.9,

  // Starting Q value for all state-action pairs.
  // 2.5 = the average possible payoff (neutral initialization).
  // Higher = agent starts optimistic (explores more); lower = pessimistic.
  Q_INIT: 2.5,
};

// ─────────────────────────────────────────────────────────────────────────────
// GAME PARAMETERS
// ─────────────────────────────────────────────────────────────────────────────
export const GAME_CONFIG = {
  ROUNDS_STANDARD: 10,
  ROUNDS_RL: 20,
  // Milliseconds the round result is displayed before auto-advancing.
  RESULT_DISPLAY_MS: 1500,
  // Milliseconds the Chungus intro is shown before gameplay begins.
  INTRO_DISPLAY_MS: 3000,
};

// ─────────────────────────────────────────────────────────────────────────────
// SUPABASE CONFIGURATION
// Replace these placeholders after creating your Supabase project.
// See the "SUPABASE SETUP" section at the bottom of this file.
// ─────────────────────────────────────────────────────────────────────────────
export const SUPABASE_CONFIG = {
  URL:      import.meta.env.VITE_SUPABASE_URL      ?? 'https://nrytyuiwllshuscvjqxk.supabase.co',
  ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'sb_publishable_jZ3n9BZTZXVoiOLis4KPYg_daJJPSXq',
};

// ─────────────────────────────────────────────────────────────────────────────
// SUPABASE SETUP INSTRUCTIONS
// ─────────────────────────────────────────────────────────────────────────────
// 1. Go to https://supabase.com and create a free account + new project.
//
// 2. In the Supabase dashboard, go to SQL Editor and run:
//
//    CREATE TABLE leaderboard (
//      id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
//      name text NOT NULL,
//      score integer NOT NULL,
//      created_at timestamptz DEFAULT now()
//    );
//
//    ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
//
//    CREATE POLICY "public read"  ON leaderboard FOR SELECT USING (true);
//    CREATE POLICY "public write" ON leaderboard FOR INSERT WITH CHECK (true);
//
// 3. Go to Project Settings → API.
//    Copy "Project URL" → paste as SUPABASE_CONFIG.URL above.
//    Copy "anon public" key → paste as SUPABASE_CONFIG.ANON_KEY above.
//
// 4. The anon key is safe to commit — it's a read/write key bounded by
//    the RLS policies above. It cannot delete rows or access other tables.
// ─────────────────────────────────────────────────────────────────────────────
