let currentChatUser = null;
let autoMessageInterval = null;
let chatGroups = [];

function loadChatUsers() {
    console.log('[chat] Carregando usuários do chat...');
    const chatUsers = document.getElementById('chatUsers');
    if (!chatUsers) {
        console.warn('[chat] Elemento chatUsers não encontrado');
        return;
    }
    
    chatUsers.innerHTML = '';
    
    // Carregar grupos do localStorage
    const savedGroups = localStorage.getItem('chatGroups');
    if (savedGroups) {
        chatGroups = JSON.parse(savedGroups);
    }
    
    // Adicionar grupos primeiro
    if (chatGroups.length > 0) {
        const groupsHeader = document.createElement('div');
        groupsHeader.className = 'chat-section-header';
        groupsHeader.innerHTML = '<h4>Grupos</h4>';
        chatUsers.appendChild(groupsHeader);
        
        chatGroups.forEach(group => {
            const groupElement = document.createElement('div');
            groupElement.className = 'chat-user chat-group';
            groupElement.setAttribute('data-group-id', group.id);
            groupElement.innerHTML = `
                <div class="chat-user-avatar group-avatar"><i class="fas fa-users"></i></div>
                <div>
                    <div class="user-name">${group.name}</div>
                    <div class="user-status">${group.members.length} membros</div>
                </div>
            `;
            chatUsers.appendChild(groupElement);
            
            groupElement.addEventListener('click', function() {
                const groupId = this.getAttribute('data-group-id');
                selectChatGroup(groupId);
            });
        });
        
        // Adicionar separador
        const separator = document.createElement('div');
        separator.className = 'chat-section-header';
        separator.innerHTML = '<h4>Usuários</h4>';
        chatUsers.appendChild(separator);
    }
    
    // Verificar se há usuário atual
    if (!currentUser) {
        console.warn('[chat] Nenhum usuário logado');
        chatUsers.innerHTML = '<p style="text-align: center; color: var(--gray); padding: 20px;">Faça login para usar o chat</p>';
        return;
    }
    
    // Verificar se há array de usuários
    if (!users || users.length === 0) {
        console.warn('[chat] Nenhum usuário disponível');
        chatUsers.innerHTML = '<p style="text-align: center; color: var(--gray); padding: 20px;">Nenhum usuário disponível</p>';
        return;
    }
    
    // Mostrar todos os outros usuários (não apenas admin/user)
    const chatPartners = users.filter(user => user.id !== currentUser.id);
    
    console.log('[chat] Usuários disponíveis:', chatPartners.length);
    
    if (chatPartners.length === 0) {
        chatUsers.innerHTML = '<p style="text-align: center; color: var(--gray); padding: 20px;">Nenhum outro usuário disponível para chat</p>';
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
    
    console.log('[chat] ✅ Usuários carregados com sucesso');
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
    }
    
    if (!chatInput) {
        console.warn('[chat] Input chatInput não encontrado');
    }
    
    if (sendMessageBtn) {
        // Remover listeners antigos clonando o elemento
        const newBtn = sendMessageBtn.cloneNode(true);
        sendMessageBtn.parentNode.replaceChild(newBtn, sendMessageBtn);
        
        newBtn.addEventListener('click', sendMessage);
        console.log('[chat] ✅ Evento de clique adicionado ao botão');
    }
    
    if (chatInput) {
        // Remover listeners antigos clonando o elemento
        const newInput = chatInput.cloneNode(true);
        chatInput.parentNode.replaceChild(newInput, chatInput);
        
        newInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        
        // Desativar inicialmente
        newInput.disabled = !currentChatUser;
        console.log('[chat] ✅ Evento de Enter adicionado ao input');
    }
    
    const finalBtn = document.getElementById('sendMessageBtn');
    if (finalBtn) {
        finalBtn.disabled = !currentChatUser;
    }
    
    console.log('[chat] ✅ Chat configurado');
}

