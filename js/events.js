function createEvent() {
    if (!validateEventForm()) return;
    // Se estivermos em modo de edição (definido por editEvent), delegar para updateEvent
    if (window.eventEditId) {
        updateEvent(window.eventEditId);
        return;
    }
    
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

// Editar evento: preenche o modal e coloca o sistema em modo edição
function editEvent(eventId) {
    const ev = events.find(e => e.id === eventId);
    if (!ev) return;

    // Preencher formulário
    const modal = document.getElementById('addEventModal');
    if (modal) modal.classList.add('active');

    document.getElementById('eventTitle').value = ev.title;
    document.getElementById('eventDate').value = ev.date;
    document.getElementById('eventTime').value = ev.time;
    document.getElementById('eventLocation').value = ev.location;
    document.getElementById('eventDescription').value = ev.description;
    document.getElementById('eventCategory').value = ev.category;

    // Marcar modo de edição
    window.eventEditId = eventId;
    // Atualizar UI para modo edição
    setEventEditMode(true);
}

function updateEvent(eventId) {
    const idx = events.findIndex(e => e.id === eventId);
    if (idx === -1) return;

    // Revalidar formulário
    if (!validateEventForm()) return;

    const title = document.getElementById('eventTitle').value.trim();
    const date = document.getElementById('eventDate').value;
    const time = document.getElementById('eventTime').value;
    const location = document.getElementById('eventLocation').value.trim();
    const description = document.getElementById('eventDescription').value.trim();
    const category = parseInt(document.getElementById('eventCategory').value);

    events[idx] = {
        ...events[idx],
        title,
        date,
        time,
        location,
        description,
        category,
        updatedAt: new Date().toISOString()
    };

    saveData();
    showNotification('Evento atualizado com sucesso!', 'success');

    // Limpar modo de edição e resetar formulário
    window.eventEditId = null;
    const form = document.getElementById('addEventForm');
    if (form) form.reset();
    if (form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.textContent = 'Criar Evento';
    }

    // Atualizar UI para sair do modo edição
    setEventEditMode(false);

    closeModal('addEventModal');
    loadEvents();
}

function deleteEvent(eventId) {
    const message = 'Deseja realmente excluir este evento?';
    if (typeof showConfirm === 'function') {
        showConfirm(message, 'Excluir evento').then(confirmed => {
            if (!confirmed) return;
            events = events.filter(e => e.id !== eventId);
            saveData();
            showNotification('Evento excluído com sucesso!', 'success');
            loadEvents();
        });
    } else {
        if (!confirm(message)) return;
        events = events.filter(e => e.id !== eventId);
        saveData();
        showNotification('Evento excluído com sucesso!', 'success');
        loadEvents();
    }
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
            // garantir que o modo de edição seja limpo
            if (window.eventEditId) window.eventEditId = null;
                // garantir que a UI volte ao estado de criação
                setEventEditMode(false);
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
                ${ev.createdBy === currentUser?.id ? `
                <div style="margin-left: auto; display:flex; gap:8px; align-items:center;">
                    <button class="btn btn-outline btn-sm edit-event" data-id="${ev.id}"><i class="far fa-edit"></i></button>
                    <button class="btn btn-outline btn-sm delete-event" data-id="${ev.id}"><i class="far fa-trash-alt"></i></button>
                </div>` : ''}
            </div>
        `;

        grid.appendChild(card);
    });

    // Bind edit/delete buttons for events owned by current user
    document.querySelectorAll('.edit-event').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            editEvent(id);
        });
    });

    document.querySelectorAll('.delete-event').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            deleteEvent(id);
        });
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
                <div style="margin-left: auto; display:flex; gap:8px; align-items:center;">
                    <button class="btn btn-outline btn-sm edit-event" data-id="${ev.id}"><i class="far fa-edit"></i></button>
                    <button class="btn btn-outline btn-sm delete-event" data-id="${ev.id}"><i class="far fa-trash-alt"></i></button>
                </div>
            </div>
        `;

        grid.appendChild(card);
    });

    document.querySelectorAll('.edit-event').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            editEvent(id);
        });
    });

    document.querySelectorAll('.delete-event').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            deleteEvent(id);
        });
    });
}

