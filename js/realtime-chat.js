// Chat em Tempo Real com WebSocket
class RealtimeChatSystem {
    constructor() {
        this.ws = null;
        this.currentRoom = null;
        this.messages = [];
        this.users = [];
        this.isConnected = false;
        this.config = {
            wsUrl: 'wss://eventflow-chat.herokuapp.com', // Simulado
            reconnectInterval: 5000,
            maxReconnectAttempts: 5
        };
        this.reconnectAttempts = 0;
        this.init();
    }

    init() {
        this.loadMessages();
        this.simulateWebSocket(); // Simular WebSocket para demo
        this.renderChatInterface();
        this.setupEventListeners();
    }

    simulateWebSocket() {
        // Simular conexão WebSocket (em produção, usaria Socket.io ou WebSocket real)
        console.log('🔌 Simulando conexão WebSocket...');
        this.isConnected = true;
        
        // Simular recebimento de mensagens periódicas
        setInterval(() => {
            if (Math.random() > 0.8) {
                this.simulateIncomingMessage();
            }
        }, 10000);
    }

    connect() {
        try {
            // Em produção:
            // this.ws = new WebSocket(this.config.wsUrl);
            // this.ws.onopen = () => this.onConnect();
            // this.ws.onmessage = (e) => this.onMessage(e.data);
            // this.ws.onerror = (e) => this.onError(e);
            // this.ws.onclose = () => this.onDisconnect();
            
            this.isConnected = true;
            console.log('✅ Conectado ao chat');
        } catch (error) {
            console.error('❌ Erro ao conectar:', error);
            this.reconnect();
        }
    }

