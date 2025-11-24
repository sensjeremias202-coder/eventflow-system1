// Dados da aplicação
let currentUser = null;

// Função segura para carregar do localStorage
function getSafeLocalStorage(key, defaultValue) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error('Erro ao carregar do localStorage:', error);
        return defaultValue;
    }
}

// Dados padrão
const defaultUsers = [
    { id: 1, name: 'Administrador', email: 'admin@eventflow.com', password: 'admin123', role: 'admin', registered: '2023-01-01' },
    { id: 2, name: 'João Silva', email: 'joao@email.com', password: '123456', role: 'user', registered: '2023-02-15' },
    { id: 3, name: 'Maria Andrade', email: 'maria@email.com', password: '123456', role: 'user', registered: '2023-03-10' }
];

const defaultCategories = [
    { id: 1, name: 'Música', color: '#4361ee', icon: 'fas fa-music' },
    { id: 2, name: 'Workshop', color: '#3f37c9', icon: 'fas fa-chalkboard-teacher' },
    { id: 3, name: 'Gastronomia', color: '#4cc9f0', icon: 'fas fa-utensils' },
    { id: 4, name: 'Esportes', color: '#f72585', icon: 'fas fa-running' },
    { id: 5, name: 'Negócios', color: '#f8961e', icon: 'fas fa-briefcase' }
];

const defaultEvents = [
    {
        id: 1,
        title: 'Festival de Música',
        date: '2024-12-15',
        time: '18:00',
        location: 'Parque Central',
        description: 'Um festival com as melhores bandas da região. Traga sua família e amigos!',
        category: 1,
        createdBy: 1,
        ratings: [
            { userId: 2, rating: 4, comment: 'Ótimo evento, adoramos a apresentação!', date: '2023-10-16' },
            { userId: 3, rating: 5, comment: 'Incrível! Já estou ansioso para a próxima edição.', date: '2023-10-16' }
        ]
    },
    {
        id: 2,
        title: 'Workshop de Marketing Digital',
        date: '2024-12-20',
        time: '14:00',
        location: 'Centro de Convenções',
        description: 'Aprenda as melhores estratégias de marketing digital com especialistas.',
        category: 2,
        createdBy: 1,
        ratings: [
            { userId: 2, rating: 4, comment: 'Conteúdo muito relevante para meu negócio.', date: '2023-10-21' }
        ]
    }
];

const defaultMessages = [
    { id: 1, from: 2, to: 1, content: 'Olá, gostaria de saber mais informações sobre o Workshop de Marketing Digital.', timestamp: '2023-10-05T10:25:00' },
    { id: 2, from: 1, to: 2, content: 'Claro! O que você gostaria de saber?', timestamp: '2023-10-05T10:26:00' },
    { id: 3, from: 2, to: 1, content: 'Quais serão os tópicos abordados e se há material incluso.', timestamp: '2023-10-05T10:27:00' },
    { id: 4, from: 1, to: 2, content: 'O workshop abordará SEO, mídias sociais, marketing de conteúdo e análise de dados. Todo material será disponibilizado digitalmente.', timestamp: '2023-10-05T10:28:00' }
];

let users = [];
let categories = [];
let events = [];
let messages = [];

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', function() {
    initializeData();
    setupAuth();
    
    // Se já houver um usuário logado, mostrar a aplicação
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            showApp();
        } catch (error) {
            console.error('Erro ao carregar usuário:', error);
            localStorage.removeItem('currentUser');
        }
    }
});

function initializeData() {
    try {
        users = getSafeLocalStorage('users', defaultUsers);
        categories = getSafeLocalStorage('categories', defaultCategories);
        events = getSafeLocalStorage('events', defaultEvents);
        messages = getSafeLocalStorage('messages', defaultMessages);
        
        // Garantir que os dados sejam salvos inicialmente
        if (!localStorage.getItem('users')) {
            saveData();
        }
    } catch (error) {
        console.error('Erro na inicialização:', error);
        resetToDefaultData();
    }
}

function resetToDefaultData() {
    users = [...defaultUsers];
    categories = [...defaultCategories];
    events = [...defaultEvents];
    messages = [...defaultMessages];
    saveData();
}

