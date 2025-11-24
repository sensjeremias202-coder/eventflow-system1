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
        totalComments += event.ratings.length;
        event.ratings.forEach(rating => {
            totalRating += rating.rating;
            ratingCount++;
        });
    });
    
    const avgRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : '0.0';
    
    statsGrid.innerHTML = `
        <div class="stat-card events stats-card">
            <i class="fas fa-calendar-alt fa-2x" style="color: var(--primary);"></i>
            <div class="stat-value">${totalEvents}</div>
            <div class="stat-label">Total de Eventos</div>
            <div class="stat-subtitle">${activeEvents} ativos</div>
        </div>
        <div class="stat-card users stats-card">
            <i class="fas fa-users fa-2x" style="color: var(--success);"></i>
            <div class="stat-value">${totalUsers}</div>
            <div class="stat-label">Usuários Cadastrados</div>
            <div class="stat-subtitle">${users.filter(u => u.role === 'admin').length} administradores</div>
        </div>
        <div class="stat-card comments stats-card">
            <i class="fas fa-comments fa-2x" style="color: var(--info);"></i>
            <div class="stat-value">${totalComments}</div>
            <div class="stat-label">Comentários</div>
            <div class="stat-subtitle">${events.filter(e => e.ratings.length > 0).length} eventos com avaliações</div>
        </div>
        <div class="stat-card rating stats-card">
            <i class="fas fa-star fa-2x" style="color: var(--warning);"></i>
            <div class="stat-value">${avgRating}</div>
            <div class="stat-label">Avaliação Média</div>
            <div class="stat-subtitle">Baseado em ${ratingCount} avaliações</div>
        </div>
    `;
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
        event.ratings.forEach(rating => {
            // Análise de sentimento
            if (rating.rating >= 4) sentimentData.positive++;
            else if (rating.rating >= 3) sentimentData.neutral++;
            else sentimentData.negative++;
            
            // Análise de tópicos
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
        });
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
    
    // Destruir gráfico anterior se existir (verificações robustas)
    try {
        let existing = null;
        if (typeof Chart !== 'undefined' && typeof Chart.getChart === 'function') {
            existing = Chart.getChart(sentimentCtx);
        }
        // Fallback para variável global antiga
        if (!existing && window.sentimentChart) existing = window.sentimentChart;

        if (existing) {
            if (typeof existing.destroy === 'function') {
                existing.destroy();
            } else {
                console.warn('Existing sentiment chart has no destroy() method, clearing reference.');
                try { window.sentimentChart = null; } catch (_) {}
            }
        }
    } catch (e) {
        console.warn('Erro ao destruir sentimentChart existente:', e);
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
    
    try {
        let existing = null;
        if (typeof Chart !== 'undefined' && typeof Chart.getChart === 'function') {
            existing = Chart.getChart(topicsCtx);
        }
        if (!existing && window.topicsChart) existing = window.topicsChart;
        if (existing) {
            if (typeof existing.destroy === 'function') existing.destroy();
            else {
                console.warn('Existing topics chart has no destroy() method, clearing reference.');
                try { window.topicsChart = null; } catch(_) {}
            }
        }
    } catch (e) {
        console.warn('Erro ao destruir topicsChart existente:', e);
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
    
    try {
        let existing = null;
        if (typeof Chart !== 'undefined' && typeof Chart.getChart === 'function') {
            existing = Chart.getChart(categoryCtx);
        }
        if (!existing && window.categoryChart) existing = window.categoryChart;
        if (existing) {
            if (typeof existing.destroy === 'function') existing.destroy();
            else {
                console.warn('Existing category chart has no destroy() method, clearing reference.');
                try { window.categoryChart = null; } catch(_) {}
            }
        }
    } catch (e) {
        console.warn('Erro ao destruir categoryChart existente:', e);
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