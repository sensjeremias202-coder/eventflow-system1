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

        const tabs = document.getElementById('volunteersTabs');
        if (tabs) tabs.style.display = 'none';
        const addBtn = document.getElementById('addVolunteerBtn');
        if (addBtn) addBtn.style.display = 'none';

        const root = document.getElementById('volunteer-dashboard');
        const list = getRegisteredVolunteers();
        if (root) {
            root.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <div class="card-title" id="volunteersListTrigger" style="cursor:pointer;">
                            <i class="fas fa-users"></i> Voluntários cadastrados (${list.length})
                        </div>
                    </div>
                    <div class="card-body">
                        <p style="color: var(--gray);">Clique no título para ver a lista completa.</p>
                    </div>
                </div>
            `;
            const trigger = document.getElementById('volunteersListTrigger');
            if (trigger && !trigger.dataset.listenerAdded) {
                trigger.dataset.listenerAdded = 'true';
                trigger.addEventListener('click', () => showVolunteersModal(list));
            }
        }
    }

    function getRegisteredVolunteers() {
        // Usar a fonte localStorage se disponível para consistência; sem login/admin, evitar mostrar dados sensíveis
        let usersArr = [];
        try {
            const raw = localStorage.getItem('users');
            if (raw) usersArr = JSON.parse(raw) || [];
            else usersArr = Array.isArray(window.users) ? window.users : [];
        } catch { usersArr = Array.isArray(window.users) ? window.users : []; }

        const actor = typeof window !== 'undefined' ? window.currentUser : null;
        if (!actor) {
            // Não exibir lista completa sem login
            return [];
        }
        // Considerar 'jovens' como voluntários cadastrados por padrão
        return usersArr.filter(u => (u.role === 'jovens'));
    }

    function showVolunteersModal(volunteers) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        const items = volunteers.map(v => `
            <li style="padding:8px 0; border-bottom:1px solid #eee;">
                <strong>${escapeHtml(v.name || 'Sem nome')}</strong>
                ${v.phone ? `<span style="color:var(--gray);"> • ${escapeHtml(v.phone)}</span>` : ''}
                ${v.email ? `<div style="color:var(--gray); font-size:0.9em;">${escapeHtml(v.email)}</div>` : ''}
            </li>
        `).join('');
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2><i class="fas fa-users"></i> Lista de Voluntários (${volunteers.length})</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body" style="max-height:60vh; overflow:auto;">
                    <ul style="list-style:none; padding:0; margin:0;">${items}</ul>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
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
    let filtered = query ? evts.filter(e => norm(e.title || e.name).includes(query)) : evts;

    // Se for usuário "jovens": mostrar apenas eventos em que está inscrito
    const cu = window.currentUser;
    if (cu && cu.role === 'jovens') {
        filtered = filtered.filter(e => Array.isArray(e.enrolled) && e.enrolled.includes(cu.id));
    }

    // Estado expandido por evento (memorizado em window para persistir ao re-render)
    window.__enrollmentExpanded = window.__enrollmentExpanded || {};

    grid.innerHTML = filtered.map(e => {
        const enrolledIds = Array.isArray(e.enrolled) ? e.enrolled : [];
        const max = e.maxParticipants != null ? parseInt(e.maxParticipants, 10) : null;
        const remaining = max != null ? Math.max(0, max - enrolledIds.length) : null;
        const full = max != null && remaining === 0;
        let enrolledUsers = enrolledIds
            .map(uid => (Array.isArray(window.users) ? window.users.find(u => u.id === uid) : null))
            .filter(Boolean);
        // Para "jovens", listar apenas ele mesmo
        if (cu && cu.role === 'jovens') {
            enrolledUsers = enrolledUsers.filter(u => u.id === cu.id);
        }
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

    // Para "jovens": esconder aba Voluntários e abrir diretamente a de Inscritos
    const cu = window.currentUser;
    if (cu && cu.role === 'jovens') {
        btnVol.style.display = 'none';
        activate('enr');
    } else {
        // Estado inicial: mostrar aba Voluntários e ocultar filtros
        activate('vol');
    }
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
