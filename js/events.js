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
        const enrolledCount = Array.isArray(event.enrolled) ? event.enrolled.length : 0;
        const max = event.maxParticipants ? parseInt(event.maxParticipants) : null;
        const remaining = max != null ? Math.max(0, max - enrolledCount) : null;
        const full = max != null && remaining === 0;
            const allEvents = getLocalEvents();
            const activeCommunityId = (window.communities && typeof window.communities.getActiveId==='function') ? window.communities.getActiveId() : (localStorage.getItem('activeCommunityId')||null);
            let scopedEvents = Array.isArray(allEvents) ? allEvents.filter(e => !e.communityId || (activeCommunityId ? e.communityId === activeCommunityId : true)) : [];
        return `
            <div class="event-card ${!isUpcoming ? 'past-event' : ''}" data-event-id="${event.id}">
            if (!scopedEvents || scopedEvents.length === 0) {
                    ${isUpcoming && daysUntil <= 7 ? `<span class="event-badge">Faltam ${daysUntil} dias</span>` : ''}
                    ${!isUpcoming ? '<span class="event-badge past">Encerrado</span>' : ''}
                </div>
                <div class="event-content">
                    <div class="event-header">
            eventsGrid.innerHTML = scopedEvents.map(evt => {
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
                            // Busca com debounce + paginação
                            const searchInput = document.getElementById('eventsSearch');
                            const paginationEl = document.getElementById('eventsPagination');
                            let q = '';
                            let page = 1;
                            const pageSize = 8;
                            let debounceTimer = null;
                            function filterAndPage() {
                                const term = (q||'').toLowerCase();
                                let data = scopedEvents;
                                if (term) {
                                    data = data.filter(e => (
                                        (e.title||e.name||'').toLowerCase().includes(term) ||
                                        (e.description||'').toLowerCase().includes(term) ||
                                        String(e.id||'').toLowerCase().includes(term)
                                    ));
                                }
                                const total = data.length;
                                const pages = Math.max(1, Math.ceil(total / pageSize));
                                page = Math.min(page, pages);
                                const start = (page-1)*pageSize;
                                const paged = data.slice(start, start+pageSize);
                                renderEvents(paged);
                                renderEventsPagination(total, pages);
                            }
                            function renderEvents(list) {
                                eventsGrid.innerHTML = list.map(evt => {
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
                            <span>${enrolledCount} inscritos</span>
                        </div>
                        ${max != null ? `
                            <div class="stat">
                                <i class="fas fa-user-check"></i>
                                <span>${max} vagas • ${remaining} restantes</span>
                            </div>
                        ` : ''}
                    </div>
                    <div class="event-actions">
                        ${isUpcoming ? `
                            <button class="btn btn-primary" ${full ? 'disabled title="Lotado"' : ''} onclick="enrollInEvent('${event.id}')">
                                <i class="fas fa-user-plus"></i> Inscrever-se
                            </button>
                        ` : ''}
                        <button class="btn btn-outline" onclick="viewEventDetails('${event.id}')">
                            <i class="fas fa-eye"></i> Ver Detalhes
                        </button>
                        <div style="display:flex; gap:6px;">
                          <button class="btn btn-sm btn-outline" onclick="exportEnrolledCSV('${event.id}','all')" title="Exportar inscritos (todos)"><i class="fas fa-file-csv"></i> CSV</button>
                          <button class="btn btn-sm btn-outline" onclick="exportEnrolledCSV('${event.id}','confirmed')" title="Exportar confirmados"><i class="fas fa-check"></i></button>
                          <button class="btn btn-sm btn-outline" onclick="exportEnrolledCSV('${event.id}','pending')" title="Exportar pendentes"><i class="fas fa-hourglass-half"></i></button>
                        </div>
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

function exportEnrolledCSV(eventId, filter = 'all') {
    try {
        const evt = (Array.isArray(events) ? events.find(e => String(e.id) === String(eventId)) : null);
        if (!evt) { showNotification('Evento não encontrado', 'error'); return; }
        const list = Array.isArray(evt.enrolled) ? evt.enrolled : (Array.isArray(evt.enrolledUsers) ? evt.enrolledUsers : []);
        const formatted = list.map(u => ({
            userId: u.userId || u.id || '',
            name: u.name || u.fullName || '',
            email: u.email || '',
            phone: u.phone || '',
            status: (u.status || (u.confirmed ? 'confirmed' : (u.pending ? 'pending' : 'unknown'))),
            enrolledAt: u.enrolledAt || u.createdAt || ''
        }));
        let rows = formatted;
        if (filter === 'confirmed') rows = rows.filter(r => r.status === 'confirmed');
        if (filter === 'pending') rows = rows.filter(r => r.status === 'pending');
        const header = ['userId','name','email','phone','status','enrolledAt'];
        const csv = [header.join(','), ...rows.map(r => header.map(h => String(r[h]||'').replace(/"/g,'""')).map(v => `"${v}"`).join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `evento_${eventId}_inscritos_${filter}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showNotification('CSV exportado com sucesso', 'success');
    } catch(e){
        console.error('[events] export CSV error:', e);
        showNotification('Falha ao exportar CSV', 'error');
    }
                                }).join('');
                            }
                            function renderEventsPagination(total, pages) {
                                if (!paginationEl) return;
                                const prevDisabled = page<=1 ? 'disabled' : '';
                                const nextDisabled = page>=pages ? 'disabled' : '';
                                paginationEl.innerHTML = `
                                  <button class="btn btn-sm btn-outline" ${prevDisabled} id="eventsPrev">Anterior</button>
                                  <span style="padding:4px 8px;">Página ${page} de ${pages} • ${total} eventos</span>
                                  <button class="btn btn-sm btn-outline" ${nextDisabled} id="eventsNext">Próxima</button>
                                `;
                                const prev = document.getElementById('eventsPrev');
                                const next = document.getElementById('eventsNext');
                                if (prev) prev.onclick = ()=>{ if (page>1) { page--; filterAndPage(); } };
                                if (next) next.onclick = ()=>{ if (page<pages) { page++; filterAndPage(); } };
                            }
                            if (searchInput) {
                                searchInput.addEventListener('input', (e) => {
                                    q = e.target.value || '';
                                    clearTimeout(debounceTimer);
                                    debounceTimer = setTimeout(filterAndPage, 250);
                                });
                            }
                            filterAndPage();

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
    // Guard: requires active community to operate writes
    const activeCommunityId = (window.communities && typeof window.communities.getActiveId==='function') ? window.communities.getActiveId() : (localStorage.getItem('activeCommunityId')||null);
    if (!activeCommunityId){
        showNotification('Selecione uma comunidade antes de inscrever-se.', 'warning');
        return;
    }
    // Garantir tipos compatíveis
    const idStr = String(eventId);
    if (!currentUser) {
        try { localStorage.setItem('pendingEnrollmentEventId', idStr); } catch {}
        showNotification('Faça login para se inscrever', 'warning');
        const loginScreen = document.getElementById('loginScreen');
        const app = document.getElementById('app');
        if (app) app.style.display = 'none';
        if (loginScreen) loginScreen.style.display = 'flex';
        if (typeof showLoginForm === 'function') showLoginForm();
        return;
    }
    
    const event = events.find(e => String(e.id) === idStr);
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
    // Se estamos retomando pós-login, pular modal e inscrever direto
    if (window.__resumeEnrollment) {
        try { delete window.__resumeEnrollment; } catch {}
        if (!event.enrolled) event.enrolled = [];
        event.enrolled.push(currentUser.id);
        if (typeof saveData === 'function') {
            saveData();
        } else {
            localStorage.setItem('events', JSON.stringify(events));
        }
        showNotification('Inscrição realizada com sucesso!', 'success');
        loadEvents();
        return;
    }

    // Exibir modal com informação de vagas antes de confirmar
    const enrolledCount = Array.isArray(event.enrolled) ? event.enrolled.length : 0;
    const max = event.maxParticipants != null ? parseInt(event.maxParticipants) : null;
    const remaining = max != null ? Math.max(0, max - enrolledCount) : null;
    const infoText = max != null
        ? `${enrolledCount} / ${max} inscritos • ${remaining} vagas ${remaining === 0 ? '(lotado)' : 'restantes'}`
        : `${enrolledCount} inscritos • vagas ilimitadas`;

    const proceedEnroll = () => {
        if (!event.enrolled) event.enrolled = [];
        // Normalizar estrutura de inscrição como objeto
        const enrollment = {
            userId: currentUser.id,
            name: currentUser.name || '',
            email: currentUser.email || '',
            phone: currentUser.phone || '',
            status: 'pending',
            enrolledAt: new Date().toISOString()
        };
        // Evitar duplicados se anteriormente era apenas ID
        const already = Array.isArray(event.enrolled) && (event.enrolled.includes(currentUser.id) || event.enrolled.some(e => (e && (e.userId===currentUser.id || e.id===currentUser.id))));
        if (already) {
            showNotification('Você já está inscrito neste evento', 'info');
            return;
        }
        event.enrolled.push(enrollment);
        if (typeof saveData === 'function') {
            saveData();
        } else {
            localStorage.setItem('events', JSON.stringify(events));
        }
        showNotification('Inscrição realizada com sucesso!', 'success');
        loadEvents();
    };

    if (typeof showConfirm === 'function') {
        showConfirm(
            `Deseja se inscrever em "${event.title || event.name}"?\n\n${infoText}`,
            'Confirmar Inscrição',
            { type: 'primary' }
        ).then(confirmed => {
            if (!confirmed) return;
            proceedEnroll();
        });
    } else {
        proceedEnroll();
    }
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
    if (addEventBtn && !addEventBtn.dataset.eventsListenerAdded) {
        addEventBtn.dataset.eventsListenerAdded = 'true';
        addEventBtn.addEventListener('click', () => {
            const activeCommunityId = (window.communities && typeof window.communities.getActiveId==='function') ? window.communities.getActiveId() : (localStorage.getItem('activeCommunityId')||null);
            if (!activeCommunityId){
                showNotification('Selecione uma comunidade antes de criar eventos.', 'warning');
                return;
            }
            const addEventModal = document.getElementById('addEventModal');
            if (addEventModal) {
                // Carregar categorias antes de abrir
                if (typeof loadCategoryOptions === 'function') loadCategoryOptions();
                addEventModal.classList.add('active');
            }
        });
    }
    
    // Botão meus eventos
    const myEventsBtn = document.getElementById('myEventsBtn');
    if (myEventsBtn && !myEventsBtn.dataset.eventsListenerAdded) {
        myEventsBtn.dataset.eventsListenerAdded = 'true';
        myEventsBtn.addEventListener('click', () => {
            // Filtrar eventos do usuário atual
            if (window.currentUser) {
                const userEvents = events.filter(e => 
                    Array.isArray(e.enrolled) && e.enrolled.includes(window.currentUser.id)
                );
                renderEventsList(userEvents);
                showNotification(`Mostrando ${userEvents.length} eventos inscritos`, 'info');
            }
        });
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
