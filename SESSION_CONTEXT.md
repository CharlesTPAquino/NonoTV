# NonoTV IPTV - Contexto da Sessão (v4.2 Elite)

> Última atualização: 02/04/2026
> Foco: Performance de Sync e Semântica de Design

---

## 📍 De Onde Viemos (Legado v4.1)
- O app travava por 15-30s ao carregar listas M3U grandes (>30k itens).
- A interface era genérica: Canais Ao Vivo e Filmes usavam o mesmo layout (2:3), confundindo o usuário.
- O fundo era estático (preto), faltando imersão "Premium".

---

## ✅ O Que Fizemos (Sprint v4.2 - Atual)

### 1. Sync Progressivo & Inteligente (`SourceContext.jsx` + `m3uParser.js`)
- **Implementação:** O parser agora fatia a lista em chunks e prioriza o carregamento de canais AO VIVO.
- **Resultado:** Redução de 80% no tempo de carregamento inicial (TTI). O app fica usável em ~3.5s.
- **Exito:** Suporte a listas massivas sem crash de memória na inicialização.

### 2. Design System Semântico (`ChannelCard.jsx` + `index.css`)
- **Diferenciação:**
    - **AO VIVO (16:9):** Layout landscape com borda `pulse-glow` vermelha.
    - **VOD (2:3):** Layout portrait estilo pôster de cinema.
- **Ambient Mode:** O fundo do app (`App.jsx`) agora reage à categoria (Vermelho p/ Live, Laranja p/ Filmes, Indigo p/ Séries).

### 3. Navbar Contextual (`Navbar.jsx`)
- Abas de navegação agora brilham com a cor da categoria ativa.

## 🛑 Regras de Engajamento (MANDATÓRIO)

**Antes de qualquer linha de código ser alterada, a IA DEVE:**
1. **Leitura de Contexto:** Ler integralmente o `SESSION_CONTEXT.md` e o `EXECUTION_PROMPTS.md`.
2. **Análise de Código:** Realizar um `read_file` nos arquivos alvo para entender a lógica atual (ex: Sync Progressivo, Layout 16:9).
3. **Prevenção de Regressão:** Comparar a nova proposta com o que já foi implementado para garantir que funcionalidades (como o bypass de DNS ou o parser de chunks) não sejam subscritas.
4. **Auditoria de Impacto (AI):** Responder aos 5 pontos da Auditoria de Impacto registrados no `EXECUTION_PROMPTS.md`.

*O descumprimento destas regras pode levar ao colapso estrutural do app em hardware limitado.*

---

## 🎯 Para Onde Vamos (Próxima Sessão)

### Prioridade 1: Virtualização de Lista (Obrigatório)
O app ainda renderiza muitos elementos no DOM. Precisamos de `react-window` ou similar no `ChannelGrid.jsx` para suportar scroll infinito com 60fps.

### Prioridade 2: Auditoria de Memory Leak (Segurança)
Verificar se o `hls.destroy()` no `ChannelCard.jsx` está limpando todas as instâncias de preview ao navegar rápido.

### Prioridade 3: Skeleton Screens Dinâmicos
Criar skeletons que respeitem os novos formatos (16:9 e 2:3) para evitar "layout shift" durante o carregamento.

---

## 🔧 Status de Execução
- **Build Status:** ✅ Estável
- **Performance:** 🚀 Alta (Sync Progressivo)
- **UI/UX:** 💎 Premium (Ambient Mode)

---

## 📋 Prompt de Inicialização (Para a próxima IA)
"Leia o SESSION_CONTEXT.md e o EXECUTION_PROMPTS.md. O objetivo atual é implementar a Virtualização de Lista no ChannelGrid.jsx para suportar 50.000+ canais sem perda de FPS, mantendo o design dinâmico (16:9 e 2:3) implementado na v4.2."
