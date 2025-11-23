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
    }
}

function setupModals() {
    // Modal de evento
    const addEventBtn = document.getElementById('addEventBtn');
    const addEventModal = document.getElementById('addEventModal');
    const eventModalClose = addEventModal.querySelector('.modal-close');
    
    if (addEventBtn) {
        addEventBtn.addEventListener('click', () => {
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
}