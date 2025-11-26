// AI Assistant - GitHub Copilot Integration
let aiChatHistory = [];
let pendingChanges = null;

function initAiAssistant() {
    console.log('[ai-assistant] Inicializando assistente AI...');
    
    setupChatForm();
    setupSuggestionChips();
    setupClearChat();
    autoResizeTextarea();
    
    console.log('[ai-assistant] Assistente AI inicializado');
}

function setupChatForm() {
    const form = document.getElementById('aiChatForm');
    const input = document.getElementById('aiChatInput');
    
    if (!form || !input) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const message = input.value.trim();
        if (!message) return;
        
        // Adicionar mensagem do usuário
        addMessageToChat('user', message);
        
        // Limpar input
        input.value = '';
        input.style.height = 'auto';
        
        // Processar solicitação
        await processAiRequest(message);
    });
}

function setupSuggestionChips() {
    document.querySelectorAll('.suggestion-chip').forEach(chip => {
        chip.addEventListener('click', function() {
            const prompt = this.getAttribute('data-prompt');
            const input = document.getElementById('aiChatInput');
            if (input) {
                input.value = prompt;
                input.focus();
                input.style.height = 'auto';
                input.style.height = input.scrollHeight + 'px';
            }
        });
    });
}

function setupClearChat() {
    const clearBtn = document.getElementById('clearChatBtn');
    if (!clearBtn) return;
    
    clearBtn.addEventListener('click', () => {
        if (confirm('Deseja limpar toda a conversa?')) {
            aiChatHistory = [];
            const messagesContainer = document.getElementById('aiChatMessages');
            if (messagesContainer) {
                messagesContainer.innerHTML = `
                    <div class="ai-message assistant">
                        <div class="message-avatar">
                            <i class="fas fa-robot"></i>
                        </div>
                        <div class="message-content">
                            <div class="message-text">
                                Conversa limpa! Como posso ajudar você agora?
                            </div>
                            <div class="message-time">${getCurrentTime()}</div>
                        </div>
                    </div>
                `;
            }
            clearPreview();
        }
    });
}

function autoResizeTextarea() {
    const textarea = document.getElementById('aiChatInput');
    if (!textarea) return;
    
    textarea.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });
}

function addMessageToChat(role, content, isLoading = false) {
    const messagesContainer = document.getElementById('aiChatMessages');
    if (!messagesContainer) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `ai-message ${role}`;
    
    const avatarIcon = role === 'user' ? 'fa-user' : 'fa-robot';
    
    let contentHTML = content;
    if (isLoading) {
        contentHTML = `
            <div class="loading-message">
                <div class="loading-spinner"></div>
                <span>Processando sua solicitação...</span>
            </div>
        `;
    }
    
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas ${avatarIcon}"></i>
        </div>
        <div class="message-content">
            <div class="message-text">${contentHTML}</div>
            <div class="message-time">${getCurrentTime()}</div>
        </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Salvar no histórico
    if (!isLoading) {
        aiChatHistory.push({ role, content, timestamp: new Date() });
    }
    
    return messageDiv;
}

function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

async function processAiRequest(message) {
    // Adicionar mensagem de loading
    const loadingMsg = addMessageToChat('assistant', '', true);
    
    // Atualizar status
    updateAiStatus('Processando...', 'warning');
    
    try {
        // Analisar o tipo de solicitação
        const requestType = analyzeRequestType(message);
        
        // Simular processamento (aqui você integraria com a API do GitHub Copilot)
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Gerar resposta baseada no tipo
        const response = await generateAiResponse(message, requestType);
        
        // Remover mensagem de loading
        loadingMsg.remove();
        
        // Adicionar resposta
        addMessageToChat('assistant', response.message);
        
        // Se houver alterações, mostrar preview
        if (response.changes) {
            showPreview(response.changes);
        }
        
        updateAiStatus('Pronto para ajudar', 'success');
        
    } catch (error) {
        console.error('[ai-assistant] Erro ao processar solicitação:', error);
        loadingMsg.remove();
        addMessageToChat('assistant', '❌ Desculpe, ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.');
        updateAiStatus('Erro', 'danger');
    }
}

function analyzeRequestType(message) {
    const lowerMsg = message.toLowerCase();
    
    if (lowerMsg.match(/cor|tema|estilo|css|design|visual/)) return 'style';
    if (lowerMsg.match(/adicionar|criar|novo|implementar|funcionalidade/)) return 'feature';
    if (lowerMsg.match(/corrigir|bug|erro|problema|não funciona/)) return 'bugfix';
    if (lowerMsg.match(/relatório|análise|estatística|dados|dashboard/)) return 'analysis';
    if (lowerMsg.match(/permissão|acesso|role|usuário|segurança/)) return 'permission';
    
    return 'general';
}

