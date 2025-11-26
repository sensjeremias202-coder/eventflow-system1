// Sistema de Analytics Avançado
class AdvancedAnalytics {
    constructor() {
        this.data = {
            events: [],
            enrollments: [],
            users: [],
            pageViews: [],
            interactions: []
        };
        this.init();
    }

    init() {
        this.loadData();
        this.trackPageViews();
        this.trackInteractions();
        this.renderDashboard();
    }

    loadData() {
        this.data.events = JSON.parse(localStorage.getItem('events') || '[]');
        this.data.enrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
        this.data.users = JSON.parse(localStorage.getItem('users') || '[]');
        this.data.pageViews = JSON.parse(localStorage.getItem('analytics_pageviews') || '[]');
        this.data.interactions = JSON.parse(localStorage.getItem('analytics_interactions') || '[]');
    }

    trackPageViews() {
        // Registrar visualização de página
        const pageView = {
            page: window.location.pathname,
            timestamp: new Date(),
            userAgent: navigator.userAgent,
            referrer: document.referrer
        };
        this.data.pageViews.push(pageView);
        localStorage.setItem('analytics_pageviews', JSON.stringify(this.data.pageViews));
    }

    trackInteractions() {
        // Rastrear cliques, formulários, etc.
        document.addEventListener('click', (e) => {
            if (e.target.matches('button, a, .card')) {
                const interaction = {
                    type: 'click',
                    element: e.target.tagName,
                    class: e.target.className,
                    text: e.target.textContent.substring(0, 50),
                    timestamp: new Date()
                };
                this.data.interactions.push(interaction);
                localStorage.setItem('analytics_interactions', JSON.stringify(this.data.interactions));
            }
        });
    }

    renderDashboard() {
        const container = document.getElementById('analytics-dashboard');
        if (!container) return;

        container.innerHTML = `
            <div class="analytics-grid">
                <div class="analytics-card">
                    <h3>Taxa de Conversão</h3>
                    ${this.renderConversionRate()}
                </div>
                <div class="analytics-card">
                    <h3>Funil de Inscrição</h3>
                    ${this.renderEnrollmentFunnel()}
                </div>
                <div class="analytics-card">
                    <h3>Mapa de Calor</h3>
                    ${this.renderHeatmap()}
                </div>
                <div class="analytics-card">
                    <h3>Retenção de Usuários</h3>
                    ${this.renderRetentionChart()}
                </div>
                <div class="analytics-card">
                    <h3>Eventos Mais Populares</h3>
                    ${this.renderTopEvents()}
                </div>
                <div class="analytics-card">
                    <h3>Horários de Pico</h3>
                    ${this.renderPeakHours()}
                </div>
            </div>
        `;
    }

    renderConversionRate() {
        const views = this.data.pageViews.filter(p => p.page.includes('events')).length;
        const enrollments = this.data.enrollments.length;
        const rate = views > 0 ? ((enrollments / views) * 100).toFixed(2) : 0;

        return `
            <div class="conversion-rate">
                <div class="rate-value">${rate}%</div>
                <div class="rate-details">
                    <div>👁️ ${views} visualizações</div>
                    <div>✅ ${enrollments} inscrições</div>
                </div>
                <canvas id="conversionChart"></canvas>
            </div>
        `;
    }

    renderEnrollmentFunnel() {
        const steps = {
            views: this.data.pageViews.filter(p => p.page.includes('events')).length,
            details: this.data.interactions.filter(i => i.class.includes('event-card')).length,
            started: this.data.enrollments.length + 50, // Simulando
            completed: this.data.enrollments.length
        };

        const percentages = {
            details: ((steps.details / steps.views) * 100).toFixed(1),
            started: ((steps.started / steps.details) * 100).toFixed(1),
            completed: ((steps.completed / steps.started) * 100).toFixed(1)
        };

        return `
            <div class="funnel">
                <div class="funnel-step" style="width: 100%">
                    <span>Visualizações</span>
                    <strong>${steps.views}</strong>
                </div>
                <div class="funnel-step" style="width: ${percentages.details}%">
                    <span>Detalhes</span>
                    <strong>${steps.details} (${percentages.details}%)</strong>
                </div>
                <div class="funnel-step" style="width: ${percentages.started}%">
                    <span>Iniciou Inscrição</span>
                    <strong>${steps.started} (${percentages.started}%)</strong>
                </div>
                <div class="funnel-step" style="width: ${percentages.completed}%">
                    <span>Completou</span>
                    <strong>${steps.completed} (${percentages.completed}%)</strong>
                </div>
            </div>
        `;
    }

