// ============================================
// VARIÁVEIS GLOBAIS DO CHAT
// ============================================
let currentChatUser = null;
let autoMessageInterval = null;

// ============================================
// INICIALIZAÇÃO DO CHAT
// ============================================
function initChat() {
    console.log('[chat] Inicializando chat...');
    loadChatUsers();
    setupChat();
    console.log('[chat] ✅ Chat inicializado com sucesso');
}

// ============================================
// CARREGAR LISTA DE USUÁRIOS
// ============================================
function loadChatUsers() {
    console.log('[chat] 📋 Carregando lista de usuários...');
    
    const chatUsers = document.getElementById('chatUsers');
    if (!chatUsers) {
        console.error('[chat] ❌ Elemento chatUsers não encontrado!');
        return;
    }
    
    chatUsers.innerHTML = '';
    
    // Verificar usuário atual
    if (!currentUser) {
        console.error('[chat] ❌ Nenhum usuário logado');
        chatUsers.innerHTML = '<p style="text-align: center; color: var(--gray); padding: 20px;">Faça login para usar o chat</p>';
        return;
    }
    
    // Verificar array de usuários
    if (!users || users.length === 0) {
        console.error('[chat] ❌ Nenhum usuário disponível');
        chatUsers.innerHTML = '<p style="text-align: center; color: var(--gray); padding: 20px;">Nenhum usuário disponível</p>';
        return;
    }
    
    // Listar outros usuários
    const chatPartners = users.filter(user => user.id !== currentUser.id);
    console.log('[chat] 👥 Usuários disponíveis:', chatPartners.length);
    
    if (chatPartners.length === 0) {
        chatUsers.innerHTML = '<p style="text-align: center; color: var(--gray); padding: 20px;">Nenhum outro usuário disponível</p>';
        return;
    }
    
    chatPartners.forEach((user, index) => {
        console.log(`[chat]   └─ Usuário ${index + 1}: ${user.name}`);
        
        const userElement = document.createElement('div');
        userElement.className = 'chat-user';
        userElement.setAttribute('data-id', user.id);
        userElement.innerHTML = `
            <div class="chat-user-avatar">
                ${user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
            <div style="flex: 1;">
                <div class="user-name">${user.name}</div>
                <div class="user-status">${isUserOnline(user.id) ? 'Online' : 'Offline'}</div>
            </div>
        `;
        
        // Event listener inline
        userElement.addEventListener('click', () => selectChatUser(user.id));
        
        chatUsers.appendChild(userElement);
    });
    
    // Selecionar primeiro usuário se nada estiver selecionado
    if (!currentChatUser && chatPartners.length > 0) {
        selectChatUser(chatPartners[0].id);
    }
    
    console.log('[chat] ✅ Lista de chat carregada');
}

function isUserOnline(userId) {
    // Simulação - na realidade, isso viria de um sistema de presença
    return Math.random() > 0.3; // 70% de chance de estar online
}

function selectChatUser(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    currentChatUser = user;
    
    // Atualizar interface
    document.querySelectorAll('.chat-user').forEach(u => u.classList.remove('active'));
    const selectedUser = document.querySelector(`.chat-user[data-id="${userId}"]`);
    if (selectedUser) {
        selectedUser.classList.add('active');
    }
    
    const currentChatUserElement = document.getElementById('currentChatUser');
    const currentChatStatusElement = document.getElementById('currentChatStatus');
    
    if (currentChatUserElement) {
        currentChatUserElement.textContent = user.name;
    }
    if (currentChatStatusElement) {
        currentChatStatusElement.textContent = isUserOnline(userId) ? 'Online' : 'Offline';
    }
    
    // Carregar mensagens
    loadChatMessages(userId);
    
    // Ativar input de chat
    const chatInput = document.getElementById('chatInput');
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    
    if (chatInput) chatInput.disabled = false;
    if (sendMessageBtn) sendMessageBtn.disabled = false;
}

