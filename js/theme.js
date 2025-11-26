/**
 * ============================================
 * SISTEMA DE MODO ESCURO/CLARO
 * ============================================
 */

let currentTheme = 'light';

// Inicializar tema
function initTheme() {
    const saved = localStorage.getItem('theme');
    currentTheme = saved || 'light';
    applyTheme(currentTheme);
    updateThemeToggleButton();
}

// Aplicar tema
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    currentTheme = theme;
    localStorage.setItem('theme', theme);
}

// Toggle tema
function toggleTheme() {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
    updateThemeToggleButton();
    
    showNotification(`Modo ${newTheme === 'dark' ? 'escuro' : 'claro'} ativado`, 'success');
}

// Atualizar botão de tema
function updateThemeToggleButton() {
    const btn = document.getElementById('themeToggle');
    if (btn) {
        btn.innerHTML = currentTheme === 'dark' 
            ? '<i class="fas fa-sun"></i>' 
            : '<i class="fas fa-moon"></i>';
        btn.title = currentTheme === 'dark' ? 'Modo Claro' : 'Modo Escuro';
    }
}

// Inicializar ao carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTheme);
} else {
    initTheme();
}
