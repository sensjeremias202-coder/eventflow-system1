// Scanner de QR Code Mobile
class QRCodeScanner {
    constructor() {
        this.stream = null;
        this.scanning = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    async startScanner() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } 
            });
            
            const video = document.getElementById('qr-video');
            if (video) {
                video.srcObject = this.stream;
                this.scanning = true;
                this.scanFrame();
            }
        } catch (error) {
            console.error('Erro ao acessar câmera:', error);
            showNotificationToast('Erro ao acessar câmera', 'error');
        }
    }

    scanFrame() {
        if (!this.scanning) return;

        const video = document.getElementById('qr-video');
        const canvas = document.getElementById('qr-canvas');
        
        if (video && canvas) {
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, canvas.width, canvas.height);
            
            if (code) {
                this.handleScannedCode(code.data);
                return;
            }
        }

        requestAnimationFrame(() => this.scanFrame());
    }

    handleScannedCode(data) {
        this.stopScanner();
        
        // Validar código
        if (window.enrollmentSystem) {
            const result = window.enrollmentSystem.validateQRCode(data);
            if (result.valid) {
                showNotificationToast('Check-in realizado!', 'success');
            } else {
                showNotificationToast('Código inválido', 'error');
            }
        }
    }

    stopScanner() {
        this.scanning = false;
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
    }

    renderScannerUI() {
        return `
            <div class="qr-scanner">
                <video id="qr-video" autoplay playsinline></video>
                <canvas id="qr-canvas" style="display:none;"></canvas>
                <div class="scanner-overlay">
                    <div class="scan-area"></div>
                </div>
                <button class="btn-close-scanner" onclick="qrCodeScanner.stopScanner()">Fechar</button>
            </div>
        `;
    }

    setupEventListeners() {}
}

// Inicializar
let qrCodeScanner;
document.addEventListener('DOMContentLoaded', () => {
    qrCodeScanner = new QRCodeScanner();
    window.qrCodeScanner = qrCodeScanner;
});
