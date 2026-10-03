const SHELL_CACHE = 'pwa-shell-v2';
const ASSETS = [
    './',
    './index.html',
    './manifest.json'
];

self.addEventListener('install', e => {
    e.waitUntil(caches.open(SHELL_CACHE).then(c => c.addAll(ASSETS)));
    self.skipWaiting();
});

self.addEventListener('activate', e => {
    // Borra cachés antiguas de versiones previas del cascarón (pero mantiene tu simulador virtual)
    e.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.map(k => {
                if (k !== SHELL_CACHE && k !== 'virtual-app-cache') {
                    return caches.delete(k);
                }
            })
        ))
    );
    self.clients.claim();
});

self.addEventListener('fetch', e => {
    const url = new URL(e.request.url);

    // AQUÍ ESTÁ LA MAGIA CORREGIDA: Interceptar mediante parámetro seguro
    if (url.searchParams.get('app') === 'local') {
        e.respondWith(
            caches.open('virtual-app-cache').then(cache => {
                return cache.match('virtual-html').then(response => {
                    // Si existe el HTML inyectado, lo devolvemos
                    if (response) return response;
                    // Si no, devolvemos al usuario al index normal
                    return Response.redirect('index.html');
                });
            })
        );
        return; 
    }

    // Para el resto de archivos, usar caché normal
    e.respondWith(
        caches.match(e.request).then(res => res || fetch(e.request))
    );
});