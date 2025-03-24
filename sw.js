// sw.js
const CACHE_NAME = 'chatro-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    'https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js',
    'https://hufung.github.io/images/chatro.svg'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});

self.addEventListener('sync', event => {
    if (event.tag === 'send-message') {
        event.waitUntil(
            sendPendingMessage()
        );
    } else if (event.tag === 'send-file') {
        event.waitUntil(
            sendPendingFile()
        );
    }
});

async function sendPendingMessage() {
    const data = localStorage.getItem('pendingMessage');
    if (data) {
        // Simulate sending (actual PeerJS connection can't fully run in SW)
        console.log('Sending pending message:', data);
        // In a real scenario, you'd need a server or a way to re-establish PeerJS in the client
        localStorage.removeItem('pendingMessage');
        self.clients.matchAll().then(clients => {
            clients.forEach(client => client.postMessage({ type: 'message-sent', data }));
        });
    }
}

async function sendPendingFile() {
    const data = localStorage.getItem('pendingFile');
    if (data) {
        console.log('Sending pending file:', data);
        localStorage.removeItem('pendingFile');
        self.clients.matchAll().then(clients => {
            clients.forEach(client => client.postMessage({ type: 'file-sent', data }));
        });
    }
}

self.addEventListener('push', event => {
    const data = event.data.json();
    const title = data.title || 'Chatro Notification';
    const options = {
        body: data.body || 'You have a new message!',
        icon: 'https://hufung.github.io/images/chatro.svg',
        vibrate: [200, 100, 200]
    };
    event.waitUntil(self.registration.showNotification(title, options));
});
