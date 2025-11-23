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