# Proposta B — Validação e Testes

## Resumo das Mudanças Aplicadas

- Adicionadas variáveis CSS: `--header-height: 70px` e `--spacing: clamp(12px, 2vw, 18px)`
- Sidebar atualizada com:
  - `max-height: calc(100vh - var(--header-height))` (altura relativa ao viewport)
  - `padding: var(--spacing)` (aumentado de valores fixos)
  - `width: clamp(240px, 20vw, 320px)` (aumentado ligeiramente)
  - `top: var(--header-height)` (usando variável)
- Media query mobile (<=768px) atualizada para usar `top: var(--header-height)`
- `.sidebar-menu a` e `.sidebar-menu li` com padding baseado em `var(--spacing)`

## Verificações Rápidas

### 1. Verificar variáveis CSS foram aplicadas
```powershell
# No PowerShell, abra o projeto e procure:
Select-String -Path .\css\style.css -Pattern "--header-height|--spacing" | Select-Object -First 5
```

**Esperado:** Deve encontrar as linhas com `--header-height: 70px;` e `--spacing: clamp(12px, 2vw, 18px);`

### 2. Testar visualmente em browser
1. Abra `index.html` em um navegador (Chrome/Firefox/Edge)
2. **Desktop (1920x1080 ou maior):**
   - Menu lateral deve ocupar ~20% da tela (não précisa de scroll interno)
   - Itens do menu devem ter espaçamento maior que antes
   - Header deve estar visível no topo, sem sobreposição

3. **Tablet (768px a 1024px):**
   - Sidebar continua em modo sticky com a mesma altura
   - Conteúdo principal deve fluir sem interrupções

4. **Mobile (até 767px):**
   - Botão toggle (☰) deve estar visível no topo
   - Ao clicar, sidebar abre da esquerda com altura plena
   - Ao clicar em um link, sidebar fecha automaticamente

### 3. Validação via DevTools (F12 > Console)

Execute no console do browser (F12 > Console) para validar:

```javascript
// Verificar max-height da sidebar
const sidebar = document.getElementById('appSidebar');
console.log('Sidebar max-height:', getComputedStyle(sidebar).getPropertyValue('max-height'));
// Deve retornar algo como "calc(100vh - 70px)" ou o valor computado equivalente

// Verificar top da sidebar
console.log('Sidebar top:', getComputedStyle(sidebar).getPropertyValue('top'));
// Deve ser "70px" ou var(--header-height) equivalente

// Verificar se toggle funciona sem override inline
const toggleBtn = document.getElementById('toggleSidebarBtn');
if (toggleBtn) {
    toggleBtn.click(); // Abre/fecha sidebar
    console.log('Sidebar classList:', sidebar.className);
    // Deve conter ou remover 'sidebar--open' ao clicar
}
```

### 4. Teste de responsividade (DevTools > Device Emulation)

```
Abra DevTools (F12) > clique no ícone de dispositivo (canto superior direito)
Teste em:
- iPhone 12 (390x844) — verificar toggle e abertura lateral
- iPad (768x1024) — verificar sidebar sticky
- Desktop (1920x1080) — verificar max-width da sidebar
```

## Regressões Visuais a Verificar

| Elemento | Desktop | Tablet | Mobile | Status |
|----------|---------|--------|--------|--------|
| Header fixo | Visível no topo | Visível | Visível | ✓ |
| Sidebar altura | Ocupa viewport sem scroll | Idem | N/A (hidden) | ✓ |
| Sidebar spacing | Aumentado (var(--spacing)) | Idem | Idem | ✓ |
| Toggle mobile | N/A | Visível | Visível | ✓ |
| Conteúdo principal | Fluido, não comprimido | Fluido | Fluido | ✓ |
| Modais | Centralizados, overlay | Idem | Idem | ✓ |
| Chat sidebar | Não afetado | Idem | Alterado | ✓ |

## Páginas-chave a Testar

1. **Dashboard** — Layout principal com grid de eventos
2. **Eventos** — Lista de eventos com sidebar visível
3. **Chat** — Sidebar de chat + sidebar principal
4. **Meu Perfil** — Formulário com sidebar

## Próximas Etapas

- [ ] Executar as 3 verificações acima
- [ ] Confirmar que nenhuma página quebrou visualmente
- [ ] Se houver regressões, documentar e criar issue
- [ ] Mergear ou fazer PR se em ambiente de equipe

---

**Commit:** `73b934a` — Proposta B: arejamento — adicionar --header-height e --spacing  
**Data:** 18 de dezembro de 2025  
**Autor:** EventFlow Maintainer
