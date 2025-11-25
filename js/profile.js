// Gerenciamento de perfil do usuário

function loadProfile() {
    if (!currentUser) return;
    
    // Preencher dados do perfil
    document.getElementById('profileName').value = currentUser.name || '';
    document.getElementById('profileEmail').value = currentUser.email || '';
    document.getElementById('profileRole').value = currentUser.role === 'admin' ? 'Administrador' : 'Usuário';
    document.getElementById('profileRegistered').value = currentUser.registered || 'Não disponível';
    
    // Carregar eventos do usuário
    loadMyEventsProfile();
    
    // Carregar avaliações do usuário
    loadMyRatingsProfile();
}

function loadMyEventsProfile() {
    const container = document.getElementById('myEventsProfile');
    if (!container) return;
    
    // Filtrar eventos criados pelo usuário
    const myEvents = events.filter(e => e.organizerId === currentUser.id);
    
    if (myEvents.length === 0) {
        container.innerHTML = '<p style="text-align:center; color: #666;">Você ainda não criou nenhum evento.</p>';
        return;
    }
    
    let html = '<div class="events-list">';
    myEvents.forEach(event => {
        const category = categories.find(c => c.id === event.categoryId);
        const avgRating = calculateAverageRating(event);
        
        html += `
            <div class="event-card" style="margin-bottom: 15px; padding: 15px; border: 1px solid #ddd; border-radius: 8px;">
                <h3 style="margin: 0 0 10px 0;">${event.title}</h3>
                <p style="color: #666; margin: 5px 0;">
                    <i class="fas fa-calendar"></i> ${event.date} 
                    <span style="margin-left: 15px;"><i class="fas fa-clock"></i> ${event.time}</span>
                </p>
                <p style="color: #666; margin: 5px 0;">
                    <i class="fas fa-map-marker-alt"></i> ${event.location}
                </p>
                <p style="margin: 5px 0;">
                    <span class="badge" style="background: ${category ? category.color : '#999'};">
                        ${category ? category.name : 'Sem categoria'}
                    </span>
                    ${avgRating > 0 ? `
                        <span style="margin-left: 10px; color: #f39c12;">
                            <i class="fas fa-star"></i> ${avgRating.toFixed(1)} 
                            (${event.ratings ? event.ratings.length : 0} avaliações)
                        </span>
                    ` : ''}
                </p>
                <div style="margin-top: 10px;">
                    <button class="btn btn-sm btn-outline" onclick="editEvent(${event.id})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteEventConfirm(${event.id})" style="margin-left: 5px;">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                </div>
            </div>
        `;
    });
    html += '</div>';
    
    container.innerHTML = html;
}

function loadMyRatingsProfile() {
    const container = document.getElementById('myRatingsProfile');
    if (!container) return;
    
    // Encontrar todas as avaliações do usuário
    const myRatings = [];
    events.forEach(event => {
        if (event.ratings) {
            event.ratings.forEach(rating => {
                if (rating.userId === currentUser.id) {
                    myRatings.push({
                        event: event,
                        rating: rating
                    });
                }
            });
        }
    });
    
    if (myRatings.length === 0) {
        container.innerHTML = '<p style="text-align:center; color: #666;">Você ainda não avaliou nenhum evento.</p>';
        return;
    }
    
    let html = '<div class="ratings-list">';
    myRatings.forEach(item => {
        const stars = '⭐'.repeat(item.rating.rating);
        const date = new Date(item.rating.date).toLocaleDateString('pt-BR');
        
        html += `
            <div class="rating-card" style="margin-bottom: 15px; padding: 15px; border: 1px solid #ddd; border-radius: 8px;">
                <h4 style="margin: 0 0 10px 0;">${item.event.title}</h4>
                <p style="margin: 5px 0;">
                    <span style="font-size: 1.2em;">${stars}</span>
                    <span style="color: #666; margin-left: 10px;">${date}</span>
                </p>
                ${item.rating.comment ? `
                    <p style="margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 4px;">
                        "${item.rating.comment}"
                    </p>
                ` : ''}
                <button class="btn btn-sm btn-danger" onclick="deleteRating(${item.event.id})">
                    <i class="fas fa-trash"></i> Excluir Avaliação
                </button>
            </div>
        `;
    });
    html += '</div>';
    
    container.innerHTML = html;
}

