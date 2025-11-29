/**
 * ============================================
 * GRAFICOS PAGE - Visualização de Dados Financeiros
 * ============================================
 */

console.log('[graficos] 📊 Módulo de gráficos carregado');

// Charts instances
let incomeExpensesChart = null;
let timelineChart = null;
let expensesDistributionChart = null;

/**
 * Carrega a página de gráficos
 */
function loadGraficos() {
    console.log('[graficos] Carregando página de gráficos...');
    
    // Verificar permissões
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'treasurer')) {
        alert('Você não tem permissão para acessar esta página!');
        return;
    }
    
    // Carregar eventos no select
    loadEventsListForChart();
    
    // Gerar opções de anos
    generateYearOptions();
    
    // Definir mês e ano atual
    const now = new Date();
    const monthEl = document.getElementById('selectMonth');
    const yearEl = document.getElementById('selectYear');
    if (!monthEl || !yearEl) {
        console.warn('[graficos] Elementos de filtro não encontrados (selectMonth/selectYear). Abortando init.');
        return;
    }
    monthEl.value = now.getMonth();
    yearEl.value = now.getFullYear();
    
    // Event listeners
    setupChartListeners();
    
    // Carregar gráficos iniciais
    updateCharts();
}

/**
 * Carrega lista de eventos
 */
