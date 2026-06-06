const CACHE_NAME = 'kingdom-steward-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/dashboard.html',
  '/give.html',
  '/pledges.html',
  '/history.html',
  '/css/main.css',
  '/css/dashboard.css',
  '/css/components.css',
  '/js/config.js',
  '/js/supabase-client.js',
  '/js/auth.js',
  '/js/offline.js',
  '/js/giving.js'
];

// Install Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// Fetch with Network First, Cache Fallback
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  // Do not cache API calls dynamically
  if (url.origin.includes('supabase.co')) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          if (event.request.method === 'GET') {
            cache.put(event.request, responseClone);
          }
        });
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// Background Sync for Offline Giving
self.addEventListener('sync', event => {
  if (event.tag === 'sync-giving') {
    event.waitUntil(syncOfflineGiving());
  }
});

async function syncOfflineGiving() {
  const cache = await caches.open('offline-giving');
  const requests = await cache.keys();
  
  for (const request of requests) {
    const response = await cache.match(request);
    const data = await response.json();
    
    // Send to Supabase
    try {
      const result = await fetch('https://xbkxjlhbeprxaebzcfwy.supabase.co/rest/v1/giving_entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhia3hqbGhiZXByeGFlYnpjZnd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1MzE1MTQsImV4cCI6MjA5NjEwNzUxNH0._uW1IoWXCB42pR2o2nJftj6ICicQwOGFPWfOESLKrXI',
          'Authorization': `Bearer ${data._token}` // Stored token
        },
        body: JSON.stringify({
          user_id: data.user_id,
          amount: data.amount,
          type: data.type,
          date: data.date,
          notes: data.notes
        })
      });
      
      if (result.ok) {
        await cache.delete(request);
        // Send success notification
        if (self.registration.showNotification) {
          self.registration.showNotification('Giving Synced', {
            body: 'Your offline giving has been recorded!',
            icon: '/assets/appstore-images/android/launchericon-192x192.png'
          });
        }
      }
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }
}
