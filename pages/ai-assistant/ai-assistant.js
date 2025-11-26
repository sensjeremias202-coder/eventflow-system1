/**
 * ============================================
 * ASSISTENTE AI - SISTEMA INTERATIVO
 * ============================================
 * Interface para solicitações de alterações no site
 */

// Estado do assistente
let aiConversation = [];
let pendingChanges = null;

/**
 * Inicializa o Assistente AI
 */
function initAiAssistant() {
    console.log('[ai-assistant] 🤖 Inicializando Assistente AI...');
    
    // Setup do formulário de chat
    setupAiChatForm();
    
    // Setup dos chips de sugestão
    setupSuggestionChips();
    
    // Setup dos botões de ação
    setupActionButtons();
    
    // Carregar conversa salva (se houver)
    loadSavedConversation();
    
    // Auto-resize do textarea
    setupAutoResize();
    
    console.log('[ai-assistant] ✅ Assistente AI pronto!');
}

/**
 * Setup do formulário de chat
 */
function setupAiChatForm() {
    const form = document.getElementById('aiChatForm');
    const input = document.getElementById('aiChatInput');
    
    if (!form || !input) {
        console.warn('[ai-assistant] ⚠️ Formulário de chat não encontrado');
        return;
    }
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const message = input.value.trim();
        if (!message) return;
        
        // Adicionar mensagem do usuário
        addUserMessage(message);
        
        // Limpar input
        input.value = '';
        input.style.height = 'auto';
        
        // Processar solicitação
        processUserRequest(message);
    });
}

/**
 * Setup dos chips de sugestão
 */
function setupSuggestionChips() {
    const chips = document.querySelectorAll('.suggestion-chip');
    const input = document.getElementById('aiChatInput');
    
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            const prompt = chip.getAttribute('data-prompt');
            if (prompt && input) {
                input.value = prompt;
                input.focus();
                input.style.height = 'auto';
                input.style.height = input.scrollHeight + 'px';
            }
        });
    });
}

/**
 * Setup dos botões de ação
 */
function setupActionButtons() {
    const clearBtn = document.getElementById('clearChatBtn');
    const applyBtn = document.getElementById('applyChangesBtn');
    const rejectBtn = document.getElementById('rejectChangesBtn');
    
    if (clearBtn) {
        clearBtn.addEventListener('click', clearConversation);
    }
    
    if (applyBtn) {
        applyBtn.addEventListener('click', applyChanges);
    }
    
    if (rejectBtn) {
        rejectBtn.addEventListener('click', rejectChanges);
    }
}

/**
 * Auto-resize do textarea
 */
function setupAutoResize() {
    const input = document.getElementById('aiChatInput');
    if (!input) return;
    
    input.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });
}

/**
 * Adiciona mensagem do usuário ao chat
 */
function addUserMessage(message) {
    const messagesContainer = document.getElementById('aiChatMessages');
    if (!messagesContainer) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'ai-message user';
    messageDiv.innerHTML = `
        <div class="message-content">
            <div class="message-text">${escapeHtml(message)}</div>
            <div class="message-time">${formatTime(new Date())}</div>
        </div>
        <div class="message-avatar">
            <i class="fas fa-user"></i>
        </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Salvar na conversa
    aiConversation.push({
        role: 'user',
        message: message,
        timestamp: new Date().toISOString()
    });
    
    saveConversation();
}

/**
 * Adiciona mensagem do assistente ao chat
 */
function addAssistantMessage(message, isLoading = false) {
    const messagesContainer = document.getElementById('aiChatMessages');
    if (!messagesContainer) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'ai-message assistant';
    
    if (isLoading) {
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <div class="message-text">
                    <div class="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <div class="message-text">${message}</div>
                <div class="message-time">${formatTime(new Date())}</div>
            </div>
        `;
        
        // Salvar na conversa
        aiConversation.push({
            role: 'assistant',
            message: message,
            timestamp: new Date().toISOString()
        });
        
        saveConversation();
    }
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    return messageDiv;
}

/**
 * Processa solicitação do usuário
 */
