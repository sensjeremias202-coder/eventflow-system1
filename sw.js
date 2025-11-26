// Service Worker para PWA
const CACHE_NAME = 'eventflow-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/app.js',
    '/js/auth.js',
    '/js/dashboard.js',
    '/js/events.js',
    '/js/chat.js',
    '/js/notifications.js',
    '/js/export.js',
    '/js/search-filters.js',
    '/js/enrollment-system.js',
    '/js/image-upload.js',
    '/js/theme.js',
    '/js/gamification.js',
    '/js/pwa.js'
];

// Instalação
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('✅ Cache aberto');
                return cache.addAll(urlsToCache);
            })
    );
});

// Ativação
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Removendo cache antigo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch - Network First, fallback to Cache
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Clone response antes de cachear
                const responseToCache = response.clone();
                
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });
                
                return response;
            })
            .catch(() => {
                // Se network falhar, usar cache
                return caches.match(event.request);
            })
    );
});

// Background Sync para notificações
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-data') {
        event.waitUntil(syncData());
    }
});

async function syncData() {
    // Sincronizar dados pendentes
    console.log('🔄 Sincronizando dados...');
}

// Push Notifications
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {};
    
    const options = {
        body: data.body || 'Nova notificação',
        icon: '/icon-192.png',
        badge: '/icon-72.png',
        vibrate: [200, 100, 200],
        data: data.data || {}
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title || 'EventFlow', options)
    );
});

// Notification Click
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow(event.notification.data.url || '/')
    );
});
