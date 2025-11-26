/**
 * Inicialização da página de pagamentos
 */

function initPayments() {
    console.log('[payments-page] Inicializando página de pagamentos...');
    
    // Verificar se o sistema de pagamentos está disponível
    if (typeof PaymentSystem !== 'undefined') {
        // Criar instância se não existir
        if (!window.paymentInstance) {
            window.paymentInstance = new PaymentSystem();
            console.log('[payments-page] ✅ PaymentSystem instanciado');
        } else {
            // Recarregar transações se já existe
            if (window.paymentInstance.loadTransactions) {
                window.paymentInstance.loadTransactions();
            }
            console.log('[payments-page] ✅ Sistema de pagamentos recarregado');
        }
        
        // Carregar transações na interface
        loadTransactions();
    } else {
        console.error('[payments-page] ❌ PaymentSystem não encontrado!');
        showNotification('Erro ao carregar sistema de pagamentos', 'error');
    }
}

// Carregar transações
function loadTransactions() {
    const container = document.getElementById('transactions-list');
    if (!container) return;
    
    const paymentSystem = window.paymentInstance || window.paymentSystem;
    if (!paymentSystem) return;
    
    const transactions = paymentSystem.transactions.slice(-20);
    
    if (transactions.length === 0) {
        container.innerHTML = '<p class="text-muted">Nenhuma transação registrada</p>';
        return;
    }
    
    container.innerHTML = transactions.reverse().map(t => `
        <div class="transaction-item">
            <div>
                <strong>${t.id}</strong>
                <p>${new Date(t.createdAt).toLocaleString('pt-BR')}</p>
            </div>
            <div>R$ ${t.amount.toFixed(2)}</div>
            <div><span class="badge badge-${t.status === 'completed' ? 'success' : 'warning'}">${t.status}</span></div>
        </div>
    `).join('');
}

function generateFinancialReport() {
    const startDate = new Date(document.getElementById('startDate').value);
    const endDate = new Date(document.getElementById('endDate').value);
    
    const paymentSystem = window.paymentInstance || window.paymentSystem;
    if (!paymentSystem) return;
    
    const report = paymentSystem.getFinancialReport(startDate, endDate);
    const container = document.getElementById('financial-report');
    
    container.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <h3>${report.totalTransactions}</h3>
                <p>Transações</p>
            </div>
            <div class="stat-card">
                <h3>R$ ${report.totalRevenue.toFixed(2)}</h3>
                <p>Receita Total</p>
            </div>
        </div>
    `;
}

// Exportar funções globalmente
window.initPayments = initPayments;
window.loadTransactions = loadTransactions;
window.generateFinancialReport = generateFinancialReport;

console.log('[payments-page] ✅ Módulo de pagamentos carregado');