async function processUserRequest(message) {
    // Atualizar status
    updateAiStatus('Processando...', 'processing');
    
    // Mostrar indicador de loading
    const loadingMsg = addAssistantMessage('', true);
    
    // Simular processamento (aqui você integraria com uma API real)
    setTimeout(() => {
        // Remover loading
        loadingMsg.remove();
        
        // Gerar resposta
        const response = generateAiResponse(message);
        addAssistantMessage(response);
        
        // Atualizar status
        updateAiStatus('Pronto para ajudar', 'ready');
        
        // Se houver alterações, mostrar preview
        if (shouldShowPreview(message)) {
            showPreview(message);
        }
    }, 1500);
}

/**
 * Gera resposta do assistente (simulado)
 */
function generateAiResponse(message) {
    const lowerMsg = message.toLowerCase();
    
    // Respostas contextuais
    if (lowerMsg.includes('cor') || lowerMsg.includes('tema')) {
        return `🎨 Entendi! Você quer alterar as cores do sistema.<br><br>
                Estou preparando uma prévia das alterações. Vou modificar:
                <ul>
                    <li>Cor primária do tema</li>
                    <li>Gradientes dos botões</li>
                    <li>Cores de destaque</li>
                </ul>
                Você poderá visualizar e aprovar as mudanças no painel ao lado.`;
    }
    
    if (lowerMsg.includes('campo') || lowerMsg.includes('adicionar')) {
        return `✨ Perfeito! Vou adicionar esse novo campo ao sistema.<br><br>
                As alterações incluirão:
                <ul>
                    <li>Novo campo no formulário</li>
                    <li>Validação dos dados</li>
                    <li>Atualização do banco de dados</li>
                </ul>
                Aguarde enquanto preparo a prévia...`;
    }
    
    if (lowerMsg.includes('bug') || lowerMsg.includes('erro') || lowerMsg.includes('problema')) {
        return `🐛 Vou analisar e corrigir esse problema.<br><br>
                Estou verificando:
                <ul>
                    <li>Logs de erro</li>
                    <li>Código relacionado</li>
                    <li>Possíveis soluções</li>
                </ul>
                Em breve terei uma correção para você aprovar.`;
    }
    
    if (lowerMsg.includes('relatório') || lowerMsg.includes('relatorio')) {
        return `📊 Vou gerar esse relatório para você!<br><br>
                O relatório incluirá:
                <ul>
                    <li>Análise dos dados</li>
                    <li>Gráficos e estatísticas</li>
                    <li>Exportação em PDF</li>
                </ul>
                Processando informações...`;
    }
    
    // Resposta padrão
    return `Entendi sua solicitação: "<em>${escapeHtml(message)}</em>"<br><br>
            Estou analisando como posso ajudar. Por favor, seja mais específico sobre:
            <ul>
                <li>Qual página ou funcionalidade?</li>
                <li>O que exatamente precisa ser alterado?</li>
                <li>Algum exemplo ou referência?</li>
            </ul>
            Quanto mais detalhes, melhor poderei atendê-lo! 😊`;
}

/**
 * Verifica se deve mostrar preview
 */
function shouldShowPreview(message) {
    const lowerMsg = message.toLowerCase();
    return lowerMsg.includes('cor') || 
           lowerMsg.includes('tema') || 
           lowerMsg.includes('adicionar') ||
           lowerMsg.includes('campo');
}

/**
 * Mostra preview das alterações
 */
function showPreview(message) {
    const previewContent = document.getElementById('aiPreviewContent');
    const previewInfo = document.getElementById('aiPreviewInfo');
    const applyBtn = document.getElementById('applyChangesBtn');
    const rejectBtn = document.getElementById('rejectChangesBtn');
    
    if (!previewContent) return;
    
    // Exemplo de preview (você pode expandir isso)
    previewContent.innerHTML = `
        <div class="code-preview">
            <div class="code-header">
                <span><i class="fas fa-file-code"></i> css/style.css</span>
                <span class="code-status modified">Modificado</span>
            </div>
            <pre><code class="language-css">:root {
    --primary-color: #667eea; /* Alterado */
    --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --secondary-color: #f093fb;
}

.btn-primary {
    background: var(--primary-gradient); /* Nova cor */
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}</code></pre>
        </div>
        
        <div class="preview-note">
            <i class="fas fa-info-circle"></i>
            <span>As alterações acima serão aplicadas ao arquivo CSS principal.</span>
        </div>
    `;
    
    // Mostrar informações
    if (previewInfo) {
        const filesList = document.getElementById('modifiedFilesList');
        if (filesList) {
            filesList.innerHTML = `
                <li><i class="fas fa-file-code"></i> css/style.css <span class="file-badge modified">Modificado</span></li>
                <li><i class="fas fa-file-code"></i> js/app.js <span class="file-badge new">Novo código</span></li>
            `;
        }
        previewInfo.style.display = 'block';
    }
    
    // Mostrar botões
    if (applyBtn) applyBtn.style.display = 'inline-flex';
    if (rejectBtn) rejectBtn.style.display = 'inline-flex';
    
    // Salvar mudanças pendentes
    pendingChanges = {
        message: message,
        files: ['css/style.css', 'js/app.js'],
        timestamp: new Date().toISOString()
    };
}

