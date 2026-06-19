// URL DE TU DESPLIEGUE EN GOOGLE APPS SCRIPT
const WEB_APP_URL = "TU_URL_DE_APPS_SCRIPT_AQUI"; 

const statusBadge = document.getElementById('statusBadge');
let lastResult = "";
let isProcessing = false;

// Manejador visual de estados de la UI
function updateStatus(text, type) {
    statusBadge.className = `badge badge-${type}`;
    if (type === 'loading') {
        statusBadge.innerHTML = `<div class="spinner"></div><span>${text}</span>`;
    } else {
        statusBadge.innerHTML = `<span>${text}</span>`;
    }
}

// Función que se ejecuta automáticamente al detectar un QR válido
function onScanSuccess(decodedText, decodedResult) {
    if (isProcessing || decodedText === lastResult) return;
    
    isProcessing = true;
    lastResult = decodedText;
    updateStatus("Procesando y guardando...", "loading");

    // Envío asíncrono a la API .gs
    fetch(WEB_APP_URL, {
        method: "POST",
        mode: "no-cors", // Evita problemas estrictos de CORS en entornos locales
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: JSON.stringify({ qrData: decodedText })
    })
    .then(() => {
        updateStatus(`¡Guardado!: ${decodedText}`, "success");
        
        // Tiempo de espera para que el usuario vea el éxito antes de reiniciar
        setTimeout(() => {
            updateStatus("Listo para escanear", "ready");
            isProcessing = false;
            lastResult = ""; // Permite volver a escanear el mismo código si es necesario
        }, 2500);
    })
    .catch(err => {
        console.error("Error en la petición:", err);
        updateStatus("Error de conexión", "error");
        setTimeout(() => {
            updateStatus("Listo para escanear", "ready");
            isProcessing = false;
        }, 3000);
    });
}

// Configuración de inicialización del escáner de la cámara
let html5QrcodeScanner = new Html5QrcodeScanner(
    "reader", 
    { 
        fps: 15, 
        qrbox: (w, h) => { 
            const size = Math.floor(Math.min(w, h) * 0.7); 
            return { width: size, height: size }; 
        },
        rememberLastUsedCamera: true,
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
    }, 
    false
);

// Iniciar renderizado en el div #reader
html5QrcodeScanner.render(onScanSuccess, () => {});