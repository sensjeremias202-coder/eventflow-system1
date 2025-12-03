// ============================================
// SISTEMA DE NOTIFICAÇÕES
// ============================================

// Sistema de notificações toast
function showNotification(message, type = 'info', duration = 3000) {
    // Tipos: success, error, warning, info
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#43e97b' : type === 'error' ? '#f72585' : type === 'warning' ? '#ffa726' : '#4361ee'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 10px;
        max-width: 400px;
        animation: slideInRight 0.3s ease;
    `;
    
    const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : type === 'warning' ? '⚠' : 'ℹ';
    notification.innerHTML = `
        <span style="font-size: 1.2em; font-weight: bold;">${icon}</span>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, duration);
}

// Alias para compatibilidade
window.showNotification = showNotification;
window.showNotificationToast = showNotification;

// Indicador de modo de execução (diagnóstico)
(function() {
    const isFile = location.protocol === 'file:';
    const host = location.host || '(local file)';
    const mode = isFile ? 'offline-file' : (host.includes('github.io') ? 'github-pages' : 'http-server');
    console.log(`[runtime] 🛰️ Modo: ${mode} — host: ${host}`);
        // Modo local/online controlado por flag persistente
        try {
            const onlineSync = localStorage.getItem('ONLINE_SYNC') === 'true';
            window.FORCE_LOCAL_MODE = !onlineSync;
            console.log(`[runtime] 🔁 ONLINE_SYNC=${onlineSync} → FORCE_LOCAL_MODE=${window.FORCE_LOCAL_MODE}`);
        } catch {
            window.FORCE_LOCAL_MODE = true;
        }
    if (isFile) {
        console.log('[runtime] ℹ️ Recursos limitados: sem cookies/Analytics e sem Ollama (CORS).');
    }
    // Mostrar landing pública quando não houver usuário
    try {
        const publicHome = document.getElementById('publicHome');
        const loginScreen = document.getElementById('loginScreen');
        const appEl = document.getElementById('app');
        const storedUser = localStorage.getItem('currentUser');
        if (publicHome && !storedUser) {
            publicHome.style.display = 'block';
            if (loginScreen) loginScreen.style.display = 'none';
            if (appEl) appEl.style.display = 'none';
            // Configurar imagem QR Pix via localStorage (opcional) ou default externo
            try {
                const storedPixImg = localStorage.getItem('PIX_QR_IMAGE_URL');
                if (storedPixImg) {
                    window.PIX_QR_IMAGE_URL = storedPixImg;
                } else {
                    // Default: imagem QR gerada por serviço público usando o payload
                    const encoded = encodeURIComponent('00020126580014BR.GOV.BCB.PIX01367ff75fa1-d260-48e9-a82c-28d8751e3113520400005303986540510.005802BR5922Sens Jeremias Francois6009SAO PAULO62140510by2vmxwgfc6304D190');
                    window.PIX_QR_IMAGE_URL = `https://api.qrserver.com/v1/create-qr-code/?data=${encoded}&size=240x240`;
                }
            } catch {}
            // Popular lista pública de próximos eventos
            const listEl = document.getElementById('publicEventsList');
            let evts = (typeof window !== 'undefined' && window.events) ? window.events : [];
            if ((!evts || evts.length === 0) && localStorage.getItem('events')) {
                try { evts = JSON.parse(localStorage.getItem('events')) || []; } catch {}
            }
            if (listEl) {
                let upcoming = Array.isArray(evts) ? evts.filter(e => !!e.date) : [];
                // Filtrar por comunidade ativa, se houver marcação nos eventos
                try {
                    const cid = (window.communities && typeof window.communities.getActiveId==='function') ? window.communities.getActiveId() : (localStorage.getItem('activeCommunityId')||null);
                    if (cid){
                        upcoming = upcoming.filter(e => !e.communityId || e.communityId === cid);
                    }
                } catch {}
                upcoming = upcoming.slice(0,5);
                if (upcoming.length === 0) {
                    // Fallback: tentar carregar eventos públicos de um JSON estático
                    try {
                        fetch('public-events.json?v=' + (window.APP_VERSION || Date.now()))
                            .then(r => r.ok ? r.json() : [])
                            .then(data => {
                                if (Array.isArray(data) && data.length > 0) {
                                    window.__publicEventsCache = data;
                                    let filtered = data.filter(e => !!e.date);
                                    try {
                                        const cid = (window.communities && typeof window.communities.getActiveId==='function') ? window.communities.getActiveId() : (localStorage.getItem('activeCommunityId')||null);
                                        if (cid){ filtered = filtered.filter(e => !e.communityId || e.communityId === cid); }
                                    } catch {}
                                    upcoming = filtered.slice(0, 5);
                                    window.renderPublicEvents && window.renderPublicEvents(upcoming);
                                } else {
                                    listEl.innerHTML = '<p style="color:#666;">Nenhum evento disponível no momento.</p>';
                                }
                            })
                            .catch(() => { listEl.innerHTML = '<p style="color:#666;">Nenhum evento disponível no momento.</p>'; });
                    } catch {
                        listEl.innerHTML = '<p style="color:#666;">Nenhum evento disponível no momento.</p>';
                    }
                } else {
                    listEl.innerHTML = upcoming.map(e => {
                        const enrolled = Array.isArray(e.enrolled) ? e.enrolled.length : 0;
                        const max = e.maxParticipants ? parseInt(e.maxParticipants) : null;
                        const remaining = max != null ? Math.max(0, max - enrolled) : null;
                        const full = max != null && remaining === 0;
                        return `
                        <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid #eee;">
                            <div>
                                <strong>${e.title || e.name || 'Evento'}</strong>
                                <div style="color:#666; font-size:13px;"><i class="fas fa-calendar"></i> ${e.date} • <i class="fas fa-clock"></i> ${e.time || ''}</div>
                                <div style="color:#666; font-size:13px;"><i class="fas fa-map-marker-alt"></i> ${e.location || ''}</div>
                                ${max != null ? `<div style="color:${full ? '#f72585' : '#2a9d8f'}; font-size:12px; margin-top:4px;">${full ? 'Lotado' : `${remaining} vagas restantes`} • ${enrolled}/${max} inscritos</div>` : ''}
                            </div>
                            <a class="btn ${full ? 'btn-outline' : 'btn-outline'}" href="#" ${full ? 'style="opacity:0.6; pointer-events:none;"' : ''} onclick="window.requestEnrollment && window.requestEnrollment('${e.id}')">Inscrever-se</a>
                        </div>`;
                    }).join('');
                }
            }
            // Parametrizar links de redes sociais (substitua pelos seus)
            const ig = document.getElementById('socialInstagram');
            const em = document.getElementById('socialEmail');
            const wa = document.getElementById('socialWhatsApp');
            // Permite definir via localStorage para personalizar sem editar código
            const lsIg = localStorage.getItem('SOCIAL_INSTAGRAM_URL') || 'https://instagram.com/ssn_ef';
            const lsEm = localStorage.getItem('SOCIAL_EMAIL_URL') || 'mailto:sensjeremias@gmail.com';
            const lsWa = localStorage.getItem('SOCIAL_WHATSAPP_URL') || 'https://wa.me/5511988657266';
            if (ig) {
                ig.href = lsIg;
                ig.innerHTML = '<i class="fab fa-instagram"></i> Instagram @ssn_ef';
            }
            if (em) {
                em.href = lsEm;
                em.innerHTML = '<i class="fas fa-envelope"></i> E-mail sensjeremias@gmail.com';
            }
            if (wa) {
                wa.href = lsWa;
                wa.innerHTML = '<i class="fab fa-whatsapp"></i> WhatsApp +5511988657266';
            }
            // Configurar PIX
            const pixBtn = document.getElementById('donatePixBtn');
            if (pixBtn) {
                window.PIX_PAYLOAD = '00020126580014BR.GOV.BCB.PIX01367ff75fa1-d260-48e9-a82c-28d8751e3113520400005303986540510.005802BR5922Sens Jeremias Francois6009SAO PAULO62140510by2vmxwgfc6304D190';
                // Se você tiver uma imagem oficial do QR, defina window.PIX_QR_IMAGE_URL com a URL
                // Ex.: window.PIX_QR_IMAGE_URL = 'https://.../meu_qr.png';
                pixBtn.onclick = function(){
                    const modal = document.getElementById('pixModal');
                    const textEl = document.getElementById('pixPayloadText');
                    const qrEl = document.getElementById('pixQr');
                    if (textEl) textEl.textContent = window.PIX_PAYLOAD;
                    // Se houver uma imagem de QR fornecida, usar diretamente
                    if (qrEl && window.PIX_QR_IMAGE_URL) {
                        qrEl.innerHTML = `<img alt="QR Pix" width="240" height="240" style="display:block; border-radius:8px;" src="${window.PIX_QR_IMAGE_URL}"/>`;
                    } else {
                    function tryRenderQR(){
                        if (qrEl && window.PIX_PAYLOAD && typeof QRCode !== 'undefined') {
                            try {
                                qrEl.innerHTML = '';
                                new QRCode(qrEl, { text: window.PIX_PAYLOAD, width: 240, height: 240, correctLevel: (QRCode.CorrectLevel && QRCode.CorrectLevel.H) ? QRCode.CorrectLevel.H : 2 });
                                return true;
                            } catch(e){ console.warn('[pix] Falha ao gerar QR:', e); }
                        }
                        return false;
                    }
                    // Tenta render imediatamente; se a lib veio do CDN, aguarda carregar
                    let rendered = tryRenderQR();
                    if (!rendered) {
                        let attempts = 0;
                        const timer = setInterval(() => {
                            attempts++;
                            if (tryRenderQR() || attempts > 20) {
                                clearInterval(timer);
                                // Fallback via imagem se não renderizou
                                if (!tryRenderQR() && qrEl && window.PIX_PAYLOAD) {
                                    const encoded = encodeURIComponent(window.PIX_PAYLOAD);
                                    qrEl.innerHTML = `<img alt="QR Pix" width="240" height="240" style="display:block; margin:0 auto;" src="https://api.qrserver.com/v1/create-qr-code/?data=${encoded}&size=240x240"/>`;
                                }
                            }
                        }, 100);
                    }
                    }
                    if (modal) modal.style.display = 'block';
                };
            }
        }
    } catch (e) {
        console.warn('[runtime] Landing pública não pôde ser exibida:', e);
    }
})();

