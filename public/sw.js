// MasjidScreen Service Worker — Offline-first for Android TV
const CACHE_NAME = 'masjidscreen-v2';

// Core shell pages to cache on install
const PRECACHE_URLS = [
  '/tv',
  '/',
];

// Install: precache core assets and fonts
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Cache core pages
      try {
        await cache.addAll(PRECACHE_URLS);
      } catch (err) {
        console.warn('SW: Some precache URLs failed', err);
      }

      // Pre-cache Google Fonts CSS in background
      try {
        const fontUrl = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700;900&family=Amiri:wght@400;700&family=Playfair+Display:wght@400;500;600;700&family=Cormorant+Garamond:wght@300;400;500;600;700&family=Tajawal:wght@300;400;500;700&family=Orbitron:wght@400;500;600;700;800;900&family=Rajdhani:wght@300;400;500;600;700&family=Teko:wght@300;400;500;600;700&family=Monoton&display=swap';
        const fontRes = await fetch(fontUrl);
        if (fontRes.ok) {
          await cache.put(fontUrl, fontRes);
          // Also cache the individual font files referenced in the CSS
          const cssText = await fontRes.text();
          const fontFileUrls = cssText.match(/url\([^)]+\)/g) || [];
          for (const match of fontFileUrls.slice(0, 20)) {
            const url = match.replace(/url\(['"]?/, '').replace(/['"]?\)/, '');
            if (url.startsWith('http')) {
              try {
                const fRes = await fetch(url);
                if (fRes.ok) await cache.put(url, fRes);
              } catch { /* skip individual font file failures */ }
            }
          }
        }
      } catch (err) {
        console.warn('SW: Font pre-cache failed (will load on first visit)', err);
      }
    })
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch: network-first for API, cache-first for static assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // API requests: network-first, fallback to cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache successful API responses for offline use
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cached API response
          return caches.match(event.request).then((cached) => {
            if (cached) return cached;
            // For API routes, return a minimal offline response
            return new Response(
              JSON.stringify({ error: 'offline', cached: true }),
              { headers: { 'Content-Type': 'application/json' } }
            );
          });
        })
    );
    return;
  }

  // Next.js static assets (_next/static/*): cache-first with long TTL
  // These are content-hashed so they never change
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        }).catch(() => {
          return new Response('Offline', { status: 503 });
        });
      })
    );
    return;
  }

  // Navigation requests (HTML pages): network-first, fallback to cached /tv
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache the HTML response for offline navigation
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match('/tv').then((cached) => {
            return cached || caches.match('/');
          });
        })
    );
    return;
  }

  // Google Fonts CSS & font files: stale-while-revalidate
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cached) => {
          const fetchPromise = fetch(event.request).then((response) => {
            if (response.ok) {
              cache.put(event.request, response.clone());
            }
            return response;
          }).catch(() => cached);

          return cached || fetchPromise;
        });
      })
    );
    return;
  }

  // Supabase / external image assets: network-first with cache fallback
  if (url.hostname.includes('supabase') || url.hostname.includes('supabase.co')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        }).catch(() => {
          // Return empty SVG for offline images
          if (event.request.destination === 'image') {
            return new Response(
              '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>',
              { status: 200, headers: { 'Content-Type': 'image/svg+xml' } }
            );
          }
          return new Response('Offline', { status: 503 });
        });
      })
    );
    return;
  }

  // Other static assets: cache-first
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      }).catch(() => {
        // Return offline fallback for images
        if (event.request.destination === 'image') {
          return new Response(
            '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>',
            { status: 200, headers: { 'Content-Type': 'image/svg+xml' } }
          );
        }
        return new Response('Offline', { status: 503 });
      });
    })
  );
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((keys) => {
      keys.forEach((key) => caches.delete(key));
    }).then(() => {
      console.log('SW: All caches cleared');
    });
  }
});
