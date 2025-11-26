/**
 * ============================================
 * SISTEMA DE CARREGAMENTO MODULAR DE PÁGINAS
 * ============================================
 * 
 * Este módulo carrega dinamicamente HTML, CSS e JS
 * de cada página da pasta pages/
 */

// Cache de páginas carregadas
const loadedPages = new Set();
const loadedStyles = new Set();
const loadedScripts = new Set();

/**
 * Carrega uma página modular
 * @param {string} pageName - Nome da página (events, chat, dashboard, etc.)
 * @returns {Promise<void>}
 */
async function loadModularPage(pageName) {
    console.log(`[loader] 📦 Carregando módulo: ${pageName}`);
    
    try {
        // 1. Carregar CSS (se ainda não foi carregado)
        const cssPath = `pages/${pageName}/${pageName}.css?v=${window.APP_VERSION || Date.now()}`;
        if (!loadedStyles.has(cssPath)) {
            await loadCSS(cssPath);
            loadedStyles.add(cssPath);
            console.log(`[loader] ✅ CSS carregado: ${pageName}`);
        }
        
        // 2. Carregar HTML
        const htmlPath = `pages/${pageName}/${pageName}.html?v=${window.APP_VERSION || Date.now()}`;
        if (!loadedPages.has(pageName)) {
            const html = await loadHTML(htmlPath);
            await injectHTML(pageName, html);
            loadedPages.add(pageName);
            console.log(`[loader] ✅ HTML carregado: ${pageName}`);
        }
        
        // 3. Carregar JS (se ainda não foi carregado)
        const jsPath = `pages/${pageName}/${pageName}.js?v=${window.APP_VERSION || Date.now()}`;
        if (!loadedScripts.has(jsPath)) {
            await loadJS(jsPath);
            loadedScripts.add(jsPath);
            console.log(`[loader] ✅ JS carregado: ${pageName}`);
        }
        
        console.log(`[loader] 🎉 Módulo ${pageName} totalmente carregado!`);
        
        // 4. Executar inicialização específica da página
        await initializePage(pageName);
        
    } catch (error) {
        console.error(`[loader] ❌ Erro ao carregar módulo ${pageName}:`, error);
        throw error;
    }
}

/**
 * Carrega um arquivo CSS
 * @param {string} path - Caminho do arquivo CSS
 * @returns {Promise<void>}
 */
function loadCSS(path) {
    return new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = path;
        link.onload = () => resolve();
        link.onerror = () => reject(new Error(`Failed to load CSS: ${path}`));
        document.head.appendChild(link);
    });
}

/**
 * Carrega um arquivo HTML
 * @param {string} path - Caminho do arquivo HTML
 * @returns {Promise<string>}
 */