    reconnect() {
        if (this.reconnectAttempts < this.config.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`🔄 Tentativa de reconexão ${this.reconnectAttempts}...`);
            setTimeout(() => this.connect(), this.config.reconnectInterval);
        }
    }

    joinRoom(roomId) {
        this.currentRoom = roomId;
        this.loadRoomMessages(roomId);
        this.renderMessages();
        
        // Em produção: this.ws.send(JSON.stringify({ type: 'join', room: roomId }));
        console.log(`🚪 Entrou na sala: ${roomId}`);
    }

    sendMessage(content, type = 'text') {
        if (!this.currentRoom) {
            showNotificationToast('Selecione uma sala primeiro', 'warning');
            return;
        }

        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const message = {
            id: Date.now() + Math.random(),
            roomId: this.currentRoom,
            userId: currentUser.id,
            userName: currentUser.name,
            userAvatar: currentUser.avatar || this.getDefaultAvatar(currentUser.name),
            content,
            type, // text, image, file, emoji
            timestamp: new Date(),
            reactions: [],
            status: 'sent' // sent, delivered, read
        };

        this.messages.push(message);
        this.saveMessages();
        this.renderMessages();
        
        // Em produção: this.ws.send(JSON.stringify({ type: 'message', data: message }));
        
        // Scroll para última mensagem
        setTimeout(() => {
            const chatMessages = document.querySelector('.chat-messages');
            if (chatMessages) {
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        }, 100);
    }

    simulateIncomingMessage() {
        const sampleMessages = [
            'Alguém sabe que horas começa?',
            'Muito animado para este evento! 🎉',
            'Qual é o dress code?',
            'Posso levar acompanhante?',
            'Haverá transmissão online?'
        ];

        const message = {
            id: Date.now() + Math.random(),
            roomId: this.currentRoom,
            userId: 'user-' + Math.random(),
            userName: 'Usuário ' + Math.floor(Math.random() * 100),
            userAvatar: this.getDefaultAvatar('U'),
            content: sampleMessages[Math.floor(Math.random() * sampleMessages.length)],
            type: 'text',
            timestamp: new Date(),
            reactions: [],
            status: 'delivered'
        };

        this.messages.push(message);
        this.saveMessages();
        this.renderMessages();
    }

    renderChatInterface() {
        const container = document.getElementById('chat-container');
        if (!container) return;

        container.innerHTML = `
            <div class="chat-layout">
                <div class="chat-sidebar">
                    <h3>💬 Salas de Chat</h3>
                    <div class="chat-rooms-list">
                        ${this.renderRoomsList()}
                    </div>
                    <div class="direct-messages">
                        <h4>Mensagens Diretas</h4>
                        <div class="dm-list">
                            ${this.renderDirectMessages()}
                        </div>
                    </div>
                </div>
                <div class="chat-main">
                    <div class="chat-header">
                        <div class="room-info">
                            <h3 id="current-room-name">Selecione uma sala</h3>
                            <span class="online-count">0 online</span>
                        </div>
                        <div class="chat-actions">
                            <button class="btn-chat-action" title="Buscar">
                                <i class="fas fa-search"></i>
                            </button>
                            <button class="btn-chat-action" title="Info">
                                <i class="fas fa-info-circle"></i>
                            </button>
                        </div>
                    </div>
                    <div class="chat-messages" id="chat-messages">
                        ${this.renderMessages()}
                    </div>
                    <div class="chat-input-area">
                        <button class="btn-attach">
                            <i class="fas fa-paperclip"></i>
                        </button>
                        <button class="btn-emoji">
                            <i class="fas fa-smile"></i>
                        </button>
                        <input type="text" id="message-input" placeholder="Digite sua mensagem..." />
                        <button class="btn-send" id="send-message">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderRoomsList() {
        const events = JSON.parse(localStorage.getItem('events') || '[]');
        return events.map(event => `
            <div class="chat-room-item" data-room-id="event-${event.id}">
                <div class="room-icon">${event.category.charAt(0)}</div>
                <div class="room-info">
                    <div class="room-name">${event.name}</div>
                    <div class="room-last-message">Última mensagem...</div>
                </div>
                <div class="unread-badge">3</div>
            </div>
        `).join('');
    }

    renderDirectMessages() {
        const users = JSON.parse(localStorage.getItem('users') || '[]').slice(0, 5);
        return users.map(user => `
            <div class="dm-item" data-user-id="${user.id}">
                <img src="${user.avatar || this.getDefaultAvatar(user.name)}" alt="${user.name}">
                <div class="dm-name">${user.name}</div>
                <div class="online-status ${Math.random() > 0.5 ? 'online' : 'offline'}"></div>
            </div>
        `).join('');
    }

    renderMessages() {
        const roomMessages = this.messages.filter(m => m.roomId === this.currentRoom);
        
        if (roomMessages.length === 0) {
            return '<div class="no-messages">Nenhuma mensagem ainda. Seja o primeiro a falar! 👋</div>';
        }

        return roomMessages.map((msg, index) => {
            const prevMsg = roomMessages[index - 1];
            const showAvatar = !prevMsg || prevMsg.userId !== msg.userId;
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            const isOwnMessage = msg.userId === currentUser.id;

            return `
                <div class="message ${isOwnMessage ? 'own-message' : ''}" data-message-id="${msg.id}">
                    ${showAvatar ? `<img src="${msg.userAvatar}" class="message-avatar" alt="${msg.userName}">` : '<div class="message-avatar-spacer"></div>'}
                    <div class="message-content">
                        ${showAvatar ? `<div class="message-author">${msg.userName}</div>` : ''}
                        <div class="message-bubble">
                            ${this.renderMessageContent(msg)}
                            <div class="message-time">${new Date(msg.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                        <div class="message-reactions">
                            ${msg.reactions.map(r => `<span class="reaction">${r.emoji} ${r.count}</span>`).join('')}
                        </div>
                    </div>
                    <div class="message-actions">
                        <button class="btn-react" title="Reagir"><i class="fas fa-smile"></i></button>
                        <button class="btn-reply" title="Responder"><i class="fas fa-reply"></i></button>
                        ${isOwnMessage ? '<button class="btn-delete" title="Deletar"><i class="fas fa-trash"></i></button>' : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    renderMessageContent(message) {
        switch (message.type) {
            case 'text':
                return this.linkify(this.escapeHtml(message.content));
            case 'image':
                return `<img src="${message.content}" class="message-image" alt="Imagem">`;
            case 'file':
                return `<a href="${message.content}" class="message-file"><i class="fas fa-file"></i> ${message.fileName}</a>`;
            default:
                return message.content;
        }
    }

    setupEventListeners() {
        // Selecionar sala
        document.addEventListener('click', (e) => {
            const roomItem = e.target.closest('.chat-room-item');
            if (roomItem) {
                const roomId = roomItem.dataset.roomId;
                this.joinRoom(roomId);
                document.getElementById('current-room-name').textContent = roomItem.querySelector('.room-name').textContent;
            }

            // Enviar mensagem
            const sendBtn = e.target.closest('#send-message');
            if (sendBtn) {
                this.handleSendMessage();
            }

            // Reações
            const reactBtn = e.target.closest('.btn-react');
            if (reactBtn) {
                this.showEmojiPicker(reactBtn);
            }
        });

        // Enter para enviar
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.id === 'message-input') {
                this.handleSendMessage();
            }
        });
    }

    handleSendMessage() {
        const input = document.getElementById('message-input');
        if (!input || !input.value.trim()) return;

        this.sendMessage(input.value.trim());
        input.value = '';
    }

    showEmojiPicker(button) {
        const emojis = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🎉', '🔥'];
        const picker = document.createElement('div');
        picker.className = 'emoji-picker';
        picker.innerHTML = emojis.map(e => `<span class="emoji-option">${e}</span>`).join('');
        
        button.appendChild(picker);
        
        picker.addEventListener('click', (e) => {
            if (e.target.classList.contains('emoji-option')) {
                this.addReaction(button.closest('.message').dataset.messageId, e.target.textContent);
                picker.remove();
            }
        });

        setTimeout(() => picker.remove(), 5000);
    }

    addReaction(messageId, emoji) {
        const message = this.messages.find(m => m.id == messageId);
        if (!message) return;

        const existingReaction = message.reactions.find(r => r.emoji === emoji);
        if (existingReaction) {
            existingReaction.count++;
        } else {
            message.reactions.push({ emoji, count: 1 });
        }

        this.saveMessages();
        this.renderMessages();
    }

    loadMessages() {
        this.messages = JSON.parse(localStorage.getItem('chat_messages') || '[]');
    }

    loadRoomMessages(roomId) {
        // Carregar mensagens do servidor em produção
        console.log('📨 Carregando mensagens da sala:', roomId);
    }

    saveMessages() {
        localStorage.setItem('chat_messages', JSON.stringify(this.messages));
    }

    getDefaultAvatar(name) {
        const colors = ['#9b59b6', '#3498db', '#e74c3c', '#2ecc71', '#f39c12'];
        const color = colors[name.charCodeAt(0) % colors.length];
        return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect fill="${color}" width="40" height="40"/><text x="50%" y="50%" fill="white" text-anchor="middle" dy=".3em" font-size="20" font-family="Arial">${name.charAt(0).toUpperCase()}</text></svg>`)}`;
    }

    linkify(text) {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.replace(urlRegex, '<a href="$1" target="_blank">$1</a>');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Inicializar
let realtimeChatSystem;
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('chat-container')) {
        realtimeChatSystem = new RealtimeChatSystem();
        window.realtimeChatSystem = realtimeChatSystem;
    }
});
