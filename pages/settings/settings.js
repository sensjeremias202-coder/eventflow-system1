/**
 * Inicialização da página de configurações
 */

function initSettings() {
    console.log('[settings-page] Inicializando página de configurações...');
    
    // Inicializar sistema de temas
    if (typeof ThemeCustomizer !== 'undefined' && !window.themeCustomizer) {
        window.themeCustomizer = new ThemeCustomizer();
        console.log('[settings-page] ✅ ThemeCustomizer instanciado');
    }
    
    // Inicializar sistema de internacionalização
    if (typeof I18nSystem !== 'undefined' && !window.i18nSystem) {
        window.i18nSystem = new I18nSystem();
        console.log('[settings-page] ✅ I18nSystem instanciado');
    }
    
    // Inicializar sistema de integração CRM
    if (typeof CRMIntegration !== 'undefined' && !window.crmIntegration) {
        window.crmIntegration = new CRMIntegration();
        console.log('[settings-page] ✅ CRMIntegration instanciado');
    }
    
    // Carregar configurações salvas
    loadCurrentSettings();
    
    // Renderizar customizadores se disponíveis
    if (window.themeCustomizer && window.themeCustomizer.renderCustomizer) {
        themeCustomizer.renderCustomizer();
    }
    
    if (window.i18nSystem && window.i18nSystem.renderLanguageSelector) {
        i18nSystem.renderLanguageSelector();
    }
    
    console.log('[settings-page] ✅ Página de configurações inicializada');
}

function loadCurrentSettings() {
    // Carregar tema atual
    const savedTheme = localStorage.getItem('eventflow_theme');
    if (savedTheme && window.themeCustomizer) {
        try {
            const theme = JSON.parse(savedTheme);
            window.themeCustomizer.applyTheme(theme);
        } catch (e) {
            console.warn('[settings-page] Erro ao carregar tema salvo:', e);
        }
    }
    
    // Carregar idioma atual
    const savedLang = localStorage.getItem('eventflow_language') || 'pt-BR';
    if (window.i18nSystem) {
        // Ajuste: usar a API disponível do i18n
        if (typeof window.i18nSystem.setLanguage === 'function') {
            window.i18nSystem.setLanguage(savedLang);
        } else if (typeof window.i18nSystem.changeLanguage === 'function') {
            // InternationalizationSystem expõe changeLanguage
            window.i18nSystem.changeLanguage(savedLang.split('-')[0]);
        }
    }
    
    // Atualizar interface com valores atuais
    updateSettingsUI();
}

function updateSettingsUI() {
    // Atualizar seletor de idioma
    const langSelector = document.getElementById('languageSelect');
    if (langSelector) {
        const currentLang = localStorage.getItem('eventflow_language') || 'pt-BR';
        langSelector.value = currentLang;
    }
    
    // Atualizar preview de tema
    const savedTheme = localStorage.getItem('eventflow_theme');
    if (savedTheme) {
        try {
            const theme = JSON.parse(savedTheme);
            // Atualizar inputs de cores se existirem
            if (theme.primaryColor) {
                const primaryInput = document.getElementById('primaryColor');
                if (primaryInput) primaryInput.value = theme.primaryColor;
            }
        } catch (e) {
            console.warn('[settings-page] Erro ao atualizar UI:', e);
        }
    }
}

function forceSyncData() {
    if (window.syncManager) {
        syncManager.forcePullFromFirebase();
        showNotification('Sincronização iniciada!', 'success');
    }
}

function clearLocalData() {
    if (confirm('Tem certeza que deseja limpar todos os dados locais? Esta ação não pode ser desfeita.')) {
        localStorage.clear();
        showNotification('Dados locais limpos!', 'success');
        setTimeout(() => location.reload(), 1500);
    }
}

// Exportar funções globalmente
window.initSettings = initSettings;
window.loadCurrentSettings = loadCurrentSettings;
window.updateSettingsUI = updateSettingsUI;
window.forceSyncData = forceSyncData;
window.clearLocalData = clearLocalData;

console.log('[settings-page] ✅ Módulo de configurações carregado');
