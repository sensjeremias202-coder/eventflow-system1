function loadCategoriesTable() {
    if (currentUser.role !== 'admin') return;
    
    const categoriesTable = document.getElementById('categoriesTable');
    categoriesTable.innerHTML = '';
    
    categories.forEach(category => {
        // Contar eventos nesta categoria
        const eventCount = events.filter(e => e.category === category.id).length;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${category.name}</td>
            <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 20px; height: 20px; background-color: ${category.color}; border-radius: 3px;"></div>
                    <span>${category.color}</span>
                </div>
            </td>
            <td><i class="${category.icon}"></i> ${category.icon}</td>
            <td>${eventCount} evento(s)</td>
            <td>
                <button class="btn btn-outline btn-sm edit-category" data-id="${category.id}">
                    <i class="far fa-edit"></i>
                </button>
                <button class="btn btn-outline btn-sm delete-category" data-id="${category.id}">
                    <i class="far fa-trash-alt"></i>
                </button>
            </td>
        `;
        
        categoriesTable.appendChild(row);
    });
    
    // Adicionar eventos aos botões
    document.querySelectorAll('.edit-category').forEach(btn => {
        btn.addEventListener('click', function() {
            const categoryId = parseInt(this.getAttribute('data-id'));
            editCategory(categoryId);
        });
    });
    
    document.querySelectorAll('.delete-category').forEach(btn => {
        btn.addEventListener('click', function() {
            const categoryId = parseInt(this.getAttribute('data-id'));
            deleteCategory(categoryId);
        });
    });
}

function createCategory() {
    const name = document.getElementById('categoryName').value;
    const color = document.getElementById('categoryColor').value;
    const icon = document.getElementById('categoryIcon').value;
    
    // Verificar se a categoria já existe
    if (categories.find(c => c.name.toLowerCase() === name.toLowerCase())) {
        alert('Já existe uma categoria com este nome!');
        return;
    }
    
    // Criar nova categoria
    const newCategory = {
        id: categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1,
        name,
        color,
        icon
    };
    
    categories.push(newCategory);
    saveData();
    
    alert('Categoria criada com sucesso!');
    document.getElementById('addCategoryModal').classList.remove('active');
    document.getElementById('addCategoryForm').reset();
    loadCategoriesTable();
}

function editCategory(categoryId) {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;
    
    // Preencher o formulário com os dados da categoria
    document.getElementById('categoryName').value = category.name;
    document.getElementById('categoryColor').value = category.color;
    document.getElementById('categoryIcon').value = category.icon;
    
    // Alterar o botão para "Atualizar Categoria"
    const submitButton = document.querySelector('#addCategoryForm button[type="submit"]');
    submitButton.textContent = 'Atualizar Categoria';
    
    // Alterar o evento de submit para atualização
    const form = document.getElementById('addCategoryForm');
    form.onsubmit = function(e) {
        e.preventDefault();
        updateCategory(categoryId);
    };
    
    // Mostrar o modal
    document.getElementById('addCategoryModal').classList.add('active');
}

function updateCategory(categoryId) {
    const categoryIndex = categories.findIndex(c => c.id === categoryId);
    if (categoryIndex === -1) return;
    
    const name = document.getElementById('categoryName').value;
    const color = document.getElementById('categoryColor').value;
    const icon = document.getElementById('categoryIcon').value;
    
    // Verificar se a categoria já existe (excluindo a atual)
    const categoryExists = categories.find(c => c.name.toLowerCase() === name.toLowerCase() && c.id !== categoryId);
    if (categoryExists) {
        alert('Já existe uma categoria com este nome!');
        return;
    }
    
    // Atualizar categoria
    categories[categoryIndex] = {
        ...categories[categoryIndex],
        name,
        color,
        icon
    };
    
    saveData();
    
    alert('Categoria atualizada com sucesso!');
    document.getElementById('addCategoryModal').classList.remove('active');
    
    // Restaurar o formulário para criação
    const submitButton = document.querySelector('#addCategoryForm button[type="submit"]');
    submitButton.textContent = 'Criar Categoria';
    document.getElementById('addCategoryForm').reset();
    document.getElementById('addCategoryForm').onsubmit = function(e) {
        e.preventDefault();
        createCategory();
    };
    
    loadCategoriesTable();
}

function deleteCategory(categoryId) {
    if (confirm('Tem certeza que deseja excluir esta categoria?')) {
        // Verificar se existem eventos usando esta categoria
        const eventsUsingCategory = events.filter(e => e.category === categoryId);
        if (eventsUsingCategory.length > 0) {
            alert('Não é possível excluir esta categoria pois existem eventos vinculados a ela!');
            return;
        }
        
        categories = categories.filter(c => c.id !== categoryId);
        saveData();
        loadCategoriesTable();
        alert('Categoria excluída com sucesso!');
    }
}

// -----------------------
// User management (admin)
// -----------------------

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function loadUsersTable() {
    if (!currentUser || currentUser.role !== 'admin') return;

    const usersTable = document.getElementById('usersTable');
    if (!usersTable) return;

    usersTable.innerHTML = '';

    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.role}</td>
            <td>${formatDate(user.registered || new Date().toISOString())}</td>
            <td>
                <button class="btn btn-outline btn-sm edit-user" data-id="${user.id}">
                    <i class="far fa-edit"></i>
                </button>
                <button class="btn btn-outline btn-sm delete-user" data-id="${user.id}">
                    <i class="far fa-trash-alt"></i>
                </button>
            </td>
        `;

        usersTable.appendChild(row);
    });

    // bind actions
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

    // add user button (replace node to avoid duplicate listeners)
    const addUserBtn = document.getElementById('addUserBtn');
    if (addUserBtn && addUserBtn.parentNode) {
        const btn = addUserBtn.cloneNode(true);
        addUserBtn.parentNode.replaceChild(btn, addUserBtn);
        btn.addEventListener('click', function() {
            const modal = document.getElementById('addUserModal');
            if (modal) modal.classList.add('active');

            // reset form to create mode
            const form = document.getElementById('addUserForm');
            if (form) {
                form.reset();
                const submitBtn = form.querySelector('button[type="submit"]');
                if (submitBtn) submitBtn.textContent = 'Criar Usuário';
                form.onsubmit = function(e) {
                    e.preventDefault();
                    createUser();
                };
            }
        });
    }
}