// Banner persistente de segurança do Firebase
document.addEventListener('DOMContentLoaded', () => {
    const banner = document.getElementById('firebaseSecurityBanner');
    const dismissBtn = document.getElementById('dismissSecurityBanner');
    let bannerDismissed = false;

    function updateSecurityBanner() {
        if (!banner) return;
        const issue = !!window.firebaseSecurityIssue;
        banner.style.display = (!bannerDismissed && issue) ? 'flex' : 'none';
    }

    if (dismissBtn) {
        dismissBtn.addEventListener('click', () => {
            bannerDismissed = true;
            updateSecurityBanner();
        });
    }

    window.addEventListener('firebase:security-issue', updateSecurityBanner);
    window.addEventListener('firebase:security-ok', () => {
        bannerDismissed = false;
        updateSecurityBanner();
    });
    updateSecurityBanner();

    // CTA na landing
    const ctaEnter = document.getElementById('ctaEnterCommunity');
    const ctaCreate = document.getElementById('ctaCreateCommunity');
    if (ctaEnter) ctaEnter.addEventListener('click', (e) => { e.preventDefault(); try {
        document.getElementById('loginScreen').style.display='block';
        document.getElementById('publicHome').style.display='none';
    } catch{}
    });
    if (ctaCreate) ctaCreate.addEventListener('click', (e) => { e.preventDefault(); try {
        const btn = document.getElementById('createCommunityBtn');
        if (btn) btn.click();
    } catch{}
    });

    // Chip de comunidade ativa
        try {
                const chip = document.getElementById('communityChip');
                const menu = document.getElementById('communityMenu');
                const name = (window.communities && typeof window.communities.getActiveName==='function') ? window.communities.getActiveName() : (localStorage.getItem('activeCommunityName')||null);
                if (chip && name) { chip.textContent = name; chip.style.display = 'inline-block'; }
                window.addEventListener('community:changed', () => {
                    const n = (window.communities && typeof window.communities.getActiveName==='function') ? window.communities.getActiveName() : (localStorage.getItem('activeCommunityName')||'');
                    if (chip) { chip.textContent = n || ''; chip.style.display = n ? 'inline-block' : 'none'; }
                });
                if (chip && menu) {
                    chip.addEventListener('click', (e) => {
                        const rect = chip.getBoundingClientRect();
                        menu.style.left = (rect.left) + 'px';
                        menu.style.top = (rect.bottom + 6 + window.scrollY) + 'px';
                        menu.style.display = (menu.style.display==='block'?'none':'block');
                    });
                    document.addEventListener('click', (e)=>{
                        if (!menu.contains(e.target) && e.target !== chip) menu.style.display='none';
                    });
                    const switchBtn = document.getElementById('menuSwitchCommunity');
                    const pendBtn = document.getElementById('menuViewPendings');
                    const copyBtn = document.getElementById('menuCopyCommunityId');
                    if (switchBtn) switchBtn.addEventListener('click',(e)=>{ e.preventDefault(); const btn=document.getElementById('quickSwitchCommunityBtn'); if(btn) btn.click(); menu.style.display='none'; });
                    if (pendBtn) pendBtn.addEventListener('click',(e)=>{ e.preventDefault(); const list=document.getElementById('pendingsList'); if(list){ list.scrollIntoView({behavior:'smooth'});} menu.style.display='none'; });
                    if (copyBtn) copyBtn.addEventListener('click',(e)=>{ e.preventDefault(); try{ const id=(window.communities && typeof window.communities.getActiveId==='function')?window.communities.getActiveId():localStorage.getItem('activeCommunityId'); navigator.clipboard.writeText(id||''); showNotification('ID da comunidade copiado','success'); }catch{} menu.style.display='none'; });
                }
        } catch{}
});

