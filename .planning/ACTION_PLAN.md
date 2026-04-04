# Plano de Ação de Prioridades — NonoTV Elite 4K

**Data:** 04/04/2026
**Versão Atual:** v8.6.0 (Debug Fixes)
**Próximo Deploy:** v8.7.0
**Dono:** Charles

---

## 📊 Estado Atual

### O que foi resolvido nesta sessão (v8.6.0 Debug)
- ✅ **P0:** `STREAM_CONFIG` hoisting — crash em runtime eliminado
- ✅ **P0:** Suporte a streams `.ts` — canais TS agora usam HLS.js
- ✅ **P0:** `AbortSignal.timeout` incompatível — fallback universal criado
- ✅ **P1:** Filtro por grupo no Web Worker — funcionalidade restaurada
- ✅ **P1:** Conflito D-Pad — spatial navigation desligada durante player
- ✅ **P1:** `recordMetric` signature — métricas agora gravam corretamente
- ✅ **P2:** CinemaPlayer timestamp — bug de precedência corrigido
- ✅ **P2:** Atalhos de teclado no CinemaPlayer — seek ±15s, play/pause
- ✅ **Deploy oficial** via `deploy.sh` — APK no Google Drive (Nono+)

### Testes
- ✅ 42/42 passando
- ✅ Build limpo (6.2MB APK)

---

## 🎯 Prioridades — Ordem de Execução

### PRIORIDADE 0 — Motor de Vídeo (Crítico)
**Problema:** Sintonização falha no Mi Stick — vídeo não inicia ou demora demais.

**Hipótese raiz:** Conflito de renderização no ciclo de vida do React + latência nos proxies de rede + timeout agressivo para redes lentas.

| # | Tarefa | Arquivo(s) | Impacto | Esforço |
|---|--------|-----------|---------|---------|
| 0.1 | Componente isolado de teste de vídeo (`VideoTestScreen.jsx`) | `src/components/Test/` | Debug visual do buffer | Médio |
| 0.2 | Aumentar `maxBufferLength` e `maxMaxBufferLength` no HLS.js para redes lentas | `src/hooks/useHlsPlayer.js` | Buffer mais resiliente em 3G/WiFi fraco | Baixo |
| 0.3 | Implementar retry automático com backoff exponencial no `initHls` | `src/hooks/useHlsPlayer.js` | Recupera falhas transitórias de rede | Médio |
| 0.4 | Adicionar logging detalhado de eventos HLS (FRAG_LOADED, LEVEL_SWITCH, BUFFER_APPENDED) | `src/hooks/useHlsPlayer.js` | Diagnóstico preciso do ponto de falha | Baixo |
| 0.5 | Implementar `CapacitorHttp` como fallback de fetch para streams no Android nativo | `src/services/api.js` | Contorna CORS no WebView Android | Médio |
| 0.6 | Timeout adaptativo baseado em `navigator.connection.effectiveType` | `src/utils/createTimeoutSignal.js` | 5s em 4G → 30s em 3G | Baixo |

**Critério de sucesso:** Vídeo inicia em ≤5s em 90% dos canais no Mi Stick.

---

### PRIORIDADE 1 — AI Metadata Enrichment (Gemini)
**Objetivo:** Gerar sinopses e descrições para canais/filmes sem EPG usando Gemini AI.

**Estado atual:** `AIService.enrichMetadata()` funciona para 1 canal. Falta pipeline batch + cache + UI.

| # | Tarefa | Arquivo(s) | Impacto | Esforço |
|---|--------|-----------|---------|---------|
| 1.1 | Criar `batchEnrichMetadata(channels, batchSize=10)` com rate limiting | `src/services/AIService.js` | Enriquece canais sem EPG em lote | Alto |
| 1.2 | Cache IndexedDB para metadados enriquecidos (TTL 7 dias) | `src/services/ChannelCacheDB.js` | Evita chamadas repetidas à API Gemini | Médio |
| 1.3 | Integrar enriquecimento no fluxo de carregamento de fonte (após parse M3U) | `src/context/SourceContext.jsx` | Metadados disponíveis ao abrir app | Médio |
| 1.4 | Corrigir `aiService.getRecommendations()` — método chamado mas não existe | `src/services/AIService.js` | Componente AIRecommendations volta a funcionar | Baixo |
| 1.5 | Indicador visual "✨ AI" em canais com metadados enriquecidos | `src/components/Channels/ChannelCard.jsx` | Feedback visual ao usuário | Baixo |
| 1.6 | Toggle nas configurações para ativar/desativar AI (economia de quota) | `src/components/Settings/SettingsPanel.jsx` | Controle de uso de API | Baixo |

**Critério de sucesso:** 80% dos canais sem EPG têm descrição gerada por IA ao carregar uma fonte.

---

