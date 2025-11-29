// Sistema Multi-idiomas (i18n)
class InternationalizationSystem {
    constructor() {
        this.supportedLanguages = ['pt', 'en', 'es'];
        this.translations = {};
        this.currentLanguage = localStorage.getItem('language') || this.detectLanguage();
        this.init();
    }

    init() {
        this.loadTranslations();
        this.applyLanguage(this.currentLanguage);
        this.renderLanguageSelector();
    }

    detectLanguage() {
        const navLang = navigator.language || navigator.userLanguage || 'pt-BR';
        const browserLang = (typeof navLang === 'string' ? navLang : 'pt-BR').split('-')[0];
        const supported = Array.isArray(this.supportedLanguages) ? this.supportedLanguages : ['pt', 'en', 'es'];
        return supported.includes(browserLang) ? browserLang : 'pt';
    }

    loadTranslations() {
        this.translations = {
            pt: {
                welcome: 'Bem-vindo',
                events: 'Eventos',
                dashboard: 'Painel',
                profile: 'Perfil',
                logout: 'Sair',
                search: 'Buscar',
                filters: 'Filtros',
                categories: 'Categorias',
                date: 'Data',
                location: 'Local',
                enroll: 'Inscrever-se',
                share: 'Compartilhar',
                description: 'Descrição',
                participants: 'Participantes',
                schedule: 'Agenda',
                notifications: 'Notificações',
                settings: 'Configurações',
                save: 'Salvar',
                cancel: 'Cancelar',
                delete: 'Excluir',
                edit: 'Editar',
                create: 'Criar',
                update: 'Atualizar'
            },
            en: {
                welcome: 'Welcome',
                events: 'Events',
                dashboard: 'Dashboard',
                profile: 'Profile',
                logout: 'Logout',
                search: 'Search',
                filters: 'Filters',
                categories: 'Categories',
                date: 'Date',
                location: 'Location',
                enroll: 'Enroll',
                share: 'Share',
                description: 'Description',
                participants: 'Participants',
                schedule: 'Schedule',
                notifications: 'Notifications',
                settings: 'Settings',
                save: 'Save',
                cancel: 'Cancel',
                delete: 'Delete',
                edit: 'Edit',
                create: 'Create',
                update: 'Update'
            },
            es: {
                welcome: 'Bienvenido',
                events: 'Eventos',
                dashboard: 'Panel',
                profile: 'Perfil',
                logout: 'Salir',
                search: 'Buscar',
                filters: 'Filtros',
                categories: 'Categorías',
                date: 'Fecha',
                location: 'Ubicación',
                enroll: 'Inscribirse',
                share: 'Compartir',
                description: 'Descripción',
                participants: 'Participantes',
                schedule: 'Agenda',
                notifications: 'Notificaciones',
                settings: 'Configuración',
                save: 'Guardar',
                cancel: 'Cancelar',
                delete: 'Eliminar',
                edit: 'Editar',
                create: 'Crear',
                update: 'Actualizar'
            }
        };
    }

    translate(key) {
        return this.translations[this.currentLanguage]?.[key] || key;
    }

    changeLanguage(lang) {
        if (this.supportedLanguages.includes(lang)) {
            this.currentLanguage = lang;
            localStorage.setItem('language', lang);
            this.applyLanguage(lang);
            showNotificationToast('Idioma alterado!', 'success');
        }
    }

    applyLanguage(lang) {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.dataset.i18n;
            element.textContent = this.translate(key);
        });

        document.documentElement.lang = lang;
    }

    renderLanguageSelector() {
        const selector = document.getElementById('language-selector');
        if (selector) {
            selector.innerHTML = `
                <select onchange="i18nSystem.changeLanguage(this.value)" value="${this.currentLanguage}">
                    <option value="pt" ${this.currentLanguage === 'pt' ? 'selected' : ''}>🇧🇷 Português</option>
                    <option value="en" ${this.currentLanguage === 'en' ? 'selected' : ''}>🇺🇸 English</option>
                    <option value="es" ${this.currentLanguage === 'es' ? 'selected' : ''}>🇪🇸 Español</option>
                </select>
            `;
        }
    }
}

// Inicializar
let i18nSystem;
document.addEventListener('DOMContentLoaded', () => {
    i18nSystem = new InternationalizationSystem();
    window.i18nSystem = i18nSystem;
});
