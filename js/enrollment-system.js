/**
 * ============================================
 * SISTEMA DE INSCRIÇÕES COM VALIDAÇÃO
 * ============================================
 * Limite de vagas, lista de espera, QR Code
 */

// Adicionar propriedades de vagas aos eventos
function initEventCapacity(event) {
    if (!event.capacity) {
        event.capacity = {
            maxAttendees: null, // null = ilimitado
            currentAttendees: event.attendees ? event.attendees.length : 0,
            waitingList: [],
            requireConfirmation: false,
            confirmedAttendees: []
        };
    }
    return event;
}

// Inscrever em evento com validação
function enrollInEventWithValidation(eventId, userId) {
    const event = events.find(e => e.id === eventId);
    if (!event) {
        showNotification('Evento não encontrado', 'error');
        return false;
    }
    
    initEventCapacity(event);
    
    // Verificar se já está inscrito
    if (event.attendees && event.attendees.includes(userId)) {
        showNotification('Você já está inscrito neste evento', 'warning');
        return false;
    }
    
    // Verificar se está na lista de espera
    if (event.capacity.waitingList && event.capacity.waitingList.includes(userId)) {
        showNotification('Você já está na lista de espera', 'warning');
        return false;
    }
    
    // Verificar limite de vagas
    if (event.capacity.maxAttendees !== null) {
        const currentCount = event.attendees ? event.attendees.length : 0;
        
        if (currentCount >= event.capacity.maxAttendees) {
            // Adicionar à lista de espera
            if (!event.capacity.waitingList) event.capacity.waitingList = [];
            event.capacity.waitingList.push(userId);
            
            saveDataWithSync();
            
            showNotification('Evento lotado! Você foi adicionado à lista de espera', 'info');
            
            if (typeof createNotification === 'function') {
                createNotification(
                    'event',
                    '📋 Lista de Espera',
                    `Você foi adicionado à lista de espera de "${event.title}"`,
                    { eventId: event.id }
                );
            }
            
            return 'waitlist';
        }
    }
    
    // Inscrever normalmente
    if (!event.attendees) event.attendees = [];
    event.attendees.push(userId);
    event.capacity.currentAttendees = event.attendees.length;
    
    saveDataWithSync();
    
    // Gerar QR Code
    const qrCode = generateQRCode(eventId, userId);
    
    showNotification('Inscrição realizada com sucesso!', 'success');
    
    if (typeof createNotification === 'function') {
        createNotification(
            'event',
            '✅ Inscrição Confirmada',
            `Você se inscreveu em "${event.title}". QR Code: ${qrCode}`,
            { eventId: event.id, qrCode: qrCode }
        );
    }
    
    return qrCode;
}

// Cancelar inscrição
function cancelEnrollment(eventId, userId) {
    // Permitir remoção apenas por administradores
    try {
        const actor = typeof window !== 'undefined' ? window.currentUser : (typeof currentUser !== 'undefined' ? currentUser : null);
        if (!actor || actor.role !== 'admin') {
            showNotification && showNotification('Apenas administradores podem remover inscrições.', 'error');
            return false;
        }
    } catch {}

    const event = events.find(e => e.id === eventId);
    if (!event) return false;
    
    initEventCapacity(event);
    
    // Remover da lista principal
    if (event.attendees && event.attendees.includes(userId)) {
        event.attendees = event.attendees.filter(id => id !== userId);
        event.capacity.currentAttendees = event.attendees.length;
        
        // Promover alguém da lista de espera
        if (event.capacity.waitingList && event.capacity.waitingList.length > 0) {
            const nextUserId = event.capacity.waitingList.shift();
            event.attendees.push(nextUserId);
            event.capacity.currentAttendees = event.attendees.length;
            
            // Notificar usuário promovido
            if (typeof createNotification === 'function') {
                createNotification(
                    'event',
                    '🎉 Vaga Disponível!',
                    `Uma vaga abriu em "${event.title}"! Você saiu da lista de espera.`,
                    { eventId: event.id }
                );
            }
        }
    }
    
    // Remover da lista de espera
    if (event.capacity.waitingList) {
        event.capacity.waitingList = event.capacity.waitingList.filter(id => id !== userId);
    }
    
    // Remover da lista de confirmados
    if (event.capacity.confirmedAttendees) {
        event.capacity.confirmedAttendees = event.capacity.confirmedAttendees.filter(id => id !== userId);
    }
    
    saveDataWithSync();
    showNotification('Inscrição cancelada', 'info');
    // Auditoria simples
    try {
        const logsRaw = localStorage.getItem('auditLogs');
        const logs = logsRaw ? JSON.parse(logsRaw) : [];
        logs.push({
            type: 'cancel_enrollment',
            by: (typeof window !== 'undefined' && window.currentUser) ? window.currentUser.id : null,
            userId,
            eventId,
            at: new Date().toISOString()
        });
        localStorage.setItem('auditLogs', JSON.stringify(logs));
    } catch {}
    
    return true;
}

