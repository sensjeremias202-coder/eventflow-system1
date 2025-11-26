function forceSyncData() {
    if (window.syncManager) {
        syncManager.forcePullFromFirebase();
        showNotificationToast('Sincronização iniciada!', 'success');
    }
}

function clearLocalData() {
    if (confirm('Tem certeza que deseja limpar todos os dados locais? Esta ação não pode ser desfeita.')) {
        localStorage.clear();
        showNotificationToast('Dados locais limpos!', 'success');
        setTimeout(() => location.reload(), 1500);
    }
}

// Inicializar customizadores se disponíveis
if (window.themeCustomizer) {
    themeCustomizer.renderCustomizer();
}

if (window.i18nSystem) {
    i18nSystem.renderLanguageSelector();
}

console.log('Página de configurações carregada');
