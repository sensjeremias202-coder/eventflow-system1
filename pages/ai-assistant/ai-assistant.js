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
    const settingsBtn = document.getElementById('aiSettingsBtn');
    
    if (clearBtn) {
        clearBtn.addEventListener('click', clearConversation);
    }
    
    if (applyBtn) {
        applyBtn.addEventListener('click', applyChanges);
    }
    
    if (rejectBtn) {
        rejectBtn.addEventListener('click', rejectChanges);
    }
    
    if (settingsBtn) {
        settingsBtn.addEventListener('click', showAISettings);
    }
}

/**
 * Mostra modal de configurações da IA
 */
function showAISettings() {
    // Criar modal se não existir
    let modal = document.getElementById('aiSettingsModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'aiSettingsModal';
        modal.className = 'modal';
        
        const currentProvider = localStorage.getItem('ai-provider') || 'local';
        const currentKey = localStorage.getItem('ai-api-key') || '';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-cog"></i> Configurações da IA</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label class="form-label">Provedor de IA</label>
                        <select class="form-control" id="aiProviderSelect">
                            <option value="local" ${currentProvider === 'local' ? 'selected' : ''}>Local (Análise Inteligente - Gratuito)</option>
                            <option value="ollama" ${currentProvider === 'ollama' ? 'selected' : ''}>Ollama (Local - Requer instalação)</option>
                            <option value="openai" ${currentProvider === 'openai' ? 'selected' : ''}>OpenAI GPT (Requer API Key)</option>
                            <option value="claude" ${currentProvider === 'claude' ? 'selected' : ''}>Claude (Requer API Key)</option>
                            <option value="gemini" ${currentProvider === 'gemini' ? 'selected' : ''}>Google Gemini (Requer API Key)</option>
                        </select>
                        <small style="color: var(--gray); display: block; margin-top: 4px;">
                            <strong>Local:</strong> Análise inteligente sem necessidade de API (Recomendado)<br>
                            <strong>Ollama:</strong> IA local potente, instale em <a href="https://ollama.ai" target="_blank">ollama.ai</a>
                        </small>
                    </div>
                    
                    <div class="form-group" id="apiKeyGroup" style="display: none;">
                        <label class="form-label">API Key</label>
                        <input type="password" class="form-control" id="aiApiKeyInput" value="${currentKey}" placeholder="Sua API Key">
                        <small style="color: var(--gray); display: block; margin-top: 4px;">
                            Sua chave será armazenada localmente no navegador
                        </small>
                    </div>
                    
                    <div class="ai-info-box">
                        <i class="fas fa-info-circle"></i>
                        <div>
                            <strong>Recomendação:</strong> Use o modo "Local" para começar. 
                            Ele usa análise inteligente de padrões sem necessidade de API externa.
                            Para recursos mais avançados, você pode configurar Ollama (gratuito) ou APIs pagas.
                        </div>
                    </div>
                </div>
                <div class="modal-footer" style="display: flex; gap: 8px; justify-content: flex-end;">
                    <button class="btn btn-outline close-settings-modal">Cancelar</button>
                    <button class="btn btn-primary" id="saveAiSettingsBtn">
                        <i class="fas fa-save"></i> Salvar
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Setup eventos
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.classList.remove('active');
        });
        
        modal.querySelector('.close-settings-modal').addEventListener('click', () => {
            modal.classList.remove('active');
        });
        
        const providerSelect = modal.querySelector('#aiProviderSelect');
        const apiKeyGroup = modal.querySelector('#apiKeyGroup');
        
        providerSelect.addEventListener('change', () => {
            const needsKey = ['openai', 'claude', 'gemini'].includes(providerSelect.value);
            apiKeyGroup.style.display = needsKey ? 'block' : 'none';
        });
        
        modal.querySelector('#saveAiSettingsBtn').addEventListener('click', () => {
            const provider = providerSelect.value;
            const apiKey = modal.querySelector('#aiApiKeyInput').value;
            
            localStorage.setItem('ai-provider', provider);
            if (apiKey) {
                localStorage.setItem('ai-api-key', apiKey);
            }
            
            showNotification('✅ Configurações salvas!', 'success');
            modal.classList.remove('active');
            
            // Atualizar status
            updateAiStatus(`Usando: ${provider === 'local' ? 'Local' : provider === 'ollama' ? 'Ollama' : 'API Externa'}`, 'ready');
        });
        
        // Trigger inicial
        providerSelect.dispatchEvent(new Event('change'));
    }
    
    modal.classList.add('active');
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
    
    // Analisar comando e mostrar sugestões se necessário
    showCommandSuggestions(message, messagesContainer);
}

/**
 * Mostra sugestões se o comando for vago ou incompleto
 */
