# 📜 NonoTV Elite 4K - Projeto de Desenvolvimento

## Visão Geral do Projeto

**NonoTV Elite 4K** é um aplicativo IPTV para Smart TVs, Mobile e Tablets, construído com React + Vite + TailwindCSS + Capacitor.

---

## 📅 Linha do Tempo de Desenvolvimento

### 🔴 Onde Viemos (Ponto de Partida)
- **Versão:** 3.1 base
- **Stack:** React + Vite + TailwindCSS + Capacitor
- **Problemas identificados:**
  - Sistema de sincronização de servidores inexistente
  - Interface carregada e confusa
  - Sem validação de canais
  - Sem sistema de recomendação
  - Player com muitas opções desnecessárias
  - Cache problemático (localStorage cheio)
  - CORS issues com extensões de navegador

### 🟡 Onde Fomos (Trabalho Realizado)

#### Fase 1: Infraestrutura e Sincronização
- [x] Sistema de Health Check automático (a cada 5 min)
- [x] Dashboard de status de servidores em tempo real
- [x] Cache inteligente (apenas dados essenciais)
- [x] Retry com backoff exponencial
- [x] Circuit Breaker (bloqueio após 10 falhas)

#### Fase 2: Interface e UX
- [x] Bottom Navigation para Mobile
- [x] Touch targets padronizados (≥44px)
- [x] Swipe gestures para trocar canais
- [x] Layout responsivo para Tablet
- [x] ChannelListOverlay integrado
- [x] Continue Watching row
- [x] Skeleton loading states
- [x] Pull-to-refresh

#### Fase 3: Performance
- [x] Code splitting (4 chunks)
- [x] Lazy load HLS.js (522KB)
- [x] React.memo em componentes
- [x] Bundle otimizado (745KB → 127KB)

#### Fase 4: AI e Inteligência
- [x] Sistema de recomendações baseado em histórico
- [x] Seleção inteligente de qualidade
- [x] Detecção automática de codec
- [x] Previsão de buffer
- [x] Pré-carregamento de canais

#### Fase 5: Simplificação do Player
- [x] VideoPlayerMinimal - Player limpo (~110KB)
- [x] VideoPlayerSmart - Player completo
- [x] Detecção de codec suportados
- [x] Controles que somem automaticamente

### 🟢 Onde Estamos (Estado Atual)

```
┌─────────────────────────────────────────────────────┐
│  NONOTV ELITE 4K v4.1                              │
├─────────────────────────────────────────────────────┤
│  ✅ Health Check Automático                         │
│  ✅ Validação de Canais                            │
│  ✅ AI Recomendações                               │
│  ✅ Player Minimal (110KB)                          │
│  ✅ Cache Inteligente                               │
│  ✅ Code Splitting                                 │
│  ✅ Responsive Mobile/Tablet                       │
└─────────────────────────────────────────────────────┘
```

**Estatísticas:**
- Bundle Main: 110KB (gzipped: 32KB)
- HLS.js: 522KB (lazy load)
- Total: ~632KB (otimizado)
- Testes: 41 passando
- Build: ✅ OK

### 🔵 Para Onde Vamos (Próximos Passos)

#### Prioridade Alta (Próxima Sprint)
- [ ] Corrigir issues de CORS com NG-Anti-CORS
- [ ] Testar EPG completo
- [ ] Implementar Sync em nuvem (Firebase/Supabase)
- [ ] Picture-in-Picture (PiP)

#### Prioridade Média
- [ ] Download Offline
- [ ] Multi-perfil
- [ ] Catch-up TV
- [ ] Controle Parental

#### Prioridade Baixa
- [ ] Análises de audiência
- [ ] Integração com TMDB (filmes/séries)
- [ ] Tema escuro/claro

---

## 📊 Métricas de Progresso

| Métrica | Início | Atual | Meta |
|---------|--------|-------|------|
| Bundle Size | 745KB | 127KB | <500KB |
| Health Check | ❌ | ✅ | ✅ |
| AI Recomendações | ❌ | ✅ | ✅ |
| Player Minimal | ❌ | ✅ | ✅ |
| Mobile/Tablet UI | Parcial | ✅ | ✅ |
| Testes | 0 | 41 | 100+ |

---

## 🛠️ Stack Tecnológico

- **Frontend:** React 18 + Vite
- **Styling:** TailwindCSS
- **Player:** HLS.js
- **Mobile:** Capacitor (Android)
- **State:** React Context + localStorage
- **Testing:** Vitest

---

## 📁 Estrutura de Arquivos Principais