async function generateAiResponse(message, type) {
    // Aqui você integraria com a API real do GitHub Copilot
    // Por enquanto, vamos retornar respostas simuladas baseadas no tipo
    
    const responses = {
        style: {
            message: `
                Entendi! Vou preparar as alterações de estilo que você solicitou.<br><br>
                <strong>Alterações propostas:</strong><br>
                • Modificação no arquivo <code>css/style.css</code><br>
                • Atualização de variáveis CSS<br>
                • Ajustes de tema e cores<br><br>
                Por favor, revise as alterações no painel ao lado e clique em "Aplicar Alterações" se estiver de acordo.
            `,
            changes: {
                files: ['css/style.css'],
                description: 'Alterações de estilo conforme solicitado',
                preview: generateStylePreview(message)
            }
        },
        feature: {
            message: `
                Perfeito! Vou implementar essa funcionalidade para você.<br><br>
                <strong>Arquivos que serão modificados:</strong><br>
                • JavaScript da página relevante<br>
                • HTML se necessário<br>
                • CSS para estilização<br><br>
                Revise o código gerado e aprove para aplicar as mudanças.
            `,
            changes: {
                files: ['js/app.js', 'index.html'],
                description: 'Nova funcionalidade implementada',
                preview: generateFeaturePreview(message)
            }
        },
        bugfix: {
            message: `
                Identifiquei o problema! Vou corrigir isso para você.<br><br>
                <strong>Correção proposta:</strong><br>
                • Análise do bug realizada<br>
                • Solução implementada<br>
                • Testes básicos incluídos<br><br>
                Confira a correção e aplique quando estiver pronto.
            `,
            changes: {
                files: ['js/app.js'],
                description: 'Correção de bug',
                preview: generateBugfixPreview(message)
            }
        },
        analysis: {
            message: `
                Análise concluída! Aqui estão os insights:<br><br>
                <strong>📊 Dados analisados:</strong><br>
                • Total de eventos: ${events.length}<br>
                • Total de usuários: ${users.length}<br>
                • Eventos ativos: ${events.filter(e => new Date(e.date) >= new Date()).length}<br>
                • Taxa de avaliação média: ${calculateAverageRating()}/5<br><br>
                Posso gerar um relatório mais detalhado se desejar!
            `,
            changes: null
        },
        permission: {
            message: `
                Entendi sua solicitação sobre permissões.<br><br>
                <strong>Ação necessária:</strong><br>
                • Vou ajustar as configurações de acesso<br>
                • Modificar roles e permissões<br>
                • Atualizar sistema de autenticação<br><br>
                Revise as mudanças de segurança antes de aplicar.
            `,
            changes: {
                files: ['js/auth.js'],
                description: 'Ajustes de permissão',
                preview: generatePermissionPreview(message)
            }
        },
        general: {
            message: `
                Entendi sua solicitação! 👍<br><br>
                Posso ajudar você com isso. Para melhor atender, poderia especificar:<br>
                • Qual página ou funcionalidade específica?<br>
                • Você quer adicionar, modificar ou remover algo?<br>
                • Há algum comportamento esperado em particular?<br><br>
                Quanto mais detalhes, melhor posso ajudar!
            `,
            changes: null
        }
    };
    
    return responses[type] || responses.general;
}

function generateStylePreview(message) {
    return `
        <div style="padding: 1rem; background: #f8f9fa; border-radius: 8px; font-family: monospace; font-size: 0.9rem;">
            <strong>Prévia das alterações em CSS:</strong><br><br>
            <code style="display: block; white-space: pre-wrap;">
/* Alterações sugeridas baseadas em: "${message}" */

:root {
    --primary: #2563eb; /* Cor principal atualizada */
    --secondary: #64748b;
    --accent: #3b82f6;
}

.header {
    background: var(--primary);
    transition: all 0.3s ease;
}
            </code>
        </div>
    `;
}

function generateFeaturePreview(message) {
    return `
        <div style="padding: 1rem; background: #f8f9fa; border-radius: 8px; font-family: monospace; font-size: 0.9rem;">
            <strong>Nova funcionalidade implementada:</strong><br><br>
            <code style="display: block; white-space: pre-wrap;">
// Solicitação: "${message}"

function newFeature() {
    console.log('Nova funcionalidade implementada!');
    // TODO: Implementar lógica específica
    showNotification('Funcionalidade ativada!', 'success');
}

// Event listener configurado
document.addEventListener('DOMContentLoaded', function() {
    newFeature();
});
            </code>
        </div>
    `;
}

function generateBugfixPreview(message) {
    return `
        <div style="padding: 1rem; background: #f8f9fa; border-radius: 8px; font-family: monospace; font-size: 0.9rem;">
            <strong>Correção aplicada:</strong><br><br>
            <code style="display: block; white-space: pre-wrap;">
// Bug corrigido: "${message}"

// ANTES:
// Código com problema identificado

// DEPOIS:
// Código corrigido e otimizado
function fixedFunction() {
    // Validação adicional
    if (!data) return;
    
    // Processamento correto
    processData(data);
}
            </code>
        </div>
    `;
}

