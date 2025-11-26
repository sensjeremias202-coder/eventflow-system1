/**
 * ============================================
 * FINANCEIRO PAGE - Gestão Financeira de Eventos
 * ============================================
 */

console.log('[financeiro] 📊 Módulo financeiro carregado');

// Estado atual
let currentEventId = null;

/**
 * Carrega a página financeira
 */
function loadFinanceiro() {
    console.log('[financeiro] Carregando página financeira...');
    
    // Verificar permissões
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        console.error('[financeiro] Usuário não autenticado');
        return;
    }
    
    // Mostrar/ocultar elementos baseado no tipo de usuário
    // APENAS dentro da página financeira (não afetar sidebar)
    const isTreasurer = currentUser.role === 'treasurer' || currentUser.role === 'admin';
    const isAdmin = currentUser.role === 'admin';
    
    const financeiroPage = document.getElementById('financeiro-page');
    if (financeiroPage) {
        financeiroPage.querySelectorAll('.treasurer-only').forEach(el => {
            el.style.display = isTreasurer ? '' : 'none';
        });
        
        financeiroPage.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = isAdmin ? '' : 'none';
        });
    }
    
    // Carregar eventos no select
    loadEventsList();
    
    // Event listeners
    setupEventListeners();
}

/**
 * Carrega lista de eventos
 */
