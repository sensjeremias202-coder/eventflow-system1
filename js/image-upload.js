/**
 * ============================================
 * SISTEMA DE UPLOAD DE IMAGENS
 * ============================================
 */

// Upload de foto de perfil
function uploadProfilePicture() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        if (file.size > 5 * 1024 * 1024) {
            showNotification('Imagem muito grande! Máximo 5MB', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
            const imageData = event.target.result;
            
            // Salvar no perfil do usuário
            if (currentUser) {
                currentUser.profilePicture = imageData;
                
                // Atualizar no array de usuários
                const userIndex = users.findIndex(u => u.id === currentUser.id);
                if (userIndex !== -1) {
                    users[userIndex].profilePicture = imageData;
                }
                
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                saveDataWithSync();
                
                // Atualizar UI
                updateProfilePictureUI(imageData);
                
                showNotification('Foto de perfil atualizada!', 'success');
            }
        };
        
        reader.readAsDataURL(file);
    };
    
    input.click();
}

// Upload de banner para evento
function uploadEventBanner(eventId) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        if (file.size > 10 * 1024 * 1024) {
            showNotification('Imagem muito grande! Máximo 10MB', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
            const imageData = event.target.result;
            
            const eventObj = events.find(e => e.id === eventId);
            if (eventObj) {
                eventObj.banner = imageData;
                saveDataWithSync();
                
                showNotification('Banner adicionado com sucesso!', 'success');
                
                // Recarregar eventos
                if (typeof loadEvents === 'function') {
                    loadEvents();
                }
            }
        };
        
        reader.readAsDataURL(file);
    };
    
    input.click();
}

// Atualizar foto de perfil na UI
function updateProfilePictureUI(imageData) {
    document.querySelectorAll('.user-profile-pic').forEach(img => {
        img.src = imageData;
    });
}

// Obter foto de perfil do usuário
function getUserProfilePicture(userId) {
    const user = users.find(u => u.id === userId);
    return user && user.profilePicture ? user.profilePicture : getDefaultAvatar(user?.name || 'U');
}

// Avatar padrão com iniciais
function getDefaultAvatar(name) {
    const initial = name.charAt(0).toUpperCase();
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    
    // Background gradiente
    const gradient = ctx.createLinearGradient(0, 0, 200, 200);
    gradient.addColorStop(0, '#6C63FF');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 200, 200);
    
    // Texto
    ctx.fillStyle = 'white';
    ctx.font = 'bold 100px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initial, 100, 100);
    
    return canvas.toDataURL();
}
