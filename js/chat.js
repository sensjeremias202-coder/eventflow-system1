let currentChatUser = null;

function loadChatUsers() {
    const chatUsers = document.getElementById('chatUsers');
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
                <div class="user-status">Online</div>
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
}

function selectChatUser(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    currentChatUser = user;
    
    // Atualizar interface
    document.querySelectorAll('.chat-user').forEach(u => u.classList.remove('active'));
    document.querySelector(`.chat-user[data-id="${userId}"]`).classList.add('active');
    
    document.getElementById('currentChatUser').textContent = user.name;
    document.getElementById('currentChatStatus').textContent = 'Online';
    
    // Carregar mensagens
    loadChatMessages(userId);
}

function loadChatMessages(userId) {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = '';
    
    // Filtrar mensagens entre o usuário atual e o selecionado
    const userMessages = messages.filter(m => 
        (m.from === currentUser.id && m.to === userId) || 
        (m.from === userId && m.to === currentUser.id)
    ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    if (userMessages.length === 0) {
        chatMessages.innerHTML = '<p style="text-align: center; color: var(--gray); padding: 20px;">Nenhuma mensagem ainda. Inicie a conversa!</p>';
        return;
    }
    
    userMessages.forEach(message => {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.from === currentUser.id ? 'sent' : 'received'}`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.textContent = message.content;
        
        const messageTime = document.createElement('div');
        messageTime.className = 'message-time';
        messageTime.textContent = formatTime(message.timestamp);
        
        messageElement.appendChild(messageContent);
        messageElement.appendChild(messageTime);
        
        chatMessages.appendChild(messageElement);
    });
    
    // Rolagem para baixo
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Configurar envio de mensagens
document.getElementById('sendMessageBtn').addEventListener('click', sendMessage);
document.getElementById('chatInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    if (!currentChatUser) {
        alert('Selecione um usuário para enviar mensagem.');
        return;
    }
    
    // Criar nova mensagem
    const newMessage = {
        id: messages.length > 0 ? Math.max(...messages.map(m => m.id)) + 1 : 1,
        from: currentUser.id,
        to: currentChatUser.id,
        content: message,
        timestamp: new Date().toISOString()
    };
    
    messages.push(newMessage);
    saveData();
    
    // Atualizar chat
    loadChatMessages(currentChatUser.id);
    
    // Limpar input
    input.value = '';
}