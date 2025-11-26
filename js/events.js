// ============================================
// SISTEMA DE GERENCIAMENTO DE EVENTOS
// ============================================

// Inicializar página de eventos
function initEventsPage() {
    console.log('[events] 🎉 Inicializando página de eventos...');
    loadEvents();
    loadCategoryOptions();
    setupEventHandlers();
    console.log('[events] ✅ Página de eventos inicializada');
}

// Carregar eventos
function loadEvents() {
    console.log('[events] 📅 Carregando eventos...');
    
    const eventsGrid = document.getElementById('eventsGrid');
    if (!eventsGrid) {
        console.error('[events] ❌ Elemento eventsGrid não encontrado!');
        return;
    }
    
    // Verificar se há eventos
    if (!events || events.length === 0) {
        eventsGrid.innerHTML = '<p style="text-align: center; color: var(--gray); padding: 40px; grid-column: 1/-1;">Nenhum evento cadastrado</p>';
        return;
    }
    
    // Renderizar eventos
    eventsGrid.innerHTML = events.map(event => {
        const eventDate = new Date(event.date);
        const today = new Date();
        const isUpcoming = eventDate >= today;
        const daysUntil = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
        
        return `
            <div class="event-card ${!isUpcoming ? 'past-event' : ''}" data-event-id="${event.id}">
                <div class="event-image" style="background-image: url('${event.image || 'https://via.placeholder.com/400x200?text=Evento'}')">
                    ${isUpcoming && daysUntil <= 7 ? `<span class="event-badge">Faltam ${daysUntil} dias</span>` : ''}
                    ${!isUpcoming ? '<span class="event-badge past">Encerrado</span>' : ''}
                </div>
                <div class="event-content">
                    <div class="event-header">
                        <h3>${event.name}</h3>
                        <span class="event-category ${event.category}">${getCategoryName(event.category)}</span>
                    </div>
                    <p class="event-description">${event.description}</p>
                    <div class="event-info">
                        <div class="event-info-item">
                            <i class="fas fa-calendar"></i>
                            <span>${formatDate(event.date)}</span>
                        </div>
                        <div class="event-info-item">
                            <i class="fas fa-clock"></i>
                            <span>${event.time}</span>
                        </div>
                        <div class="event-info-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${event.location}</span>
                        </div>
                        ${event.price ? `
                            <div class="event-info-item">
                                <i class="fas fa-ticket-alt"></i>
                                <span>R$ ${event.price}</span>
                            </div>
                        ` : ''}
                    </div>
                    <div class="event-stats">
                        <div class="stat">
                            <i class="fas fa-users"></i>
                            <span>${event.enrolled ? event.enrolled.length : 0} inscritos</span>
                        </div>
                        ${event.maxParticipants ? `
                            <div class="stat">
                                <i class="fas fa-user-check"></i>
                                <span>${event.maxParticipants} vagas</span>
                            </div>
                        ` : ''}
                    </div>
                    <div class="event-actions">
                        ${isUpcoming ? `
                            <button class="btn btn-primary" onclick="enrollInEvent('${event.id}')">
                                <i class="fas fa-user-plus"></i> Inscrever-se
                            </button>
                        ` : ''}
                        <button class="btn btn-outline" onclick="viewEventDetails('${event.id}')">
                            <i class="fas fa-eye"></i> Ver Detalhes
                        </button>
                        ${currentUser && currentUser.role === 'admin' ? `
                            <button class="btn btn-outline" onclick="editEvent('${event.id}')">
                                <i class="fas fa-edit"></i> Editar
                            </button>
                            <button class="btn btn-danger" onclick="deleteEvent('${event.id}')">
                                <i class="fas fa-trash"></i> Excluir
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    console.log('[events] ✅ Eventos carregados:', events.length);
}

// Carregar opções de categorias
function loadCategoryOptions() {
    const categorySelect = document.getElementById('eventCategory');
    if (!categorySelect || !categories) return;
    
    categorySelect.innerHTML = '<option value="">Selecione uma categoria</option>' +
        categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('');
}

// Obter nome da categoria
function getCategoryName(categoryId) {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Sem categoria';
}

// Formatar data
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric' 
    });
}

// Inscrever em evento
function enrollInEvent(eventId) {
    if (!currentUser) {
        showNotification('Faça login para se inscrever', 'error');
        return;
    }
    
    const event = events.find(e => e.id === eventId);
    if (!event) return;
    
    // Verificar se já está inscrito
    if (event.enrolled && event.enrolled.includes(currentUser.id)) {
        showNotification('Você já está inscrito neste evento', 'info');
        return;
    }
    
    // Verificar vagas disponíveis
    if (event.maxParticipants && event.enrolled && event.enrolled.length >= event.maxParticipants) {
        showNotification('Evento lotado!', 'error');
        return;
    }
    
    // Inscrever usuário
    if (!event.enrolled) event.enrolled = [];
    event.enrolled.push(currentUser.id);
    
    // Salvar no localStorage
    localStorage.setItem('events', JSON.stringify(events));
    
    showNotification('Inscrição realizada com sucesso!', 'success');
    loadEvents();
}

// Ver detalhes do evento
function viewEventDetails(eventId) {
    const event = events.find(e => e.id === eventId);
    if (!event) return;
    
    showNotification(`Detalhes: ${event.name}`, 'info');
    // TODO: Implementar modal de detalhes
}

// Editar evento (admin)
function editEvent(eventId) {
    const event = events.find(e => e.id === eventId);
    if (!event) return;
    
    showNotification('Funcionalidade de edição em desenvolvimento', 'info');
    // TODO: Implementar modal de edição
}

// Deletar evento (admin)
async function deleteEvent(eventId) {
    const confirmed = await showConfirm(
        'Tem certeza que deseja excluir este evento?',
        'Confirmar Exclusão',
        { type: 'danger' }
    );
    
    if (!confirmed) return;
    
    const index = events.findIndex(e => e.id === eventId);
    if (index > -1) {
        events.splice(index, 1);
        localStorage.setItem('events', JSON.stringify(events));
        showNotification('Evento excluído com sucesso!', 'success');
        loadEvents();
    }
}

// Configurar event handlers
function setupEventHandlers() {
    // Botão de adicionar evento
    const addEventBtn = document.getElementById('addEventBtn');
    if (addEventBtn) {
        addEventBtn.onclick = () => {
            showNotification('Modal de criação de evento em desenvolvimento', 'info');
        };
    }
    
    // Botão meus eventos
    const myEventsBtn = document.getElementById('myEventsBtn');
    if (myEventsBtn) {
        myEventsBtn.onclick = () => {
            showNotification('Filtro "Meus Eventos" em desenvolvimento', 'info');
        };
    }
}

// Exportar funções globalmente
window.initEventsPage = initEventsPage;
window.loadEvents = loadEvents;
window.loadCategoryOptions = loadCategoryOptions;
window.enrollInEvent = enrollInEvent;
window.viewEventDetails = viewEventDetails;
window.editEvent = editEvent;
window.deleteEvent = deleteEvent;

console.log('[events] ✅ Módulo de eventos carregado');