```
src/
├── components/
│   ├── Channels/
│   │   ├── AIRecommendations.jsx    # AI Recommendations
│   │   ├── ChannelGrid.jsx         # Main grid
│   │   ├── ChannelCard.jsx          # Channel card
│   │   └── ContinueWatching.jsx     # History row
│   ├── Player/
│   │   ├── VideoPlayerMinimal.jsx   # Clean player
│   │   └── VideoPlayer.jsx          # Full player
│   ├── Settings/
│   │   ├── ServerHealthDashboard.jsx # Server status
│   │   └── SettingsPanel.jsx        # Settings
│   └── UI/
│       ├── Skeleton.jsx             # Loading states
│       └── PullToRefresh.jsx        # Pull to refresh
├── hooks/
│   ├── useHlsPlayer.js             # Player hook + AI
│   ├── useChannelValidator.js      # Channel validation
│   └── useSwipeGesture.js          # Swipe gestures
├── services/
│   ├── AIService.js                # AI engine
│   ├── ServerHealthService.js      # Health check
│   ├── SyncManager.js              # Local sync
│   └── RetryService.js             # Retry logic
└── context/
    ├── SourceContext.jsx            # Sources state
    └── PlayerContext.jsx           # Player state
```

---

## 🤖 Agentes e Skills Utilizados

O projeto possui 20+ agentes e 36 skills configurados no `.agent/`:

- `mobile-developer` - UI Mobile/Tablet
- `performance-optimizer` - Performance
- `frontend-specialist` - React patterns
- `test-engineer` - Testes

---

## 📝 Notas de Desenvolvimento

### Correções Importantes
1. **CORS:** Proxy local usa formato `/http://...` em vez de `?url=`
2. **Cache:** Limitado a 300 canais para não exceder localStorage
3. **HLS Config:** Removido liveMaxLatencyDuration (causava erro)
4. **AbortSignal:** Removido de fetch (incompatível com extensões)

### Decisões de Design
1. Player Minimal como padrão (mais leve, mais limpo)
2. AI Recommendations apenas quando >20 canais
3. Validação apenas dos primeiros 50 canais
4. Codec detection automático via canPlayType()

---

## 📅 Histórico de Versões

| Versão | Data | Mudanças |
|--------|------|----------|
| 8.0 | 03/04/2026 | Arquitetura Dual-Environment (Live vs Cinema), Codec DNA Detection |
| 6.0 | 03/04/2026 | Virtualização de Grid (50k+ canais), Fallback Resiliente |
| 4.7 | 03/04/2026 | AI Engine + Zapping + VOD |
| 4.1 | 28/03/2026 | Legado: Player Unificado |

---

## 🏛️ Contextualização Estratégica (A Evolução NonoTV)

### 🔴 O PASSADO (Legado v4.1 - v5.9)
- **O Problema:** O app tratava TV Ao Vivo e Filmes no mesmo componente. Isso causava conflitos de codec (HLS vs MP4) que travavam o Mi Stick.
- **Categorização:** Baseada apenas em nomes de grupos. Canais que passavam filmes 24h eram jogados na aba de Cinema, confundindo o usuário.
- **Performance:** Travamentos de 15s ao carregar listas grandes e "telas pretas" constantes por falhas no motor de sintonização.

### 🟢 O HOJE (v8.0 Elite - Alpha)
- **Arquitetura Dual-Environment:** Criamos dois universos independentes dentro do app.
    - **LivePlayer:** Foco em baixa latência e Zapping (troca rápida de canais via D-Pad).
    - **CinemaPlayer:** Interface estilo Netflix com Barra de Progresso (Seek), Avanço/Retrocesso e Hard Reset de Codecs entre sessões.
- **Detecção por DNA:** O sistema agora analisa a extensão da URL (`.mp4` vs `.m3u8`). Se é arquivo, é Cinema. Se é transmissão, é Live.
- **Resiliência:** Implementado ErrorBoundary global e Fallback de Grid. O app detecta falhas e se recupera sozinho sem precisar reiniciar o APK.

### 🔵 PARA ONDE VAMOS (v8.1+)
- **AI Metadata Enrichment:** Integração profunda com Gemini AI para gerar sinopses e posters para canais que não possuem EPG.
- **Stitcher Pre-Flight:** Preparação de sinal no servidor (Google Cloud) para que o play no Mi Stick seja instantâneo, eliminando o tempo de "Sintonizando".
- **Multi-Áudio & Legendas:** Suporte avançado para arquivos MKV/MP4 no CinemaPlayer.

---

## 📝 Sessão de Desenvolvimento: 03/04/2026 (v8.0 Elite)
... (mantém notas técnicas da v8.0)

---

*Documento criado em 28/03/2026*
*Atualizado em 03/04/2026 pelo opencode AI Assistant*
