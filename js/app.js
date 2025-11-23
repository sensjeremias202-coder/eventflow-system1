function setupNavigation() {
    // Navegação principal
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            showPage(page);
            
            // Atualizar estado ativo
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Navegação da sidebar
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            showPage(page);
            
            // Atualizar estado ativo
            document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Atualizar navegação principal
            document.querySelectorAll('.nav-link').forEach(l => {
                l.classList.remove('active');
                if (l.getAttribute('data-page') === page) {
                    l.classList.add('active');
                }
            });
        });
    });
    
    // Botão de logout
    document.getElementById('logoutBtn').addEventListener('click', function() {
        currentUser = null;
        localStorage.removeItem('currentUser');
        document.getElementById('app').style.display = 'none';
        document.getElementById('loginScreen').style.display = 'flex';
        showLoginForm();
    });
}

function setupButtons() {
    // Configurar botão "Meus Eventos" para usuários comuns
    const myEventsBtn = document.getElementById('myEventsBtn');
    if (myEventsBtn && currentUser.role === 'user') {
        myEventsBtn.style.display = 'block';
        myEventsBtn.addEventListener('click', function() {
            loadMyEvents();
        });
    }
}

function showPage(page) {
    // Ocultar todas as páginas
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    // Mostrar a página solicitada
    document.getElementById(`${page}-page`).classList.add('active');
    
    // Recarregar dados específicos da página
    if (page === 'dashboard') {
        loadDashboard();
    } else if (page === 'events') {
        loadEvents();
    } else if (page === 'chat') {
        loadChatUsers();
    } else if (page === 'users' && currentUser.role === 'admin') {
        loadUsersTable();
    } else if (page === 'categories' && currentUser.role === 'admin') {
        loadCategoriesTable();
    }
}

function setupModals() {
    // Modal de evento
    const addEventBtn = document.getElementById('addEventBtn');
    const addEventModal = document.getElementById('addEventModal');
    const eventModalClose = addEventModal.querySelector('.modal-close');
    
    if (addEventBtn) {
        addEventBtn.addEventListener('click', () => {
            loadCategoryOptions();
            addEventModal.classList.add('active');
        });
    }
    
    eventModalClose.addEventListener('click', () => {
        addEventModal.classList.remove('active');
    });
    
    // Modal de usuário
    const addUserBtn = document.getElementById('addUserBtn');
    const addUserModal = document.getElementById('addUserModal');
    const userModalClose = addUserModal.querySelector('.modal-close');
    
    if (addUserBtn) {
        addUserBtn.addEventListener('click', () => {
            addUserModal.classList.add('active');
        });
    }
    
    userModalClose.addEventListener('click', () => {
        addUserModal.classList.remove('active');
    });
    
    // Modal de categoria
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    const addCategoryModal = document.getElementById('addCategoryModal');
    const categoryModalClose = addCategoryModal.querySelector('.modal-close');
    
    if (addCategoryBtn) {
        addCategoryBtn.addEventListener('click', () => {
            addCategoryModal.classList.add('active');
        });
    }
    
    categoryModalClose.addEventListener('click', () => {
        addCategoryModal.classList.remove('active');
    });
    
    // Modal de detalhes do evento
    const eventDetailsModal = document.getElementById('eventDetailsModal');
    const eventDetailsClose = eventDetailsModal.querySelector('.modal-close');
    
    eventDetailsClose.addEventListener('click', () => {
        eventDetailsModal.classList.remove('active');
    });
    
    // Fechar modais ao clicar fora
    window.addEventListener('click', (e) => {
        if (e.target === addEventModal) {
            addEventModal.classList.remove('active');
        }
        if (e.target === addUserModal) {
            addUserModal.classList.remove('active');
        }
        if (e.target === addCategoryModal) {
            addCategoryModal.classList.remove('active');
        }
        if (e.target === eventDetailsModal) {
            eventDetailsModal.classList.remove('active');
        }
    });
    
    // Formulário de evento
    document.getElementById('addEventForm').addEventListener('submit', (e) => {
        e.preventDefault();
        createEvent();
    });
    
    // Formulário de usuário
    document.getElementById('addUserForm').addEventListener('submit', (e) => {
        e.preventDefault();
        createUser();
    });
    
    // Formulário de categoria
    document.getElementById('addCategoryForm').addEventListener('submit', (e) => {
        e.preventDefault();
        createCategory();
    });
}

function loadCategoryOptions() {
    const categorySelect = document.getElementById('eventCategory');
    categorySelect.innerHTML = '<option value="">Selecione uma categoria</option>';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
    });
}