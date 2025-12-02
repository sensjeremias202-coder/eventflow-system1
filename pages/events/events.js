function createEvent() {
    console.log('[events] createEvent() iniciado');
    try {
        if (!validateEventForm()) {
            console.log('[events] validateEventForm() retornou false');
            return;
        }
    } catch (err) {
        console.error('[events] Erro durante validação do formulário:', err);
        return;
    }
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
    const maxStr = document.getElementById('eventMaxParticipants')?.value?.trim();
    const maxParticipants = maxStr ? parseInt(maxStr, 10) : null;

    console.log('[events] Dados do formulário:', { title, date, time, location, description, category });
    
    // Verificar se a categoria existe
    const categoryExists = categories.find(c => c.id === category);
    if (!categoryExists) {
        console.warn('[events] Categoria selecionada não existe:', category);
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
        enrolled: [],
        maxParticipants: maxParticipants || null,
        ratings: [],
        createdAt: new Date().toISOString()
    };
    
    try {
        console.log('[events] Criando novo evento:', newEvent);
        events.push(newEvent);
        saveData();
        console.log('[events] Evento salvo com sucesso. total eventos =', events.length);
        
        // Registrar criação de evento no Analytics
        if (window.logAnalyticsEvent) {
            logAnalyticsEvent('create_event', {
                event_category: newEvent.category,
                event_type: newEvent.type
            });
        }

        showNotification('Evento criado com sucesso!', 'success');
        closeModal('addEventModal');
        loadEvents();
    } catch (err) {
        console.error('[events] Erro ao criar evento:', err);
        showNotification('Erro ao criar evento. Veja o console.', 'error');
    }
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
    const maxStr = document.getElementById('eventMaxParticipants')?.value?.trim();
    const maxParticipants = maxStr ? parseInt(maxStr, 10) : null;

    events[idx] = {
        ...events[idx],
        title,
        date,
        time,
        location,
        description,
        category,
        maxParticipants: maxParticipants || null,
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
        showConfirm(message, 'Excluir evento', { type: 'danger' }).then(confirmed => {
            if (!confirmed) return;
            const idx = events.findIndex(e => e.id === eventId);
            if (idx === -1) return;
            const removed = events[idx];
            events.splice(idx, 1);
            saveData();
            showNotification('Evento excluído com sucesso!', 'success', {
                actionLabel: 'Desfazer',
                actionCallback: function() {
                    events.splice(idx, 0, removed);
                    saveData();
                    loadEvents();
                    showNotification('Exclusão desfeita', 'success');
                }
            });
            loadEvents();
        });
    } else {
        if (!confirm(message)) return;
        const idx = events.findIndex(e => e.id === eventId);
        if (idx === -1) return;
        const removed = events[idx];
        events.splice(idx, 1);
        saveData();
        showNotification('Evento excluído com sucesso!', 'success', {
            actionLabel: 'Desfazer',
            actionCallback: function() {
                events.splice(idx, 0, removed);
                saveData();
                loadEvents();
                showNotification('Exclusão desfeita', 'success');
            }
        });
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
    console.log('[events] 📋 loadEvents() chamado');
    console.log('[events] 📊 Total de eventos:', events ? events.length : 0);
    
    const grid = document.getElementById('eventsGrid');
    if (!grid) {
        console.error('[events] ❌ Elemento eventsGrid não encontrado!');
        return;
    }

    grid.innerHTML = '';

    // Garantir que events é um array válido
    if (!Array.isArray(events)) {
        console.error('[events] ❌ events não é um array:', typeof events);
        events = [];
    }

    const sorted = events.slice().sort((a, b) => new Date(a.date) - new Date(b.date));

    if (sorted.length === 0) {
        grid.innerHTML = '<p style="color:var(--gray);">Nenhum evento cadastrado.</p>';
        return;
    }

    sorted.forEach(ev => {
        const category = categories.find(c => c.id === ev.category) || { name: 'Sem categoria', color: '#ccc' };
        
        // Calcular média de avaliações
        const ratings = ev.ratings || [];
        const avgRating = ratings.length > 0 
            ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
            : 0;
        const userRating = ratings.find(r => r.userId === currentUser?.id);
        
        const card = document.createElement('div');
        card.className = 'event-card card';
        card.innerHTML = `
            <div class="card-header">
                <div class="card-title">${escapeHtml(ev.title)}</div>
                <div class="event-meta">${formatDate(ev.date)} • ${ev.time} • ${escapeHtml(ev.location)}</div>
            </div>
            <div class="card-body">
                <p>${escapeHtml(ev.description)}</p>
                ${ratings.length > 0 ? `
                    <div class="event-rating">
                        <span class="stars">${generateStarRating(avgRating)}</span>
                        <span>${avgRating}</span>
                        <span class="count">(${ratings.length} ${ratings.length === 1 ? 'avaliação' : 'avaliações'})</span>
                    </div>
                ` : ''}
            </div>
            <div class="card-footer">
                <span class="category-badge" style="background:${category.color};">${escapeHtml(category.name)}</span>
                ${ev.createdBy === currentUser?.id ? `
                <div style="margin-left: auto; display:flex; gap:8px; align-items:center;">
                    ${ratings.length > 0 ? `<button class="btn btn-outline btn-sm view-comments" data-id="${ev.id}" title="Ver comentários"><i class="fas fa-comments"></i> ${ratings.filter(r => r.comment && r.comment.trim()).length}</button>` : ''}
                    <button class="btn btn-outline btn-sm edit-event" data-id="${ev.id}"><i class="far fa-edit"></i></button>
                    <button class="btn btn-outline btn-sm delete-event" data-id="${ev.id}"><i class="far fa-trash-alt"></i></button>
                </div>` : `
                <div style="margin-left: auto; display:flex; gap:8px; align-items:center;">
                    ${ratings.length > 0 ? `<button class="btn btn-outline btn-sm view-comments" data-id="${ev.id}" title="Ver comentários"><i class="fas fa-comments"></i> ${ratings.filter(r => r.comment && r.comment.trim()).length}</button>` : ''}
                    <button class="btn btn-outline btn-sm rate-event" data-id="${ev.id}" title="${userRating ? 'Atualizar avaliação' : 'Avaliar evento'}">
                        <i class="fa${userRating ? 's' : 'r'} fa-star"></i> ${userRating ? 'Sua avaliação' : 'Avaliar'}
                    </button>
                </div>`}
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

    // Configurar botões de visualizar comentários
    document.querySelectorAll('.view-comments').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            viewComments(id);
        });
    });

    // Configurar botões de avaliação se a função existir
    if (typeof setupRatingButtons === 'function') {
        setupRatingButtons();
    } else {
        // Fallback: Bind rate buttons for events not owned by current user
        document.querySelectorAll('.rate-event').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                openRatingModal(id);
            });
        });
    }
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
// Sistema de avalia��o de eventos
let currentRatingEventId = null;

function openRatingModal(eventId) {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    currentRatingEventId = eventId;
    const modal = document.getElementById('ratingModal');
    const form = document.getElementById('ratingForm');
    
    // Verificar se usu�rio j� avaliou
    const existingRating = event.ratings?.find(r => r.userId === currentUser.id);
    
    // Reset form
    if (form) form.reset();
    document.getElementById('ratingValue').value = '';
    
    // Reset stars
    document.querySelectorAll('#starRating i').forEach(star => {
        star.classList.remove('fas', 'active');
        star.classList.add('far');
    });
    
    // Configurar event listeners para as estrelas (toda vez que o modal abre)
    const starRatingContainer = document.getElementById('starRating');
    if (starRatingContainer) {
        const stars = starRatingContainer.querySelectorAll('i');
        
        stars.forEach((star, index) => {
            // Remover listeners antigos clonando
            const newStar = star.cloneNode(true);
            star.parentNode.replaceChild(newStar, star);
        });
        
        // Re-selecionar e adicionar novos listeners
        const newStars = starRatingContainer.querySelectorAll('i');
        newStars.forEach((star, index) => {
            star.addEventListener('click', function() {
                const rating = parseInt(this.getAttribute('data-rating'));
                const ratingInput = document.getElementById('ratingValue');
                if (ratingInput) {
                    ratingInput.value = rating;
                    console.log('[events] ⭐ Estrela clicada - Rating:', rating, 'Input value:', ratingInput.value);
                } else {
                    console.error('[events] ❌ Input ratingValue não encontrado!');
                }
                
                newStars.forEach((s, i) => {
                    if (i < rating) {
                        s.classList.remove('far');
                        s.classList.add('fas', 'active');
                    } else {
                        s.classList.remove('fas', 'active');
                        s.classList.add('far');
                    }
                });
            });
            
            star.addEventListener('mouseenter', function() {
                const rating = parseInt(this.getAttribute('data-rating'));
                newStars.forEach((s, i) => {
                    if (i < rating) {
                        s.classList.add('active');
                    } else {
                        s.classList.remove('active');
                    }
                });
            });
        });
        
        // Mouseleave do container
        starRatingContainer.addEventListener('mouseleave', function() {
            const ratingInput = document.getElementById('ratingValue');
            const currentRating = ratingInput ? parseInt(ratingInput.value) || 0 : 0;
            newStars.forEach((s, i) => {
                if (i < currentRating) {
                    s.classList.add('fas', 'active');
                    s.classList.remove('far');
                } else {
                    s.classList.remove('fas', 'active');
                    s.classList.add('far');
                }
            });
        });
    }
    
    // Se j� avaliou, preencher dados
    if (existingRating) {
        document.getElementById('ratingValue').value = existingRating.rating;
        document.getElementById('ratingComment').value = existingRating.comment || '';
        
        // Marcar estrelas
        document.querySelectorAll('#starRating i').forEach((star, idx) => {
            if (idx < existingRating.rating) {
                star.classList.remove('far');
                star.classList.add('fas', 'active');
            }
        });
    }
    
    if (modal) modal.classList.add('active');
}

function submitRating() {
    const eventId = currentRatingEventId;
    const ratingInput = document.getElementById('ratingValue');
    const ratingValue = ratingInput ? ratingInput.value : '';
    const rating = parseInt(ratingValue);
    const comment = document.getElementById('ratingComment').value.trim();
    
    console.log('[events] Submit rating - Input:', ratingInput);
    console.log('[events] Submit rating - Value:', ratingValue);
    console.log('[events] Submit rating - Parsed:', rating);
    
    if (!rating || isNaN(rating) || rating < 1 || rating > 5) {
        showNotification('Por favor, selecione uma avaliação de 1 a 5 estrelas', 'error');
        return;
    }
    
    const eventIdx = events.findIndex(e => e.id === eventId);
    if (eventIdx === -1) return;
    
    if (!events[eventIdx].ratings) events[eventIdx].ratings = [];
    
    // Verificar se usuário já avaliou
    const existingIdx = events[eventIdx].ratings.findIndex(r => r.userId === currentUser.id);
    
    const ratingData = {
        userId: currentUser.id,
        rating,
        comment,
        date: new Date().toISOString()
    };
    
    if (existingIdx !== -1) {
        // Atualizar avaliação existente
        events[eventIdx].ratings[existingIdx] = ratingData;
        console.log('[events] Avaliação atualizada:', ratingData);
        showNotification('Avaliação atualizada com sucesso!', 'success');
    } else {
        // Nova avaliação
        events[eventIdx].ratings.push(ratingData);
        console.log('[events] Nova avaliação adicionada:', ratingData);
        
        // Registrar avaliação no Analytics
        if (window.logAnalyticsEvent) {
            logAnalyticsEvent('rate_event', {
                event_id: eventId,
                rating_value: rating,
                has_comment: comment.length > 0
            });
        }
        
        showNotification('Avaliação enviada com sucesso!', 'success');
    }
    
    console.log('[events] Total de avaliações no evento:', events[eventIdx].ratings.length);
    saveData();
    closeModal('ratingModal');
    loadEvents();
}

// Setup do modal de avalia��o
document.addEventListener('DOMContentLoaded', function() {
    // Star rating interativo
    const stars = document.querySelectorAll('#starRating i');
    stars.forEach((star, index) => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.getAttribute('data-rating'));
            document.getElementById('ratingValue').value = rating;
            
            // Atualizar visualiza��o das estrelas
            stars.forEach((s, i) => {
                if (i < rating) {
                    s.classList.remove('far');
                    s.classList.add('fas', 'active');
                } else {
                    s.classList.remove('fas', 'active');
                    s.classList.add('far');
                }
            });
        });
        
        // Hover effect
        star.addEventListener('mouseenter', function() {
            const rating = parseInt(this.getAttribute('data-rating'));
            stars.forEach((s, i) => {
                if (i < rating) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
        });
    });
    
    // Reset hover ao sair
    const starRatingContainer = document.getElementById('starRating');
    if (starRatingContainer) {
        starRatingContainer.addEventListener('mouseleave', function() {
            const currentRating = parseInt(document.getElementById('ratingValue').value) || 0;
            stars.forEach((s, i) => {
                if (i < currentRating) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
        });
    }
    
    // Submit do formul�rio de avalia��o
    const ratingForm = document.getElementById('ratingForm');
    if (ratingForm) {
        ratingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitRating();
        });
    }
    
    // Fechar modal de avalia��o
    const ratingModal = document.getElementById('ratingModal');
    if (ratingModal) {
        const closeBtn = ratingModal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                ratingModal.classList.remove('active');
                currentRatingEventId = null;
            });
        }
    }
});


// Setup do modal de avalia��o
function initEventsPage() {
    console.log('[events] Inicializando p�gina de eventos...');
    
    // Star rating interativo
    const starRatingContainer = document.getElementById('starRating');
    if (starRatingContainer) {
        const stars = starRatingContainer.querySelectorAll('i');
        
        stars.forEach((star, index) => {
            const newStar = star.cloneNode(true);
            star.parentNode.replaceChild(newStar, star);
        });
        
        // Re-selecionar ap�s clonar
        const newStars = starRatingContainer.querySelectorAll('i');
        newStars.forEach((star, index) => {
            star.addEventListener('click', function() {
                const rating = parseInt(this.getAttribute('data-rating'));
                const ratingInput = document.getElementById('ratingValue');
                if (ratingInput) {
                    ratingInput.value = rating;
                    console.log('[events] Estrela clicada - Rating:', rating, 'Input value:', ratingInput.value);
                } else {
                    console.error('[events] Input ratingValue não encontrado!');
                }
                
                newStars.forEach((s, i) => {
                    if (i < rating) {
                        s.classList.remove('far');
                        s.classList.add('fas', 'active');
                    } else {
                        s.classList.remove('fas', 'active');
                        s.classList.add('far');
                    }
                });
            });
            
            star.addEventListener('mouseenter', function() {
                const rating = parseInt(this.getAttribute('data-rating'));
                newStars.forEach((s, i) => {
                    if (i < rating) {
                        s.classList.add('active');
                    } else {
                        s.classList.remove('active');
                    }
                });
            });
        });
        
        starRatingContainer.addEventListener('mouseleave', function() {
            const ratingInput = document.getElementById('ratingValue');
            const currentRating = ratingInput ? parseInt(ratingInput.value) || 0 : 0;
            const stars = starRatingContainer.querySelectorAll('i');
            stars.forEach((s, i) => {
                if (i < currentRating) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
        });
    }
    
    // Submit do formul�rio de avalia��o
    const ratingForm = document.getElementById('ratingForm');
    if (ratingForm) {
        const newForm = ratingForm.cloneNode(true);
        ratingForm.parentNode.replaceChild(newForm, ratingForm);
        
        newForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitRating();
        });
    }
    
    // Fechar modal de avalia��o
    const ratingModal = document.getElementById('ratingModal');
    if (ratingModal) {
        const closeBtn = ratingModal.querySelector('.modal-close');
        if (closeBtn) {
            const newCloseBtn = closeBtn.cloneNode(true);
            closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
            
            newCloseBtn.addEventListener('click', () => {
                ratingModal.classList.remove('active');
                currentRatingEventId = null;
            });
        }
        
        ratingModal.addEventListener('click', function(e) {
            if (e.target === ratingModal) {
                ratingModal.classList.remove('active');
                currentRatingEventId = null;
            }
        });
    }
    
    // Carregar eventos
    loadEvents();
    
    // Configurar event listeners para botões de avaliação
    setupRatingButtons();
    
    // Carregar opções de categorias
    if (typeof loadCategoryOptions === 'function') {
        loadCategoryOptions();
    }
    
    console.log('[events] Página de eventos inicializada com sucesso!');
}

// Função para configurar botões de avaliação
function setupRatingButtons() {
    console.log('[events] Configurando botões de avaliação...');
    
    // Bind rate buttons for events not owned by current user
    document.querySelectorAll('.rate-event').forEach(btn => {
        // Clonar para remover listeners antigos
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            console.log('[events] Abrindo modal de avaliação para evento:', id);
            openRatingModal(id);
        });
    });
    
    console.log('[events] Botões de avaliação configurados:', document.querySelectorAll('.rate-event').length);
}

/**
 * Visualizar comentários de um evento
 */
function viewComments(eventId) {
    console.log('[events] Visualizando comentários do evento:', eventId);
    
    const event = events.find(e => e.id === eventId);
    if (!event) {
        showNotification('Evento não encontrado', 'error');
        return;
    }
    
    const ratings = event.ratings || [];
    const commentsWithText = ratings.filter(r => r.comment && r.comment.trim());
    
    if (commentsWithText.length === 0) {
        showNotification('Este evento não possui comentários ainda', 'info');
        return;
    }
    
    // Criar modal se não existir
    let modal = document.getElementById('commentsModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'commentsModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 700px;">
                <div class="modal-header">
                    <h3 id="commentsModalTitle">Comentários</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div id="commentsModalBody" style="max-height: 500px; overflow-y: auto; padding: 20px;">
                    <!-- Comentários serão inseridos aqui -->
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Event listeners
        const closeBtn = modal.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }
    
    // Atualizar título
    const titleElement = modal.querySelector('#commentsModalTitle');
    titleElement.textContent = `Comentários - ${event.title}`;
    
    // Gerar HTML dos comentários
    const bodyElement = modal.querySelector('#commentsModalBody');
    let html = '<div class="comments-list">';
    
    commentsWithText.forEach(rating => {
        const user = users.find(u => u.id === rating.userId) || { name: 'Usuário desconhecido' };
        const date = rating.date ? new Date(rating.date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }) : 'Data desconhecida';
        
        html += `
            <div class="comment-item">
                <div class="comment-header">
                    <div class="comment-user">
                        <div class="user-avatar">${user.name.split(' ').map(n => n[0]).join('').toUpperCase()}</div>
                        <div>
                            <div class="user-name">${escapeHtml(user.name)}</div>
                            <div class="comment-date">${date}</div>
                        </div>
                    </div>
                    <div class="comment-rating">
                        ${generateStarRating(rating.rating)}
                        <span style="margin-left: 8px; font-weight: 600;">${rating.rating.toFixed(1)}</span>
                    </div>
                </div>
                <div class="comment-text">${escapeHtml(rating.comment)}</div>
            </div>
        `;
    });
    
    html += '</div>';
    bodyElement.innerHTML = html;
    
    // Mostrar modal
    modal.classList.add('active');
}
