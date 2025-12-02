// Gerenciamento de perfil do usuário

function loadProfile() {
    let user = typeof window !== 'undefined' ? window.currentUser : (typeof currentUser !== 'undefined' ? currentUser : null);
    if (!user) {
        // Fallback: tentar recuperar do localStorage
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
            console.error('[profile] Erro ao recuperar usuário do localStorage:', e);
        }
    }
    if (!user) {
        console.error('[profile] Usuário não está logado');
        if (typeof showNotification === 'function') {
            showNotification('Nenhum usuário ativo. Faça login.', 'error');
        }
        return;
    }
    
    console.log('[profile] Carregando perfil do usuário:', user.name);
    
    // Preencher dados do perfil com verificação de elementos
    const profileName = document.getElementById('profileName');
    const profileId = document.getElementById('profileId');
    const profileEmail = document.getElementById('profileEmail');
    const profileRole = document.getElementById('profileRole');
    const profileRegistered = document.getElementById('profileRegistered');
    
    if (profileName) profileName.value = user.name || '';
    if (profileId) profileId.value = user.identificationNumber || 'Não disponível';
    if (profileEmail) profileEmail.value = user.email || '';
    if (profileRole) {
        const roleText = user.role === 'admin' ? 'Administrador' : 
                        (user.role === 'treasurer' ? 'Tesoureiro' : 'Jovens');
        profileRole.value = roleText;
    }
    if (profileRegistered) profileRegistered.value = user.registered || 'Não disponível';
    
    // Adicionar funcionalidade ao botão de copiar ID
    const copyBtn = document.getElementById('copyIdBtn');
    if (copyBtn) {
        // Remover listener anterior para evitar duplicação
        const newCopyBtn = copyBtn.cloneNode(true);
        copyBtn.parentNode.replaceChild(newCopyBtn, copyBtn);
        
        document.getElementById('copyIdBtn').addEventListener('click', function() {
            const idField = document.getElementById('profileId');
            if (idField) {
                idField.select();
                document.execCommand('copy');
                
                // Feedback visual
                this.innerHTML = '<i class="fas fa-check"></i> Copiado!';
                this.style.background = '#10b981';
                
                setTimeout(() => {
                    this.innerHTML = '<i class="fas fa-copy"></i> Copiar';
                    this.style.background = '';
                }, 2000);
            }
        });
    }
    
    // Carregar eventos do usuário
    loadMyEventsProfile();
    
    // Carregar avaliações do usuário
    loadMyRatingsProfile();
}

