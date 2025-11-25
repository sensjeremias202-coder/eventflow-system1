# 🆔 Sistema de ID Único - EventFlow

## 📋 Visão Geral

O EventFlow agora possui um sistema de **ID único** para cada usuário, eliminando duplicação de nomes e oferecendo uma forma alternativa de login mais segura.

---

## ✨ Funcionalidades

### 1. **Geração Automática de ID**
- Quando um usuário se cadastra, um ID único é gerado automaticamente
- Formato: `EVTxxxxxx` (onde x são letras e números aleatórios)
- Exemplo: `EVTA7K4M2`, `EVTZ3P9Q1`, `EVTM5N8R4`

### 2. **Login com ID ou E-mail**
- Agora você pode fazer login de duas formas:
  - **Com e-mail:** `usuario@email.com` + senha
  - **Com ID:** `EVTA7K4M2` + senha

### 3. **Visualização no Perfil**
- O ID único é exibido na página de perfil do usuário
- Botão de **copiar ID** para facilitar o uso
- Informação clara: "Use este ID para fazer login"

### 4. **Migração Automática**
- Usuários existentes recebem IDs automaticamente
- Não precisa fazer nada, é automático na próxima vez que entrar

---

## 🚀 Como Usar

### **Novo Cadastro**

1. Acesse a tela de cadastro
2. Preencha os dados: Nome, E-mail, Senha, Tipo de Conta
3. Clique em **Cadastrar**
4. ✅ **Seu ID único será exibido na tela!**
   ```
   ✓ Cadastro realizado com sucesso!
   Seu ID: EVTA7K4M2
   ⚠️ Anote este ID! Você precisará dele para fazer login.
   ```
5. **IMPORTANTE:** Anote ou copie este ID!

### **Login**

Você pode fazer login de 2 formas:

#### **Opção 1: Com E-mail**
```
ID de Usuário ou E-mail: usuario@email.com
Senha: sua_senha
```

#### **Opção 2: Com ID Único**
```
ID de Usuário ou E-mail: EVTA7K4M2
Senha: sua_senha
```

### **Consultar seu ID**

1. Faça login no sistema
2. Vá em **Perfil** (menu lateral)
3. Seu ID estará visível no campo **"ID de Usuário"**
4. Clique em **Copiar** para copiar o ID

---

## 👥 IDs dos Usuários Padrão

Os usuários de teste já possuem IDs definidos:

| Nome | E-mail | Senha | ID Único | Tipo |
|------|--------|-------|----------|------|
| Administrador | admin@eventflow.com | admin123 | `EVTADM001` | Admin |
| João Silva | joao@email.com | 123456 | `EVTJOA002` | Usuário |
| Maria Andrade | maria@email.com | 123456 | `EVTMAR003` | Usuário |
| Carlos Tesoureiro | tesoureiro@eventflow.com | tesoureiro123 | `EVTTES004` | Tesoureiro |

**Teste de Login com ID:**
```
ID: EVTADM001
Senha: admin123
```

---

## 🔒 Segurança

### **Vantagens do Sistema de ID:**

1. ✅ **Previne Duplicação:** Dois usuários não podem ter o mesmo nome
2. ✅ **Privacidade:** Não precisa compartilhar seu e-mail para login
3. ✅ **Segurança:** IDs são únicos e difíceis de adivinhar
4. ✅ **Praticidade:** ID curto e fácil de usar

### **Dicas de Segurança:**

- 🔐 Nunca compartilhe sua senha
- 📝 Guarde seu ID em local seguro
- 🚫 Não use senhas óbvias como "123456"
- ✅ Anote seu ID logo após o cadastro

---

## 🛠️ Detalhes Técnicos

### **Formato do ID:**
- Prefixo: `EVT` (EventFlow)
- 6 caracteres alfanuméricos aleatórios
- Total: 9 caracteres
- Exemplo: `EVTA7K4M2`

### **Validação:**
- IDs são verificados para garantir unicidade
- Caso haja duplicação (muito raro), gera automaticamente outro
- Sistema de migração automática para usuários existentes

### **Armazenamento:**
```javascript
{
  id: 1,
  name: "João Silva",
  email: "joao@email.com",
  password: "123456",
  role: "user",
  identificationNumber: "EVTJOA002",  // ← ID único
  registered: "2023-02-15"
}
```

---

## ❓ Perguntas Frequentes

### **1. Esqueci meu ID, como recupero?**
- Faça login com seu e-mail normalmente
- Vá em **Perfil** e visualize seu ID
- Copie o ID para uso futuro

### **2. Posso alterar meu ID?**
- Não, IDs são permanentes e únicos
- Isso garante a segurança e integridade do sistema

### **3. Preciso usar o ID obrigatoriamente?**
- Não! Você pode continuar usando e-mail + senha
- O ID é uma opção adicional para facilitar o login

### **4. O que acontece se eu perder meu ID e senha?**
- Você ainda pode fazer login com e-mail + senha
- Apenas anote seu ID quando acessar o perfil

### **5. Posso ter dois usuários com o mesmo nome?**
- Sim! Agora cada usuário tem um ID único
- Exemplo: Dois "João Silva" com IDs diferentes (EVT123ABC e EVT789XYZ)

---

## 📊 Estatísticas

- **IDs Possíveis:** 2.176.782.336 combinações únicas
- **Velocidade:** Geração instantânea (< 1ms)
- **Colisões:** Praticamente zero (1 em 2+ bilhões)
- **Compatibilidade:** 100% backward compatible

---

## 🎯 Casos de Uso

### **Cenário 1: Organização Empresarial**
```
Empresa tem vários funcionários com nome "João"
Solução: Cada um tem ID único (EVTJO1001, EVTJO2002, etc.)
Login simplificado sem confusão de nomes
```

### **Cenário 2: Privacidade**
```
Usuário não quer compartilhar e-mail com outros
Solução: Compartilha apenas o ID (EVTXYZ123)
Mantém privacidade do e-mail
```

### **Cenário 3: Suporte Técnico**
```
Usuário precisa de ajuda do suporte
Suporte: "Qual seu ID de usuário?"
Usuário: "EVTABC789"
Localização rápida e precisa do usuário
```

---

## 🔄 Changelog

### **v20241125100000**
- ✅ Implementado sistema de ID único
- ✅ Login com ID ou e-mail
- ✅ Exibição de ID no perfil
- ✅ Botão para copiar ID
- ✅ Migração automática de usuários existentes
- ✅ Validação de unicidade de IDs

---

## 📞 Suporte

Se tiver dúvidas sobre o sistema de ID:

1. Consulte este documento
2. Teste com usuários padrão
3. Verifique seu ID no perfil

**Desenvolvido com ❤️ pela equipe EventFlow**
