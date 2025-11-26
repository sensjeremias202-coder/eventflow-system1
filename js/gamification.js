/**
 * ============================================
 * SISTEMA DE GAMIFICAÇÃO
 * ============================================
 */

const badges = {
    first_event: { name: 'Primeiro Evento', icon: '🎉', description: 'Participou do primeiro evento' },
    active_5: { name: 'Participante Ativo', icon: '⭐', description: 'Participou de 5 eventos' },
    active_10: { name: 'Veterano', icon: '🏆', description: 'Participou de 10 eventos' },
    reviewer: { name: 'Avaliador', icon: '📝', description: 'Fez 10 avaliações' },
    social: { name: 'Social', icon: '💬', description: 'Enviou 50 mensagens' },
    top_rated: { name: 'Bem Avaliado', icon: '⭐⭐⭐', description: 'Evento com média 4.5+' }
};

// Inicializar gamificação para usuário
function initUserGamification(user) {
    if (!user.gamification) {
        user.gamification = {
            points: 0,
            level: 1,
            badges: [],
            eventsAttended: 0,
            eventsCreated: 0,
            reviewsGiven: 0,
            messagesSent: 0
        };
    }
    return user;
}

// Adicionar pontos
function addPoints(userId, points, reason) {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    initUserGamification(user);
    user.gamification.points += points;
    
    // Calcular nível (100 pontos por nível)
    user.gamification.level = Math.floor(user.gamification.points / 100) + 1;
    
    saveDataWithSync();
    
    // Verificar badges
    checkAndAwardBadges(user);
    
    if (typeof createNotification === 'function') {
        createNotification('system', '🎮 +' + points + ' pontos!', reason, { points });
    }
}

// Verificar e conceder badges
function checkAndAwardBadges(user) {
    initUserGamification(user);
    
    const newBadges = [];
    
    // Badge primeiro evento
    if (user.gamification.eventsAttended >= 1 && !user.gamification.badges.includes('first_event')) {
        user.gamification.badges.push('first_event');
        newBadges.push(badges.first_event);
    }
    
    // Badge 5 eventos
    if (user.gamification.eventsAttended >= 5 && !user.gamification.badges.includes('active_5')) {
        user.gamification.badges.push('active_5');
        newBadges.push(badges.active_5);
    }
    
    // Badge 10 eventos
    if (user.gamification.eventsAttended >= 10 && !user.gamification.badges.includes('active_10')) {
        user.gamification.badges.push('active_10');
        newBadges.push(badges.active_10);
    }
    
    // Badge avaliador
    if (user.gamification.reviewsGiven >= 10 && !user.gamification.badges.includes('reviewer')) {
        user.gamification.badges.push('reviewer');
        newBadges.push(badges.reviewer);
    }
    
    // Badge social
    if (user.gamification.messagesSent >= 50 && !user.gamification.badges.includes('social')) {
        user.gamification.badges.push('social');
        newBadges.push(badges.social);
    }
    
    // Notificar novos badges
    newBadges.forEach(badge => {
        if (typeof createNotification === 'function') {
            createNotification('system', `🏅 Novo Badge: ${badge.name}`, badge.description);
        }
    });
    
    if (newBadges.length > 0) {
        saveDataWithSync();
    }
}

// Ranking de usuários
function getUserRanking() {
    return users
        .filter(u => u.gamification)
        .sort((a, b) => b.gamification.points - a.gamification.points)
        .slice(0, 10);
}

// Ações que concedem pontos
window.addEventListener('eventEnrolled', (e) => {
    addPoints(e.detail.userId, 10, 'Inscrição em evento');
    const user = users.find(u => u.id === e.detail.userId);
    if (user) {
        initUserGamification(user);
        user.gamification.eventsAttended++;
        checkAndAwardBadges(user);
    }
});

window.addEventListener('reviewSubmitted', (e) => {
    addPoints(e.detail.userId, 5, 'Avaliação de evento');
    const user = users.find(u => u.id === e.detail.userId);
    if (user) {
        initUserGamification(user);
        user.gamification.reviewsGiven++;
        checkAndAwardBadges(user);
    }
});

window.addEventListener('messageSent', (e) => {
    addPoints(e.detail.userId, 1, 'Mensagem enviada');
    const user = users.find(u => u.id === e.detail.userId);
    if (user) {
        initUserGamification(user);
        user.gamification.messagesSent++;
        checkAndAwardBadges(user);
    }
});
