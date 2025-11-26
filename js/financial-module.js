// Módulo Financeiro Completo
class FinancialModule {
    constructor() {
        this.transactions = [];
        this.budgets = [];
        this.init();
    }

    init() {
        this.loadData();
        this.renderDashboard();
    }

    loadData() {
        this.transactions = JSON.parse(localStorage.getItem('financial_transactions') || '[]');
        this.budgets = JSON.parse(localStorage.getItem('event_budgets') || '[]');
    }

    addTransaction(eventId, type, amount, category, description) {
        const transaction = {
            id: 'txn-' + Date.now(),
            eventId,
            type, // income, expense
            amount,
            category, // registration, donation, rental, food, etc
            description,
            date: new Date(),
            createdBy: JSON.parse(localStorage.getItem('currentUser') || '{}').id
        };

        this.transactions.push(transaction);
        this.saveTransactions();
        return transaction;
    }

    createBudget(eventId, categories) {
        const budget = {
            id: 'budget-' + Date.now(),
            eventId,
            categories, // [{name, planned, spent}]
            totalPlanned: categories.reduce((sum, c) => sum + c.planned, 0),
            totalSpent: 0,
            createdAt: new Date()
        };

        this.budgets.push(budget);
        this.saveBudgets();
        return budget;
    }

    renderDashboard() {
        const container = document.getElementById('financial-dashboard');
        if (!container) return;

        const totalIncome = this.transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const totalExpense = this.transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const profit = totalIncome - totalExpense;

        container.innerHTML = `
            <div class="financial-dashboard">
                <div class="financial-summary">
                    <div class="summary-card income">
                        <h3>R$ ${totalIncome.toFixed(2)}</h3>
                        <p>💰 Receitas</p>
                    </div>
                    <div class="summary-card expense">
                        <h3>R$ ${totalExpense.toFixed(2)}</h3>
                        <p>💸 Despesas</p>
                    </div>
                    <div class="summary-card profit ${profit >= 0 ? 'positive' : 'negative'}">
                        <h3>R$ ${profit.toFixed(2)}</h3>
                        <p>${profit >= 0 ? '📈' : '📉'} Lucro/Prejuízo</p>
                    </div>
                </div>
                <div class="financial-charts">
                    <canvas id="revenueChart"></canvas>
                    <canvas id="expenseChart"></canvas>
                </div>
                <div class="transactions-list">
                    <h3>Transações Recentes</h3>
                    ${this.renderTransactionsList()}
                </div>
            </div>
        `;
    }

    renderTransactionsList() {
        return this.transactions.slice(-10).reverse().map(t => `
            <div class="transaction-item ${t.type}">
                <span class="transaction-icon">${t.type === 'income' ? '↑' : '↓'}</span>
                <span class="transaction-desc">${t.description}</span>
                <span class="transaction-amount">R$ ${t.amount.toFixed(2)}</span>
            </div>
        `).join('');
    }

    generateReport(startDate, endDate) {
        const filtered = this.transactions.filter(t => {
            const date = new Date(t.date);
            return date >= startDate && date <= endDate;
        });

        return {
            period: { start: startDate, end: endDate },
            income: filtered.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
            expense: filtered.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
            byCategory: filtered.reduce((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + (t.type === 'income' ? t.amount : -t.amount);
                return acc;
            }, {})
        };
    }

    saveTransactions() {
        localStorage.setItem('financial_transactions', JSON.stringify(this.transactions));
    }

    saveBudgets() {
        localStorage.setItem('event_budgets', JSON.stringify(this.budgets));
    }
}

// Inicializar
let financialModule;
document.addEventListener('DOMContentLoaded', () => {
    financialModule = new FinancialModule();
    window.financialModule = financialModule;
});
