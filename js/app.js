function setupNavigation() {
    // Navegação principal
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            if (page) {
                showPage(page);
                
                // Atualizar estado ativo
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
    
    // Navegação da sidebar
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            if (page) {
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
            }
        });
    });
    
    // Botão de logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('Tem certeza que deseja sair?')) {
                currentUser = null;
                localStorage.removeItem('currentUser');
                const app = document.getElementById('app');
                const loginScreen = document.getElementById('loginScreen');
                
                if (app) app.style.display = 'none';
                if (loginScreen) loginScreen.style.display = 'flex';
                
                showLoginForm();
                showNotification('Logout realizado com sucesso!', 'success');
            }
        });
    }
}

function setupButtons() {
    // Configurar botão "Meus Eventos" para usuários comuns
    const myEventsBtn = document.getElementById('myEventsBtn');
    if (myEventsBtn && currentUser && currentUser.role === 'user') {
        myEventsBtn.style.display = 'block';
        myEventsBtn.addEventListener('click', function() {
            loadMyEvents();
        });
    }
}

function showPage(page) {
    if (!page) return;
    
    // Ocultar todas as páginas
    document.querySelectorAll('.page').forEach(p => {
        if (p.classList.contains('active')) {
            p.classList.remove('active');
        }
    });
    
    // Mostrar a página solicitada
    const pageElement = document.getElementById(`${page}-page`);
    if (pageElement) {
        pageElement.classList.add('active');
    }
    
    // Recarregar dados específicos da página
    switch (page) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'events':
            loadEvents();
            break;
        case 'chat':
            loadChatUsers();
            break;
        case 'users':
            if (currentUser && currentUser.role === 'admin') {
                loadUsersTable();
            }
            break;
        case 'categories':
            if (currentUser && currentUser.role === 'admin') {
                loadCategoriesTable();
            }
            break;
    }
}

function setupModals() {
    // Modal de evento
    const addEventBtn = document.getElementById('addEventBtn');
    const addEventModal = document.getElementById('addEventModal');
    
    if (addEventBtn && addEventModal) {
        addEventBtn.addEventListener('click', () => {
            loadCategoryOptions();
            addEventModal.classList.add('active');
        });
        
        const eventModalClose = addEventModal.querySelector('.modal-close');
        if (eventModalClose) {
            eventModalClose.addEventListener('click', () => {
                addEventModal.classList.remove('active');
                // Resetar formulário
                const form = document.getElementById('addEventForm');
                if (form) {
                    form.reset();
                    const submitBtn = form.querySelector('button[type="submit"]');
                    if (submitBtn) {
                        submitBtn.textContent = 'Criar Evento';
                    }
                }
            });
        }
    }
    
    // Modal de usuário
    const addUserBtn = document.getElementById('addUserBtn');
    const addUserModal = document.getElementById('addUserModal');
    
    if (addUserBtn && addUserModal) {
        addUserBtn.addEventListener('click', () => {
            addUserModal.classList.add('active');
        });
        
        const userModalClose = addUserModal.querySelector('.modal-close');
        if (userModalClose) {
            userModalClose.addEventListener('click', () => {
                addUserModal.classList.remove('active');
                const form = document.getElementById('addUserForm');
                if (form) form.reset();
            });
        }
    }
    
    // Modal de categoria
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    const addCategoryModal = document.getElementById('addCategoryModal');
    
    if (addCategoryBtn && addCategoryModal) {
        addCategoryBtn.addEventListener('click', () => {
            addCategoryModal.classList.add('active');
        });
        
        const categoryModalClose = addCategoryModal.querySelector('.modal-close');
        if (categoryModalClose) {
            categoryModalClose.addEventListener('click', () => {
                addCategoryModal.classList.remove('active');
                const form = document.getElementById('addCategoryForm');
                if (form) form.reset();
            });
        }
    }
    
    // Modal de detalhes do evento
    const eventDetailsModal = document.getElementById('eventDetailsModal');
    if (eventDetailsModal) {
        const eventDetailsClose = eventDetailsModal.querySelector('.modal-close');
        if (eventDetailsClose) {
            eventDetailsClose.addEventListener('click', () => {
                eventDetailsModal.classList.remove('active');
            });
        }
    }
    
    // Fechar modais ao clicar fora
    window.addEventListener('click', (e) => {
        const modals = [
            'addEventModal',
            'addUserModal', 
            'addCategoryModal',
            'eventDetailsModal'
        ];
        
        modals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (modal && e.target === modal) {
                modal.classList.remove('active');
                
                // Resetar formulários se necessário
                if (modalId === 'addEventModal') {
                    const form = document.getElementById('addEventForm');
                    if (form) {
                        form.reset();
                        const submitBtn = form.querySelector('button[type="submit"]');
                        if (submitBtn) {
                            submitBtn.textContent = 'Criar Evento';
                        }
                    }
                }
            }
        });
    });
    
    // Formulário de evento
    const eventForm = document.getElementById('addEventForm');
    if (eventForm) {
        // Remover event listeners anteriores
        const newEventForm = eventForm.cloneNode(true);
        eventForm.parentNode.replaceChild(newEventForm, eventForm);
        
        document.getElementById('addEventForm').addEventListener('submit', function(e) {
            e.preventDefault();
            if (validateEventForm()) {
                createEvent();
            }
        });
    }
    
    // Formulário de usuário
    const userForm = document.getElementById('addUserForm');
    if (userForm) {
        userForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (validateUserForm()) {
                createUser();
            }
        });
    }
    
    // Formulário de categoria
    const categoryForm = document.getElementById('addCategoryForm');
    if (categoryForm) {
        categoryForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (validateCategoryForm()) {
                createCategory();
            }
        });
    }
}

