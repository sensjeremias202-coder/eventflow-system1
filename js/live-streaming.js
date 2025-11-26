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
