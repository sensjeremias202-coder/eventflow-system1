// Sistema de sincronização em tempo real
// Versão: 20241125092000 - Correção filtro null/undefined
console.log('[sync] 🔄 sync.js carregado - Versão: 20241125092000');

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
        const FIREBASE_ENABLED = (window.firebaseInitialized || false) && !window.FORCE_LOCAL_MODE;
        
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
    
    if (!db) {
        console.error('[firebase] ❌ ERRO: Firebase Database não está disponível!');
        console.error('[firebase] window.firebaseDatabase:', window.firebaseDatabase);
        console.error('[firebase] window.firebaseInitialized:', window.firebaseInitialized);
        console.log('[firebase] ⚠️ Voltando para modo local...');
        initLocalSync();
        return;
    }
    
    let initialLoadDone = false;
    
    console.log('[firebase] 🔄 Iniciando sincronização com Firebase...');
    console.log('[firebase] ✅ Database object válido:', typeof db);
    console.log('[firebase] 📋 Mantendo dados locais; não vamos limpar localStorage para preservar eventos existentes');
    
    // Listener para eventos
    firebaseListeners.events = db.ref('events').on('value', (snapshot) => {
        const data = snapshot.val();
        console.log('[firebase] 📥 Eventos recebidos do Firebase (raw):', data);
        
        if (data) {
            // Converter para array se necessário E REMOVER NULLS/UNDEFINED
            let remoteEvents = [];
            if (Array.isArray(data)) {
                remoteEvents = data.filter(e => e !== null && e !== undefined && typeof e === 'object');
            } else if (typeof data === 'object') {
                remoteEvents = Object.values(data).filter(e => e !== null && e !== undefined && typeof e === 'object');
            }
            
            console.log('[firebase] 📊 Total de eventos válidos:', remoteEvents.length);
            console.log('[firebase] 📋 Eventos processados:', remoteEvents);
            
            // SEMPRE aplicar dados do Firebase (fonte única de verdade)
            if (!localChangesMade || !initialLoadDone) {
                console.log('[firebase] ✅ Aplicando eventos do Firebase');
                events = remoteEvents;
                localStorage.setItem('events', JSON.stringify(events));
                if (initialLoadDone) {
                    reloadCurrentPage();
                    showSyncNotification('Eventos atualizados', 'success');
                }
            } else {
                console.log('[firebase] ⏭️ Ignorando (mudança local recente)');
            }
        } else {
            console.log('[firebase] ⚠️ Nenhum evento no Firebase');
            // Se existir eventos locais, manter e opcionalmente semear no Firebase
            try {
                const localEvts = JSON.parse(localStorage.getItem('events') || '[]');
                if (Array.isArray(localEvts) && localEvts.length > 0) {
                    console.log('[firebase] 🌱 Semear Firebase com eventos locais:', localEvts.length);
                    events = localEvts;
                    // semear remotamente se permitido
                    if (window.firebaseInitialized && window.firebaseDatabase) {
                        window.firebaseDatabase.ref('/events').set(localEvts).then(() => {
                            console.log('[firebase] ✅ Eventos locais semeados no Firebase');
                        }).catch(err => console.warn('[firebase] ❌ Falha ao semear eventos:', err));
                    }
                } else {
                    events = [];
                }
                localStorage.setItem('events', JSON.stringify(events));
            } catch(e) {
                console.warn('[firebase] Erro ao ler eventos locais:', e);
                events = [];
                localStorage.setItem('events', JSON.stringify(events));
            }
        }
    });
    
    // Listener para mensagens do chat
    firebaseListeners.messages = db.ref('messages').on('value', (snapshot) => {
        const data = snapshot.val();
        console.log('[firebase] 💬 Mensagens recebidas do Firebase (raw):', data);
        
        if (data) {
            // Converter para array se necessário E REMOVER NULLS/UNDEFINED
            let remoteMessages = [];
            if (Array.isArray(data)) {
                remoteMessages = data.filter(m => m !== null && m !== undefined && typeof m === 'object');
            } else if (typeof data === 'object') {
                remoteMessages = Object.values(data).filter(m => m !== null && m !== undefined && typeof m === 'object');
            }
            
            console.log('[firebase] 📊 Total de mensagens válidas:', remoteMessages.length);
            
            if (!localChangesMade || !initialLoadDone) {
                console.log('[firebase] ✅ Aplicando mensagens do Firebase');
                messages = remoteMessages;
                localStorage.setItem('messages', JSON.stringify(messages));
                if (initialLoadDone && typeof currentChatUser !== 'undefined' && currentChatUser) {
                    // Recarregar chat se estiver aberto
                    if (typeof loadChatMessages === 'function') {
                        loadChatMessages(currentChatUser.id);
                    }
                    showSyncNotification('Nova mensagem recebida', 'info');
                }
            }
        } else {
            console.log('[firebase] ⚠️ Nenhuma mensagem no Firebase');
            messages = [];
            localStorage.setItem('messages', JSON.stringify(messages));
        }
    });
    
    // Listener para categorias
    firebaseListeners.categories = db.ref('categories').on('value', (snapshot) => {
        const data = snapshot.val();
        console.log('[firebase] 📥 Categorias recebidas do Firebase (raw):', data);
        
        if (data) {
            // Converter para array se necessário E REMOVER NULLS/UNDEFINED
            let remoteCategories = [];
            if (Array.isArray(data)) {
                remoteCategories = data.filter(c => c !== null && c !== undefined && typeof c === 'object');
            } else if (typeof data === 'object') {
                remoteCategories = Object.values(data).filter(c => c !== null && c !== undefined && typeof c === 'object');
            }
            
            console.log('[firebase] 📊 Total de categorias válidas:', remoteCategories.length);
            
            if (!localChangesMade || !initialLoadDone) {
                console.log('[firebase] ✅ Aplicando categorias do Firebase');
                categories = remoteCategories;
                localStorage.setItem('categories', JSON.stringify(categories));
                if (initialLoadDone) {
                    reloadCurrentPage();
                }
            } else {
                console.log('[firebase] ⏭️ Ignorando (mudança local)');
            }
        } else {
            console.log('[firebase] ⚠️ Nenhuma categoria no Firebase');
            categories = [];
            localStorage.setItem('categories', JSON.stringify(categories));
        }
    });
    
    // Listener para usuários
    firebaseListeners.users = db.ref('users').on('value', (snapshot) => {
        const data = snapshot.val();
        console.log('[firebase] 📥 Usuários recebidos do Firebase (raw):', data);
        
        if (data) {
            // Converter para array se necessário E REMOVER NULLS/UNDEFINED
            let remoteUsers = [];
            if (Array.isArray(data)) {
                remoteUsers = data.filter(u => u !== null && u !== undefined && typeof u === 'object');
            } else if (typeof data === 'object') {
                remoteUsers = Object.values(data).filter(u => u !== null && u !== undefined && typeof u === 'object');
            }
            
            console.log('[firebase] 📊 Total de usuários válidos:', remoteUsers.length);
            
            if (!localChangesMade || !initialLoadDone) {
                console.log('[firebase] ✅ Aplicando usuários do Firebase');
                users = remoteUsers;
                localStorage.setItem('users', JSON.stringify(users));
                if (initialLoadDone && document.getElementById('users-page')?.classList.contains('active')) {
                    reloadCurrentPage();
                }
                if (initialLoadDone) {
                    showSyncNotification('Usuários sincronizados', 'success');
                }
            } else {
                console.log('[firebase] ⏭️ Ignorando (mudança local)');
            }
        } else {
            console.log('[firebase] ⚠️ Nenhum usuário no Firebase');
            users = [];
            localStorage.setItem('users', JSON.stringify(users));
        }
    });
    
    // Marcar carga inicial como concluída após pequeno delay
    setTimeout(() => {
        initialLoadDone = true;
        console.log('[firebase] ✅ Carga inicial concluída - sincronização ativa');
        // Atualizar landing pública com eventos atuais
        try {
            if (typeof window.renderPublicEvents === 'function') {
                const evts = (typeof window !== 'undefined' && window.events) ? window.events : [];
                window.renderPublicEvents(evts);
            }
        } catch(e){
            console.warn('[sync] Não foi possível atualizar eventos públicos:', e);
        }
    }, 2000);
    
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
        
        // Verificar se Firebase está habilitado (respeitando modo local forçado)
        const FIREBASE_ENABLED = (window.firebaseInitialized || false) && !window.FORCE_LOCAL_MODE;
        
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
    
    console.log('[firebase] 💾 Preparando para salvar dados...');
    console.log('[firebase] 📊 Dados:', {
        eventos: events.length,
        categorias: categories.length,
        usuarios: users.length,
        mensagens: messages.length
    });
    
    // Salvar diretamente como arrays para manter compatibilidade
    updates['/events'] = events;
    updates['/categories'] = categories;
    updates['/users'] = users;
    updates['/messages'] = messages;
    updates['/lastUpdate'] = Date.now();
    
    console.log('[firebase] ☁️ Enviando para Firebase...');
    
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
    console.log('[sync] 🔄 Recarregando página atual após sincronização...');
    const activePage = document.querySelector('.page.active');
    if (!activePage) {
        console.log('[sync] ⚠️ Nenhuma página ativa encontrada');
        return;
    }
    
    const pageId = activePage.id;
    console.log('[sync] 📄 Página ativa detectada:', pageId);
    
    if (pageId === 'dashboard-page') {
        if (typeof loadDashboard === 'function') loadDashboard();
    } else if (pageId === 'events-page') {
        console.log('[sync] 📅 Recarregando eventos...');
        if (typeof loadEvents === 'function') {
            loadEvents();
        } else {
            console.error('[sync] ❌ Função loadEvents não encontrada!');
        }
    } else if (pageId === 'chat-page') {
        if (typeof loadChatUsers === 'function') loadChatUsers();
    } else if (pageId === 'users-page' && currentUser?.role === 'admin') {
        if (typeof loadUsersTable === 'function') loadUsersTable();
    } else if (pageId === 'categories-page' && currentUser?.role === 'admin') {
        if (typeof loadCategoriesTable === 'function') loadCategoriesTable();
    } else if (pageId === 'profile-page') {
        if (typeof loadProfile === 'function') loadProfile();
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
