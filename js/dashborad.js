function loadDashboard() {
    // Atualizar estatísticas
    updateStats();
    
    // Configurar gráficos
    setupCharts();
}

function updateStats() {
    const statsGrid = document.getElementById('statsGrid');
    
    // Calcular totais
    const totalEvents = events.length;
    const totalUsers = users.length;
    
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
        <div class="stat-card events">
            <i class="fas fa-calendar-alt fa-2x" style="color: var(--primary);"></i>
            <div class="stat-value">${totalEvents}</div>
            <div class="stat-label">Eventos Ativos</div>
        </div>
        <div class="stat-card users">
            <i class="fas fa-users fa-2x" style="color: var(--success);"></i>
            <div class="stat-value">${totalUsers}</div>
            <div class="stat-label">Usuários</div>
        </div>
        <div class="stat-card comments">
            <i class="fas fa-comments fa-2x" style="color: var(--info);"></i>
            <div class="stat-value">${totalComments}</div>
            <div class="stat-label">Comentários</div>
        </div>
        <div class="stat-card rating">
            <i class="fas fa-star fa-2x" style="color: var(--warning);"></i>
            <div class="stat-value">${avgRating}</div>
            <div class="stat-label">Avaliação Média</div>
        </div>
    `;
}

function setupCharts() {
    // Dados para os gráficos
    const sentimentData = {
        positive: 0,
        neutral: 0,
        negative: 0
    };
    
    const topicsData = {
        location: 0,
        price: 0,
        organization: 0,
        content: 0,
        service: 0
    };
    
    // Analisar comentários
    events.forEach(event => {
        event.ratings.forEach(rating => {
            // Análise de sentimento baseada na avaliação
            if (rating.rating >= 4) sentimentData.positive++;
            else if (rating.rating >= 3) sentimentData.neutral++;
            else sentimentData.negative++;
            
            // Análise de tópicos (baseado em palavras-chave no comentário)
            const comment = rating.comment.toLowerCase();
            if (comment.includes('local') || comment.includes('lugar') || comment.includes('localização')) topicsData.location++;
            if (comment.includes('preço') || comment.includes('valor') || comment.includes('custo')) topicsData.price++;
            if (comment.includes('organização') || comment.includes('organizado') || comment.includes('estrutura')) topicsData.organization++;
            if (comment.includes('conteúdo') || comment.includes('conteudo') || comment.includes('informação')) topicsData.content++;
            if (comment.includes('atendimento') || comment.includes('serviço') || comment.includes('suporte')) topicsData.service++;
        });
    });
    
    // Gráfico de sentimento
    const sentimentCtx = document.getElementById('sentimentChart').getContext('2d');
    if (window.sentimentChart) window.sentimentChart.destroy();
    
    window.sentimentChart = new Chart(sentimentCtx, {
        type: 'doughnut',
        data: {
            labels: ['Positivo', 'Neutro', 'Negativo'],
            datasets: [{
                data: [sentimentData.positive, sentimentData.neutral, sentimentData.negative],
                backgroundColor: [
                    '#4cc9f0',
                    '#4361ee',
                    '#f72585'
                ],
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
                    text: 'Distribuição de Sentimentos nos Comentários'
                }
            }
        }
    });
    
    // Gráfico de tópicos
    const topicsCtx = document.getElementById('topicsChart').getContext('2d');
    if (window.topicsChart) window.topicsChart.destroy();
    
    window.topicsChart = new Chart(topicsCtx, {
        type: 'bar',
        data: {
            labels: ['Localização', 'Preço', 'Organização', 'Conteúdo', 'Atendimento'],
            datasets: [{
                label: 'Número de Menções',
                data: [
                    topicsData.location,
                    topicsData.price,
                    topicsData.organization,
                    topicsData.content,
                    topicsData.service
                ],
                backgroundColor: '#4361ee',
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
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
    
    // Configurar abas dos gráficos
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            // Remover classe active de todas as abas e conteúdos
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // Adicionar classe active à aba clicada e conteúdo correspondente
            tab.classList.add('active');
            const tabId = tab.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
}
