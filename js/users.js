// ============================================
// SISTEMA DE GERENCIAMENTO DE USUÁRIOS
// ============================================

// Carregar tabela de usuários
function loadUsersTable() {
    console.log('[users] 👥 Carregando tabela de usuários...');
    
    // Verificar permissão
    if (!currentUser || currentUser.role !== 'admin') {
        console.error('[users] ❌ Acesso negado - somente administradores');
        showNotification('Acesso negado', 'error');
        return;
    }
    
    const container = document.getElementById('usersTable');
    if (!container) {
        console.error('[users] ❌ Elemento usersTable não encontrado!');
        return;
    }
    
    // Filtrar por comunidade ativa
    const activeCommunityId = (window.communities && typeof window.communities.getActiveId==='function') ? window.communities.getActiveId() : (localStorage.getItem('activeCommunityId')||null);
    const scopedUsers = Array.isArray(users) ? users.filter(u => !u.communityId || (activeCommunityId ? u.communityId === activeCommunityId : true)) : [];

    // Verificar se há usuários
    if (!scopedUsers || scopedUsers.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--gray); padding: 40px;">Nenhum usuário cadastrado</p>';
        return;
    }
    
    // Renderizar tabela
    container.innerHTML = `
        <div class="table-responsive">
            <table class="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nome</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${scopedUsers.map(user => `
                        <tr>
                            <td><code>${user.id}</code></td>
                            <td>
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <div class="user-avatar" style="width: 32px; height: 32px;">
                                        ${user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <strong>${user.name}</strong>
                                </div>
                            </td>
                            <td>${user.email}</td>
                            <td>
                                <span class="badge badge-${getRoleBadgeColor(user.role)}">
                                    ${getRoleName(user.role)}
                                </span>
                            </td>
                            <td>
                                <span class="badge badge-${user.active !== false ? 'success' : 'danger'}">
                                    ${user.active !== false ? 'Ativo' : 'Inativo'}
                                </span>
                            </td>
                            <td>
                                <div style="display: flex; gap: 8px;">
                                    <button class="btn btn-sm btn-outline" onclick="editUser('${user.id}')" title="Editar">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    ${user.id !== currentUser.id ? `
                                        <button class="btn btn-sm btn-${user.active !== false ? 'danger' : 'success'}" 
                                                onclick="toggleUserStatus('${user.id}')" 
                                                title="${user.active !== false ? 'Desativar' : 'Ativar'}">
                                            <i class="fas fa-${user.active !== false ? 'ban' : 'check'}"></i>
                                        </button>
                                    ` : ''}
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    console.log('[users] ✅ Tabela de usuários carregada:', users.length);
}

// Obter cor do badge de role
function getRoleBadgeColor(role) {
    const colors = {
        'admin': 'danger',
        'treasurer': 'warning',
        'jovens': 'primary'
    };
    return colors[role] || 'secondary';
}

// Obter nome da role
function getRoleName(role) {
    const names = {
        'admin': 'Administrador',
        'treasurer': 'Tesoureiro',
        'jovens': 'Jovens'
    };
    return names[role] || role;
}

// Editar usuário
function editUser(userId) {
    const activeCommunityId = (window.communities && typeof window.communities.getActiveId==='function') ? window.communities.getActiveId() : (localStorage.getItem('activeCommunityId')||null);
    if (!activeCommunityId){
        showNotification('Selecione uma comunidade antes de editar usuários.', 'warning');
        return;
    }
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    showNotification('Modal de edição de usuário em desenvolvimento', 'info');
    // TODO: Implementar modal de edição
}

// Alternar status do usuário
async function toggleUserStatus(userId) {
    const activeCommunityId = (window.communities && typeof window.communities.getActiveId==='function') ? window.communities.getActiveId() : (localStorage.getItem('activeCommunityId')||null);
    if (!activeCommunityId){
        showNotification('Selecione uma comunidade antes de alterar usuários.', 'warning');
        return;
    }
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    const action = user.active !== false ? 'desativar' : 'ativar';
    const confirmed = await showConfirm(
        `Tem certeza que deseja ${action} o usuário ${user.name}?`,
        'Confirmar Ação',
        { type: 'warning' }
    );
    
    if (!confirmed) return;
    
    // Alternar status
    user.active = user.active === false ? true : false;
    
    // Salvar no localStorage
    localStorage.setItem('users', JSON.stringify(users));
    
    showNotification(`Usuário ${action === 'desativar' ? 'desativado' : 'ativado'} com sucesso!`, 'success');
    loadUsersTable();
}

// Exportar funções globalmente
window.loadUsersTable = loadUsersTable;
window.editUser = editUser;
window.toggleUserStatus = toggleUserStatus;

console.log('[users] ✅ Módulo de usuários carregado');
// Handlers para criação de usuário com guarda de comunidade
document.addEventListener('DOMContentLoaded', function(){
    const addBtn = document.getElementById('addUserBtn');
    if (addBtn && !addBtn.dataset.userListenerAdded){
        addBtn.dataset.userListenerAdded = 'true';
        addBtn.addEventListener('click', function(){
            const activeCommunityId = (window.communities && typeof window.communities.getActiveId==='function') ? window.communities.getActiveId() : (localStorage.getItem('activeCommunityId')||null);
            if (!activeCommunityId){
                showNotification('Selecione uma comunidade antes de criar usuários.', 'warning');
                return;
            }
            const modal = document.getElementById('addUserModal');
            if (modal) { modal.classList.add('active'); }
        });
    }
    const form = document.getElementById('addUserForm');
    if (form && !form.dataset.userListenerAdded){
        form.dataset.userListenerAdded = 'true';
        form.addEventListener('submit', function(ev){
            const activeCommunityId = (window.communities && typeof window.communities.getActiveId==='function') ? window.communities.getActiveId() : (localStorage.getItem('activeCommunityId')||null);
            if (!activeCommunityId){
                ev.preventDefault();
                showNotification('Selecione uma comunidade antes de criar usuários.', 'warning');
            }
        });
    }
});
