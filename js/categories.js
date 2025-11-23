function loadCategoriesTable() {
    if (currentUser.role !== 'admin') return;
    
    const categoriesTable = document.getElementById('categoriesTable');
    if (!categoriesTable) return;
    
    categoriesTable.innerHTML = '';
    
    if (categories.length === 0) {
        categoriesTable.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; color: var(--gray); padding: 40px;">
                    <i class="fas fa-tags fa-3x" style="margin-bottom: 20px;"></i>
                    <p>Nenhuma categoria cadastrada ainda.</p>
                    <p>Clique em "Adicionar Categoria" para criar a primeira categoria!</p>
                </td>
            </tr>
        `;
        return;
    }
    
    categories.forEach(category => {
        // Contar eventos nesta categoria
        const eventCount = events.filter(e => e.category === category.id).length;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <i class="${category.icon}" style="color: ${category.color};"></i>
                    <span>${category.name}</span>
                </div>
            </td>
            <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 20px; height: 20px; background-color: ${category.color}; border-radius: 3px;"></div>
                    <span>${category.color}</span>
                </div>
            </td>
            <td><code>${category.icon}</code></td>
            <td>
                <span class="category-badge" style="background-color: ${category.color};">
                    ${eventCount} evento(s)
                </span>
            </td>
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
    if (!validateCategoryForm()) return;
    
    const name = document.getElementById('categoryName').value.trim();
    const color = document.getElementById('categoryColor').value;
    const icon = document.getElementById('categoryIcon').value.trim();
    
    // Verificar se a categoria já existe
    if (categories.find(c => c.name.toLowerCase() === name.toLowerCase())) {
        showNotification('Já existe uma categoria com este nome!', 'error');
        return;
    }
    
    // Validar ícone Font Awesome
    if (!icon.startsWith('fas fa-') && !icon.startsWith('far fa-') && !icon.startsWith('fab fa-')) {
        showNotification('Use um ícone válido do Font Awesome (ex: fas fa-music, far fa-star)', 'error');
        return;
    }
    
    // Criar nova categoria
    const newCategory = {
        id: categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1,
        name,
        color,
        icon,
        createdAt: new Date().toISOString()
    };
    
    categories.push(newCategory);
    saveData();
    
    showNotification('Categoria criada com sucesso!', 'success');
    closeModal('addCategoryModal');
    loadCategoriesTable();
    loadCategoryOptions(); // Atualizar opções no formulário de eventos
}