function deleteRating(eventId) {
    if (!confirm('Tem certeza que deseja excluir esta avaliação?')) return;
    
    const eventIdx = events.findIndex(e => e.id === eventId);
    if (eventIdx === -1) return;
    
    if (events[eventIdx].ratings) {
        events[eventIdx].ratings = events[eventIdx].ratings.filter(r => r.userId !== currentUser.id);
        saveData();
        
        showNotification('Avaliação excluída com sucesso!', 'success');
        loadMyRatingsProfile();
        
        // Registrar no Analytics
        if (window.logAnalyticsEvent) {
            logAnalyticsEvent('delete_rating', { event_id: eventId });
        }
    }
}

function editProfile() {
    const name = document.getElementById('profileName');
    const email = document.getElementById('profileEmail');
    const editBtn = document.getElementById('editProfileBtn');
    
    if (name.hasAttribute('readonly')) {
        // Modo edição
        name.removeAttribute('readonly');
        email.removeAttribute('readonly');
        name.focus();
        editBtn.innerHTML = '<i class="fas fa-save"></i> Salvar';
        editBtn.classList.add('btn-success');
        editBtn.classList.remove('btn-primary');
    } else {
        // Salvar alterações
        const newName = name.value.trim();
        const newEmail = email.value.trim();
        
        if (!newName || !newEmail) {
            showNotification('Preencha todos os campos!', 'error');
            return;
        }
        
        if (!newEmail.includes('@')) {
            showNotification('E-mail inválido!', 'error');
            return;
        }
        
        // Verificar se email já existe (exceto o próprio)
        const emailExists = users.find(u => u.email === newEmail && u.id !== currentUser.id);
        if (emailExists) {
            showNotification('Este e-mail já está em uso!', 'error');
            return;
        }
        
        // Atualizar usuário
        const userIdx = users.findIndex(u => u.id === currentUser.id);
        if (userIdx !== -1) {
            users[userIdx].name = newName;
            users[userIdx].email = newEmail;
            currentUser.name = newName;
            currentUser.email = newEmail;
            
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            saveData();
            
            // Atualizar nome no header
            document.getElementById('userName').textContent = newName;
            
            showNotification('Perfil atualizado com sucesso!', 'success');
            
            // Registrar no Analytics
            if (window.logAnalyticsEvent) {
                logAnalyticsEvent('update_profile', {});
            }
        }
        
        // Voltar modo visualização
        name.setAttribute('readonly', true);
        email.setAttribute('readonly', true);
        editBtn.innerHTML = '<i class="fas fa-edit"></i> Editar Perfil';
        editBtn.classList.remove('btn-success');
        editBtn.classList.add('btn-primary');
    }
}

function deleteAccount() {
    if (!confirm('⚠️ ATENÇÃO: Esta ação é irreversível!\n\nTem certeza que deseja excluir sua conta permanentemente?\n\nTodos os seus dados, eventos e avaliações serão apagados.')) {
        return;
    }
    
    if (!confirm('Confirme novamente: deseja realmente excluir sua conta?')) {
        return;
    }
    
    // Não permitir excluir conta admin se for o único
    if (currentUser.role === 'admin') {
        const admins = users.filter(u => u.role === 'admin');
        if (admins.length === 1) {
            showNotification('Não é possível excluir a única conta de administrador!', 'error');
            return;
        }
    }
    
    // Remover eventos do usuário
    events = events.filter(e => e.organizerId !== currentUser.id);
    
    // Remover avaliações do usuário
    events.forEach(event => {
        if (event.ratings) {
            event.ratings = event.ratings.filter(r => r.userId !== currentUser.id);
        }
    });
    
    // Remover mensagens do usuário
    messages = messages.filter(m => m.from !== currentUser.id && m.to !== currentUser.id);
    
    // Remover usuário
    users = users.filter(u => u.id !== currentUser.id);
    
    saveData();
    
    // Registrar no Analytics
    if (window.logAnalyticsEvent) {
        logAnalyticsEvent('delete_account', {
            user_role: currentUser.role
        });
    }
    
    // Fazer logout
    localStorage.removeItem('currentUser');
    currentUser = null;
    
    showNotification('Sua conta foi excluída. Você será redirecionado para o login.', 'success');
    
    setTimeout(() => {
        location.reload();
    }, 2000);
}

// Event listeners
document.getElementById('editProfileBtn')?.addEventListener('click', editProfile);
document.getElementById('deleteAccountBtn')?.addEventListener('click', deleteAccount);
