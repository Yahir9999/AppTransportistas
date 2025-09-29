// Configuración de Supabase
const supabaseUrl = 'https://xrdxdeermyhhlexdifae.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyZHhkZWVybXloaGxleGRpZmFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNjU4MTcsImV4cCI6MjA3NDc0MTgxN30.YWZcmKRz7FidOXBjnKlOyctcgVFQJXY1omXr6QSkQaw';

// Crear cliente Supabase
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Variables globales
let qrResultado = ""; 
let html5QrcodeScanner = null;

// Función para verificar si el transportista ya existe
async function verificarTransportistaExistente(nombreTransportista) {
    try {
        const { data, error } = await supabase
            .from('transportistas')
            .select('nombre_transportista')
            .eq('nombre_transportista', nombreTransportista);

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
                    nombre_transportista: datosQR,
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

// Función para detener el escáner permanentemente
function detenerEscaner() {
    if (html5QrcodeScanner) {
        html5QrcodeScanner.clear().then(() => {
            console.log('Escáner detenido permanentemente');
            // Mostrar mensaje de que el escaneo terminó
            document.getElementById('reader').innerHTML = `
                <div class="text-center">
                    <h4 class="text-success">✅ Escaneo completado</h4>
                    <p>Transportista: ${qrResultado}</p>
                    <button class="btn btn-primary mt-3" onclick="location.reload()">
                        Escanear otro código
                    </button>
                </div>
            `;
        }).catch(error => {
            console.error('Error al detener escáner:', error);
        });
    }
}

// Cuando el escaneo es exitoso
async function onScanSuccess(decodedText, decodedResult) {
    console.log(`Código detectado: ${decodedText}`);
    
    // Guardamos el contenido en la variable
    qrResultado = decodedText;

    // Mostrar resultado
    console.log("Variable qrResultado:", qrResultado);

    // Detener el escáner inmediatamente (antes de guardar)
    detenerEscaner();

    // Guardar en Supabase (con verificación)
    await guardarEnSupabase(qrResultado);
}

// Manejo de errores
function onScanFailure(error) {
    console.warn(`Error al escanear: ${error}`);
}

// Inicializamos el escáner cuando la página cargue
document.addEventListener('DOMContentLoaded', function() {
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
});