const CACHE_NAME = 'kingdom-steward-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/dashboard.html',
  '/give.html',
  '/history.html',
  '/landing.html',
  '/leader-dashboard.html',
  '/login.html',
  '/pledges.html',
  '/profile.html',
  '/signup.html',
  '/css/main.css',
  '/css/dashboard.css',
  '/css/components.css',
  '/css/animations.css',
  '/js/config.js',
  '/js/supabase-client.js',
  '/js/auth.js',
  '/js/dashboard.js',
  '/js/giving.js',
  '/js/espees.js',
  '/js/leader.js',
  '/js/pledges.js',
  '/manifest.json'
];

// Install Event - Cache Core Assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching app shell');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - Network First Strategy for HTML/API, Cache First for Static Assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip Supabase API calls (don't cache POST requests or external API dynamically without careful consideration)
  if (url.origin.includes('supabase.co')) {
    return;
  }

  // Use Network First strategy
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Cache the fresh response if it's a valid GET request
        if (event.request.method === 'GET' && networkResponse.ok) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Fallback to cache if network fails
        console.log('[SW] Network failed, returning cached version');
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If neither network nor cache has the page, return nothing or a generic offline page
        });
      })
  );
});
