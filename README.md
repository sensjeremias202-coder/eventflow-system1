```markdown
# EventFlow - Sistema de Agendamento de Eventos

Sistema completo de agendamento e gerenciamento de eventos com funcionalidades para administradores e usuários comuns.

## 🚀 Funcionalidades

### Para Administradores
- **Dashboard** com estatísticas e gráficos de análise
- **Gerenciamento de Eventos** (criar, editar, excluir)
- **Gerenciamento de Usuários** (criar, editar, excluir)
- **Gerenciamento de Categorias** (criar, editar, excluir)
- **Chat** com usuários comuns
- **Análise de Comentários** em forma de gráficos

### Para Usuários Comuns
- **Visualização de Eventos**
- **Avaliação e Comentários** em eventos
- **Chat** com administradores
- **Meus Eventos** - visualização personalizada

## 👥 Como Usar

### Login de Teste

**Administrador:**
- E-mail: `admin@eventflow.com`
- Senha: `admin123`

**Usuário Comum:**
- E-mail: `joao@email.com`
- Senha: `123456`

### Funcionalidades Principais

1. **Dashboard**: Visualize estatísticas e análises dos comentários
2. **Eventos**: Veja todos os eventos disponíveis
3. **Meus Eventos**: Visualize eventos que você avaliou (apenas usuários comuns)
4. **Chat**: Comunique-se com outros usuários
5. **Usuários** (apenas admin): Gerencie usuários do sistema
6. **Categorias** (apenas admin): Gerencie categorias de eventos

## 📁 Estrutura de Arquivos

```

## 🛠 Correção Recente

Foi identificada e corrigida uma condição que impedia a tela principal de ser exibida após o login.

- Causa: havia uma definição duplicada da função `showApp()` em `js/app.js` que sobrescrevia a implementação correta presente em `js/auth.js`. Como `app.js` é carregado depois de `auth.js`, a versão vazia estava sendo executada, deixando a aplicação escondida.
- Correção aplicada: removida a definição duplicada de `showApp()` em `js/app.js` e adicionada uma chamada a `setupLogout()` dentro de `showApp()` em `js/auth.js` para garantir que o botão de logout seja configurado após o login.

## ✅ Como testar localmente

1. Abra o arquivo `index.html` no navegador (duplo-clique ou via PowerShell):

```powershell
start .\index.html
```

2. Faça login com as credenciais de teste (veja seção acima).
3. Após o login, a área principal (`#app`) deve aparecer e o nome do usuário deve ser exibido em `#userName`.
4. Clique no botão `Sair` para confirmar que o logout retorna para a tela de login.

Se algo não funcionar, abra o Console do DevTools (F12) e verifique erros; também verifique o conteúdo de `localStorage` executando `localStorage.getItem('currentUser')` no console.

## 🔐 Credenciais de Teste (fornecidas no projeto)

- Administrador:
  - E-mail: `admin@eventflow.com`
  - Senha: `admin123`

- Usuário comum:
  - E-mail: `joao@email.com`
  - Senha: `123456`

## 🧭 Observações e próximos passos

- Recomenda-se substituir o armazenamento de senhas em texto plano por um mecanismo seguro (hash + salt) antes de usar em produção.
- Caso queira, eu posso adicionar a seção acima ao README e você pode revisar/commit/push as preferir.

```
# EventFlow - Sistema de Agendamento de Eventos

Sistema completo de agendamento e gerenciamento de eventos com funcionalidades para administradores e usuários comuns.

## 🚀 Funcionalidades

### Para Administradores
- **Dashboard** com estatísticas e gráficos de análise
- **Gerenciamento de Eventos** (criar, editar, excluir)
- **Gerenciamento de Usuários** (criar, editar, excluir)
- **Gerenciamento de Categorias** (criar, editar, excluir)
- **Chat** com usuários comuns
- **Análise de Comentários** em forma de gráficos

### Para Usuários Comuns
- **Visualização de Eventos**
- **Avaliação e Comentários** em eventos
- **Chat** com administradores
- **Meus Eventos** - visualização personalizada

## 👥 Como Usar

### Login de Teste

**Administrador:**
- E-mail: `admin@eventflow.com`
- Senha: `admin123`

**Usuário Comum:**
- E-mail: `joao@email.com`
- Senha: `123456`

### Funcionalidades Principais

1. **Dashboard**: Visualize estatísticas e análises dos comentários
2. **Eventos**: Veja todos os eventos disponíveis
3. **Meus Eventos**: Visualize eventos que você avaliou (apenas usuários comuns)
4. **Chat**: Comunique-se com outros usuários
5. **Usuários** (apenas admin): Gerencie usuários do sistema
6. **Categorias** (apenas admin): Gerencie categorias de eventos

## 📁 Estrutura de Arquivos
