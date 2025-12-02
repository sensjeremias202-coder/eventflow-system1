// Sistema de Calendário Visual Interativo
class CalendarSystem {
    constructor() {
        this.calendar = null;
        this.events = [];
        this.view = 'month'; // month, week, day
        this.currentDate = new Date();
        this.init();
    }

    init() {
        this.loadEvents();
        this.renderCalendar();
        this.setupEventListeners();
        this.loadGoogleCalendarIntegration();
    }

    loadEvents() {
        const allEvents = JSON.parse(localStorage.getItem('events') || '[]');
        this.events = allEvents.map(event => ({
            id: event.id,
            title: event.name,
            start: new Date(event.date),
            end: event.endDate ? new Date(event.endDate) : new Date(event.date),
            description: event.description,
            location: event.location,
            category: event.category,
            color: this.getCategoryColor(event.category),
            attendees: event.attendees || 0,
            maxAttendees: event.maxAttendees || null
        }));
    }

    getCategoryColor(category) {
        const colors = {
            'Culto': '#9b59b6',
            'Conferência': '#3498db',
            'Workshop': '#e74c3c',
            'Retiro': '#2ecc71',
            'Evangelismo': '#f39c12',
            'Jovens': '#1abc9c',
            'Infantil': '#e67e22',
            'Oração': '#34495e'
        };
        return colors[category] || '#95a5a6';
    }

    renderCalendar() {
        const container = document.getElementById('calendar-container');
        if (!container) return;

        container.innerHTML = `
            <div class="calendar-wrapper">
                <div class="calendar-header">
                    <div class="calendar-nav">
                        <button class="btn-calendar-nav" id="prevMonth">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <h2 id="currentMonth">${this.getMonthYearText()}</h2>
                        <button class="btn-calendar-nav" id="nextMonth">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                    <div class="calendar-views">
                        <button class="btn-view ${this.view === 'month' ? 'active' : ''}" data-view="month">Mês</button>
                        <button class="btn-view ${this.view === 'week' ? 'active' : ''}" data-view="week">Semana</button>
                        <button class="btn-view ${this.view === 'day' ? 'active' : ''}" data-view="day">Dia</button>
                    </div>
                    <div class="calendar-actions">
                        <button class="btn-calendar-action" id="todayBtn">Hoje</button>
                        <button class="btn-calendar-action" id="syncGoogleCalendar">
                            <i class="fab fa-google"></i> Sincronizar Google
                        </button>
                        <button class="btn-calendar-action" id="exportCalendar">
                            <i class="fas fa-download"></i> Exportar
                        </button>
                    </div>
                </div>
                <div id="calendar-grid" class="calendar-grid">
                    ${this.renderCalendarGrid()}
                </div>
                <div class="calendar-legend">
                    ${this.renderLegend()}
                </div>
            </div>
        `;

        this.attachCalendarListeners();
    }

    getMonthYearText() {
        const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                       'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        return `${months[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
    }

    renderCalendarGrid() {
        if (this.view === 'month') return this.renderMonthView();
        if (this.view === 'week') return this.renderWeekView();
        if (this.view === 'day') return this.renderDayView();
    }

    renderMonthView() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDay = firstDay.getDay();
        const daysInMonth = lastDay.getDate();