// Modo diagnóstico: Testar acesso às regras
document.addEventListener('DOMContentLoaded', () => {
    const testBtn = document.getElementById('testFirebaseAccessBtn');
    if (testBtn) {
        testBtn.addEventListener('click', async () => {
            try {
                const cid = (window.communities && typeof window.communities.getActiveId==='function') ? window.communities.getActiveId() : (localStorage.getItem('activeCommunityId')||null);
                const basePath = cid ? `communities/${cid}` : '';
                const pathEl = document.getElementById('firebaseDiagPath');
                const resultEl = document.getElementById('firebaseDiagResult');
                const modal = document.getElementById('firebaseDiagModal');
                if (pathEl) pathEl.textContent = basePath ? `${basePath}/_rules_probe` : '(sem comunidade ativa)';
                if (resultEl) resultEl.textContent = 'Executando checagem...';
                if (modal) modal.style.display = 'block';
                if (!basePath) {
                    if (resultEl) resultEl.textContent = 'Nenhuma comunidade ativa selecionada. Selecione antes de testar.';
                    return;
                }
                                const start = performance.now();
                                let output = '';
                                const nodes = ['events','users','categories'];
                                for (const n of nodes) {
                                    try {
                                        await window.checkDatabaseRulesStatus(`${basePath}`);
                                        const ms = Math.round(performance.now() - start);
                                        output += `<div><strong>${n}:</strong> <span style=\"color:#2a9d8f;\">ok</span> • ${ms}ms</div>`;
                                    } catch (errNode) {
                                        const ms = Math.round(performance.now() - start);
                                        const code = (errNode && errNode.code) ? errNode.code : 'erro';
                                        output += `<div><strong>${n}:</strong> <span style=\"color:#f72585;\">negado (${code})</span> • ${ms}ms</div>`;
                                    }
                                }
                                try {
                                    const ms = Math.round(performance.now() - start);
                                    await window.checkDatabaseRulesStatus(basePath);
                                    output = `<div><strong>base:</strong> <span style=\"color:#2a9d8f;\">ok</span> • ${ms}ms</div>` + output;
                                    if (resultEl) resultEl.innerHTML = output;
                                } catch (err) {
                                    const ms = Math.round(performance.now() - start);
                                    const code = (err && err.code) ? err.code : 'erro_desconhecido';
                                    const msg = (err && err.message) ? err.message : String(err);
                                    if (resultEl) resultEl.innerHTML = `<div><strong>base:</strong> <span style=\"color:#f72585;\">negado (${code})</span> • ${ms}ms</div><small>${msg}</small>` + output;
                                }
            } catch(e) {
                showNotification('Falha ao executar diagnóstico: ' + e, 'error');
            }
        });
    }
});

