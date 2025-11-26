// ============================================
// SISTEMA DE GERENCIAMENTO DE CATEGORIAS
// ============================================

// Inicializar página de categorias
function initCategoriesPage() {
    console.log('[categories] 🏷️ Inicializando página de categorias...');
    loadCategoriesTable();
    setupCategoryHandlers();
    console.log('[categories] ✅ Página de categorias inicializada');
}

// Carregar tabela de categorias
function loadCategoriesTable() {
    console.log('[categories] 📋 Carregando tabela de categorias...');
    
    // Verificar permissão
    if (!currentUser || currentUser.role !== 'admin') {
        console.error('[categories] ❌ Acesso negado - somente administradores');
        showNotification('Acesso negado', 'error');
        return;
    }
    
    const container = document.getElementById('categoriesTable');
    if (!container) {
        console.error('[categories] ❌ Elemento categoriesTable não encontrado!');
        return;
    }
    
    // Verificar se há categorias
    if (!categories || categories.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--gray); padding: 40px;">Nenhuma categoria cadastrada</p>';
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
                        <th>Descrição</th>
                        <th>Cor</th>
                        <th>Eventos</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${categories.map(category => {
                        const eventCount = events ? events.filter(e => e.category === category.id).length : 0;
                        return `
                            <tr>
                                <td><code>${category.id}</code></td>
                                <td>
                                    <strong>${category.name}</strong>
                                </td>
                                <td>${category.description || '-'}</td>
                                <td>
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <div style="width: 20px; height: 20px; border-radius: 4px; background: ${category.color || '#6c757d'};"></div>
                                        <span>${category.color || '-'}</span>
                                    </div>
                                </td>
                                <td>
                                    <span class="badge badge-primary">${eventCount} evento${eventCount !== 1 ? 's' : ''}</span>
                                </td>
                                <td>
                                    <div style="display: flex; gap: 8px;">
                                        <button class="btn btn-sm btn-outline" onclick="editCategory('${category.id}')" title="Editar">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        ${eventCount === 0 ? `
                                            <button class="btn btn-sm btn-danger" onclick="deleteCategory('${category.id}')" title="Excluir">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        ` : `
                                            <button class="btn btn-sm btn-outline" disabled title="Não pode excluir: categoria em uso">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        `}
                                    </div>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    console.log('[categories] ✅ Tabela de categorias carregada:', categories.length);
}

// Editar categoria
function editCategory(categoryId) {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;
    
    showNotification('Modal de edição de categoria em desenvolvimento', 'info');
    // TODO: Implementar modal de edição
}

// Deletar categoria
async function deleteCategory(categoryId) {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;
    
    // Verificar se há eventos usando esta categoria
    const eventCount = events ? events.filter(e => e.category === categoryId).length : 0;
    if (eventCount > 0) {
        showNotification('Não é possível excluir categoria em uso', 'error');
        return;
    }
    
    const confirmed = await showConfirm(
        `Tem certeza que deseja excluir a categoria "${category.name}"?`,
        'Confirmar Exclusão',
        { type: 'danger' }
    );
    
    if (!confirmed) return;
    
    // Remover categoria
    const index = categories.findIndex(c => c.id === categoryId);
    if (index > -1) {
        categories.splice(index, 1);
        localStorage.setItem('categories', JSON.stringify(categories));
        showNotification('Categoria excluída com sucesso!', 'success');
        loadCategoriesTable();
    }
}

// Configurar event handlers
function setupCategoryHandlers() {
    // Botão de adicionar categoria
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    if (addCategoryBtn && !addCategoryBtn.dataset.categoriesListenerAdded) {
        addCategoryBtn.dataset.categoriesListenerAdded = 'true';
        addCategoryBtn.addEventListener('click', () => {
            const addCategoryModal = document.getElementById('addCategoryModal');
            if (addCategoryModal) {
                addCategoryModal.classList.add('active');
            } else {
                showNotification('Modal de categoria não encontrado', 'error');
            }
        });
    }
}

// Exportar funções globalmente
window.initCategoriesPage = initCategoriesPage;
window.loadCategoriesTable = loadCategoriesTable;
window.editCategory = editCategory;
window.deleteCategory = deleteCategory;

console.log('[categories] ✅ Módulo de categorias carregado');
