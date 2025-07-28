const CACHE_NAME = 'clock-weather-v2';
const urlsToCache = [
    '/clock-weather-pwa/',
    '/clock-weather-pwa/index.html',
    '/clock-weather-pwa/styles.css',
    '/clock-weather-pwa/app.js',
    '/clock-weather-pwa/manifest.json'
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
                return response || fetch(event.request);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
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