// Exibir banner de consentimento de cookies (Analytics)
(function(){
    try {
        const consentEl = document.getElementById('cookieConsent');
        if (!consentEl) return;
        const consent = localStorage.getItem('cookieConsent');
        if (!consent) {
            consentEl.style.display = 'flex';
        }
        const acceptBtn = document.getElementById('cookiesAccept');
        const rejectBtn = document.getElementById('cookiesReject');
        const privacyBtn = document.getElementById('privacyBtn');
        if (acceptBtn) acceptBtn.onclick = function(){ localStorage.setItem('cookieConsent','yes'); document.getElementById('cookieConsent').style.display='none'; window.cookieConsent='yes'; };
        if (rejectBtn) rejectBtn.onclick = function(){ localStorage.setItem('cookieConsent','no'); document.getElementById('cookieConsent').style.display='none'; window.cookieConsent='no'; };
        if (privacyBtn) privacyBtn.onclick = function(){ document.getElementById('privacyModal').style.display='block'; };
    } catch(e) {
        console.warn('[runtime] Cookie consent não pôde ser exibido:', e);
    }
})();

// Renderer público (reutilizável) — pode ser chamado pelo sync
window.renderPublicEvents = function(evts){
    try {
        const listEl = document.getElementById('publicEventsList');
        if (!listEl) return;
        const upcoming = Array.isArray(evts) ? evts.filter(e => !!e.date).slice(0, 5) : [];
        if (upcoming.length === 0) {
            listEl.innerHTML = '<p style="color:#666;">Nenhum evento cadastrado no momento.</p>';
        } else {
            listEl.innerHTML = upcoming.map(e => {
                const enrolled = Array.isArray(e.enrolled) ? e.enrolled.length : 0;
                const max = e.maxParticipants ? parseInt(e.maxParticipants) : null;
                const remaining = max != null ? Math.max(0, max - enrolled) : null;
                const full = max != null && remaining === 0;
                return `
                <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid #eee;">
                    <div>
                        <strong>${e.title || e.name || 'Evento'}</strong>
                        <div style="color:#666; font-size:13px;"><i class="fas fa-calendar"></i> ${e.date} • <i class="fas fa-clock"></i> ${e.time || ''}</div>
                        <div style="color:#666; font-size:13px;"><i class="fas fa-map-marker-alt"></i> ${e.location || ''}</div>
                        ${max != null ? `<div style="color:${full ? '#f72585' : '#2a9d8f'}; font-size:12px; margin-top:4px;">${full ? 'Lotado' : `${remaining} vagas restantes`} • ${enrolled}/${max} inscritos</div>` : ''}
                    </div>
                    <a class="btn ${full ? 'btn-outline' : 'btn-outline'}" href="#" ${full ? 'style="opacity:0.6; pointer-events:none;"' : ''} onclick="window.requestEnrollment && window.requestEnrollment('${e.id}')">Inscrever-se</a>
                </div>`;
            }).join('');
        }
    } catch(e){
        console.warn('[public] Falha ao renderizar eventos:', e);
    }
};

// Fluxo público: solicitar inscrição com redirecionamento ao login e retomada
window.requestEnrollment = function(eventId){
    try {
        localStorage.setItem('pendingEnrollmentEventId', String(eventId));
    } catch {}
    const loginScreen = document.getElementById('loginScreen');
    const publicHome = document.getElementById('publicHome');
    if (publicHome) publicHome.style.display = 'none';
    if (loginScreen) loginScreen.style.display = 'block';
    if (typeof showLoginForm === 'function') showLoginForm();
};

// ============================================
// SISTEMA DE CONFIRMAÇÃO
// ============================================

// Modal de confirmação genérico que retorna uma Promise
function showConfirm(message, title = 'Confirmação', options = {}) {
    // options: { type: 'primary'|'danger'|'warning' }
    return new Promise((resolve) => {
        const modal = document.getElementById('confirmModal');
        const msgEl = document.getElementById('confirmModalMessage');
        const titleEl = document.getElementById('confirmModalTitle');
        const okBtn = document.getElementById('confirmOkBtn');
        const cancelBtn = document.getElementById('confirmCancelBtn');
        const closeBtns = modal ? modal.querySelectorAll('.modal-close') : [];

        if (!modal || !okBtn || !cancelBtn || !msgEl || !titleEl) {
            // fallback para confirm() se modal não existir
            const result = window.confirm(message);
            resolve(result);
            return;
        }

        const type = options.type || 'primary';
        // set data-type to allow CSS theming
        modal.setAttribute('data-type', type);

        titleEl.textContent = title;
        msgEl.textContent = message;
        modal.classList.add('active');

        // backdrop click handler (fechar ao clicar fora do conteúdo)
        function onBackdropClick(e) {
            if (e.target === modal) onCancel();
        }

        // Handlers
        function cleanup() {
            modal.classList.remove('active');
            modal.removeEventListener('click', onBackdropClick);
            okBtn.removeEventListener('click', onOk);
            cancelBtn.removeEventListener('click', onCancel);
            closeBtns.forEach(b => b.removeEventListener('click', onCancel));
            modal.removeAttribute('data-type');
        }

        function onOk() {
            cleanup();
            resolve(true);
        }

        function onCancel() {
            cleanup();
            resolve(false);
        }

        modal.addEventListener('click', onBackdropClick);
        okBtn.addEventListener('click', onOk);
        cancelBtn.addEventListener('click', onCancel);
        closeBtns.forEach(b => b.addEventListener('click', onCancel));
    });
}

