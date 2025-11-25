// Sistema de sincronização em tempo real
let syncInterval = null;
let lastSyncTimestamp = Date.now();
let localChangesMade = false;
let firebaseListeners = {};

// Configurações
const SYNC_INTERVAL_MS = 2000; // Verifica atualizações a cada 2 segundos
const STORAGE_KEY_TIMESTAMP = 'lastUpdateTimestamp';

// Inicializar sistema de sincronização
function initSync() {
    console.log('[sync] ========================================');
    console.log('[sync] Iniciando sistema de sincronização...');
    console.log('[sync] ========================================');
    
    // Aguardar um momento para Firebase ser inicializado
    setTimeout(() => {
        const FIREBASE_ENABLED = window.firebaseInitialized || false;
        
        console.log('[sync] Firebase habilitado:', FIREBASE_ENABLED);
        console.log('[sync] Firebase database:', !!window.firebaseDatabase);
        
        if (FIREBASE_ENABLED && window.firebaseDatabase) {
            console.log('[sync] ✅ Modo Firebase - Sincronização entre dispositivos ATIVADA');
            initFirebaseSync();
        } else {
            console.log('[sync] ⚠️ Modo localStorage - Sincronização apenas entre abas do mesmo navegador');
            initLocalSync();
        }
    }, 100);
    
    // Listener para visibilidade da página
    document.addEventListener('visibilitychange', handleVisibilityChange);
}

// Inicializar sincronização com Firebase
function initFirebaseSync() {
    const db = window.firebaseDatabase;
    
    // Listener para eventos
    firebaseListeners.events = db.ref('events').on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const remoteEvents = Object.values(data);
            console.log('[firebase] Eventos recebidos do Firebase:', remoteEvents.length);
            
            if (!localChangesMade) {
                console.log('[firebase] 📥 Aplicando atualização de eventos remotamente');
                events = remoteEvents;
                localStorage.setItem('events', JSON.stringify(events));
                reloadCurrentPage();
                showSyncNotification('Eventos atualizados', 'success');
            } else {
                console.log('[firebase] ⏭️ Ignorando atualização de eventos (mudança local recente)');
            }
        }
    });
    
    // Listener para categorias
    firebaseListeners.categories = db.ref('categories').on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            if (!localChangesMade) {
                console.log('[firebase] Categorias atualizadas remotamente');
                categories = Object.values(data);
                localStorage.setItem('categories', JSON.stringify(categories));
                reloadCurrentPage();
            } else {
                console.log('[firebase] Ignorando atualização de categorias (mudança local)');
            }
        }
    });
    
    // Listener para usuários
    firebaseListeners.users = db.ref('users').on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            if (!localChangesMade) {
                console.log('[firebase] Usuários atualizados remotamente');
                users = Object.values(data);
                localStorage.setItem('users', JSON.stringify(users));
                if (document.getElementById('users-page')?.classList.contains('active')) {
                    reloadCurrentPage();
                }
                showSyncNotification('Usuários sincronizados', 'success');
            } else {
                console.log('[firebase] Ignorando atualização de usuários (mudança local)');
            }
        }
    });
    
    // Listener para mensagens
    firebaseListeners.messages = db.ref('messages').on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            if (!localChangesMade) {
                console.log('[firebase] Mensagens atualizadas remotamente');
                messages = Object.values(data);
                localStorage.setItem('messages', JSON.stringify(messages));
                if (document.getElementById('chat-page')?.classList.contains('active')) {
                    reloadCurrentPage();
                }
            } else {
                console.log('[firebase] Ignorando atualização de mensagens (mudança local)');
            }
        }
    });
    
    console.log('[firebase] Listeners ativos para sincronização em tempo real');
}

// Inicializar sincronização local (fallback)
function initLocalSync() {
    
    // Registrar timestamp inicial
    if (!localStorage.getItem(STORAGE_KEY_TIMESTAMP)) {
        localStorage.setItem(STORAGE_KEY_TIMESTAMP, Date.now().toString());
    }
    
    // Iniciar verificação periódica
    startSync();
    
    // Listener para mudanças no localStorage (sincronização entre abas)
    window.addEventListener('storage', handleStorageChange);
    
    // Listener para visibilidade da página (pausar quando inativo)
    document.addEventListener('visibilitychange', handleVisibilityChange);
}

// Iniciar sincronização
function startSync() {
    if (syncInterval) return;
    
    syncInterval = setInterval(() => {
        checkForUpdates();
    }, SYNC_INTERVAL_MS);
    
    console.log('[sync] Sincronização automática ativada');
}

// Parar sincronização
function stopSync() {
    if (syncInterval) {
        clearInterval(syncInterval);
        syncInterval = null;
        console.log('[sync] Sincronização automática pausada');
    }
}

