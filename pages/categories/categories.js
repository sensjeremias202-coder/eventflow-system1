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
    if (!icon.startsWith('fas fa-') && !icon.startsWith('far fa-') && !icon.startsWith('far fa-') && !icon.startsWith('fab fa-')) {
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
    // selecionar automaticamente a categoria recém-criada no select de eventos, se presente
    try {
        const categorySelect = document.getElementById('eventCategory');
        if (categorySelect) categorySelect.value = newCategory.id;
    } catch (e) {
        // ignore
    }
}

function validateCategoryForm() {
    const name = document.getElementById('categoryName');
    const color = document.getElementById('categoryColor');
    const icon = document.getElementById('categoryIcon');
    
    if (!name || !name.value.trim()) {
        showNotification('Por favor, preencha o nome da categoria!', 'error');
        return false;
    }
    
    if (!color || !color.value) {
        showNotification('Por favor, escolha uma cor!', 'error');
        return false;
    }
    
    if (!icon || !icon.value.trim()) {
        showNotification('Por favor, informe um ícone!', 'error');
        return false;
    }
    
    return true;
}

// Função de inicialização da página de categorias
function initCategoriesPage() {
    console.log('[categories] Inicializando página de categorias...');
    
    // Clonar botão de adicionar categoria para limpar event listeners antigos
    const addBtn = document.getElementById('addCategoryBtn');
    if (addBtn) {
        const newAddBtn = addBtn.cloneNode(true);
        addBtn.parentNode.replaceChild(newAddBtn, addBtn);
        
        newAddBtn.addEventListener('click', function() {
            openModal('addCategoryModal');
        });
    }
    
    // Configurar o formulário de adicionar categoria
    const addCategoryForm = document.getElementById('addCategoryForm');
    if (addCategoryForm) {
        const newForm = addCategoryForm.cloneNode(true);
        addCategoryForm.parentNode.replaceChild(newForm, addCategoryForm);
        
        newForm.addEventListener('submit', function(e) {
            e.preventDefault();
            createCategory();
        });
    }
    
    // Carregar tabela de categorias
    loadCategoriesTable();
    
    console.log('[categories] Página de categorias inicializada com sucesso!');
}

function editCategory(categoryId) {
    const category = categories.find(c => c.id === categoryId);
    if (!category) {
        showNotification('Categoria não encontrada!', 'error');
        return;
    }
    
    // Preencher o formulário com os dados da categoria
    document.getElementById('categoryName').value = category.name;
    document.getElementById('categoryColor').value = category.color;
    document.getElementById('categoryIcon').value = category.icon;
    
    // Abrir modal
    openModal('addCategoryModal');
    
    // Modificar comportamento do formulário para edição
    const addCategoryForm = document.getElementById('addCategoryForm');
    if (addCategoryForm) {
        const newForm = addCategoryForm.cloneNode(true);
        addCategoryForm.parentNode.replaceChild(newForm, addCategoryForm);
        
        // Preencher novamente (pois clonamos)
        document.getElementById('categoryName').value = category.name;
        document.getElementById('categoryColor').value = category.color;
        document.getElementById('categoryIcon').value = category.icon;
        
        newForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!validateCategoryForm()) return;
            
            const name = document.getElementById('categoryName').value.trim();
            const color = document.getElementById('categoryColor').value;
            const icon = document.getElementById('categoryIcon').value.trim();
            
            // Verificar se o novo nome já existe em outra categoria
            const existingCategory = categories.find(c => 
                c.name.toLowerCase() === name.toLowerCase() && c.id !== categoryId
            );
            if (existingCategory) {
                showNotification('Já existe uma categoria com este nome!', 'error');
                return;
            }
            
            // Atualizar categoria
            category.name = name;
            category.color = color;
            category.icon = icon;
            category.updatedAt = new Date().toISOString();
            
            saveData();
            showNotification('Categoria atualizada com sucesso!', 'success');
            closeModal('addCategoryModal');
            loadCategoriesTable();
            loadCategoryOptions();
        });
    }
}

function deleteCategory(categoryId) {
    const category = categories.find(c => c.id === categoryId);
    if (!category) {
        showNotification('Categoria não encontrada!', 'error');
        return;
    }
    
    // Verificar se há eventos usando esta categoria
    const eventCount = events.filter(e => e.category === categoryId).length;
    
    let message = `Tem certeza que deseja excluir a categoria "${category.name}"?`;
    if (eventCount > 0) {
        message += `\n\nAtenção: Existem ${eventCount} evento(s) nesta categoria. Eles ficarão sem categoria.`;
    }
    
    if (!confirm(message)) return;
    
    // Remover categoria
    const index = categories.findIndex(c => c.id === categoryId);
    if (index !== -1) {
        categories.splice(index, 1);
        saveData();
        showNotification('Categoria excluída com sucesso!', 'success');
        loadCategoriesTable();
        loadCategoryOptions();
    }
}