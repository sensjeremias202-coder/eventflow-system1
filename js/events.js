function loadEvents() {
    const eventsGrid = document.getElementById('eventsGrid');
    eventsGrid.innerHTML = '';
    
    // Ordenar eventos por data (mais recentes primeiro)
    const sortedEvents = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    if (sortedEvents.length === 0) {
        eventsGrid.innerHTML = '<p style="text-align: center; color: var(--gray); padding: 40px;">Nenhum evento cadastrado ainda.</p>';
        return;
    }
    
    sortedEvents.forEach(event => {
        // Calcular avaliação média
        const avgRating = event.ratings.length > 0 
            ? (event.ratings.reduce((sum, r) => sum + r.rating, 0) / event.ratings.length).toFixed(1)
            : '0.0';
        
        // Encontrar categoria
        const category = categories.find(c => c.id === event.category);
        
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
                        ${currentUser.role === 'admin' ? `
                            <button class="btn btn-outline btn-sm edit-event" data-id="${event.id}">
                                <i class="far fa-edit"></i>
                            </button>
                            <button class="btn btn-outline btn-sm delete-event" data-id="${event.id}">
                                <i class="far fa-trash-alt"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
        
        eventsGrid.appendChild(eventCard);
    });
    
    // Adicionar eventos aos botões
    document.querySelectorAll('.view-event').forEach(btn => {
        btn.addEventListener('click', function() {
            const eventId = parseInt(this.getAttribute('data-id'));
            showEventDetails(eventId);
        });
    });
    
    if (currentUser.role === 'admin') {
        document.querySelectorAll('.edit-event').forEach(btn => {
            btn.addEventListener('click', function() {
                const eventId = parseInt(this.getAttribute('data-id'));
                editEvent(eventId);
            });
        });
        
        document.querySelectorAll('.delete-event').forEach(btn => {
            btn.addEventListener('click', function() {
                const eventId = parseInt(this.getAttribute('data-id'));
                deleteEvent(eventId);
            });
        });
    }
}

function showEventDetails(eventId) {
    const event = events.find(e => e.id === eventId);
    if (!event) return;
    
    // Calcular avaliação média
    const avgRating = event.ratings.length > 0 
        ? (event.ratings.reduce((sum, r) => sum + r.rating, 0) / event.ratings.length).toFixed(1)
        : '0.0';
    
    // Encontrar categoria
    const category = categories.find(c => c.id === event.category);
    
    // Criador do evento
    const creator = users.find(u => u.id === event.createdBy);
    
    // Gerar HTML dos comentários
    let commentsHtml = '';
    event.ratings.forEach(rating => {
        const user = users.find(u => u.id === rating.userId);
        commentsHtml += `
            <div class="comment">
                <div class="comment-header">
                    <div class="comment-author">${user.name}</div>
                    <div class="comment-date">${formatDate(rating.date)}</div>
                </div>
                <div class="comment-rating">
                    ${generateStarRating(rating.rating)}
                </div>
                <div class="comment-text">${rating.comment}</div>
            </div>
        `;
    });
    
    // Preencher modal de detalhes
    document.getElementById('eventDetailsTitle').textContent = event.title;
    document.getElementById('eventDetailsContent').innerHTML = `
        <div class="event-meta" style="margin-bottom: 20px;">
            <div><i class="far fa-calendar"></i> ${formatDate(event.date)}</div>
            <div><i class="far fa-clock"></i> ${event.time}</div>
            <div><i class="fas fa-map-marker-alt"></i> ${event.location}</div>
            <div>
                <span class="category-badge" style="background-color: ${category ? category.color : '#4361ee'};">
                    <i class="${category ? category.icon : 'fas fa-tag'}"></i> ${category ? category.name : 'Geral'}
                </span>
            </div>
        </div>
        <p>${event.description}</p>
        
        <div style="margin: 20px 0;">
            <strong>Avaliação Média:</strong>
            <div class="event-rating" style="display: inline-block; margin-left: 10px;">
                ${generateStarRating(avgRating)}
                <span>${avgRating} (${event.ratings.length} avaliações)</span>
            </div>
        </div>
        
        <div style="margin: 20px 0;">
            <h4>Avaliações e Comentários</h4>
            ${event.ratings.length > 0 ? 
                `<div style="max-height: 300px; overflow-y: auto;">${commentsHtml}</div>` : 
                '<p>Nenhuma avaliação ainda.</p>'
            }
        </div>
        
        ${currentUser.role === 'user' ? `
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
                <h4>Deixe sua avaliação</h4>
                <form id="addRatingForm">
                    <div class="form-group">
                        <label class="form-label">Sua avaliação</label>
                        <div class="rating-stars" id="ratingStars">
                            <i class="fas fa-star rating-star" data-rating="1"></i>
                            <i class="fas fa-star rating-star" data-rating="2"></i>
                            <i class="fas fa-star rating-star" data-rating="3"></i>
                            <i class="fas fa-star rating-star" data-rating="4"></i>
                            <i class="fas fa-star rating-star" data-rating="5"></i>
                        </div>
                        <input type="hidden" id="selectedRating" value="0">
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="ratingComment">Seu comentário</label>
                        <textarea class="form-control" id="ratingComment" rows="3" placeholder="Deixe seu comentário sobre o evento"></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary">Enviar Avaliação</button>
                </form>
            </div>
        ` : ''}
    `;
    
    // Configurar estrelas de avaliação para usuários comuns
    if (currentUser.role === 'user') {
        setupRatingStars();
        
        document.getElementById('addRatingForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const rating = parseInt(document.getElementById('selectedRating').value);
            const comment = document.getElementById('ratingComment').value;
            
            if (rating === 0) {
                alert('Por favor, selecione uma avaliação com as estrelas.');
                return;
            }
            
            if (!comment.trim()) {
                alert('Por favor, digite um comentário.');
                return;
            }
            
            addRating(eventId, rating, comment);
        });
    }
    
    // Mostrar modal
    document.getElementById('eventDetailsModal').classList.add('active');
}

function setupRatingStars() {
    const stars = document.querySelectorAll('.rating-star');
    let selectedRating = 0;
    
    stars.forEach(star => {
        star.addEventListener('mouseover', function() {
            const rating = parseInt(this.getAttribute('data-rating'));
            highlightStars(rating);
        });
        
        star.addEventListener('mouseout', function() {
            highlightStars(selectedRating);
        });
        
        star.addEventListener('click', function() {
            selectedRating = parseInt(this.getAttribute('data-rating'));
            document.getElementById('selectedRating').value = selectedRating;
            highlightStars(selectedRating);
        });
    });
    
    function highlightStars(rating) {
        stars.forEach(star => {
            const starRating = parseInt(star.getAttribute('data-rating'));
            if (starRating <= rating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }
}

function addRating(eventId, rating, comment) {
    const event = events.find(e => e.id === eventId);
    if (!event) return;
    
    // Verificar se o usuário já avaliou este evento
    const existingRatingIndex = event.ratings.findIndex(r => r.userId === currentUser.id);
    
    if (existingRatingIndex !== -1) {
        // Atualizar avaliação existente
        event.ratings[existingRatingIndex].rating = rating;
        event.ratings[existingRatingIndex].comment = comment;
        event.ratings[existingRatingIndex].date = new Date().toISOString().split('T')[0];
    } else {
        // Adicionar nova avaliação
        event.ratings.push({
            userId: currentUser.id,
            rating,
            comment,
            date: new Date().toISOString().split('T')[0]
        });
    }
    
    saveData();
    alert('Avaliação enviada com sucesso!');
    document.getElementById('eventDetailsModal').classList.remove('active');
    loadEvents();
}

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
    
    alert('Evento criado com sucesso!');
    document.getElementById('addEventModal').classList.remove('active');
    document.getElementById('addEventForm').reset();
    loadEvents();
}

function editEvent(eventId) {
    const event = events.find(e => e.id === eventId);
    if (!event) return;
    
    // Preencher o formulário com os dados do evento
    document.getElementById('eventTitle').value = event.title;
    document.getElementById('eventDate').value = event.date;
    document.getElementById('eventTime').value = event.time;
    document.getElementById('eventLocation').value = event.location;
    document.getElementById('eventDescription').value = event.description;
    document.getElementById('eventCategory').value = event.category;
    
    // Alterar o botão para "Atualizar Evento"
    const submitButton = document.querySelector('#addEventForm button[type="submit"]');
    submitButton.textContent = 'Atualizar Evento';
    
    // Alterar o evento de submit para atualização
    const form = document.getElementById('addEventForm');
    const originalSubmit = form.onsubmit;
    form.onsubmit = function(e) {
        e.preventDefault();
        updateEvent(eventId);
    };
    
    // Mostrar o modal
    document.getElementById('addEventModal').classList.add('active');
}

function updateEvent(eventId) {
    const eventIndex = events.findIndex(e => e.id === eventId);
    if (eventIndex === -1) return;
    
    const title = document.getElementById('eventTitle').value;
    const date = document.getElementById('eventDate').value;
    const time = document.getElementById('eventTime').value;
    const location = document.getElementById('eventLocation').value;
    const description = document.getElementById('eventDescription').value;
    const category = parseInt(document.getElementById('eventCategory').value);
    
    // Atualizar evento
    events[eventIndex] = {
        ...events[eventIndex],
        title,
        date,
        time,
        location,
        description,
        category
    };
    
    saveData();
    
    alert('Evento atualizado com sucesso!');
    document.getElementById('addEventModal').classList.remove('active');
    
    // Restaurar o formulário para criação
    const submitButton = document.querySelector('#addEventForm button[type="submit"]');
    submitButton.textContent = 'Criar Evento';
    document.getElementById('addEventForm').reset();
    document.getElementById('addEventForm').onsubmit = function(e) {
        e.preventDefault();
        createEvent();
    };
    
    loadEvents();
}

function deleteEvent(eventId) {
    if (confirm('Tem certeza que deseja excluir este evento?')) {
        events = events.filter(e => e.id !== eventId);
        saveData();
        loadEvents();
        alert('Evento excluído com sucesso!');
    }
}