async function loadHTML(path) {
    // Extrair nome da página do caminho (ex: pages/events/events.html -> events)
    const pageName = path.match(/pages\/([^\/]+)\//)?.[1];
    
    if (pageName) {
        // Tentar usar template inline primeiro
        const template = document.getElementById(`template-${pageName}`);
        if (template) {
            console.log(`[loader] ✅ Usando template inline: ${pageName}`);
            return template.innerHTML;
        }
    }
    
    // Fallback para fetch (requer servidor HTTP)
    const response = await fetch(path);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.text();
}

/**
 * Injeta HTML na página
 * @param {string} pageName - Nome da página
 * @param {string} html - Conteúdo HTML
 * @returns {Promise<void>}
 */
async function injectHTML(pageName, html) {
    // Buscar ou criar container da página
    let pageContainer = document.getElementById(`${pageName}-page`);
    
    if (!pageContainer) {
        pageContainer = document.createElement('div');
        pageContainer.id = `${pageName}-page`;
        pageContainer.className = 'page';
        
        // Inserir no content area
        const contentArea = document.querySelector('.content');
        if (contentArea) {
            contentArea.appendChild(pageContainer);
        } else {
            console.warn(`[loader] ⚠️ Content area não encontrada para ${pageName}`);
            return;
        }
    }
    
    // Inserir conteúdo HTML
    pageContainer.innerHTML = html;
}

/**
 * Carrega um arquivo JavaScript
 * @param {string} path - Caminho do arquivo JS
 * @returns {Promise<void>}
 */
function loadJS(path) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = path;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load JS: ${path}`));
        document.body.appendChild(script);
    });
}

/**
 * Inicializa funcionalidades específicas de cada página
 * @param {string} pageName - Nome da página
 * @returns {Promise<void>}
 */
async function initializePage(pageName) {
    console.log(`[loader] 🚀 Inicializando ${pageName}...`);
    
    switch (pageName) {
        case 'events':
            // Inicializar página de eventos
            if (typeof initEventsPage === 'function') {
                initEventsPage();
            } else {
                // Fallback para carregamento normal
                if (typeof loadEvents === 'function') {
                    loadEvents();
                }
                // Carregar opções de categoria no select
                if (typeof loadCategoryOptions === 'function') {
                    loadCategoryOptions();
                }
            }
            break;
            
        case 'dashboard':
            // Carregar dashboard
            if (typeof loadDashboard === 'function') {
                loadDashboard();
            }
            break;
            
        case 'chat':
            // Inicializar chat completo
            if (typeof initChat === 'function') {
                initChat();
            } else {
                // Fallback para compatibilidade
                if (typeof loadChatUsers === 'function') {
                    loadChatUsers();
                }
                if (typeof setupChat === 'function') {
                    setupChat();
                }
            }
            break;
            
        case 'profile':
            // Inicializar página de perfil
            if (typeof initProfilePage === 'function') {
                initProfilePage();
            } else if (typeof loadProfile === 'function') {
                // Fallback para compatibilidade
                loadProfile();
            }
            break;
            
        case 'financeiro':
            // Carregar página financeira
            if (typeof loadFinanceiro === 'function') {
                loadFinanceiro();
            }
            break;
            
        case 'graficos':
            // Carregar página de gráficos
            if (typeof loadGraficos === 'function') {
                loadGraficos();
            }
            break;
            
        case 'users':
            // Carregar tabela de usuários (admin only)
            if (currentUser?.role === 'admin' && typeof loadUsersTable === 'function') {
                loadUsersTable();
            }
            break;
            
        case 'categories':
            // Inicializar página de categorias (admin only)
            if (currentUser?.role === 'admin' && typeof initCategoriesPage === 'function') {
                initCategoriesPage();
            } else if (currentUser?.role === 'admin' && typeof loadCategoriesTable === 'function') {
                loadCategoriesTable();
            }
            break;
            
        case 'ai-assistant':
            // Inicializar assistente AI
            if (typeof initAiAssistant === 'function') {
                initAiAssistant();
            }
            break;
            
        case 'calendar':
            // Inicializar calendário
            if (typeof initCalendar === 'function') {
                initCalendar();
            } else if (window.CalendarSystem) {
                // Fallback para instância global
                window.calendarInstance = window.calendarInstance || new CalendarSystem();
            }
            break;
            
        case 'volunteers':
            // Inicializar sistema de voluntários
            if (typeof initVolunteers === 'function') {
                initVolunteers();
            } else if (window.VolunteerSystem) {
                // Fallback para instância global
                window.volunteerInstance = window.volunteerInstance || new VolunteerSystem();
            }
            break;
            
        case 'analytics':
            // Inicializar analytics avançado
            if (typeof initAdvancedAnalytics === 'function') {
                initAdvancedAnalytics();
            } else if (window.AdvancedAnalytics) {
                // Fallback para instância global
                window.analyticsInstance = window.analyticsInstance || new AdvancedAnalytics();
                if (window.analyticsInstance.init) {
                    window.analyticsInstance.init();
                }
            }
            break;
            
        case 'payments':
            // Inicializar sistema de pagamentos
            if (typeof initPayments === 'function') {
                initPayments();
            } else if (window.PaymentSystem) {
                // Fallback para instância global
                window.paymentInstance = window.paymentInstance || new PaymentSystem();
            }
            break;
            
        case 'streaming':
            // Inicializar sistema de transmissões ao vivo
            if (typeof initStreaming === 'function') {
                initStreaming();
            } else if (window.LiveStreamingSystem) {
                // Fallback para instância global
                window.streamingInstance = window.streamingInstance || new LiveStreamingSystem();
            }
            break;
            
        case 'settings':
            // Inicializar página de configurações
            if (typeof initSettings === 'function') {
                initSettings();
            } else {
                // Inicializar sub-sistemas de configurações
                if (window.ThemeCustomizer && typeof window.themeCustomizer === 'undefined') {
                    window.themeCustomizer = new ThemeCustomizer();
                }
                if (window.I18nSystem && typeof window.i18nSystem === 'undefined') {
                    window.i18nSystem = new I18nSystem();
                }
            }
            break;
    }
}

/**
 * Mostra uma página (com carregamento lazy)
 * @param {string} pageName - Nome da página
 * @returns {Promise<void>}
 */
async function showModularPage(pageName) {
    try {
        console.log(`[loader] 🔄 Solicitando página: ${pageName}`);
        
        // 1. Carregar módulo se ainda não foi carregado
        if (!loadedPages.has(pageName)) {
            await loadModularPage(pageName);
        }
        
        // 2. Ocultar todas as páginas
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        
        // 3. Mostrar página solicitada
        const pageElement = document.getElementById(`${pageName}-page`);
        if (pageElement) {
            pageElement.classList.add('active');
            console.log(`[loader] ✅ Página ${pageName} exibida`);
            
            // 4. Re-inicializar página (reload de dados)
            await initializePage(pageName);
        } else {
            console.error(`[loader] ❌ Elemento da página não encontrado: ${pageName}-page`);
        }
        
    } catch (error) {
        console.error(`[loader] ❌ Erro ao mostrar página ${pageName}:`, error);
        showNotification(`Erro ao carregar página: ${pageName}`, 'error');
    }
}

// Expor função globalmente para compatibilidade
window.showModularPage = showModularPage;
window.loadModularPage = loadModularPage;

console.log('[loader] ✅ Sistema de carregamento modular inicializado');
