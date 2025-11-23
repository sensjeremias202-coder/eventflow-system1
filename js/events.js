function createEvent() {
    if (!validateEventForm()) return;
    
    const title = document.getElementById('eventTitle').value;
    const date = document.getElementById('eventDate').value;
    const time = document.getElementById('eventTime').value;
    const location = document.getElementById('eventLocation').value;
    const description = document.getElementById('eventDescription').value;
    const category = parseInt(document.getElementById('eventCategory').value);
    
    // Verificar se a categoria existe
    const categoryExists = categories.find(c => c.id === category);
    if (!categoryExists) {
        showNotification('Categoria selecionada não existe!', 'error');
        return;
    }
    
    const newEvent = {
        id: events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1,
        title: title.trim(),
        date,
        time,
        location: location.trim(),
        description: description.trim(),
        category,
        createdBy: currentUser.id,
        ratings: [],
        createdAt: new Date().toISOString()
    };
    
    events.push(newEvent);
    saveData();
    
    showNotification('Evento criado com sucesso!', 'success');
    closeModal('addEventModal');
    loadEvents();
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
    
    // Resetar formulário do evento
    if (modalId === 'addEventModal') {
        const form = document.getElementById('addEventForm');
        if (form) {
            form.reset();
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.textContent = 'Criar Evento';
                submitBtn.onclick = null;
            }
        }
    }
}