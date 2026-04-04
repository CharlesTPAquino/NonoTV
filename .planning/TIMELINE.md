# Linha do Tempo — NonoTV Elite 4K

---

## 📅 29/03/2026 — Design System & Migração

| Hora | Ação | Detalhe |
|------|------|---------|
| ~16:00 | Migração de projeto | Projeto pai (`/meu-iptv/`) definido como principal, 17→37 fontes |
| ~16:10 | Design System tokens | `tailwind.config.js` atualizado, CSS variables corrigidas |
| ~16:10 | APK buildado | `NonoTV_v2026-03-29_16-10.apk` |
| ~16:10 | api.js corrigido | Voltou para import estático do CapacitorHttp |
| ~16:10 | RetryService otimizado | Delay 2s→1.5s, retries 3→2 |
| ~16:10 | VodPlayer melhorado | Detecção de codecs (HLS, MP4, MKV, WebM, TS) |

---

## 📅 04/04/2026 — Debug + Restauração + Melhorias de UI

### Manhã — Debug e Correções Críticas

| Hora | Ação | Commit | Detalhe |
|------|------|--------|---------|
| ~07:00 | Debug inicial | — | Identificados 14 problemas (P0-P2) |
| ~07:10 | P0: `STREAM_CONFIG` hoisting | — | Movido para antes do uso em `streamService.js` |
| ~07:10 | P0: Suporte a streams `.ts` | — | Adicionado `.ts` na detecção HLS em `useHlsPlayer.js` |
| ~07:10 | P0: `AbortSignal.timeout` fallback | — | Criado `createTimeoutSignal.js` com fallback universal |
| ~07:10 | P1: `activeGroup` no worker | — | Adicionada filtragem por grupo em `filterWorker.js` |
| ~07:10 | P1: D-Pad conflict | — | `setNavigationEnabled(false)` quando player abre |
| ~07:10 | P1: `recordMetric` signature | — | Corrigido para `(sourceId, success, eventType)` |
| ~07:10 | P2: CinemaPlayer timestamp | — | Bug de precedência `0 / 60` corrigido |
| ~07:11 | Deploy v8.6.0 | — | APK `NonoTV_v2026-04-04_07-11.apk` |

### Meio-dia — Motor de Vídeo + AI

| Hora | Ação | Commit | Detalhe |
|------|------|--------|---------|
| ~07:27 | Deploy oficial v8.6.0 | — | APK `NonoTV_v2026-04-04_07-27.apk` |
| ~07:30 | P0: `useHlsPlayer.js` reescrito | — | Buffer adaptativo, retry backoff, logging HLS |
| ~07:30 | P1: `AIService.js` expandido | — | `batchEnrichMetadata`, `getRecommendations` |
| ~07:30 | P4.6: `react-window` v2 fix | — | Imports corrigidos, zero warnings |
| ~07:30 | Deploy v8.7.0 | — | APK no Google Drive |

### Problema: Sintonização falha

| Hora | Ação | Commit | Detalhe |
|------|------|--------|---------|
| ~08:00 | `HlsCapacitorLoader` criado | — | Tentativa de usar CapacitorHttp para contornar CORS |
| ~08:00 | `StreamProxyService` criado | — | Serviço de proxy para streams |
| ~08:00 | Deploy v8.7.2 | — | **FALHOU** — loading eterno no player |
| ~08:30 | Diagnóstico | — | XHR nativo do HLS.js já funciona no WebView — interceptor não era necessário |
| ~08:30 | Revertido | — | Restaurado `src/` do commit `05e5b58` (v4.9 funcional) |
| ~08:30 | Deploy v4.9 | `f8c2cc0` | APK funcional restaurado |

### Problema: Categorização quebrada

| Hora | Ação | Commit | Detalhe |
|------|------|--------|---------|
| ~09:00 | `detectStreamType` modificado | — | Colocou extensões antes do grupo — **QUEBROU** abas Filmes/Séries |
| ~09:00 | Deploy | — | Abas Cinema/Séries vazias |
| ~09:30 | Restaurada lógica v4.9 | — | Grupo/nome antes de extensões |
| ~09:30 | Cache invalidation v4 | — | Limpou IndexedDB com tipos errados |
| ~09:30 | Deploy | — | Categorização funcional |

### Problema: Conteúdo não carrega

| Hora | Ação | Commit | Detalhe |
|------|------|--------|---------|
| ~10:00 | Diagnóstico | — | Código estava correto — problema era servidor específico |
| ~10:00 | Restauração completa | `fec29f5` | `src/` + configs 100% idênticos à v4.9 |
| ~10:00 | Deploy | — | APK 100% funcional |

### Server Tech Profiler

