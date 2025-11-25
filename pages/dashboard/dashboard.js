function loadDashboard() {
    // Atualizar estatísticas em tempo real
    updateStats();
    
    // Configurar gráficos
    setupCharts();
    
    // Iniciar atualização automática
    startDashboardAutoUpdate();
}

function updateStats() {
    const statsGrid = document.getElementById('statsGrid');
    if (!statsGrid) return;
    
    // Calcular totais
    const totalEvents = events.length;
    const totalUsers = users.length;
    const activeEvents = events.filter(event => new Date(event.date) >= new Date()).length;
    
    let totalComments = 0;
    let totalRating = 0;
    let ratingCount = 0;
    
    events.forEach(event => {
        // Verificar se ratings existe e é um array
        if (event.ratings && Array.isArray(event.ratings)) {
            totalComments += event.ratings.length;
            event.ratings.forEach(rating => {
                if (rating && rating.rating) {
                    totalRating += rating.rating;
                    ratingCount++;
                }
            });
        }
    });
    
    const avgRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : '0.0';
    
    statsGrid.innerHTML = `
        <div class="stat-card events stats-card clickable-stat" data-page="events">
            <i class="fas fa-calendar-alt fa-2x" style="color: var(--primary);"></i>
            <div class="stat-value">${totalEvents}</div>
            <div class="stat-label">Total de Eventos</div>
            <div class="stat-subtitle">${activeEvents} ativos</div>
            <div class="stat-action">
                <i class="fas fa-arrow-right"></i> Ver Eventos
            </div>
        </div>
        <div class="stat-card users stats-card clickable-stat" data-page="users">
            <i class="fas fa-users fa-2x" style="color: var(--success);"></i>
            <div class="stat-value">${totalUsers}</div>
            <div class="stat-label">Usuários Cadastrados</div>
            <div class="stat-subtitle">${users.filter(u => u.role === 'admin').length} administradores</div>
            <div class="stat-action">
                <i class="fas fa-arrow-right"></i> Ver Usuários
            </div>
        </div>
        <div class="stat-card comments stats-card clickable-stat" data-page="events">
            <i class="fas fa-comments fa-2x" style="color: var(--info);"></i>
            <div class="stat-value">${totalComments}</div>
            <div class="stat-label">Comentários</div>
            <div class="stat-subtitle">${events.filter(e => e.ratings && e.ratings.length > 0).length} eventos com avaliações</div>
            <div class="stat-action">
                <i class="fas fa-arrow-right"></i> Ver Eventos
            </div>
        </div>
        <div class="stat-card rating stats-card clickable-stat" data-page="events">
            <i class="fas fa-star fa-2x" style="color: var(--warning);"></i>
            <div class="stat-value">${avgRating}</div>
            <div class="stat-label">Avaliação Média</div>
            <div class="stat-subtitle">Baseado em ${ratingCount} avaliações</div>
            <div class="stat-action">
                <i class="fas fa-arrow-right"></i> Ver Eventos
            </div>
        </div>
    `;
    
    // Adicionar event listeners aos cards clicáveis
    setupStatCardListeners();
}

function setupStatCardListeners() {
    document.querySelectorAll('.clickable-stat').forEach(card => {
        card.addEventListener('click', function() {
            const pageName = this.getAttribute('data-page');
            if (pageName && typeof showModularPage === 'function') {
                showModularPage(pageName);
            }
        });
    });
}

function setupCharts() {
    // Dados para os gráficos - análise em tempo real
    const chartData = analyzeEventData();
    
    // Gráfico de sentimento
    setupSentimentChart(chartData.sentiment);
    
    // Gráfico de tópicos
    setupTopicsChart(chartData.topics);
    
    // Gráfico de eventos por categoria
    setupCategoryChart(chartData.categories);
}

