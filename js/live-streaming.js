// Sistema de Transmissão ao Vivo
class LiveStreamingSystem {
    constructor() {
        this.streams = [];
        this.providers = {
            youtube: { enabled: false, apiKey: '' },
            vimeo: { enabled: false, accessToken: '' }
        };
        this.init();
    }

    init() {
        this.loadStreams();
        this.setupEventListeners();
    }

    loadStreams() {
        this.streams = JSON.parse(localStorage.getItem('live_streams') || '[]');
    }

    createStream(eventId, platform = 'youtube') {
        const stream = {
            id: 'stream-' + Date.now(),
            eventId,
            platform,
            status: 'scheduled', // scheduled, live, ended
            streamUrl: '',
            embedCode: '',
            viewers: 0,
            maxViewers: 0,
            startedAt: null,
            endedAt: null,
            recordingUrl: ''
        };

        this.streams.push(stream);
        this.saveStreams();
        return stream;
    }

    startStream(streamId) {
        const stream = this.streams.find(s => s.id === streamId);
        if (stream) {
            stream.status = 'live';
            stream.startedAt = new Date();
            stream.streamUrl = `https://youtube.com/live/${streamId}`;
            stream.embedCode = `<iframe src="${stream.streamUrl}/embed" frameborder="0" allowfullscreen></iframe>`;
            this.saveStreams();
            showNotificationToast('Transmissão iniciada!', 'success');
        }
    }

    endStream(streamId) {
        const stream = this.streams.find(s => s.id === streamId);
        if (stream) {
            stream.status = 'ended';
            stream.endedAt = new Date();
            stream.recordingUrl = `https://youtube.com/watch?v=${streamId}`;
            this.saveStreams();
            showNotificationToast('Transmissão encerrada!', 'success');
        }
    }

    renderStreamPlayer(streamId) {
        const stream = this.streams.find(s => s.id === streamId);
        if (!stream) return '';

        return `
            <div class="stream-player">
                <div class="stream-video">
                    ${stream.status === 'live' ? stream.embedCode : '<p>Transmissão não iniciada</p>'}
                </div>
                <div class="stream-info">
                    <div class="live-badge ${stream.status === 'live' ? 'active' : ''}">
                        ${stream.status === 'live' ? '🔴 AO VIVO' : '⏸️ OFFLINE'}
                    </div>
                    <div class="viewer-count">
                        <i class="fas fa-eye"></i> ${stream.viewers} assistindo
                    </div>
                </div>
                <div class="stream-chat">
                    <div id="live-chat-${streamId}" class="live-chat-messages"></div>
                    <div class="chat-input">
                        <input type="text" placeholder="Comentar ao vivo...">
                        <button><i class="fas fa-paper-plane"></i></button>
                    </div>
                </div>
            </div>
        `;
    }

    saveStreams() {
        localStorage.setItem('live_streams', JSON.stringify(this.streams));
    }

    setupEventListeners() {}
}

// Inicializar
let liveStreamingSystem;
document.addEventListener('DOMContentLoaded', () => {
    liveStreamingSystem = new LiveStreamingSystem();
    window.liveStreamingSystem = liveStreamingSystem;
});

// Função de inicialização global
function initStreaming() {
    console.log('[streaming] 🎥 Inicializando sistema de transmissões...');
    
    if (!window.streamingInstance) {
        window.streamingInstance = new LiveStreamingSystem();
    }
    
    // Adicionar listener para botão de criar transmissão
    const createStreamBtn = document.getElementById('createStreamBtn');
    if (createStreamBtn && !createStreamBtn.dataset.streamingListenerAdded) {
        createStreamBtn.dataset.streamingListenerAdded = 'true';
        createStreamBtn.addEventListener('click', () => {
            const modal = document.getElementById('createStreamModal');
            if (modal) {
                modal.style.display = 'block';
                loadEventsIntoStreamSelect();
            }
        });
    }
    
    // Configurar tabs de transmissão
    setupStreamingTabs();
    
    // Configurar formulário de criar transmissão
    setupStreamForm();
    
    // Carregar transmissões inicial
    renderStreams('active');
    
    console.log('[streaming] ✅ Sistema de transmissões inicializado');
}

// Configurar tabs de streaming
function setupStreamingTabs() {
    const streamTabs = document.querySelectorAll('.streams-tabs button');
    streamTabs.forEach(tab => {
        if (!tab.dataset.streamingTabListener) {
            tab.dataset.streamingTabListener = 'true';
            tab.addEventListener('click', function() {
                // Remove active de todas as tabs
                streamTabs.forEach(t => t.classList.remove('active'));
                // Adiciona active na tab clicada
                this.classList.add('active');
                
                // Renderiza transmissões do tipo selecionado
                const tabType = this.dataset.tab;
                renderStreams(tabType);
            });
        }
    });
}

