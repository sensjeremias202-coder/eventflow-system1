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
        setupVolunteersTabs();
        // Inicialmente, manter a aba de Voluntários ativa; a de inscritos renderiza ao ser aberta
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
    const containerRoot = document.getElementById('enrollment-container');
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

    // Estado expandido por evento (memorizado em window para persistir ao re-render)
    window.__enrollmentExpanded = window.__enrollmentExpanded || {};

    grid.innerHTML = filtered.map(e => {
        const enrolledIds = Array.isArray(e.enrolled) ? e.enrolled : [];
        const max = e.maxParticipants != null ? parseInt(e.maxParticipants, 10) : null;
        const remaining = max != null ? Math.max(0, max - enrolledIds.length) : null;
        const full = max != null && remaining === 0;
        const enrolledUsers = enrolledIds
            .map(uid => (Array.isArray(window.users) ? window.users.find(u => u.id === uid) : null))
            .filter(Boolean);
        const eid = String(e.id);
        const MAX_VISIBLE = 10;
        const isExpanded = !!window.__enrollmentExpanded[eid];
        const visible = isExpanded ? enrolledUsers : enrolledUsers.slice(0, MAX_VISIBLE);
        const hidden = isExpanded ? [] : enrolledUsers.slice(MAX_VISIBLE);
        let listHtml = '';
        if (enrolledUsers.length === 0) {
            listHtml = '<li style="color:var(--gray);">Nenhum inscrito</li>';
        } else {
            listHtml = visible.map(u => `<li>${u.name}</li>`).join('');
            if (hidden.length > 0) {
                listHtml += hidden.map(u => `<li class="enr-extra enr-extra-${eid}" style="display:none;">${u.name}</li>`).join('');
            }
        }

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
                    <ul id="enr-list-${eid}" style="margin-top:10px; padding-left:18px;">${listHtml}</ul>
                    ${enrolledUsers.length > MAX_VISIBLE ? `
                        <button class="btn btn-sm btn-outline" data-toggle-id="${eid}" onclick="window.toggleEnrollmentList && window.toggleEnrollmentList('${eid}')">
                            ${isExpanded ? 'Mostrar menos' : `Mostrar mais (${enrolledUsers.length - MAX_VISIBLE})`}
                        </button>
                    ` : ''}
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

// Abas: alternar entre Voluntários e Inscritos por Evento
function setupVolunteersTabs() {
    const btnVol = document.getElementById('tabVolunteersBtn');
    const btnEnr = document.getElementById('tabEnrolledBtn');
    const tabVol = document.getElementById('tab-volunteers');
    const tabEnr = document.getElementById('tab-enrollment');
    const filters = document.getElementById('enrollmentFilters');
    if (!btnVol || !btnEnr || !tabVol || !tabEnr) return;

    function activate(tab) {
        const isVol = tab === 'vol';
        tabVol.style.display = isVol ? 'block' : 'none';
        tabEnr.style.display = isVol ? 'none' : 'block';
        if (filters) filters.style.display = isVol ? 'none' : 'block';
        btnVol.classList.toggle('active', isVol);
        btnEnr.classList.toggle('active', !isVol);
        // Renderizar overview ao abrir a aba
        if (!isVol) {
            renderEnrollmentOverview();
        }
    }

    if (!btnVol.dataset.listenerAdded) {
        btnVol.dataset.listenerAdded = 'true';
        btnVol.addEventListener('click', () => activate('vol'));
    }
    if (!btnEnr.dataset.listenerAdded) {
        btnEnr.dataset.listenerAdded = 'true';
        btnEnr.addEventListener('click', () => activate('enr'));
    }

    // Estado inicial: mostrar aba Voluntários e ocultar filtros
    activate('vol');
}

// Toggle "ver mais/menos" para inscritos por evento
window.toggleEnrollmentList = function(eventId) {
    try {
        const eid = String(eventId);
        window.__enrollmentExpanded = window.__enrollmentExpanded || {};
        const isExpanded = !!window.__enrollmentExpanded[eid];
        const extras = document.querySelectorAll(`.enr-extra-${eid}`);
        const btn = document.querySelector(`[data-toggle-id="${eid}"]`);
        extras.forEach(li => li.style.display = isExpanded ? 'none' : 'list-item');
        if (btn) {
            // Atualiza o texto do botão (contagem precisa do total - MAX_VISIBLE)
            const total = (Array.isArray(window.events) ? window.events : []).find(ev => String(ev.id) === eid)?.enrolled?.length || 0;
            const MAX_VISIBLE = 10;
            const remaining = Math.max(0, total - MAX_VISIBLE);
            btn.textContent = isExpanded ? (remaining > 0 ? `Mostrar mais (${remaining})` : 'Mostrar mais') : 'Mostrar menos';
        }
        window.__enrollmentExpanded[eid] = !isExpanded;
    } catch (e) {
        console.warn('[volunteers-page] toggleEnrollmentList falhou:', e);
    }
};
