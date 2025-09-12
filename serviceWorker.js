// Nombre del cache
const CACHE_NAME = "app-cache-v2"; // cambia el número si actualizas la app

// Archivos que quieres cachear para offline
const urlsToCache = [
    "/",
    "/index.html",
    "/paginas_app/CSS/index.css",
    "/app.js"
];

// Instalación del service worker
self.addEventListener("install", (event) => {
    console.log("Service worker: Instalando...");
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("Service worker: Archivos en cache");
            return cache.addAll(urlsToCache);
        })
    );
    self.skipWaiting(); // fuerza activación inmediata
});

// Activación del service worker
self.addEventListener("activate", (event) => {
    console.log("Service worker: Activando...");
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log("Service worker: Borrando cache antiguo", cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim(); // toma control de la página inmediatamente
});

// Fetch: Primero intenta la red, si falla usa cache
self.addEventListener("fetch", (event) => {
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Clonar la respuesta y guardarla en cache
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseClone);
                });
                return response;
            })
            .catch(() => caches.match(event.request)) // si no hay internet, usa cache
    );
});
