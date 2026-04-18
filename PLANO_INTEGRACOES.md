# Plano de Integrações — Auditoria + Auth

**Data:** 17/04/2026  
**Commit base:** `bf6d27f` (backup antes das integrações)

---

## ✅ Restaurado Hoje (concluído)

| Item | Arquivo | Status |
|------|---------|--------|
| AuthContext.jsx | `src/context/AuthContext.jsx` | ✅ OK |
| LoginScreen.jsx | `src/components/Auth/LoginScreen.jsx` | ✅ OK |
| Integração App.jsx | `src/App.jsx` | ✅ OK |
| Integração main.jsx | `src/main.jsx` | ✅ OK |

---

## 🔄 Integrações Pendentes (Testar)

| # | Item | Complexidade | Prioridade |
|---|------|--------------|------------|
| 1 | **Bottom Navigation** (componente) | Média | 🔴 Alta |
| 2 | **Touch targets** (≥44px) | Baixa | 🟠 Média |
| 3 | **Health check automático** | Média | 🟠 Média |
| 4 | **Sync cloud (Supabase)** | Média | 🟠 Média |

---

## 1. Bottom Navigation

### O que existe:
- CSS em `index.css` (--bottom-nav-h)
- Mas componente não foi criado

### O que fazer:
- Criar `src/components/Layout/BottomNav.jsx`
- Integrar no App.jsx (mobile only)

### Teste:
- Verificar se aparece em mobile (não TV)
- Testar navegação entre abas

---

## 2. Touch Targets (≥44px)

### O que fazer:
- Revisar componentes UI (Button, Input, Card)
- Garantir que todos tenham `min-h-11` ou `min-h-12`

### Teste:
- Inspecionar elementos no mobile

---

## 3. Health Check Automático

### O que existe:
- Manual em Settings > Status

### O que fazer:
- Implementar verificação periódica em background
- Dashboard de status em tempo real

### Teste:
- Verificar se fontes são testadas automaticamente

---

## 4. Sync Cloud (Supabase)

### O que fazer:
- Sincronizar favoritos com Supabase
- Sincronizar histórico com Supabase

### Teste:
- Adicionar favorito, verificar se aparece no banco

---

## Fluxo de Teste

1. Build: `npm run build`
2. Sync: `npx cap sync android`
3. Build APK: `cd android && ./gradlew assembleDebug`
4. Testar no dispositivo

---

*Documento vivo — atualizar após cada integração*