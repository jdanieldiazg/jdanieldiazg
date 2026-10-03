const SHELL_CACHE = 'pwa-shell-v1';
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
    self.clients.claim();
});

self.addEventListener('fetch', e => {
    const url = new URL(e.request.url);

    // AQUÍ ESTÁ LA MAGIA: Interceptar nuestra ruta virtual
    if (url.pathname.endsWith('/app-local')) {
        e.respondWith(
            caches.open('virtual-app-cache').then(cache => {
                return cache.match('/app-local').then(response => {
                    // Si existe el HTML inyectado, lo devolvemos
                    if (response) return response;
                    // Si no, devolvemos al usuario a la pantalla de instalación
                    return Response.redirect('./');
                });
            })
        );
        return; // Detener ejecución para esta ruta
    }

    // Para el resto de archivos (index.html, manifest), usar caché normal
    e.respondWith(
        caches.match(e.request).then(res => res || fetch(e.request))
    );
});