/**
 * Aplica as alterações
 */
function applyChanges() {
    if (!pendingChanges) return;
    
    // Aqui você implementaria a lógica real de aplicação
    showNotification('✅ Alterações aplicadas com sucesso!', 'success');
    
    // Registrar no Firebase
    if (currentUser && window.firebase) {
        const db = firebase.database();
        const requestRef = db.ref('ai-requests').push();
        
        requestRef.set({
            userId: currentUser.uid,
            userName: currentUser.name,
            request: pendingChanges.message,
            status: 'applied',
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            files: pendingChanges.files
        });
    }
    
    // Adicionar mensagem de confirmação
    addAssistantMessage('✅ Alterações aplicadas! As mudanças já estão ativas no sistema.');
    
    // Limpar preview
    clearPreview();
}

/**
 * Rejeita as alterações
 */
function rejectChanges() {
    showNotification('Alterações canceladas', 'info');
    addAssistantMessage('Alterações canceladas. Posso ajudar com algo mais?');
    clearPreview();
}

/**
 * Limpa o preview
 */
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

/**
 * Limpa a conversa
 */
function clearConversation() {
    if (!confirm('Deseja realmente limpar toda a conversa?')) return;
    
    const messagesContainer = document.getElementById('aiChatMessages');
    if (!messagesContainer) return;
    
    // Manter apenas mensagem de boas-vindas
    const firstMessage = messagesContainer.querySelector('.ai-message.assistant');
    messagesContainer.innerHTML = '';
    if (firstMessage) {
        messagesContainer.appendChild(firstMessage);
    }
    
    // Limpar array
    aiConversation = [];
    saveConversation();
    
    // Limpar preview
    clearPreview();
    
    showNotification('Conversa limpa', 'info');
}

/**
 * Atualiza o status do assistente
 */
function updateAiStatus(message, type = 'ready') {
    const statusEl = document.getElementById('aiStatus');
    const indicator = document.querySelector('.status-indicator');
    
    if (statusEl) {
        statusEl.textContent = message;
    }
    
    if (indicator) {
        indicator.className = 'fas fa-circle status-indicator';
        if (type === 'processing') {
            indicator.style.color = '#ffd60a';
            indicator.classList.add('pulse');
        } else if (type === 'error') {
            indicator.style.color = '#ef233c';
        } else {
            indicator.style.color = '#06ffa5';
            indicator.classList.remove('pulse');
        }
    }
}

/**
 * Salva a conversa no localStorage
 */
function saveConversation() {
    try {
        localStorage.setItem('ai-conversation', JSON.stringify(aiConversation));
    } catch (error) {
        console.error('[ai-assistant] Erro ao salvar conversa:', error);
    }
}

/**
 * Carrega conversa salva
 */
function loadSavedConversation() {
    try {
        const saved = localStorage.getItem('ai-conversation');
        if (saved) {
            aiConversation = JSON.parse(saved);
            
            // Recriar mensagens (opcional - pode deixar apenas a última sessão)
            // Aqui você pode implementar se quiser restaurar conversas antigas
        }
    } catch (error) {
        console.error('[ai-assistant] Erro ao carregar conversa:', error);
        aiConversation = [];
    }
}

/**
 * Formata hora
 */
function formatTime(date) {
    return date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

/**
 * Escapa HTML para prevenir XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Expor função globalmente
window.initAiAssistant = initAiAssistant;

console.log('[ai-assistant] ✅ Módulo do Assistente AI carregado');
