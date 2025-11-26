/**
 * ============================================
 * SISTEMA DE BUSCA AVANÇADA E FILTROS
 * ============================================
 */

let currentFilters = {
    search: '',
    category: 'all',
    dateFrom: '',
    dateTo: '',
    location: '',
    sortBy: 'date-asc'
};

// Aplicar filtros aos eventos
function applyEventFilters() {
    let filtered = [...events];
    
    // Filtro de busca por texto
    if (currentFilters.search) {
        const searchLower = currentFilters.search.toLowerCase();
        filtered = filtered.filter(event => 
            event.title.toLowerCase().includes(searchLower) ||
            event.description.toLowerCase().includes(searchLower) ||
            (event.location && event.location.toLowerCase().includes(searchLower))
        );
    }
    
    // Filtro por categoria
    if (currentFilters.category && currentFilters.category !== 'all') {
        filtered = filtered.filter(event => event.category === currentFilters.category);
    }
    
    // Filtro por data inicial
    if (currentFilters.dateFrom) {
        const fromDate = new Date(currentFilters.dateFrom);
        filtered = filtered.filter(event => new Date(event.date) >= fromDate);
    }
    
    // Filtro por data final
    if (currentFilters.dateTo) {
        const toDate = new Date(currentFilters.dateTo);
        toDate.setHours(23, 59, 59);
        filtered = filtered.filter(event => new Date(event.date) <= toDate);
    }
    
    // Filtro por localização
    if (currentFilters.location) {
        const locationLower = currentFilters.location.toLowerCase();
        filtered = filtered.filter(event => 
            event.location && event.location.toLowerCase().includes(locationLower)
        );
    }
    
    // Ordenação
    filtered = sortEvents(filtered, currentFilters.sortBy);
    
    return filtered;
}

// Ordenar eventos
function sortEvents(events, sortBy) {
    const sorted = [...events];
    
    switch(sortBy) {
        case 'date-asc':
            return sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
            
        case 'date-desc':
            return sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
            
        case 'title-asc':
            return sorted.sort((a, b) => a.title.localeCompare(b.title));
            
        case 'title-desc':
            return sorted.sort((a, b) => b.title.localeCompare(a.title));
            
        case 'rating-desc':
            return sorted.sort((a, b) => {
                const avgA = a.ratings && a.ratings.length > 0
                    ? a.ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / a.ratings.length
                    : 0;
                const avgB = b.ratings && b.ratings.length > 0
                    ? b.ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / b.ratings.length
                    : 0;
                return avgB - avgA;
            });
            
        case 'attendees-desc':
            return sorted.sort((a, b) => {
                const countA = a.attendees ? a.attendees.length : 0;
                const countB = b.attendees ? b.attendees.length : 0;
                return countB - countA;
            });
            
        default:
            return sorted;
    }
}