function sendMessage() {
    console.log('[chat] Tentando enviar mensagem...');
    const input = document.getElementById('chatInput');
    if (!input) {
        console.error('[chat] Input não encontrado');
        return;
    }
    
    const message = input.value.trim();
    
    if (!message) {
        showNotification('Por favor, digite uma mensagem', 'error');
        return;
    }
    
    if (!currentChatUser) {
        showNotification('Selecione um usuário ou grupo para enviar mensagem.', 'error');
        return;
    }
    
    if (!currentUser) {
        showNotification('Você precisa estar logado para enviar mensagens.', 'error');
        return;
    }
    
    console.log('[chat] Enviando mensagem para:', currentChatUser.isGroup ? 'Grupo ' + currentChatUser.name : currentChatUser.name);
    
    // Criar nova mensagem
    const newMessage = {
        id: messages.length > 0 ? Math.max(...messages.map(m => m.id)) + 1 : 1,
        from: currentUser.id,
        content: message,
        timestamp: new Date().toISOString(),
        auto: false
    };
    
    // Se for grupo, adicionar groupId, senão adicionar to
    if (currentChatUser.isGroup) {
        newMessage.groupId = currentChatUser.id;
    } else {
        newMessage.to = currentChatUser.id;
    }
    
    messages.push(newMessage);
    saveData();
    
    console.log('[chat] ✅ Mensagem salva:', newMessage);
    
    // Sincronizar com Firebase se disponível
    if (window.firebaseDatabase && window.firebaseInitialized) {
        const db = window.firebaseDatabase;
        db.ref('messages').set(messages).then(() => {
            console.log('[chat] ✅ Mensagem sincronizada com Firebase');
        }).catch(err => {
            console.error('[chat] ❌ Erro ao sincronizar mensagem:', err);
        });
    }
    
    // Atualizar chat
    if (currentChatUser.isGroup) {
        loadGroupMessages(currentChatUser.id);
    } else {
        loadChatMessages(currentChatUser.id);
    }
    
    // Limpar input
    input.value = '';
    input.focus();
    
    showNotification('Mensagem enviada!', 'success');
}



// Inicializar chat quando a página carregar
function initChat() {
    console.log('[chat] Inicializando chat...');
    setupChat();
    loadChatUsers();
    setupCreateGroupButton();
}

/**
 * Configurar botão de criar grupo
 */
function setupCreateGroupButton() {
    console.log('[chat] Configurando botão de criar grupo...');
    const createGroupBtn = document.getElementById('createGroupBtn');
    console.log('[chat] Botão encontrado:', createGroupBtn);
    
    if (createGroupBtn) {
        // Remover listener anterior se existir
        createGroupBtn.replaceWith(createGroupBtn.cloneNode(true));
        const newBtn = document.getElementById('createGroupBtn');
        
        newBtn.addEventListener('click', function(e) {
            console.log('[chat] Botão criar grupo clicado!');
            e.preventDefault();
            openCreateGroupModal();
        });
        
        console.log('[chat] Event listener adicionado ao botão');
    } else {
        console.warn('[chat] Botão createGroupBtn não encontrado no DOM');
    }
}

/**
 * Abrir modal de criar grupo
 */
function openCreateGroupModal() {
    console.log('[chat] Abrindo modal de criar grupo...');
    
    // Criar modal se não existir
    let modal = document.getElementById('createGroupModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'createGroupModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h3>Criar Novo Grupo</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <form id="createGroupForm">
                    <div class="form-group">
                        <label class="form-label" for="groupName">Nome do Grupo</label>
                        <input type="text" class="form-control" id="groupName" placeholder="Ex: Grupo de Oração" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Selecionar Membros</label>
                        <div id="groupMembersList" style="max-height: 300px; overflow-y: auto; border: 1px solid var(--border-color); border-radius: 8px; padding: 10px;">
                            <!-- Membros serão listados aqui -->
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <button type="submit" class="btn btn-primary" style="width: 100%;">
                            <i class="fas fa-users"></i> Criar Grupo
                        </button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Event listeners
        const closeBtn = modal.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
        
        // Form submit
        const form = modal.querySelector('#createGroupForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            createGroup();
        });
    }
    
    // Carregar lista de usuários
    loadGroupMembersList();
    
    // Mostrar modal
    modal.classList.add('active');
}

/**
 * Carregar lista de membros para seleção
 */
function loadGroupMembersList() {
    const container = document.getElementById('groupMembersList');
    if (!container) return;
    
    container.innerHTML = '';
    
    const otherUsers = users.filter(u => u.id !== currentUser.id);
    
    if (otherUsers.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--gray); padding: 20px;">Nenhum usuário disponível</p>';
        return;
    }
    
    otherUsers.forEach(user => {
        const memberItem = document.createElement('div');
        memberItem.className = 'group-member-item';
        memberItem.innerHTML = `
            <label style="display: flex; align-items: center; gap: 12px; padding: 10px; cursor: pointer; border-radius: 8px; transition: all 0.2s;">
                <input type="checkbox" class="group-member-checkbox" value="${user.id}" style="width: 20px; height: 20px; cursor: pointer;">
                <div class="chat-user-avatar" style="width: 35px; height: 35px; font-size: 12px;">${user.name.split(' ').map(n => n[0]).join('').toUpperCase()}</div>
                <div>
                    <div style="font-weight: 500;">${user.name}</div>
                    <div style="font-size: 12px; color: var(--gray);">${user.email}</div>
                </div>
            </label>
        `;
        
        memberItem.addEventListener('mouseenter', function() {
            this.style.background = 'var(--light)';
        });
        
        memberItem.addEventListener('mouseleave', function() {
            this.style.background = 'transparent';
        });
        
        container.appendChild(memberItem);
    });
}

