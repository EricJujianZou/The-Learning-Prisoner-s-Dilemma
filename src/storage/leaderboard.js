// Leaderboard storage — uses Supabase when configured, falls back to localStorage.
// Configure SUPABASE_CONFIG in src/config.js to enable shared leaderboard.

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

// Submit a score. Returns true on success, false on failure.
export async function submitScore(name, score) {
  if (isConfigured) {
    try {
      const sb = await getClient();
      const { error } = await sb.from('leaderboard').insert({ name, score });
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('[Leaderboard] Supabase submit failed:', err);
      return false;
    }
  }

  // localStorage fallback
  const entries = readLocal();
  entries.push({ name, score, created_at: new Date().toISOString() });
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(entries));
    return true;
  } catch {
    return false;
  }
}

// Fetch the full leaderboard, sorted by score descending.
export async function fetchLeaderboard() {
  if (isConfigured) {
    try {
      const sb = await getClient();
      const { data, error } = await sb
        .from('leaderboard')
        .select('name, score, created_at')
        .order('score', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data ?? [];
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
