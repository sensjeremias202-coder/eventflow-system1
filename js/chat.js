let currentChatUser = null;
let autoMessageInterval = null;

function loadChatUsers() {
    const chatUsers = document.getElementById('chatUsers');
    if (!chatUsers) return;
    
    chatUsers.innerHTML = '';
    
    // Mostrar apenas usuários comuns para administradores, e vice-versa
    const chatPartners = users.filter(user => 
        user.id !== currentUser.id && 
        (currentUser.role === 'admin' ? user.role === 'user' : user.role === 'admin')
    );
    
    if (chatPartners.length === 0) {
        chatUsers.innerHTML = '<p style="text-align: center; color: var(--gray);">Nenhum usuário disponível para chat</p>';
        return;
    }
    
    chatPartners.forEach(user => {
        const userElement = document.createElement('div');
        userElement.className = 'chat-user';
        userElement.setAttribute('data-id', user.id);
        userElement.innerHTML = `
            <div class="chat-user-avatar">${user.name.split(' ').map(n => n[0]).join('').toUpperCase()}</div>
            <div>
                <div class="user-name">${user.name}</div>
                <div class="user-status">${isUserOnline(user.id) ? 'Online' : 'Offline'}</div>
            </div>
        `;
        
        chatUsers.appendChild(userElement);
        
        // Adicionar evento de clique
        userElement.addEventListener('click', function() {
            const userId = parseInt(this.getAttribute('data-id'));
            selectChatUser(userId);
        });
    });
    
    // Selecionar o primeiro usuário por padrão, se houver
    if (chatPartners.length > 0) {
        selectChatUser(chatPartners[0].id);
    }
    
    // Iniciar mensagens automáticas
    startAutoMessages();
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
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    const chatInput = document.getElementById('chatInput');
    
    if (sendMessageBtn) {
        sendMessageBtn.addEventListener('click', sendMessage);
    }
    
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
        
        // Desativar inicialmente
        chatInput.disabled = true;
    }
    
    if (sendMessageBtn) {
        sendMessageBtn.disabled = true;
    }
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
    
    // Atualizar chat
    loadChatMessages(currentChatUser.id);
    
    // Limpar input
    input.value = '';
    
    // Simular resposta automática após 2-5 segundos
    setTimeout(() => {
        generateAutoResponse(currentChatUser.id);
    }, 2000 + Math.random() * 3000);
}

function generateAutoResponse(toUserId) {
    if (!currentChatUser || currentChatUser.id !== toUserId) return;
    
    const autoResponses = [
        "Obrigado pela sua mensagem! Em breve retornarei com mais informações.",
        "Entendi sua dúvida. Vou verificar e te retorno em instantes.",
        "Ótima pergunta! Deixe-me consultar isso para você.",
        "Estou processando sua solicitação. Aguarde um momento...",
        "Recebi sua mensagem. Em breve terei novidades para você!",
        "Obrigado pelo contato! Estou analisando sua questão.",
        "Mensagem recebida com sucesso. Retornarei em breve.",
        "Agradeço seu interesse! Estou buscando as informações solicitadas."
    ];
    
    const randomResponse = autoResponses[Math.floor(Math.random() * autoResponses.length)];
    
    const autoMessage = {
        id: messages.length > 0 ? Math.max(...messages.map(m => m.id)) + 1 : 1,
        from: toUserId,
        to: currentUser.id,
        content: randomResponse,
        timestamp: new Date().toISOString(),
        auto: true
    };
    
    messages.push(autoMessage);
    saveData();
    
    // Atualizar chat se ainda estiver na mesma conversa
    if (currentChatUser && currentChatUser.id === toUserId) {
        loadChatMessages(toUserId);
    }
}

function startAutoMessages() {
    // Limpar intervalo anterior se existir
    if (autoMessageInterval) {
        clearInterval(autoMessageInterval);
    }
    
    // Gerar mensagens automáticas a cada 30-60 segundos
    autoMessageInterval = setInterval(() => {
        if (currentChatUser && Math.random() > 0.7) { // 30% de chance
            generateAutoResponse(currentChatUser.id);
        }
    }, 30000 + Math.random() * 30000);
}

// Inicializar chat quando o documento carregar
document.addEventListener('DOMContentLoaded', function() {
    setupChat();
});

// Parar mensagens automáticas quando sair da página de chat
function stopAutoMessages() {
    if (autoMessageInterval) {
        clearInterval(autoMessageInterval);
        autoMessageInterval = null;
    }
}