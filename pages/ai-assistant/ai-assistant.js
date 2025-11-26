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
 * Processa localmente (fallback inteligente)
 */
async function processLocally(userMessage, context) {
    const lowerMsg = userMessage.toLowerCase();
    
    // Análise de intenção
    const intent = analyzeIntent(lowerMsg);
    
    // Gerar código baseado em templates e análise
    const codeGeneration = generateCodeFromIntent(intent, userMessage, context);
    
    return {
        response: codeGeneration.explanation,
        code: codeGeneration.code,
        files: codeGeneration.files
    };
}

/**
 * Coleta contexto do projeto
 */
async function collectProjectContext() {
    const context = {
        files: {},
        structure: [],
        technologies: ['HTML5', 'CSS3', 'JavaScript', 'Firebase'],
        currentPage: getCurrentPage()
    };
    
    // Ler arquivos principais do localStorage (simulação)
    try {
        // Estrutura do projeto
        context.structure = [
            'index.html',
            'css/style.css',
            'js/app.js',
            'js/auth.js',
            'js/events.js',
            'js/categories.js',
            'pages/dashboard/',
            'pages/events/',
            'pages/chat/',
            'pages/financeiro/'
        ];
        
        // Informações do usuário
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        context.user = {
            role: user.role,
            permissions: user.role === 'admin' ? 'full' : 'limited'
        };
        
    } catch (error) {
        console.error('[context] Erro ao coletar contexto:', error);
    }
    
    return context;
}

/**
 * Constrói prompt para IA
 */
function buildPrompt(userMessage, context) {
    return `Você é um assistente de código expert em desenvolvimento web.

CONTEXTO DO PROJETO:
- Tecnologias: ${context.technologies.join(', ')}
- Estrutura: ${context.structure.join(', ')}
- Página atual: ${context.currentPage}
- Permissão do usuário: ${context.user?.role || 'user'}

SOLICITAÇÃO DO USUÁRIO:
${userMessage}

INSTRUÇÕES:
1. Analise a solicitação e determine quais arquivos precisam ser modificados
2. Gere o código necessário (HTML, CSS ou JavaScript)
3. Explique as mudanças de forma clara
4. Retorne no formato:
   EXPLICAÇÃO: [explicação clara]
   ARQUIVO: [caminho do arquivo]
   CÓDIGO:
   \`\`\`[linguagem]
   [código aqui]
   \`\`\`

Seja preciso e gere código funcional que pode ser aplicado diretamente.`;
}

/**
 * Analisa intenção do usuário
 */
function analyzeIntent(message) {
    const intents = {
        changeColor: /mudar|alterar|trocar.*(cor|tema|estilo|visual)/i,
        addFeature: /adicionar|criar|implementar|fazer.*(campo|botão|funcionalidade|recurso)/i,
        fixBug: /corrigir|consertar|resolver|bug|erro|problema/i,
        modifyLayout: /mudar|alterar|modificar.*(layout|posição|tamanho|estilo)/i,
        generateReport: /gerar|criar|fazer.*(relatório|gráfico|estatística)/i,
        addValidation: /validar|validação|verificar/i,
        improvePerformance: /otimizar|melhorar|performance|velocidade/i
    };
    
    for (const [intent, pattern] of Object.entries(intents)) {
        if (pattern.test(message)) {
            return intent;
        }
    }
    
    return 'general';
}

/**
 * Gera código baseado na intenção
 */
function generateCodeFromIntent(intent, message, context) {
    const generators = {
        changeColor: generateColorChange,
        addFeature: generateFeatureAddition,
        fixBug: generateBugFix,
        modifyLayout: generateLayoutModification,
        addValidation: generateValidation
    };
    
    const generator = generators[intent] || generateGeneral;
    return generator(message, context);
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
