# 🚀 Como Executar o EventFlow System

## ⚠️ IMPORTANTE: Problema de CORS

Este projeto **NÃO PODE** ser aberto diretamente clicando duas vezes no arquivo `index.html` (protocolo `file://`), pois isso causa erros de CORS (Cross-Origin Resource Sharing).

Você **PRECISA** usar um servidor HTTP local.

---

## 🔧 Opções para Iniciar o Servidor

### **Opção 1: PowerShell Script (Recomendado)**

Execute o arquivo `start-server.ps1` no PowerShell:

```powershell
.\start-server.ps1
```

Depois abra no navegador: **http://localhost:8000/index.html**

---

### **Opção 2: VS Code - Live Server**

1. Instale a extensão **"Live Server"** no VS Code
2. Clique com botão direito no arquivo `index.html`
3. Selecione **"Open with Live Server"**

---

### **Opção 3: Python Manual**

Se você tem Python instalado:

```bash
# Python 3
python -m http.server 8000

# ou
python3 -m http.server 8000

# ou
py -m http.server 8000
```

Depois abra: **http://localhost:8000/index.html**

---

### **Opção 4: Node.js - http-server**

Se você tem Node.js instalado:

```bash
# Instalar globalmente
npm install -g http-server

# Executar
http-server -p 8000
```

Depois abra: **http://localhost:8000/index.html**

---

## 📝 Credenciais de Login

### Administrador
- **ID/Email:** `admin@eventflow.com`
- **Senha:** `admin123`

### Tesoureiro
- **ID/Email:** `tesoureiro@eventflow.com`
- **Senha:** `tesoureiro123`

### Jovens (Usuário Normal)
- **ID/Email:** `joao@email.com`
- **Senha:** `123456`

---

## ✅ Verificando se Funcionou

Após iniciar o servidor, você deve ver no console do navegador:

```
✅ Firebase inicializado com sucesso
✅ Sistema de carregamento modular inicializado
✅ Módulo de dashboard carregado
```

E **NÃO** deve ver erros de CORS como:
- ❌ "Failed to fetch"
- ❌ "Access to fetch at 'file:///' has been blocked by CORS policy"

---

## 🐛 Problemas Comuns

### Erro: "Python não encontrado"
**Solução:** Instale Python em https://www.python.org/downloads/

### Erro: "Porta 8000 já está em uso"
**Solução:** Mude a porta:
```bash
python -m http.server 8080
```
E acesse: http://localhost:8080/index.html

### Erro: "Cannot read properties of undefined"
**Solução:** Certifique-se de estar usando um servidor HTTP, não abrindo o arquivo diretamente.

---

## 🎯 Recursos do Sistema

Após fazer login, você terá acesso a:

- 📊 **Dashboard** - Estatísticas e gráficos
- 📅 **Eventos** - Criar e gerenciar eventos
- 👤 **Perfil** - Editar suas informações
- 💬 **Chat** - Mensagens em tempo real
- 📅 **Calendário** - Visualização de eventos
- 🤝 **Voluntários** - Sistema de gestão
- 📈 **Analytics** - Métricas avançadas
- 💳 **Pagamentos** - Transações
- 📹 **Streaming** - Transmissões ao vivo
- ⚙️ **Configurações** - Personalização

---

## 🔥 Firebase

O sistema está integrado com Firebase Realtime Database para sincronização em tempo real entre dispositivos.

---

**Desenvolvido com ❤️ para gerenciamento de eventos cristãos**
