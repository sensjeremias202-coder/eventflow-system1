function loadEvents() {
    const eventsGrid = document.getElementById('eventsGrid');
    if (!eventsGrid) return;
    
    eventsGrid.innerHTML = '';
    
    // Ordenar eventos por data (mais recentes primeiro)
    const sortedEvents = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    if (sortedEvents.length === 0) {
        eventsGrid.innerHTML = `
            <div style="text-align: center; color: var(--gray); padding: 40px; grid-column: 1 / -1;">
                <i class="fas fa-calendar-plus fa-3x" style="margin-bottom: 20px;"></i>
                <p>Nenhum evento cadastrado ainda.</p>
                ${currentUser && currentUser.role === 'admin' ? 
                    '<p>Clique em "Adicionar Evento" para criar o primeiro evento!</p>' : 
                    '<p>Aguarde enquanto os administradores cadastram novos eventos.</p>'
                }
            </div>
        `;
        return;
    }
    
    // Esconder botão "Todos os Eventos" se existir
    const allEventsBtn = document.getElementById('allEventsBtn');
    if (allEventsBtn) {
        allEventsBtn.style.display = 'none';
    }
    
    // Mostrar botão "Meus Eventos" para usuários comuns
    const myEventsBtn = document.getElementById('myEventsBtn');
    if (myEventsBtn && currentUser && currentUser.role === 'user') {
        myEventsBtn.style.display = 'block';
    }
    
    sortedEvents.forEach(event => {
        createEventCard(event, eventsGrid);
    });
    
    // Configurar os botões
    setupEventButtons();
}

function createEventCard(event, container) {
    // Calcular avaliação média
    const avgRating = event.ratings.length > 0 
        ? (event.ratings.reduce((sum, r) => sum + r.rating, 0) / event.ratings.length).toFixed(1)
        : '0.0';
    
    // Encontrar categoria
    const category = categories.find(c => c.id === event.category);
    
    // Verificar se o usuário já avaliou este evento
    const userRating = currentUser ? event.ratings.find(r => r.userId === currentUser.id) : null;
    
    // Criar card do evento
    const eventCard = document.createElement('div');
    eventCard.className = 'event-card';
    eventCard.innerHTML = `
        <div class="event-image" style="background-color: ${category ? category.color : '#4361ee'};">
            <i class="${category ? category.icon : 'fas fa-calendar-alt'}"></i>
        </div>
        <div class="event-content">
            <h3 class="event-title">${event.title}</h3>
            <div class="event-meta">
                <div><i class="far fa-calendar"></i> ${formatDate(event.date)}</div>
                <div><i class="far fa-clock"></i> ${event.time}</div>
            </div>
            <div class="event-meta">
                <div><i class="fas fa-map-marker-alt"></i> ${event.location}</div>
            </div>
            <div class="event-meta">
                <span class="category-badge" style="background-color: ${category ? category.color : '#4361ee'};">
                    <i class="${category ? category.icon : 'fas fa-tag'}"></i> ${category ? category.name : 'Geral'}
                </span>
            </div>
            <p>${event.description.substring(0, 100)}${event.description.length > 100 ? '...' : ''}</p>
            <div class="event-actions">
                <div class="event-rating">
                    ${generateStarRating(avgRating)}
                    <span>${avgRating} (${event.ratings.length})</span>
                </div>
                <div>
                    <button class="btn btn-outline btn-sm view-event" data-id="${event.id}">
                        <i class="far fa-eye"></i> Ver
                    </button>
                    ${currentUser && currentUser.role === 'admin' ? `
                        <button class="btn btn-outline btn-sm edit-event" data-id="${event.id}">
                            <i class="far fa-edit"></i>
                        </button>
                        <button class="btn btn-outline btn-sm delete-event" data-id="${event.id}">
                            <i class="far fa-trash-alt"></i>
                        </button>
                    ` : ''}
                    ${currentUser && currentUser.role === 'user' && !userRating ? `
                        <button class="btn btn-primary btn-sm rate-event" data-id="${event.id}">
                            <i class="fas fa-star"></i> Avaliar
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
    
    container.appendChild(eventCard);
}

// ... (o restante do events.js permanece similar, mas com validações adicionadas)

function createEvent() {
    const title = document.getElementById('eventTitle').value;
    const date = document.getElementById('eventDate').value;
    const time = document.getElementById('eventTime').value;
    const location = document.getElementById('eventLocation').value;
    const description = document.getElementById('eventDescription').value;
    const category = parseInt(document.getElementById('eventCategory').value);
    
    const newEvent = {
        id: events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1,
        title,
        date,
        time,
        location,
        description,
        category,
        createdBy: currentUser.id,
        ratings: []
    };
    
    events.push(newEvent);
    saveData();
    
    showNotification('Evento criado com sucesso!', 'success');
    document.getElementById('addEventModal').classList.remove('active');
    document.getElementById('addEventForm').reset();
    loadEvents();
}