function loadMyEventsProfile() {
    const container = document.getElementById('myEventsProfile');
    if (!container) return;
    const user = typeof window !== 'undefined' ? window.currentUser : (typeof currentUser !== 'undefined' ? currentUser : null);
    const evts = typeof window !== 'undefined' && window.events ? window.events : (typeof events !== 'undefined' ? events : []);
    const cats = typeof window !== 'undefined' && window.categories ? window.categories : (typeof categories !== 'undefined' ? categories : []);
    
    // Filtrar eventos criados pelo usuário
    const myEvents = evts.filter(e => user && e.organizerId === user.id);
    
    if (myEvents.length === 0) {
        container.innerHTML = '<p style="text-align:center; color: #666;">Você ainda não criou nenhum evento.</p>';
        return;
    }
    
    let html = '<div class="events-list">';
    myEvents.forEach(event => {
        const category = cats.find(c => c.id === event.categoryId);
        const avgRating = typeof calculateAverageRating !== 'undefined' ? calculateAverageRating(event) : (function(evt){
            if (!evt || !evt.ratings || !evt.ratings.length) return 0;
            const sum = evt.ratings.reduce((acc, r) => acc + (r.rating || 0), 0);
            return sum / evt.ratings.length;
        })(event);
        
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
    const user = typeof window !== 'undefined' ? window.currentUser : (typeof currentUser !== 'undefined' ? currentUser : null);
    const evts = typeof window !== 'undefined' && window.events ? window.events : (typeof events !== 'undefined' ? events : []);
    
    // Encontrar todas as avaliações do usuário
    const myRatings = [];
    evts.forEach(event => {
        if (event.ratings) {
            event.ratings.forEach(rating => {
                if (user && rating.userId === user.id) {
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
    const user = typeof window !== 'undefined' ? window.currentUser : (typeof currentUser !== 'undefined' ? currentUser : null);
    const evts = typeof window !== 'undefined' && window.events ? window.events : (typeof events !== 'undefined' ? events : []);
    if (!confirm('Tem certeza que deseja excluir esta avaliação?')) return;
    
    const eventIdx = evts.findIndex(e => e.id === eventId);
    if (eventIdx === -1) return;
    
    if (evts[eventIdx].ratings) {
        evts[eventIdx].ratings = evts[eventIdx].ratings.filter(r => user && r.userId !== user.id);
        if (typeof saveData === 'function') saveData();
        
        showNotification('Avaliação excluída com sucesso!', 'success');
        loadMyRatingsProfile();
        
        // Registrar no Analytics
        if (window && window.logAnalyticsEvent) {
            window.logAnalyticsEvent('delete_rating', { event_id: eventId });
        }
    }
}

function editProfile() {
    const name = document.getElementById('profileName');
    const email = document.getElementById('profileEmail');
    const editBtn = document.getElementById('editProfileBtn');
    console.log('[profile] editProfile() acionado');
    if (!name || !email || !editBtn) {
        console.warn('[profile] Campos ou botão não encontrados:', { name: !!name, email: !!email, editBtn: !!editBtn });
        if (typeof showNotification === 'function') {
            showNotification('Elementos de perfil não encontrados.', 'error');
        }
        return;
    }
    const user = typeof window !== 'undefined' ? window.currentUser : (typeof currentUser !== 'undefined' ? currentUser : null);
    const userList = typeof window !== 'undefined' && window.users ? window.users : (typeof users !== 'undefined' ? users : []);
    
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
        console.log('[profile] Tentando salvar alterações:', { newName, newEmail });
        
        if (!newName || !newEmail) {
            if (typeof showNotification === 'function') showNotification('Preencha todos os campos!', 'error');
            return;
        }
        
        if (!newEmail.includes('@')) {
            if (typeof showNotification === 'function') showNotification('E-mail inválido!', 'error');
            return;
        }
        
        // Verificar se email já existe (exceto o próprio)
        const emailExists = userList.find(u => u.email === newEmail && u.id !== (user ? user.id : null));
        if (emailExists) {
            if (typeof showNotification === 'function') showNotification('Este e-mail já está em uso!', 'error');
            return;
        }
        
        // Atualizar usuário
        const userIdx = userList.findIndex(u => user && u.id === user.id);
        if (userIdx !== -1) {
            userList[userIdx].name = newName;
            userList[userIdx].email = newEmail;
            if (user) {
                user.name = newName;
                user.email = newEmail;
                window.currentUser = user;
            }
            
            localStorage.setItem('currentUser', JSON.stringify(user));
            if (typeof saveData === 'function') saveData();
            
            // Atualizar nome no header
            const userNameEl = document.getElementById('userName');
            if (userNameEl) userNameEl.textContent = newName;
            
            if (typeof showNotification === 'function') showNotification('Perfil atualizado com sucesso!', 'success');
            
            // Registrar no Analytics
            if (window && window.logAnalyticsEvent) {
                window.logAnalyticsEvent('update_profile', {});
            }
            console.log('[profile] Alterações salvas com sucesso');
        }
        
        // Voltar modo visualização
        name.setAttribute('readonly', true);
        email.setAttribute('readonly', true);
        editBtn.innerHTML = '<i class="fas fa-edit"></i> Editar Perfil';
        editBtn.classList.remove('btn-success');
        editBtn.classList.add('btn-primary');
    }
}

function changePassword() {
    const currentInput = document.getElementById('currentPassword');
    const newInput = document.getElementById('newPassword');
    const confirmInput = document.getElementById('confirmPassword');
    const user = typeof window !== 'undefined' ? window.currentUser : (typeof currentUser !== 'undefined' ? currentUser : null);
    const userList = typeof window !== 'undefined' && window.users ? window.users : (typeof users !== 'undefined' ? users : []);

    if (!user) {
        showNotification('Você precisa estar logado para alterar a senha.', 'error');
        return;
    }

    const currentPwd = (currentInput && currentInput.value) ? currentInput.value : '';
    const newPwd = (newInput && newInput.value) ? newInput.value : '';
    const confirmPwd = (confirmInput && confirmInput.value) ? confirmInput.value : '';

    if (!currentPwd || !newPwd || !confirmPwd) {
        showNotification('Preencha todos os campos de senha.', 'error');
        return;
    }

    // validação simples local
    const userIdx = userList.findIndex(u => u.id === user.id);
    if (userIdx === -1) {
        showNotification('Usuário não encontrado.', 'error');
        return;
    }

    const storedPwd = userList[userIdx].password || '';
    if (storedPwd && currentPwd !== storedPwd) {
        showNotification('Senha atual incorreta.', 'error');
        return;
    }

    if (newPwd.length < 6) {
        showNotification('A nova senha deve ter pelo menos 6 caracteres.', 'error');
        return;
    }

    if (newPwd !== confirmPwd) {
        showNotification('A confirmação não corresponde à nova senha.', 'error');
        return;
    }

    // atualizar senha
    userList[userIdx].password = newPwd;
    if (typeof window !== 'undefined') window.users = userList;
    localStorage.setItem('users', JSON.stringify(userList));
    if (typeof saveData === 'function') saveData();

    // limpar campos
    if (currentInput) currentInput.value = '';
    if (newInput) newInput.value = '';
    if (confirmInput) confirmInput.value = '';

    showNotification('Senha alterada com sucesso!', 'success');

    if (window && window.logAnalyticsEvent) {
        window.logAnalyticsEvent('change_password', {});
    }
}

function deleteAccount() {
    const user = typeof window !== 'undefined' ? window.currentUser : (typeof currentUser !== 'undefined' ? currentUser : null);
    let evts = typeof window !== 'undefined' && window.events ? window.events : (typeof events !== 'undefined' ? events : []);
    let msgs = typeof window !== 'undefined' && window.messages ? window.messages : (typeof messages !== 'undefined' ? messages : []);
    let userList = typeof window !== 'undefined' && window.users ? window.users : (typeof users !== 'undefined' ? users : []);
    if (!confirm('⚠️ ATENÇÃO: Esta ação é irreversível!\n\nTem certeza que deseja excluir sua conta permanentemente?\n\nTodos os seus dados, eventos e avaliações serão apagados.')) {
        return;
    }
    
    if (!confirm('Confirme novamente: deseja realmente excluir sua conta?')) {
        return;
    }
    
    // Não permitir excluir conta admin se for o único
    if (user && user.role === 'admin') {
        const admins = userList.filter(u => u.role === 'admin');
        if (admins.length === 1) {
            showNotification('Não é possível excluir a única conta de administrador!', 'error');
            return;
        }
    }
    
    // Remover eventos do usuário
    evts = evts.filter(e => user && e.organizerId !== user.id);
    
    // Remover avaliações do usuário
    evts.forEach(event => {
        if (event.ratings) {
            event.ratings = event.ratings.filter(r => user && r.userId !== user.id);
        }
    });
    
    // Remover mensagens do usuário
    msgs = msgs.filter(m => user && m.from !== user.id && m.to !== user.id);
    
    // Remover usuário
    userList = userList.filter(u => user && u.id !== user.id);
    if (typeof window !== 'undefined') {
        window.events = evts;
        window.messages = msgs;
        window.users = userList;
    }
    
    if (typeof saveData === 'function') saveData();
    
    // Registrar no Analytics
    if (window && window.logAnalyticsEvent) {
        window.logAnalyticsEvent('delete_account', {
            user_role: user ? user.role : 'unknown'
        });
    }
    
    // Fazer logout
    localStorage.removeItem('currentUser');
    if (typeof window !== 'undefined') window.currentUser = null;
    
    showNotification('Sua conta foi excluída. Você será redirecionado para o login.', 'success');
    
    setTimeout(() => {
        location.reload();
    }, 2000);
}

// Função de inicialização do perfil
function initProfilePage() {
    console.log('[profile] Inicializando página de perfil...');
    
    // Configurar event listeners
    const editBtn = document.getElementById('editProfileBtn');
    const deleteBtn = document.getElementById('deleteAccountBtn');
    const changePassBtn = document.getElementById('changePasswordBtn');
    
    if (editBtn) {
        // Remover listeners antigos
        const newEditBtn = editBtn.cloneNode(true);
        editBtn.parentNode.replaceChild(newEditBtn, editBtn);
        document.getElementById('editProfileBtn').addEventListener('click', editProfile);
    }
    
    if (deleteBtn) {
        // Remover listeners antigos
        const newDeleteBtn = deleteBtn.cloneNode(true);
        deleteBtn.parentNode.replaceChild(newDeleteBtn, deleteBtn);
        document.getElementById('deleteAccountBtn').addEventListener('click', deleteAccount);
    }
    
    if (changePassBtn) {
        const newChangeBtn = changePassBtn.cloneNode(true);
        changePassBtn.parentNode.replaceChild(newChangeBtn, changePassBtn);
        document.getElementById('changePasswordBtn').addEventListener('click', changePassword);
    }
    
    // Carregar dados do perfil
    loadProfile();
}

// Chamar inicialização quando a página for carregada
if (document.getElementById('profileName')) {
    initProfilePage();
}

// Exportar funções globalmente
if (typeof window !== 'undefined') {
    window.initProfilePage = initProfilePage;
    window.loadProfile = loadProfile;
    window.loadMyEventsProfile = loadMyEventsProfile;
    window.loadMyRatingsProfile = loadMyRatingsProfile;
    window.deleteRating = deleteRating;
    window.deleteAccount = deleteAccount;
    window.editProfile = editProfile;
    window.changePassword = changePassword;
}
