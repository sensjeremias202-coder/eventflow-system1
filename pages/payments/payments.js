// Carregar transações
function loadTransactions() {
    const container = document.getElementById('transactions-list');
    if (!container || !window.paymentSystem) return;
    
    const transactions = window.paymentSystem.transactions.slice(-20);
    
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
    
    if (!window.paymentSystem) return;
    
    const report = window.paymentSystem.getFinancialReport(startDate, endDate);
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

// Carregar ao abrir a página
if (window.paymentSystem) {
    loadTransactions();
}

console.log('Página de pagamentos carregada');
