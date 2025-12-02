/**
 * Inicialização da página de voluntários
 */

function initVolunteers() {
    console.log('[volunteers-page] Inicializando página de voluntários...');
    
    // Verificar se o sistema de voluntários está disponível
    if (typeof VolunteerSystem !== 'undefined') {
        // Criar instância se não existir
        if (!window.volunteerInstance) {
            window.volunteerInstance = new VolunteerSystem();
            console.log('[volunteers-page] ✅ VolunteerSystem instanciado');
        } else {
            // Recarregar dados se já existe
            if (window.volunteerInstance.loadVolunteers) {
                window.volunteerInstance.loadVolunteers();
            }
            console.log('[volunteers-page] ✅ Sistema de voluntários recarregado');
        }
    } else {
        console.error('[volunteers-page] ❌ VolunteerSystem não encontrado!');
        showNotification('Erro ao carregar sistema de voluntários', 'error');
    }

    // Renderizar visão de inscritos por evento
    try {
        renderEnrollmentOverview();
        setupVolunteersFilters();
    } catch (e) {
        console.warn('[volunteers-page] Aviso ao renderizar visão de inscritos:', e);
    }
}

// Exportar função globalmente
window.initVolunteers = initVolunteers;

console.log('[volunteers-page] ✅ Módulo de voluntários carregado');

// Renderiza um resumo dos inscritos por evento na página de voluntários
function renderEnrollmentOverview(filterText) {
    const containerRoot = document.getElementById('volunteers-container');
    if (!containerRoot) return;
    const grid = containerRoot.querySelector('.volunteers-grid') || containerRoot;

    const evts = Array.isArray(window.events) ? window.events.slice() : [];
    if (!evts.length) {
        grid.innerHTML = '<p style="color:var(--gray);">Nenhum evento cadastrado.</p>';
        return;
    }

    const norm = (s) => (s || '').toString().toLowerCase();
    const query = norm(filterText);
    const filtered = query ? evts.filter(e => norm(e.title || e.name).includes(query)) : evts;

    grid.innerHTML = filtered.map(e => {
        const enrolledIds = Array.isArray(e.enrolled) ? e.enrolled : [];
        const max = e.maxParticipants != null ? parseInt(e.maxParticipants, 10) : null;
        const remaining = max != null ? Math.max(0, max - enrolledIds.length) : null;
        const full = max != null && remaining === 0;
        const enrolledUsers = enrolledIds
            .map(uid => (Array.isArray(window.users) ? window.users.find(u => u.id === uid) : null))
            .filter(Boolean);
        const listHtml = enrolledUsers.length
            ? enrolledUsers.map(u => `<li>${u.name}</li>`).join('')
            : '<li style="color:var(--gray);">Nenhum inscrito</li>';

        return `
            <div class="card">
                <div class="card-header">
                    <div class="card-title">${(e.title || e.name) || 'Evento'}</div>
                    <div class="event-meta">${e.date || ''} ${e.time ? '• ' + e.time : ''} ${e.location ? '• ' + e.location : ''}</div>
                </div>
                <div class="card-body">
                    <div style="display:flex; gap:16px; align-items:flex-start; flex-wrap:wrap;">
                        <div>
                            <div style="font-weight:600;">Inscritos</div>
                            <div>${enrolledIds.length}${max != null ? ` / ${max}` : ''} ${full ? '<span style="color:#f72585;">(Lotado)</span>' : ''}
                                ${remaining != null && !full ? `<span style=\"color:#2a9d8f;\"> • ${remaining} vagas</span>` : ''}
                            </div>
                        </div>
                    </div>
                    <ul style="margin-top:10px; padding-left:18px;">${listHtml}</ul>
                </div>
            </div>
        `;
    }).join('');
}

// Filtros simples (busca por título)
function setupVolunteersFilters() {
    const search = document.getElementById('volunteerSearch');
    if (search && !search.dataset.listenerAdded) {
        search.dataset.listenerAdded = 'true';
        search.addEventListener('input', (e) => renderEnrollmentOverview(e.target.value));
    }
}

// Expor para que outras partes possam atualizar a visão após salvar
window.renderEnrollmentOverview = renderEnrollmentOverview;