function analyzeEventData() {
    const sentimentData = { positive: 0, neutral: 0, negative: 0 };
    const topicsData = {
        location: 0, price: 0, organization: 0, content: 0, service: 0,
        quality: 0, experience: 0, recommendation: 0
    };
    const categoryData = {};
    
    // Inicializar categorias
    categories.forEach(cat => {
        categoryData[cat.name] = 0;
    });
    
    // Analisar eventos e comentários
    events.forEach(event => {
        // Contar por categoria
        const category = categories.find(c => c.id === event.category);
        if (category) {
            categoryData[category.name] = (categoryData[category.name] || 0) + 1;
        }
        
        // Analisar comentários
        if (event.ratings && Array.isArray(event.ratings)) {
            event.ratings.forEach(rating => {
                if (!rating || !rating.rating) return;
                
                // Análise de sentimento
                if (rating.rating >= 4) sentimentData.positive++;
                else if (rating.rating >= 3) sentimentData.neutral++;
                else sentimentData.negative++;
                
                // Análise de tópicos (apenas se houver comentário)
                if (rating.comment) {
                    const comment = rating.comment.toLowerCase();
                    const topics = {
                        location: ['local', 'lugar', 'localização', 'endereço', 'acesso'],
                        price: ['preço', 'valor', 'custo', 'caro', 'barato', 'gratuito'],
                        organization: ['organização', 'organizado', 'estrutura', 'logística'],
                        content: ['conteúdo', 'conteudo', 'informação', 'aprendizado', 'conhecimento'],
                        service: ['atendimento', 'serviço', 'suporte', 'equipe', 'staff'],
                        quality: ['qualidade', 'excelente', 'ótimo', 'bom', 'ruim', 'péssimo'],
                        experience: ['experiência', 'experiencia', 'vivencia', 'momentos'],
                        recommendation: ['recomendo', 'indicaria', 'voltaría', 'repetiría']
                    };
                    
                    Object.keys(topics).forEach(topic => {
                        if (topics[topic].some(word => comment.includes(word))) {
                            topicsData[topic]++;
                        }
                    });
                }
            });
        }
    });
    
    return {
        sentiment: sentimentData,
        topics: topicsData,
        categories: categoryData
    };
}

