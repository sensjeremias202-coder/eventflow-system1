# 🔥 Configuração do Firebase para Sincronização em Tempo Real

## 📋 Pré-requisitos
- Conta Google (gmail)
- 5 minutos para configurar

---

## 🚀 Passo 1: Criar Projeto no Firebase

1. **Acesse o Firebase Console:**
   - URL: https://console.firebase.google.com/
   - Faça login com sua conta Google

2. **Criar novo projeto:**
   - Clique em "Adicionar projeto" (Add project)
   - Nome do projeto: `eventflow-system` (ou qualquer nome)
   - Aceite os termos
   - **Desabilite** Google Analytics (não é necessário)
   - Clique em "Criar projeto"
   - Aguarde 1-2 minutos

---

## 🔧 Passo 2: Configurar Realtime Database

1. **No menu lateral, clique em "Realtime Database"**

2. **Criar banco de dados:**
   - Clique em "Criar banco de dados"
   - Localização: escolha a mais próxima (ex: `us-central1`)
   - **IMPORTANTE:** Selecione "Iniciar em modo de teste"
   - Clique em "Ativar"

3. **Configurar regras de segurança (TEMPORÁRIO - MODO TESTE):**
   ```json
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
   ```
   ⚠️ **Atenção:** Essas regras são para desenvolvimento. Para produção, veja seção de segurança abaixo.

---

## 🔑 Passo 3: Obter Credenciais

1. **Configurações do projeto:**
   - Clique no ícone de engrenagem ⚙️ ao lado de "Visão geral do projeto"
   - Selecione "Configurações do projeto"

2. **Adicionar app Web:**
   - Role até "Seus apps"
   - Clique no ícone `</>` (Web)
   - Nome do app: `EventFlow Web`
   - **NÃO** marque "Configure Firebase Hosting"
   - Clique em "Registrar app"

3. **Copiar credenciais:**
   Você verá algo assim:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyAbc123...",
     authDomain: "eventflow-abc123.firebaseapp.com",
     databaseURL: "https://eventflow-abc123-default-rtdb.firebaseio.com",
     projectId: "eventflow-abc123",
     storageBucket: "eventflow-abc123.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123def456"
   };
   ```

---

## 📝 Passo 4: Configurar o Projeto

1. **Abra o arquivo:** `js/firebase-config.js`

2. **Substitua as credenciais:**
   ```javascript
   const firebaseConfig = {
       apiKey: "COLE_SUA_API_KEY_AQUI",
       authDomain: "seu-projeto.firebaseapp.com",
       databaseURL: "https://seu-projeto-default-rtdb.firebaseio.com",
       projectId: "seu-projeto",
       storageBucket: "seu-projeto.appspot.com",
       messagingSenderId: "123456789",
       appId: "1:123456789:web:abc123"
   };
   ```

3. **Ativar Firebase:**
   ```javascript
   const USE_FIREBASE = true; // Altere de false para true
   ```

4. **Salve o arquivo**

---

## ✅ Passo 5: Testar

1. **Commit e push das mudanças:**
   ```bash
   git add .
   git commit -m "feat: configure Firebase credentials"
   git push origin main
   ```

2. **Abra o site em dois dispositivos diferentes:**
   - Computador 1: Faça login
   - Celular/Computador 2: Faça login
   
3. **Teste a sincronização:**
   - Crie um evento no Computador 1
   - Em 1-2 segundos, o evento aparece no Computador 2! 🎉

4. **Verifique os logs:**
   - Abra DevTools (F12)
   - Console deve mostrar: `[firebase] ✅ Conectado ao Firebase`

---

## 🔒 Segurança para Produção

**⚠️ IMPORTANTE:** As regras de teste permitem acesso público. Para produção, use:

```json
{
  "rules": {
    "events": {
      ".read": true,
      ".write": "auth != null"
    },
    "categories": {
      ".read": true,
      ".write": "auth != null"
    },
    "users": {
      "$uid": {
        ".read": "auth != null",
        ".write": "auth.uid == $uid || root.child('users').child(auth.uid).child('role').val() == 'admin'"
      }
    },
    "messages": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

Para implementar autenticação Firebase completa, consulte:
https://firebase.google.com/docs/auth/web/start

---

## 🐛 Solução de Problemas

### Erro: "Permission denied"
- **Causa:** Regras do Firebase muito restritivas
- **Solução:** Use as regras de teste (acima) durante desenvolvimento

### Erro: "Firebase not defined"
- **Causa:** SDK não carregou
- **Solução:** Verifique sua conexão com internet

### Dados não sincronizam
- **Causa:** `USE_FIREBASE = false` ou credenciais inválidas
- **Solução:** Verifique o arquivo `firebase-config.js`

### Ver dados no Firebase:
1. Acesse Firebase Console
2. Realtime Database
3. Aba "Dados"
4. Você verá todos os eventos, usuários, etc.

---

## 📊 Monitoramento

No Firebase Console, você pode ver:
- **Database:** Todos os dados em tempo real
- **Usage:** Quantas leituras/escritas (plano gratuito: 10GB/mês)
- **Logs:** Erros e atividades

---

## 💰 Custos (Plano Spark - GRATUITO)

✅ **Incluído gratuitamente:**
- 1 GB armazenamento
- 10 GB/mês de transferência
- 100 conexões simultâneas

Para aplicação com até 1000 usuários ativos, o plano gratuito é suficiente!

---

## 🎯 Próximos Passos

1. ✅ Configure o Firebase (este guia)
2. 🔐 Implemente Firebase Authentication (opcional)
3. 📱 Adicione notificações push (opcional)
4. 🌐 Deploy no Netlify/Vercel

---

## 📚 Documentação Oficial

- Firebase Realtime Database: https://firebase.google.com/docs/database
- Security Rules: https://firebase.google.com/docs/database/security
- Web Setup: https://firebase.google.com/docs/web/setup

---

## ❓ Dúvidas?

Abra uma issue no repositório ou consulte a documentação oficial do Firebase.

**Bom desenvolvimento! 🚀**
