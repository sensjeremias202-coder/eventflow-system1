# 🔥 Configuração do Firebase Realtime Database

## Passo a Passo para Criar o Banco de Dados

### 1. Criar o Realtime Database

1. Acesse: https://console.firebase.google.com/u/0/project/eventflow-system-2/database
2. Clique em **"Criar banco de dados"** na seção Realtime Database
3. Escolha a localização: **Estados Unidos (us-central1)** (recomendado)
4. Selecione: **"Iniciar no modo de teste"** (permite leitura/escrita por 30 dias)
5. Clique em **"Ativar"**

### 2. Configurar Regras de Segurança

Após criar o database, vá em **"Regras"** e substitua o conteúdo por:

```json
{
  "rules": {
    ".read": true,
    ".write": true,
    "users": {
      "$userId": {
        ".read": true,
        ".write": true
      }
    },
    "events": {
      ".read": true,
      ".write": true
    },
    "categories": {
      ".read": true,
      ".write": true
    },
    "messages": {
      ".read": true,
      ".write": true
    }
  }
}
```

⚠️ **IMPORTANTE**: Estas regras permitem acesso total. Para produção, implemente autenticação.

### 3. Verificar URL do Database

Certifique-se de que a URL do database é:
```
https://eventflow-system-2-default-rtdb.firebaseio.com
```

### 4. Estrutura dos Dados

O sistema salvará os dados nesta estrutura:

```
eventflow-system-2/
├── users/
│   ├── user1/
│   │   ├── id
│   │   ├── name
│   │   ├── email
│   │   ├── password
│   │   └── role
│   └── user2/...
├── events/
│   ├── event1/
│   │   ├── id
│   │   ├── title
│   │   ├── date
│   │   ├── category
│   │   ├── organizerId
│   │   └── ratings/
│   └── event2/...
├── categories/
├── messages/
└── lastUpdate
```

## Como Funciona

### Sincronização Automática

- **Quando um usuário cadastra**: Salva no Firebase imediatamente
- **Quando faz login**: Busca dados do Firebase
- **Quando cria evento**: Sincroniza com todos os dispositivos
- **Quando avalia evento**: Atualiza em tempo real

### Isolamento de Dados

- Cada usuário vê apenas seus próprios eventos criados
- Administradores veem todos os eventos e usuários
- Avaliações são públicas para todos os usuários

### Vantagens do Firebase

✅ Dados sincronizados entre Chrome, Edge, celular, etc.
✅ Backup automático na nuvem
✅ Tempo real - alterações aparecem instantaneamente
✅ Offline-first - funciona sem internet e sincroniza depois
✅ Escalável - suporta milhares de usuários

## Testando

1. Abra o site em **Chrome**: https://sensjeremias202-coder.github.io/eventflow-system1/
2. Cadastre um usuário e crie um evento
3. Abra o site em **Edge** ou outro dispositivo
4. Faça login com o mesmo usuário
5. Você verá os mesmos dados! 🎉

## Monitoramento

### Ver dados em tempo real:
https://console.firebase.google.com/u/0/project/eventflow-system-2/database/data

### Ver usuários ativos:
https://console.firebase.google.com/u/0/project/eventflow-system-2/analytics

## Problemas Comuns

### "Firebase não inicializado"
- Verifique se o Realtime Database foi criado
- Confirme a URL em `firebase-config.js`

### "Permission denied"
- Verifique as regras de segurança
- Certifique-se de estar em modo de teste

### "Dados não aparecem em outro dispositivo"
- Limpe o cache (Ctrl+Shift+Delete)
- Verifique o console (F12) para erros
- Confirme que `USE_FIREBASE = true`

## Segurança em Produção

Para uso em produção, implemente:

1. **Firebase Authentication** para login seguro
2. **Regras personalizadas** para cada usuário ver apenas seus dados
3. **Criptografia de senha** com bcrypt ou similar
4. **Validação no servidor** com Cloud Functions

---

📚 Documentação completa: https://firebase.google.com/docs/database