### PRIORIDADE 2 — Consolidação da Stack AI
**Problema:** Duas stacks AI paralelas (Gemini `AIService` + Ollama/MCP `src/services/ai/`) que não conversam. A stack Ollama/MCP é dead code — nunca importada pela UI e impossível de rodar no Mi Stick.

| # | Tarefa | Arquivo(s) | Impacto | Esforço |
|---|--------|-----------|---------|---------|
| 2.1 | Mover conceitos úteis da stack Ollama (agents, skills, natural language routing) para `AIService.js` | `src/services/AIService.js` | Unifica arquitetura AI | Alto |
| 2.2 | Implementar `AIHub` como facade que usa Gemini como provider principal | `src/services/ai/AIHub.js` | Orquestração centralizada | Médio |
| 2.3 | Wire up `aiAgents.startAll()` no lifecycle do app (`App.jsx` ou `main.jsx`) | `src/main.jsx` | Agents rodam em background | Médio |
| 2.4 | HealthMonitorAgent ativo — alerta visual quando fonte fica offline | `src/services/ai/AIAgents.js` + UI | Notificação proativa de falhas | Médio |
| 2.5 | Arquivar `src/services/ai/OllamaClient.js` (documentar como referência para futuro desktop) | `src/services/ai/` | Reduz bundle size | Baixo |

**Critério de sucesso:** Uma única stack AI funcional, agents rodando em background, zero dead code.

---

### PRIORIDADE 3 — Google Video Stitcher (Pre-Flight)
**Objetivo:** Play instantâneo via manifest stitchado pelo Google Video Stitcher.

**Estado atual:** `getStitchedManifest()` é stub com project ID já configurado.

| # | Tarefa | Arquivo(s) | Impacto | Esforço |
|---|--------|-----------|---------|---------|
| 3.1 | Implementar chamada real à API Video Stitcher | `src/services/AIService.js` | Play instantâneo | Alto |
| 3.2 | Fallback para stream direto se Stitcher falhar | `src/services/streamService.js` | Resiliência | Baixo |
| 3.3 | Configurar API key e permissões no Google Cloud | Infra | Pré-requisito | Médio |

**Critério de sucesso:** Tempo de início de reprodução reduzido em 50% para canais suportados.

---

### PRIORIDADE 4 — Melhorias de UX (Backlog)
| # | Tarefa | Impacto | Esforço |
|---|--------|---------|---------|
| 4.1 | Multi-perfis (adulto/infantil) | Organização familiar | Médio |
| 4.2 | Auto-quality selector (adapta resolução ao bandwidth) | Menos buffering em redes lentas | Médio |
| 4.3 | Downloads offline para VOD | Assistir sem internet | Alto |
| 4.4 | Picture-in-Picture | Multitarefa | Médio |
| 4.5 | Limpeza de bundle — remover `@capacitor/cli` do build web (externalizado) | -250KB no bundle | Baixo |
| 4.6 | VirtualChannelGrid — `react-window` v2 API incompatível (warnings no build) | Fallback funciona mas sem virtualização real | Médio |

---

## 📋 Sequência de Execução Recomendada

```
Sessão 1 → P0.1, P0.2, P0.4, P0.6    (diagnóstico + buffer + timeouts)
Sessão 2 → P0.3, P0.5                (retry + CapacitorHttp fallback)
Sessão 3 → P1.1, P1.2, P1.3          (batch enrichment + cache + integração)
Sessão 4 → P1.4, P1.5, P1.6          (UI fixes + toggle)
Sessão 5 → P2.1, P2.2                (consolidação AI stack)
Sessão 6 → P2.3, P2.4, P2.5          (agents + cleanup)
Sessão 7 → P3.1, P3.2, P3.3          (Video Stitcher)
Sessão 8 → P4.x (backlog conforme demanda)
```

---

## 🔧 Ferramentas e Dependências

| Recurso | Status | Notas |
|---------|--------|-------|
| `VITE_GOOGLE_AI_KEY` | ⚠️ Não configurado | Necessário para Gemini API |
| `rclone gdrive:` | ✅ Configurado | Deploy automático funcionando |
| ADB | ⚠️ Sem dispositivo | Nenhum device conectado |
| Android SDK | ✅ Instalado | Gradle build funcionando |
| npm test | ✅ 42/42 passing | Quality gate ativo |

---

## ⚠️ Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Gemini API quota esgotada | Média | Alto | Cache agressivo + toggle de desativar |
| Fontes IPTV expirarem | Alta | Alto | Circuit breaker já implementado |
| Bundle > 500KB chunks | Alta | Baixo | Code splitting dynamic imports |
| react-window v2 incompatível | Média | Médio | Fallback com paginação já funciona |
| Mi Stick não ter memória suficiente | Baixa | Alto | Performance tier LITE já degrada gracefully |
