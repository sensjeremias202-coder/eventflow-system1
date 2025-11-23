// Dados da aplicação
let currentUser = null;
let users = JSON.parse(localStorage.getItem('users')) || [
    { id: 1, name: 'Administrador', email: 'admin@eventflow.com', password: 'admin123', role: 'admin', registered: '2023-01-01' },
    { id: 2, name: 'João Silva', email: 'joao@email.com', password: '123456', role: 'user', registered: '2023-02-15' },
    { id: 3, name: 'Maria Andrade', email: 'maria@email.com', password: '123456', role: 'user', registered: '2023-03-10' }
];

let events = JSON.parse(localStorage.getItem('events')) || [
    {
        id: 1,
        title: 'Festival de Música',
        date: '2023-10-15',
        time: '18:00',
        location: 'Parque Central',
        description: 'Um festival com as melhores bandas da região. Traga sua família e amigos!',
        category: 'music',
        createdBy: 1,
        ratings: [
            { userId: 2, rating: 4, comment: 'Ótimo evento, adoramos a apresentação!', date: '2023-10-16' },
            { userId: 3, rating: 5, comment: 'Incrível! Já estou ansioso para a próxima edição.', date: '2023-10-16' }
        ]
    },
    {
        id: 2,
        title: 'Workshop de Marketing Digital',
        date: '2023-10-20',
        time: '14:00',
        location: 'Centro de Convenções',
        description: 'Aprenda as melhores estratégias de marketing digital com especialistas.',
        category: 'workshop',
        createdBy: 1,
        ratings: [
            { userId: 2, rating: 4, comment: 'Conteúdo muito relevante para meu negócio.', date: '2023-10-21' }
        ]
    }
];

let messages = JSON.parse(localStorage.getItem('messages')) || [
    { id: 1, from: 2, to: 1, content: 'Olá, gostaria de saber mais informações sobre o Workshop de Marketing Digital.', timestamp: '2023-10-05T10:25:00' },
    { id: 2, from: 1, to: 2, content: 'Claro! O que você gostaria de saber?', timestamp: '2023-10-05T10:26:00' },
    { id: 3, from: 2, to: 1, content: 'Quais serão os tópicos abordados e se há material incluso.', timestamp: '2023-10-05T10:27:00' },
    { id: 4, from: 1, to: 2, content: 'O workshop abordará SEO, mídias sociais, marketing de conteúdo e análise de dados. Todo material será disponibilizado digitalmente.', timestamp: '2023-10-05T10:28:00' }
];

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', function() {
    // Salvar dados iniciais no localStorage
    saveData();
    
    // Configurar eventos de login/registro
    setupAuth();
    
    // Se já houver um usuário logado, mostrar a aplicação
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showApp();
    }
});

// Configurar autenticação
function setupAuth() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            showApp();
        } else {
            alert('E-mail ou senha incorretos!');
        }
    });
    
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const role = document.getElementById('registerRole').value;
        
        // Verificar se o e-mail já existe
        if (users.find(u => u.email === email)) {
            alert('Este e-mail já está cadastrado!');
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
        
        alert('Usuário cadastrado com sucesso! Faça login para continuar.');
        showLoginForm();
    });
    
    showRegister.addEventListener('click', function(e) {
        e.preventDefault();
        showRegisterForm();
    });
    
    showLogin.addEventListener('click', function(e) {
        e.preventDefault();
        showLoginForm();
    });
}

function showLoginForm() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
}

function showRegisterForm() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
}

function showApp() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('app').style.display = 'block';
    
    // Atualizar interface com base no usuário atual
    document.getElementById('userName').textContent = currentUser.name;
    
    // Mostrar/ocultar funcionalidades de administrador
    if (currentUser.role === 'admin') {
        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = 'flex';
        });
    }
    
    // Configurar navegação
    setupNavigation();
    
    // Carregar dados iniciais
    loadDashboard();
    loadEvents();
    loadChatUsers();
    if (currentUser.role === 'admin') {
        loadUsersTable();
    }
    
    // Configurar modais
    setupModals();
}

function saveData() {
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('events', JSON.stringify(events));
    localStorage.setItem('messages', JSON.stringify(messages));
}

// Funções auxiliares
function getCategoryColor(category) {
    const colors = {
        music: '#4361ee',
        workshop: '#3f37c9',
        food: '#4cc9f0',
        sports: '#f72585',
        business: '#f8961e'
    };
    return colors[category] || '#4361ee';
}

function getCategoryIcon(category) {
    const icons = {
        music: 'fas fa-music',
        workshop: 'fas fa-chalkboard-teacher',
        food: 'fas fa-utensils',
        sports: 'fas fa-running',
        business: 'fas fa-briefcase'
    };
    return icons[category] || 'fas fa-calendar-alt';
}

function formatDate(dateString) {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function generateStarRating(rating) {
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
}
function showApp() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('app').style.display = 'block';
    
    // Atualizar interface com base no usuário atual
    document.getElementById('userName').textContent = currentUser.name;
    
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