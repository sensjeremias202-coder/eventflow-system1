/**
 * Inicialização da página de voluntários
 */

function initVolunteers() {
    console.log('[volunteers-page] Inicializando página de voluntários...');
    
    // Verificar se o sistema de voluntários está disponível
    if (typeof VolunteerSystem !== 'undefined') {
        // Criar instância se não existir
        if (!window.volunteerInstance) {
            window.volunteerInstance = new VolunteerSystem();
            console.log('[volunteers-page] ✅ VolunteerSystem instanciado');
        } else {
            // Recarregar dados se já existe
            if (window.volunteerInstance.loadVolunteers) {
                window.volunteerInstance.loadVolunteers();
            }
            console.log('[volunteers-page] ✅ Sistema de voluntários recarregado');
        }
    } else {
        console.error('[volunteers-page] ❌ VolunteerSystem não encontrado!');
        showNotification('Erro ao carregar sistema de voluntários', 'error');
    }
}

// Exportar função globalmente
window.initVolunteers = initVolunteers;

console.log('[volunteers-page] ✅ Módulo de voluntários carregado');