function loadEventsListForChart() {
    const events = JSON.parse(localStorage.getItem('events') || '[]')
        .filter(e => e !== null && e !== undefined && typeof e === 'object');
    
    const selectEvent = document.getElementById('selectEventChart');
    if (!selectEvent) {
        console.warn('[graficos] selectEventChart não encontrado. Pulando lista de eventos.');
        return;
    }
    selectEvent.innerHTML = '<option value="">Todos os eventos</option>';
    
    events.forEach((event, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${event.title} - ${new Date(event.date).toLocaleDateString('pt-BR')}`;
        selectEvent.appendChild(option);
    });
}

/**
 * Gera opções de anos
 */
function generateYearOptions() {
    const currentYear = new Date().getFullYear();
    const selectYear = document.getElementById('selectYear');
    selectYear.innerHTML = '';
    
    for (let year = currentYear; year >= currentYear - 5; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        selectYear.appendChild(option);
    }
}

/**
 * Configura event listeners
 */
function setupChartListeners() {
    document.getElementById('chartType')?.addEventListener('change', function(e) {
        const type = e.target.value;
        
        document.getElementById('eventSelectorGroup').style.display = type === 'event' ? '' : 'none';
        document.getElementById('monthSelectorGroup').style.display = type === 'monthly' ? '' : 'none';
        document.getElementById('yearSelectorGroup').style.display = (type === 'monthly' || type === 'yearly') ? '' : 'none';
        
        updateCharts();
    });
    
    document.getElementById('selectEventChart')?.addEventListener('change', updateCharts);
    document.getElementById('selectMonth')?.addEventListener('change', updateCharts);
    document.getElementById('selectYear')?.addEventListener('change', updateCharts);
}

/**
 * Atualiza todos os gráficos
 */
function updateCharts() {
    const chartType = document.getElementById('chartType').value;
    const eventId = document.getElementById('selectEventChart').value;
    const month = parseInt(document.getElementById('selectMonth').value);
    const year = parseInt(document.getElementById('selectYear').value);
    
    let data = null;
    
    if (chartType === 'event') {
        data = getEventData(eventId);
    } else if (chartType === 'monthly') {
        data = getMonthlyData(month, year);
    } else if (chartType === 'yearly') {
        data = getYearlyData(year);
    }
    
    if (!data) return;
    
    // Atualizar cards de resumo
    updateStatsCards(data);
    
    // Atualizar gráficos
    renderIncomeExpensesChart(data);
    renderTimelineChart(data);
    renderExpensesDistributionChart(data);
}

/**
 * Obtém dados de um evento específico ou todos
 */
function getEventData(eventId) {
    const events = JSON.parse(localStorage.getItem('events') || '[]')
        .filter(e => e !== null && e !== undefined && typeof e === 'object');
    
    let targetEvents = eventId ? [events[eventId]] : events;
    targetEvents = targetEvents.filter(e => e && e.financial);
    
    const totalIncome = targetEvents.reduce((sum, e) => sum + (e.financial.initialValue || 0), 0);
    const allExpenses = targetEvents.flatMap(e => e.financial.expenses || []);
    const totalExpenses = allExpenses.reduce((sum, exp) => sum + parseFloat(exp.value), 0);
    
    return {
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses,
        eventsCount: targetEvents.length,
        expenses: allExpenses,
        events: targetEvents
    };
}

/**
 * Obtém dados mensais
 */
function getMonthlyData(month, year) {
    const events = JSON.parse(localStorage.getItem('events') || '[]')
        .filter(e => e !== null && e !== undefined && typeof e === 'object' && e.financial);
    
    const monthEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.getMonth() === month && eventDate.getFullYear() === year;
    });
    
    const totalIncome = monthEvents.reduce((sum, e) => sum + (e.financial.initialValue || 0), 0);
    const allExpenses = monthEvents.flatMap(e => e.financial.expenses || []);
    const totalExpenses = allExpenses.reduce((sum, exp) => sum + parseFloat(exp.value), 0);
    
    return {
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses,
        eventsCount: monthEvents.length,
        expenses: allExpenses,
        events: monthEvents
    };
}

/**
 * Obtém dados anuais
 */
function getYearlyData(year) {
    const events = JSON.parse(localStorage.getItem('events') || '[]')
        .filter(e => e !== null && e !== undefined && typeof e === 'object' && e.financial);
    
    const yearEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.getFullYear() === year;
    });
    
    const totalIncome = yearEvents.reduce((sum, e) => sum + (e.financial.initialValue || 0), 0);
    const allExpenses = yearEvents.flatMap(e => e.financial.expenses || []);
    const totalExpenses = allExpenses.reduce((sum, exp) => sum + parseFloat(exp.value), 0);
    
    return {
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses,
        eventsCount: yearEvents.length,
        expenses: allExpenses,
        events: yearEvents,
        monthlyData: getMonthlyBreakdown(yearEvents)
    };
}

/**
 * Obtém breakdown mensal
 */
function getMonthlyBreakdown(events) {
    const monthlyData = Array(12).fill(null).map(() => ({ income: 0, expenses: 0 }));
    
    events.forEach(event => {
        const month = new Date(event.date).getMonth();
        monthlyData[month].income += event.financial.initialValue || 0;
        
        const expenses = event.financial.expenses || [];
        expenses.forEach(exp => {
            monthlyData[month].expenses += parseFloat(exp.value);
        });
    });
    
    return monthlyData;
}

/**
 * Atualiza cards de resumo
 */
function updateStatsCards(data) {
    document.getElementById('totalIncome').textContent = formatCurrency(data.totalIncome);
    document.getElementById('totalExpenses').textContent = formatCurrency(data.totalExpenses);
    document.getElementById('totalBalance').textContent = formatCurrency(data.balance);
    document.getElementById('eventsCount').textContent = data.eventsCount;
    
    // Atualizar cores
    const balanceEl = document.getElementById('totalBalance');
    if (data.balance < 0) {
        balanceEl.style.color = '#ef4444';
    } else if (data.balance > 0) {
        balanceEl.style.color = '#10b981';
    } else {
        balanceEl.style.color = 'white';
    }
}

/**
 * Renderiza gráfico de Entrada vs Saída
 */
function renderIncomeExpensesChart(data) {
    const ctx = document.getElementById('incomeExpensesChart');
    
    if (incomeExpensesChart) {
        incomeExpensesChart.destroy();
    }
    
    incomeExpensesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Entrada', 'Saída', 'Saldo'],
            datasets: [{
                label: 'Valor (R$)',
                data: [data.totalIncome, data.totalExpenses, data.balance],
                backgroundColor: [
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    data.balance >= 0 ? 'rgba(59, 130, 246, 0.8)' : 'rgba(239, 68, 68, 0.8)'
                ],
                borderColor: [
                    'rgb(16, 185, 129)',
                    'rgb(239, 68, 68)',
                    data.balance >= 0 ? 'rgb(59, 130, 246)' : 'rgb(239, 68, 68)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return formatCurrency(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'R$ ' + value.toLocaleString('pt-BR');
                        }
                    }
                }
            }
        }
    });
}

/**
 * Renderiza gráfico de linha temporal
 */
function renderTimelineChart(data) {
    const ctx = document.getElementById('timelineChart');
    
    if (timelineChart) {
        timelineChart.destroy();
    }
    
    let labels, incomeData, expenseData;
    
    if (data.monthlyData) {
        // Dados anuais
        labels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        incomeData = data.monthlyData.map(m => m.income);
        expenseData = data.monthlyData.map(m => m.expenses);
    } else {
        // Dados por evento
        labels = data.events.map(e => e.title.substring(0, 15) + '...');
        incomeData = data.events.map(e => e.financial.initialValue || 0);
        expenseData = data.events.map(e => {
            const expenses = e.financial.expenses || [];
            return expenses.reduce((sum, exp) => sum + parseFloat(exp.value), 0);
        });
    }
    
    timelineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Entrada',
                    data: incomeData,
                    borderColor: 'rgb(16, 185, 129)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Saída',
                    data: expenseData,
                    borderColor: 'rgb(239, 68, 68)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + formatCurrency(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'R$ ' + value.toLocaleString('pt-BR');
                        }
                    }
                }
            }
        }
    });
}

/**
 * Renderiza gráfico de distribuição de gastos
 */
function renderExpensesDistributionChart(data) {
    const ctx = document.getElementById('expensesDistributionChart');
    
    if (expensesDistributionChart) {
        expensesDistributionChart.destroy();
    }
    
    // Agrupar gastos por descrição
    const expensesByCategory = {};
    data.expenses.forEach(exp => {
        const category = exp.description;
        if (!expensesByCategory[category]) {
            expensesByCategory[category] = 0;
        }
        expensesByCategory[category] += parseFloat(exp.value);
    });
    
    const labels = Object.keys(expensesByCategory);
    const values = Object.values(expensesByCategory);
    
    if (labels.length === 0) {
        ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
        return;
    }
    
    expensesDistributionChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: [
                    'rgba(108, 99, 255, 0.8)',
                    'rgba(255, 107, 157, 0.8)',
                    'rgba(255, 200, 55, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(168, 85, 247, 0.8)',
                    'rgba(236, 72, 153, 0.8)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = formatCurrency(context.parsed);
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
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

// Inicializar quando a página carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadGraficos);
} else {
    loadGraficos();
}
