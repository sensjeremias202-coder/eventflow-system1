// ============================================
// VARIÁVEIS GLOBAIS DO CHAT
// ============================================
let currentChatUser = null;
let autoMessageInterval = null;

// Getter e Setter para grupos (sempre sincronizado com localStorage)
Object.defineProperty(window, 'chatGroups', {
    get: function() {
        const saved = localStorage.getItem('chatGroups');
        return saved ? JSON.parse(saved) : [];
    },
    set: function(value) {
        localStorage.setItem('chatGroups', JSON.stringify(value));
    }
});

// ============================================
// INICIALIZAÇÃO DO CHAT
// ============================================
function initChat() {
    console.log('[chat] ═══════════════════════════════════');
    console.log('[chat] Inicializando chat...');
    loadChatUsers();
    setupChat();
    setupChatEventDelegation();
    console.log('[chat] ✅ Chat inicializado com sucesso');
    console.log('[chat] ═══════════════════════════════════');
}

// ============================================
// DELEGAÇÃO DE EVENTOS - UMA VEZ APENAS
// ============================================
let chatEventDelegationSetup = false;

function setupChatEventDelegation() {
    if (chatEventDelegationSetup) {
        console.log('[chat] Event delegation já configurada');
        return;
    }
    
    console.log('[chat] Configurando event delegation...');
    
    // Delegação para cliques em usuários e grupos
    document.body.addEventListener('click', function(e) {
        // Clicar em usuário individual
        const chatUser = e.target.closest('.chat-user:not(.chat-group)');
        if (chatUser && chatUser.hasAttribute('data-id')) {
            const userId = parseInt(chatUser.getAttribute('data-id'));
            selectChatUser(userId);
            return;
        }
        
        // Clicar em grupo
        const chatGroup = e.target.closest('.chat-group');
        if (chatGroup && chatGroup.hasAttribute('data-group-id')) {
            const groupId = chatGroup.getAttribute('data-group-id');
            selectChatGroup(groupId);
            return;
        }
        
        // Botão de opções do grupo
        if (e.target.closest('#groupOptionsBtn')) {
            e.stopPropagation();
            const group = window.chatGroups.find(g => g.id === currentChatUser.id);
            if (group) showGroupOptionsMenu(group);
            return;
        }
        
        // Fechar menu de opções ao clicar fora
        const menu = document.getElementById('groupOptionsMenu');
        if (menu && !e.target.closest('#groupOptionsMenu')) {
            menu.remove();
        }
    });
    
    chatEventDelegationSetup = true;
    console.log('[chat] ✅ Event delegation configurada');
}

// ============================================
// CARREGAR LISTA DE USUÁRIOS E GRUPOS
// ============================================
function loadChatUsers() {
    console.log('[chat] ─────────────────────────────────');
    console.log('[chat] 📋 Carregando lista de chat...');
    
    const chatUsers = document.getElementById('chatUsers');
    if (!chatUsers) {
        console.error('[chat] ❌ Elemento chatUsers não encontrado!');
        return;
    }
    
    chatUsers.innerHTML = '';
    
    // Carregar grupos - sempre do localStorage via getter
    const groups = window.chatGroups;
    console.log('[chat] 📊 Grupos encontrados:', groups.length);
    
    // Adicionar seção de grupos
    if (groups.length > 0) {
        console.log('[chat] 📁 Criando seção de grupos...');
        
        const groupsHeader = document.createElement('div');
        groupsHeader.className = 'chat-section-header';
        groupsHeader.innerHTML = '<h4><i class="fas fa-users"></i> Grupos</h4>';
        chatUsers.appendChild(groupsHeader);
        
        groups.forEach((group, index) => {
            console.log(`[chat]   └─ Grupo ${index + 1}: "${group.name}" (${group.members.length} membros)`);
            
            const groupElement = document.createElement('div');
            groupElement.className = 'chat-user chat-group';
            groupElement.setAttribute('data-group-id', group.id);
            groupElement.innerHTML = `
                <div class="chat-user-avatar group-avatar">
                    <i class="fas fa-users"></i>
                </div>
                <div style="flex: 1;">
                    <div class="user-name">${group.name}</div>
                    <div class="user-status">${group.members.length} membros</div>
                </div>
            `;
            chatUsers.appendChild(groupElement);
        });
        
        // Separador
        const separator = document.createElement('div');
        separator.className = 'chat-section-header';
        separator.innerHTML = '<h4><i class="fas fa-user"></i> Usuários</h4>';
        chatUsers.appendChild(separator);
    }
    
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
        chatUsers.appendChild(userElement);
    });
    
    // Selecionar primeiro item se nada estiver selecionado
    if (!currentChatUser) {
        if (groups.length > 0) {
            selectChatGroup(groups[0].id);
        } else if (chatPartners.length > 0) {
            selectChatUser(chatPartners[0].id);
        }
    }
    
    console.log('[chat] ✅ Lista de chat carregada');
    console.log('[chat] ─────────────────────────────────');
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
    loadChatUsers();
    setupChat();
    // O botão de criar grupo é gerenciado por delegação de eventos no app.js
}

