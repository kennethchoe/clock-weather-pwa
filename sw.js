const CACHE_NAME = 'clock-weather-v4';
const urlsToCache = [
    '/clock-weather-pwa/',
    '/clock-weather-pwa/index.html',
    '/clock-weather-pwa/styles.css?v=3',
    '/clock-weather-pwa/app.js?v=3',
    '/clock-weather-pwa/manifest.json?v=3'
];

// Install event - cache resources
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version or fetch from network
                if (response) {
                    console.log('Serving from cache:', event.request.url);
                    return response;
                }
                console.log('Fetching from network:', event.request.url);
                return fetch(event.request);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    console.log('Checking cache:', cacheName);
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            // Force clients to reload
            return self.clients.claim();
        })
    );
});

// Background sync for weather updates
self.addEventListener('sync', event => {
    if (event.tag === 'weather-sync') {
        event.waitUntil(updateWeatherData());
    }
});

async function updateWeatherData() {
    // This would be called when the app comes back online
    // You could implement background weather updates here
    console.log('Background weather sync');
} 