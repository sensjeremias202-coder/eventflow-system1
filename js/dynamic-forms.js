// Formulários Dinâmicos
class DynamicFormsBuilder {
    constructor() {
        this.forms = [];
        this.init();
    }

    init() {
        this.loadForms();
    }

    loadForms() {
        this.forms = JSON.parse(localStorage.getItem('dynamic_forms') || '[]');
    }

    createForm(name, fields) {
        const form = {
            id: 'form-' + Date.now(),
            name,
            fields, // [{type, label, required, options, validation}]
            createdAt: new Date()
        };

        this.forms.push(form);
        this.saveForms();
        return form;
    }

    renderFormBuilder() {
        return `
            <div class="form-builder">
                <div class="field-palette">
                    <h4>Campos Disponíveis</h4>
                    <div class="field-options">
                        <div class="field-option" draggable="true" data-type="text">📝 Texto</div>
                        <div class="field-option" draggable="true" data-type="email">📧 E-mail</div>
                        <div class="field-option" draggable="true" data-type="number">🔢 Número</div>
                        <div class="field-option" draggable="true" data-type="select">📋 Seleção</div>
                        <div class="field-option" draggable="true" data-type="checkbox">☑️ Checkbox</div>
                        <div class="field-option" draggable="true" data-type="radio">🔘 Radio</div>
                        <div class="field-option" draggable="true" data-type="textarea">📄 Texto Longo</div>
                        <div class="field-option" draggable="true" data-type="date">📅 Data</div>
                    </div>
                </div>
                <div class="form-canvas" id="form-canvas">
                    <p class="text-muted">Arraste campos aqui</p>
                </div>
            </div>
        `;
    }

    renderForm(formId) {
        const form = this.forms.find(f => f.id === formId);
        if (!form) return '';

        return `
            <form class="dynamic-form" data-form-id="${formId}">
                <h3>${form.name}</h3>
                ${form.fields.map(field => this.renderField(field)).join('')}
                <button type="submit" class="btn btn-primary">Enviar</button>
            </form>
        `;
    }

    renderField(field) {
        let html = `<div class="form-field">
                      <label>${field.label}${field.required ? ' *' : ''}</label>`;

        switch (field.type) {
            case 'text':
            case 'email':
            case 'number':
            case 'date':
                html += `<input type="${field.type}" name="${field.name}" ${field.required ? 'required' : ''}>`;
                break;
            case 'textarea':
                html += `<textarea name="${field.name}" ${field.required ? 'required' : ''}></textarea>`;
                break;
            case 'select':
                html += `<select name="${field.name}" ${field.required ? 'required' : ''}>
                          ${field.options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                        </select>`;
                break;
            case 'checkbox':
                html += field.options.map(opt => 
                    `<label><input type="checkbox" name="${field.name}" value="${opt}"> ${opt}</label>`
                ).join('');
                break;
            case 'radio':
                html += field.options.map(opt => 
                    `<label><input type="radio" name="${field.name}" value="${opt}"> ${opt}</label>`
                ).join('');
                break;
        }

        html += '</div>';
        return html;
    }

    saveForms() {
        localStorage.setItem('dynamic_forms', JSON.stringify(this.forms));
    }
}

// Inicializar
let dynamicFormsBuilder;
document.addEventListener('DOMContentLoaded', () => {
    dynamicFormsBuilder = new DynamicFormsBuilder();
    window.dynamicFormsBuilder = dynamicFormsBuilder;
});
