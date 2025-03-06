const CACHE_NAME = 'sudoku-pwa-v2'; // 每次更新程式碼時改版本號，例如 v1 -> v2
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/manifest.json',
    '/icons/icon-192.png',
    '/icons/icon-512.png'
];

// 安裝 Service Worker 並快取資源
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('正在快取資源');
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting()) // 立即激活新 Service Worker
    );
});

// 攔截請求並從快取提供資源
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            })
    );
});

// 激活時清除舊快取
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            );
        }).then(() => self.clients.claim()) // 立即控制所有頁面
    );
});