function generatePermissionPreview(message) {
    return `
        <div style="padding: 1rem; background: #f8f9fa; border-radius: 8px; font-family: monospace; font-size: 0.9rem;">
            <strong>Ajustes de permissão:</strong><br><br>
            <code style="display: block; white-space: pre-wrap;">
// Solicitação: "${message}"

const permissions = {
    admin: ['all'],
    treasurer: ['events', 'users', 'categories', 'dashboard', 'chat'],
    jovens: ['events', 'chat', 'profile']
};

function checkPermission(page) {
    const userRole = currentUser?.role || 'jovens';
    return permissions[userRole]?.includes(page) || permissions[userRole]?.includes('all');
}
            </code>
        </div>
    `;
}

function showPreview(changes) {
    pendingChanges = changes;
    
    const previewContent = document.getElementById('aiPreviewContent');
    const previewInfo = document.getElementById('aiPreviewInfo');
    const modifiedFilesList = document.getElementById('modifiedFilesList');
    const applyBtn = document.getElementById('applyChangesBtn');
    const rejectBtn = document.getElementById('rejectChangesBtn');
    
    if (!previewContent) return;
    
    // Mostrar preview
    previewContent.innerHTML = changes.preview;
    
    // Mostrar arquivos modificados
    if (modifiedFilesList) {
        modifiedFilesList.innerHTML = changes.files.map(file => 
            `<li><i class="fas fa-file-code"></i> ${file}</li>`
        ).join('');
    }
    
    // Mostrar info e botões
    if (previewInfo) previewInfo.style.display = 'block';
    if (applyBtn) applyBtn.style.display = 'inline-flex';
    if (rejectBtn) rejectBtn.style.display = 'inline-flex';
    
    // Configurar botões
    setupPreviewButtons();
}

function setupPreviewButtons() {
    const applyBtn = document.getElementById('applyChangesBtn');
    const rejectBtn = document.getElementById('rejectChangesBtn');
    
    if (applyBtn) {
        const newApplyBtn = applyBtn.cloneNode(true);
        applyBtn.parentNode.replaceChild(newApplyBtn, applyBtn);
        
        newApplyBtn.addEventListener('click', () => {
            applyChanges();
        });
    }
    
    if (rejectBtn) {
        const newRejectBtn = rejectBtn.cloneNode(true);
        rejectBtn.parentNode.replaceChild(newRejectBtn, rejectBtn);
        
        newRejectBtn.addEventListener('click', () => {
            clearPreview();
            addMessageToChat('assistant', 'Alterações canceladas. Posso ajudar com algo mais?');
        });
    }
}

function applyChanges() {
    if (!pendingChanges) return;
    
    // Aqui você aplicaria as mudanças reais nos arquivos
    // Por enquanto, apenas simularemos
    
    showNotification('✅ Alterações aplicadas com sucesso!', 'success');
    addMessageToChat('assistant', `
        ✅ <strong>Alterações aplicadas!</strong><br><br>
        Os seguintes arquivos foram modificados:<br>
        ${pendingChanges.files.map(f => `• ${f}`).join('<br>')}<br><br>
        As mudanças já estão ativas no sistema. Você pode testar agora!
    `);
    
    clearPreview();
    pendingChanges = null;
    
    // Log analytics
    if (window.logAnalyticsEvent) {
        logAnalyticsEvent('ai_changes_applied', {
            files_count: pendingChanges?.files?.length || 0
        });
    }
}

function clearPreview() {
    const previewContent = document.getElementById('aiPreviewContent');
    const previewInfo = document.getElementById('aiPreviewInfo');
    const applyBtn = document.getElementById('applyChangesBtn');
    const rejectBtn = document.getElementById('rejectChangesBtn');
    
    if (previewContent) {
        previewContent.innerHTML = `
            <div class="preview-placeholder">
                <i class="fas fa-eye fa-3x"></i>
                <p>As alterações aparecerão aqui para sua aprovação</p>
            </div>
        `;
    }
    
    if (previewInfo) previewInfo.style.display = 'none';
    if (applyBtn) applyBtn.style.display = 'none';
    if (rejectBtn) rejectBtn.style.display = 'none';
    
    pendingChanges = null;
}

function updateAiStatus(text, type = 'success') {
    const statusElement = document.getElementById('aiStatus');
    const indicator = document.querySelector('.status-indicator');
    
    if (statusElement) {
        statusElement.textContent = text;
    }
    
    if (indicator) {
        indicator.style.color = type === 'success' ? '#4cc9f0' : 
                                 type === 'warning' ? '#ffd60a' : '#f72585';
    }
}

function calculateAverageRating() {
    let total = 0;
    let count = 0;
    
    events.forEach(event => {
        if (event.ratings && Array.isArray(event.ratings)) {
            event.ratings.forEach(rating => {
                if (rating && rating.rating) {
                    total += rating.rating;
                    count++;
                }
            });
        }
    });
    
    return count > 0 ? (total / count).toFixed(1) : '0.0';
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se estamos na página do assistente AI
    const aiPage = document.getElementById('ai-assistant-page');
    if (aiPage && aiPage.classList.contains('active')) {
        initAiAssistant();
    }
});