// Cancelar edição via botão no modal
document.addEventListener('DOMContentLoaded', function() {
    const cancelBtn = document.getElementById('cancelEditBtn');
    const cancelHeaderBtn = document.getElementById('cancelEditHeaderBtn');
    [cancelBtn, cancelHeaderBtn].forEach(btn => {
        if (!btn) return;
        btn.addEventListener('click', function() {
            // Limpar modo de edição
            window.eventEditId = null;
            // Resetar formulário
            const form = document.getElementById('addEventForm');
            if (form) form.reset();
            // Atualizar UI
            setEventEditMode(false);
            // Micro-feedback
            try { showNotification('Edição cancelada', 'info'); } catch (e) { /* ignore */ }
            // Fechar modal
            const modal = document.getElementById('addEventModal');
            if (modal) modal.classList.remove('active');
        });
    });

    // Inline category creation handlers (dentro do modal de evento)
    const inlineCreateBtn = document.getElementById('inlineCreateCategoryBtn');
    const inlineCancelBtn = document.getElementById('inlineCancelCategoryBtn');
    if (inlineCreateBtn) {
        inlineCreateBtn.addEventListener('click', function() {
            const nameEl = document.getElementById('inlineCategoryName');
            const colorEl = document.getElementById('inlineCategoryColor');
            const iconEl = document.getElementById('inlineCategoryIcon');
            const name = nameEl ? nameEl.value.trim() : '';
            const color = colorEl ? colorEl.value : '#4361ee';
            const icon = iconEl ? iconEl.value.trim() : '';

            if (!name) { showNotification('Informe o nome da categoria', 'error'); return; }
            if (!icon.startsWith('fas') && !icon.startsWith('far') && !icon.startsWith('fab')) {
                showNotification('Use um ícone válido do Font Awesome (ex: fas fa-music)', 'error');
                return;
            }
            // verificar duplicidade
            if (categories.find(c => c.name.toLowerCase() === name.toLowerCase())) {
                showNotification('Já existe uma categoria com este nome', 'error');
                return;
            }

            const newCategory = {
                id: categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1,
                name,
                color,
                icon,
                createdAt: new Date().toISOString()
            };

            categories.push(newCategory);
            try { saveData(); } catch (e) { /* ignore */ }

            showNotification('Categoria criada com sucesso!', 'success');
            // Atualizar selects e selecionar nova categoria
            try { loadCategoryOptions(); } catch (e) { /* ignore */ }
            const categorySelect = document.getElementById('eventCategory');
            if (categorySelect) categorySelect.value = newCategory.id;

            // esconder e resetar inline form
            const inlineForm = document.getElementById('inlineCategoryForm');
            if (inlineForm) inlineForm.style.display = 'none';
            if (nameEl) nameEl.value = '';
            if (iconEl) iconEl.value = '';
        });
    }

    if (inlineCancelBtn) {
        inlineCancelBtn.addEventListener('click', function() {
            const inlineForm = document.getElementById('inlineCategoryForm');
            if (inlineForm) inlineForm.style.display = 'none';
            // reset select to placeholder
            const categorySelect = document.getElementById('eventCategory');
            if (categorySelect) categorySelect.value = '';
        });
    }
});

// Helper para mostrar/ocultar UI de edição (badge e botão cancelar)
function setEventEditMode(isEditing) {
    const badge = document.getElementById('eventEditBadge');
    const cancelBtn = document.getElementById('cancelEditBtn');
    const cancelHeader = document.getElementById('cancelEditHeaderBtn');
    const form = document.getElementById('addEventForm');
    const modal = document.getElementById('addEventModal');

    if (badge) badge.style.display = isEditing ? 'inline-block' : 'none';
    if (cancelBtn) cancelBtn.style.display = isEditing ? 'inline-block' : 'none';
    if (cancelHeader) cancelHeader.style.display = isEditing ? 'inline-block' : 'none';
    if (modal) {
        if (isEditing) modal.classList.add('editing');
        else modal.classList.remove('editing');
    }
    if (form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.textContent = isEditing ? 'Atualizar Evento' : 'Criar Evento';
    }
}