// Sistema de E-mails Automatizados
class EmailSystem {
    constructor() {
        this.templates = this.loadTemplates();
        this.emailQueue = [];
        this.config = {
            provider: 'smtp', // smtp, sendgrid, mailgun
            apiKey: localStorage.getItem('email_api_key') || '',
            fromEmail: 'noreply@eventflow.com',
            fromName: 'EventFlow System'
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.startEmailProcessor();
        this.scheduleAutomaticReminders();
    }

    loadTemplates() {
        const defaultTemplates = {
            confirmation: {
                subject: '✅ Confirmação de Inscrição - {{eventName}}',
                body: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h1 style="color: #9b59b6;">Inscrição Confirmada!</h1>
                        <p>Olá {{userName}},</p>
                        <p>Sua inscrição no evento <strong>{{eventName}}</strong> foi confirmada com sucesso!</p>
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
                            <h3>Detalhes do Evento:</h3>
                            <p><strong>📅 Data:</strong> {{eventDate}}</p>
                            <p><strong>⏰ Horário:</strong> {{eventTime}}</p>
                            <p><strong>📍 Local:</strong> {{eventLocation}}</p>
                            <p><strong>🎫 Código de Inscrição:</strong> {{ticketCode}}</p>
                        </div>
                        <p>Apresente este e-mail ou o QR Code abaixo na entrada do evento:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <img src="{{qrCodeUrl}}" alt="QR Code" style="max-width: 200px;">
                        </div>
                        <p>Aguardamos você!</p>
                        <hr style="border: 1px solid #eee; margin: 30px 0;">
                        <p style="color: #666; font-size: 12px;">EventFlow System - Gerenciamento de Eventos</p>
                    </div>
                `
            },
            reminder24h: {
                subject: '⏰ Lembrete: {{eventName}} amanhã!',
                body: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h1 style="color: #e74c3c;">Não esqueça!</h1>
                        <p>Olá {{userName}},</p>
                        <p>Lembrando que amanhã acontece o evento <strong>{{eventName}}</strong>!</p>
                        <div style="background: #fff3cd; padding: 20px; border-radius: 10px; border-left: 4px solid #ffc107;">
                            <h3>O evento é AMANHÃ:</h3>
                            <p><strong>📅 Data:</strong> {{eventDate}}</p>
                            <p><strong>⏰ Horário:</strong> {{eventTime}}</p>
                            <p><strong>📍 Local:</strong> {{eventLocation}}</p>
                        </div>
                        <p>Não se atrase! Sua presença é muito importante para nós.</p>
                        <p>Vejo você lá!</p>
                    </div>
                `
            },
            reminder1h: {
                subject: '🔔 {{eventName}} começa em 1 hora!',
                body: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h1 style="color: #e74c3c;">Começando em breve!</h1>
                        <p>Olá {{userName}},</p>
                        <p>O evento <strong>{{eventName}}</strong> começa em apenas 1 hora!</p>
                        <div style="background: #f8d7da; padding: 20px; border-radius: 10px; border-left: 4px solid #dc3545;">
                            <p><strong>⏰ Horário de Início:</strong> {{eventTime}}</p>
                            <p><strong>📍 Local:</strong> {{eventLocation}}</p>
                        </div>
                        <p>Prepare-se e nos vemos em instantes!</p>
                    </div>
                `
            },
            cancellation: {
                subject: '❌ Cancelamento: {{eventName}}',
                body: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h1 style="color: #e74c3c;">Evento Cancelado</h1>
                        <p>Olá {{userName}},</p>
                        <p>Infelizmente, o evento <strong>{{eventName}}</strong> foi cancelado.</p>
                        <div style="background: #f8d7da; padding: 20px; border-radius: 10px;">
                            <p><strong>Motivo:</strong> {{cancellationReason}}</p>
                        </div>
                        <p>Pedimos desculpas pelo transtorno. Você será notificado sobre uma nova data em breve.</p>
                        <p>Atenciosamente,<br>Equipe EventFlow</p>
                    </div>
                `
            },
            newsletter: {
                subject: '📰 Newsletter EventFlow - {{month}}',
                body: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h1 style="color: #9b59b6;">Newsletter do Mês</h1>
                        <p>Olá {{userName}},</p>
                        <p>Confira os destaques deste mês:</p>
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px;">
                            {{eventsList}}
                        </div>
                        <p>Não perca! Inscreva-se já nos eventos do seu interesse.</p>
                        <a href="{{siteUrl}}" style="display: inline-block; background: #9b59b6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
                            Ver Todos os Eventos
                        </a>
                    </div>
                `
            },
            waitlist: {
                subject: '🎉 Vaga disponível em {{eventName}}!',
                body: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h1 style="color: #2ecc71;">Boa notícia!</h1>
                        <p>Olá {{userName}},</p>
                        <p>Uma vaga abriu no evento <strong>{{eventName}}</strong> e você está na lista de espera!</p>
                        <div style="background: #d4edda; padding: 20px; border-radius: 10px; border-left: 4px solid #28a745;">
                            <p><strong>📅 Data:</strong> {{eventDate}}</p>
                            <p><strong>⏰ Horário:</strong> {{eventTime}}</p>
                            <p><strong>📍 Local:</strong> {{eventLocation}}</p>
                            <p><strong>⏳ Confirme até:</strong> {{deadline}}</p>
                        </div>
                        <a href="{{confirmUrl}}" style="display: inline-block; background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
                            Confirmar Inscrição
                        </a>
                        <p style="color: #666;">Esta vaga ficará disponível por 24 horas. Após este prazo, será oferecida ao próximo da lista.</p>
                    </div>
                `
            },
            feedback: {
                subject: '💬 Como foi sua experiência em {{eventName}}?',
                body: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h1 style="color: #3498db;">Sua opinião importa!</h1>
                        <p>Olá {{userName}},</p>
                        <p>Esperamos que tenha aproveitado o evento <strong>{{eventName}}</strong>!</p>
                        <p>Gostaríamos muito de saber sua opinião para melhorarmos cada vez mais.</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="{{feedbackUrl}}" style="display: inline-block; background: #3498db; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px;">
                                Deixar Feedback
                            </a>
                        </div>
                        <p>Sua avaliação nos ajuda a criar eventos ainda melhores!</p>
                    </div>
                `
            },
            certificate: {
                subject: '🎓 Seu Certificado de {{eventName}}',
                body: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h1 style="color: #f39c12;">Parabéns!</h1>
                        <p>Olá {{userName}},</p>
                        <p>Seu certificado de participação no evento <strong>{{eventName}}</strong> está disponível!</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="{{certificateUrl}}" style="display: inline-block; background: #f39c12; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px;">
                                Baixar Certificado
                            </a>
                        </div>
                        <p>Compartilhe sua conquista nas redes sociais!</p>
                    </div>
                `
            }
        };

        return JSON.parse(localStorage.getItem('email_templates') || JSON.stringify(defaultTemplates));
    }

    queueEmail(to, templateName, variables) {
        const template = this.templates[templateName];
        if (!template) {
            console.error('Template não encontrado:', templateName);
            return;
        }

        const email = {
            id: Date.now() + Math.random(),
            to,
            subject: this.replaceVariables(template.subject, variables),
            body: this.replaceVariables(template.body, variables),
            status: 'pending',
            createdAt: new Date(),
            attempts: 0
        };

        this.emailQueue.push(email);
        this.saveQueue();
        console.log('E-mail adicionado à fila:', email.subject);
    }

    replaceVariables(text, variables) {
        let result = text;
        Object.keys(variables).forEach(key => {
            result = result.replace(new RegExp(`{{${key}}}`, 'g'), variables[key]);
        });
        return result;
    }

    async sendEmail(email) {
        // Simulação de envio (em produção, integraria com API real)
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('📧 E-mail enviado:', {
                    to: email.to,
                    subject: email.subject
                });
                
                // Salvar no histórico
                this.saveToHistory(email);
                resolve(true);
            }, 1000);
        });
    }

    async processQueue() {
        const pendingEmails = this.emailQueue.filter(e => e.status === 'pending');
        
        for (const email of pendingEmails) {
            try {
                email.status = 'sending';
                const success = await this.sendEmail(email);
                
                if (success) {
                    email.status = 'sent';
                    email.sentAt = new Date();
                } else {
                    email.attempts++;
                    email.status = email.attempts >= 3 ? 'failed' : 'pending';
                }
            } catch (error) {
                console.error('Erro ao enviar e-mail:', error);
                email.attempts++;
                email.status = email.attempts >= 3 ? 'failed' : 'pending';
            }
        }

        this.saveQueue();
    }

    startEmailProcessor() {
        // Processar fila a cada 30 segundos
        setInterval(() => {
            this.processQueue();
        }, 30000);
    }

    scheduleAutomaticReminders() {
        setInterval(() => {
            this.checkAndSendReminders();
        }, 60000); // Verificar a cada minuto
    }

    checkAndSendReminders() {
        const events = JSON.parse(localStorage.getItem('events') || '[]');
        const now = new Date();

        events.forEach(event => {
            const eventDate = new Date(event.date);
            const timeDiff = eventDate - now;
            const hoursDiff = timeDiff / (1000 * 60 * 60);

            // Lembrete 24 horas antes
            if (hoursDiff > 23 && hoursDiff <= 24 && !event.reminder24hSent) {
                this.sendEventReminders(event, 'reminder24h');
                event.reminder24hSent = true;
            }

            // Lembrete 1 hora antes
            if (hoursDiff > 0.9 && hoursDiff <= 1 && !event.reminder1hSent) {
                this.sendEventReminders(event, 'reminder1h');
                event.reminder1hSent = true;
            }
        });

        localStorage.setItem('events', JSON.stringify(events));
    }

    sendEventReminders(event, templateName) {
        const enrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
        const eventEnrollments = enrollments.filter(e => e.eventId === event.id);

        eventEnrollments.forEach(enrollment => {
            const user = this.getUserById(enrollment.userId);
            if (user && user.email) {
                this.queueEmail(user.email, templateName, {
                    userName: user.name,
                    eventName: event.name,
                    eventDate: new Date(event.date).toLocaleDateString('pt-BR'),
                    eventTime: new Date(event.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                    eventLocation: event.location
                });
            }
        });
    }

    sendConfirmationEmail(userId, eventId) {
        const user = this.getUserById(userId);
        const event = this.getEventById(eventId);
        
        if (!user || !event) return;

        const ticketCode = this.generateTicketCode(userId, eventId);
        const qrCodeUrl = this.generateQRCodeUrl(ticketCode);

        this.queueEmail(user.email, 'confirmation', {
            userName: user.name,
            eventName: event.name,
            eventDate: new Date(event.date).toLocaleDateString('pt-BR'),
            eventTime: new Date(event.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            eventLocation: event.location,
            ticketCode: ticketCode,
            qrCodeUrl: qrCodeUrl
        });
    }

    sendWaitlistNotification(userId, eventId) {
        const user = this.getUserById(userId);
        const event = this.getEventById(eventId);
        
        if (!user || !event) return;

        const deadline = new Date();
        deadline.setHours(deadline.getHours() + 24);

        this.queueEmail(user.email, 'waitlist', {
            userName: user.name,
            eventName: event.name,
            eventDate: new Date(event.date).toLocaleDateString('pt-BR'),
            eventTime: new Date(event.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            eventLocation: event.location,
            deadline: deadline.toLocaleString('pt-BR'),
            confirmUrl: `${window.location.origin}/confirm?userId=${userId}&eventId=${eventId}`
        });
    }

    sendNewsletter() {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const events = JSON.parse(localStorage.getItem('events') || '[]');
        const upcomingEvents = events.filter(e => new Date(e.date) > new Date());

        const eventsList = upcomingEvents.slice(0, 5).map(event => `
            <div style="margin: 15px 0; padding: 15px; background: white; border-radius: 5px;">
                <h4 style="color: #9b59b6; margin: 0 0 10px 0;">${event.name}</h4>
                <p style="margin: 5px 0;">📅 ${new Date(event.date).toLocaleDateString('pt-BR')}</p>
                <p style="margin: 5px 0;">📍 ${event.location}</p>
            </div>
        `).join('');

        users.forEach(user => {
            if (user.email && user.subscribeNewsletter) {
                this.queueEmail(user.email, 'newsletter', {
                    userName: user.name,
                    month: new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
                    eventsList: eventsList,
                    siteUrl: window.location.origin
                });
            }
        });
    }

    getUserById(userId) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        return users.find(u => u.id === userId);
    }

    getEventById(eventId) {
        const events = JSON.parse(localStorage.getItem('events') || '[]');
        return events.find(e => e.id === eventId);
    }

    generateTicketCode(userId, eventId) {
        return `EVT-${eventId.substr(0, 8)}-${userId.substr(0, 8)}`.toUpperCase();
    }

    generateQRCodeUrl(code) {
        return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(code)}`;
    }

    saveQueue() {
        localStorage.setItem('email_queue', JSON.stringify(this.emailQueue));
    }

    saveToHistory(email) {
        const history = JSON.parse(localStorage.getItem('email_history') || '[]');
        history.push({
            ...email,
            archivedAt: new Date()
        });
        localStorage.setItem('email_history', JSON.stringify(history));
    }

    setupEventListeners() {
        // Listener para novas inscrições
        window.addEventListener('enrollment-confirmed', (e) => {
            this.sendConfirmationEmail(e.detail.userId, e.detail.eventId);
        });

        // Listener para vagas disponíveis na lista de espera
        window.addEventListener('waitlist-spot-available', (e) => {
            this.sendWaitlistNotification(e.detail.userId, e.detail.eventId);
        });
    }

    // Método para admins visualizarem estatísticas
    getEmailStats() {
        const history = JSON.parse(localStorage.getItem('email_history') || '[]');
        return {
            total: history.length,
            lastMonth: history.filter(e => {
                const date = new Date(e.sentAt);
                const monthAgo = new Date();
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                return date > monthAgo;
            }).length,
            byTemplate: history.reduce((acc, email) => {
                const template = email.subject.split('-')[0].trim();
                acc[template] = (acc[template] || 0) + 1;
                return acc;
            }, {})
        };
    }
}

// Inicializar sistema de e-mails
let emailSystem;
document.addEventListener('DOMContentLoaded', () => {
    emailSystem = new EmailSystem();
    window.emailSystem = emailSystem; // Expor globalmente
});
