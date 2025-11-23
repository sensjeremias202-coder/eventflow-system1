function loadUsersTable() {
    if (currentUser.role !== 'admin') return;
    
    const usersTable = document.getElementById('usersTable');
    usersTable.innerHTML = '';
    
    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.role === 'admin' ? 'Administrador' : 'Usuário Comum'}</td>
            <td>${formatDate(user.registered)}</td>
            <td>
                <button class="btn btn-outline btn-sm edit-user" data-id="${user.id}">
                    <i class="far fa-edit"></i>
                </button>
                ${user.id !== currentUser.id ? `
                    <button class="btn btn-outline btn-sm delete-user" data-id="${user.id}">
                        <i class="far fa-trash-alt"></i>
                    </button>
                ` : ''}
            </td>
        `;
        
        usersTable.appendChild(row);
    });
    
    // Adicionar eventos aos botões
    document.querySelectorAll('.edit-user').forEach(btn => {
        btn.addEventListener('click', function() {
            const userId = parseInt(this.getAttribute('data-id'));
            editUser(userId);
        });
    });
    
    document.querySelectorAll('.delete-user').forEach(btn => {
        btn.addEventListener('click', function() {
            const userId = parseInt(this.getAttribute('data-id'));
            deleteUser(userId);
        });
    });
}

function createUser() {
    const name = document.getElementById('newUserName').value;
    const email = document.getElementById('newUserEmail').value;
    const password = document.getElementById('newUserPassword').value;
    const role = document.getElementById('newUserRole').value;
    
    // Verificar se o e-mail já existe
    if (users.find(u => u.email === email)) {
        alert('Este e-mail já está cadastrado!');
        return;
    }
    
    // Criar novo usuário
    const newUser = {
        id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
        name,
        email,
        password,
        role,
        registered: new Date().toISOString().split('T')[0]
    };
    
    users.push(newUser);
    saveData();
    
    alert('Usuário criado com sucesso!');
    document.getElementById('addUserModal').classList.remove('active');
    document.getElementById('addUserForm').reset();
    loadUsersTable();
}

function editUser(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    // Preencher o formulário com os dados do usuário
    document.getElementById('newUserName').value = user.name;
    document.getElementById('newUserEmail').value = user.email;
    document.getElementById('newUserPassword').value = user.password;
    document.getElementById('newUserRole').value = user.role;
    
    // Alterar o botão para "Atualizar Usuário"
    const submitButton = document.querySelector('#addUserForm button[type="submit"]');
    submitButton.textContent = 'Atualizar Usuário';
    
    // Alterar o evento de submit para atualização
    const form = document.getElementById('addUserForm');
    form.onsubmit = function(e) {
        e.preventDefault();
        updateUser(userId);
    };
    
    // Mostrar o modal
    document.getElementById('addUserModal').classList.add('active');
}

function updateUser(userId) {
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return;
    
    const name = document.getElementById('newUserName').value;
    const email = document.getElementById('newUserEmail').value;
    const password = document.getElementById('newUserPassword').value;
    const role = document.getElementById('newUserRole').value;
    
    // Verificar se o e-mail já existe (excluindo o usuário atual)
    const emailExists = users.find(u => u.email === email && u.id !== userId);
    if (emailExists) {
        alert('Este e-mail já está cadastrado!');
        return;
    }
    
    // Atualizar usuário
    users[userIndex] = {
        ...users[userIndex],
        name,
        email,
        password,
        role
    };
    
    saveData();
    
    alert('Usuário atualizado com sucesso!');
    document.getElementById('addUserModal').classList.remove('active');
    
    // Restaurar o formulário para criação
    const submitButton = document.querySelector('#addUserForm button[type="submit"]');
    submitButton.textContent = 'Criar Usuário';
    document.getElementById('addUserForm').reset();
    document.getElementById('addUserForm').onsubmit = function(e) {
        e.preventDefault();
        createUser();
    };
    
    loadUsersTable();
}

function deleteUser(userId) {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
        // Não permitir excluir a si mesmo
        if (userId === currentUser.id) {
            alert('Você não pode excluir sua própria conta!');
            return;
        }
        
        users = users.filter(u => u.id !== userId);
        saveData();
        loadUsersTable();
        alert('Usuário excluído com sucesso!');
    }
}

function loadUsersTable() {
    if (currentUser.role !== 'admin') return;
    
    const usersTable = document.getElementById('usersTable');
    usersTable.innerHTML = '';
    
    if (users.length === 0) {
        usersTable.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; color: var(--gray); padding: 40px;">
                    <i class="fas fa-users fa-3x" style="margin-bottom: 20px;"></i>
                    <p>Nenhum usuário cadastrado ainda.</p>
                    <p>Clique em "Adicionar Usuário" para criar o primeiro usuário!</p>
                </td>
            </tr>
        `;
        return;
    }
    
    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div class="chat-user-avatar" style="width: 35px; height: 35px; font-size: 0.8rem;">
                        ${user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div>
                        <div>${user.name}</div>
                        ${user.id === currentUser.id ? 
                            '<small style="color: var(--primary);">(Você)</small>' : ''}
                    </div>
                </div>
            </td>
            <td>${user.email}</td>
            <td>
                <span class="category-badge" style="background-color: ${user.role === 'admin' ? '#4361ee' : '#4cc9f0'};">
                    ${user.role === 'admin' ? 'Administrador' : 'Usuário Comum'}
                </span>
            </td>
            <td>${formatDate(user.registered)}</td>
            <td>
                <button class="btn btn-outline btn-sm edit-user" data-id="${user.id}" title="Editar usuário">
                    <i class="far fa-edit"></i>
                </button>
                ${user.id !== currentUser.id ? `
                    <button class="btn btn-outline btn-sm delete-user" data-id="${user.id}" title="Excluir usuário">
                        <i class="far fa-trash-alt"></i>
                    </button>
                ` : `
                    <button class="btn btn-outline btn-sm" disabled title="Não é possível excluir sua própria conta">
                        <i class="far fa-trash-alt"></i>
                    </button>
                `}
            </td>
        `;
        
        usersTable.appendChild(row);
    });
    
    // Adicionar eventos aos botões
    document.querySelectorAll('.edit-user').forEach(btn => {
        btn.addEventListener('click', function() {
            const userId = parseInt(this.getAttribute('data-id'));
            editUser(userId);
        });
    });
    
    document.querySelectorAll('.delete-user').forEach(btn => {
        btn.addEventListener('click', function() {
            const userId = parseInt(this.getAttribute('data-id'));
            deleteUser(userId);
        });
    });
}