// Renderizar barra de busca e filtros
function renderSearchAndFilters() {
    const container = document.getElementById('eventsFilters');
    if (!container) return;
    
    container.innerHTML = `
        <div class="filters-container">
            <div class="search-box">
                <i class="fas fa-search"></i>
                <input type="text" 
                       id="searchInput" 
                       placeholder="Buscar eventos..." 
                       value="${currentFilters.search}">
                <button class="btn-clear" onclick="clearSearch()" ${!currentFilters.search ? 'style="display:none"' : ''}>
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="filters-row">
                <div class="filter-group">
                    <label><i class="fas fa-tag"></i> Categoria</label>
                    <select id="filterCategory" onchange="updateFilters()">
                        <option value="all">Todas as categorias</option>
                        ${categories.map(cat => `
                            <option value="${cat.id}" ${currentFilters.category === cat.id ? 'selected' : ''}>
                                ${cat.name}
                            </option>
                        `).join('')}
                    </select>
                </div>
                
                <div class="filter-group">
                    <label><i class="fas fa-calendar"></i> Data Inicial</label>
                    <input type="date" 
                           id="filterDateFrom" 
                           value="${currentFilters.dateFrom}"
                           onchange="updateFilters()">
                </div>
                
                <div class="filter-group">
                    <label><i class="fas fa-calendar"></i> Data Final</label>
                    <input type="date" 
                           id="filterDateTo" 
                           value="${currentFilters.dateTo}"
                           onchange="updateFilters()">
                </div>
                
                <div class="filter-group">
                    <label><i class="fas fa-map-marker-alt"></i> Localização</label>
                    <input type="text" 
                           id="filterLocation" 
                           placeholder="Ex: São Paulo"
                           value="${currentFilters.location}"
                           onchange="updateFilters()">
                </div>
                
                <div class="filter-group">
                    <label><i class="fas fa-sort"></i> Ordenar por</label>
                    <select id="filterSort" onchange="updateFilters()">
                        <option value="date-asc" ${currentFilters.sortBy === 'date-asc' ? 'selected' : ''}>Data (Mais próximo)</option>
                        <option value="date-desc" ${currentFilters.sortBy === 'date-desc' ? 'selected' : ''}>Data (Mais recente)</option>
                        <option value="title-asc" ${currentFilters.sortBy === 'title-asc' ? 'selected' : ''}>Título (A-Z)</option>
                        <option value="title-desc" ${currentFilters.sortBy === 'title-desc' ? 'selected' : ''}>Título (Z-A)</option>
                        <option value="rating-desc" ${currentFilters.sortBy === 'rating-desc' ? 'selected' : ''}>Melhor Avaliados</option>
                        <option value="attendees-desc" ${currentFilters.sortBy === 'attendees-desc' ? 'selected' : ''}>Mais Inscritos</option>
                    </select>
                </div>
                
                <div class="filter-actions">
                    <button class="btn btn-secondary" onclick="clearAllFilters()">
                        <i class="fas fa-redo"></i> Limpar Filtros
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Setup search input com debounce
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                currentFilters.search = e.target.value;
                updateFilters();
            }, 300);
        });
    }
}

// Atualizar filtros
function updateFilters() {
    const category = document.getElementById('filterCategory');
    const dateFrom = document.getElementById('filterDateFrom');
    const dateTo = document.getElementById('filterDateTo');
    const location = document.getElementById('filterLocation');
    const sort = document.getElementById('filterSort');
    const search = document.getElementById('searchInput');
    
    if (category) currentFilters.category = category.value;
    if (dateFrom) currentFilters.dateFrom = dateFrom.value;
    if (dateTo) currentFilters.dateTo = dateTo.value;
    if (location) currentFilters.location = location.value;
    if (sort) currentFilters.sortBy = sort.value;
    if (search) currentFilters.search = search.value;
    
    // Recarregar eventos com filtros
    if (typeof loadEvents === 'function') {
        loadEvents(applyEventFilters());
    }
    
    // Mostrar contagem de resultados
    const filtered = applyEventFilters();
    showNotification(`${filtered.length} evento(s) encontrado(s)`, 'info');
}

// Limpar busca
function clearSearch() {
    currentFilters.search = '';
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    updateFilters();
}

// Limpar todos os filtros
function clearAllFilters() {
    currentFilters = {
        search: '',
        category: 'all',
        dateFrom: '',
        dateTo: '',
        location: '',
        sortBy: 'date-asc'
    };
    
    renderSearchAndFilters();
    updateFilters();
}

// Busca rápida (tecla de atalho)
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K para abrir busca
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    }
});

// Salvar filtros no localStorage
function saveFiltersToStorage() {
    localStorage.setItem('eventFilters', JSON.stringify(currentFilters));
}

// Carregar filtros salvos
function loadFiltersFromStorage() {
    try {
        const saved = localStorage.getItem('eventFilters');
        if (saved) {
            currentFilters = { ...currentFilters, ...JSON.parse(saved) };
        }
    } catch (error) {
        console.error('Erro ao carregar filtros:', error);
    }
}

// Inicializar ao carregar página de eventos
function initSearchFilters() {
    loadFiltersFromStorage();
    renderSearchAndFilters();
}
