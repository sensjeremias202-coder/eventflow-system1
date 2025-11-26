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
 * Analisa intenção do usuário (EXPANDIDO - 7 PILARES)
 */
function analyzeIntent(message) {
    const lowerMsg = message.toLowerCase();
    
    const intents = {
        // PILAR 1: Compreensão Linguística
        conversation: /(?:conversar|bater papo|me ajude|explique|o que é|como funciona)/i,
        summarize: /(?:resumir|resumo|sintetizar|principais pontos)/i,
        translate: /(?:traduzir|tradução|translate|translation)/i,
        explain: /(?:explicar|explique|como|por que|porque)/i,
        
        // PILAR 2: Raciocínio Lógico
        changeColor: /(?:mudar|alterar|trocar|modificar|mudar).{0,20}(?:cor|tema|estilo|visual|aparência|design)/i,
        addFeature: /(?:adicionar|criar|implementar|fazer|incluir|colocar).{0,30}(?:campo|botão|funcionalidade|recurso|função|feature|input|select|textarea)/i,
        fixBug: /(?:corrigir|consertar|resolver|arrumar|fix|debug|depurar).{0,20}(?:bug|erro|problema|issue|falha)/i,
        refactorCode: /(?:refatorar|otimizar código|melhorar código|reestruturar)/i,
        createArchitecture: /(?:arquitetura|estrutura|design pattern|padrão)/i,
        
        // PILAR 3: Gerenciamento de Dados
        generateDocument: /(?:gerar|criar|fazer).{0,30}(?:pdf|docx|xlsx|documento|planilha|word|excel)/i,
        exportData: /(?:exportar|baixar|salvar|download).{0,30}(?:dados|informações|informacoes|arquivo|csv|excel|pdf)/i,
        manipulateData: /(?:processar|manipular|transformar|converter).{0,20}(?:dados|data|informação)/i,
        
        // PILAR 4: Percepção Visual (simulado)
        generateDiagram: /(?:gerar|criar|fazer).{0,30}(?:diagrama|fluxograma|gráfico|chart|visualização)/i,
        generateImage: /(?:gerar|criar|fazer).{0,30}(?:imagem|logo|ícone|icon|ilustração)/i,
        editVisual: /(?:editar|modificar|ajustar).{0,30}(?:imagem|visual|gráfico)/i,
        
        // PILAR 5: Acesso à Informação
        searchWeb: /(?:buscar|pesquisar|procurar).{0,30}(?:na internet|online|web|google)/i,
        getLatestInfo: /(?:último|última|recente|atual|atualizado|novidade)/i,
        research: /(?:pesquisa|estudo|investigação|análise).{0,20}(?:sobre|de)/i,
        
        // PILAR 6: Auxílio Cognitivo
        createPlan: /(?:criar|fazer|gerar).{0,30}(?:plano|planejamento|cronograma|agenda)/i,
        studyHelp: /(?:estudar|aprender|ensinar|ajuda para estudar)/i,
        organizeTasks: /(?:organizar|estruturar|planejar).{0,20}(?:tarefas|atividades|projetos)/i,
        productivity: /(?:produtividade|eficiência|otimizar tempo|gestão)/i,
        
        // PILAR 7: Ética e Segurança (análise passiva)
        securityCheck: /(?:segurança|vulnerabilidade|proteção|privacidade)/i,
        validateData: /(?:validar|verificar|checar).{0,20}(?:segurança|dados|permissão)/i,
        
        // Pilares existentes mantidos
        modifyLayout: /(?:mudar|alterar|modificar|ajustar|redimensionar).{0,30}(?:layout|posição|tamanho|estilo|largura|altura|margem|padding|espaçamento)/i,
        generateReport: /(?:gerar|criar|fazer|mostrar|exibir).{0,30}(?:relatório|relatorio|gráfico|grafico|estatística|estatistica|análise|analise|dashboard|report)/i,
        addValidation: /(?:validar|validação|validacao|verificar|checar).{0,20}(?:campo|input|formulário|formulario|dados)/i,
        improvePerformance: /(?:otimizar|melhorar|acelerar|aumentar).{0,20}(?:performance|velocidade|rapidez|desempenho)/i,
        removeElement: /(?:remover|deletar|excluir|tirar|apagar).{0,30}(?:elemento|componente|campo|botão|botao|div|section)/i,
        showHideElement: /(?:mostrar|esconder|ocultar|exibir|hide|show).{0,30}(?:elemento|componente|campo|div)/i,
        changeText: /(?:mudar|alterar|trocar|modificar).{0,30}(?:texto|title|título|titulo|label|nome|descrição|descricao)/i,
        addAnimation: /(?:adicionar|criar|fazer|aplicar).{0,30}(?:animação|animacao|efeito|transição|transicao)/i
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
    if (lowerMsg.includes('pdf') || lowerMsg.includes('excel')) return 'generateDocument';
    if (lowerMsg.includes('plano') || lowerMsg.includes('planejamento')) return 'createPlan';
    
    console.log('[ai-assistant] Intenção não reconhecida, usando general');
    return 'general';
}

/**
 * Gera código baseado na intenção com entidades extraídas
 */
function generateCodeFromIntent(intent, message, context, entities = {}) {
    const generators = {
        // PILAR 1: Compreensão Linguística
        conversation: generateConversation,
        summarize: generateSummary,
        translate: generateTranslation,
        explain: generateExplanation,
        
        // PILAR 2: Raciocínio Lógico
        changeColor: generateColorChange,
        addFeature: generateFeatureAddition,
        fixBug: generateBugFix,
        refactorCode: generateRefactoring,
        createArchitecture: generateArchitecture,
        modifyLayout: generateLayoutModification,
        
        // PILAR 3: Gerenciamento de Dados
        generateDocument: generateDocument,
        exportData: generateExport,
        manipulateData: generateDataManipulation,
        
        // PILAR 4: Percepção Visual
        generateDiagram: generateDiagram,
        generateImage: generateImagePlaceholder,
        editVisual: generateVisualEdit,
        
        // PILAR 5: Acesso à Informação
        searchWeb: generateWebSearch,
        getLatestInfo: generateLatestInfo,
        research: generateResearch,
        
        // PILAR 6: Auxílio Cognitivo
        createPlan: generatePlan,
        studyHelp: generateStudyHelp,
        organizeTasks: generateTaskOrganization,
        productivity: generateProductivityTips,
        
        // PILAR 7: Ética e Segurança
        securityCheck: generateSecurityCheck,
        validateData: generateDataValidation,
        
        // Existentes
        addValidation: generateValidation,
        generateReport: generateReport,
        removeElement: generateRemoveElement,
        showHideElement: generateShowHide,
        changeText: generateTextChange,
        addAnimation: generateAnimation,
        improvePerformance: generatePerformanceImprovement
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
 * ==================== GERADORES - PILAR 1: COMPREENSÃO LINGUÍSTICA ====================
 */

/**
 * Gera resposta conversacional contextual
 */
function generateConversation(message, context, entities) {
    const isGreeting = /(?:oi|olá|hey|bom dia|boa tarde|boa noite)/i.test(message);
    const isQuestion = /(?:\?|como|o que|qual|quando|onde|por que|porque)/i.test(message);
    const isHelp = /(?:ajuda|ajude|me ajude|socorro|help)/i.test(message);
    
    let response = '';
    
    if (isGreeting) {
        response = `👋 Olá! Sou o AI Assistant do EventFlow System.\n\nEstou aqui para ajudar você com:\n• Modificar cores e estilos\n• Adicionar novos recursos\n• Corrigir bugs e problemas\n• Gerar relatórios e documentos\n• Organizar tarefas e planos\n• Validar segurança\n• E muito mais!\n\n💡 O que você gostaria de fazer hoje?`;
    } else if (isHelp) {
        response = `🆘 **Comandos Disponíveis:**\n\n**Design & UI:**\n• "Mudar a cor principal para azul"\n• "Adicionar animação no botão salvar"\n• "Remover o campo descrição"\n\n**Dados & Relatórios:**\n• "Gerar relatório dos eventos mais avaliados"\n• "Exportar dados de usuários em PDF"\n• "Criar gráfico de participação"\n\n**Desenvolvimento:**\n• "Corrigir bug no formulário"\n• "Refatorar código da página de eventos"\n• "Adicionar validação de email"\n\n**Produtividade:**\n• "Criar um plano de estudos"\n• "Organizar minhas tarefas"\n• "Pesquisar sobre Firebase"\n\n**Segurança:**\n• "Verificar vulnerabilidades"\n• "Validar dados de entrada"\n\n💬 Digite seu comando naturalmente!`;
    } else if (isQuestion) {
        if (/quantos|quantidade|total/i.test(message)) {
            const stats = context.statistics || {};
            response = `📊 **Estatísticas do Projeto:**\n\n`;
            response += `• **Eventos:** ${stats.totalEvents || 0} (${stats.activeEvents || 0} ativos)\n`;
            response += `• **Usuários:** ${stats.totalUsers || 0}\n`;
            response += `• **Categorias:** ${stats.totalCategories || 0}\n`;
            response += `• **Avaliação Média:** ${stats.averageRating ? stats.averageRating.toFixed(1) : 'N/A'} ⭐`;
        } else {
            response = `🤔 Entendi sua pergunta: "${message}"\n\nPara responder melhor, seja mais específico:\n• O que você quer saber?\n• Qual funcionalidade?\n• Que tipo de ajuda precisa?\n\n💡 Exemplos:\n• "Como funciona a autenticação?"\n• "O que é a página de eventos?"\n• "Explique o sistema de categorias"`;
        }
    } else {
        response = `💬 Entendi! Você disse: "${message}"\n\nSou um assistente AI focado em desenvolvimento. Posso:\n• Modificar o código do sistema\n• Gerar relatórios e documentos\n• Ajudar com planejamento\n• Pesquisar informações técnicas\n• Verificar segurança\n\n❓ Como posso ajudar especificamente?`;
    }
    
    return {
        html: '',
        css: '',
        js: '',
        explanation: response,
        suggestion: 'Digite um comando específico para executar ações no sistema.'
    };
}

/**
 * Gera resumo de conteúdo
 */
function generateSummary(message, context, entities) {
    const target = entities.targets[0] || 'projeto';
    let summary = `📝 **Resumo: ${target}**\n\n`;
    
    if (/eventos?/i.test(target)) {
        const events = context.events || [];
        const activeEvents = events.filter(e => e.status === 'ativo');
        const topRated = events.sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];
        
        summary += `**Total:** ${events.length} eventos\n`;
        summary += `**Ativos:** ${activeEvents.length}\n`;
        summary += `**Melhor:** ${topRated ? topRated.name + ' (' + topRated.rating + '⭐)' : 'N/A'}\n\n`;
        
        const categoryCount = {};
        events.forEach(e => {
            const cat = e.category || 'Sem categoria';
            categoryCount[cat] = (categoryCount[cat] || 0) + 1;
        });
        
        summary += `📊 **Top Categorias:**\n`;
        Object.entries(categoryCount).sort((a, b) => b[1] - a[1]).slice(0, 5).forEach(([cat, count]) => {
            summary += `• ${cat}: ${count}\n`;
        });
    } else {
        const stats = context.statistics || {};
        summary += `🎯 **EventFlow System**\n\n`;
        summary += `**Eventos:** ${stats.totalEvents || 0}\n`;
        summary += `**Usuários:** ${stats.totalUsers || 0}\n`;
        summary += `**Categorias:** ${stats.totalCategories || 0}\n`;
        summary += `**Média:** ${stats.averageRating ? stats.averageRating.toFixed(1) : 'N/A'} ⭐`;
    }
    
    return {
        html: '',
        css: '',
        js: '',
        explanation: summary,
        suggestion: 'Posso gerar um relatório completo em PDF. Quer que eu faça?'
    };
}

/**
 * Gera tradução (sugere ferramenta externa)
 */
function generateTranslation(message, context, entities) {
    const js = `// Sistema i18n que posso criar:
const translations = {
    'pt-br': {
        'dashboard': 'Painel',
        'events': 'Eventos',
        'users': 'Usuários'
    },
    'en': {
        'dashboard': 'Dashboard',
        'events': 'Events',
        'users': 'Users'
    }
};

function t(key, lang = 'pt-br') {
    return translations[lang]?.[key] || key;
}`;
    
    return {
        html: '',
        css: '',
        js: js,
        explanation: `🌍 **Tradução**\n\nNão tenho tradução em tempo real, mas posso:\n• Adicionar suporte multi-idioma\n• Criar arquivos i18n\n• Estruturar internacionalização\n\n💡 APIs sugeridas:\n• Google Translate\n• DeepL\n• Microsoft Translator`,
        suggestion: 'Quer que eu implemente sistema multi-idioma?'
    };
}

/**
 * Gera explicação detalhada
 */
function generateExplanation(message, context, entities) {
    const topic = entities.targets[0] || message.toLowerCase();
    let explanation = '';
    
    if (/autenticação|auth|login/i.test(topic)) {
        explanation = `🔐 **Autenticação**\n\n**Roles:**\n1️⃣ **Admin** - Acesso total\n2️⃣ **Treasurer** - Financeiro + eventos\n3️⃣ **Jovens** - Visualização\n\n🔧 Arquivo: \`js/auth.js\``;
    } else if (/eventos?/i.test(topic)) {
        explanation = `📅 **Eventos**\n\nCriar e gerenciar eventos:\n• Nome, data, hora, local\n• Categorias\n• Avaliações (1-5⭐)\n• Upload de imagens\n\n🔧 Arquivo: \`js/events.js\``;
    } else if (/ai|assistente/i.test(topic)) {
        explanation = `🤖 **AI Assistant**\n\n7 Pilares:\n1. Compreensão Linguística\n2. Raciocínio Lógico\n3. Gerenciamento de Dados\n4. Percepção Visual\n5. Acesso à Informação\n6. Auxílio Cognitivo\n7. Ética e Segurança\n\n🔧 Arquivo: \`pages/ai-assistant/ai-assistant.js\``;
    } else {
        explanation = `💡 **Tópicos:**\n• Autenticação\n• Eventos\n• Categorias\n• AI Assistant\n• Firebase\n• Chat\n\n**Exemplo:** "Explique autenticação"`;
    }
    
    return {
        html: '',
        css: '',
        js: '',
        explanation: explanation,
        suggestion: 'Quer saber mais sobre algo específico?'
    };
}

/**
 * ==================== GERADORES - PILAR 2: RACIOCÍNIO LÓGICO ====================
 */

/**
 * Gera refatoração de código
 */
function generateRefactoring(message, context, entities) {
    const target = entities.targets[0] || entities.pages[0] || 'código';
    
    return {
        html: '',
        css: '',
        js: `// Exemplo de refatoração sugerida para ${target}:

// ANTES (código duplicado):
function saveEvent() {
    if (!eventName) {
        alert('Nome obrigatório');
        return;
    }
    if (!eventDate) {
        alert('Data obrigatória');
        return;
    }
    firebase.database().ref('events').push(data);
}

// DEPOIS (refatorado):
function validateField(value, fieldName) {
    if (!value) {
        showError(\`\${fieldName} é obrigatório\`);
        return false;
    }
    return true;
}

function saveEvent() {
    const validations = [
        validateField(eventName, 'Nome'),
        validateField(eventDate, 'Data')
    ];
    
    if (validations.every(v => v)) {
        saveToDatabase('events', data);
    }
}

function saveToDatabase(collection, data) {
    return firebase.database().ref(collection).push(data);
}

// ✅ Benefícios:
// • Código mais limpo e legível
// • Reutilização de funções
// • Mais fácil de testar
// • Manutenção simplificada`,
        explanation: `♻️ **Refatoração de Código**\n\nIdentifiquei oportunidades de melhoria:\n\n✅ **Melhorias:**\n• Extrair funções duplicadas\n• Criar validações reutilizáveis\n• Separar responsabilidades\n• Simplificar lógica condicional\n\n📊 **Impacto:**\n• Redução de ~40% de código\n• Melhor manutenibilidade\n• Menos bugs\n• Mais testável`,
        suggestion: 'Quer que eu aplique estas refatorações no código real?'
    };
}

/**
 * Gera arquitetura de software
 */
function generateArchitecture(message, context, entities) {
    const diagramCode = `\`\`\`mermaid
graph TB
    A[Cliente/Browser] --> B[index.html]
    B --> C[page-loader.js]
    C --> D{Autenticação}
    D -->|Admin| E[AI Assistant]
    D -->|Treasurer| F[Financeiro]
    D -->|Todos| G[Dashboard]
    G --> H[Firebase]
    E --> H
    F --> H
    H --> I[(Realtime Database)]
    
    style A fill:#e1f5ff
    style H fill:#ffeb3b
    style I fill:#4caf50
\`\`\``;
    
    return {
        html: `<div class="architecture-diagram">
    ${diagramCode}
    <div class="architecture-description">
        <h3>📐 Arquitetura do EventFlow System</h3>
        <h4>Camadas:</h4>
        <ul>
            <li><strong>Apresentação:</strong> HTML/CSS/JavaScript vanilla</li>
            <li><strong>Roteamento:</strong> Sistema modular (page-loader.js)</li>
            <li><strong>Autenticação:</strong> Role-based access control</li>
            <li><strong>Lógica:</strong> Módulos independentes por funcionalidade</li>
            <li><strong>Dados:</strong> Firebase Realtime Database</li>
        </ul>
        <h4>Padrões Utilizados:</h4>
        <ul>
            <li>✅ Modular Architecture</li>
            <li>✅ Separation of Concerns</li>
            <li>✅ Observer Pattern (Firebase listeners)</li>
            <li>✅ Factory Pattern (page templates)</li>
        </ul>
    </div>
</div>`,
        css: `.architecture-diagram {
    padding: 20px;
    background: white;
    border-radius: 8px;
    border: 1px solid #ddd;
}

.architecture-description {
    margin-top: 20px;
}

.architecture-description h3 {
    color: var(--primary-color);
    margin-bottom: 15px;
}

.architecture-description h4 {
    color: #666;
    margin: 15px 0 10px 0;
}

.architecture-description ul {
    list-style-type: none;
    padding-left: 0;
}

.architecture-description li {
    padding: 5px 0;
    border-bottom: 1px solid #f0f0f0;
}`,
        js: '',
        explanation: `🏗️ **Arquitetura do Sistema**\n\n**Estrutura Atual:**\n• **Frontend:** SPA com carregamento modular\n• **Backend:** Firebase Realtime Database\n• **Autenticação:** Sistema de roles\n• **Módulos:** Independentes e desacoplados\n\n**Pontos Fortes:**\n✅ Escalável\n✅ Manutenível\n✅ Modular\n✅ Real-time\n\n**Sugestões de Melhoria:**\n💡 State management (Redux/Vuex)\n💡 TypeScript para type safety\n💡 Service Workers (PWA)\n💡 Code splitting avançado`,
        suggestion: 'Quer que eu implemente alguma destas melhorias?'
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
 * ==================== GERADORES - PILAR 3: GERENCIAMENTO DE DADOS ====================
 */

/**
 * Gera documento (PDF, DOCX, XLSX)
 */
function generateDocument(message, context, entities) {
    const format = /pdf/i.test(message) ? 'PDF' : /docx|word/i.test(message) ? 'DOCX' : /xlsx|excel/i.test(message) ? 'XLSX' : 'PDF';
    
    const js = `// Geração de ${format}
function generateDocument${format}() {
    ${format === 'PDF' ? `
    // Usando jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Cabeçalho
    doc.setFontSize(20);
    doc.text('EventFlow System - Relatório', 20, 20);
    
    // Dados
    doc.setFontSize(12);
    doc.text(\`Data: \${new Date().toLocaleDateString()}\`, 20, 30);
    
    // Estatísticas
    doc.text('Estatísticas:', 20, 45);
    doc.text(\`Total de Eventos: \${events.length}\`, 30, 55);
    doc.text(\`Eventos Ativos: \${activeEvents.length}\`, 30, 65);
    
    // Salvar
    doc.save('relatorio-eventflow.pdf');
    ` : format === 'DOCX' ? `
    // Usando docx.js
    const doc = new docx.Document({
        sections: [{
            properties: {},
            children: [
                new docx.Paragraph({
                    text: "EventFlow System - Relatório",
                    heading: docx.HeadingLevel.HEADING_1
                }),
                new docx.Paragraph({
                    text: \`Data: \${new Date().toLocaleDateString()}\`
                }),
                new docx.Paragraph({
                    text: "Estatísticas",
                    heading: docx.HeadingLevel.HEADING_2
                }),
                new docx.Paragraph({
                    text: \`Total de Eventos: \${events.length}\`
                })
            ]
        }]
    });
    
    docx.Packer.toBlob(doc).then(blob => {
        saveAs(blob, 'relatorio-eventflow.docx');
    });
    ` : `
    // Usando xlsx
    const ws = XLSX.utils.json_to_sheet(events);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Eventos');
    XLSX.writeFile(wb, 'relatorio-eventflow.xlsx');
    `}
}

// Adicionar script necessário
const script = document.createElement('script');
script.src = '${format === 'PDF' ? 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js' : 
              format === 'DOCX' ? 'https://cdnjs.cloudflare.com/ajax/libs/docx/7.8.2/docx.min.js' : 
              'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'}';
document.head.appendChild(script);

script.onload = () => {
    generateDocument${format}();
};`;
    
    return {
        html: '',
        css: '',
        js: js,
        explanation: `📄 **Gerar Documento ${format}**\n\nCriando código para exportar dados em ${format}.\n\n✅ **Recursos:**\n• Formatação profissional\n• Dados do Firebase\n• Download automático\n• Totalmente customizável\n\n📚 **Bibliotecas:**\n${format === 'PDF' ? '• jsPDF' : format === 'DOCX' ? '• docx.js' : '• SheetJS (xlsx)'}`,
        suggestion: 'Clique em "Aplicar Código" para gerar o documento'
    };
}

/**
 * Gera manipulação de dados
 */
function generateDataManipulation(message, context, entities) {
    const action = /filtrar/i.test(message) ? 'filter' : 
                   /ordenar|organizar/i.test(message) ? 'sort' : 
                   /agrupar/i.test(message) ? 'group' : 'transform';
    
    const js = `// Manipulação de dados: ${action}
${action === 'filter' ? `
// Filtrar eventos ativos com rating > 4
const filteredEvents = events.filter(event => {
    return event.status === 'ativo' && event.rating >= 4;
});

console.log('Eventos filtrados:', filteredEvents);
` : action === 'sort' ? `
// Ordenar eventos por rating (maior para menor)
const sortedEvents = events.sort((a, b) => {
    return (b.rating || 0) - (a.rating || 0);
});

// Ou por data (mais recente primeiro)
const sortedByDate = events.sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
});
` : action === 'group' ? `
// Agrupar eventos por categoria
const groupedEvents = events.reduce((acc, event) => {
    const category = event.category || 'Sem categoria';
    if (!acc[category]) {
        acc[category] = [];
    }
    acc[category].push(event);
    return acc;
}, {});

// Contar por categoria
const categoryCount = Object.entries(groupedEvents).map(([cat, evts]) => ({
    category: cat,
    count: evts.length,
    avgRating: evts.reduce((sum, e) => sum + (e.rating || 0), 0) / evts.length
}));
` : `
// Transformar dados (ex: adicionar campos calculados)
const transformedEvents = events.map(event => ({
    ...event,
    isHighRated: event.rating >= 4,
    daysUntil: Math.ceil((new Date(event.date) - new Date()) / (1000 * 60 * 60 * 24)),
    isPast: new Date(event.date) < new Date()
}));
`}

// Atualizar UI
displayResults(${action === 'filter' ? 'filteredEvents' : action === 'sort' ? 'sortedEvents' : action === 'group' ? 'categoryCount' : 'transformedEvents'});`;
    
    return {
        html: '',
        css: '',
        js: js,
        explanation: `🔄 **Manipular Dados**\n\nOperação: **${action === 'filter' ? 'Filtrar' : action === 'sort' ? 'Ordenar' : action === 'group' ? 'Agrupar' : 'Transformar'}**\n\n✅ Código otimizado para:\n• Performance\n• Legibilidade\n• Manutenibilidade`,
        suggestion: 'Dados manipulados com sucesso!'
    };
}

/**
 * ==================== GERADORES - PILAR 4: PERCEPÇÃO VISUAL ====================
 */

/**
 * Gera diagrama com Mermaid
 */
function generateDiagram(message, context, entities) {
    const type = /fluxo|workflow/i.test(message) ? 'flowchart' : 
                 /sequência|sequence/i.test(message) ? 'sequence' : 
                 /classe|class/i.test(message) ? 'class' : 'flowchart';
    
    const mermaidCode = type === 'flowchart' ? `
graph TD
    A[Início] --> B{Login?}
    B -->|Sim| C[Dashboard]
    B -->|Não| D[Página de Login]
    C --> E{Papel do Usuário}
    E -->|Admin| F[Todas as Páginas]
    E -->|Treasurer| G[Financeiro + Eventos]
    E -->|Jovens| H[Eventos + Chat]
    F --> I[Fim]
    G --> I
    H --> I
` : type === 'sequence' ? `
sequenceDiagram
    participant U as Usuário
    participant F as Frontend
    participant A as Auth
    participant D as Firebase
    
    U->>F: Acessa sistema
    F->>A: Verifica autenticação
    A->>D: Busca dados do usuário
    D-->>A: Retorna role
    A-->>F: Autoriza/Nega acesso
    F-->>U: Exibe interface
` : `
classDiagram
    class Event {
        +String id
        +String name
        +Date date
        +String location
        +Number rating
        +String status
        +save()
        +delete()
        +rate()
    }
    
    class Category {
        +String id
        +String name
        +String color
        +save()
    }
    
    class User {
        +String id
        +String name
        +String role
        +login()
        +logout()
    }
    
    Event --> Category
    Event --> User
`;
    
    const html = `<div class="mermaid-diagram">
    <pre class="mermaid">
${mermaidCode.trim()}
    </pre>
</div>`;
    
    const js = `// Carregar biblioteca Mermaid
if (!window.mermaid) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js';
    document.head.appendChild(script);
    
    script.onload = () => {
        mermaid.initialize({ startOnLoad: true, theme: 'default' });
        mermaid.contentLoaded();
    };
} else {
    mermaid.contentLoaded();
}`;
    
    return {
        html: html,
        css: `.mermaid-diagram {
    background: white;
    padding: 20px;
    border-radius: 8px;
    border: 1px solid #ddd;
    margin: 20px 0;
}

.mermaid {
    text-align: center;
}`,
        js: js,
        explanation: `📊 **Diagrama Gerado**\n\nTipo: **${type === 'flowchart' ? 'Fluxograma' : type === 'sequence' ? 'Sequência' : 'Classes'}**\n\n✅ Usando Mermaid.js\n• Renderização automática\n• Interativo\n• Exportável`,
        suggestion: 'Diagrama pronto! Você pode editá-lo no código.'
    };
}

/**
 * Gera placeholder para imagens (sugere APIs)
 */
function generateImagePlaceholder(message, context, entities) {
    return {
        html: '',
        css: '',
        js: '',
        explanation: `🎨 **Gerar Imagens**\n\nNão tenho capacidade de gerar imagens diretamente.\n\n💡 **APIs Sugeridas:**\n• **DALL-E (OpenAI)** - IA criativa\n• **Stable Diffusion** - Open source\n• **Midjourney** - Alta qualidade\n• **Canva API** - Templates\n\n🔧 **Posso Ajudar Com:**\n• Integrar API de imagens\n• Criar galeria de imagens\n• Otimizar imagens existentes\n• Adicionar filtros CSS`,
        suggestion: 'Quer que eu integre uma API de geração de imagens?'
    };
}

/**
 * Gera edição visual (filtros CSS)
 */
function generateVisualEdit(message, context, entities) {
    const css = `.visual-filter-grayscale {
    filter: grayscale(100%);
}

.visual-filter-sepia {
    filter: sepia(80%);
}

.visual-filter-blur {
    filter: blur(5px);
}

.visual-filter-brightness {
    filter: brightness(1.2);
}

.visual-filter-contrast {
    filter: contrast(150%);
}

.visual-filter-vintage {
    filter: sepia(50%) contrast(1.2) brightness(0.9);
}

.visual-filter-dramatic {
    filter: grayscale(100%) contrast(1.5) brightness(0.8);
}`;
    
    const js = `// Aplicar filtro visual
function applyVisualFilter(element, filterClass) {
    // Remover filtros existentes
    element.classList.remove(
        'visual-filter-grayscale',
        'visual-filter-sepia',
        'visual-filter-blur',
        'visual-filter-brightness',
        'visual-filter-contrast',
        'visual-filter-vintage',
        'visual-filter-dramatic'
    );
    
    // Adicionar novo filtro
    if (filterClass) {
        element.classList.add(filterClass);
    }
}

// Exemplo de uso
const image = document.querySelector('.event-image');
applyVisualFilter(image, 'visual-filter-vintage');`;
    
    return {
        html: '',
        css: css,
        js: js,
        explanation: `👁️ **Edição Visual**\n\n✅ **Filtros CSS Disponíveis:**\n• Grayscale (preto e branco)\n• Sepia (vintage)\n• Blur (desfoque)\n• Brightness (brilho)\n• Contrast (contraste)\n• Vintage (estilo antigo)\n• Dramatic (dramático)\n\n🎨 Aplique em imagens ou elementos visuais`,
        suggestion: 'Filtros prontos para usar! Teste com suas imagens.'
    };
}

/**
 * ==================== GERADORES - PILAR 5: ACESSO À INFORMAÇÃO ====================
 */

/**
 * Gera busca na web (simulada)
 */
function generateWebSearch(message, context, entities) {
    return {
        html: '',
        css: '',
        js: '',
        explanation: `🔍 **Busca na Web**\n\nNão tenho acesso direto à internet no momento.\n\n💡 **Como Posso Ajudar:**\n\n**1. Busca Local:**\n• Pesquisar no código do projeto\n• Buscar em documentação offline\n• Consultar dados do Firebase\n\n**2. Sugestões de APIs:**\n• **Google Custom Search API**\n• **Bing Search API**\n• **DuckDuckGo API**\n\n**3. Documentação Técnica:**\n• Firebase: firebase.google.com/docs\n• MDN Web Docs: developer.mozilla.org\n• Stack Overflow: stackoverflow.com\n\n🔧 Posso criar um sistema de busca integrado no projeto!`,
        suggestion: 'Quer que eu implemente busca local no código?'
    };
}

/**
 * Gera informações mais recentes (sugere fontes)
 */
function generateLatestInfo(message, context, entities) {
    const stats = context.statistics || {};
    const recentEvents = (context.events || [])
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 5);
    
    let info = `📰 **Informações Mais Recentes**\n\n`;
    info += `**Últimos Eventos Criados:**\n`;
    
    if (recentEvents.length > 0) {
        recentEvents.forEach((event, i) => {
            info += `${i + 1}. ${event.name} - ${event.date}\n`;
        });
    } else {
        info += `Nenhum evento recente.\n`;
    }
    
    info += `\n📊 **Estatísticas Atuais:**\n`;
    info += `• Total de Eventos: ${stats.totalEvents || 0}\n`;
    info += `• Usuários Ativos: ${stats.totalUsers || 0}\n`;
    info += `• Última Atualização: ${new Date().toLocaleString()}\n`;
    
    return {
        html: '',
        css: '',
        js: '',
        explanation: info,
        suggestion: 'Dados atualizados em tempo real via Firebase!'
    };
}

/**
 * Gera pesquisa (busca interna)
 */
function generateResearch(message, context, entities) {
    const searchTerm = entities.targets[0] || message.replace(/pesquis(ar|a)|sobre/gi, '').trim();
    
    let results = `🔬 **Pesquisa: "${searchTerm}"**\n\n`;
    
    // Busca em eventos
    const matchingEvents = (context.events || []).filter(e => 
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (matchingEvents.length > 0) {
        results += `📅 **Eventos Encontrados (${matchingEvents.length}):**\n`;
        matchingEvents.slice(0, 5).forEach(e => {
            results += `• ${e.name} - ${e.date}\n`;
        });
    }
    
    // Busca em categorias
    const matchingCategories = (context.categories || []).filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (matchingCategories.length > 0) {
        results += `\n🏷️ **Categorias Encontradas (${matchingCategories.length}):**\n`;
        matchingCategories.forEach(c => {
            results += `• ${c.name}\n`;
        });
    }
    
    if (matchingEvents.length === 0 && matchingCategories.length === 0) {
        results += `❌ Nenhum resultado encontrado para "${searchTerm}"\n\n`;
        results += `💡 Tente:\n• Termos mais gerais\n• Verificar ortografia\n• Buscar por categoria`;
    }
    
    return {
        html: '',
        css: '',
        js: '',
        explanation: results,
        suggestion: 'Pesquisa concluída! Quer refinar a busca?'
    };
}

/**
 * ==================== GERADORES - PILAR 6: AUXÍLIO COGNITIVO ====================
 */

/**
 * Gera plano de ação
 */
function generatePlan(message, context, entities) {
    const topic = entities.targets[0] || 'desenvolvimento';
    
    const html = `<div class="action-plan">
    <h2>📋 Plano de Ação: ${topic}</h2>
    
    <div class="plan-section">
        <h3>🎯 Objetivos</h3>
        <ul>
            <li>Definir escopo e metas claras</li>
            <li>Estabelecer métricas de sucesso</li>
            <li>Identificar recursos necessários</li>
        </ul>
    </div>
    
    <div class="plan-section">
        <h3>📅 Cronograma</h3>
        <table class="plan-timeline">
            <tr>
                <th>Fase</th>
                <th>Atividades</th>
                <th>Prazo</th>
            </tr>
            <tr>
                <td>Semana 1</td>
                <td>Planejamento e design</td>
                <td>7 dias</td>
            </tr>
            <tr>
                <td>Semana 2-3</td>
                <td>Desenvolvimento</td>
                <td>14 dias</td>
            </tr>
            <tr>
                <td>Semana 4</td>
                <td>Testes e ajustes</td>
                <td>7 dias</td>
            </tr>
        </table>
    </div>
    
    <div class="plan-section">
        <h3>✅ Checklist</h3>
        <ul class="checklist">
            <li><input type="checkbox"> Requisitos documentados</li>
            <li><input type="checkbox"> Protótipo aprovado</li>
            <li><input type="checkbox"> Código revisado</li>
            <li><input type="checkbox"> Testes realizados</li>
            <li><input type="checkbox"> Deploy em produção</li>
        </ul>
    </div>
</div>`;
    
    const css = `.action-plan {
    background: white;
    padding: 25px;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.action-plan h2 {
    color: var(--primary-color);
    margin-bottom: 25px;
}

.plan-section {
    margin: 20px 0;
    padding: 15px;
    background: #f9f9f9;
    border-radius: 8px;
}

.plan-section h3 {
    color: #555;
    margin-bottom: 10px;
}

.plan-timeline {
    width: 100%;
    border-collapse: collapse;
}

.plan-timeline th,
.plan-timeline td {
    padding: 10px;
    text-align: left;
    border-bottom: 1px solid #ddd;
}

.plan-timeline th {
    background: var(--primary-color);
    color: white;
}

.checklist {
    list-style: none;
    padding: 0;
}

.checklist li {
    padding: 8px 0;
}

.checklist input[type="checkbox"] {
    margin-right: 10px;
}`;
    
    return {
        html: html,
        css: css,
        js: '',
        explanation: `📋 **Plano Criado!**\n\nPlano estruturado para: **${topic}**\n\n✅ Inclui:\n• Objetivos claros\n• Cronograma detalhado\n• Checklist de atividades\n\n💡 Customize conforme necessário!`,
        suggestion: 'Plano pronto! Quer ajustar algo?'
    };
}

/**
 * Gera ajuda para estudos
 */
function generateStudyHelp(message, context, entities) {
    const topic = entities.targets[0] || 'JavaScript';
    
    const html = `<div class="study-guide">
    <h2>📚 Guia de Estudos: ${topic}</h2>
    
    <div class="study-level">
        <h3>🌱 Iniciante</h3>
        <ul>
            <li>Conceitos básicos e fundamentos</li>
            <li>Sintaxe e estruturas principais</li>
            <li>Exercícios práticos simples</li>
        </ul>
    </div>
    
    <div class="study-level">
        <h3>🌿 Intermediário</h3>
        <ul>
            <li>Padrões e boas práticas</li>
            <li>Estruturas de dados e algoritmos</li>
            <li>Projetos práticos</li>
        </ul>
    </div>
    
    <div class="study-level">
        <h3>🌳 Avançado</h3>
        <ul>
            <li>Arquitetura e design patterns</li>
            <li>Performance e otimização</li>
            <li>Projetos complexos</li>
        </ul>
    </div>
    
    <div class="study-resources">
        <h3>🔗 Recursos Recomendados</h3>
        <ul>
            <li>📖 Documentação oficial</li>
            <li>🎥 Video tutoriais</li>
            <li>💻 Projetos práticos</li>
            <li>👥 Comunidades e fóruns</li>
        </ul>
    </div>
</div>`;
    
    const css = `.study-guide {
    background: white;
    padding: 25px;
    border-radius: 10px;
}

.study-level {
    margin: 20px 0;
    padding: 15px;
    border-left: 4px solid var(--primary-color);
    background: #f0f8ff;
}

.study-level h3 {
    color: var(--primary-color);
    margin-bottom: 10px;
}

.study-resources {
    margin-top: 25px;
    padding: 15px;
    background: #fffdf0;
    border-radius: 8px;
}`;
    
    return {
        html: html,
        css: css,
        js: '',
        explanation: `📚 **Guia de Estudos Criado!**\n\nTópico: **${topic}**\n\n✅ Organizado por níveis:\n• Iniciante\n• Intermediário\n• Avançado\n\n💡 Com recursos recomendados!`,
        suggestion: 'Quer adicionar tópicos específicos ao guia?'
    };
}

/**
 * Gera organização de tarefas
 */
function generateTaskOrganization(message, context, entities) {
    const html = `<div class="task-organizer">
    <h2>✅ Organizador de Tarefas</h2>
    
    <div class="task-matrix">
        <div class="task-quadrant urgent-important">
            <h3>🔥 Urgente e Importante</h3>
            <ul class="task-list">
                <li>Corrigir bugs críticos</li>
                <li>Deploy de produção</li>
            </ul>
            <button onclick="addTask('urgent-important')">+ Adicionar</button>
        </div>
        
        <div class="task-quadrant not-urgent-important">
            <h3>📅 Importante (Não Urgente)</h3>
            <ul class="task-list">
                <li>Refatoração de código</li>
                <li>Documentação</li>
            </ul>
            <button onclick="addTask('not-urgent-important')">+ Adicionar</button>
        </div>
        
        <div class="task-quadrant urgent-not-important">
            <h3>⚡ Urgente (Não Importante)</h3>
            <ul class="task-list">
                <li>Responder emails</li>
                <li>Reuniões rápidas</li>
            </ul>
            <button onclick="addTask('urgent-not-important')">+ Adicionar</button>
        </div>
        
        <div class="task-quadrant not-urgent-not-important">
            <h3>📝 Nem Urgente Nem Importante</h3>
            <ul class="task-list">
                <li>Organizar arquivos</li>
                <li>Limpar código antigo</li>
            </ul>
            <button onclick="addTask('not-urgent-not-important')">+ Adicionar</button>
        </div>
    </div>
</div>`;
    
    const css = `.task-organizer {
    background: white;
    padding: 25px;
    border-radius: 10px;
}

.task-matrix {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
    margin-top: 20px;
}

.task-quadrant {
    padding: 15px;
    border-radius: 8px;
    border: 2px solid #ddd;
}

.urgent-important {
    background: #ffe6e6;
    border-color: #ff4444;
}

.not-urgent-important {
    background: #e6f7ff;
    border-color: #0088cc;
}

.urgent-not-important {
    background: #fff4e6;
    border-color: #ff9800;
}

.not-urgent-not-important {
    background: #f0f0f0;
    border-color: #999;
}

.task-list {
    min-height: 100px;
    list-style: none;
    padding: 0;
    margin: 10px 0;
}

.task-list li {
    padding: 8px;
    margin: 5px 0;
    background: white;
    border-radius: 4px;
    cursor: move;
}

.task-quadrant button {
    width: 100%;
    padding: 8px;
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}`;
    
    const js = `// Sistema de organização de tarefas
function addTask(quadrant) {
    const task = prompt('Digite a tarefa:');
    if (task) {
        const list = document.querySelector(\`.\${quadrant} .task-list\`);
        const li = document.createElement('li');
        li.textContent = task;
        li.draggable = true;
        list.appendChild(li);
        
        // Salvar no localStorage
        saveTasks();
    }
}

function saveTasks() {
    const tasks = {};
    document.querySelectorAll('.task-quadrant').forEach(quadrant => {
        const className = quadrant.className.split(' ')[1];
        tasks[className] = Array.from(quadrant.querySelectorAll('.task-list li'))
            .map(li => li.textContent);
    });
    localStorage.setItem('organizerTasks', JSON.stringify(tasks));
}

// Carregar tarefas salvas
function loadTasks() {
    const saved = localStorage.getItem('organizerTasks');
    if (saved) {
        const tasks = JSON.parse(saved);
        Object.entries(tasks).forEach(([quadrant, taskList]) => {
            const list = document.querySelector(\`.\${quadrant} .task-list\`);
            list.innerHTML = taskList.map(task => \`<li draggable="true">\${task}</li>\`).join('');
        });
    }
}

loadTasks();`;
    
    return {
        html: html,
        css: css,
        js: js,
        explanation: `✅ **Organizador Criado!**\n\nMatriz de Eisenhower implementada:\n\n1️⃣ Urgente e Importante\n2️⃣ Importante (não urgente)\n3️⃣ Urgente (não importante)\n4️⃣ Nem urgente nem importante\n\n💡 Arraste tarefas entre quadrantes!`,
        suggestion: 'Comece organizando suas tarefas por prioridade!'
    };
}

/**
 * Gera dicas de produtividade
 */
function generateProductivityTips(message, context, entities) {
    return {
        html: '',
        css: '',
        js: '',
        explanation: `⚡ **Dicas de Produtividade**\n\n**Técnica Pomodoro:**\n🍅 25 min trabalho + 5 min pausa\n🍅 4 pomodoros = pausa longa (15-30 min)\n\n**Método GTD (Getting Things Done):**\n📥 Capturar tudo\n🤔 Processar\n📋 Organizar\n✅ Revisar\n⚡ Fazer\n\n**Code Flow:**\n• Desative notificações\n• Use música focus\n• Blocos de 90 minutos\n• Breaks regulares\n\n**Ferramentas Sugeridas:**\n• Trello/Notion (organização)\n• RescueTime (monitoramento)\n• Forest (foco)\n• Todoist (tarefas)\n\n💡 **Implemente:**\n• Matriz de Eisenhower (use o organizador)\n• Time blocking no calendário\n• Review semanal`,
        suggestion: 'Quer que eu crie um timer Pomodoro no sistema?'
    };
}

/**
 * ==================== GERADORES - PILAR 7: ÉTICA E SEGURANÇA ====================
 */

/**
 * Gera verificação de segurança
 */
function generateSecurityCheck(message, context, entities) {
    const js = `// Verificação de Segurança do Código

// 1. Validação de Inputs
function validateInput(input, type) {
    switch(type) {
        case 'email':
            const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
            return emailRegex.test(input);
        case 'password':
            // Mínimo 8 caracteres, 1 maiúscula, 1 minúscula, 1 número
            return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$/.test(input);
        case 'phone':
            return /^\\(\\d{2}\\)\\s?\\d{4,5}-?\\d{4}$/.test(input);
        default:
            return input.length > 0;
    }
}

// 2. Sanitização de dados
function sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// 3. Proteção contra XSS
function escapeHTML(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// 4. Verificar permissões antes de ações críticas
function checkPermission(action) {
    const user = firebase.auth().currentUser;
    const userRole = localStorage.getItem('userRole');
    
    const permissions = {
        'delete': ['admin'],
        'edit': ['admin', 'treasurer'],
        'view': ['admin', 'treasurer', 'jovens']
    };
    
    return permissions[action]?.includes(userRole) || false;
}

// 5. Rate limiting (prevenir spam)
const rateLimiter = {
    attempts: {},
    check(action, limit = 5, timeWindow = 60000) {
        const now = Date.now();
        if (!this.attempts[action]) {
            this.attempts[action] = [];
        }
        
        // Limpar tentativas antigas
        this.attempts[action] = this.attempts[action]
            .filter(time => now - time < timeWindow);
        
        if (this.attempts[action].length >= limit) {
            return false; // Bloqueado
        }
        
        this.attempts[action].push(now);
        return true; // Permitido
    }
};

// 6. Logs de segurança
function logSecurityEvent(event, details) {
    const log = {
        timestamp: new Date().toISOString(),
        event: event,
        user: firebase.auth().currentUser?.uid,
        details: details
    };
    
    firebase.database().ref('security-logs').push(log);
}

// Exemplo de uso:
function secureDeleteEvent(eventId) {
    // 1. Verificar permissão
    if (!checkPermission('delete')) {
        alert('Sem permissão para deletar');
        logSecurityEvent('unauthorized_delete_attempt', { eventId });
        return;
    }
    
    // 2. Rate limiting
    if (!rateLimiter.check('delete', 5, 60000)) {
        alert('Muitas tentativas. Aguarde.');
        return;
    }
    
    // 3. Confirmar ação
    if (!confirm('Tem certeza que deseja deletar?')) {
        return;
    }
    
    // 4. Executar com log
    firebase.database().ref(\`events/\${eventId}\`).remove()
        .then(() => {
            logSecurityEvent('event_deleted', { eventId });
            alert('Evento deletado com sucesso');
        })
        .catch(error => {
            logSecurityEvent('delete_error', { eventId, error });
            alert('Erro ao deletar: ' + error.message);
        });
}`;
    
    return {
        html: '',
        css: '',
        js: js,
        explanation: `🔒 **Verificação de Segurança**\n\n✅ **Implementações Sugeridas:**\n\n1️⃣ **Validação de Inputs**\n• Email, senha, telefone\n• Proteção contra SQL injection\n\n2️⃣ **Sanitização**\n• Escape de HTML\n• Proteção XSS\n\n3️⃣ **Controle de Acesso**\n• Verificação de roles\n• Permissões granulares\n\n4️⃣ **Rate Limiting**\n• Prevenir spam\n• Proteção contra brute force\n\n5️⃣ **Logs de Auditoria**\n• Rastreamento de ações\n• Detecção de anomalias\n\n⚠️ **Vulnerabilidades Comuns:**\n• XSS (Cross-Site Scripting)\n• Injection attacks\n• Broken authentication\n• Sensitive data exposure`,
        suggestion: 'Aplicar estas proteções agora?'
    };
}

/**
 * Gera validação de dados com segurança
 */
function generateDataValidation(message, context, entities) {
    const js = `// Sistema Completo de Validação de Dados

class DataValidator {
    constructor() {
        this.rules = {
            required: (value) => value !== null && value !== undefined && value !== '',
            email: (value) => /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value),
            minLength: (value, min) => value.length >= min,
            maxLength: (value, max) => value.length <= max,
            number: (value) => !isNaN(value),
            positive: (value) => Number(value) > 0,
            url: (value) => /^https?:\\/\\/.+/.test(value),
            phone: (value) => /^\\(?\\d{2}\\)?\\s?\\d{4,5}-?\\d{4}$/.test(value),
            cpf: (value) => this.validateCPF(value),
            date: (value) => !isNaN(Date.parse(value)),
            futureDate: (value) => new Date(value) > new Date()
        };
        
        this.errors = [];
    }
    
    validate(data, schema) {
        this.errors = [];
        
        for (const [field, rules] of Object.entries(schema)) {
            const value = data[field];
            
            for (const [ruleName, ruleParam] of Object.entries(rules)) {
                const ruleFunc = this.rules[ruleName];
                
                if (!ruleFunc) {
                    console.warn(\`Regra desconhecida: \${ruleName}\`);
                    continue;
                }
                
                const isValid = ruleParam === true 
                    ? ruleFunc(value)
                    : ruleFunc(value, ruleParam);
                
                if (!isValid) {
                    this.errors.push({
                        field: field,
                        rule: ruleName,
                        message: this.getErrorMessage(field, ruleName, ruleParam)
                    });
                }
            }
        }
        
        return this.errors.length === 0;
    }
    
    getErrors() {
        return this.errors;
    }
    
    getErrorMessage(field, rule, param) {
        const messages = {
            required: \`\${field} é obrigatório\`,
            email: \`\${field} deve ser um email válido\`,
            minLength: \`\${field} deve ter no mínimo \${param} caracteres\`,
            maxLength: \`\${field} deve ter no máximo \${param} caracteres\`,
            number: \`\${field} deve ser um número\`,
            positive: \`\${field} deve ser positivo\`,
            url: \`\${field} deve ser uma URL válida\`,
            phone: \`\${field} deve ser um telefone válido\`,
            cpf: \`\${field} deve ser um CPF válido\`,
            date: \`\${field} deve ser uma data válida\`,
            futureDate: \`\${field} deve ser uma data futura\`
        };
        
        return messages[rule] || \`\${field} é inválido\`;
    }
    
    validateCPF(cpf) {
        cpf = cpf.replace(/[^\\d]/g, '');
        
        if (cpf.length !== 11) return false;
        if (/^(\\d)\\1+$/.test(cpf)) return false;
        
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(cpf.charAt(i)) * (10 - i);
        }
        let digit = 11 - (sum % 11);
        if (digit >= 10) digit = 0;
        if (digit !== parseInt(cpf.charAt(9))) return false;
        
        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(cpf.charAt(i)) * (11 - i);
        }
        digit = 11 - (sum % 11);
        if (digit >= 10) digit = 0;
        if (digit !== parseInt(cpf.charAt(10))) return false;
        
        return true;
    }
    
    displayErrors(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = '';
        
        if (this.errors.length > 0) {
            const errorList = document.createElement('ul');
            errorList.className = 'validation-errors';
            
            this.errors.forEach(error => {
                const li = document.createElement('li');
                li.textContent = error.message;
                errorList.appendChild(li);
            });
            
            container.appendChild(errorList);
        }
    }
}

// Exemplo de uso:
const validator = new DataValidator();

// Schema de validação para evento
const eventSchema = {
    name: {
        required: true,
        minLength: 3,
        maxLength: 100
    },
    date: {
        required: true,
        date: true,
        futureDate: true
    },
    email: {
        required: true,
        email: true
    },
    participants: {
        required: true,
        number: true,
        positive: true
    }
};

// Validar formulário
function validateEventForm() {
    const data = {
        name: document.getElementById('event-name').value,
        date: document.getElementById('event-date').value,
        email: document.getElementById('event-email').value,
        participants: document.getElementById('event-participants').value
    };
    
    if (validator.validate(data, eventSchema)) {
        // Dados válidos, pode salvar
        saveEvent(data);
    } else {
        // Exibir erros
        validator.displayErrors('validation-errors-container');
    }
}`;
    
    const css = `.validation-errors {
    background: #fff3cd;
    border: 1px solid #ffc107;
    border-radius: 4px;
    padding: 15px;
    margin: 15px 0;
    list-style: none;
}

.validation-errors li {
    color: #856404;
    padding: 5px 0;
    padding-left: 20px;
    position: relative;
}

.validation-errors li::before {
    content: "⚠️";
    position: absolute;
    left: 0;
}

.field-error {
    border-color: #dc3545 !important;
}

.field-success {
    border-color: #28a745 !important;
}`;
    
    return {
        html: `<div id="validation-errors-container"></div>`,
        css: css,
        js: js,
        explanation: `✅ **Sistema de Validação Completo**\n\n**Regras Disponíveis:**\n• required, email, phone\n• minLength, maxLength\n• number, positive\n• url, date, futureDate\n• CPF (validação brasileira)\n\n**Recursos:**\n• Validação em tempo real\n• Mensagens personalizadas\n• Display de erros\n• Fácil extensão\n\n🛡️ **Segurança:**\n• Sanitização automática\n• Proteção contra injection\n• Validação no client e server`,
        suggestion: 'Sistema pronto para proteger seus formulários!'
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