// Verificar atualizações
function checkForUpdates() {
    try {
        const currentTimestamp = parseInt(localStorage.getItem(STORAGE_KEY_TIMESTAMP) || '0');
        
        // Se houve mudanças feitas por outro usuário/aba
        if (currentTimestamp > lastSyncTimestamp && !localChangesMade) {
            console.log('[sync] Detectada atualização remota. Recarregando dados...');
            reloadData();
            lastSyncTimestamp = currentTimestamp;
            
            // Notificação visual
            showSyncNotification('Dados atualizados', 'info');
        }
        
        localChangesMade = false;
    } catch (error) {
        console.error('[sync] Erro ao verificar atualizações:', error);
    }
}

// Recarregar dados do localStorage
function reloadData() {
    try {
        // Recarregar variáveis globais
        users = getSafeLocalStorage('users', defaultUsers);
        categories = getSafeLocalStorage('categories', defaultCategories);
        events = getSafeLocalStorage('events', defaultEvents);
        messages = getSafeLocalStorage('messages', defaultMessages);
        
        // Atualizar UI conforme a página atual
        const activePage = document.querySelector('.page.active');
        if (!activePage) return;
        
        const pageId = activePage.id;
        
        // Recarregar conteúdo da página ativa
        if (pageId === 'dashboard-page') {
            loadDashboard();
        } else if (pageId === 'events-page') {
            loadEvents();
        } else if (pageId === 'chat-page') {
            loadChatUsers();
        } else if (pageId === 'users-page' && currentUser?.role === 'admin') {
            loadUsersTable();
        } else if (pageId === 'categories-page' && currentUser?.role === 'admin') {
            loadCategoriesTable();
        }
        
        console.log('[sync] Dados recarregados com sucesso');
    } catch (error) {
        console.error('[sync] Erro ao recarregar dados:', error);
    }
}

// Salvar dados com sincronização
function saveDataWithSync() {
    try {
        console.log('[sync] 💾 saveDataWithSync chamada');
        
        // Marcar que mudanças locais foram feitas
        localChangesMade = true;
        console.log('[sync] Flag localChangesMade definida como true');
        
        // Salvar localmente
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('categories', JSON.stringify(categories));
        localStorage.setItem('events', JSON.stringify(events));
        localStorage.setItem('messages', JSON.stringify(messages));
        console.log('[sync] Dados salvos no localStorage');
        
        // Verificar se Firebase está habilitado
        const FIREBASE_ENABLED = window.firebaseInitialized || false;
        
        console.log('[sync] Firebase habilitado:', FIREBASE_ENABLED);
        
        // Se Firebase habilitado, salvar remotamente
        if (FIREBASE_ENABLED && window.firebaseDatabase) {
            console.log('[sync] Chamando saveToFirebase()...');
            saveToFirebase();
        } else {
            console.log('[sync] Modo local - atualizando timestamp');
            // Atualizar timestamp local
            const newTimestamp = Date.now();
            localStorage.setItem(STORAGE_KEY_TIMESTAMP, newTimestamp.toString());
            lastSyncTimestamp = newTimestamp;
            
            // Broadcast para outras abas
            broadcastUpdate();
        }
        
        console.log('[sync] ✅ Processo de salvamento concluído');
    } catch (error) {
        console.error('[sync] ❌ Erro ao salvar dados:', error);
        showNotification('Erro ao salvar dados', 'error');
    }
}

// Salvar dados no Firebase
function saveToFirebase() {
    const db = window.firebaseDatabase;
    const updates = {};
    
    console.log('[firebase] Preparando para salvar dados...');
    
    // Converter arrays em objetos indexados por ID
    const eventsObj = {};
    events.forEach(e => { eventsObj[e.id] = e; });
    
    const categoriesObj = {};
    categories.forEach(c => { categoriesObj[c.id] = c; });
    
    const usersObj = {};
    users.forEach(u => { usersObj[u.id] = u; });
    
    const messagesObj = {};
    messages.forEach(m => { messagesObj[m.id] = m; });
    
    // Preparar updates
    updates['/events'] = eventsObj;
    updates['/categories'] = categoriesObj;
    updates['/users'] = usersObj;
    updates['/messages'] = messagesObj;
    updates['/lastUpdate'] = Date.now();
    
    console.log('[firebase] Salvando no Firebase...', {
        eventos: events.length,
        categorias: categories.length,
        usuarios: users.length,
        mensagens: messages.length
    });
    
    // Salvar no Firebase
    db.ref().update(updates)
        .then(() => {
            console.log('[firebase] ✅ Dados salvos com sucesso no Firebase');
            showSyncNotification('Sincronizado com sucesso', 'success');
            // Resetar flag após 1 segundo para garantir que o listener não processe a própria mudança
            setTimeout(() => {
                localChangesMade = false;
                console.log('[firebase] Flag localChangesMade resetada');
            }, 1000);
        })
        .catch((error) => {
            console.error('[firebase] ❌ Erro ao salvar:', error);
            showNotification('Erro ao sincronizar. Verifique sua conexão.', 'error');
            // Resetar flag mesmo em caso de erro
            localChangesMade = false;
        });
}

