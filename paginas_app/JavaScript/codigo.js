// Configuración de Supabase
const supabaseUrl = 'https://xrdxdeermyhhlexdifae.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyZHhkZWVybXloaGxleGRpZmFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNjU4MTcsImV4cCI6MjA3NDc0MTgxN30.YWZcmKRz7FidOXBjnKlOyctcgVFQJXY1omXr6QSkQaw';

// Crear cliente Supabase
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Variables globales
let qrResultado = ""; 
let html5QrcodeScanner = null;
let estaEscaneando = false;

// Función para verificar si el transportista ya existe
async function verificarTransportistaExistente(nombreTransportista) {
    try {
        const { data, error } = await supabase
            .from('transportistas')
            .select('codigo_qr, fecha_escaneo')
            .eq('codigo_qr', nombreTransportista);

        if (error) {
            console.error('Error al verificar:', error);
            return false;
        }

        return data && data.length > 0;

    } catch (error) {
        console.error('Error inesperado al verificar:', error);
        return false;
    }
}

// Función para guardar en Supabase
async function guardarEnSupabase(datosQR) {
    try {
        console.log('Verificando si ya existe:', datosQR);
        
        // Primero verificamos si ya existe
        const yaExiste = await verificarTransportistaExistente(datosQR);
        
        if (yaExiste) {
            console.log('El transportista ya está registrado:', datosQR);
            alert('⚠️ Este transportista YA ESTÁ REGISTRADO: ' + datosQR);
            return 'ya_existe';
        }

        console.log('Guardando nuevo transportista:', datosQR);
        
        // Si no existe, lo guardamos
        const { data, error } = await supabase
            .from('transportistas')
            .insert([
                { 
                    codigo_qr: datosQR,
                    fecha_escaneo: new Date().toISOString()
                }
            ]);

        if (error) {
            console.error('Error al guardar en Supabase:', error);
            alert('❌ Error al guardar: ' + error.message);
            return 'error';
        }

        console.log('Datos guardados correctamente:', data);
        alert('✅ ¡Transportista registrado exitosamente!\nNombre: ' + datosQR);
        return 'guardado';

    } catch (error) {
        console.error('Error inesperado:', error);
        alert('❌ Error inesperado: ' + error.message);
        return 'error';
    }
}

// Función para detener el escáner
function detenerEscaner() {
    if (html5QrcodeScanner && estaEscaneando) {
        html5QrcodeScanner.clear().then(() => {
            console.log('Escáner detenido');
            estaEscaneando = false;
            document.getElementById('reader').innerHTML = '<p class="text-center text-success">Escaneo completado ✅</p>';
        }).catch(error => {
            console.error('Error al detener escáner:', error);
        });
    }
}

// Función para reiniciar el escáner
function reiniciarEscaner() {
    detenerEscaner();
    setTimeout(() => {
        iniciarEscaner();
    }, 2000); // Esperar 2 segundos antes de reiniciar
}

// Cuando el escaneo es exitoso
async function onScanSuccess(decodedText, decodedResult) {
    // Evitar múltiples escaneos simultáneos
    if (estaEscaneando) {
        console.log('Ya se está procesando un escaneo...');
        return;
    }
    
    estaEscaneando = true;
    console.log(`Código detectado: ${decodedText}`);
    
    // Guardamos el contenido en la variable
    qrResultado = decodedText;

    // Mostrar resultado
    console.log("Variable qrResultado:", qrResultado);

    // Detener el escáner inmediatamente
    detenerEscaner();

    // Guardar en Supabase (con verificación)
    const resultado = await guardarEnSupabase(qrResultado);
    
    // Opción 1: Mantener escáner detenido (comentado)
    // estaEscaneando = false;
    
    // Opción 2: Reiniciar automáticamente después de 3 segundos
    setTimeout(() => {
        estaEscaneando = false;
        reiniciarEscaner();
    }, 3000);
}

// Manejo de errores
function onScanFailure(error) {
    console.warn(`Error al escanear: ${error}`);
}

// Función para iniciar el escáner
function iniciarEscaner() {
    html5QrcodeScanner = new Html5QrcodeScanner(
        "reader",
        { 
            fps: 10, 
            qrbox: { width: 250, height: 250 },
            rememberLastUsedCamera: true 
        },
        false
    );

    html5QrcodeScanner.render(onScanSuccess, onScanFailure);
    estaEscaneando = true;
    console.log('Escáner iniciado');
}

// Inicializamos el escáner cuando la página cargue
document.addEventListener('DOMContentLoaded', function() {
    iniciarEscaner();
});