# 📅 EventFlow System

Sistema completo de gerenciamento de eventos com funcionalidades para administradores e usuários.

## 🚀 Funcionalidades

### 👨‍💼 Para Administradores
- Dashboard com estatísticas e análises
- Gerenciamento de eventos (CRUD completo)
- Gerenciamento de usuários
- Gerenciamento de categorias
- Chat com usuários
- Assistente AI para análises
- Gráficos e relatórios

### 👤 Para Usuários Comuns
- Visualização de eventos
- Inscrição em eventos
- Avaliação e comentários
- Chat com administradores
- Meus eventos

## 🔐 Credenciais de Teste

**Administrador:**
- E-mail: `admin@eventflow.com`
- Senha: `admin123`

**Usuário:**
- E-mail: `joao@email.com`
- Senha: `123456`

## 📁 Estrutura do Projeto

```
eventflow-system1/
├── index.html              # Arquivo principal
├── README.md              # Este arquivo
│
├── css/                   # Estilos
│   ├── style.css         # Estilos principais
│   └── theme-christian.css # Tema personalizado
│
├── js/                    # Scripts
│   ├── app.js            # Lógica principal
│   ├── auth.js           # Autenticação
│   ├── categories.js     # Gerenciamento de categorias
│   ├── chat.js           # Sistema de chat
│   ├── dashboard.js      # Dashboard
│   ├── events.js         # Gerenciamento de eventos
│   ├── users.js          # Gerenciamento de usuários
│   ├── data.js           # Dados iniciais
│   ├── firebase-config.js # Configuração Firebase
│   ├── page-loader.js    # Carregamento modular
│   └── sync.js           # Sincronização de dados
│
├── pages/                 # Páginas modulares
│   ├── dashboard/        # Dashboard
│   ├── events/           # Eventos
│   ├── chat/             # Chat
│   ├── users/            # Usuários
│   ├── categories/       # Categorias
│   ├── profile/          # Perfil
│   ├── ai-assistant/     # Assistente AI
│   ├── graficos/         # Gráficos
│   └── financeiro/       # Financeiro
│
└── docs/                  # Documentação
    ├── CHANGELOG.md       # Histórico de mudanças
    ├── DEPLOY.md          # Guia de deploy
    ├── FIREBASE_SETUP.md  # Setup Firebase
    ├── SETUP_DATABASE.md  # Setup do banco
    ├── SISTEMA_ID.md      # Sistema de IDs
    └── README-ESTRUTURA-MODULAR.md  # Estrutura modular
```

## 🛠️ Tecnologias

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Armazenamento:** LocalStorage + Firebase Realtime Database
- **Modular:** Sistema de carregamento dinâmico de páginas
- **UI:** Font Awesome, Google Fonts (Poppins)
- **Analytics:** Firebase Analytics, Google Analytics

## 🚀 Como Usar

1. **Abrir o projeto:**
   ```powershell
   start .\index.html
   ```

2. **Fazer login** com as credenciais de teste

3. **Navegar** pelo sistema usando o menu lateral

## 🧪 Rodando em desenvolvimento (servidor local + Electron)

1. **Instale o Node.js e npm** (requerido): https://nodejs.org/

2. **Instalar dependências**
```powershell
cd "c:\Users\sensj\OneDrive\Documentos\GitHub\eventflow-system1"
npm install
```

3. **Iniciar apenas o servidor local** (http://localhost:8080):
```powershell
npm start
# or: npx http-server -p 8080 -c-1 .
```

4. **Iniciar o Electron apontando para o servidor local** (em outra janela do PowerShell):
```powershell
$env:ELECTRON_START_URL = "http://localhost:8080"
npm run start:electron
```

5. **Atalho para desenvolvedor (instala dependências, inicia servidor e Electron)**:
```powershell
npm run dev
```

> Observação: O script `npm run dev` chama um script PowerShell `scripts/start-dev.ps1` que já faz as etapas acima automaticamente no Windows.

## 📚 Documentação

Toda a documentação técnica está disponível na pasta [`docs/`](./docs/):

- **[CHANGELOG.md](./docs/CHANGELOG.md)** - Histórico de alterações
- **[DEPLOY.md](./docs/DEPLOY.md)** - Guia de implantação
- **[FIREBASE_SETUP.md](./docs/FIREBASE_SETUP.md)** - Configuração do Firebase
- **[SETUP_DATABASE.md](./docs/SETUP_DATABASE.md)** - Setup do banco de dados
- **[SISTEMA_ID.md](./docs/SISTEMA_ID.md)** - Sistema de IDs únicos
- **[README-ESTRUTURA-MODULAR.md](./docs/README-ESTRUTURA-MODULAR.md)** - Arquitetura modular

## ✨ Recursos Principais

### 📊 Dashboard Inteligente
- Estatísticas em tempo real
- Gráficos interativos
- Análise de comentários com AI
- Resumo de eventos e usuários

### 💬 Sistema de Chat
- Chat entre usuários e administradores
- Interface responsiva
- Mensagens em tempo real

### 🎯 Gerenciamento de Eventos
- Criação e edição de eventos
- Categorização
- Sistema de avaliações
- Comentários e feedback

### 🔥 Integração Firebase
- Sincronização em tempo real
- Armazenamento persistente
- Analytics integrado
- Multi-dispositivos

## 🔧 Desenvolvimento

O projeto usa uma arquitetura modular com carregamento dinâmico de páginas:

1. **Carregamento Modular** (`page-loader.js`):
   - Carrega HTML, CSS e JS dinamicamente
   - Templates inline no `index.html`
   - Inicialização automática

2. **Sincronização** (`sync.js`):
   - LocalStorage como cache
   - Firebase como backend
   - Sincronização bidirecional

3. **Autenticação** (`auth.js`):
   - Gerenciamento de sessão
   - Controle de permissões
   - Proteção de rotas

## 📝 Notas

- Sistema 100% offline-first
- Firebase opcional (funciona sem conexão)
- Dados persistem no localStorage
- Interface responsiva e moderna

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto é de uso educacional.

---

**Desenvolvido com ❤️ para gerenciamento eficiente de eventos**

## 📱 Transformando o site em App (PWA e Electron)

O projeto já possui suporte básico de PWA (manifest, service worker e registro). Abaixo as opções para gerar apps a partir do site:

- **PWA (Progressive Web App)** (recomendado): já presente, se instala no celular e funciona offline.
   - Offline fallback já foi adicionado (`offline.html`).
   - O Service Worker (`sw.js`) implementa cache e fallback.
   - O botão de instalar (`installPWA`) foi inserido no header e será exibido quando apropriado.
   - Para publicar, disponibilize via HTTPS e garanta icons adequados no manifest.

- **Electron (Desktop)**: scaffolding de exemplo incluído.
   - `electron-main.js` é o entry point para desktop.
   - `package.json` com scripts para rodar localmente `npm start` (servidor) e `npm run start:electron` (Electron).
   - Para construir instaladores, usar electron-builder com `npm run build:windows` / `build:mac` / `build:linux`.

- **Capacitor / TWA / Cordova (Mobile Nativo)**: posso adicionar instruções/integração para Android/iOS caso queira exportar um app nativo (requer Android Studio / Xcode localmente).
