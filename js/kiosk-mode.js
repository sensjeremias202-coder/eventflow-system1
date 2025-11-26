// Modo Quiosque
class KioskMode {
    constructor() {
        this.isActive = false;
        this.config = {
            inactivityTimeout: 120000, // 2 minutos
            allowedPages: ['checkin', 'events'],
            blockNavigation: true
        };
        this.inactivityTimer = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    activate() {
        this.isActive = true;
        document.body.classList.add('kiosk-mode');
        
        // Modo tela cheia
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        }

        // Bloquear navegação
        if (this.config.blockNavigation) {
            this.blockNavigation();
        }

        // Timer de inatividade
        this.resetInactivityTimer();

        // Interface simplificada
        this.renderKioskUI();

        showNotificationToast('Modo Quiosque Ativado', 'success');
    }

    deactivate() {
        this.isActive = false;
        document.body.classList.remove('kiosk-mode');
        
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }

        clearTimeout(this.inactivityTimer);
        showNotificationToast('Modo Quiosque Desativado', 'info');
        location.reload();
    }

    blockNavigation() {
        // Bloquear atalhos de teclado
        document.addEventListener('keydown', (e) => {
            if (this.isActive) {
                // Bloquear F11, Alt+Tab, Ctrl+W, etc
                if (e.key === 'F11' || e.altKey || (e.ctrlKey && e.key === 'w')) {
                    e.preventDefault();
                    return false;
                }
            }
        });

        // Bloquear menu de contexto
        document.addEventListener('contextmenu', (e) => {
            if (this.isActive) {
                e.preventDefault();
                return false;
            }
        });
    }

    resetInactivityTimer() {
        clearTimeout(this.inactivityTimer);
        this.inactivityTimer = setTimeout(() => {
            this.returnToHome();
        }, this.config.inactivityTimeout);
    }

    returnToHome() {
        showNotificationToast('Retornando à tela inicial...', 'info');
        window.location.hash = '#checkin';
    }

    renderKioskUI() {
        const container = document.getElementById('main-content');
        if (!container) return;

        container.innerHTML = `
            <div class="kiosk-interface">
                <div class="kiosk-header">
                    <h1>EventFlow Check-in</h1>
                    <div class="kiosk-time">${new Date().toLocaleTimeString('pt-BR')}</div>
                </div>

                <div class="kiosk-main">
                    <div class="checkin-options">
                        <button class="kiosk-button" onclick="kioskMode.showQRScanner()">
                            <i class="fas fa-qrcode"></i>
                            <span>Escanear QR Code</span>
                        </button>
                        <button class="kiosk-button" onclick="kioskMode.showManualEntry()">
                            <i class="fas fa-keyboard"></i>
                            <span>Entrada Manual</span>
                        </button>
                        <button class="kiosk-button" onclick="kioskMode.showEventsList()">
                            <i class="fas fa-calendar"></i>
                            <span>Ver Eventos</span>
                        </button>
                    </div>
                </div>

                <div class="kiosk-footer">
                    <button class="btn-exit-kiosk" onclick="kioskMode.showExitPrompt()">
                        <i class="fas fa-sign-out-alt"></i> Sair do Modo Quiosque
                    </button>
                </div>
            </div>
        `;
    }

    showQRScanner() {
        if (window.qrCodeScanner) {
            qrCodeScanner.startScanner();
        }
        this.resetInactivityTimer();
    }

    showManualEntry() {
        const modal = document.createElement('div');
        modal.className = 'modal kiosk-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Entrada Manual</h2>
                <input type="text" id="ticket-code" placeholder="Digite o código do ingresso" autofocus>
                <div class="modal-actions">
                    <button class="btn btn-primary" onclick="kioskMode.validateTicket()">Validar</button>
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancelar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.style.display = 'block';
        this.resetInactivityTimer();
    }

    showEventsList() {
        // Mostrar lista simplificada de eventos
        this.resetInactivityTimer();
    }

    validateTicket() {
        const code = document.getElementById('ticket-code')?.value;
        if (code && window.enrollmentSystem) {
            const result = window.enrollmentSystem.validateQRCode(code);
            if (result.valid) {
                showNotificationToast('✅ Check-in realizado!', 'success');
            } else {
                showNotificationToast('❌ Código inválido', 'error');
            }
        }
        document.querySelector('.kiosk-modal')?.remove();
    }

    showExitPrompt() {
        const password = prompt('Digite a senha do administrador:');
        if (password === 'admin123') { // Em produção, usar senha segura
            this.deactivate();
        } else {
            showNotificationToast('Senha incorreta', 'error');
        }
    }

    setupEventListeners() {
        // Resetar timer em qualquer interação
        ['click', 'touchstart', 'keypress'].forEach(event => {
            document.addEventListener(event, () => {
                if (this.isActive) {
                    this.resetInactivityTimer();
                }
            });
        });

        // Atualizar relógio
        setInterval(() => {
            const timeElement = document.querySelector('.kiosk-time');
            if (timeElement) {
                timeElement.textContent = new Date().toLocaleTimeString('pt-BR');
            }
        }, 1000);
    }
}

// Inicializar
let kioskMode;
document.addEventListener('DOMContentLoaded', () => {
    kioskMode = new KioskMode();
    window.kioskMode = kioskMode;
});
