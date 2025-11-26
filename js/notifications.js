/**
 * ============================================
 * SISTEMA DE NOTIFICAÇÕES
 * ============================================
 * Gerencia notificações em tempo real do sistema
 */

let notifications = [];
const MAX_NOTIFICATIONS = 50;

// Carregar notificações do localStorage
function loadNotifications() {
    try {
        const saved = localStorage.getItem('notifications');
        notifications = saved ? JSON.parse(saved) : [];
    } catch (error) {
        console.error('Erro ao carregar notificações:', error);
        notifications = [];
    }
}

// Salvar notificações
function saveNotifications() {
    try {
        // Manter apenas as últimas 50 notificações
        if (notifications.length > MAX_NOTIFICATIONS) {
            notifications = notifications.slice(-MAX_NOTIFICATIONS);
        }
        localStorage.setItem('notifications', JSON.stringify(notifications));
    } catch (error) {
        console.error('Erro ao salvar notificações:', error);
    }
}

// Criar nova notificação
function createNotification(type, title, message, data = {}) {
    const notification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type, // 'event', 'message', 'reminder', 'system'
        title,
        message,
        data,
        timestamp: Date.now(),
        read: false
    };
    
    notifications.unshift(notification);
    saveNotifications();
    
    // Mostrar notificação visual
    showNotificationToast(notification);
    
    // Atualizar badge de contagem
    updateNotificationBadge();
    
    // Tentar enviar notificação do navegador
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            body: message,
            icon: '/icon-192.png',
            badge: '/icon-72.png',
            tag: notification.id
        });
    }
    
    return notification;
}

