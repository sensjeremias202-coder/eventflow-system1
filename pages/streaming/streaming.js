/**
 * Inicialização da página de transmissões ao vivo
 */

function initStreaming() {
    console.log('[streaming-page] Inicializando página de streaming...');
    
    // Verificar se o sistema de streaming está disponível
    if (typeof LiveStreamingSystem !== 'undefined') {
        // Criar instância se não existir
        if (!window.streamingInstance) {
            window.streamingInstance = new LiveStreamingSystem();
            console.log('[streaming-page] ✅ LiveStreamingSystem instanciado');
        } else {
            // Recarregar streams se já existe
            if (window.streamingInstance.loadStreams) {
                window.streamingInstance.loadStreams();
            }
            console.log('[streaming-page] ✅ Sistema de streaming recarregado');
        }
        
        // Carregar streams na interface
        loadStreams();
    } else {
        console.error('[streaming-page] ❌ LiveStreamingSystem não encontrado!');
        showNotification('Erro ao carregar sistema de streaming', 'error');
    }
}

function createNewStream() {
    showNotification('Criação de transmissão em desenvolvimento', 'info');
}

function loadStreams() {
    const container = document.getElementById('streams-list');
    if (!container) return;
    
    const streamingSystem = window.streamingInstance || window.liveStreamingSystem;
    if (!streamingSystem) return;
    
    const streams = streamingSystem.streams;
    
    if (streams.length === 0) {
        container.innerHTML = '<p class="text-muted">Nenhuma transmissão criada</p>';
        return;
    }
    
    container.innerHTML = streams.map(s => `
        <div class="stream-card">
            <h4>${s.id}</h4>
            <p>Status: ${s.status}</p>
            <p>Visualizações: ${s.viewers}</p>
        </div>
    `).join('');
}

// Exportar funções globalmente
window.initStreaming = initStreaming;
window.createNewStream = createNewStream;
window.loadStreams = loadStreams;

console.log('[streaming-page] ✅ Módulo de streaming carregado');
