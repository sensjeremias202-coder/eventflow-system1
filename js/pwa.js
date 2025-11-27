/**
 * ============================================
 * PROGRESSIVE WEB APP (PWA)
 * ============================================
 */

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('✅ Service Worker registrado:', registration.scope);

                // Check for updates
                if (registration.waiting) {
                    // There's an updated worker waiting to activate
                    showUpdateAvailable();
                }

                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed') {
                            if (navigator.serviceWorker.controller) {
                                // New update available
                                showUpdateAvailable();
                            }
                        }
                    });
                });

                // Handle controlling service worker - when new SW takes control, reload
                navigator.serviceWorker.addEventListener('controllerchange', () => {
                    window.location.reload();
                });
            })
            .catch(error => {
                console.error('❌ Erro ao registrar Service Worker:', error);
            });
    });
}

// Install Prompt
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Mostrar botão de instalação
    showInstallButton();
});

function showInstallButton() {
    const installBtn = document.getElementById('installPWA');
    if (installBtn) {
        installBtn.style.display = 'block';
    } else {
        // Criar botão flutuante
        const btn = document.createElement('button');
        btn.id = 'installPWA';
        btn.className = 'install-pwa-btn';
        btn.innerHTML = '<i class="fas fa-download"></i> Instalar App';
        btn.onclick = installPWA;
        document.body.appendChild(btn);
    }
}

function showUpdateAvailable() {
    const el = document.getElementById('pwaUpdateNotice');
    if (el) {
        el.style.display = 'block';
    } else {
        const div = document.createElement('div');
        div.id = 'pwaUpdateNotice';
        div.className = 'pwa-update-notice';
        div.style.position = 'fixed';
        div.style.right = '20px';
        div.style.bottom = '80px';
        div.style.zIndex = '9999';
        div.innerHTML = `
            <div class="card" style="padding:10px; border-radius:8px; box-shadow: 0 6px 20px rgba(0,0,0,0.12);">
                Atualização disponível <button id="pwaUpdateBtn" class="btn btn-primary" style="margin-left:8px;">Atualizar</button>
            </div>`;
        document.body.appendChild(div);
        document.getElementById('pwaUpdateBtn')?.addEventListener('click', () => {
            const registration = navigator.serviceWorker.getRegistration();
            registration.then(reg => {
                if (!reg || !reg.waiting) return;
                reg.waiting.postMessage({ type: 'SKIP_WAITING' });
            });
        });
    }
}

async function installPWA() {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
        showNotification('App instalado com sucesso!', 'success');
    }
    
    deferredPrompt = null;
    document.getElementById('installPWA')?.remove();
}

// Detectar se está rodando como PWA
function isRunningAsPWA() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true;
}

if (isRunningAsPWA()) {
    console.log('✅ Rodando como PWA');
    document.documentElement.classList.add('pwa-mode');
}
