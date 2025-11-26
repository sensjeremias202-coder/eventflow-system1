/**
 * ============================================
 * SISTEMA DE EXPORTAÇÃO DE DADOS
 * ============================================
 * Exportar eventos e relatórios em PDF e Excel
 */

// Exportar eventos para Excel (CSV)
function exportEventsToExcel() {
    if (events.length === 0) {
        showNotification('Nenhum evento para exportar', 'warning');
        return;
    }
    
    // Cabeçalhos
    const headers = ['ID', 'Título', 'Data', 'Horário', 'Local', 'Categoria', 'Descrição', 'Inscritos', 'Avaliação Média', 'Total Avaliações'];
    
    // Dados
    const rows = events.map(event => {
        const category = categories.find(c => c.id === event.category);
        const avgRating = event.ratings && event.ratings.length > 0
            ? (event.ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / event.ratings.length).toFixed(1)
            : 'N/A';
        
        return [
            event.id,
            event.title,
            new Date(event.date).toLocaleDateString('pt-BR'),
            new Date(event.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            event.location || 'N/A',
            category ? category.name : 'Sem categoria',
            event.description.replace(/[\n\r]/g, ' ').substring(0, 100),
            event.attendees ? event.attendees.length : 0,
            avgRating,
            event.ratings ? event.ratings.length : 0
        ];
    });
    
    // Criar CSV
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // Download
    downloadFile(csvContent, `eventos_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv;charset=utf-8;');
    
    showNotification(`${events.length} eventos exportados com sucesso!`, 'success');
    
    // Criar notificação
    if (typeof createNotification === 'function') {
        createNotification('system', '📊 Exportação Concluída', `${events.length} eventos foram exportados para Excel`);
    }
}

// Exportar usuários para Excel
function exportUsersToExcel() {
    if (users.length === 0) {
        showNotification('Nenhum usuário para exportar', 'warning');
        return;
    }
    
    const headers = ['ID', 'Nome', 'Email', 'Tipo', 'Data de Cadastro'];
    
    const rows = users.map(user => [
        user.id,
        user.name,
        user.email,
        user.role === 'admin' ? 'Administrador' : 'Usuário',
        user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : 'N/A'
    ]);
    
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    downloadFile(csvContent, `usuarios_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv;charset=utf-8;');
    
    showNotification(`${users.length} usuários exportados com sucesso!`, 'success');
}

// Exportar relatório completo em PDF (HTML para impressão)
function exportReportToPDF() {
    // Calcular estatísticas
    const totalEvents = events.length;
    const totalUsers = users.length;
    const activeEvents = events.filter(e => new Date(e.date) >= new Date()).length;
    
    let totalRatings = 0;
    let ratingSum = 0;
    events.forEach(event => {
        if (event.ratings && event.ratings.length > 0) {
            totalRatings += event.ratings.length;
            ratingSum += event.ratings.reduce((sum, r) => sum + (r.rating || 0), 0);
        }
    });
    const avgRating = totalRatings > 0 ? (ratingSum / totalRatings).toFixed(1) : 'N/A';
    
    // Eventos por categoria
    const eventsByCategory = {};
    categories.forEach(cat => {
        eventsByCategory[cat.name] = events.filter(e => e.category === cat.id).length;
    });
    
    // Criar HTML para impressão
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Relatório EventFlow - ${new Date().toLocaleDateString('pt-BR')}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    padding: 40px;
                    color: #333;
                }
                .header {
                    text-align: center;
                    margin-bottom: 40px;
                    border-bottom: 3px solid #6C63FF;
                    padding-bottom: 20px;
                }
                .header h1 {
                    color: #6C63FF;
                    margin: 0;
                }
                .header p {
                    color: #666;
                    margin: 10px 0 0 0;
                }
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 20px;
                    margin: 30px 0;
                }
                .stat-box {
                    border: 2px solid #6C63FF;
                    padding: 20px;
                    text-align: center;
                    border-radius: 8px;
                }
                .stat-value {
                    font-size: 36px;
                    font-weight: bold;
                    color: #6C63FF;
                }
                .stat-label {
                    font-size: 14px;
                    color: #666;
                    margin-top: 10px;
                }
                .section {
                    margin: 40px 0;
                }
                .section h2 {
                    color: #6C63FF;
                    border-bottom: 2px solid #6C63FF;
                    padding-bottom: 10px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 12px;
                    text-align: left;
                }
                th {
                    background-color: #6C63FF;
                    color: white;
                }
                tr:nth-child(even) {
                    background-color: #f2f2f2;
                }
                .footer {
                    margin-top: 60px;
                    text-align: center;
                    color: #999;
                    border-top: 1px solid #ddd;
                    padding-top: 20px;
                }
                @media print {
                    body { padding: 20px; }
                    .stats-grid { grid-template-columns: repeat(2, 1fr); }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>📅 EventFlow System</h1>
                <p>Relatório Completo - ${new Date().toLocaleDateString('pt-BR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                })}</p>
            </div>
            
            <div class="stats-grid">
                <div class="stat-box">
                    <div class="stat-value">${totalEvents}</div>
                    <div class="stat-label">Total de Eventos</div>
                </div>
                <div class="stat-box">
                    <div class="stat-value">${activeEvents}</div>
                    <div class="stat-label">Eventos Ativos</div>
                </div>
                <div class="stat-box">
                    <div class="stat-value">${totalUsers}</div>
                    <div class="stat-label">Usuários Cadastrados</div>
                </div>
                <div class="stat-box">
                    <div class="stat-value">${avgRating}</div>
                    <div class="stat-label">Avaliação Média</div>
                </div>
            </div>
            
            <div class="section">
                <h2>Eventos por Categoria</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Categoria</th>
                            <th>Quantidade de Eventos</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(eventsByCategory).map(([cat, count]) => `
                            <tr>
                                <td>${cat}</td>
                                <td>${count}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="section">
                <h2>Próximos Eventos</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Título</th>
                            <th>Data</th>
                            <th>Local</th>
                            <th>Categoria</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${events
                            .filter(e => new Date(e.date) >= new Date())
                            .sort((a, b) => new Date(a.date) - new Date(b.date))
                            .slice(0, 10)
                            .map(event => {
                                const category = categories.find(c => c.id === event.category);
                                return `
                                    <tr>
                                        <td>${event.title}</td>
                                        <td>${new Date(event.date).toLocaleDateString('pt-BR')} às ${new Date(event.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</td>
                                        <td>${event.location || 'N/A'}</td>
                                        <td>${category ? category.name : 'N/A'}</td>
                                    </tr>
                                `;
                            }).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="footer">
                <p>Relatório gerado automaticamente pelo EventFlow System</p>
                <p>${new Date().toLocaleString('pt-BR')}</p>
            </div>
            
            <script>
                window.onload = function() {
                    window.print();
                };
            </script>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    
    showNotification('Relatório gerado! Use Ctrl+P para salvar como PDF', 'success');
}

// Função auxiliar para download de arquivo
function downloadFile(content, filename, mimeType) {
    const blob = new Blob(['\ufeff' + content], { type: mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}

// Exportar evento específico com detalhes
function exportEventDetails(eventId) {
    const event = events.find(e => e.id === eventId);
    if (!event) return;
    
    const category = categories.find(c => c.id === event.category);
    const creator = users.find(u => u.id === event.createdBy);
    
    const content = `
DETALHES DO EVENTO
==================

Título: ${event.title}
ID: ${event.id}
Data: ${new Date(event.date).toLocaleString('pt-BR')}
Local: ${event.location || 'Não especificado'}
Categoria: ${category ? category.name : 'Sem categoria'}
Criado por: ${creator ? creator.name : 'Desconhecido'}

Descrição:
${event.description}

Inscritos: ${event.attendees ? event.attendees.length : 0}
${event.attendees && event.attendees.length > 0 ? '\nLista de Inscritos:\n' + event.attendees.map((id, i) => {
    const user = users.find(u => u.id === id);
    return `${i + 1}. ${user ? user.name : 'Usuário desconhecido'}`;
}).join('\n') : ''}

Avaliações: ${event.ratings ? event.ratings.length : 0}
${event.ratings && event.ratings.length > 0 ? '\nComentários:\n' + event.ratings.map((rating, i) => {
    const user = users.find(u => u.id === rating.userId);
    return `\n${i + 1}. ${user ? user.name : 'Anônimo'} - ${rating.rating}⭐\n   "${rating.comment || 'Sem comentário'}"`;
}).join('\n') : ''}

---
Exportado em: ${new Date().toLocaleString('pt-BR')}
    `.trim();
    
    downloadFile(content, `evento_${event.id}_${new Date().toISOString().split('T')[0]}.txt`, 'text/plain;charset=utf-8');
    
    showNotification('Detalhes do evento exportados!', 'success');
}