// Função openCreateGroupModal - chamada via delegação de eventos
function openCreateGroupModal() {
    console.log('[chat] Abrindo modal de criar grupo...');
    
    // Criar modal se não existir
    let modal = document.getElementById('createGroupModal');
    if (!modal) {
        console.log('[chat] Criando modal pela primeira vez...');
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
        console.log('[chat] Modal adicionado ao body');
        
        // Event listeners
        const closeBtn = modal.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => {
            console.log('[chat] Fechando modal');
            modal.classList.remove('active');
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                console.log('[chat] Fechando modal (clique fora)');
                modal.classList.remove('active');
            }
        });
    }
    
    // Form submit - sempre reconfigurar
    const form = document.getElementById('createGroupForm');
    if (form) {
        // Remover listeners antigos
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);
        
        // Adicionar novo listener
        document.getElementById('createGroupForm').addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('[chat] Form submit - criando grupo...');
            createGroup();
        });
        console.log('[chat] Listener de submit configurado');
    }
    
    // Carregar lista de usuários
    loadGroupMembersList();
    
    // Mostrar modal
    modal.classList.add('active');
    console.log('[chat] Modal exibido');
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
    console.log('[chat] createGroup() chamada');
    
    const groupNameInput = document.getElementById('groupName');
    const checkboxes = document.querySelectorAll('.group-member-checkbox:checked');
    
    console.log('[chat] Input groupName:', groupNameInput);
    console.log('[chat] Checkboxes selecionadas:', checkboxes.length);
    
    const groupName = groupNameInput ? groupNameInput.value.trim() : '';
    
    if (!groupName) {
        console.warn('[chat] Nome do grupo vazio');
        showNotification('Digite um nome para o grupo', 'error');
        return;
    }
    
    if (checkboxes.length === 0) {
        console.warn('[chat] Nenhum membro selecionado');
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
    console.log('[chat] Total de grupos:', chatGroups.length);
    
    showNotification('Grupo criado com sucesso!', 'success');
    
    // Fechar modal
    const modal = document.getElementById('createGroupModal');
    if (modal) {
        modal.classList.remove('active');
        console.log('[chat] Modal fechado');
    }
    
    // Limpar form
    if (groupNameInput) groupNameInput.value = '';
    checkboxes.forEach(cb => cb.checked = false);
    
    // Recarregar lista de usuários/grupos
    loadChatUsers();
}

/**
 * Selecionar grupo de chat
 */
