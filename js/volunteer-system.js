// Sistema de Gestão de Voluntários
class VolunteerSystem {
    constructor() {
        this.volunteers = [];
        this.schedules = [];
        this.certificates = [];
        this.init();
    }

    init() {
        this.loadData();
        this.renderVolunteerDashboard();
        this.setupEventListeners();
    }

    loadData() {
        this.volunteers = JSON.parse(localStorage.getItem('volunteers') || '[]');
        this.schedules = JSON.parse(localStorage.getItem('volunteer_schedules') || '[]');
        this.certificates = JSON.parse(localStorage.getItem('volunteer_certificates') || '[]');
    }

    registerVolunteer(userId, eventId, role, availability) {
        const volunteer = {
            id: 'vol-' + Date.now(),
            userId,
            eventId,
            role, // Recepção, Logística, Louvor, Mídia, Segurança, etc.
            availability,
            status: 'pending', // pending, approved, active, completed
            registeredAt: new Date(),
            hoursWorked: 0,
            rating: 0
        };

        this.volunteers.push(volunteer);
        this.saveVolunteers();
        showNotificationToast('Cadastro de voluntário realizado!', 'success');
        return volunteer;
    }

    approveVolunteer(volunteerId) {
        const volunteer = this.volunteers.find(v => v.id === volunteerId);
        if (volunteer) {
            volunteer.status = 'approved';
            this.saveVolunteers();
            
            // Enviar e-mail de aprovação
            if (window.emailSystem) {
                const user = this.getUserById(volunteer.userId);
                const event = this.getEventById(volunteer.eventId);
                // emailSystem enviaria e-mail customizado
            }
            
            showNotificationToast('Voluntário aprovado!', 'success');
        }
    }

    createSchedule(eventId, shifts) {
        const schedule = {
            id: 'sched-' + Date.now(),
            eventId,
            shifts: shifts.map(shift => ({
                id: 'shift-' + Date.now() + Math.random(),
                role: shift.role,
                startTime: shift.startTime,
                endTime: shift.endTime,
                volunteersNeeded: shift.volunteersNeeded,
                assignedVolunteers: []
            })),
            createdAt: new Date()
        };

        this.schedules.push(schedule);
        this.saveSchedules();
        return schedule;
    }

    assignVolunteerToShift(volunteerId, shiftId) {
        const schedule = this.schedules.find(s => 
            s.shifts.some(shift => shift.id === shiftId)
        );

        if (schedule) {
            const shift = schedule.shifts.find(s => s.id === shiftId);
            if (shift && shift.assignedVolunteers.length < shift.volunteersNeeded) {
                shift.assignedVolunteers.push(volunteerId);
                this.saveSchedules();
                
                // Notificar voluntário
                const volunteer = this.volunteers.find(v => v.id === volunteerId);
                if (volunteer) {
                    this.notifyVolunteer(volunteer, shift);
                }
                
                showNotificationToast('Voluntário escalado!', 'success');
            }
        }
    }

    autoAssignVolunteers(eventId) {
        const eventSchedules = this.schedules.filter(s => s.eventId === eventId);
        const eventVolunteers = this.volunteers.filter(v => 
            v.eventId === eventId && v.status === 'approved'
        );

        eventSchedules.forEach(schedule => {
            schedule.shifts.forEach(shift => {
                const availableVolunteers = eventVolunteers.filter(v => 
                    v.role === shift.role && 
                    !shift.assignedVolunteers.includes(v.id) &&
                    this.isAvailable(v, shift)
                );

                const needed = shift.volunteersNeeded - shift.assignedVolunteers.length;
                availableVolunteers.slice(0, needed).forEach(v => {
                    shift.assignedVolunteers.push(v.id);
                    this.notifyVolunteer(v, shift);
                });
            });
        });

        this.saveSchedules();
        showNotificationToast('Escala automática criada!', 'success');
    }

    isAvailable(volunteer, shift) {
        // Verificar disponibilidade do voluntário
        return volunteer.availability.some(slot => 
            slot.startTime <= shift.startTime && slot.endTime >= shift.endTime
        );
    }

    trackHours(volunteerId, hours) {
        const volunteer = this.volunteers.find(v => v.id === volunteerId);
        if (volunteer) {
            volunteer.hoursWorked += hours;
            volunteer.status = 'completed';
            this.saveVolunteers();
            
            // Verificar se merece certificado
            if (volunteer.hoursWorked >= 10) {
                this.generateCertificate(volunteerId);
            }
        }
    }

    generateCertificate(volunteerId) {
        const volunteer = this.volunteers.find(v => v.id === volunteerId);
        if (!volunteer) return;

        const user = this.getUserById(volunteer.userId);
        const event = this.getEventById(volunteer.eventId);

        const certificate = {
            id: 'cert-' + Date.now(),
            volunteerId,
            userId: volunteer.userId,
            eventId: volunteer.eventId,
            userName: user?.name,
            eventName: event?.name,
            role: volunteer.role,
            hoursWorked: volunteer.hoursWorked,
            issuedAt: new Date(),
            certificateNumber: `CERT-${Date.now()}`
        };

        this.certificates.push(certificate);
        this.saveCertificates();
        
        showNotificationToast('Certificado gerado!', 'success');
        
        // Enviar por e-mail
        if (window.emailSystem) {
            // emailSystem.sendCertificate(certificate);
        }
        
        return certificate;
    }

