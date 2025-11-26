// Sistema de Temas Personalizáveis
class ThemeCustomizer {
    constructor() {
        this.currentTheme = JSON.parse(localStorage.getItem('custom_theme') || '{}');
        this.defaultTheme = {
            primaryColor: '#9b59b6',
            secondaryColor: '#3498db',
            backgroundColor: '#f8f9fa',
            textColor: '#2c3e50',
            fontFamily: 'Inter, sans-serif',
            borderRadius: '10px',
            logo: null
        };
        this.init();
    }

    init() {
        this.applyTheme();
        this.renderCustomizer();
    }

    applyTheme() {
        const theme = { ...this.defaultTheme, ...this.currentTheme };
        
        document.documentElement.style.setProperty('--primary-color', theme.primaryColor);
        document.documentElement.style.setProperty('--secondary-color', theme.secondaryColor);
        document.documentElement.style.setProperty('--background-color', theme.backgroundColor);
        document.documentElement.style.setProperty('--text-color', theme.textColor);
        document.documentElement.style.setProperty('--font-family', theme.fontFamily);
        document.documentElement.style.setProperty('--border-radius', theme.borderRadius);

        if (theme.logo) {
            const logoElements = document.querySelectorAll('.site-logo');
            logoElements.forEach(el => el.src = theme.logo);
        }
    }

    updateColor(property, color) {
        this.currentTheme[property] = color;
        this.saveTheme();
        this.applyTheme();
    }

    updateFont(font) {
        this.currentTheme.fontFamily = font;
        this.saveTheme();
        this.applyTheme();
    }

    uploadLogo(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            this.currentTheme.logo = e.target.result;
            this.saveTheme();
            this.applyTheme();
            showNotificationToast('Logo atualizado!', 'success');
        };
        reader.readAsDataURL(file);
    }

    resetToDefault() {
        this.currentTheme = {};
        this.saveTheme();
        this.applyTheme();
        showNotificationToast('Tema restaurado!', 'success');
    }

    renderCustomizer() {
        const container = document.getElementById('theme-customizer');
        if (!container) return;

        const theme = { ...this.defaultTheme, ...this.currentTheme };

        container.innerHTML = `
            <div class="theme-customizer">
                <h3>🎨 Personalizar Tema</h3>
                
                <div class="customizer-section">
                    <label>Cor Primária</label>
                    <input type="color" value="${theme.primaryColor}" 
                           onchange="themeCustomizer.updateColor('primaryColor', this.value)">
                </div>

                <div class="customizer-section">
                    <label>Cor Secundária</label>
                    <input type="color" value="${theme.secondaryColor}" 
                           onchange="themeCustomizer.updateColor('secondaryColor', this.value)">
                </div>

                <div class="customizer-section">
                    <label>Cor de Fundo</label>
                    <input type="color" value="${theme.backgroundColor}" 
                           onchange="themeCustomizer.updateColor('backgroundColor', this.value)">
                </div>

                <div class="customizer-section">
                    <label>Fonte</label>
                    <select onchange="themeCustomizer.updateFont(this.value)">
                        <option value="Inter, sans-serif" ${theme.fontFamily.includes('Inter') ? 'selected' : ''}>Inter</option>
                        <option value="Roboto, sans-serif" ${theme.fontFamily.includes('Roboto') ? 'selected' : ''}>Roboto</option>
                        <option value="Poppins, sans-serif" ${theme.fontFamily.includes('Poppins') ? 'selected' : ''}>Poppins</option>
                        <option value="Montserrat, sans-serif" ${theme.fontFamily.includes('Montserrat') ? 'selected' : ''}>Montserrat</option>
                    </select>
                </div>

                <div class="customizer-section">
                    <label>Logo</label>
                    <input type="file" accept="image/*" 
                           onchange="themeCustomizer.uploadLogo(this.files[0])">
                </div>

                <div class="customizer-actions">
                    <button class="btn btn-secondary" onclick="themeCustomizer.resetToDefault()">
                        Restaurar Padrão
                    </button>
                    <button class="btn btn-primary" onclick="themeCustomizer.exportTheme()">
                        Exportar Tema
                    </button>
                </div>

                <div class="theme-preview">
                    <h4>Pré-visualização</h4>
                    <div class="preview-card" style="background: ${theme.backgroundColor}; color: ${theme.textColor}; font-family: ${theme.fontFamily};">
                        <button style="background: ${theme.primaryColor};">Botão Primário</button>
                        <button style="background: ${theme.secondaryColor};">Botão Secundário</button>
                    </div>
                </div>
            </div>
        `;
    }

    exportTheme() {
        const json = JSON.stringify(this.currentTheme, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'eventflow-theme.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    saveTheme() {
        localStorage.setItem('custom_theme', JSON.stringify(this.currentTheme));
    }
}

// Inicializar
let themeCustomizer;
document.addEventListener('DOMContentLoaded', () => {
    themeCustomizer = new ThemeCustomizer();
    window.themeCustomizer = themeCustomizer;
});