// Confirmar presença
function confirmAttendance(eventId, userId) {
    const event = events.find(e => e.id === eventId);
    if (!event) return false;
    
    initEventCapacity(event);
    
    if (!event.attendees || !event.attendees.includes(userId)) {
        showNotification('Você não está inscrito neste evento', 'error');
        return false;
    }
    
    if (!event.capacity.confirmedAttendees) {
        event.capacity.confirmedAttendees = [];
    }
    
    if (!event.capacity.confirmedAttendees.includes(userId)) {
        event.capacity.confirmedAttendees.push(userId);
        saveDataWithSync();
        
        showNotification('Presença confirmada!', 'success');
        
        if (typeof createNotification === 'function') {
            createNotification(
                'event',
                '✅ Presença Confirmada',
                `Sua presença em "${event.title}" foi confirmada!`,
                { eventId: event.id }
            );
        }
    }
    
    return true;
}

// Gerar QR Code simples (base64)
function generateQRCode(eventId, userId) {
    const data = `${eventId}|${userId}|${Date.now()}`;
    return btoa(data); // Base64 encode
}

// Validar QR Code
function validateQRCode(qrCode) {
    try {
        const decoded = atob(qrCode);
        const [eventId, userId, timestamp] = decoded.split('|');
        
        const event = events.find(e => e.id === eventId);
        const user = users.find(u => u.id === userId);
        
        if (!event || !user) {
            return { valid: false, message: 'QR Code inválido' };
        }
        
        if (!event.attendees || !event.attendees.includes(userId)) {
            return { valid: false, message: 'Usuário não está inscrito neste evento' };
        }
        
        return {
            valid: true,
            event: event,
            user: user,
            timestamp: parseInt(timestamp)
        };
    } catch (error) {
        return { valid: false, message: 'QR Code mal formatado' };
    }
}

// Check-in com QR Code
function checkInWithQRCode(qrCode) {
    const validation = validateQRCode(qrCode);
    
    if (!validation.valid) {
        showNotification(validation.message, 'error');
        return false;
    }
    
    confirmAttendance(validation.event.id, validation.user.id);
    
    return {
        success: true,
        event: validation.event,
        user: validation.user
    };
}

// Renderizar informações de vagas
function renderEventCapacityInfo(event) {
    initEventCapacity(event);
    
    const capacity = event.capacity;
    const currentCount = event.attendees ? event.attendees.length : 0;
    const waitingCount = capacity.waitingList ? capacity.waitingList.length : 0;
    const confirmedCount = capacity.confirmedAttendees ? capacity.confirmedAttendees.length : 0;
    
    let html = '<div class="capacity-info">';
    
    if (capacity.maxAttendees !== null) {
        const percentage = (currentCount / capacity.maxAttendees) * 100;
        const spotsLeft = capacity.maxAttendees - currentCount;
        
        html += `
            <div class="capacity-bar">
                <div class="capacity-bar-fill" style="width: ${percentage}%"></div>
            </div>
            <div class="capacity-text">
                <span>${currentCount} / ${capacity.maxAttendees} inscritos</span>
                ${spotsLeft > 0 ? `<span class="spots-left">${spotsLeft} vagas restantes</span>` : '<span class="spots-full">LOTADO</span>'}
            </div>
        `;
        
        if (waitingCount > 0) {
            html += `<div class="waiting-list-info">📋 ${waitingCount} na lista de espera</div>`;
        }
    } else {
        html += `<div class="capacity-text"><span>${currentCount} inscritos</span> <span class="unlimited">Vagas ilimitadas</span></div>`;
    }
    
    if (capacity.requireConfirmation && confirmedCount > 0) {
        html += `<div class="confirmed-info">✅ ${confirmedCount} confirmados</div>`;
    }
    
    html += '</div>';
    
    return html;
}

// Modal de QR Code
function showQRCodeModal(eventId, userId) {
    const qrCode = generateQRCode(eventId, userId);
    const event = events.find(e => e.id === eventId);
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content qr-modal">
            <div class="modal-header">
                <h2>🎫 Seu Ingresso</h2>
                <button class="modal-close" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="qr-code-container">
                    <div class="qr-code-display">${qrCode}</div>
                    <canvas id="qrCanvas"></canvas>
                </div>
                <div class="ticket-info">
                    <h3>${event.title}</h3>
                    <p><i class="fas fa-calendar"></i> ${new Date(event.date).toLocaleString('pt-BR')}</p>
                    <p><i class="fas fa-map-marker-alt"></i> ${event.location || 'A definir'}</p>
                </div>
                <div class="qr-actions">
                    <button class="btn btn-primary" onclick="copyQRCode('${qrCode}')">
                        <i class="fas fa-copy"></i> Copiar Código
                    </button>
                    <button class="btn btn-secondary" onclick="downloadQRCode('${qrCode}', '${event.title}')">
                        <i class="fas fa-download"></i> Baixar QR Code
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Gerar QR Code visual usando Canvas (opcional)
    // Aqui você pode usar uma biblioteca como QRCode.js
}

// Copiar QR Code
function copyQRCode(qrCode) {
    navigator.clipboard.writeText(qrCode).then(() => {
        showNotification('Código copiado!', 'success');
    });
}

// Download QR Code
function downloadQRCode(qrCode, eventTitle) {
    const content = `
EventFlow - Ingresso Digital
============================
Evento: ${eventTitle}
Código: ${qrCode}
Data: ${new Date().toLocaleString('pt-BR')}

Apresente este código no dia do evento.
    `.trim();
    
    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ingresso_${eventTitle.replace(/[^a-z0-9]/gi, '_')}.txt`;
    link.click();
}
