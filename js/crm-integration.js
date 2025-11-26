// Integração com CRM
class CRMIntegration {
    constructor() {
        this.webhooks = [];
        this.apiKeys = {
            zapier: localStorage.getItem('zapier_key') || '',
            hubspot: localStorage.getItem('hubspot_key') || '',
            salesforce: localStorage.getItem('salesforce_key') || ''
        };
        this.init();
    }

    init() {
        this.loadWebhooks();
        this.setupEventListeners();
    }

    loadWebhooks() {
        this.webhooks = JSON.parse(localStorage.getItem('crm_webhooks') || '[]');
    }

    addWebhook(url, events) {
        const webhook = {
            id: 'webhook-' + Date.now(),
            url,
            events, // ['enrollment', 'payment', 'checkin']
            active: true,
            createdAt: new Date()
        };

        this.webhooks.push(webhook);
        this.saveWebhooks();
        return webhook;
    }

    async sendWebhook(event, data) {
        const activeWebhooks = this.webhooks.filter(w => 
            w.active && w.events.includes(event)
        );

        for (const webhook of activeWebhooks) {
            try {
                await fetch(webhook.url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ event, data, timestamp: new Date() })
                });
                console.log('✅ Webhook enviado:', webhook.url);
            } catch (error) {
                console.error('❌ Erro ao enviar webhook:', error);
            }
        }
    }

    syncWithHubSpot(contactData) {
        console.log('🔄 Sincronizando com HubSpot:', contactData);
        // Implementar integração real com HubSpot API
    }

    syncWithSalesforce(leadData) {
        console.log('🔄 Sincronizando com Salesforce:', leadData);
        // Implementar integração real com Salesforce API
    }

    setupEventListeners() {
        // Ouvir eventos do sistema para enviar webhooks
        window.addEventListener('enrollment-confirmed', (e) => {
            this.sendWebhook('enrollment', e.detail);
        });

        window.addEventListener('payment-completed', (e) => {
            this.sendWebhook('payment', e.detail);
        });
    }

    saveWebhooks() {
        localStorage.setItem('crm_webhooks', JSON.stringify(this.webhooks));
    }
}

// Inicializar
let crmIntegration;
document.addEventListener('DOMContentLoaded', () => {
    crmIntegration = new CRMIntegration();
    window.crmIntegration = crmIntegration;
});