    renderHeatmap() {
        // Simular heatmap de interações
        const interactions = this.data.interactions;
        const heatData = {};

        interactions.forEach(i => {
            const key = i.class || 'outros';
            heatData[key] = (heatData[key] || 0) + 1;
        });

        const sorted = Object.entries(heatData).sort((a, b) => b[1] - a[1]).slice(0, 5);

        return `
            <div class="heatmap">
                ${sorted.map(([key, value]) => `
                    <div class="heatmap-item" style="opacity: ${Math.min(value / 100, 1)}">
                        <span>${key}</span>
                        <strong>${value} cliques</strong>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderRetentionChart() {
        // Análise de retenção (usuários que voltam)
        const userSessions = {};
        this.data.pageViews.forEach(view => {
            const date = new Date(view.timestamp).toDateString();
            userSessions[date] = (userSessions[date] || 0) + 1;
        });

        const last7Days = Object.entries(userSessions).slice(-7);

        return `
            <canvas id="retentionChart"></canvas>
            <div class="retention-stats">
                <div>📊 Média diária: ${(last7Days.reduce((a, b) => a + b[1], 0) / 7).toFixed(1)} visitas</div>
            </div>
        `;
    }

    renderTopEvents() {
        const eventEnrollments = {};
        this.data.enrollments.forEach(e => {
            eventEnrollments[e.eventId] = (eventEnrollments[e.eventId] || 0) + 1;
        });

        const sorted = Object.entries(eventEnrollments)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        return `
            <div class="top-events-list">
                ${sorted.map(([eventId, count], index) => {
                    const event = this.data.events.find(e => e.id === eventId);
                    return `
                        <div class="top-event-item">
                            <span class="rank">#${index + 1}</span>
                            <span class="event-name">${event?.name || 'Evento'}</span>
                            <span class="event-count">${count} inscritos</span>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    renderPeakHours() {
        const hours = new Array(24).fill(0);
        this.data.pageViews.forEach(view => {
            const hour = new Date(view.timestamp).getHours();
            hours[hour]++;
        });

        const maxViews = Math.max(...hours);
        const peakHour = hours.indexOf(maxViews);

        return `
            <canvas id="peakHoursChart"></canvas>
            <div class="peak-info">
                ⏰ Horário de pico: ${peakHour}:00 - ${peakHour + 1}:00
            </div>
        `;
    }

    // Gerar relatórios
    generateReport(type = 'monthly') {
        const report = {
            period: type,
            generatedAt: new Date(),
            metrics: {
                totalEvents: this.data.events.length,
                totalEnrollments: this.data.enrollments.length,
                totalUsers: this.data.users.length,
                conversionRate: this.calculateConversionRate(),
                avgEventSize: this.calculateAvgEventSize(),
                growthRate: this.calculateGrowthRate()
            },
            topEvents: this.getTopEvents(5),
            userEngagement: this.calculateUserEngagement()
        };

        return report;
    }

    calculateConversionRate() {
        const views = this.data.pageViews.filter(p => p.page.includes('events')).length;
        const enrollments = this.data.enrollments.length;
        return views > 0 ? ((enrollments / views) * 100).toFixed(2) : 0;
    }

    calculateAvgEventSize() {
        const eventEnrollments = {};
        this.data.enrollments.forEach(e => {
            eventEnrollments[e.eventId] = (eventEnrollments[e.eventId] || 0) + 1;
        });
        const sizes = Object.values(eventEnrollments);
        return sizes.length > 0 ? (sizes.reduce((a, b) => a + b, 0) / sizes.length).toFixed(1) : 0;
    }

    calculateGrowthRate() {
        // Taxa de crescimento mês a mês
        const thisMonth = this.data.enrollments.filter(e => {
            const date = new Date(e.enrolledAt);
            const now = new Date();
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        }).length;

        const lastMonth = this.data.enrollments.filter(e => {
            const date = new Date(e.enrolledAt);
            const now = new Date();
            const last = new Date(now.setMonth(now.getMonth() - 1));
            return date.getMonth() === last.getMonth() && date.getFullYear() === last.getFullYear();
        }).length;

        return lastMonth > 0 ? (((thisMonth - lastMonth) / lastMonth) * 100).toFixed(1) : 0;
    }

    getTopEvents(limit = 5) {
        const eventEnrollments = {};
        this.data.enrollments.forEach(e => {
            eventEnrollments[e.eventId] = (eventEnrollments[e.eventId] || 0) + 1;
        });

        return Object.entries(eventEnrollments)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([eventId, count]) => {
                const event = this.data.events.find(e => e.id === eventId);
                return { event: event?.name, enrollments: count };
            });
    }

    calculateUserEngagement() {
        const activeUsers = new Set(this.data.pageViews.map(p => p.userAgent)).size;
        const enrolledUsers = new Set(this.data.enrollments.map(e => e.userId)).size;
        return {
            active: activeUsers,
            enrolled: enrolledUsers,
            rate: activeUsers > 0 ? ((enrolledUsers / activeUsers) * 100).toFixed(1) : 0
        };
    }
}

// Inicializar
let advancedAnalytics;
document.addEventListener('DOMContentLoaded', () => {
    advancedAnalytics = new AdvancedAnalytics();
    window.advancedAnalytics = advancedAnalytics;
});

// Função de inicialização global
function initAdvancedAnalytics() {
    console.log('[analytics] 📊 Inicializando analytics avançado...');
    
    if (!window.analyticsInstance) {
        window.analyticsInstance = new AdvancedAnalytics();
    } else {
        // Recarregar dashboard se já existe
        if (window.analyticsInstance.renderDashboard) {
            window.analyticsInstance.renderDashboard();
        }
    }
    
    // Configurar listener para seletor de período
    const timeRangeSelect = document.getElementById('analyticsTimeRange');
    if (timeRangeSelect && !timeRangeSelect.dataset.analyticsListenerAdded) {
        timeRangeSelect.dataset.analyticsListenerAdded = 'true';
        timeRangeSelect.addEventListener('change', (e) => {
            const days = parseInt(e.target.value);
            if (window.analyticsInstance && window.analyticsInstance.renderDashboard) {
                window.analyticsInstance.renderDashboard(days);
            }
        });
    }
    
    console.log('[analytics] ✅ Analytics avançado inicializado');
}

window.initAdvancedAnalytics = initAdvancedAnalytics;
window.AdvancedAnalytics = AdvancedAnalytics;