/**
 * Criar grupo
 */
function createGroup() {
    const groupName = document.getElementById('groupName').value.trim();
    const checkboxes = document.querySelectorAll('.group-member-checkbox:checked');
    
    if (!groupName) {
        showNotification('Digite um nome para o grupo', 'error');
        return;
    }
    
    if (checkboxes.length === 0) {
        showNotification('Selecione pelo menos um membro', 'error');
        return;
    }
    
    const memberIds = Array.from(checkboxes).map(cb => parseInt(cb.value));
    
    // Adicionar o criador do grupo
    memberIds.push(currentUser.id);
    
    const newGroup = {
        id: 'group_' + Date.now(),
        name: groupName,
        members: memberIds,
        createdBy: currentUser.id,
        createdAt: new Date().toISOString()
    };
    
    chatGroups.push(newGroup);
    localStorage.setItem('chatGroups', JSON.stringify(chatGroups));
    
    console.log('[chat] Grupo criado:', newGroup);
    
    showNotification('Grupo criado com sucesso!', 'success');
    
    // Fechar modal
    document.getElementById('createGroupModal').classList.remove('active');
    
    // Recarregar lista de usuários/grupos
    loadChatUsers();
}

/**
 * Selecionar grupo de chat
 */
function selectChatGroup(groupId) {
    const group = chatGroups.find(g => g.id === groupId);
    if (!group) return;
    
    // Marcar como grupo selecionado
    currentChatUser = { isGroup: true, ...group };
    
    // Atualizar interface
    document.querySelectorAll('.chat-user').forEach(u => u.classList.remove('active'));
    const selectedGroup = document.querySelector(`.chat-user[data-group-id="${groupId}"]`);
    if (selectedGroup) {
        selectedGroup.classList.add('active');
    }
    
    const currentChatUserElement = document.getElementById('currentChatUser');
    const currentChatStatusElement = document.getElementById('currentChatStatus');
    
    if (currentChatUserElement) {
        currentChatUserElement.innerHTML = `<i class="fas fa-users"></i> ${group.name}`;
    }
    if (currentChatStatusElement) {
        currentChatStatusElement.textContent = `${group.members.length} membros`;
    }
    
    // Carregar mensagens do grupo
    loadGroupMessages(groupId);
    
    // Ativar input de chat
    const chatInput = document.getElementById('chatInput');
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    
    if (chatInput) chatInput.disabled = false;
    if (sendMessageBtn) sendMessageBtn.disabled = false;
}

/**
 * Carregar mensagens do grupo
 */
function loadGroupMessages(groupId) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    chatMessages.innerHTML = '';
    
    // Filtrar mensagens do grupo
    const groupMessages = messages.filter(m => m.groupId === groupId)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    if (groupMessages.length === 0) {
        chatMessages.innerHTML = `
            <div style="text-align: center; color: var(--gray); padding: 40px;">
                <i class="fas fa-users fa-3x" style="margin-bottom: 20px; opacity: 0.5;"></i>
                <p>Nenhuma mensagem no grupo ainda.</p>
                <p>Seja o primeiro a enviar uma mensagem!</p>
            </div>
        `;
        return;
    }
    
    groupMessages.forEach(message => {
        const sender = users.find(u => u.id === message.from);
        const senderName = sender ? sender.name : 'Usuário desconhecido';
        
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.from === currentUser.id ? 'sent' : 'received'}`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        // Adicionar nome do remetente em mensagens de grupo
        if (message.from !== currentUser.id) {
            const senderLabel = document.createElement('div');
            senderLabel.className = 'message-sender';
            senderLabel.textContent = senderName;
            senderLabel.style.fontWeight = '600';
            senderLabel.style.fontSize = '12px';
            senderLabel.style.color = 'var(--primary)';
            senderLabel.style.marginBottom = '4px';
            messageContent.appendChild(senderLabel);
        }
        
        const textNode = document.createElement('div');
        textNode.textContent = message.content;
        messageContent.appendChild(textNode);
        
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