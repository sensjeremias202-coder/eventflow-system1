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
        console.log('[auth] Inicializando dados da aplicação...');
        
        // Se Firebase está ativo, aguardar dados do Firebase
        if (window.firebaseInitialized && window.firebaseDatabase) {
            console.log('[auth] 🔥 Firebase ativo - aguardando dados remotos...');
            
            // Carregar dados locais como fallback temporário
            users = getSafeLocalStorage('users', defaultUsers);
            categories = getSafeLocalStorage('categories', defaultCategories);
            events = getSafeLocalStorage('events', defaultEvents);
            messages = getSafeLocalStorage('messages', defaultMessages);
            
            // Os listeners do Firebase atualizarão os dados em breve
        } else {
            console.log('[auth] 💾 Modo local - usando localStorage');
            users = getSafeLocalStorage('users', defaultUsers);
            categories = getSafeLocalStorage('categories', defaultCategories);
            events = getSafeLocalStorage('events', defaultEvents);
            messages = getSafeLocalStorage('messages', defaultMessages);
            
            // Garantir que os dados sejam salvos inicialmente
            if (!localStorage.getItem('users')) {
                saveData();
            }
        }
    } catch (error) {
        console.error('Erro na inicialização:', error);
        resetToDefaultData();
    }
}

function resetToDefaultData() {
    console.log('[auth] resetToDefaultData chamado — restaurando defaults');
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

        console.log('[auth] Tentativa de login para:', email);
        try {
            console.log('[auth] Usuários carregados:', Array.isArray(users) ? users.length : typeof users, users && users.slice ? users.slice(0,5) : users);
        } catch (e) {
            console.error('[auth] Erro ao logar estado users:', e);
        }
        
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
    console.log('[auth] showApp() — currentUser:', currentUser);
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
        // Usar sistema de sincronização se disponível
        if (typeof saveDataWithSync === 'function') {
            saveDataWithSync();
        } else {
            // Fallback para salvamento local apenas
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.setItem('categories', JSON.stringify(categories));
            localStorage.setItem('events', JSON.stringify(events));
            localStorage.setItem('messages', JSON.stringify(messages));
        }
    } catch (error) {
        console.error('Erro ao salvar dados:', error);
        showNotification('Erro ao salvar dados', 'error');
    }
}

// Sistema de notificações
function showNotification(message, type = 'info') {
    // backward-compatible signature: showNotification(message, type, options)
}

function showNotification(message, type = 'info', options = {}) {
    // options: duration (ms), actionLabel, actionCallback
    const duration = options.duration || 5000;
    const actionLabel = options.actionLabel;
    const actionCallback = typeof options.actionCallback === 'function' ? options.actionCallback : null;

    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;

    const content = document.createElement('div');
    content.innerText = message;
    content.style.flex = '1';

    const actions = document.createElement('div');
    actions.style.display = 'flex';
    actions.style.alignItems = 'center';
    actions.style.gap = '8px';

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'notification-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.style.background = 'transparent';
    closeBtn.style.border = 'none';
    closeBtn.style.color = 'white';
    closeBtn.style.cursor = 'pointer';

    // Optional action button (e.g., Desfazer)
    let actionBtn = null;
    if (actionLabel) {
        actionBtn = document.createElement('button');
        actionBtn.className = 'notification-action';
        actionBtn.innerText = actionLabel;
        actionBtn.style.cursor = 'pointer';
        actionBtn.style.border = '1px solid rgba(255,255,255,0.2)';
        actionBtn.style.background = 'transparent';
        actionBtn.style.color = 'white';
        actionBtn.style.padding = '6px 10px';
        actionBtn.style.borderRadius = '6px';
    }

    notification.appendChild(content);
    if (actionBtn) actions.appendChild(actionBtn);
    actions.appendChild(closeBtn);
    notification.appendChild(actions);

    // Estilos da notificação (inline para simplicidade)
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--danger)' : 'var(--primary)'};
        color: white;
        padding: 12px 14px;
        border-radius: 8px;
        box-shadow: 0 6px 18px rgba(0,0,0,0.12);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 12px;
        max-width: 420px;
        animation: toastIn 260ms ease;
    `;

    // Append and auto-remove
    document.body.appendChild(notification);

    const timer = setTimeout(() => {
        if (notification.parentNode) notification.remove();
    }, duration);

    function closeNotification() {
        clearTimeout(timer);
        if (notification.parentNode) notification.remove();
    }

    closeBtn.addEventListener('click', closeNotification);

    if (actionBtn && actionCallback) {
        actionBtn.addEventListener('click', () => {
            try { actionCallback(); } catch (e) { console.error(e); }
            closeNotification();
        });
    }
}

// small animation for toasts
const styleEl = document.createElement('style');
styleEl.innerHTML = `
@keyframes toastIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
`;
document.head.appendChild(styleEl);


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