function setupSentimentChart(sentimentData) {
    const sentimentCtx = document.getElementById('sentimentChart');
    if (!sentimentCtx) return;
    
    // Destruir gráfico anterior se existir
    if (window.sentimentChart && typeof window.sentimentChart.destroy === 'function') {
        window.sentimentChart.destroy();
        window.sentimentChart = null;
    }
    
    // Também verificar Chart.js v3+ getChart
    if (typeof Chart !== 'undefined' && typeof Chart.getChart === 'function') {
        const existing = Chart.getChart(sentimentCtx);
        if (existing) {
            existing.destroy();
        }
    }
    
    const total = sentimentData.positive + sentimentData.neutral + sentimentData.negative;
    
    window.sentimentChart = new Chart(sentimentCtx, {
        type: 'doughnut',
        data: {
            labels: [
                `Positivo (${sentimentData.positive})`, 
                `Neutro (${sentimentData.neutral})`, 
                `Negativo (${sentimentData.negative})`
            ],
            datasets: [{
                data: [sentimentData.positive, sentimentData.neutral, sentimentData.negative],
                backgroundColor: ['#4cc9f0', '#4361ee', '#f72585'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                title: {
                    display: true,
                    text: `Análise de Sentimento - ${total} comentários`
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${context.label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function setupTopicsChart(topicsData) {
    const topicsCtx = document.getElementById('topicsChart');
    if (!topicsCtx) return;
    
    // Destruir gráfico anterior se existir
    if (window.topicsChart && typeof window.topicsChart.destroy === 'function') {
        window.topicsChart.destroy();
        window.topicsChart = null;
    }
    
    // Também verificar Chart.js v3+ getChart
    if (typeof Chart !== 'undefined' && typeof Chart.getChart === 'function') {
        const existing = Chart.getChart(topicsCtx);
        if (existing) {
            existing.destroy();
        }
    }
    
    // Ordenar tópicos por frequência
    const sortedTopics = Object.entries(topicsData)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 6); // Top 6 tópicos
    
    window.topicsChart = new Chart(topicsCtx, {
        type: 'bar',
        data: {
            labels: sortedTopics.map(([topic]) => {
                const topicNames = {
                    location: 'Localização',
                    price: 'Preço',
                    organization: 'Organização',
                    content: 'Conteúdo',
                    service: 'Atendimento',
                    quality: 'Qualidade',
                    experience: 'Experiência',
                    recommendation: 'Recomendação'
                };
                return topicNames[topic] || topic;
            }),
            datasets: [{
                label: 'Menções nos Comentários',
                data: sortedTopics.map(([,count]) => count),
                backgroundColor: '#4361ee',
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Número de Menções'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Tópicos Mais Comentados'
                }
            }
        }
    });
}

function setupCategoryChart(categoryData) {
    // Criar canvas para gráfico de categorias se não existir
    let categoryCtx = document.getElementById('categoryChart');
    if (!categoryCtx) {
        const chartContainer = document.querySelector('.tab-content#topics');
        if (chartContainer) {
            const newCanvas = document.createElement('canvas');
            newCanvas.id = 'categoryChart';
            newCanvas.height = 300;
            chartContainer.appendChild(newCanvas);
            categoryCtx = newCanvas;
        }
    }
    
    if (!categoryCtx) return;
    
    // Destruir gráfico anterior se existir
    if (window.categoryChart && typeof window.categoryChart.destroy === 'function') {
        window.categoryChart.destroy();
        window.categoryChart = null;
    }
    
    // Também verificar Chart.js v3+ getChart
    if (typeof Chart !== 'undefined' && typeof Chart.getChart === 'function') {
        const existing = Chart.getChart(categoryCtx);
        if (existing) {
            existing.destroy();
        }
    }
    
    const sortedCategories = Object.entries(categoryData)
        .filter(([, count]) => count > 0)
        .sort(([,a], [,b]) => b - a);
    
    // Gerar cores para as categorias
    const backgroundColors = sortedCategories.map(([category], index) => {
        const categoryObj = categories.find(c => c.name === category);
        return categoryObj ? categoryObj.color : 
               `hsl(${(index * 360) / sortedCategories.length}, 70%, 60%)`;
    });
    
    window.categoryChart = new Chart(categoryCtx, {
        type: 'pie',
        data: {
            labels: sortedCategories.map(([category]) => category),
            datasets: [{
                data: sortedCategories.map(([,count]) => count),
                backgroundColor: backgroundColors,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                title: {
                    display: true,
                    text: 'Distribuição de Eventos por Categoria'
                }
            }
        }
    });
}

function startDashboardAutoUpdate() {
    // Atualizar dashboard a cada 30 segundos
    setInterval(() => {
        if (document.getElementById('dashboard-page').classList.contains('active')) {
            updateStats();
            setupCharts();
        }
    }, 30000);
}

// Configurar abas dos gráficos
function setupChartTabs() {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            // Remover classe active de todas as abas e conteúdos
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // Adicionar classe active à aba clicada e conteúdo correspondente
            tab.classList.add('active');
            const tabId = tab.getAttribute('data-tab');
            const tabContent = document.getElementById(tabId);
            if (tabContent) {
                tabContent.classList.add('active');
                
                // Recriar gráfico quando a aba for ativada
                setTimeout(() => {
                    if (tabId === 'sentiment') {
                        setupCharts();
                    }
                }, 100);
            }
        });
    });
}

// Inicializar tabs quando o dashboard carregar
document.addEventListener('DOMContentLoaded', function() {
    setupChartTabs();
});

// NOTE: diagnostic helper removed to reduce console noise in production.

// Helper para obter instância de Chart compatível com v2/v3+
function getChartInstance(canvas, globalName) {
    try {
        // 1) Chart.js v3+: Chart.getChart
        if (typeof Chart !== 'undefined' && typeof Chart.getChart === 'function' && canvas) {
            try {
                const inst = Chart.getChart(canvas);
                if (inst) return inst;
            } catch (e) {
                // ignorar
            }
        }

        // 2) global name fallback (window.sentimentChart etc.)
        if (globalName && window[globalName]) {
            const candidate = window[globalName];
            if (candidate && typeof candidate === 'object') return candidate;
        }

        // 3) Chart.js v2: Chart.instances
        if (typeof Chart !== 'undefined' && Chart.instances) {
            for (const k in Chart.instances) {
                if (!Object.prototype.hasOwnProperty.call(Chart.instances, k)) continue;
                const inst = Chart.instances[k];
                try {
                    if (inst && inst.canvas && canvas && (inst.canvas === canvas || inst.canvas.id === canvas.id)) return inst;
                } catch (e) {
                    // ignore
                }
            }
        }

        return null;
    } catch (e) {
        console.warn('getChartInstance error', e);
        return null;
    }
}