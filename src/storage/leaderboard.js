// Leaderboard storage — uses Supabase when configured, falls back to localStorage.
// Configure SUPABASE_CONFIG in src/config.js to enable shared leaderboard.
// Note: Supabase table needs an `integrity_score` integer column for integrity leaderboard.

import { SUPABASE_CONFIG } from '../config.js';

const LOCAL_KEY = 'prisoners_game_leaderboard';
const isConfigured = SUPABASE_CONFIG.URL !== 'YOUR_SUPABASE_PROJECT_URL';

let _client = null;

async function getClient() {
  if (_client) return _client;
  const { createClient } = await import('@supabase/supabase-js');
  _client = createClient(SUPABASE_CONFIG.URL, SUPABASE_CONFIG.ANON_KEY);
  return _client;
}

// Submit a score + integrity score. Returns true on success, false on failure.
export async function submitScore(name, score, integrityScore = 0) {
  if (isConfigured) {
    try {
      const sb = await getClient();
      const { error } = await sb.from('leaderboard').insert({
        name,
        score,
        integrity_score: integrityScore,
      });
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('[Leaderboard] Supabase submit failed:', err);
      return false;
    }
  }

  // localStorage fallback
  const entries = readLocal();
  entries.push({ name, score, integrityScore, created_at: new Date().toISOString() });
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(entries));
    return true;
  } catch {
    return false;
  }
}

// Fetch the full leaderboard. Returns entries sorted by score or integrity depending on mode.
export async function fetchLeaderboard() {
  if (isConfigured) {
    try {
      const sb = await getClient();
      const { data, error } = await sb
        .from('leaderboard')
        .select('name, score, integrity_score, created_at')
        .order('score', { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []).map((e) => ({
        ...e,
        integrityScore: e.integrity_score ?? 0,
      }));
    } catch (err) {
      console.error('[Leaderboard] Supabase fetch failed:', err);
      return [];
    }
  }

  return readLocal().sort((a, b) => b.score - a.score);
}

function readLocal() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? '[]');
  } catch {
    return [];
  }
}
