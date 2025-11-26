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
