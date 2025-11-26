/**
 * Inicialização da página de calendário
 */

function initCalendar() {
    console.log('[calendar-page] Inicializando página de calendário...');
    
    // Verificar se o sistema de calendário está disponível
    if (typeof CalendarSystem !== 'undefined') {
        // Criar instância se não existir
        if (!window.calendarInstance) {
            window.calendarInstance = new CalendarSystem();
            console.log('[calendar-page] ✅ CalendarSystem instanciado');
        } else {
            // Recarregar eventos se já existe
            if (window.calendarInstance.loadEvents) {
                window.calendarInstance.loadEvents();
            }
            console.log('[calendar-page] ✅ Calendário recarregado');
        }
    } else {
        console.error('[calendar-page] ❌ CalendarSystem não encontrado!');
        showNotification('Erro ao carregar sistema de calendário', 'error');
    }
}

// Exportar função globalmente
window.initCalendar = initCalendar;

console.log('[calendar-page] ✅ Módulo de calendário carregado');
