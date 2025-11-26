// Sistema de Integração com Redes Sociais
class SocialMediaIntegration {
    constructor() {
        this.providers = {
            google: {
                clientId: localStorage.getItem('google_client_id') || '',
                enabled: false
            },
            facebook: {
                appId: localStorage.getItem('facebook_app_id') || '',
                enabled: false
            },
            twitter: {
                apiKey: localStorage.getItem('twitter_api_key') || '',
                enabled: false
            }
        };
        this.init();
    }

    init() {
        this.loadGoogleAPI();
        this.loadFacebookSDK();
        this.setupEventListeners();
    }

    loadGoogleAPI() {
        // Carregar Google Sign-In API
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
    }

    loadFacebookSDK() {
        // Carregar Facebook SDK
        window.fbAsyncInit = () => {
            if (window.FB) {
                FB.init({
                    appId: this.providers.facebook.appId,
                    cookie: true,
                    xfbml: true,
                    version: 'v18.0'
                });
            }
        };

        const script = document.createElement('script');
        script.src = 'https://connect.facebook.net/pt_BR/sdk.js';
        script.async = true;
        script.defer = true;
        script.crossOrigin = 'anonymous';
        document.head.appendChild(script);
    }

    async loginWithGoogle() {
        // Simular login com Google
        return new Promise((resolve) => {
            showNotificationToast('Login com Google em desenvolvimento', 'info');
            setTimeout(() => {
                const user = {
                    id: 'google-' + Date.now(),
                    name: 'Usuário Google',
                    email: 'usuario@gmail.com',
                    avatar: 'https://via.placeholder.com/100',
                    provider: 'google'
                };
                this.saveUserFromSocial(user);
                resolve(user);
            }, 1000);
        });
    }

    async loginWithFacebook() {
        // Simular login com Facebook
        return new Promise((resolve) => {
            showNotificationToast('Login com Facebook em desenvolvimento', 'info');
            setTimeout(() => {
                const user = {
                    id: 'facebook-' + Date.now(),
                    name: 'Usuário Facebook',
                    email: 'usuario@facebook.com',
                    avatar: 'https://via.placeholder.com/100',
                    provider: 'facebook'
                };
                this.saveUserFromSocial(user);
                resolve(user);
            }, 1000);
        });
    }

    saveUserFromSocial(user) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const existingUser = users.find(u => u.email === user.email);

        if (!existingUser) {
            users.push({
                ...user,
                createdAt: new Date(),
                role: 'participant'
            });
            localStorage.setItem('users', JSON.stringify(users));
        }