        let html = '<div class="calendar-month">';
        html += '<div class="calendar-weekdays">';
        ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].forEach(day => {
            html += `<div class="weekday">${day}</div>`;
        });
        html += '</div><div class="calendar-days">';

        // Dias do mês anterior
        const prevMonthDays = new Date(year, month, 0).getDate();
        for (let i = startDay - 1; i >= 0; i--) {
            html += `<div class="calendar-day other-month">${prevMonthDays - i}</div>`;
        }

        // Dias do mês atual
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const isToday = this.isToday(date);
            const dayEvents = this.getEventsForDate(date);
            
            html += `<div class="calendar-day ${isToday ? 'today' : ''}" data-date="${date.toISOString()}">
                <div class="day-number">${day}</div>
                <div class="day-events">
                    ${dayEvents.slice(0, 3).map(event => `
                        <div class="day-event" style="background: ${event.color}" 
                             data-event-id="${event.id}" draggable="true">
                            <span class="event-time">${this.formatTime(event.start)}</span>
                            <span class="event-title">${event.title}</span>
                        </div>
                    `).join('')}
                    ${dayEvents.length > 3 ? `<div class="more-events">+${dayEvents.length - 3} mais</div>` : ''}
                </div>
            </div>`;
        }

        // Dias do próximo mês
        const remainingDays = 42 - (startDay + daysInMonth);
        for (let day = 1; day <= remainingDays; day++) {
            html += `<div class="calendar-day other-month">${day}</div>`;
        }

        html += '</div></div>';
        return html;
    }

    renderWeekView() {
        const startOfWeek = this.getStartOfWeek(this.currentDate);
        let html = '<div class="calendar-week">';
        html += '<div class="week-timeline">';
        
        for (let hour = 0; hour < 24; hour++) {
            html += `<div class="timeline-hour">${hour.toString().padStart(2, '0')}:00</div>`;
        }
        html += '</div>';
        html += '<div class="week-days">';

        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(date.getDate() + i);
            const dayEvents = this.getEventsForDate(date);
            
            html += `<div class="week-day" data-date="${date.toISOString()}">
                <div class="week-day-header">
                    <div class="week-day-name">${['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][i]}</div>
                    <div class="week-day-number">${date.getDate()}</div>
                </div>
                <div class="week-day-events">
                    ${dayEvents.map(event => {
                        const top = (event.start.getHours() + event.start.getMinutes() / 60) * 60;
                        const duration = (event.end - event.start) / (1000 * 60 * 60);
                        const height = duration * 60;
                        return `
                            <div class="week-event" style="top: ${top}px; height: ${height}px; background: ${event.color}"
                                 data-event-id="${event.id}" draggable="true">
                                <strong>${event.title}</strong>
                                <div>${this.formatTime(event.start)} - ${this.formatTime(event.end)}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>`;
        }

        html += '</div></div>';
        return html;
    }

    renderDayView() {
        const dayEvents = this.getEventsForDate(this.currentDate);
        let html = '<div class="calendar-day-view">';
        html += `<h3>${this.currentDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</h3>`;
        html += '<div class="day-view-timeline">';

        for (let hour = 0; hour < 24; hour++) {
            html += `<div class="day-view-hour">
                <div class="hour-label">${hour.toString().padStart(2, '0')}:00</div>
                <div class="hour-events">
                    ${dayEvents.filter(event => event.start.getHours() === hour).map(event => `
                        <div class="day-view-event" style="background: ${event.color}" data-event-id="${event.id}">
                            <strong>${event.title}</strong>
                            <div>${this.formatTime(event.start)} - ${this.formatTime(event.end)}</div>
                            <div><i class="fas fa-map-marker-alt"></i> ${event.location}</div>
                            <div><i class="fas fa-users"></i> ${event.attendees}/${event.maxAttendees || '∞'}</div>
                        </div>
                    `).join('')}
                </div>
            </div>`;
        }

        html += '</div></div>';
        return html;
    }

    renderLegend() {
        const categories = [...new Set(this.events.map(e => e.category))];
        return categories.map(cat => `
            <div class="legend-item">
                <span class="legend-color" style="background: ${this.getCategoryColor(cat)}"></span>
                <span class="legend-label">${cat}</span>
            </div>
        `).join('');
    }

    // API pública para trocar a visão pelo UI externo (ex.: botões no index)
    changeView(view) {
        if (!['month', 'week', 'day'].includes(view)) return;
        this.view = view;
        this.renderCalendar();
    }

    // API pública para navegar meses
    next() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.renderCalendar();
    }

    prev() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.renderCalendar();
    }

    getEventsForDate(date) {
        return this.events.filter(event => {
            const eventDate = new Date(event.start);
            return eventDate.toDateString() === date.toDateString();
        });
    }

    isToday(date) {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }

    getStartOfWeek(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day;
        return new Date(d.setDate(diff));
    }

    formatTime(date) {
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }

    attachCalendarListeners() {
        document.getElementById('prevMonth')?.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.renderCalendar();
        });

        document.getElementById('nextMonth')?.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.renderCalendar();
        });

        document.getElementById('todayBtn')?.addEventListener('click', () => {
            this.currentDate = new Date();
            this.renderCalendar();
        });

        document.querySelectorAll('.btn-view').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.view = e.target.dataset.view;
                this.renderCalendar();
            });
        });

        document.getElementById('syncGoogleCalendar')?.addEventListener('click', () => {
            this.syncWithGoogleCalendar();
        });

        document.getElementById('exportCalendar')?.addEventListener('click', () => {
            this.exportToICalendar();
        });

        // Drag and drop
        this.setupDragAndDrop();
    }

    setupDragAndDrop() {
        let draggedEvent = null;

        document.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('day-event') || e.target.classList.contains('week-event')) {
                draggedEvent = e.target.dataset.eventId;
                e.target.style.opacity = '0.5';
            }
        });

        document.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('day-event') || e.target.classList.contains('week-event')) {
                e.target.style.opacity = '1';
            }
        });

        document.addEventListener('dragover', (e) => {
            if (e.target.closest('.calendar-day') || e.target.closest('.week-day')) {
                e.preventDefault();
            }
        });

        document.addEventListener('drop', (e) => {
            e.preventDefault();
            const target = e.target.closest('.calendar-day') || e.target.closest('.week-day');
            if (target && draggedEvent) {
                const newDate = target.dataset.date;
                this.moveEvent(draggedEvent, new Date(newDate));
                draggedEvent = null;
            }
        });
    }

    moveEvent(eventId, newDate) {
        const events = JSON.parse(localStorage.getItem('events') || '[]');
        const event = events.find(e => e.id === eventId);
        
        if (event) {
            event.date = newDate.toISOString();
            localStorage.setItem('events', JSON.stringify(events));
            this.loadEvents();
            this.renderCalendar();
            showNotificationToast('Evento movido com sucesso!', 'success');
        }
    }

    setupEventListeners() {
        // Click em evento para ver detalhes
        document.addEventListener('click', (e) => {
            const eventElement = e.target.closest('.day-event, .week-event, .day-view-event');
            if (eventElement) {
                const eventId = eventElement.dataset.eventId;
                this.showEventDetails(eventId);
            }
        });
    }

    showEventDetails(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (!event) return;

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>${event.title}</h2>
                <div class="event-details">
                    <p><i class="fas fa-calendar"></i> ${event.start.toLocaleDateString('pt-BR')}</p>
                    <p><i class="fas fa-clock"></i> ${this.formatTime(event.start)} - ${this.formatTime(event.end)}</p>
                    <p><i class="fas fa-map-marker-alt"></i> ${event.location}</p>
                    <p><i class="fas fa-tag"></i> ${event.category}</p>
                    <p><i class="fas fa-users"></i> ${event.attendees}/${event.maxAttendees || '∞'} participantes</p>
                    <p>${event.description}</p>
                </div>
                <div class="event-actions">
                    <button class="btn btn-primary" onclick="enrollInEvent('${event.id}')">Inscrever-se</button>
                    <button class="btn btn-secondary" onclick="shareEvent('${event.id}')">Compartilhar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.style.display = 'block';

        modal.querySelector('.close').addEventListener('click', () => {
            modal.remove();
        });
    }

    loadGoogleCalendarIntegration() {
        // Placeholder para integração futura com Google Calendar API
        console.log('Google Calendar integration ready');
    }

    syncWithGoogleCalendar() {
        showNotificationToast('Sincronização com Google Calendar em desenvolvimento', 'info');
    }

    exportToICalendar() {
        let icsContent = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//EventFlow//Calendar//PT\n';
        
        this.events.forEach(event => {
            icsContent += 'BEGIN:VEVENT\n';
            icsContent += `UID:${event.id}\n`;
            icsContent += `DTSTAMP:${this.formatDateToICS(new Date())}\n`;
            icsContent += `DTSTART:${this.formatDateToICS(event.start)}\n`;
            icsContent += `DTEND:${this.formatDateToICS(event.end)}\n`;
            icsContent += `SUMMARY:${event.title}\n`;
            icsContent += `DESCRIPTION:${event.description}\n`;
            icsContent += `LOCATION:${event.location}\n`;
            icsContent += 'END:VEVENT\n';
        });
        
        icsContent += 'END:VCALENDAR';

        const blob = new Blob([icsContent], { type: 'text/calendar' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'eventflow-calendar.ics';
        a.click();
        URL.revokeObjectURL(url);
    }

    formatDateToICS(date) {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    }
}

// Inicializar sistema de calendário
let calendarSystem;
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('calendar-container')) {
        calendarSystem = new CalendarSystem();
    }
});
