function createNewStream() {
    showNotificationToast('Criação de transmissão em desenvolvimento', 'info');
}

function loadStreams() {
    const container = document.getElementById('streams-list');
    if (!container || !window.liveStreamingSystem) return;
    
    const streams = window.liveStreamingSystem.streams;
    
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

if (window.liveStreamingSystem) {
    loadStreams();
}

console.log('Página de streaming carregada');
