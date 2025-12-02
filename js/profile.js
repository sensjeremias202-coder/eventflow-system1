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
    // Usar window.currentUser para compatibilidade com file://
    let user = (typeof window !== 'undefined' ? window.currentUser : (typeof currentUser !== 'undefined' ? currentUser : null));
    if (!user) {
        // Fallback: tentar carregar do localStorage
        try {
            const storedUser = localStorage.getItem('currentUser');
            if (storedUser) {
                user = JSON.parse(storedUser);
            } else {
                const storedUsers = localStorage.getItem('users');
                if (storedUsers) {
                    const arr = JSON.parse(storedUsers);
                    if (Array.isArray(arr) && arr.length > 0) {
                        user = arr[0];
                    }
                }
            }
            if (user && typeof window !== 'undefined') {
                window.currentUser = user;
            }
        } catch (e) {
            console.error('[profile] ⚠️ Erro ao carregar fallback de usuário:', e);
        }
    }
    if (!user) {
        console.error('[profile] ❌ Usuário não logado');
        showNotification('Nenhum usuário ativo. Faça login.', 'error');
        return;
    }
    
    // Atualizar campos do formulário
    // Preencher campos conforme o HTML atual da página de perfil
    const fields = {
        'profileName': user.name,
        'profileEmail': user.email,
        'profileId': user.identificationNumber || '',
        'profileRole': (user.role === 'admin' ? 'Administrador' : (user.role === 'treasurer' ? 'Tesoureiro' : 'Jovens')),
        'profileRegistered': user.registered || ''
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
        avatarElement.textContent = user.name.charAt(0).toUpperCase();
    }
    
    // Carregar eventos do usuário
    // Compat: páginas atuais usam "Meus Eventos" via pages/profile/profile.js
    const myEventsContainer = document.getElementById('myEventsProfile');
    if (myEventsContainer && typeof window.loadMyEventsProfile === 'function') {
        window.loadMyEventsProfile();
    } else {
        // Fallback antigo
        if (typeof loadUserEvents === 'function') loadUserEvents();
    }
    
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
    const user = typeof window !== 'undefined' ? window.currentUser : (typeof currentUser !== 'undefined' ? currentUser : null);
    if (!user) {
        showNotification('Você precisa estar logado.', 'error');
        return;
    }
    
    // Obter valores dos campos
    const name = document.getElementById('profileName')?.value;
    const email = document.getElementById('profileEmail')?.value;
    
    // Validar campos obrigatórios
    if (!name || !email) {
        showNotification('Nome e email são obrigatórios', 'error');
        return;
    }
    
    // Atualizar usuário
    user.name = name;
    user.email = email;
    
    // Atualizar no array de usuários
    const usersArr = typeof window !== 'undefined' && window.users ? window.users : (typeof users !== 'undefined' ? users : []);
    const userIndex = usersArr.findIndex(u => u.id === user.id);
    if (userIndex > -1) {
        usersArr[userIndex] = user;
        if (typeof window !== 'undefined') window.users = usersArr;
        localStorage.setItem('users', JSON.stringify(usersArr));
    }
    
    // Atualizar sessão
    if (typeof window !== 'undefined') window.currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    showNotification('Perfil atualizado com sucesso!', 'success');
    
    // Atualizar nome no header
    const userNameElement = document.getElementById('currentUserName') || document.getElementById('userName');
    if (userNameElement) {
        userNameElement.textContent = user.name;
    }
}

// Alterar senha
function changePassword() {
    const currentPassword = document.getElementById('currentPassword')?.value;
    const newPassword = document.getElementById('newPassword')?.value;
    const confirmPassword = document.getElementById('confirmPassword')?.value;
    const user = typeof window !== 'undefined' ? window.currentUser : (typeof currentUser !== 'undefined' ? currentUser : null);
    const usersArr = typeof window !== 'undefined' && window.users ? window.users : (typeof users !== 'undefined' ? users : []);
    
    // Validações
    if (!user) {
        showNotification('Você precisa estar logado para alterar a senha.', 'error');
        return;
    }
    if (!currentPassword || !newPassword || !confirmPassword) {
        showNotification('Preencha todos os campos de senha', 'error');
        return;
    }
    
    const idx = usersArr.findIndex(u => u.id === user.id);
    const stored = idx > -1 ? (usersArr[idx].password || '') : '';
    if (stored && currentPassword !== stored) {
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
    user.password = newPassword;
    
    // Atualizar no array de usuários
    if (idx > -1) {
        usersArr[idx] = user;
        if (typeof window !== 'undefined') window.users = usersArr;
        localStorage.setItem('users', JSON.stringify(usersArr));
    }
    
    // Atualizar sessão
    if (typeof window !== 'undefined') window.currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    showNotification('Senha alterada com sucesso!', 'success');
    
    // Limpar campos
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
}

// Configurar event handlers
function setupProfileHandlers() {
    // Suporta fluxo antigo com saveProfileBtn
    const saveBtn = document.getElementById('saveProfileBtn');
    if (saveBtn && !saveBtn.dataset.profileListenerAdded) {
        saveBtn.dataset.profileListenerAdded = 'true';
        saveBtn.addEventListener('click', saveProfile);
    }
    
    // Suporta fluxo atual com editProfileBtn (toggle editar/salvar)
    const editBtn = document.getElementById('editProfileBtn');
    if (editBtn && !editBtn.dataset.profileListenerAdded) {
        editBtn.dataset.profileListenerAdded = 'true';
        editBtn.addEventListener('click', () => {
            const nameEl = document.getElementById('profileName');
            const emailEl = document.getElementById('profileEmail');
            if (!nameEl || !emailEl) return;
            const isReadOnly = nameEl.hasAttribute('readonly');
            if (isReadOnly) {
                nameEl.removeAttribute('readonly');
                emailEl.removeAttribute('readonly');
                nameEl.focus();
                editBtn.innerHTML = '<i class="fas fa-save"></i> Salvar';
                editBtn.classList.add('btn-success');
                editBtn.classList.remove('btn-primary');
            } else {
                // Salvar
                const name = nameEl.value.trim();
                const email = emailEl.value.trim();
                if (!name || !email) {
                    showNotification('Preencha todos os campos!', 'error');
                    return;
                }
                if (!email.includes('@')) {
                    showNotification('E-mail inválido!', 'error');
                    return;
                }
                // Atualizar
                currentUser.name = name;
                currentUser.email = email;
                const userIndex = users.findIndex(u => u.id === currentUser.id);
                if (userIndex > -1) {
                    users[userIndex] = currentUser;
                    localStorage.setItem('users', JSON.stringify(users));
                }
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                const headerName = document.getElementById('userName') || document.getElementById('currentUserName');
                if (headerName) headerName.textContent = currentUser.name;
                showNotification('Perfil atualizado com sucesso!', 'success');
                if (window.logAnalyticsEvent) window.logAnalyticsEvent('update_profile', {});
                // Voltar para readonly
                nameEl.setAttribute('readonly', true);
                emailEl.setAttribute('readonly', true);
                editBtn.innerHTML = '<i class="fas fa-edit"></i> Editar Perfil';
                editBtn.classList.remove('btn-success');
                editBtn.classList.add('btn-primary');
            }
        });
    }
    
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    if (changePasswordBtn && !changePasswordBtn.dataset.profileListenerAdded) {
        changePasswordBtn.dataset.profileListenerAdded = 'true';
        changePasswordBtn.addEventListener('click', changePassword);
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
