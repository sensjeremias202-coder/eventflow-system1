/**
 * Inicialização da página de analytics avançado
 */

function initAdvancedAnalytics() {
    console.log('[analytics-page] Inicializando página de analytics...');
    
    // Verificar se o sistema de analytics está disponível
    if (typeof AdvancedAnalytics !== 'undefined') {
        // Criar instância se não existir
        if (!window.analyticsInstance) {
            window.analyticsInstance = new AdvancedAnalytics();
            console.log('[analytics-page] ✅ AdvancedAnalytics instanciado');
        }
        
        // Inicializar ou atualizar dados
        if (window.analyticsInstance.init) {
            window.analyticsInstance.init();
            console.log('[analytics-page] ✅ Analytics inicializado');
        } else if (window.analyticsInstance.loadDashboard) {
            window.analyticsInstance.loadDashboard();
            console.log('[analytics-page] ✅ Dashboard de analytics carregado');
        }
    } else {
        console.error('[analytics-page] ❌ AdvancedAnalytics não encontrado!');
        showNotification('Erro ao carregar sistema de analytics', 'error');
    }
}

// Exportar função globalmente
window.initAdvancedAnalytics = initAdvancedAnalytics;

console.log('[analytics-page] ✅ Módulo de analytics carregado');