// Configurar autenticação
function setupAuth() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');
    
    if (!loginForm || !registerForm) {
        console.error('Formulários de autenticação não encontrados');
        return;
    }
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        if (!email || !password) {
            showNotification('Por favor, preencha todos os campos', 'error');
            return;
        }
        
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            showApp();
            showNotification('Login realizado com sucesso!', 'success');
        } else {
            showNotification('E-mail ou senha incorretos!', 'error');
        }
    });
    
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const role = document.getElementById('registerRole').value;
        
        if (!name || !email || !password) {
            showNotification('Por favor, preencha todos os campos', 'error');
            return;
        }
        
        // Verificar se o e-mail já existe
        if (users.find(u => u.email === email)) {
            showNotification('Este e-mail já está cadastrado!', 'error');
            return;
        }
        
        // Criar novo usuário
        const newUser = {
            id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
            name,
            email,
            password,
            role,
            registered: new Date().toISOString().split('T')[0]
        };
        
        users.push(newUser);
        saveData();
        
        showNotification('Usuário cadastrado com sucesso! Faça login para continuar.', 'success');
        showLoginForm();
    });
    
    if (showRegister) {
        showRegister.addEventListener('click', function(e) {
            e.preventDefault();
            showRegisterForm();
        });
    }
    
    if (showLogin) {
        showLogin.addEventListener('click', function(e) {
            e.preventDefault();
            showLoginForm();
        });
    }
}

function showLoginForm() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm) loginForm.style.display = 'block';
    if (registerForm) registerForm.style.display = 'none';
}

function showRegisterForm() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm) loginForm.style.display = 'none';
    if (registerForm) registerForm.style.display = 'block';
}

function showApp() {
    const loginScreen = document.getElementById('loginScreen');
    const app = document.getElementById('app');
    
    if (loginScreen) loginScreen.style.display = 'none';
    if (app) app.style.display = 'block';
    
    // Atualizar interface com base no usuário atual
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        userNameElement.textContent = currentUser.name;
    }
    
    // Mostrar/ocultar funcionalidades de administrador
    if (currentUser.role === 'admin') {
        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = 'flex';
        });
    }
    
    // Configurar navegação
    setupNavigation();
    
    // Configurar botões
    setupButtons();
    
    // Configurar logout (definido em app.js)
    if (typeof setupLogout === 'function') setupLogout();
    
    // Carregar dados iniciais
    loadDashboard();
    loadEvents();
    loadChatUsers();
    
    if (currentUser.role === 'admin') {
        loadUsersTable();
        loadCategoriesTable();
    }
    
    // Configurar modais
    setupModals();
}

function saveData() {
    try {
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('categories', JSON.stringify(categories));
        localStorage.setItem('events', JSON.stringify(events));
        localStorage.setItem('messages', JSON.stringify(messages));
    } catch (error) {
        console.error('Erro ao salvar dados:', error);
        showNotification('Erro ao salvar dados', 'error');
    }
}

// Sistema de notificações
function showNotification(message, type = 'info') {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    // Estilos da notificação
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4cc9f0' : type === 'error' ? '#f72585' : '#4361ee'};
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 3px 10px rgba(0,0,0,0.2);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 10px;
        max-width: 400px;
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove após 5 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
    
    // Close button
    const closeBtn = notification.querySelector('.notification-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            notification.remove();
        });
    }
}

// Funções auxiliares
function formatDate(dateString) {
    try {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('pt-BR', options);
    } catch (error) {
        console.error('Erro ao formatar data:', error);
        return 'Data inválida';
    }
}

function formatTime(timestamp) {
    try {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
        console.error('Erro ao formatar hora:', error);
        return 'Hora inválida';
    }
}

function generateStarRating(rating) {
    try {
        const numericRating = parseFloat(rating);
        const fullStars = Math.floor(numericRating);
        const hasHalfStar = numericRating % 1 !== 0;
        let stars = '';
        
        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                stars += '<i class="fas fa-star"></i>';
            } else if (i === fullStars + 1 && hasHalfStar) {
                stars += '<i class="fas fa-star-half-alt"></i>';
            } else {
                stars += '<i class="far fa-star"></i>';
            }
        }
        
        return stars;
    } catch (error) {
        console.error('Erro ao gerar estrelas:', error);
        return '<i class="far fa-star"></i>'.repeat(5);
    }
}