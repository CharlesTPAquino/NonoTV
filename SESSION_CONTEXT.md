# NonoTV IPTV - Contexto da Sessão (v8.6.0 Elite Alpha - Suspenso)

> Última atualização: 03/04/2026 às 22:40
> Status: Interface Estabilizada / Player em Depuração

---

## 📍 De Onde Viemos (O Passado)
- **Legado v4.1 - v5.9:** Um player unificado que tentava processar tudo na Main Thread.
- **Problemas Crônicos:** Travamentos de 15s em listas grandes, crashes de codec ao trocar de Live para VOD e categorização falha baseada em nomes de grupos.

## 🛠️ Onde Estamos (O Hoje - v8.6.0)

### 1. Performance de Interface (Sucesso ✅)
- **Web Worker:** A filtragem de 50k+ canais agora é feita em background. A navegação entre abas não trava mais.
- **Virtualização 2D:** Implementada com fallback paginado (30 itens) para evitar estouro de RAM.
- **Dual-Environment:** Estrutura de `LivePlayer` e `CinemaPlayer` criada e orquestrada.

### 2. Sintonização de Vídeo (Falha Parcial ❌)
- **O Problema Atual:** Apesar da lógica de detecção de DNA (HLS vs TS) e dos resets de hardware implementados, o sinal continua falhando ao carregar em certos cenários.
- **Hipótese:** Conflito de renderização no ciclo de vida do React ou latência excessiva nos proxies de rede configurados no `streamService`.

## 🎯 Para Onde Vamos (O Futuro)

### Prioridade 0: O "Reset" do Motor de Vídeo
> Na próxima sessão, devemos ignorar a UI e focar 100% em um componente isolado de teste de vídeo para descobrir por que o buffer não está enchendo no Mi Stick.

### Prioridade 1: AI Metadata Enrichment
> Dar vida aos canais sem EPG usando Gemini AI para gerar sinopses.

### Prioridade 2: Pre-flight Stitching
> Preparar a URL via Google Video Stitcher antes do clique, para que o "Play" seja instantâneo.