function setupNavigation() {
    // Definir páginas permitidas por role
    const allowedPages = {
        'admin': ['dashboard', 'events', 'profile', 'chat', 'calendar', 'volunteers', 'financeiro', 'graficos', 'analytics', 'payments', 'streaming', 'settings', 'users', 'categories', 'ai-assistant'],
        'treasurer': ['dashboard', 'events', 'profile', 'chat', 'calendar', 'volunteers', 'financeiro', 'graficos', 'analytics', 'payments', 'users', 'categories'],
        'jovens': ['events', 'chat', 'profile', 'calendar', 'volunteers'] // Jovens: Eventos, Chat, Perfil, Calendário e Voluntários
    };
    
    // Navegação principal
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            if (page) {
                // Verificar permissão de acesso
                const userRole = currentUser?.role || 'jovens';
                const allowed = allowedPages[userRole] || ['events', 'chat', 'profile'];
                
                if (!allowed.includes(page)) {
                    showNotification('❌ Você não tem permissão para acessar esta página', 'error');
                    return;
                }
                
                showPage(page);
                
                // Atualizar estado ativo
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
    
    // Navegação da sidebar
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            if (page) {
                // Verificar permissão de acesso
                const userRole = currentUser?.role || 'jovens';
                const allowed = allowedPages[userRole] || ['events', 'chat', 'profile'];
                
                if (!allowed.includes(page)) {
                    showNotification('❌ Você não tem permissão para acessar esta página', 'error');
                    return;
                }
                
                showPage(page);
                
                // Registrar navegação no Analytics
                if (window.logAnalyticsEvent) {
                    logAnalyticsEvent('page_view', {
                        page_title: page,
                        page_location: window.location.href + '#' + page
                    });
                }
                
                // Atualizar estado ativo
                document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
                this.classList.add('active');
                
                // Atualizar navegação principal
                document.querySelectorAll('.nav-link').forEach(l => {
                    l.classList.remove('active');
                    if (l.getAttribute('data-page') === page) {
                        l.classList.add('active');
                    }
                });
            }
        });
    });
    
    // Botão de logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn && !logoutBtn.dataset.listenerAdded) {
        logoutBtn.dataset.listenerAdded = 'true';
        
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Tem certeza que deseja sair?')) {
                // Parar atualizações automáticas se existirem
                if (typeof stopAutoMessages === 'function') stopAutoMessages();
                
                // Limpar sessão
                currentUser = null;
                localStorage.removeItem('currentUser');
                
                const app = document.getElementById('app');
                const loginScreen = document.getElementById('loginScreen');
                
                if (app) app.style.display = 'none';
                if (loginScreen) loginScreen.style.display = 'flex';
                
                showLoginForm();
                showNotification('Logout realizado com sucesso!', 'success');
                
                // Recarregar página para limpar tudo
                setTimeout(() => location.reload(), 500);
            }
        });
    }
}

function setupButtons() {
    // Configurar botão "Meus Eventos" para usuários comuns
    const myEventsBtn = document.getElementById('myEventsBtn');
    if (myEventsBtn && currentUser && currentUser.role === 'user' && !myEventsBtn.dataset.listenerAdded) {
        myEventsBtn.dataset.listenerAdded = 'true';
        myEventsBtn.style.display = 'block';
        myEventsBtn.addEventListener('click', function() {
            loadMyEvents();
        });
    }

    // Botão visível para criar evento (todos os usuários logados)
    const createEventBtn = document.getElementById('createEventBtn');
    const addEventModal = document.getElementById('addEventModal');
    if (createEventBtn && currentUser && !createEventBtn.dataset.listenerAdded) {
        createEventBtn.dataset.listenerAdded = 'true';
        // Mostrar botão para usuários logados; administradores já têm botão admin-only
        createEventBtn.style.display = 'inline-block';
        createEventBtn.addEventListener('click', function() {
            // Carregar opções de categoria antes de abrir
            if (typeof loadCategoryOptions === 'function') loadCategoryOptions();
            if (addEventModal) addEventModal.classList.add('active');
        });
    }

    // Botão para gerenciamento de usuários (apenas admins)
    const manageUsersBtn = document.getElementById('manageUsersBtn');
    if (manageUsersBtn && currentUser && currentUser.role === 'admin' && !manageUsersBtn.dataset.listenerAdded) {
        manageUsersBtn.dataset.listenerAdded = 'true';
        manageUsersBtn.style.display = 'inline-block';
        manageUsersBtn.addEventListener('click', function() {
            // Mostrar a página de usuários e carregar a tabela
            showPage('users');
            // A tabela de usuários será carregada pelo page-loader em initializePage('users')
            // atualizar estado ativo nos links
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            const nav = document.querySelector('[data-page="users"]');
            if (nav) nav.classList.add('active');
        });
    }

    // Botão de restaurar dados de demonstração
    const resetBtn = document.getElementById('resetDataBtn');
    if (resetBtn && currentUser && currentUser.role === 'admin' && !resetBtn.dataset.listenerAdded) {
        resetBtn.dataset.listenerAdded = 'true';
        resetBtn.style.display = 'inline-block';
        resetBtn.addEventListener('click', resetDemoData);
    }
    
    // Botão de limpar cache local
    const clearCacheBtn = document.getElementById('clearCacheBtn');
    if (clearCacheBtn && currentUser && !clearCacheBtn.dataset.listenerAdded) {
        clearCacheBtn.dataset.listenerAdded = 'true';
        clearCacheBtn.style.display = 'inline-block';
        clearCacheBtn.addEventListener('click', function() {
            if (confirm('⚠️ Isso vai limpar todos os dados locais e recarregar do Firebase.\n\nContinuar?')) {
                console.log('[cache] Limpando localStorage...');
                
                // Salvar usuário atual
                const savedUser = localStorage.getItem('currentUser');
                
                // Limpar tudo
                localStorage.clear();
                
                // Restaurar usuário
                if (savedUser) {
                    localStorage.setItem('currentUser', savedUser);
                }
                
                showNotification('Cache limpo! Recarregando dados do Firebase...', 'success');
                
                // Recarregar página após 1 segundo
                setTimeout(() => {
                    location.reload();
                }, 1000);
            }
        });
    }
    
    // Botão de forçar sincronização
    const forceSyncBtn = document.getElementById('forceSyncBtn');
    if (forceSyncBtn && window.firebaseInitialized && window.firebaseDatabase && !forceSyncBtn.dataset.listenerAdded) {
        forceSyncBtn.dataset.listenerAdded = 'true';
        forceSyncBtn.style.display = 'inline-block';
        forceSyncBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('[sync] 🔄 Sincronização forçada iniciada pelo usuário');
            
            if (typeof saveDataWithSync === 'function') {
                saveDataWithSync();
                showNotification('Sincronizando dados com Firebase...', 'info');
            } else {
                showNotification('Sistema de sincronização não disponível', 'error');
            }
        });
    }
}

