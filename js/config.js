// js/config.js
const CONFIG = {
  SUPABASE_URL: 'https://xbkxjlhbeprxaebzcfwy.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhia3hqbGhiZXByeGFlYnpjZnd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1MzE1MTQsImV4cCI6MjA5NjEwNzUxNH0._uW1IoWXCB42pR2o2nJftj6ICicQwOGFPWfOESLKrXI',
  ESPEES_RATE: 2050  // 1 Espees = 2050 NGN (fixed rate)
};

// Register PWA Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(reg => {
      console.log('SW registered successfully:', reg.scope);
    }).catch(err => {
      console.log('SW registration failed:', err);
    });
  });
}
