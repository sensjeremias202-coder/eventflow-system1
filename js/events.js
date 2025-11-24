function createEvent() {
    if (!validateEventForm()) return;
    
    const title = document.getElementById('eventTitle').value;
    const date = document.getElementById('eventDate').value;
    const time = document.getElementById('eventTime').value;
    const location = document.getElementById('eventLocation').value;
    const description = document.getElementById('eventDescription').value;
    const category = parseInt(document.getElementById('eventCategory').value);
    
    // Verificar se a categoria existe
    const categoryExists = categories.find(c => c.id === category);
    if (!categoryExists) {
        showNotification('Categoria selecionada não existe!', 'error');
        return;
    }
    
    const newEvent = {
        id: events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1,
        title: title.trim(),
        date,
        time,
        location: location.trim(),
        description: description.trim(),
        category,
        createdBy: currentUser.id,
        ratings: [],
        createdAt: new Date().toISOString()
    };
    
    events.push(newEvent);
    saveData();
    
    showNotification('Evento criado com sucesso!', 'success');
    closeModal('addEventModal');
    loadEvents();
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
    
    // Resetar formulário do evento
    if (modalId === 'addEventModal') {
        const form = document.getElementById('addEventForm');
        if (form) {
            form.reset();
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.textContent = 'Criar Evento';
                submitBtn.onclick = null;
            }
        }
    }
}

// Renderiza a lista de eventos na tela (compatível com main)
function loadEvents() {
    const grid = document.getElementById('eventsGrid');
    if (!grid) return;

    grid.innerHTML = '';

    const sorted = events.slice().sort((a, b) => new Date(a.date) - new Date(b.date));

    if (sorted.length === 0) {
        grid.innerHTML = '<p style="color:var(--gray);">Nenhum evento cadastrado.</p>';
        return;
    }

    sorted.forEach(ev => {
        const category = categories.find(c => c.id === ev.category) || { name: 'Sem categoria', color: '#ccc' };
        const card = document.createElement('div');
        card.className = 'event-card card';
        card.innerHTML = `
            <div class="card-header">
                <div class="card-title">${escapeHtml(ev.title)}</div>
                <div class="event-meta">${formatDate(ev.date)} • ${ev.time} • ${escapeHtml(ev.location)}</div>
            </div>
            <div class="card-body">
                <p>${escapeHtml(ev.description)}</p>
            </div>
            <div class="card-footer">
                <span class="category-badge" style="background:${category.color};">${escapeHtml(category.name)}</span>
            </div>
        `;

        grid.appendChild(card);
    });
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Carregar apenas os eventos criados pelo usuário atual
function loadMyEvents() {
    if (!currentUser) return;

    const grid = document.getElementById('eventsGrid');
    if (!grid) return;

    grid.innerHTML = '';

    const myEvents = events.filter(ev => ev.createdBy === currentUser.id)
        .slice()
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    if (myEvents.length === 0) {
        grid.innerHTML = '<p style="color:var(--gray);">Você ainda não criou nenhum evento.</p>';
        return;
    }

    myEvents.forEach(ev => {
        const category = categories.find(c => c.id === ev.category) || { name: 'Sem categoria', color: '#ccc' };
        const card = document.createElement('div');
        card.className = 'event-card card';
        card.innerHTML = `
            <div class="card-header">
                <div class="card-title">${escapeHtml(ev.title)}</div>
                <div class="event-meta">${formatDate(ev.date)} • ${ev.time} • ${escapeHtml(ev.location)}</div>
            </div>
            <div class="card-body">
                <p>${escapeHtml(ev.description)}</p>
            </div>
            <div class="card-footer">
                <span class="category-badge" style="background:${category.color};">${escapeHtml(category.name)}</span>
            </div>
        `;

        grid.appendChild(card);
    });
}