function showPage(page) {
    if (!page) return;
    
    console.log('[app] 🔄 Mostrando página:', page);
    
    // Usar sistema modular de carregamento
    if (typeof showModularPage === 'function') {
        showModularPage(page);
    } else {
        // Fallback para sistema antigo (se page-loader não carregou)
        console.warn('[app] ⚠️ page-loader não disponível, usando sistema antigo');
        
        // Ocultar todas as páginas
        document.querySelectorAll('.page').forEach(p => {
            if (p.classList.contains('active')) {
                p.classList.remove('active');
            }
        });
        
        // Mostrar a página solicitada
        const pageElement = document.getElementById(`${page}-page`);
        if (pageElement) {
            pageElement.classList.add('active');
        }
        
        // Recarregar dados específicos da página
        switch (page) {
            case 'dashboard':
                if (typeof loadDashboard === 'function') loadDashboard();
                break;
            case 'events':
                console.log('[app] 📅 Carregando página de eventos...');
                if (typeof loadEvents === 'function') {
                    loadEvents();
                } else {
                    console.error('[app] ❌ Função loadEvents não encontrada!');
                }
                break;
            case 'profile':
                if (typeof loadProfile === 'function') loadProfile();
                break;
            case 'chat':
                if (typeof loadChatUsers === 'function') loadChatUsers();
                break;
            case 'users':
                if (currentUser && currentUser.role === 'admin' && typeof loadUsersTable === 'function') {
                    loadUsersTable();
                }
                break;
            case 'categories':
                if (currentUser && currentUser.role === 'admin' && typeof loadCategoriesTable === 'function') {
                    loadCategoriesTable();
                }
                break;
        }
    }
}

// Validações de formulário (definidas antes de setupModals para estarem disponíveis)
function validateEventForm() {
    const title = document.getElementById('eventTitle')?.value.trim();
    const date = document.getElementById('eventDate')?.value;
    const time = document.getElementById('eventTime')?.value;
    const location = document.getElementById('eventLocation')?.value.trim();
    const description = document.getElementById('eventDescription')?.value.trim();
    const category = document.getElementById('eventCategory')?.value;
    const maxStr = document.getElementById('eventMaxParticipants')?.value?.trim();
    
    if (!title) {
        showNotification('Título do evento é obrigatório', 'error');
        return false;
    }
    
    if (!date) {
        showNotification('Data do evento é obrigatória', 'error');
        return false;
    }
    
    if (new Date(date) < new Date().setHours(0,0,0,0)) {
        showNotification('Data do evento não pode ser no passado', 'error');
        return false;
    }
    
    if (!time) {
        showNotification('Horário do evento é obrigatório', 'error');
        return false;
    }
    
    if (!location) {
        showNotification('Local do evento é obrigatório', 'error');
        return false;
    }
    
    if (!description) {
        showNotification('Descrição do evento é obrigatória', 'error');
        return false;
    }
    
    if (!category) {
        showNotification('Categoria do evento é obrigatória', 'error');
        return false;
    }
    
    if (maxStr) {
        const max = parseInt(maxStr, 10);
        if (isNaN(max) || max < 1) {
            showNotification('Número de vagas deve ser um inteiro maior que 0', 'error');
            return false;
        }
    }
    
    return true;
}

function validateUserForm() {
    const name = document.getElementById('newUserName')?.value.trim();
    const email = document.getElementById('newUserEmail')?.value.trim();
    const password = document.getElementById('newUserPassword')?.value;
    
    if (!name) {
        showNotification('Nome do usuário é obrigatório', 'error');
        return false;
    }
    
    if (!email) {
        showNotification('E-mail do usuário é obrigatório', 'error');
        return false;
    }
    
    // Validação simples de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showNotification('Por favor, insira um e-mail válido', 'error');
        return false;
    }
    
    if (!password) {
        showNotification('Senha do usuário é obrigatória', 'error');
        return false;
    }
    
    if (password.length < 6) {
        showNotification('A senha deve ter pelo menos 6 caracteres', 'error');
        return false;
    }
    
    return true;
}

function validateCategoryForm() {
    const name = document.getElementById('categoryName')?.value.trim();
    const icon = document.getElementById('categoryIcon')?.value.trim();
    
    if (!name) {
        showNotification('Nome da categoria é obrigatório', 'error');
        return false;
    }
    
    if (!icon) {
        showNotification('Ícone da categoria é obrigatório', 'error');
        return false;
    }
    
    return true;
}