function loadCategoryOptions() {
    const categorySelect = document.getElementById('eventCategory');
    if (!categorySelect) return;
    
    categorySelect.innerHTML = '<option value="">Selecione uma categoria</option>';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
    });
}

// Validações de formulário
function validateEventForm() {
    const title = document.getElementById('eventTitle')?.value.trim();
    const date = document.getElementById('eventDate')?.value;
    const time = document.getElementById('eventTime')?.value;
    const location = document.getElementById('eventLocation')?.value.trim();
    const description = document.getElementById('eventDescription')?.value.trim();
    const category = document.getElementById('eventCategory')?.value;
    
    if (!title) {
        showNotification('Título do evento é obrigatório', 'error');
        return false;
    }
    
    if (!date) {
        showNotification('Data do evento é obrigatória', 'error');
        return false;
    }
    
    if (new Date(date) < new Date().setHours(0,0,0,0)) {
        showNotification('Data do evento não pode ser no passado', 'error');
        return false;
    }
    
    if (!time) {
        showNotification('Horário do evento é obrigatório', 'error');
        return false;
    }
    
    if (!location) {
        showNotification('Local do evento é obrigatório', 'error');
        return false;
    }
    
    if (!description) {
        showNotification('Descrição do evento é obrigatória', 'error');
        return false;
    }
    
    if (!category) {
        showNotification('Categoria do evento é obrigatória', 'error');
        return false;
    }
    
    return true;
}

function validateUserForm() {
    const name = document.getElementById('newUserName')?.value.trim();
    const email = document.getElementById('newUserEmail')?.value.trim();
    const password = document.getElementById('newUserPassword')?.value;
    
    if (!name) {
        showNotification('Nome do usuário é obrigatório', 'error');
        return false;
    }
    
    if (!email) {
        showNotification('E-mail do usuário é obrigatório', 'error');
        return false;
    }
    
    // Validação simples de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showNotification('Por favor, insira um e-mail válido', 'error');
        return false;
    }
    
    if (!password) {
        showNotification('Senha do usuário é obrigatória', 'error');
        return false;
    }
    
    if (password.length < 6) {
        showNotification('A senha deve ter pelo menos 6 caracteres', 'error');
        return false;
    }
    
    return true;
}

function validateCategoryForm() {
    const name = document.getElementById('categoryName')?.value.trim();
    const icon = document.getElementById('categoryIcon')?.value.trim();
    
    if (!name) {
        showNotification('Nome da categoria é obrigatório', 'error');
        return false;
    }
    
    if (!icon) {
        showNotification('Ícone da categoria é obrigatório', 'error');
        return false;
    }
    
    return true;
}
// Adicione esta função no app.js
function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        // Remover event listeners anteriores
        const newLogoutBtn = logoutBtn.cloneNode(true);
        logoutBtn.parentNode.replaceChild(newLogoutBtn, logoutBtn);
        
        document.getElementById('logoutBtn').addEventListener('click', function(e) {
            e.preventDefault();
            
            if (confirm('Tem certeza que deseja sair do sistema?')) {
                // Parar todas as atualizações automáticas
                stopAutoMessages();
                
                // Limpar dados da sessão
                currentUser = null;
                localStorage.removeItem('currentUser');
                
                // Esconder aplicação e mostrar login
                const app = document.getElementById('app');
                const loginScreen = document.getElementById('loginScreen');
                
                if (app) app.style.display = 'none';
                if (loginScreen) {
                    loginScreen.style.display = 'flex';
                    // Resetar formulário de login
                    const loginForm = document.getElementById('loginForm');
                    if (loginForm) loginForm.reset();
                }
                
                showNotification('Logout realizado com sucesso!', 'success');
            }
        });
    }
}

// Chame esta função no showApp()
function showApp() {
    // ... código existente ...
    
    // Configurar logout
    setupLogout();
    
    // ... resto do código ...
}
function setupModals() {
    // Configurar botões de fechar em todos os modais
    document.querySelectorAll('.modal').forEach(modal => {
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.classList.remove('active');
            });
        }
        
        // Adicionar botão de fechar extra
        const extraCloseBtn = document.createElement('button');
        extraCloseBtn.className = 'btn-close-modal';
        extraCloseBtn.innerHTML = '&times;';
        extraCloseBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
        modal.querySelector('.modal-header').appendChild(extraCloseBtn);
    });
    
    // ... resto do código dos modais ...
}