function loadChatMessages(userId) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    chatMessages.innerHTML = '';
    
    // Filtrar mensagens entre o usuário atual e o selecionado
    const userMessages = messages.filter(m => 
        (m.from === currentUser.id && m.to === userId) || 
        (m.from === userId && m.to === currentUser.id)
    ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    if (userMessages.length === 0) {
        chatMessages.innerHTML = `
            <div style="text-align: center; color: var(--gray); padding: 40px;">
                <i class="fas fa-comments fa-3x" style="margin-bottom: 20px; opacity: 0.5;"></i>
                <p>Nenhuma mensagem ainda.</p>
                <p>Inicie a conversa ou aguarde respostas automáticas!</p>
            </div>
        `;
        return;
    }
    
    userMessages.forEach(message => {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.from === currentUser.id ? 'sent' : 'received'}`;
        
        if (message.auto) {
            messageElement.classList.add('chat-automated');
        }
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.textContent = message.content;
        
        const messageTime = document.createElement('div');
        messageTime.className = 'message-time';
        messageTime.textContent = formatTime(message.timestamp);
        
        if (message.auto) {
            const autoIndicator = document.createElement('div');
            autoIndicator.className = 'auto-message-indicator';
            autoIndicator.textContent = 'Resposta automática';
            messageElement.appendChild(autoIndicator);
        }
        
        messageElement.appendChild(messageContent);
        messageElement.appendChild(messageTime);
        
        chatMessages.appendChild(messageElement);
    });
    
    // Rolagem para baixo
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Configurar envio de mensagens
function setupChat() {
    console.log('[chat] Configurando eventos do chat...');
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    const chatInput = document.getElementById('chatInput');
    
    if (!sendMessageBtn) {
        console.warn('[chat] Botão sendMessageBtn não encontrado');
        return;
    }
    
    if (!chatInput) {
        console.warn('[chat] Input chatInput não encontrado');
        return;
    }
    
    // Usar flag para evitar duplicação
    if (sendMessageBtn && !sendMessageBtn.dataset.chatListenerAdded) {
        sendMessageBtn.dataset.chatListenerAdded = 'true';
        sendMessageBtn.addEventListener('click', sendMessage);
        console.log('[chat] ✅ Evento de clique adicionado ao botão');
    }
    
    if (chatInput && !chatInput.dataset.chatListenerAdded) {
        chatInput.dataset.chatListenerAdded = 'true';
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        
        // Desativar inicialmente
        chatInput.disabled = !currentChatUser;
        console.log('[chat] ✅ Evento de Enter adicionado ao input');
    }
    
    if (sendMessageBtn) {
        sendMessageBtn.disabled = !currentChatUser;
    }
    
    console.log('[chat] ✅ Chat configurado');
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    if (!input) return;
    
    const message = input.value.trim();
    
    if (!message) {
        showNotification('Por favor, digite uma mensagem', 'error');
        return;
    }
    
    if (!currentChatUser) {
        showNotification('Selecione um usuário para enviar mensagem.', 'error');
        return;
    }
    
    if (!currentUser) {
        showNotification('Você precisa estar logado para enviar mensagens.', 'error');
        return;
    }
    
    // Criar nova mensagem
    const newMessage = {
        id: messages.length > 0 ? Math.max(...messages.map(m => m.id)) + 1 : 1,
        from: currentUser.id,
        to: currentChatUser.id,
        content: message,
        timestamp: new Date().toISOString(),
        auto: false
    };
    
    messages.push(newMessage);
    saveData();
    
    // Sincronizar com Firebase se disponível
    if (window.firebaseDatabase && window.firebaseInitialized) {
        const db = window.firebaseDatabase;
        db.ref('messages').set(messages).catch(err => {
            console.error('[chat] ❌ Erro ao sincronizar mensagem:', err);
        });
    }
    
    // Atualizar chat
    loadChatMessages(currentChatUser.id);
    
    // Limpar input
    input.value = '';
    input.focus();
    
    showNotification('Mensagem enviada!', 'success');
}

// Parar mensagens automáticas quando sair da página de chat
function stopAutoMessages() {
    if (autoMessageInterval) {
        clearInterval(autoMessageInterval);
        autoMessageInterval = null;
    }
}

// Exportar funções para uso global
window.initChat = initChat;
window.loadChatUsers = loadChatUsers;
window.setupChat = setupChat;
window.stopAutoMessages = stopAutoMessages;