function setupModals() {
    // Modal de evento
    // Usar delegação de eventos para botões que podem não existir ainda
    document.body.addEventListener('click', function(e) {
        // Botão adicionar evento
        if (e.target.closest('#addEventBtn')) {
            e.preventDefault();
            const addEventModal = document.getElementById('addEventModal');
            if (addEventModal) {
                loadCategoryOptions();
                addEventModal.classList.add('active');
            }
        }
        
        // Fechar modal de evento
        if (e.target.closest('#addEventModal .modal-close')) {
            const addEventModal = document.getElementById('addEventModal');
            if (addEventModal) {
                addEventModal.classList.remove('active');
                const form = document.getElementById('addEventForm');
                if (form) {
                    form.reset();
                    const submitBtn = form.querySelector('button[type="submit"]');
                    if (submitBtn) {
                        submitBtn.textContent = 'Criar Evento';
                    }
                }
            }
        }
        
    });
    
    // Delegação de eventos para submits de formulários
    document.body.addEventListener('submit', function(e) {
        // Form de adicionar evento
        if (e.target.id === 'addEventForm') {
            e.preventDefault();
            if (validateEventForm()) {
                // Cria o evento anexando a comunidade ativa
                const cid = (window.communities && typeof window.communities.getActiveId==='function') ? window.communities.getActiveId() : (localStorage.getItem('activeCommunityId')||null);
                if (!cid){
                    showNotification('Selecione uma comunidade antes de criar eventos.', 'warning');
                    return;
                }
                const newEvent = {
                    id: (events && events.length ? (Math.max(...events.map(e=>Number(e.id)||0))+1) : 1),
                    title: document.getElementById('eventTitle')?.value.trim(),
                    name: document.getElementById('eventTitle')?.value.trim(),
                    date: document.getElementById('eventDate')?.value,
                    time: document.getElementById('eventTime')?.value,
                    location: document.getElementById('eventLocation')?.value.trim(),
                    description: document.getElementById('eventDescription')?.value.trim(),
                    category: parseInt(document.getElementById('eventCategory')?.value,10),
                    maxParticipants: (function(){ const v = document.getElementById('eventMaxParticipants')?.value?.trim(); return v?parseInt(v,10):null; })(),
                    image: '',
                    createdBy: currentUser?.id || null,
                    enrolled: [],
                    communityId: cid
                };
                events = Array.isArray(events) ? [...events, newEvent] : [newEvent];
                localStorage.setItem('events', JSON.stringify(events));
                if (typeof saveData === 'function') saveData();
                showNotification('Evento criado com sucesso!', 'success');
                const addEventModal = document.getElementById('addEventModal');
                if (addEventModal) addEventModal.classList.remove('active');
                const form = document.getElementById('addEventForm');
                if (form) form.reset();
                if (typeof loadEvents === 'function') loadEvents();
            }
        }
        
        // Form de adicionar usuário
        if (e.target.id === 'addUserForm') {
            e.preventDefault();
            if (validateUserForm()) {
                const cid = (window.communities && typeof window.communities.getActiveId==='function') ? window.communities.getActiveId() : (localStorage.getItem('activeCommunityId')||null);
                if (!cid){
                    showNotification('Selecione uma comunidade antes de criar usuários.', 'warning');
                    return;
                }
                const name = document.getElementById('newUserName')?.value.trim();
                const email = document.getElementById('newUserEmail')?.value.trim();
                const password = document.getElementById('newUserPassword')?.value;
                const role = document.getElementById('newUserRole')?.value || 'jovens';
                const newId = (users && users.length ? (Math.max(...users.map(u=>Number(u.id)||0))+1) : 1);
                const newUser = { id: newId, name, email, password, role, active: true, registered: new Date().toISOString().slice(0,10), communityId: cid };
                users = Array.isArray(users) ? [...users, newUser] : [newUser];
                localStorage.setItem('users', JSON.stringify(users));
                if (typeof saveData === 'function') saveData();
                showNotification('Usuário criado com sucesso!', 'success');
                const modal = document.getElementById('addUserModal');
                if (modal) modal.classList.remove('active');
                const form = document.getElementById('addUserForm');
                if (form) form.reset();
                if (typeof loadUsersTable === 'function') loadUsersTable();
            }
        }
        
        // Form de adicionar categoria
        if (e.target.id === 'addCategoryForm') {
            e.preventDefault();
            if (validateCategoryForm()) {
                const cid = (window.communities && typeof window.communities.getActiveId==='function') ? window.communities.getActiveId() : (localStorage.getItem('activeCommunityId')||null);
                if (!cid){
                    showNotification('Selecione uma comunidade antes de criar categorias.', 'warning');
                    return;
                }
                const name = document.getElementById('categoryName')?.value.trim();
                const color = document.getElementById('categoryColor')?.value || '#4361ee';
                const icon = document.getElementById('categoryIcon')?.value.trim();
                const newId = (categories && categories.length ? (Math.max(...categories.map(c=>Number(c.id)||0))+1) : 1);
                const newCategory = { id: newId, name, color, icon, communityId: cid };
                categories = Array.isArray(categories) ? [...categories, newCategory] : [newCategory];
                localStorage.setItem('categories', JSON.stringify(categories));
                if (typeof saveData === 'function') saveData();
                showNotification('Categoria criada com sucesso!', 'success');
                const modal = document.getElementById('addCategoryModal');
                if (modal) modal.classList.remove('active');
                const form = document.getElementById('addCategoryForm');
                if (form) form.reset();
                if (typeof loadCategoriesTable === 'function') loadCategoriesTable();
            }
        }
        
    });
    
    // Modal de usuário (delegação configurada acima, mantido para compatibilidade)
    
    // Modal de categoria
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    const addCategoryModal = document.getElementById('addCategoryModal');
    
    if (addCategoryBtn && addCategoryModal && !addCategoryBtn.dataset.listenerAdded) {
        addCategoryBtn.dataset.listenerAdded = 'true';
        addCategoryBtn.addEventListener('click', () => {
            addCategoryModal.classList.add('active');
        });
        
        const categoryModalClose = addCategoryModal.querySelector('.modal-close');
        if (categoryModalClose && !categoryModalClose.dataset.listenerAdded) {
            categoryModalClose.dataset.listenerAdded = 'true';
            categoryModalClose.addEventListener('click', () => {
                addCategoryModal.classList.remove('active');
                const form = document.getElementById('addCategoryForm');
                if (form) form.reset();
            });
        }
    }
    
    // Modal de detalhes do evento
    const eventDetailsModal = document.getElementById('eventDetailsModal');
    if (eventDetailsModal) {
        const eventDetailsClose = eventDetailsModal.querySelector('.modal-close');
        if (eventDetailsClose && !eventDetailsClose.dataset.listenerAdded) {
            eventDetailsClose.dataset.listenerAdded = 'true';
            eventDetailsClose.addEventListener('click', () => {
                eventDetailsModal.classList.remove('active');
            });
        }
    }
    // Garantir que o formulário de evento tenha apenas um listener
    // Formulários agora usam delegação de eventos (veja acima)
}

