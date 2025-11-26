// ============================================
// SISTEMA DE PERFIL DO USUÁRIO
// ============================================

// Inicializar página de perfil
function initProfilePage() {
    console.log('[profile] 👤 Inicializando página de perfil...');
    loadProfile();
    setupProfileHandlers();
    console.log('[profile] ✅ Página de perfil inicializada');
}

// Carregar perfil
function loadProfile() {
    console.log('[profile] 📝 Carregando perfil do usuário...');
    
    if (!currentUser) {
        console.error('[profile] ❌ Usuário não logado');
        return;
    }
    
    // Atualizar campos do formulário
    const fields = {
        'profileName': currentUser.name,
        'profileEmail': currentUser.email,
        'profilePhone': currentUser.phone || '',
        'profileBio': currentUser.bio || ''
    };
    
    Object.keys(fields).forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
            element.value = fields[fieldId];
        }
    });
    
    // Atualizar avatar
    const avatarElement = document.querySelector('.profile-avatar');
    if (avatarElement) {
        avatarElement.textContent = currentUser.name.charAt(0).toUpperCase();
    }
    
    // Carregar eventos do usuário
    loadUserEvents();
    
    console.log('[profile] ✅ Perfil carregado');
}

// Carregar eventos do usuário
function loadUserEvents() {
    const container = document.getElementById('userEventsContainer');
    if (!container || !events) return;
    
    const userEvents = events.filter(e => 
        e.enrolled && e.enrolled.includes(currentUser.id)
    );
    
    if (userEvents.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--gray); padding: 20px;">Você ainda não está inscrito em nenhum evento</p>';
        return;
    }
    
    container.innerHTML = userEvents.map(event => `
        <div class="event-card-mini">
            <h4>${event.name}</h4>
            <p><i class="fas fa-calendar"></i> ${formatDate(event.date)}</p>
            <p><i class="fas fa-clock"></i> ${event.time}</p>
            <button class="btn btn-sm btn-outline" onclick="viewEventDetails('${event.id}')">
                <i class="fas fa-eye"></i> Ver Detalhes
            </button>
        </div>
    `).join('');
}

// Salvar perfil
function saveProfile() {
    if (!currentUser) return;
    
    // Obter valores dos campos
    const name = document.getElementById('profileName')?.value;
    const email = document.getElementById('profileEmail')?.value;
    const phone = document.getElementById('profilePhone')?.value;
    const bio = document.getElementById('profileBio')?.value;
    
    // Validar campos obrigatórios
    if (!name || !email) {
        showNotification('Nome e email são obrigatórios', 'error');
        return;
    }
    
    // Atualizar usuário
    currentUser.name = name;
    currentUser.email = email;
    currentUser.phone = phone;
    currentUser.bio = bio;
    
    // Atualizar no array de usuários
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex > -1) {
        users[userIndex] = currentUser;
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    // Atualizar sessão
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    showNotification('Perfil atualizado com sucesso!', 'success');
    
    // Atualizar nome no header
    const userNameElement = document.getElementById('currentUserName');
    if (userNameElement) {
        userNameElement.textContent = currentUser.name;
    }
}

// Alterar senha
function changePassword() {
    const currentPassword = document.getElementById('currentPassword')?.value;
    const newPassword = document.getElementById('newPassword')?.value;
    const confirmPassword = document.getElementById('confirmPassword')?.value;
    
    // Validações
    if (!currentPassword || !newPassword || !confirmPassword) {
        showNotification('Preencha todos os campos de senha', 'error');
        return;
    }
    
    if (currentPassword !== currentUser.password) {
        showNotification('Senha atual incorreta', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showNotification('As senhas não coincidem', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showNotification('A nova senha deve ter pelo menos 6 caracteres', 'error');
        return;
    }
    
    // Atualizar senha
    currentUser.password = newPassword;
    
    // Atualizar no array de usuários
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex > -1) {
        users[userIndex] = currentUser;
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    // Atualizar sessão
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    showNotification('Senha alterada com sucesso!', 'success');
    
    // Limpar campos
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
}

// Configurar event handlers
function setupProfileHandlers() {
    const saveBtn = document.getElementById('saveProfileBtn');
    if (saveBtn) {
        saveBtn.onclick = saveProfile;
    }
    
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    if (changePasswordBtn) {
        changePasswordBtn.onclick = changePassword;
    }
}

// Formatar data (helper)
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric' 
    });
}

// Exportar funções globalmente
window.initProfilePage = initProfilePage;
window.loadProfile = loadProfile;
window.saveProfile = saveProfile;
window.changePassword = changePassword;

console.log('[profile] ✅ Módulo de perfil carregado');