function selectChatGroup(groupId) {
    console.log('[chat] 🔵 Selecionando grupo:', groupId);
    
    const group = window.chatGroups.find(g => g.id === groupId);
    if (!group) {
        console.error('[chat] ❌ Grupo não encontrado:', groupId);
        return;
    }
    
    // Marcar como grupo selecionado
    currentChatUser = { isGroup: true, ...group };
    console.log('[chat] ✅ Grupo selecionado:', group.name);
    
    // Atualizar UI - remover seleção anterior
    document.querySelectorAll('.chat-user').forEach(u => u.classList.remove('active'));
    
    // Adicionar seleção ao grupo
    const selectedGroup = document.querySelector(`.chat-user[data-group-id="${groupId}"]`);
    if (selectedGroup) {
        selectedGroup.classList.add('active');
    }
    
    // Atualizar cabeçalho do chat
    const currentChatUserElement = document.getElementById('currentChatUser');
    const currentChatStatusElement = document.getElementById('currentChatStatus');
    
    if (currentChatUserElement) {
        currentChatUserElement.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px; width: 100%;">
                <i class="fas fa-users"></i> 
                <span style="flex: 1;">${group.name}</span>
                <button class="btn btn-sm" id="groupOptionsBtn" style="margin-left: auto;" title="Opções do grupo">
                    <i class="fas fa-ellipsis-v"></i>
                </button>
            </div>
        `;
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
window.openCreateGroupModal = openCreateGroupModal;

/**
 * Mostrar menu de opções do grupo
 */
function showGroupOptionsMenu(group) {
    // Remover menu anterior se existir
    const existingMenu = document.getElementById('groupOptionsMenu');
    if (existingMenu) {
        existingMenu.remove();
        return;
    }
    
    const menu = document.createElement('div');
    menu.id = 'groupOptionsMenu';
    menu.className = 'dropdown-menu';
    menu.style.cssText = `
        position: absolute;
        top: 60px;
        right: 20px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        padding: 8px 0;
        min-width: 200px;
        z-index: 1000;
    `;
    
    const isCreator = group.createdBy === currentUser.id;
    const isMember = group.members.includes(currentUser.id);
    
    menu.innerHTML = `
        <div class="menu-item" data-action="viewMembers" style="padding: 12px 16px; cursor: pointer; transition: background 0.2s;">
            <i class="fas fa-users" style="margin-right: 8px; width: 20px;"></i> Ver Membros
        </div>
        ${isCreator ? `
        <div class="menu-item" data-action="addMembers" style="padding: 12px 16px; cursor: pointer; transition: background 0.2s;">
            <i class="fas fa-user-plus" style="margin-right: 8px; width: 20px;"></i> Adicionar Membros
        </div>
        ` : ''}
        <div class="menu-item" data-action="leaveGroup" style="padding: 12px 16px; cursor: pointer; transition: background 0.2s;">
            <i class="fas fa-sign-out-alt" style="margin-right: 8px; width: 20px;"></i> Sair do Grupo
        </div>
        ${isCreator ? `
        <div style="height: 1px; background: var(--border-color); margin: 4px 0;"></div>
        <div class="menu-item" data-action="deleteGroup" style="padding: 12px 16px; cursor: pointer; transition: background 0.2s; color: var(--danger);">
            <i class="fas fa-trash" style="margin-right: 8px; width: 20px;"></i> Excluir Grupo
        </div>
        ` : ''}
    `;
    
    document.body.appendChild(menu);
    
    // Adicionar hover effects
    menu.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.background = 'var(--light)';
        });
        item.addEventListener('mouseleave', function() {
            this.style.background = 'transparent';
        });
        
        item.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            menu.remove();
            handleGroupAction(action, group);
        });
    });
    
    // Fechar ao clicar fora
    setTimeout(() => {
        document.addEventListener('click', function closeMenu() {
            menu.remove();
            document.removeEventListener('click', closeMenu);
        });
    }, 100);
}

/**
 * Executar ação do grupo
 */
function handleGroupAction(action, group) {
    switch(action) {
        case 'viewMembers':
            viewGroupMembers(group);
            break;
        case 'addMembers':
            addGroupMembers(group);
            break;
        case 'leaveGroup':
            leaveGroup(group);
            break;
        case 'deleteGroup':
            deleteGroup(group);
            break;
    }
}

/**
 * Ver membros do grupo
 */
function viewGroupMembers(group) {
    const membersList = group.members.map(memberId => {
        const user = users.find(u => u.id === memberId);
        return user ? `
            <div style="display: flex; align-items: center; gap: 12px; padding: 12px; border-bottom: 1px solid var(--border-color);">
                <div class="chat-user-avatar" style="width: 40px; height: 40px;">${user.name.split(' ').map(n => n[0]).join('').toUpperCase()}</div>
                <div style="flex: 1;">
                    <div style="font-weight: 500;">${user.name}</div>
                    <div style="font-size: 12px; color: var(--gray);">${user.email}</div>
                </div>
                ${group.createdBy === user.id ? '<span style="background: var(--primary); color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px;">Admin</span>' : ''}
            </div>
        ` : '';
    }).join('');
    
    showModal('Membros do Grupo', `
        <div style="max-height: 400px; overflow-y: auto;">
            ${membersList}
        </div>
    `);
}

/**
 * Adicionar membros ao grupo
 */
function addGroupMembers(group) {
    const availableUsers = users.filter(u => 
        !group.members.includes(u.id) && u.id !== currentUser.id
    );
    
    if (availableUsers.length === 0) {
        showNotification('Todos os usuários já estão no grupo', 'info');
        return;
    }
    
    const usersList = availableUsers.map(user => `
        <label style="display: flex; align-items: center; gap: 12px; padding: 10px; cursor: pointer; border-radius: 8px; transition: all 0.2s;" onmouseenter="this.style.background='var(--light)'" onmouseleave="this.style.background='transparent'">
            <input type="checkbox" class="add-member-checkbox" value="${user.id}" style="width: 20px; height: 20px; cursor: pointer;">
            <div class="chat-user-avatar" style="width: 35px; height: 35px;">${user.name.split(' ').map(n => n[0]).join('').toUpperCase()}</div>
            <div>
                <div style="font-weight: 500;">${user.name}</div>
                <div style="font-size: 12px; color: var(--gray);">${user.email}</div>
            </div>
        </label>
    `).join('');
    
    showModal('Adicionar Membros', `
        <div style="max-height: 300px; overflow-y: auto; border: 1px solid var(--border-color); border-radius: 8px; padding: 10px; margin-bottom: 15px;">
            ${usersList}
        </div>
        <button class="btn btn-primary" onclick="confirmAddMembers('${group.id}')" style="width: 100%;">
            <i class="fas fa-user-plus"></i> Adicionar Selecionados
        </button>
    `);
}

/**
 * Confirmar adição de membros
 */
function confirmAddMembers(groupId) {
    console.log('[chat] 👥 Adicionando membros ao grupo:', groupId);
    
    const checkboxes = document.querySelectorAll('.add-member-checkbox:checked');
    
    if (checkboxes.length === 0) {
        showNotification('Selecione pelo menos um membro', 'error');
        return;
    }
    
    const newMemberIds = Array.from(checkboxes).map(cb => parseInt(cb.value));
    
    // Atualizar grupo usando getter/setter
    const groups = window.chatGroups;
    const groupIndex = groups.findIndex(g => g.id === groupId);
    
    if (groupIndex !== -1) {
        groups[groupIndex].members.push(...newMemberIds);
        window.chatGroups = groups; // Trigger setter
        
        console.log('[chat] ✅ Membros adicionados:', newMemberIds);
        showNotification(`${newMemberIds.length} membro(s) adicionado(s)`, 'success');
        
        // Fechar modal
        const modal = document.getElementById('customModal');
        if (modal) modal.classList.remove('active');
        
        // Recarregar e reselecionar
        loadChatUsers();
        selectChatGroup(groupId);
    }
}

/**
 * Sair do grupo
 */
function leaveGroup(group) {
    console.log('[chat] 🚪 Saindo do grupo:', group.name);
    
    if (!confirm(`Deseja realmente sair do grupo "${group.name}"?`)) {
        return;
    }
    
    const groups = window.chatGroups;
    const groupIndex = groups.findIndex(g => g.id === group.id);
    
    if (groupIndex !== -1) {
        // Remover usuário
        groups[groupIndex].members = groups[groupIndex].members.filter(id => id !== currentUser.id);
        
        // Se ficar vazio, excluir
        if (groups[groupIndex].members.length === 0) {
            groups.splice(groupIndex, 1);
            console.log('[chat] 🗑️ Grupo vazio - excluído');
        }
        
        window.chatGroups = groups; // Trigger setter
        
        console.log('[chat] ✅ Você saiu do grupo');
        showNotification('Você saiu do grupo', 'success');
        
        // Recarregar
        currentChatUser = null;
        loadChatUsers();
    }
}

/**
 * Excluir grupo
 */
function deleteGroup(group) {
    console.log('[chat] 🗑️ Excluindo grupo:', group.name);
    
    if (!confirm(`Deseja realmente excluir o grupo "${group.name}"? Esta ação não pode ser desfeita.`)) {
        return;
    }
    
    const groups = window.chatGroups;
    const groupIndex = groups.findIndex(g => g.id === group.id);
    
    if (groupIndex !== -1) {
        groups.splice(groupIndex, 1);
        window.chatGroups = groups; // Trigger setter
        
        console.log('[chat] ✅ Grupo excluído');
        showNotification('Grupo excluído', 'success');
        
        // Recarregar
        currentChatUser = null;
        loadChatUsers();
    }
}

/**
 * Mostrar modal customizado
 */
function showModal(title, content) {
    let modal = document.getElementById('customModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'customModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="customModalTitle">${title}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div id="customModalBody"></div>
            </div>
        `;
        document.body.appendChild(modal);
        
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.classList.remove('active');
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }
    
    document.getElementById('customModalTitle').textContent = title;
    document.getElementById('customModalBody').innerHTML = content;
    modal.classList.add('active');
}

// Exportar funções para uso global
window.confirmAddMembers = confirmAddMembers;