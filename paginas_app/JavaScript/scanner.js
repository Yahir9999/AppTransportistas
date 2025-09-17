function onScanSuccess(decodedText, decodedResult) {
    // Mostrar resultado
    document.getElementById("resultado").innerText = "QR Detectado: " + decodedText;

    // Guardar en localStorage (puedes cambiar a IndexedDB o enviarlo a un servidor)
    let registros = JSON.parse(localStorage.getItem("qrs")) || [];
    registros.push({ texto: decodedText, fecha: new Date().toISOString() });
    localStorage.setItem("qrs", JSON.stringify(registros));

    console.log("QR guardado:", decodedText);
}

function onScanFailure(error) {
    // Solo mensajes de error en consola, no interrumpe
    console.warn(`Error escaneando: ${error}`);
}

// Inicializar el lector
let html5QrcodeScanner = new Html5QrcodeScanner(
    "reader", 
    { fps: 10, qrbox: 250 }
);
html5QrcodeScanner.render(onScanSuccess, onScanFailure);