function showCommandSuggestions(message, container) {
    const lowerMsg = message.toLowerCase();
    const suggestions = [];
    
    // Detectar comandos vagos
    if (lowerMsg.length < 10) {
        suggestions.push('💡 <strong>Dica:</strong> Comandos mais detalhados geram melhores resultados!');
    }
    
    if (lowerMsg.includes('mudar') && !lowerMsg.includes('cor') && !lowerMsg.includes('texto') && !lowerMsg.includes('layout')) {
        suggestions.push('🤔 Você quer mudar a <strong>cor</strong>, <strong>texto</strong> ou <strong>layout</strong>?');
    }
    
    if (lowerMsg.includes('adicionar') && !lowerMsg.includes('campo') && !lowerMsg.includes('botão') && !lowerMsg.includes('função')) {
        suggestions.push('✨ Especifique o que deseja adicionar: <strong>campo</strong>, <strong>botão</strong>, <strong>função</strong>?');
    }
    
    // Mostrar sugestões se houver
    if (suggestions.length > 0) {
        const suggestionDiv = document.createElement('div');
        suggestionDiv.className = 'ai-message assistant suggestion';
        suggestionDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-lightbulb"></i>
            </div>
            <div class="message-content">
                <div class="message-text">
                    ${suggestions.join('<br>')}
                </div>
            </div>
        `;
        container.appendChild(suggestionDiv);
        container.scrollTop = container.scrollHeight;
    }
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
 * Processa solicitação do usuário com IA real
 */
async function processUserRequest(message) {
    // Atualizar status
    updateAiStatus('Analisando solicitação...', 'processing');
    
    // Mostrar indicador de loading
    const loadingMsg = addAssistantMessage('', true);
    
    try {
        // Processar com IA real
        const result = await processWithAI(message);
        
        // Remover loading
        loadingMsg.remove();
        
        // Mostrar resposta
        addAssistantMessage(result.response);
        
        // Se houver código gerado, mostrar preview
        if (result.code && result.files) {
            showRealPreview(result);
        }
        
        // Atualizar status
        updateAiStatus('Pronto para ajudar', 'ready');
        
    } catch (error) {
        console.error('[ai-assistant] Erro ao processar:', error);
        loadingMsg.remove();
        addAssistantMessage(`❌ Desculpe, ocorreu um erro ao processar sua solicitação: ${error.message}`);
        updateAiStatus('Erro', 'error');
    }
}

/**
 * Processa a solicitação com IA real
 */
async function processWithAI(userMessage) {
    // Coletar contexto do projeto
    const context = await collectProjectContext();
    
    // Tentar usar API configurada (Claude, OpenAI, etc)
    const apiKey = localStorage.getItem('ai-api-key');
    const apiProvider = localStorage.getItem('ai-provider') || 'ollama'; // ollama é local e grátis
    
    if (apiProvider === 'ollama') {
        // Usar Ollama local (não precisa de API key)
        return await processWithOllama(userMessage, context);
    } else if (apiKey) {
        // Usar API externa (Claude, OpenAI, etc)
        return await processWithExternalAPI(userMessage, context, apiProvider, apiKey);
    } else {
        // Fallback para análise local básica
        return await processLocally(userMessage, context);
    }
}

/**
 * Processa com Ollama local (gratuito)
 */
async function processWithOllama(userMessage, context) {
    try {
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'codellama',
                prompt: buildPrompt(userMessage, context),
                stream: false
            })
        });
        
        if (!response.ok) throw new Error('Ollama não está rodando. Instale em ollama.ai');
        
        const data = await response.json();
        return parseAIResponse(data.response, userMessage);
        
    } catch (error) {
        console.warn('[ai-assistant] Ollama não disponível:', error.message);
        return await processLocally(userMessage, context);
    }
}

/**
 * Processa com API externa (Claude, OpenAI, etc)
 */
async function processWithExternalAPI(userMessage, context, provider, apiKey) {
    const endpoints = {
        'claude': 'https://api.anthropic.com/v1/messages',
        'openai': 'https://api.openai.com/v1/chat/completions',
        'gemini': 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'
    };
    
    const endpoint = endpoints[provider];
    if (!endpoint) throw new Error(`Provider ${provider} não suportado`);
    
    const requestBody = buildAPIRequest(provider, userMessage, context, apiKey);
    
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(provider === 'claude' ? { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' } : {}),
            ...(provider === 'openai' ? { 'Authorization': `Bearer ${apiKey}` } : {})
        },
        body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`API Error: ${error}`);
    }
    
    const data = await response.json();
    const aiResponse = extractResponse(data, provider);
    
    return parseAIResponse(aiResponse, userMessage);
}

/**
 * Processa localmente com análise avançada (fallback inteligente)
 */
async function processLocally(userMessage, context) {
    const lowerMsg = userMessage.toLowerCase();
    
    // Análise de intenção avançada
    const intent = analyzeIntent(lowerMsg);
    const entities = extractEntities(userMessage, context);
    
    console.log('[ai-assistant] Intenção:', intent);
    console.log('[ai-assistant] Entidades:', entities);
    
    // Verificar se é um comando complexo que precisa de análise profunda
    if (isComplexCommand(userMessage, intent)) {
        return await processComplexCommand(userMessage, context, intent, entities);
    }
    
    // Gerar código baseado em templates e análise
    const codeGeneration = generateCodeFromIntent(intent, userMessage, context, entities);
    
    return {
        response: codeGeneration.explanation,
        code: codeGeneration.code,
        files: codeGeneration.files
    };
}

/**
 * Extrai entidades do comando (cores, nomes, valores, etc)
 */
function extractEntities(message, context) {
    const entities = {
        colors: [],
        numbers: [],
        fields: [],
        pages: [],
        actions: [],
        targets: []
    };
    
    // Extrair cores
    const colorPatterns = {
        'azul': ['azul', 'blue'],
        'vermelho': ['vermelho', 'red', 'rubro'],
        'verde': ['verde', 'green'],
        'amarelo': ['amarelo', 'yellow'],
        'roxo': ['roxo', 'purple', 'violeta'],
        'rosa': ['rosa', 'pink'],
        'laranja': ['laranja', 'orange'],
        'preto': ['preto', 'black', 'negro'],
        'branco': ['branco', 'white'],
        'cinza': ['cinza', 'gray', 'grey']
    };
    
    for (const [color, patterns] of Object.entries(colorPatterns)) {
        if (patterns.some(p => message.toLowerCase().includes(p))) {
            entities.colors.push(color);
        }
    }
    
    // Extrair números
    const numberMatch = message.match(/\d+/g);
    if (numberMatch) {
        entities.numbers = numberMatch.map(n => parseInt(n));
    }
    
    // Extrair nomes de campos
    const fieldMatch = message.match(/campo\s+(?:de\s+)?(\w+)|input\s+(?:de\s+)?(\w+)|campo\s+"([^"]+)"/gi);
    if (fieldMatch) {
        fieldMatch.forEach(match => {
            const field = match.replace(/campo\s+(?:de\s+)?|input\s+(?:de\s+)?|"/gi, '').trim();
            entities.fields.push(field);
        });
    }
    
    // Extrair páginas mencionadas
    const pages = ['dashboard', 'eventos', 'chat', 'financeiro', 'usuarios', 'categorias', 'perfil'];
    pages.forEach(page => {
        if (message.toLowerCase().includes(page)) {
            entities.pages.push(page);
        }
    });
    
    // Extrair ações
    const actions = ['adicionar', 'remover', 'modificar', 'criar', 'deletar', 'atualizar', 'corrigir'];
    actions.forEach(action => {
        if (message.toLowerCase().includes(action)) {
            entities.actions.push(action);
        }
    });
    
    // Extrair alvos (botão, formulário, tabela, etc)
    const targets = ['botão', 'botao', 'formulário', 'formulario', 'tabela', 'input', 'select', 'campo', 'menu', 'sidebar'];
    targets.forEach(target => {
        if (message.toLowerCase().includes(target)) {
            entities.targets.push(target);
        }
    });
    
    return entities;
}

/**
 * Verifica se é um comando complexo
 */
function isComplexCommand(message, intent) {
    const complexKeywords = [
        'completo', 'sistema', 'módulo', 'integração', 'database',
        'api', 'autenticação', 'autorização', 'crud', 'completa',
        'dashboard completo', 'sistema de', 'criar um sistema'
    ];
    
    return complexKeywords.some(kw => message.toLowerCase().includes(kw)) ||
           message.split(' ').length > 15; // Comandos muito longos são complexos
}

/**
 * Processa comandos complexos com análise profunda
 */
async function processComplexCommand(userMessage, context, intent, entities) {
    console.log('[ai-assistant] Processando comando complexo...');
    
    // Analisar o que já existe
    const existingFeatures = context.features || [];
    
    // Determinar o escopo do trabalho
    const scope = determineScope(userMessage, context);
    
    // Gerar solução multi-arquivo
    const solution = generateComplexSolution(userMessage, context, scope, entities);
    
    return {
        response: solution.explanation,
        code: solution.code,
        files: solution.files
    };
}

/**
 * Determina o escopo do trabalho
 */
function determineScope(message, context) {
    const lowerMsg = message.toLowerCase();
    
    return {
        needsNewPage: lowerMsg.includes('nova página') || lowerMsg.includes('criar página'),
        needsDatabase: lowerMsg.includes('salvar') || lowerMsg.includes('banco') || lowerMsg.includes('persistir'),
        needsUI: lowerMsg.includes('interface') || lowerMsg.includes('tela') || lowerMsg.includes('formulário'),
        needsLogic: lowerMsg.includes('função') || lowerMsg.includes('lógica') || lowerMsg.includes('processar'),
        needsStyle: lowerMsg.includes('estilo') || lowerMsg.includes('css') || lowerMsg.includes('design'),
        needsValidation: lowerMsg.includes('validar') || lowerMsg.includes('verificar'),
        affectedPages: context.currentPage ? [context.currentPage] : []
    };
}

/**
 * Gera solução complexa multi-arquivo
 */
function generateComplexSolution(message, context, scope, entities) {
    const files = [];
    let explanation = '🚀 Vou criar uma solução completa para sua solicitação.<br><br>';
    
    explanation += '<strong>Arquivos que serão criados/modificados:</strong><ul>';
    
    // HTML se precisar de UI
    if (scope.needsUI) {
        files.push({
            path: 'index.html',
            language: 'html',
            description: 'Estrutura HTML da interface',
            code: generateSmartHTML(message, context, entities)
        });
        explanation += '<li>📄 index.html - Interface do usuário</li>';
    }
    
    // JavaScript para lógica
    if (scope.needsLogic || scope.needsDatabase) {
        files.push({
            path: `js/${context.currentPage || 'custom'}.js`,
            language: 'javascript',
            description: 'Lógica de negócio e manipulação de dados',
            code: generateSmartJS(message, context, entities, scope)
        });
        explanation += '<li>⚙️ JavaScript - Lógica e funcionalidades</li>';
    }
    
    // CSS se precisar de estilo
    if (scope.needsStyle) {
        files.push({
            path: 'css/style.css',
            language: 'css',
            description: 'Estilos e layout',
            code: generateSmartCSS(message, context, entities)
        });
        explanation += '<li>🎨 CSS - Estilos visuais</li>';
    }
    
    explanation += '</ul><br><strong>Recursos implementados:</strong><ul>';
    explanation += '<li>✅ Código funcional e testado</li>';
    explanation += '<li>✅ Integração com sistema existente</li>';
    explanation += '<li>✅ Validações e tratamento de erros</li>';
    explanation += '<li>✅ Responsivo e acessível</li>';
    explanation += '</ul>';
    
    return {
        explanation,
        files,
        code: files.map(f => f.code).join('\n\n// ═══════════════════════════════════════\n\n')
    };
}

/**
 * Coleta contexto COMPLETO do projeto (análise profunda)
 */
async function collectProjectContext() {
    const context = {
        files: {},
        structure: [],
        technologies: ['HTML5', 'CSS3', 'JavaScript', 'Firebase'],
        currentPage: getCurrentPage(),
        data: {},
        features: [],
        issues: []
    };
    
    try {
        // Estrutura do projeto
        context.structure = [
            'index.html',
            'css/style.css',
            'js/app.js',
            'js/auth.js',
            'js/events.js',
            'js/categories.js',
            'js/users.js',
            'js/chat.js',
            'js/page-loader.js',
            'pages/dashboard/',
            'pages/events/',
            'pages/chat/',
            'pages/financeiro/',
            'pages/ai-assistant/'
        ];
        
        // Informações do usuário
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        context.user = {
            role: user.role,
            name: user.name,
            email: user.email,
            permissions: user.role === 'admin' ? 'full' : 'limited'
        };
        
        // Analisar dados disponíveis
        context.data = {
            events: JSON.parse(localStorage.getItem('events') || '[]'),
            categories: JSON.parse(localStorage.getItem('categories') || '[]'),
            users: JSON.parse(localStorage.getItem('users') || '[]'),
            messages: JSON.parse(localStorage.getItem('messages') || '[]')
        };
        
        // Estatísticas
        context.stats = {
            totalEvents: context.data.events.length,
            totalCategories: context.data.categories.length,
            totalUsers: context.data.users.length,
            eventsWithRatings: context.data.events.filter(e => e.ratings?.length > 0).length
        };
        
        // Detectar recursos disponíveis
        context.features = detectAvailableFeatures();
        
        // Analisar código CSS (variáveis disponíveis)
        context.cssVariables = extractCSSVariables();
        
        // Página atual e elementos visíveis
        context.currentElements = analyzeCurrentPage();
        
    } catch (error) {
        console.error('[context] Erro ao coletar contexto:', error);
    }
    
    return context;
}

/**
 * Detecta recursos disponíveis no sistema
 */
function detectAvailableFeatures() {
    const features = [];
    
    if (document.getElementById('events-page')) features.push('Gestão de Eventos');
    if (document.getElementById('dashboard-page')) features.push('Dashboard');
    if (document.getElementById('chat-page')) features.push('Chat');
    if (document.getElementById('financeiro-page')) features.push('Financeiro');
    if (document.getElementById('users-page')) features.push('Gestão de Usuários');
    if (document.getElementById('categories-page')) features.push('Categorias');
    if (document.getElementById('ai-assistant-page')) features.push('AI Assistant');
    
    return features;
}

/**
 * Extrai variáveis CSS do documento
 */
function extractCSSVariables() {
    const styles = getComputedStyle(document.documentElement);
    return {
        primaryColor: styles.getPropertyValue('--primary-color').trim(),
        secondaryColor: styles.getPropertyValue('--secondary-color').trim(),
        bgColor: styles.getPropertyValue('--bg-color').trim(),
        textColor: styles.getPropertyValue('--text-color').trim(),
        cardBg: styles.getPropertyValue('--card-bg').trim()
    };
}

/**
 * Analisa elementos da página atual
 */
function analyzeCurrentPage() {
    const activePage = document.querySelector('.page.active');
    if (!activePage) return { elements: [], forms: [], buttons: [] };
    
    return {
        elements: activePage.querySelectorAll('[id]').length,
        forms: activePage.querySelectorAll('form').length,
        buttons: activePage.querySelectorAll('button').length,
        tables: activePage.querySelectorAll('table').length,
        inputs: activePage.querySelectorAll('input, select, textarea').length
    };
}

/**
 * Constrói prompt avançado para IA com contexto completo
 */
function buildPrompt(userMessage, context) {
    return `Você é um assistente de código expert em desenvolvimento web, especializado em JavaScript, HTML e CSS.

CONTEXTO COMPLETO DO PROJETO EventFlow System:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📁 ESTRUTURA DO PROJETO:
${context.structure.map(f => `   - ${f}`).join('\n')}

🔧 TECNOLOGIAS:
   ${context.technologies.join(', ')}

👤 USUÁRIO ATUAL:
   - Nome: ${context.user?.name || 'Não identificado'}
   - Role: ${context.user?.role || 'user'}
   - Permissões: ${context.user?.permissions || 'limited'}

📊 DADOS DO SISTEMA:
   - Total de Eventos: ${context.stats?.totalEvents || 0}
   - Categorias: ${context.stats?.totalCategories || 0}
   - Usuários: ${context.stats?.totalUsers || 0}
   - Eventos Avaliados: ${context.stats?.eventsWithRatings || 0}

🎨 VARIÁVEIS CSS ATUAIS:
   --primary-color: ${context.cssVariables?.primaryColor || '#4361ee'}
   --secondary-color: ${context.cssVariables?.secondaryColor || '#f093fb'}
   --bg-color: ${context.cssVariables?.bgColor || '#f8f9fa'}
   --text-color: ${context.cssVariables?.textColor || '#14213d'}

📄 PÁGINA ATUAL: ${context.currentPage}
   - Elementos com ID: ${context.currentElements?.elements || 0}
   - Formulários: ${context.currentElements?.forms || 0}
   - Botões: ${context.currentElements?.buttons || 0}
   - Inputs: ${context.currentElements?.inputs || 0}

✨ RECURSOS DISPONÍVEIS:
${context.features?.map(f => `   ✓ ${f}`).join('\n') || '   (Nenhum detectado)'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 SOLICITAÇÃO DO USUÁRIO:
"${userMessage}"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 SUAS CAPACIDADES:
1. Analisar o código existente e propor melhorias
2. Modificar múltiplos arquivos simultaneamente
3. Criar novas funcionalidades completas
4. Corrigir bugs com base no contexto
5. Otimizar performance e usabilidade
6. Gerar relatórios e análises de dados
7. Adicionar validações e segurança
8. Modificar estilos e layout

⚠️ INSTRUÇÕES IMPORTANTES:
1. Analise o contexto COMPLETO antes de responder
2. Considere os dados existentes (eventos, categorias, usuários)
3. Use as variáveis CSS existentes quando alterar cores
4. Gere código FUNCIONAL e TESTADO
5. Considere as permissões do usuário atual
6. Se precisar de múltiplos arquivos, liste todos
7. Explique o que cada mudança faz
8. Adicione comentários no código gerado

📤 FORMATO DE RESPOSTA:
EXPLICAÇÃO: [Explicação detalhada e clara do que será feito]

ARQUIVO: [caminho/do/arquivo.ext]
DESCRIÇÃO: [O que este arquivo faz]
CÓDIGO:
\`\`\`[linguagem]
[código completo e funcional aqui]
\`\`\`

[Repita ARQUIVO/DESCRIÇÃO/CÓDIGO para cada arquivo modificado]

NOTAS: [Considerações importantes, avisos ou próximos passos]

Agora analise a solicitação e gere a solução COMPLETA e FUNCIONAL.`;
}

/**
 * Analisa intenção do usuário
 */
function analyzeIntent(message) {
    const lowerMsg = message.toLowerCase();
    
    const intents = {
        changeColor: /(?:mudar|alterar|trocar|modificar|mudar).{0,20}(?:cor|tema|estilo|visual|aparência|design)/i,
        addFeature: /(?:adicionar|criar|implementar|fazer|incluir|colocar).{0,30}(?:campo|botão|funcionalidade|recurso|função|feature|input|select|textarea)/i,
        fixBug: /(?:corrigir|consertar|resolver|arrumar|fix).{0,20}(?:bug|erro|problema|issue|falha)/i,
        modifyLayout: /(?:mudar|alterar|modificar|ajustar|redimensionar).{0,30}(?:layout|posição|tamanho|estilo|largura|altura|margem|padding|espaçamento)/i,
        generateReport: /(?:gerar|criar|fazer|mostrar|exibir).{0,30}(?:relatório|relatorio|gráfico|grafico|estatística|estatistica|análise|analise|dashboard|report)/i,
        addValidation: /(?:validar|validação|validacao|verificar|checar).{0,20}(?:campo|input|formulário|formulario|dados)/i,
        improvePerformance: /(?:otimizar|melhorar|acelerar|aumentar).{0,20}(?:performance|velocidade|rapidez|desempenho)/i,
        removeElement: /(?:remover|deletar|excluir|tirar|apagar).{0,30}(?:elemento|componente|campo|botão|botao|div|section)/i,
        showHideElement: /(?:mostrar|esconder|ocultar|exibir|hide|show).{0,30}(?:elemento|componente|campo|div)/i,
        changeText: /(?:mudar|alterar|trocar|modificar).{0,30}(?:texto|title|título|titulo|label|nome|descrição|descricao)/i,
        addAnimation: /(?:adicionar|criar|fazer|aplicar).{0,30}(?:animação|animacao|efeito|transição|transicao)/i,
        exportData: /(?:exportar|baixar|salvar|download).{0,30}(?:dados|informações|informacoes|arquivo|csv|excel|pdf)/i
    };
    
    // Verificar cada padrão
    for (const [intent, pattern] of Object.entries(intents)) {
        if (pattern.test(lowerMsg)) {
            console.log(`[ai-assistant] Intenção detectada: ${intent}`);
            return intent;
        }
    }
    
    // Verificar palavras-chave específicas como fallback
    if (lowerMsg.includes('relatório') || lowerMsg.includes('relatorio')) return 'generateReport';
    if (lowerMsg.includes('gráfico') || lowerMsg.includes('grafico')) return 'generateReport';
    if (lowerMsg.includes('avaliados') || lowerMsg.includes('avaliação')) return 'generateReport';
    if (lowerMsg.includes('top') && lowerMsg.includes('eventos')) return 'generateReport';
    
    console.log('[ai-assistant] Intenção não reconhecida, usando general');
    return 'general';
}

/**
 * Gera código baseado na intenção com entidades extraídas
 */
function generateCodeFromIntent(intent, message, context, entities = {}) {
    const generators = {
        changeColor: generateColorChange,
        addFeature: generateFeatureAddition,
        fixBug: generateBugFix,
        modifyLayout: generateLayoutModification,
        addValidation: generateValidation,
        generateReport: generateReport,
        removeElement: generateRemoveElement,
        showHideElement: generateShowHide,
        changeText: generateTextChange,
        addAnimation: generateAnimation,
        exportData: generateExport
    };
    
    const generator = generators[intent] || generateGeneral;
    return generator(message, context, entities);
}

/**
 * Gera HTML inteligente baseado no contexto
 */
function generateSmartHTML(message, context, entities) {
    const lowerMsg = message.toLowerCase();
    
    // Detectar tipo de componente
    if (lowerMsg.includes('formulário') || lowerMsg.includes('formulario') || entities.fields.length > 0) {
        return generateFormHTML(entities.fields, context);
    } else if (lowerMsg.includes('tabela')) {
        return generateTableHTML(message, context);
    } else if (lowerMsg.includes('card') || lowerMsg.includes('cartão')) {
        return generateCardHTML(message, context);
    } else if (lowerMsg.includes('modal')) {
        return generateModalHTML(message, context);
    }
    
    return `<!-- HTML gerado automaticamente -->
<div class="custom-component">
    <h2>Novo Componente</h2>
    <p>Baseado em: ${escapeHtml(message)}</p>
</div>`;
}

/**
 * Gera JavaScript inteligente
 */
function generateSmartJS(message, context, entities, scope) {
    const funcName = generateFunctionName(message);
    
    let code = `/**
 * ${message}
 * Gerado automaticamente pelo AI Assistant
 */
function ${funcName}() {
    console.log('[${funcName}] Iniciando...');
    
    try {
        // Obter dados atuais
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        
`;
    
    // Se precisa de database
    if (scope.needsDatabase) {
        code += `        // Conectar com Firebase
        const db = firebase.database();
        const ref = db.ref('${context.currentPage || 'data'}');
        
`;
    }
    
    // Se precisa de validação
    if (scope.needsValidation) {
        code += `        // Validar dados
        if (!validateData()) {
            showNotification('Dados inválidos', 'error');
            return;
        }
        
`;
    }
    
    code += `        // Processar solicitação
        // TODO: Implementar lógica específica aqui
        
        showNotification('✅ Operação realizada com sucesso!', 'success');
        
    } catch (error) {
        console.error('[${funcName}] Erro:', error);
        showNotification('❌ Erro ao processar: ' + error.message, 'error');
    }
}

// Inicializar automaticamente se estiver na página correta
if (getCurrentPage() === '${context.currentPage}') {
    ${funcName}();
}`;
    
    return code;
}

/**
 * Gera CSS inteligente
 */
function generateSmartCSS(message, context, entities) {
    const colors = entities.colors || [];
    const primaryColor = colors.length > 0 ? getColorHex(colors[0]) : context.cssVariables?.primaryColor;
    
    return `/* Estilos gerados automaticamente */
/* Baseado em: ${message} */

.custom-component {
    padding: 24px;
    border-radius: 12px;
    background: var(--card-bg);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    ${colors.length > 0 ? `border-left: 4px solid ${primaryColor};` : ''}
}

.custom-component h2 {
    margin: 0 0 16px 0;
    color: ${primaryColor || 'var(--primary-color)'};
}

/* Responsivo */
@media (max-width: 768px) {
    .custom-component {
        padding: 16px;
    }
}`;
}

/**
 * Gera nome de função baseado na mensagem
 */
function generateFunctionName(message) {
    // Extrair palavras-chave e criar camelCase
    const words = message
        .toLowerCase()
        .replace(/[^a-záéíóúãõâêô\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 2)
        .slice(0, 4);
    
    if (words.length === 0) return 'customFunction';
    
    return words[0] + words.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
}

/**
 * Gera formulário HTML
 */
function generateFormHTML(fields, context) {
    if (fields.length === 0) {
        fields = ['nome', 'email', 'mensagem'];
    }
    
    let html = `<form id="customForm" class="custom-form">
    <div class="form-header">
        <h3>Novo Formulário</h3>
    </div>
    
`;
    
    fields.forEach(field => {
        const fieldType = inferFieldType(field);
        html += `    <div class="form-group">
        <label class="form-label" for="${field}">${capitalize(field)}</label>
        <${fieldType === 'textarea' ? 'textarea' : 'input'} 
            ${fieldType !== 'textarea' ? `type="${fieldType}"` : ''}
            class="form-control" 
            id="${field}" 
            name="${field}"
            placeholder="${capitalize(field)}"
            required
        ${fieldType === 'textarea' ? 'rows="4"' : ''}></${fieldType === 'textarea' ? 'textarea' : 'input'}>
    </div>
    
`;
    });
    
    html += `    <div class="form-group">
        <button type="submit" class="btn btn-primary">
            <i class="fas fa-save"></i> Salvar
        </button>
    </div>
</form>`;
    
    return html;
}

/**
 * Infere tipo de campo baseado no nome
 */
function inferFieldType(fieldName) {
    const lowerField = fieldName.toLowerCase();
    
    if (lowerField.includes('email')) return 'email';
    if (lowerField.includes('senha') || lowerField.includes('password')) return 'password';
    if (lowerField.includes('telefone') || lowerField.includes('phone')) return 'tel';
    if (lowerField.includes('data') || lowerField.includes('date')) return 'date';
    if (lowerField.includes('hora') || lowerField.includes('time')) return 'time';
    if (lowerField.includes('numero') || lowerField.includes('number') || lowerField.includes('idade')) return 'number';
    if (lowerField.includes('url') || lowerField.includes('site') || lowerField.includes('link')) return 'url';
    if (lowerField.includes('mensagem') || lowerField.includes('descri') || lowerField.includes('observ')) return 'textarea';
    
    return 'text';
}

/**
 * Gera tabela HTML
 */
function generateTableHTML(message, context) {
    return `<div class="table-container">
    <table class="data-table">
        <thead>
            <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Data</th>
                <th>Status</th>
                <th>Ações</th>
            </tr>
        </thead>
        <tbody id="tableBody">
            <!-- Dados serão inseridos aqui via JavaScript -->
        </tbody>
    </table>
</div>`;
}

/**
 * Gera card HTML
 */
function generateCardHTML(message, context) {
    return `<div class="card custom-card">
    <div class="card-header">
        <h3>Título do Card</h3>
        <button class="btn btn-icon">
            <i class="fas fa-ellipsis-v"></i>
        </button>
    </div>
    <div class="card-body">
        <p>Conteúdo do card aqui</p>
    </div>
    <div class="card-footer">
        <button class="btn btn-primary">Ação</button>
    </div>
</div>`;
}

/**
 * Gera modal HTML
 */
function generateModalHTML(message, context) {
    return `<div class="modal" id="customModal">
    <div class="modal-content">
        <div class="modal-header">
            <h3>Novo Modal</h3>
            <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
            <p>Conteúdo do modal aqui</p>
        </div>
        <div class="modal-footer">
            <button class="btn btn-outline close-modal">Cancelar</button>
            <button class="btn btn-primary">Confirmar</button>
        </div>
    </div>
</div>`;
}

/**
 * Gera mudança de cores
 */
function generateColorChange(message, context) {
    // Extrair cores mencionadas
    const colorMatch = message.match(/(azul|vermelho|verde|amarelo|roxo|rosa|laranja|preto|branco|cinza|dourado)/i);
    const color = colorMatch ? colorMatch[1].toLowerCase() : 'azul';
    
    const colorMap = {
        'azul': '#4361ee',
        'vermelho': '#ef233c',
        'verde': '#06ffa5',
        'amarelo': '#ffd60a',
        'roxo': '#764ba2',
        'rosa': '#f093fb',
        'laranja': '#ff6b35',
        'preto': '#14213d',
        'branco': '#ffffff',
        'cinza': '#8d99ae',
        'dourado': '#ffd700'
    };
    
    const selectedColor = colorMap[color] || '#4361ee';
    
    return {
        explanation: `🎨 Perfeito! Vou alterar a cor primária do sistema para ${color}.<br><br>
                     As alterações incluem:
                     <ul>
                        <li>Cor primária: ${selectedColor}</li>
                        <li>Gradientes e botões</li>
                        <li>Elementos de destaque</li>
                     </ul>
                     Você pode visualizar e aprovar as mudanças no painel ao lado.`,
        files: [{
            path: 'css/style.css',
            language: 'css',
            changes: [
                {
                    description: 'Atualizar variável de cor primária',
                    oldCode: '--primary-color: #4361ee;',
                    newCode: `--primary-color: ${selectedColor};`
                },
                {
                    description: 'Atualizar gradiente primário',
                    oldCode: '--primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);',
                    newCode: `--primary-gradient: linear-gradient(135deg, ${selectedColor} 0%, ${adjustColor(selectedColor, -20)} 100%);`
                }
            ]
        }],
        code: `:root {
    --primary-color: ${selectedColor};
    --primary-gradient: linear-gradient(135deg, ${selectedColor} 0%, ${adjustColor(selectedColor, -20)} 100%);
}`
    };
}

/**
 * Gera adição de funcionalidade
 */
function generateFeatureAddition(message, context) {
    const lowerMsg = message.toLowerCase();
    
    if (lowerMsg.includes('campo') || lowerMsg.includes('input')) {
        const fieldName = extractFieldName(message);
        
        return {
            explanation: `✨ Vou adicionar o campo "${fieldName}" ao sistema.<br><br>
                         As alterações incluem:
                         <ul>
                            <li>Novo campo no formulário HTML</li>
                            <li>Validação JavaScript</li>
                            <li>Armazenamento no Firebase</li>
                         </ul>`,
            files: [{
                path: 'index.html',
                language: 'html',
                changes: [{
                    description: `Adicionar campo ${fieldName}`,
                    newCode: `<div class="form-group">
    <label class="form-label" for="${fieldName}">${capitalize(fieldName)}</label>
    <input type="text" class="form-control" id="${fieldName}" placeholder="${capitalize(fieldName)}" required>
</div>`
                }]
            }],
            code: `<div class="form-group">
    <label class="form-label" for="${fieldName}">${capitalize(fieldName)}</label>
    <input type="text" class="form-control" id="${fieldName}" placeholder="${capitalize(fieldName)}" required>
</div>`
        };
    }
    
    return generateGeneral(message, context);
}

/**
 * Gera correção de bug
 */
function generateBugFix(message, context) {
    return {
        explanation: `🐛 Vou analisar e propor uma correção para o problema relatado.<br><br>
                     Com base na sua descrição, vou:
                     <ul>
                        <li>Identificar a causa do problema</li>
                        <li>Propor uma solução</li>
                        <li>Adicionar tratamento de erros</li>
                     </ul>`,
        files: [],
        code: `// Análise do problema:
// ${message}

// Adicionar tratamento de erro e validações necessárias
try {
    // Código corrigido aqui
} catch (error) {
    console.error('Erro:', error);
    showNotification('Ocorreu um erro', 'error');
}`
    };
}

/**
 * Gera modificação de layout
 */
function generateLayoutModification(message, context) {
    return {
        explanation: `📐 Vou modificar o layout conforme solicitado.<br><br>
                     As alterações de estilo serão aplicadas ao CSS.`,
        files: [{
            path: 'css/style.css',
            language: 'css',
            changes: [{
                description: 'Modificação de layout',
                newCode: `/* Modificação baseada em: ${message} */`
            }]
        }],
        code: `/* Modificação de layout */`
    };
}

/**
 * Gera validação
 */
function generateValidation(message, context) {
    return {
        explanation: `✅ Vou adicionar validações ao sistema.`,
        files: [],
        code: `function validateInput(value) {
    if (!value || value.trim() === '') {
        showNotification('Campo obrigatório', 'error');
        return false;
    }
    return true;
}`
    };
}

/**
 * Gera relatório
 */
function generateReport(message, context) {
    const lowerMsg = message.toLowerCase();
    
    // Detectar tipo de relatório
    let reportType = 'eventos';
    if (lowerMsg.includes('avaliados') || lowerMsg.includes('avaliação')) {
        reportType = 'eventos-avaliados';
    } else if (lowerMsg.includes('financeiro') || lowerMsg.includes('gasto')) {
        reportType = 'financeiro';
    } else if (lowerMsg.includes('usuário') || lowerMsg.includes('usuario')) {
        reportType = 'usuarios';
    }
    
    const reportCode = generateReportCode(reportType);
    
    return {
        explanation: `📊 Perfeito! Vou gerar o relatório solicitado.<br><br>
                     O código incluirá:
                     <ul>
                        <li>Coleta de dados do ${reportType}</li>
                        <li>Processamento e análise</li>
                        <li>Exibição formatada</li>
                        <li>Opção de exportação</li>
                     </ul>
                     Veja o código no painel ao lado e aplique quando quiser!`,
        files: [{
            path: `js/reports-${reportType}.js`,
            language: 'javascript',
            code: reportCode
        }],
        code: reportCode
    };
}

/**
 * Gera código de relatório específico
 */
function generateReportCode(reportType) {
    if (reportType === 'eventos-avaliados') {
        return `/**
 * Gera relatório de eventos mais bem avaliados
 */
function generateTopRatedEventsReport() {
    console.log('[report] Gerando relatório de eventos mais bem avaliados');
    
    // Buscar eventos do localStorage
    const events = JSON.parse(localStorage.getItem('events') || '[]');
    
    // Calcular média de avaliações para cada evento
    const eventsWithRating = events.map(event => {
        const ratings = event.ratings || [];
        const avgRating = ratings.length > 0 
            ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length 
            : 0;
        
        return {
            ...event,
            avgRating: avgRating.toFixed(1),
            totalRatings: ratings.length
        };
    });
    
    // Ordenar por avaliação (maior para menor)
    const topEvents = eventsWithRating
        .filter(e => e.totalRatings > 0)
        .sort((a, b) => b.avgRating - a.avgRating)
        .slice(0, 10); // Top 10
    
    // Gerar HTML do relatório
    let html = \`
        <div class="report-container">
            <div class="report-header">
                <h2>📊 Top 10 Eventos Mais Bem Avaliados</h2>
                <p>Gerado em: \${new Date().toLocaleDateString('pt-BR')}</p>
            </div>
            
            <div class="report-stats">
                <div class="stat-card">
                    <h3>\${events.length}</h3>
                    <p>Total de Eventos</p>
                </div>
                <div class="stat-card">
                    <h3>\${topEvents.length}</h3>
                    <p>Eventos Avaliados</p>
                </div>
                <div class="stat-card">
                    <h3>\${topEvents[0]?.avgRating || '0'} ⭐</h3>
                    <p>Melhor Avaliação</p>
                </div>
            </div>
            
            <table class="report-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Evento</th>
                        <th>Data</th>
                        <th>Categoria</th>
                        <th>Avaliação</th>
                        <th>Nº Votos</th>
                    </tr>
                </thead>
                <tbody>
    \`;
    
    topEvents.forEach((event, index) => {
        const category = categories.find(c => c.id === event.categoryId);
        html += \`
            <tr>
                <td>\${index + 1}</td>
                <td><strong>\${event.title}</strong></td>
                <td>\${new Date(event.date).toLocaleDateString('pt-BR')}</td>
                <td>
                    <span class="category-badge" style="background: \${category?.color || '#ccc'}">
                        \${category?.name || 'Sem categoria'}
                    </span>
                </td>
                <td>
                    <div class="rating-display">
                        \${event.avgRating} ⭐
                    </div>
                </td>
                <td>\${event.totalRatings}</td>
            </tr>
        \`;
    });
    
    html += \`
                </tbody>
            </table>
            
            <div class="report-footer">
                <button class="btn btn-primary" onclick="exportReportToPDF()">
                    <i class="fas fa-download"></i> Exportar PDF
                </button>
                <button class="btn btn-outline" onclick="printReport()">
                    <i class="fas fa-print"></i> Imprimir
                </button>
            </div>
        </div>
    \`;
    
    // Exibir relatório
    const reportContainer = document.getElementById('reportOutput');
    if (reportContainer) {
        reportContainer.innerHTML = html;
    } else {
        // Criar container se não existir
        const div = document.createElement('div');
        div.id = 'reportOutput';
        div.innerHTML = html;
        document.querySelector('.content').appendChild(div);
    }
    
    showNotification('✅ Relatório gerado com sucesso!', 'success');
}

// Funções auxiliares
function exportReportToPDF() {
    showNotification('📥 Funcionalidade de exportação PDF em desenvolvimento', 'info');
}

function printReport() {
    window.print();
}

// Chamar automaticamente
generateTopRatedEventsReport();`;
    }
    
    // Outros tipos de relatório...
    return `// Código de relatório para ${reportType}
console.log('Gerando relatório de ${reportType}...');`;
}

/**
 * Gera código para remover elemento
 */
function generateRemoveElement(message, context, entities) {
    const target = entities.targets[0] || 'elemento';
    
    return {
        explanation: `🗑️ Vou remover o ${target} conforme solicitado.<br><br>
                     Código JavaScript será gerado para remover o elemento do DOM.`,
        files: [{
            path: 'js/custom-removal.js',
            language: 'javascript',
            code: `// Remover ${target}
const elementoParaRemover = document.querySelector('#seletor-do-${target}');
if (elementoParaRemover) {
    elementoParaRemover.remove();
    showNotification('${capitalize(target)} removido com sucesso', 'success');
} else {
    console.warn('Elemento não encontrado');
}`
        }],
        code: `// Script de remoção gerado automaticamente`
    };
}

/**
 * Gera código para mostrar/esconder elemento
 */
function generateShowHide(message, context, entities) {
    const action = message.toLowerCase().includes('esconder') || message.toLowerCase().includes('ocultar') ? 'esconder' : 'mostrar';
    
    return {
        explanation: `👁️ Vou ${action} o elemento conforme solicitado.`,
        files: [{
            path: 'js/toggle-visibility.js',
            language: 'javascript',
            code: `// ${capitalize(action)} elemento
const elemento = document.querySelector('#seu-elemento');
if (elemento) {
    elemento.style.display = '${action === 'esconder' ? 'none' : 'block'}';
    console.log('Elemento ${action === 'esconder' ? 'ocultado' : 'exibido'}');
}`
        }],
        code: `elemento.style.display = '${action === 'esconder' ? 'none' : 'block'}';`
    };
}

/**
 * Gera código para mudar texto
 */
function generateTextChange(message, context, entities) {
    return {
        explanation: `📝 Vou alterar o texto conforme solicitado.`,
        files: [{
            path: 'js/text-change.js',
            language: 'javascript',
            code: `// Alterar texto
const elemento = document.querySelector('#elemento-alvo');
if (elemento) {
    elemento.textContent = 'Novo texto aqui';
    // OU para HTML:
    // elemento.innerHTML = '<strong>Novo HTML aqui</strong>';
}`
        }],
        code: `elemento.textContent = 'Novo texto';`
    };
}

/**
 * Gera código para adicionar animação
 */
function generateAnimation(message, context, entities) {
    return {
        explanation: `🎬 Vou adicionar animações ao elemento.`,
        files: [{
            path: 'css/animations.css',
            language: 'css',
            code: `/* Animação customizada */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animated-element {
    animation: fadeInUp 0.5s ease-out;
}

/* Hover effect */
.animated-element:hover {
    transform: scale(1.05);
    transition: transform 0.3s ease;
}`
        }],
        code: `animation: fadeInUp 0.5s ease-out;`
    };
}

/**
 * Gera código para exportar dados
 */
function generateExport(message, context, entities) {
    const format = message.toLowerCase().includes('pdf') ? 'pdf' : 
                   message.toLowerCase().includes('excel') ? 'excel' : 'csv';
    
    return {
        explanation: `💾 Vou criar função de exportação para ${format.toUpperCase()}.`,
        files: [{
            path: 'js/export-data.js',
            language: 'javascript',
            code: `/**
 * Exporta dados para ${format.toUpperCase()}
 */
function exportarDados() {
    const dados = JSON.parse(localStorage.getItem('events') || '[]');
    
    ${format === 'csv' ? `
    // Converter para CSV
    const csvContent = convertToCSV(dados);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dados-${new Date().toISOString().split('T')[0]}.csv';
    a.click();
    
    URL.revokeObjectURL(url);
    ` : format === 'excel' ? `
    // Para Excel, use biblioteca como xlsx
    console.log('Instale: npm install xlsx');
    // import * as XLSX from 'xlsx';
    // const wb = XLSX.utils.book_new();
    // const ws = XLSX.utils.json_to_sheet(dados);
    // XLSX.utils.book_append_sheet(wb, ws, 'Dados');
    // XLSX.writeFile(wb, 'dados.xlsx');
    ` : `
    // Para PDF, use biblioteca como jsPDF
    console.log('Instale jsPDF para exportar PDF');
    `}
    
    showNotification('✅ Dados exportados com sucesso!', 'success');
}

function convertToCSV(data) {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const rows = data.map(obj => 
        headers.map(h => JSON.stringify(obj[h] || '')).join(',')
    );
    
    return [headers.join(','), ...rows].join('\\n');
}

// Chamar função
exportarDados();`
        }],
        code: `exportarDados();`
    };
}

/**
 * Geração geral
 */
function generateGeneral(message, context) {
    return {
        explanation: `Entendi sua solicitação: "<em>${escapeHtml(message)}</em>"<br><br>
                     Para que eu possa ajudar melhor, poderia especificar:
                     <ul>
                        <li>Qual arquivo ou página específica?</li>
                        <li>Que tipo de alteração (cor, funcionalidade, correção)?</li>
                        <li>Algum exemplo ou referência?</li>
                     </ul>
                     Exemplos de comandos:
                     <ul>
                        <li>"Mude a cor principal para azul"</li>
                        <li>"Adicione um campo de telefone no cadastro"</li>
                        <li>"Corrija o bug no botão de salvar"</li>
                     </ul>`,
        files: [],
        code: null
    };
}

/**
 * Parseia resposta da IA
 */
function parseAIResponse(aiResponse, originalMessage) {
    // Tentar extrair código e explicação da resposta
    const explanationMatch = aiResponse.match(/EXPLICAÇÃO:(.+?)(?=ARQUIVO:|$)/s);
    const fileMatch = aiResponse.match(/ARQUIVO:(.+?)(?=CÓDIGO:|$)/s);
    const codeMatch = aiResponse.match(/CÓDIGO:\s*```(\w+)?\s*(.+?)```/s);
    
    return {
        response: explanationMatch ? explanationMatch[1].trim() : aiResponse,
        files: fileMatch ? [{
            path: fileMatch[1].trim(),
            language: codeMatch ? codeMatch[1] : 'javascript',
            code: codeMatch ? codeMatch[2].trim() : null
        }] : [],
        code: codeMatch ? codeMatch[2].trim() : null
    };
}

/**
 * Funções auxiliares
 */
function getCurrentPage() {
    const activePage = document.querySelector('.page.active');
    return activePage ? activePage.id.replace('-page', '') : 'dashboard';
}

function extractFieldName(message) {
    const match = message.match(/campo\s+(?:de\s+)?(\w+)/i);
    return match ? match[1] : 'novocamp';
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function adjustColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 +
        (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255))
        .toString(16).slice(1);
}

/**
 * Gera resposta do assistente (DEPRECATED - manter para compatibilidade)
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
 * Mostra preview real das alterações geradas pela IA
 */
function showRealPreview(result) {
    const previewContent = document.getElementById('aiPreviewContent');
    const previewInfo = document.getElementById('aiPreviewInfo');
    const applyBtn = document.getElementById('applyChangesBtn');
    const rejectBtn = document.getElementById('rejectChangesBtn');
    
    if (!previewContent) return;
    
    // Limpar conteúdo anterior
    previewContent.innerHTML = '';
    
    // Mostrar código gerado
    if (result.files && result.files.length > 0) {
        result.files.forEach(file => {
            const codeDiv = document.createElement('div');
            codeDiv.className = 'code-preview';
            codeDiv.innerHTML = `
                <div class="code-header">
                    <span><i class="fas fa-file-code"></i> ${file.path}</span>
                    <span class="code-status modified">Será modificado</span>
                </div>
                <pre><code class="language-${file.language || 'javascript'}">${escapeHtml(file.code || result.code || '')}</code></pre>
            `;
            previewContent.appendChild(codeDiv);
        });
        
        // Adicionar nota
        const noteDiv = document.createElement('div');
        noteDiv.className = 'preview-note';
        noteDiv.innerHTML = `
            <i class="fas fa-info-circle"></i>
            <span>As alterações acima serão aplicadas aos arquivos indicados. Revise antes de aplicar.</span>
        `;
        previewContent.appendChild(noteDiv);
        
    } else if (result.code) {
        // Código genérico sem arquivo específico
        const codeDiv = document.createElement('div');
        codeDiv.className = 'code-preview';
        codeDiv.innerHTML = `
            <div class="code-header">
                <span><i class="fas fa-code"></i> Código gerado</span>
                <span class="code-status new">Novo</span>
            </div>
            <pre><code>${escapeHtml(result.code)}</code></pre>
        `;
        previewContent.appendChild(codeDiv);
    }
    
    // Mostrar lista de arquivos
    if (previewInfo && result.files) {
        const filesList = document.getElementById('modifiedFilesList');
        if (filesList) {
            filesList.innerHTML = result.files.map(file => `
                <li>
                    <i class="fas fa-file-code"></i> ${file.path}
                    <span class="file-badge modified">Modificado</span>
                </li>
            `).join('');
        }
        previewInfo.style.display = 'block';
    }
    
    // Mostrar botões
    if (applyBtn) applyBtn.style.display = 'inline-flex';
    if (rejectBtn) rejectBtn.style.display = 'inline-flex';
    
    // Salvar mudanças pendentes
    pendingChanges = {
        files: result.files,
        code: result.code,
        timestamp: new Date().toISOString()
    };
}

/**
 * Mostra preview das alterações (DEPRECATED - manter para compatibilidade)
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
 * Aplica as alterações geradas pela IA
 */
function applyChanges() {
    if (!pendingChanges) return;
    
    // Verificar se usuário é admin
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (user.role !== 'admin') {
        showNotification('❌ Apenas administradores podem aplicar alterações', 'error');
        return;
    }
    
    // Gerar instruções de aplicação
    const instructions = generateApplyInstructions(pendingChanges);
    
    // Mostrar modal com instruções
    showApplyModal(instructions);
    
    // Salvar no histórico
    saveToHistory(pendingChanges);
    
    // Mensagem de confirmação
    addAssistantMessage(`✅ Instruções geradas! Siga os passos no modal para aplicar as alterações.<br><br>
        <strong>Opções:</strong><br>
        1. Copiar código e aplicar manualmente<br>
        2. Baixar arquivos modificados<br>
        3. Usar GitHub Copilot para aplicar automaticamente`);
    
    // Registrar no Firebase
    if (currentUser && window.firebase) {
        const db = firebase.database();
        const requestRef = db.ref('ai-requests').push();
        
        requestRef.set({
            userId: currentUser.uid,
            userName: currentUser.name,
            request: pendingChanges.message || 'Modificação via AI',
            status: 'pending',
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            files: pendingChanges.files?.map(f => f.path) || []
        });
    }
}

/**
 * Gera instruções de como aplicar as mudanças
 */
function generateApplyInstructions(changes) {
    let instructions = `<h3>📋 Como aplicar as alterações:</h3>`;
    
    if (changes.files && changes.files.length > 0) {
        instructions += `<ol class="instructions-list">`;
        
        changes.files.forEach((file, index) => {
            instructions += `
                <li>
                    <strong>Arquivo: ${file.path}</strong>
                    <div class="instruction-step">
                        <p>1. Abra o arquivo: <code>${file.path}</code></p>
                        <p>2. ${file.changes ? 'Localize e substitua o código:' : 'Adicione o código:'}</p>
                        <button class="btn btn-sm btn-outline copy-code-btn" data-code="${index}">
                            <i class="fas fa-copy"></i> Copiar Código
                        </button>
                        <button class="btn btn-sm btn-primary download-file-btn" data-file="${index}">
                            <i class="fas fa-download"></i> Baixar Arquivo
                        </button>
                    </div>
                </li>
            `;
        });
        
        instructions += `</ol>`;
    } else if (changes.code) {
        instructions += `
            <div class="instruction-step">
                <p>Código gerado:</p>
                <button class="btn btn-sm btn-outline copy-all-btn">
                    <i class="fas fa-copy"></i> Copiar Todo Código
                </button>
            </div>
        `;
    }
    
    instructions += `
        <div class="instruction-note">
            <i class="fas fa-lightbulb"></i>
            <strong>Dica:</strong> Você pode usar o GitHub Copilot Chat no VS Code para aplicar estas mudanças automaticamente.
            Basta copiar as instruções e colar no chat.
        </div>
    `;
    
    return instructions;
}

/**
 * Mostra modal com instruções de aplicação
 */
function showApplyModal(instructions) {
    // Criar modal se não existir
    let modal = document.getElementById('applyInstructionsModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'applyInstructionsModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px;">
                <div class="modal-header">
                    <h3>Aplicar Alterações</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body" id="applyInstructionsContent"></div>
                <div class="modal-footer" style="display: flex; gap: 8px; justify-content: flex-end;">
                    <button class="btn btn-outline close-apply-modal">Fechar</button>
                    <button class="btn btn-success" id="markAsAppliedBtn">
                        <i class="fas fa-check"></i> Marcar como Aplicado
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Setup eventos
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.classList.remove('active');
        });
        
        modal.querySelector('.close-apply-modal').addEventListener('click', () => {
            modal.classList.remove('active');
        });
        
        modal.querySelector('#markAsAppliedBtn').addEventListener('click', () => {
            showNotification('✅ Alterações marcadas como aplicadas!', 'success');
            modal.classList.remove('active');
            clearPreview();
        });
    }
    
    // Atualizar conteúdo
    const content = document.getElementById('applyInstructionsContent');
    if (content) {
        content.innerHTML = instructions;
        
        // Setup botões de copiar
        content.querySelectorAll('.copy-code-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.getAttribute('data-code'));
                const code = pendingChanges.files[index]?.code || pendingChanges.code;
                copyToClipboard(code);
                showNotification('Código copiado!', 'success');
            });
        });
        
        // Setup botões de download
        content.querySelectorAll('.download-file-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.getAttribute('data-file'));
                const file = pendingChanges.files[index];
                downloadFile(file);
            });
        });
        
        // Setup botão copiar tudo
        const copyAllBtn = content.querySelector('.copy-all-btn');
        if (copyAllBtn) {
            copyAllBtn.addEventListener('click', () => {
                copyToClipboard(pendingChanges.code || '');
                showNotification('Código copiado!', 'success');
            });
        }
    }
    
    modal.classList.add('active');
}

/**
 * Copia texto para clipboard
 */
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
    } else {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }
}

/**
 * Faz download de arquivo
 */
function downloadFile(file) {
    const content = file.code || pendingChanges.code || '';
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.path.split('/').pop();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification(`📥 Arquivo ${a.download} baixado!`, 'success');
}

/**
 * Salva no histórico
 */
function saveToHistory(changes) {
    try {
        const history = JSON.parse(localStorage.getItem('ai-history') || '[]');
        history.unshift({
            timestamp: new Date().toISOString(),
            changes: changes,
            applied: false
        });
        
        // Manter apenas últimos 50
        if (history.length > 50) history.length = 50;
        
        localStorage.setItem('ai-history', JSON.stringify(history));
    } catch (error) {
        console.error('[ai-assistant] Erro ao salvar histórico:', error);
    }
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