function createUser() {
    const name = document.getElementById('newUserName').value.trim();
    const email = document.getElementById('newUserEmail').value.trim();
    const password = document.getElementById('newUserPassword').value;
    const role = document.getElementById('newUserRole').value;

    if (!name || !email || !password) {
        showNotification('Por favor preencha todos os campos do usuário', 'error');
        return;
    }

    if (!isValidEmail(email)) {
        showNotification('E-mail inválido', 'error');
        return;
    }

    if (password.length < 6) {
        showNotification('Senha deve ter pelo menos 6 caracteres', 'error');
        return;
    }

    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        showNotification('Já existe um usuário com este e-mail', 'error');
        return;
    }

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
    loadUsersTable();
    showNotification('Usuário criado com sucesso', 'success');

    const modal = document.getElementById('addUserModal');
    if (modal) modal.classList.remove('active');
    const form = document.getElementById('addUserForm');
    if (form) form.reset();
}

function editUser(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const modal = document.getElementById('addUserModal');
    if (modal) modal.classList.add('active');

    document.getElementById('newUserName').value = user.name;
    document.getElementById('newUserEmail').value = user.email;
    document.getElementById('newUserPassword').value = user.password;
    document.getElementById('newUserRole').value = user.role;

    const form = document.getElementById('addUserForm');
    if (form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.textContent = 'Atualizar Usuário';

        form.onsubmit = function(e) {
            e.preventDefault();
            updateUser(userId);
        };
    }
}

function updateUser(userId) {
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) return;

    const name = document.getElementById('newUserName').value.trim();
    const email = document.getElementById('newUserEmail').value.trim();
    const password = document.getElementById('newUserPassword').value;
    const role = document.getElementById('newUserRole').value;

    if (!name || !email) {
        showNotification('Nome e e-mail são obrigatórios', 'error');
        return;
    }

    if (!isValidEmail(email)) {
        showNotification('E-mail inválido', 'error');
        return;
    }

    if (password && password.length < 6) {
        showNotification('Senha deve ter pelo menos 6 caracteres', 'error');
        return;
    }

    // verificar e-mail duplicado (exceto o próprio)
    const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.id !== userId);
    if (exists) {
        showNotification('Outro usuário já utiliza este e-mail', 'error');
        return;
    }

    users[idx] = {
        ...users[idx],
        name,
        email,
        password,
        role
    };

    saveData();
    loadUsersTable();
    showNotification('Usuário atualizado com sucesso', 'success');

    const modal = document.getElementById('addUserModal');
    if (modal) modal.classList.remove('active');

    // restaurar comportamento padrão do formulário
    const form = document.getElementById('addUserForm');
    if (form) {
        form.reset();
        form.onsubmit = function(e) {
            e.preventDefault();
            createUser();
        };
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.textContent = 'Criar Usuário';
    }
}

function deleteUser(userId) {
    if (userId === currentUser.id) {
        showNotification('Você não pode excluir o usuário atualmente logado', 'error');
        return;
    }

    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;

    users = users.filter(u => u.id !== userId);
    saveData();
    loadUsersTable();
    showNotification('Usuário excluído com sucesso', 'success');
}