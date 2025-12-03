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
    let scopedUsers = Array.isArray(users) ? (activeCommunityId ? users.filter(u => u.communityId === activeCommunityId) : users) : [];

    // Busca com debounce
    const searchInput = document.getElementById('usersSearch');
    const paginationEl = document.getElementById('usersPagination');
    let q = '';
    let page = 1;
    const pageSize = 10;
    let debounceTimer = null;
    function applySearch() {
        const term = (q||'').toLowerCase();
        let data = scopedUsers;
        if (term) {
            data = data.filter(u => (
                (u.name||'').toLowerCase().includes(term) ||
                (u.email||'').toLowerCase().includes(term) ||
                String(u.id||'').toLowerCase().includes(term)
            ));
        }
        const total = data.length;
        const pages = Math.max(1, Math.ceil(total / pageSize));
        page = Math.min(page, pages);
        const start = (page-1)*pageSize;
        const paged = data.slice(start, start+pageSize);
        renderUsersRows(paged);
        renderUsersPagination(total, pages);
    }
    function renderUsersRows(list) {
        container.innerHTML = `
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nome</th>
                            <th>E-mail</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${list.map(user => `
                            <tr>
                                <td><code>${user.id}</code></td>
                                <td><strong>${user.name||'-'}</strong></td>
                                <td>${user.email||'-'}</td>
                                <td>${user.active ? 'Ativo' : 'Inativo'}</td>
                                <td>
                                    <div style="display:flex; gap:8px;">
                                        <button class="btn btn-sm btn-outline" onclick="editUser('${user.id}')" title="Editar"><i class="fas fa-edit"></i></button>
                                        <button class="btn btn-sm btn-outline" onclick="toggleUserStatus('${user.id}')" title="Ativar/Inativar"><i class="fas fa-toggle-on"></i></button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
    function renderUsersPagination(total, pages) {
        if (!paginationEl) return;
        const buttons = [];
        const prevDisabled = page<=1 ? 'disabled' : '';
        const nextDisabled = page>=pages ? 'disabled' : '';
        buttons.push(`<button class="btn btn-sm btn-outline" ${prevDisabled} data-page="prev">Anterior</button>`);
        buttons.push(`<span style="padding:4px 8px;">Página ${page} de ${pages} • ${total} usuários</span>`);
        buttons.push(`<button class="btn btn-sm btn-outline" ${nextDisabled} data-page="next">Próxima</button>`);
        paginationEl.innerHTML = buttons.join(' ');
        paginationEl.querySelectorAll('button[data-page]').forEach(btn=>{
            btn.onclick = () => {
                const dir = btn.getAttribute('data-page');
                if (dir==='prev' && page>1) page--; else if (dir==='next' && page<pages) page++;
                applySearch();
            };
        });
    }
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            q = e.target.value || '';
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(applySearch, 250);
        });
    }

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