| Hora | Ação | Commit | Detalhe |
|------|------|--------|---------|
| ~10:30 | `ServerTechProfiler.js` criado | `2730b05` | Detecta tecnologia por servidor (Xtream, MAG, HLS, etc.) |
| ~10:30 | Integrado no `SourceContext` | — | Perfil salvo em cache, URLs normalizadas |
| ~10:30 | Deploy | — | APK com detecção automática |

### Player — Ramys não sintoniza

| Hora | Ação | Commit | Detalhe |
|------|------|--------|---------|
| ~11:00 | Diagnóstico | — | URLs do Ramys são Xtream-style sem extensão |
| ~11:00 | Auto-correção implementada | `799a9d5` | `detectTechFromChannels` + `normalizeAllChannels` |
| ~11:00 | Deploy | — | **NÃO funcionou** — URL da fonte é M3U raw (GitHub) |
| ~11:26 | Revertido | `602793d` | Auto-correção revertida |

### Melhorias de UI (Super Prompt)

| Hora | Ação | Commit | Detalhe |
|------|------|--------|---------|
| ~10:47 | Títulos responsivos | `5a10784` | Header centralizado, fontes 2xl→4xl, botões full-width |
| ~10:52 | Cards clean + bg sólido | — | Fundo `#111113`, cards `#252528`, sem brightness filter |
| ~10:52 | Botões de categoria | — | Scroll horizontal, tamanho do conteúdo, sem bordas |
| ~10:52 | Deploy | — | APK com UI limpa |
| ~10:54 | Navegação unificada | `e53412b` | Sidebar desktop + Bottom Nav mobile, status ON/OFF, versão no settings |
| ~11:02 | Grid 6 colunas + sem video preview | `3ac7320` | +2 colunas para live, removido HLS preview no hover |
| ~11:15 | Splash Screen | `1124bdd` | Logo scale 0.5→1.1 (Spring) + fade 3s |
| ~11:27 | Parallax + Skeleton Shimmer | — | Hero parallax 0.3x, shimmer nos placeholders |
| ~11:28 | Deploy | — | APK com Splash + Parallax + Shimmer |
| ~11:30 | Badge 4K Electric Blue | — | `#00E5FF` para 4K/UHD, azul para FHD, verde para HD |
| ~11:32 | Staggered Entry | — | Cards entram em cascata com `will-change`, 25ms delay |
| ~11:36 | Badges sem sobreposição | — | Type à esquerda, Quality à direita, fontes reduzidas |
| ~11:37 | Info bar sólida | `4c219a4` | Layout `flex-col`, info bar `shrink-0` abaixo do conteúdo |
| ~11:37 | Deploy final | — | APK `NonoTV_v2026-04-04_11-37.apk` |

---

## 📊 Resumo de Commits

| Commit | Mensagem | Arquivos |
|--------|----------|----------|
| `f8c2cc0` | Restauração v4.9 funcional | `src/` completo |
| `fec29f5` | Restauração completa v4.9 | `src/` + configs |
| `2730b05` | Scroll fix + Server Tech Profiler | 4 arquivos |
| `df8dac9` | Server Tech no player | 2 arquivos |
| `5a10784` | Títulos responsivos e simetria | 3 arquivos |
| `e53412b` | Navegação unificada | 5 arquivos |
| `3ac7320` | Grid 6 colunas + sem video preview | 1 arquivo |
| `1124bdd` | Splash Screen cinematográfica | 2 arquivos |
| `b8f1b00` | Cartazes visíveis + botão Todos | 4 arquivos |
| `799a9d5` | Server Tech auto-correção | 3 arquivos |
| `602793d` | Revert auto-correção | 3 arquivos |
| `77041f9` | Parallax, Shimmer, Badge 4K, Staggered | 5 arquivos |
| `4c219a4` | Card layout — info bar sólida | 1 arquivo |

---

## 🎯 Lições Aprendidas

1. **NUNCA sobrescrever lógica funcional** — Sempre comparar com a versão que funciona
2. **CORS no WebView Android não existe** — XHR nativo funciona sem restrições
3. **Cache é traiçoeiro** — Mudanças na lógica exigem invalidação de cache
4. **Testar no dispositivo real** — Emulador não representa o Mi Stick
5. **Mudanças incrementais** — Uma mudança por vez, testar, commit, repetir
6. **Video preview no hover** é pesado demais para Mi Stick
7. **Animações `animate-in`** com delay travam a UI — usar `will-change` + CSS puro
8. **Servidores diferentes = tecnologias diferentes** — URLs sem extensão precisam de `?output=m3u8`

---

## 📦 Estado Final

- **Versão:** v4.9 + Melhorias de UI
- **Último commit:** `4c219a4`
- **Último APK:** `NonoTV_v2026-04-04_11-37.apk`
- **Google Drive:** ✅ Atualizado
- **Desktop:** ✅ `NonoTV_latest.apk`

---

*Documentado em 04/04/2026 às 11:40*