// Mostrar toast de notificação
function showNotificationToast(notification) {
    const toast = document.createElement('div');
    toast.className = `notification-toast notification-${notification.type}`;
    toast.innerHTML = `
        <div class="notification-toast-icon">
            <i class="fas ${getNotificationIcon(notification.type)}"></i>
        </div>
        <div class="notification-toast-content">
            <div class="notification-toast-title">${notification.title}</div>
            <div class="notification-toast-message">${notification.message}</div>
        </div>
        <button class="notification-toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(toast);
    
    // Animar entrada
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Auto-remover após 5 segundos
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 5000);
    
    // Ao clicar, abrir detalhes
    toast.addEventListener('click', (e) => {
        if (!e.target.closest('.notification-toast-close')) {
            handleNotificationClick(notification);
            toast.remove();
        }
    });
}

// Ícone por tipo de notificação
function getNotificationIcon(type) {
    const icons = {
        event: 'fa-calendar-alt',
        message: 'fa-comment',
        reminder: 'fa-bell',
        system: 'fa-info-circle',
        success: 'fa-check-circle',
        warning: 'fa-exclamation-triangle',
        error: 'fa-times-circle'
    };
    return icons[type] || 'fa-bell';
}

// Atualizar badge de contagem
function updateNotificationBadge() {
    const unreadCount = notifications.filter(n => !n.read).length;
    const badge = document.getElementById('notificationBadge');
    
    if (badge) {
        if (unreadCount > 0) {
            badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }
}

// Marcar notificação como lida
function markAsRead(notificationId) {
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
        notification.read = true;
        saveNotifications();
        updateNotificationBadge();
    }
}

// Marcar todas como lidas
function markAllAsRead() {
    notifications.forEach(n => n.read = true);
    saveNotifications();
    updateNotificationBadge();
}

// Limpar notificações antigas
function clearOldNotifications(daysOld = 7) {
    const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
    notifications = notifications.filter(n => n.timestamp > cutoffTime);
    saveNotifications();
    updateNotificationBadge();
}

// Lidar com clique em notificação
function handleNotificationClick(notification) {
    markAsRead(notification.id);
    
    // Navegar baseado no tipo
    switch(notification.type) {
        case 'event':
            if (notification.data.eventId) {
                showModularPage('events');
                // Abrir modal do evento após carregar
                setTimeout(() => {
                    const event = events.find(e => e.id === notification.data.eventId);
                    if (event && typeof viewEvent === 'function') {
                        viewEvent(event);
                    }
                }, 500);
            }
            break;
            
        case 'message':
            if (notification.data.senderId) {
                showModularPage('chat');
                // Abrir chat com o usuário
                setTimeout(() => {
                    if (typeof loadChatWithUser === 'function') {
                        loadChatWithUser(notification.data.senderId);
                    }
                }, 500);
            }
            break;
            
        case 'reminder':
            if (notification.data.eventId) {
                showModularPage('events');
            }
            break;
    }
}

// Pedir permissão para notificações do navegador
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                showNotification('Notificações ativadas!', 'success');
            }
        });
    }
}

// Verificar eventos próximos e criar lembretes
function checkUpcomingEvents() {
    const now = Date.now();
    const oneDayFromNow = now + (24 * 60 * 60 * 1000);
    const oneHourFromNow = now + (60 * 60 * 1000);
    
    events.forEach(event => {
        const eventTime = new Date(event.date).getTime();
        
        // Lembrete 1 dia antes (apenas uma vez)
        if (eventTime > now && eventTime <= oneDayFromNow) {
            const alreadyNotified = notifications.some(n => 
                n.type === 'reminder' && 
                n.data.eventId === event.id &&
                n.data.reminderType === '1day'
            );
            
            if (!alreadyNotified) {
                createNotification(
                    'reminder',
                    '📅 Evento amanhã!',
                    `"${event.title}" acontece amanhã às ${new Date(event.date).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}`,
                    { eventId: event.id, reminderType: '1day' }
                );
            }
        }
        
        // Lembrete 1 hora antes
        if (eventTime > now && eventTime <= oneHourFromNow) {
            const alreadyNotified = notifications.some(n => 
                n.type === 'reminder' && 
                n.data.eventId === event.id &&
                n.data.reminderType === '1hour'
            );
            
            if (!alreadyNotified) {
                createNotification(
                    'reminder',
                    '⏰ Evento em 1 hora!',
                    `"${event.title}" começa em 1 hora!`,
                    { eventId: event.id, reminderType: '1hour' }
                );
            }
        }
    });
}

// Monitorar novos eventos
function monitorNewEvents() {
    const lastCheck = parseInt(localStorage.getItem('lastEventCheck') || '0');
    
    events.forEach(event => {
        const eventCreated = new Date(event.createdAt || event.date).getTime();
        
        if (eventCreated > lastCheck && currentUser && event.createdBy !== currentUser.id) {
            createNotification(
                'event',
                '🎉 Novo Evento!',
                `"${event.title}" foi criado. Confira!`,
                { eventId: event.id }
            );
        }
    });
    
    localStorage.setItem('lastEventCheck', Date.now().toString());
}

// Monitorar novas mensagens
function monitorNewMessages() {
    if (!currentUser) return;
    
    const lastCheck = parseInt(localStorage.getItem('lastMessageCheck') || '0');
    
    messages.forEach(msg => {
        const msgTime = new Date(msg.timestamp).getTime();
        
        // Notificar apenas mensagens recebidas
        if (msgTime > lastCheck && 
            msg.to === currentUser.id && 
            msg.from !== currentUser.id) {
            
            const sender = users.find(u => u.id === msg.from);
            const messageText = msg.text || '';
            const preview = messageText.length > 50 ? messageText.substring(0, 50) + '...' : messageText;
            
            createNotification(
                'message',
                '💬 Nova Mensagem',
                `${sender ? sender.name : 'Alguém'}: ${preview}`,
                { senderId: msg.from, messageId: msg.id }
            );
        }
    });
    
    localStorage.setItem('lastMessageCheck', Date.now().toString());
}

// Inicializar sistema de notificações
function initNotificationSystem() {
    loadNotifications();
    updateNotificationBadge();
    
    // Pedir permissão na primeira vez
    if (currentUser && !localStorage.getItem('notificationPermissionAsked')) {
        setTimeout(() => {
            requestNotificationPermission();
            localStorage.setItem('notificationPermissionAsked', 'true');
        }, 3000);
    }
    
    // Verificar eventos e mensagens periodicamente
    setInterval(() => {
        checkUpcomingEvents();
        monitorNewEvents();
        monitorNewMessages();
    }, 60000); // A cada 1 minuto
    
    // Limpar notificações antigas diariamente
    setInterval(() => {
        clearOldNotifications(7);
    }, 24 * 60 * 60 * 1000);
    
    // Primeira verificação imediata
    setTimeout(() => {
        checkUpcomingEvents();
        monitorNewEvents();
        monitorNewMessages();
    }, 2000);
}

// Renderizar lista de notificações
function renderNotificationsList() {
    const container = document.getElementById('notificationsList');
    if (!container) return;
    
    if (notifications.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-bell-slash fa-3x"></i>
                <p>Nenhuma notificação</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = notifications.map(notif => `
        <div class="notification-item ${notif.read ? 'read' : 'unread'}" 
             onclick="handleNotificationClick(${JSON.stringify(notif).replace(/"/g, '&quot;')})">
            <div class="notification-icon notification-icon-${notif.type}">
                <i class="fas ${getNotificationIcon(notif.type)}"></i>
            </div>
            <div class="notification-content">
                <div class="notification-title">${notif.title}</div>
                <div class="notification-message">${notif.message}</div>
                <div class="notification-time">${formatNotificationTime(notif.timestamp)}</div>
            </div>
            ${!notif.read ? '<div class="notification-unread-dot"></div>' : ''}
        </div>
    `).join('');
}

// Formatar tempo da notificação
function formatNotificationTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes} min atrás`;
    if (hours < 24) return `${hours}h atrás`;
    if (days < 7) return `${days}d atrás`;
    
    return new Date(timestamp).toLocaleDateString('pt-BR');
}

// Inicializar quando DOM carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNotificationSystem);
} else {
    initNotificationSystem();
}