function loadCategoryOptions() {
    const categorySelect = document.getElementById('eventCategory');
    if (!categorySelect) return;
    
    categorySelect.innerHTML = '<option value="">Selecione uma categoria</option>';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
    });
    
    // opção rápida para criar nova categoria
    const newOpt = document.createElement('option');
    newOpt.value = 'new';
    newOpt.textContent = '➕ Criar nova categoria...';
    categorySelect.appendChild(newOpt);

    // evitar múltiplos listeners: atribuir onchange diretamente
    const createOpt = document.createElement('option');
    createOpt.value = 'create-inline';
    createOpt.textContent = '➕ Criar nova categoria (rápido)...';
    categorySelect.appendChild(createOpt);

    // evitar múltiplos listeners: atribuir onchange diretamente e tratar ambos os casos
    categorySelect.onchange = function() {
        if (this.value === 'new') {
            const addCategoryModal = document.getElementById('addCategoryModal');
            if (addCategoryModal) addCategoryModal.classList.add('active');
            // reset selection to placeholder
            this.value = '';
            // foco no nome da categoria
            setTimeout(() => {
                const nameInput = document.getElementById('categoryName');
                if (nameInput) nameInput.focus();
            }, 50);
        } else if (this.value === 'create-inline') {
            const inlineForm = document.getElementById('inlineCategoryForm');
            if (inlineForm) {
                inlineForm.style.display = 'block';
                const nameInput = inlineForm.querySelector('#inlineCategoryName');
                if (nameInput) nameInput.focus();
            } else {
                const catModal = document.getElementById('addCategoryModal');
                if (catModal) catModal.classList.add('active');
            }
            // reset selection so user can re-open if needed
            this.value = '';
        }
    };
}

// Função setupLogout integrada em setupNavigation
function setupLogout() {
    // Esta função agora é chamada dentro de setupNavigation
    // Mantida por compatibilidade, mas o código real está em setupNavigation
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn && !logoutBtn.hasAttribute('data-listener-attached')) {
        logoutBtn.setAttribute('data-listener-attached', 'true');
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (confirm('Tem certeza que deseja sair do sistema?')) {
                // Parar todas as atualizações automáticas
                if (typeof stopAutoMessages === 'function') stopAutoMessages();
                
                // Limpar dados da sessão
                currentUser = null;
                localStorage.removeItem('currentUser');
                
                // Esconder aplicação e mostrar login
                const app = document.getElementById('app');
                const loginScreen = document.getElementById('loginScreen');
                
                if (app) app.style.display = 'none';
                if (loginScreen) {
                    loginScreen.style.display = 'flex';
                    // Resetar formulário de login
                    const loginForm = document.getElementById('loginForm');
                    if (loginForm) loginForm.reset();
                }
                
                showNotification('Logout realizado com sucesso!', 'success');
            }
        });
    }
}

// Função para resetar dados de demonstração
function resetDemoData() {
    if (!confirm('⚠️ Isso vai restaurar os dados de demonstração e apagar todos os dados atuais.\n\nContinuar?')) {
        return;
    }
    
    console.log('[reset] Restaurando dados de demonstração...');
    
    // Limpar localStorage
    const savedUser = localStorage.getItem('currentUser');
    localStorage.clear();
    if (savedUser) {
        localStorage.setItem('currentUser', savedUser);
    }
    
    // Se Firebase estiver ativo, limpar também
    if (window.firebaseDatabase) {
        window.firebaseDatabase.ref().remove()
            .then(() => {
                console.log('[reset] Dados do Firebase limpos');
                showNotification('Dados limpos! Recarregando...', 'success');
                setTimeout(() => location.reload(), 1000);
            })
            .catch((error) => {
                console.error('[reset] Erro ao limpar Firebase:', error);
                showNotification('Dados locais limpos! Recarregando...', 'success');
                setTimeout(() => location.reload(), 1000);
            });
    } else {
        showNotification('Dados locais limpos! Recarregando...', 'success');
        setTimeout(() => location.reload(), 1000);
    }
}

// Chame esta função no showApp()
// (Função showApp já é definida em `js/auth.js`. Aqui mantemos apenas `setupLogout`.)

// ========== PARTÍCULAS 3D FLUTUANTES (DESATIVADAS) ==========
// Controle global: defina true para reativar
window.ENABLE_BACKGROUND_PARTICLES = false;

function createFloatingParticles() {
    if (!window.ENABLE_BACKGROUND_PARTICLES) return; // desativado por padrão
    const particleCount = 0; // segurança: não criar
    // Caso algum elemento antigo exista, removê-lo
    document.querySelectorAll('.particle-3d').forEach(el => el.remove());
}

// Não inicializar automaticamente (desativado)
// if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', createFloatingParticles);
// } else {
//     createFloatingParticles();
// }