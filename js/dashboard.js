// ============================================
// SISTEMA DE DASHBOARD
// ============================================

// Carregar dashboard
function loadDashboard() {
    console.log('[dashboard] 📊 Carregando dashboard...');
    
    // Verificar permissão
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'treasurer')) {
        console.error('[dashboard] ❌ Acesso negado');
        showNotification('Acesso negado ao dashboard', 'error');
        return;
    }
    
    loadDashboardStats();
    loadDashboardCharts();
    
    console.log('[dashboard] ✅ Dashboard carregado');
}

// Carregar estatísticas
function loadDashboardStats() {
    const statsGrid = document.getElementById('statsGrid');
    if (!statsGrid) return;
    
    // Calcular estatísticas
    const totalEvents = events ? events.length : 0;
    const activeEvents = events ? events.filter(e => new Date(e.date) >= new Date()).length : 0;
    const totalUsers = users ? users.length : 0;
    const totalEnrollments = events ? events.reduce((sum, e) => sum + (e.enrolled ? e.enrolled.length : 0), 0) : 0;
    
    // Renderizar cards de estatísticas
    statsGrid.innerHTML = `
        <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <i class="fas fa-calendar-alt"></i>
            </div>
            <div class="stat-info">
                <div class="stat-value">${totalEvents}</div>
                <div class="stat-label">Total de Eventos</div>
            </div>
        </div>
        
        <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                <i class="fas fa-calendar-check"></i>
            </div>
            <div class="stat-info">
                <div class="stat-value">${activeEvents}</div>
                <div class="stat-label">Eventos Ativos</div>
            </div>
        </div>
        
        <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
                <i class="fas fa-users"></i>
            </div>
            <div class="stat-info">
                <div class="stat-value">${totalUsers}</div>
                <div class="stat-label">Usuários Cadastrados</div>
            </div>
        </div>
        
        <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
                <i class="fas fa-user-check"></i>
            </div>
            <div class="stat-info">
                <div class="stat-value">${totalEnrollments}</div>
                <div class="stat-label">Total de Inscrições</div>
            </div>
        </div>
    `;
}

// Carregar gráficos
function loadDashboardCharts() {
    // Configurar tabs
    setupDashboardTabs();
    
    // Gráfico de sentimento (exemplo)
    const sentimentCanvas = document.getElementById('sentimentChart');
    if (sentimentCanvas && typeof Chart !== 'undefined') {
        const ctx = sentimentCanvas.getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Positivo', 'Neutro', 'Negativo'],
                datasets: [{
                    data: [65, 25, 10],
                    backgroundColor: ['#43e97b', '#f5576c', '#ffa726']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
    
    // Gráfico de tópicos (exemplo)
    const topicsCanvas = document.getElementById('topicsChart');
    if (topicsCanvas && typeof Chart !== 'undefined') {
        const ctx = topicsCanvas.getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Louvor', 'Pregação', 'Jovens', 'Crianças', 'Oração'],
                datasets: [{
                    label: 'Comentários',
                    data: [45, 32, 28, 15, 20],
                    backgroundColor: '#667eea'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

// Configurar tabs do dashboard
function setupDashboardTabs() {
    const tabs = document.querySelectorAll('.tab[data-tab]');
    tabs.forEach(tab => {
        if (!tab.dataset.dashboardTabListener) {
            tab.dataset.dashboardTabListener = 'true';
            tab.addEventListener('click', function() {
                // Remover ativo de todas as tabs
                tabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                // Mostrar conteúdo correspondente
                const tabName = this.dataset.tab;
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                const targetContent = document.getElementById(tabName);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        }
    });
}

// Exportar funções globalmente
window.loadDashboard = loadDashboard;
window.loadDashboardStats = loadDashboardStats;
window.loadDashboardCharts = loadDashboardCharts;

console.log('[dashboard] ✅ Módulo de dashboard carregado');