// Recarregar página atual
function reloadCurrentPage() {
    const activePage = document.querySelector('.page.active');
    if (!activePage) return;
    
    const pageId = activePage.id;
    
    if (pageId === 'dashboard-page') {
        if (typeof loadDashboard === 'function') loadDashboard();
    } else if (pageId === 'events-page') {
        if (typeof loadEvents === 'function') loadEvents();
    } else if (pageId === 'chat-page') {
        if (typeof loadChatUsers === 'function') loadChatUsers();
    } else if (pageId === 'users-page' && currentUser?.role === 'admin') {
        if (typeof loadUsersTable === 'function') loadUsersTable();
    } else if (pageId === 'categories-page' && currentUser?.role === 'admin') {
        if (typeof loadCategoriesTable === 'function') loadCategoriesTable();
    }
}

// Broadcast para outras abas
function broadcastUpdate() {
    // Trigger evento de storage para outras abas
    localStorage.setItem('syncTrigger', Date.now().toString());
}

// Handler para mudanças no localStorage (entre abas)
function handleStorageChange(event) {
    // Ignorar eventos não relacionados aos nossos dados
    if (!event.key || event.key === 'syncTrigger') {
        if (event.key === 'syncTrigger') {
            console.log('[sync] Recebido broadcast de outra aba');
            checkForUpdates();
        }
        return;
    }
    
    // Se dados relevantes mudaram
    if (['users', 'categories', 'events', 'messages', STORAGE_KEY_TIMESTAMP].includes(event.key)) {
        console.log('[sync] Detectada mudança em outra aba:', event.key);
        checkForUpdates();
    }
}

// Handler para visibilidade da página
function handleVisibilityChange() {
    if (document.hidden) {
        console.log('[sync] Página oculta - pausando sincronização');
        stopSync();
    } else {
        console.log('[sync] Página visível - retomando sincronização');
        checkForUpdates(); // Verificar imediatamente ao voltar
        startSync();
    }
}

// Notificação de sincronização (não intrusiva)
function showSyncNotification(message, type = 'info') {
    // Criar notificação pequena e discreta
    const notification = document.createElement('div');
    notification.className = `sync-notification sync-${type}`;
    notification.innerHTML = `
        <i class="fas fa-sync-alt"></i>
        <span>${message}</span>
    `;
    
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${type === 'success' ? 'var(--success)' : 'var(--info)'};
        color: white;
        padding: 10px 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.9rem;
        opacity: 0;
        transform: translateY(10px);
        transition: all 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 10);
    
    // Remover após 2 segundos
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(10px)';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Sobrescrever função saveData global
const originalSaveData = window.saveData;
window.saveData = function() {
    if (typeof saveDataWithSync === 'function') {
        saveDataWithSync();
    } else if (typeof originalSaveData === 'function') {
        originalSaveData();
    }
};

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSync);
} else {
    initSync();
}

// Limpar ao descarregar página
window.addEventListener('beforeunload', () => {
    stopSync();
    window.removeEventListener('storage', handleStorageChange);
    
    // Remover listeners do Firebase
    const FIREBASE_ENABLED = window.firebaseInitialized || false;
    if (FIREBASE_ENABLED && window.firebaseDatabase) {
        Object.keys(firebaseListeners).forEach(key => {
            window.firebaseDatabase.ref(key).off('value', firebaseListeners[key]);
        });
    }
});

// Status de conexão Firebase
const FIREBASE_ENABLED = window.firebaseInitialized || false;
if (FIREBASE_ENABLED && window.firebaseDatabase) {
    window.firebaseDatabase.ref('.info/connected').on('value', (snapshot) => {
        const statusEl = document.getElementById('syncStatus');
        if (snapshot.val() === true) {
            console.log('[firebase] ✅ Conectado ao Firebase');
            if (statusEl) {
                statusEl.className = 'sync-status online';
                statusEl.innerHTML = '<i class="fas fa-circle"></i><span>Online</span>';
                statusEl.title = 'Sincronização em tempo real ativa';
            }
            showSyncNotification('Conectado - Sincronização ativa', 'success');
        } else {
            console.log('[firebase] ❌ Desconectado do Firebase');
            if (statusEl) {
                statusEl.className = 'sync-status offline';
                statusEl.innerHTML = '<i class="fas fa-circle"></i><span>Offline</span>';
                statusEl.title = 'Modo offline - reconectando...';
            }
            showSyncNotification('Modo offline - Dados locais', 'warning');
        }
    });
} else {
    // Modo local
    const statusEl = document.getElementById('syncStatus');
    if (statusEl) {
        statusEl.className = 'sync-status local';
        statusEl.innerHTML = '<i class="fas fa-circle"></i><span>Local</span>';
        statusEl.title = 'Sincronização apenas entre abas (ative Firebase para sync entre dispositivos)';
    }
}

console.log('[sync] Módulo de sincronização carregado');