    notifyVolunteer(volunteer, shift) {
        const user = this.getUserById(volunteer.userId);
        const event = this.getEventById(volunteer.eventId);
        
        if (window.emailSystem && user && event) {
            // Enviar e-mail com detalhes do turno
            console.log('📧 Notificando voluntário:', user.name);
        }
    }

    renderVolunteerDashboard() {
        const container = document.getElementById('volunteer-dashboard');
        if (!container) return;

        container.innerHTML = `
            <div class="volunteer-dashboard">
                <div class="volunteer-stats">
                    <div class="stat-card">
                        <h3>${this.volunteers.length}</h3>
                        <p>Voluntários Cadastrados</p>
                    </div>
                    <div class="stat-card">
                        <h3>${this.volunteers.filter(v => v.status === 'active').length}</h3>
                        <p>Ativos</p>
                    </div>
                    <div class="stat-card">
                        <h3>${this.volunteers.reduce((sum, v) => sum + v.hoursWorked, 0)}</h3>
                        <p>Horas Totais</p>
                    </div>
                    <div class="stat-card">
                        <h3>${this.certificates.length}</h3>
                        <p>Certificados Emitidos</p>
                    </div>
                </div>

                <div class="volunteer-sections">
                    <div class="volunteer-list-section">
                        <h3>📋 Lista de Voluntários</h3>
                        ${this.renderVolunteerList()}
                    </div>
                    <div class="schedule-section">
                        <h3>📅 Escalas</h3>
                        ${this.renderSchedules()}
                    </div>
                </div>

                <div class="volunteer-actions">
                    <button class="btn btn-primary" onclick="volunteerSystem.showRegisterForm()">
                        <i class="fas fa-user-plus"></i> Cadastrar Voluntário
                    </button>
                    <button class="btn btn-secondary" onclick="volunteerSystem.showScheduleForm()">
                        <i class="fas fa-calendar-plus"></i> Criar Escala
                    </button>
                </div>
            </div>
        `;
    }

    renderVolunteerList() {
        if (this.volunteers.length === 0) {
            return '<p class="text-muted">Nenhum voluntário cadastrado</p>';
        }

        return `
            <table class="volunteer-table">
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Função</th>
                        <th>Status</th>
                        <th>Horas</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.volunteers.map(v => {
                        const user = this.getUserById(v.userId);
                        return `
                            <tr>
                                <td>${user?.name || 'Desconhecido'}</td>
                                <td>${v.role}</td>
                                <td><span class="status-badge status-${v.status}">${v.status}</span></td>
                                <td>${v.hoursWorked}h</td>
                                <td>
                                    ${v.status === 'pending' ? `<button class="btn-approve" onclick="volunteerSystem.approveVolunteer('${v.id}')">Aprovar</button>` : ''}
                                    <button class="btn-details" onclick="volunteerSystem.showVolunteerDetails('${v.id}')">Detalhes</button>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
    }

    renderSchedules() {
        if (this.schedules.length === 0) {
            return '<p class="text-muted">Nenhuma escala criada</p>';
        }

        return this.schedules.map(schedule => {
            const event = this.getEventById(schedule.eventId);
            return `
                <div class="schedule-card">
                    <h4>${event?.name || 'Evento'}</h4>
                    <div class="shifts">
                        ${schedule.shifts.map(shift => `
                            <div class="shift-item">
                                <div class="shift-info">
                                    <strong>${shift.role}</strong>
                                    <span>${shift.startTime} - ${shift.endTime}</span>
                                </div>
                                <div class="shift-volunteers">
                                    ${shift.assignedVolunteers.length} / ${shift.volunteersNeeded}
                                    <button class="btn-assign" onclick="volunteerSystem.showAssignModal('${shift.id}')">
                                        <i class="fas fa-user-plus"></i>
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('');
    }

    showRegisterForm() {
        // Mostrar formulário de cadastro
        showNotificationToast('Formulário em desenvolvimento', 'info');
    }

    showScheduleForm() {
        // Mostrar formulário de escala
        showNotificationToast('Formulário em desenvolvimento', 'info');
    }

    showVolunteerDetails(volunteerId) {
        // Mostrar detalhes do voluntário
        const volunteer = this.volunteers.find(v => v.id === volunteerId);
        console.log('Detalhes:', volunteer);
    }

    showAssignModal(shiftId) {
        // Mostrar modal de atribuição
        showNotificationToast('Modal em desenvolvimento', 'info');
    }

    getUserById(userId) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        return users.find(u => u.id === userId);
    }

    getEventById(eventId) {
        const events = JSON.parse(localStorage.getItem('events') || '[]');
        return events.find(e => e.id === eventId);
    }

    saveVolunteers() {
        localStorage.setItem('volunteers', JSON.stringify(this.volunteers));
    }

    saveSchedules() {
        localStorage.setItem('volunteer_schedules', JSON.stringify(this.schedules));
    }

    saveCertificates() {
        localStorage.setItem('volunteer_certificates', JSON.stringify(this.certificates));
    }

    setupEventListeners() {
        // Listeners para ações de voluntário
    }

    exportReport() {
        const csv = ['ID,Nome,Função,Horas,Status'].concat(
            this.volunteers.map(v => {
                const user = this.getUserById(v.userId);
                return `${v.id},${user?.name},${v.role},${v.hoursWorked},${v.status}`;
            })
        ).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'voluntarios.csv';
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Inicializar
let volunteerSystem;
document.addEventListener('DOMContentLoaded', () => {
    volunteerSystem = new VolunteerSystem();
    window.volunteerSystem = volunteerSystem;
});
