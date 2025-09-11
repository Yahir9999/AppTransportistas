// Nombre donde se va a guardar el cache
const cache_name = "app-cache-1";

// Elementos que se van almacenar en el cache, al momento de no haber internet
const urlsToCache =[

    "/",
    "/index.html",
    "/index.css",
    "/app.js"
];

// Instalacion del serviceworker
self.addEventListener("install", (event) =>{
    console.log("Service worker: Instalando...");
    event.waitUntil(
        caches.open(cache_name).then((cache) =>{
            console.log("Service worker: Archivos en caché");
            return cache.addAll(urlsToCache);
        })
    );
});

// Petición
self.addEventListener("fetch", (event)=>{
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});