// Renderizar transmissões por tipo
function renderStreams(type) {
    const streamsGrid = document.querySelector('.streams-grid');
    if (!streamsGrid) return;
    
    const instance = window.streamingInstance;
    if (!instance) return;
    
    let filteredStreams = [];
    
    switch(type) {
        case 'active':
            filteredStreams = instance.streams.filter(s => s.status === 'live');
            break;
        case 'scheduled':
            filteredStreams = instance.streams.filter(s => s.status === 'scheduled');
            break;
        case 'archived':
            filteredStreams = instance.streams.filter(s => s.status === 'ended');
            break;
    }
    
    if (filteredStreams.length === 0) {
        streamsGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--gray);">
                <i class="fas fa-video" style="font-size: 48px; margin-bottom: 20px; opacity: 0.3;"></i>
                <p>Nenhuma transmissão ${type === 'active' ? 'ao vivo' : type === 'scheduled' ? 'agendada' : 'arquivada'}</p>
            </div>
        `;
        return;
    }
    
    streamsGrid.innerHTML = filteredStreams.map(stream => `
        <div class="card">
            <div class="card-header">
                <div class="card-title">${stream.title || 'Transmissão'}</div>
                ${stream.status === 'live' ? '<span class="badge badge-danger">🔴 AO VIVO</span>' : ''}
                ${stream.status === 'scheduled' ? '<span class="badge badge-warning">📅 AGENDADA</span>' : ''}
            </div>
            <div class="card-body">
                <p><strong>Plataforma:</strong> ${stream.platform.toUpperCase()}</p>
                ${stream.scheduledDate ? `<p><strong>Data:</strong> ${new Date(stream.scheduledDate).toLocaleString('pt-BR')}</p>` : ''}
                ${stream.viewers ? `<p><strong>Espectadores:</strong> ${stream.viewers}</p>` : ''}
                <div style="margin-top: 15px;">
                    ${stream.status === 'live' ? '<button class="btn btn-primary btn-sm" onclick="viewStream(\''+stream.id+'\')">Assistir</button>' : ''}
                    ${stream.status === 'scheduled' ? '<button class="btn btn-outline btn-sm" onclick="startStream(\''+stream.id+'\')">Iniciar</button>' : ''}
                    <button class="btn btn-outline btn-sm" onclick="deleteStream(\''+stream.id+'\')">Excluir</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Configurar formulário de criar transmissão
function setupStreamForm() {
    const form = document.getElementById('createStreamForm');
    const platformSelect = document.getElementById('streamPlatform');
    const customUrlGroup = document.getElementById('customUrlGroup');
    
    if (platformSelect) {
        platformSelect.addEventListener('change', function() {
            if (customUrlGroup) {
                customUrlGroup.style.display = this.value === 'custom' ? 'block' : 'none';
            }
        });
    }
    
    if (form && !form.dataset.streamFormListener) {
        form.dataset.streamFormListener = 'true';
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const stream = {
                id: 'stream-' + Date.now(),
                title: document.getElementById('streamTitle').value,
                description: document.getElementById('streamDescription').value,
                platform: document.getElementById('streamPlatform').value,
                streamUrl: document.getElementById('streamUrl').value || '',
                eventId: document.getElementById('streamEvent').value || null,
                scheduledDate: document.getElementById('streamScheduleDate').value + ' ' + document.getElementById('streamScheduleTime').value,
                status: 'scheduled',
                viewers: 0,
                maxViewers: 0,
                startedAt: null,
                endedAt: null,
                recordingUrl: ''
            };
            
            const instance = window.streamingInstance;
            if (instance) {
                instance.streams.push(stream);
                instance.saveStreams();
                showNotificationToast('Transmissão criada com sucesso!', 'success');
                document.getElementById('createStreamModal').style.display = 'none';
                form.reset();
                renderStreams('scheduled');
            }
        });
    }
}

// Carregar eventos no select da modal
function loadEventsIntoStreamSelect() {
    const select = document.getElementById('streamEvent');
    if (!select) return;
    
    const events = JSON.parse(localStorage.getItem('events') || '[]');
    select.innerHTML = '<option value="">Nenhum evento</option>' + 
        events.map(event => `<option value="${event.id}">${event.title}</option>`).join('');
}

// Funções auxiliares globais
window.viewStream = function(streamId) {
    const instance = window.streamingInstance;
    if (!instance) return;
    
    const stream = instance.streams.find(s => s.id === streamId);
    if (!stream) return;
    
    // Aqui você pode abrir um player ou redirecionar
    showNotificationToast('Abrindo transmissão...', 'info');
};

window.startStream = function(streamId) {
    const instance = window.streamingInstance;
    if (!instance) return;
    
    const stream = instance.streams.find(s => s.id === streamId);
    if (stream) {
        stream.status = 'live';
        stream.startedAt = new Date().toISOString();
        instance.saveStreams();
        showNotificationToast('Transmissão iniciada!', 'success');
        renderStreams('active');
    }
};

window.deleteStream = function(streamId) {
    if (!confirm('Deseja realmente excluir esta transmissão?')) return;
    
    const instance = window.streamingInstance;
    if (!instance) return;
    
    instance.streams = instance.streams.filter(s => s.id !== streamId);
    instance.saveStreams();
    showNotificationToast('Transmissão excluída', 'success');
    
    // Renderizar novamente a tab ativa
    const activeTab = document.querySelector('.streams-tabs button.active');
    if (activeTab) {
        renderStreams(activeTab.dataset.tab);
    }
};

window.initStreaming = initStreaming;
window.LiveStreamingSystem = LiveStreamingSystem;
window.setupStreamingTabs = setupStreamingTabs;
window.renderStreams = renderStreams;
window.setupStreamForm = setupStreamForm;
window.loadEventsIntoStreamSelect = loadEventsIntoStreamSelect;

// Função auxiliar para fechar player
function closeStreamPlayer() {
    const player = document.getElementById('streamPlayer');
    if (player) {
        player.style.display = 'none';
    }
}

window.closeStreamPlayer = closeStreamPlayer;