        localStorage.setItem('currentUser', JSON.stringify(user));
        showNotificationToast(`Bem-vindo, ${user.name}!`, 'success');
    }

    shareEventOnFacebook(eventId) {
        const event = this.getEventById(eventId);
        if (!event) return;

        const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin + '/event/' + eventId)}`;
        window.open(shareUrl, 'facebook-share', 'width=600,height=400');
        
        this.trackShare(eventId, 'facebook');
    }

    shareEventOnTwitter(eventId) {
        const event = this.getEventById(eventId);
        if (!event) return;

        const text = `Vou participar de ${event.name}! 🎉`;
        const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.origin + '/event/' + eventId)}`;
        window.open(shareUrl, 'twitter-share', 'width=600,height=400');
        
        this.trackShare(eventId, 'twitter');
    }

    shareEventOnWhatsApp(eventId) {
        const event = this.getEventById(eventId);
        if (!event) return;

        const text = `*${event.name}*\n\n📅 ${new Date(event.date).toLocaleDateString('pt-BR')}\n📍 ${event.location}\n\nInscreva-se: ${window.location.origin}/event/${eventId}`;
        const shareUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(shareUrl, '_blank');
        
        this.trackShare(eventId, 'whatsapp');
    }

    async importFacebookEvents() {
        // Simular importação de eventos do Facebook
        showNotificationToast('Importando eventos do Facebook...', 'info');
        
        setTimeout(() => {
            const facebookEvents = [
                {
                    name: 'Evento Importado do Facebook',
                    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    location: 'Local do Facebook',
                    description: 'Evento importado automaticamente',
                    category: 'Conferência',
                    importedFrom: 'facebook'
                }
            ];

            const events = JSON.parse(localStorage.getItem('events') || '[]');
            facebookEvents.forEach(fbEvent => {
                events.push({
                    ...fbEvent,
                    id: 'fb-' + Date.now(),
                    createdAt: new Date()
                });
            });
            localStorage.setItem('events', JSON.stringify(events));
            
            showNotificationToast('Eventos importados com sucesso!', 'success');
        }, 2000);
    }

    trackShare(eventId, platform) {
        const shares = JSON.parse(localStorage.getItem('social_shares') || '[]');
        shares.push({
            eventId,
            platform,
            timestamp: new Date()
        });
        localStorage.setItem('social_shares', JSON.stringify(shares));
    }

    renderSocialLoginButtons() {
        return `
            <div class="social-login-buttons">
                <button class="btn-social btn-google" onclick="socialMediaIntegration.loginWithGoogle()">
                    <i class="fab fa-google"></i>
                    Entrar com Google
                </button>
                <button class="btn-social btn-facebook" onclick="socialMediaIntegration.loginWithFacebook()">
                    <i class="fab fa-facebook"></i>
                    Entrar com Facebook
                </button>
            </div>
        `;
    }

    renderShareButtons(eventId) {
        return `
            <div class="share-buttons">
                <button class="btn-share btn-facebook" onclick="socialMediaIntegration.shareEventOnFacebook('${eventId}')">
                    <i class="fab fa-facebook"></i>
                </button>
                <button class="btn-share btn-twitter" onclick="socialMediaIntegration.shareEventOnTwitter('${eventId}')">
                    <i class="fab fa-twitter"></i>
                </button>
                <button class="btn-share btn-whatsapp" onclick="socialMediaIntegration.shareEventOnWhatsApp('${eventId}')">
                    <i class="fab fa-whatsapp"></i>
                </button>
                <button class="btn-share btn-copy" onclick="socialMediaIntegration.copyEventLink('${eventId}')">
                    <i class="fas fa-link"></i>
                </button>
            </div>
        `;
    }

    copyEventLink(eventId) {
        const link = `${window.location.origin}/event/${eventId}`;
        navigator.clipboard.writeText(link).then(() => {
            showNotificationToast('Link copiado!', 'success');
        });
    }

    getEventById(eventId) {
        const events = JSON.parse(localStorage.getItem('events') || '[]');
        return events.find(e => e.id === eventId);
    }

    setupEventListeners() {
        // Adicionar botões de compartilhamento aos eventos
        document.addEventListener('DOMContentLoaded', () => {
            const eventCards = document.querySelectorAll('.event-card');
            eventCards.forEach(card => {
                const eventId = card.dataset.eventId;
                if (eventId && !card.querySelector('.share-buttons')) {
                    const shareContainer = document.createElement('div');
                    shareContainer.innerHTML = this.renderShareButtons(eventId);
                    card.appendChild(shareContainer);
                }
            });
        });
    }

    getSocialStats() {
        const shares = JSON.parse(localStorage.getItem('social_shares') || '[]');
        return {
            total: shares.length,
            byPlatform: shares.reduce((acc, share) => {
                acc[share.platform] = (acc[share.platform] || 0) + 1;
                return acc;
            }, {}),
            byEvent: shares.reduce((acc, share) => {
                acc[share.eventId] = (acc[share.eventId] || 0) + 1;
                return acc;
            }, {})
        };
    }
}

// Inicializar
let socialMediaIntegration;
document.addEventListener('DOMContentLoaded', () => {
    socialMediaIntegration = new SocialMediaIntegration();
    window.socialMediaIntegration = socialMediaIntegration;
});
