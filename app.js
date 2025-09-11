// Registrar el service worker 
if("serviceWorker" in navigator){
    navigator.serviceWorker.register("/serviceWorker.js")
    .then((reg) => console.log("Service worker registrado:", reg))
    .catch((err) => console.log("Error de registro de service worker:", err));
}

// Mensaje de validacion
console.log("App iniciada");