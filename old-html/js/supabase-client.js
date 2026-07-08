// js/supabase-client.js
if (!window.db && typeof supabase !== 'undefined') {
  window.db = supabase.createClient(window.CONFIG.SUPABASE_URL, window.CONFIG.SUPABASE_ANON_KEY);
}