function loadEventsList() {
    const events = JSON.parse(localStorage.getItem('events') || '[]')
        .filter(e => e !== null && e !== undefined && typeof e === 'object');
    
    const selectEvent = document.getElementById('selectEventFinancial');
    selectEvent.innerHTML = '<option value="">Selecione um evento...</option>';
    
    events.forEach((event, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${event.title} - ${new Date(event.date).toLocaleDateString('pt-BR')}`;
        selectEvent.appendChild(option);
    });
}

/**
 * Configura event listeners
 */
function setupEventListeners() {
    // Seleção de evento
    document.getElementById('selectEventFinancial')?.addEventListener('change', function(e) {
        currentEventId = e.target.value;
        if (currentEventId) {
            loadEventFinancialData(currentEventId);
        } else {
            document.getElementById('financialInfo').style.display = 'none';
        }
    });
    
    // Salvar valor inicial
    document.getElementById('saveInitialValueBtn')?.addEventListener('click', saveInitialValue);
    
    // Adicionar gasto
    document.getElementById('addExpenseBtn')?.addEventListener('click', () => {
        if (!currentEventId) {
            alert('Selecione um evento primeiro!');
            return;
        }
        openModal('addExpenseModal');
        // Definir data padrão como hoje
        document.getElementById('expenseDate').valueAsDate = new Date();
    });
    
    // Form: adicionar gasto
    document.getElementById('addExpenseForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        addExpense();
    });
    
    // Form: editar gasto
    document.getElementById('editExpenseForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        updateExpense();
    });
    
    // Fechar modais
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').classList.remove('active');
        });
    });
}

/**
 * Carrega dados financeiros do evento
 */
function loadEventFinancialData(eventIndex) {
    const events = JSON.parse(localStorage.getItem('events') || '[]');
    const event = events[eventIndex];
    
    if (!event) return;
    
    // Inicializar estrutura financeira se não existir
    if (!event.financial) {
        event.financial = {
            initialValue: 0,
            expenses: [],
            changes: []
        };
        events[eventIndex] = event;
        localStorage.setItem('events', JSON.stringify(events));
    }
    
    // Calcular totais
    const initialValue = event.financial.initialValue || 0;
    const totalExpenses = event.financial.expenses.reduce((sum, exp) => sum + parseFloat(exp.value), 0);
    const remainingValue = initialValue - totalExpenses;
    
    // Atualizar UI
    document.getElementById('valorInicial').textContent = formatCurrency(initialValue);
    document.getElementById('totalGastos').textContent = formatCurrency(totalExpenses);
    document.getElementById('valorSobra').textContent = formatCurrency(remainingValue);
    
    // Atualizar cor do valor de sobra
    const sobraElement = document.getElementById('valorSobra');
    if (remainingValue < 0) {
        sobraElement.style.color = '#ef4444';
    } else if (remainingValue > 0) {
        sobraElement.style.color = '#10b981';
    } else {
        sobraElement.style.color = 'var(--gray)';
    }
    
    // Carregar lista de gastos
    loadExpensesList(event.financial.expenses);
    
    // Carregar histórico de alterações (admin)
    if (document.getElementById('changesHistory').style.display !== 'none') {
        loadChangeHistory(event.financial.changes || []);
    }
    
    // Mostrar área financeira
    document.getElementById('financialInfo').style.display = 'block';
    
    // Preencher campo de valor inicial
    document.getElementById('inputValorInicial').value = initialValue;
}

/**
 * Salva valor inicial
 */
function saveInitialValue() {
    const value = parseFloat(document.getElementById('inputValorInicial').value) || 0;
    const justification = document.getElementById('inputJustificativaInicial').value.trim();
    
    if (value <= 0) {
        alert('Digite um valor inicial válido!');
        return;
    }
    
    if (!justification) {
        alert('Digite uma justificativa!');
        return;
    }
    
    const events = JSON.parse(localStorage.getItem('events') || '[]');
    const event = events[currentEventId];
    
    if (!event.financial) {
        event.financial = { initialValue: 0, expenses: [], changes: [] };
    }
    
    const oldValue = event.financial.initialValue;
    event.financial.initialValue = value;
    
    // Registrar alteração
    registerChange(currentEventId, `Valor inicial alterado de ${formatCurrency(oldValue)} para ${formatCurrency(value)}`, justification);
    
    events[currentEventId] = event;
    localStorage.setItem('events', JSON.stringify(events));
    
    // Sincronizar com Firebase
    if (window.firebaseInitialized && window.firebaseDatabase) {
        window.firebaseDatabase.ref('events').set(events);
    }
    
    alert('Valor inicial salvo com sucesso!');
    loadEventFinancialData(currentEventId);
}

/**
 * Adiciona gasto
 */
function addExpense() {
    const description = document.getElementById('expenseDescription').value.trim();
    const value = parseFloat(document.getElementById('expenseValue').value) || 0;
    const date = document.getElementById('expenseDate').value;
    const justification = document.getElementById('expenseJustification').value.trim();
    
    if (!description || value <= 0 || !date || !justification) {
        alert('Preencha todos os campos!');
        return;
    }
    
    const events = JSON.parse(localStorage.getItem('events') || '[]');
    const event = events[currentEventId];
    
    if (!event.financial) {
        event.financial = { initialValue: 0, expenses: [], changes: [] };
    }
    
    const expense = {
        id: Date.now(),
        description,
        value,
        date,
        justification,
        createdBy: JSON.parse(localStorage.getItem('currentUser')).name,
        createdAt: new Date().toISOString()
    };
    
    event.financial.expenses.push(expense);
    
    // Registrar alteração
    registerChange(currentEventId, `Gasto adicionado: ${description} - ${formatCurrency(value)}`, justification);
    
    events[currentEventId] = event;
    localStorage.setItem('events', JSON.stringify(events));
    
    // Sincronizar com Firebase
    if (window.firebaseInitialized && window.firebaseDatabase) {
        window.firebaseDatabase.ref('events').set(events);
    }
    
    closeModal('addExpenseModal');
    document.getElementById('addExpenseForm').reset();
    
    alert('Gasto registrado com sucesso!');
    loadEventFinancialData(currentEventId);
}

/**
 * Carrega lista de gastos
 */
function loadExpensesList(expenses) {
    const container = document.getElementById('expensesList');
    
    if (!expenses || expenses.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--gray);">Nenhum gasto registrado ainda.</p>';
        return;
    }
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const canEdit = currentUser.role === 'treasurer' || currentUser.role === 'admin';
    
    container.innerHTML = expenses.map(expense => `
        <div class="expense-item">
            <div class="expense-info">
                <div class="expense-title">${expense.description}</div>
                <div class="expense-meta">
                    <span><i class="fas fa-calendar"></i> ${new Date(expense.date).toLocaleDateString('pt-BR')}</span>
                    <span><i class="fas fa-user"></i> ${expense.createdBy}</span>
                </div>
            </div>
            <div class="expense-value">-${formatCurrency(expense.value)}</div>
            ${canEdit ? `
                <div class="expense-actions">
                    <button class="btn btn-sm btn-outline" onclick="editExpense(${expense.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteExpense(${expense.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            ` : ''}
        </div>
    `).join('');
}

/**
 * Edita gasto
 */
function editExpense(expenseId) {
    const events = JSON.parse(localStorage.getItem('events') || '[]');
    const event = events[currentEventId];
    const expense = event.financial.expenses.find(e => e.id === expenseId);
    
    if (!expense) return;
    
    document.getElementById('editExpenseId').value = expenseId;
    document.getElementById('editExpenseDescription').value = expense.description;
    document.getElementById('editExpenseValue').value = expense.value;
    document.getElementById('editExpenseDate').value = expense.date;
    
    openModal('editExpenseModal');
}

/**
 * Atualiza gasto
 */
function updateExpense() {
    const expenseId = parseInt(document.getElementById('editExpenseId').value);
    const description = document.getElementById('editExpenseDescription').value.trim();
    const value = parseFloat(document.getElementById('editExpenseValue').value) || 0;
    const date = document.getElementById('editExpenseDate').value;
    const justification = document.getElementById('editExpenseJustification').value.trim();
    
    if (!justification) {
        alert('Digite o motivo da alteração!');
        return;
    }
    
    const events = JSON.parse(localStorage.getItem('events') || '[]');
    const event = events[currentEventId];
    const expenseIndex = event.financial.expenses.findIndex(e => e.id === expenseId);
    
    if (expenseIndex === -1) return;
    
    const oldExpense = event.financial.expenses[expenseIndex];
    event.financial.expenses[expenseIndex] = {
        ...oldExpense,
        description,
        value,
        date,
        updatedBy: JSON.parse(localStorage.getItem('currentUser')).name,
        updatedAt: new Date().toISOString()
    };
    
    // Registrar alteração
    registerChange(currentEventId, `Gasto alterado: "${oldExpense.description}" para "${description}" - Valor: ${formatCurrency(oldExpense.value)} → ${formatCurrency(value)}`, justification);
    
    events[currentEventId] = event;
    localStorage.setItem('events', JSON.stringify(events));
    
    // Sincronizar com Firebase
    if (window.firebaseInitialized && window.firebaseDatabase) {
        window.firebaseDatabase.ref('events').set(events);
    }
    
    closeModal('editExpenseModal');
    document.getElementById('editExpenseForm').reset();
    
    alert('Gasto atualizado com sucesso!');
    loadEventFinancialData(currentEventId);
}

/**
 * Deleta gasto
 */
function deleteExpense(expenseId) {
    if (!confirm('Tem certeza que deseja excluir este gasto?')) return;
    
    const justification = prompt('Digite o motivo da exclusão:');
    if (!justification) {
        alert('É necessário justificar a exclusão!');
        return;
    }
    
    const events = JSON.parse(localStorage.getItem('events') || '[]');
    const event = events[currentEventId];
    const expenseIndex = event.financial.expenses.findIndex(e => e.id === expenseId);
    
    if (expenseIndex === -1) return;
    
    const expense = event.financial.expenses[expenseIndex];
    event.financial.expenses.splice(expenseIndex, 1);
    
    // Registrar alteração
    registerChange(currentEventId, `Gasto excluído: ${expense.description} - ${formatCurrency(expense.value)}`, justification);
    
    events[currentEventId] = event;
    localStorage.setItem('events', JSON.stringify(events));
    
    // Sincronizar com Firebase
    if (window.firebaseInitialized && window.firebaseDatabase) {
        window.firebaseDatabase.ref('events').set(events);
    }
    
    alert('Gasto excluído com sucesso!');
    loadEventFinancialData(currentEventId);
}

/**
 * Registra alteração no histórico
 */
function registerChange(eventIndex, description, justification) {
    const events = JSON.parse(localStorage.getItem('events') || '[]');
    const event = events[eventIndex];
    
    if (!event.financial) {
        event.financial = { initialValue: 0, expenses: [], changes: [] };
    }
    
    if (!event.financial.changes) {
        event.financial.changes = [];
    }
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    const change = {
        id: Date.now(),
        userId: currentUser.email,
        userName: currentUser.name,
        userRole: currentUser.role,
        description,
        justification,
        timestamp: new Date().toISOString()
    };
    
    event.financial.changes.push(change);
    events[eventIndex] = event;
    localStorage.setItem('events', JSON.stringify(events));
}

/**
 * Carrega histórico de alterações
 */
function loadChangeHistory(changes) {
    const container = document.getElementById('changesList');
    
    if (!changes || changes.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--gray);">Nenhuma alteração registrada.</p>';
        return;
    }
    
    // Ordenar por data (mais recente primeiro)
    const sortedChanges = [...changes].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    container.innerHTML = sortedChanges.map(change => `
        <div class="change-item">
            <div class="change-header">
                <span class="change-user">
                    <i class="fas fa-user"></i> ${change.userName} (${translateRole(change.userRole)})
                </span>
                <span class="change-date">
                    ${new Date(change.timestamp).toLocaleString('pt-BR')}
                </span>
            </div>
            <div class="change-description">${change.description}</div>
            <div class="change-justification">
                <i class="fas fa-comment"></i> ${change.justification}
            </div>
        </div>
    `).join('');
}

/**
 * Traduz role
 */
function translateRole(role) {
    const roles = {
        'admin': 'Administrador',
        'treasurer': 'Tesoureiro',
        'user': 'Usuário'
    };
    return roles[role] || role;
}

/**
 * Formata valor monetário
 */
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

/**
 * Abre modal
 */
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

/**
 * Fecha modal
 */
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Inicializar quando a página carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadFinanceiro);
} else {
    loadFinanceiro();
}

// Exportar funções globalmente para uso inline
window.editExpense = editExpense;
window.deleteExpense = deleteExpense;
