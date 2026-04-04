# Memória de Implementação - NonoTV Elite 4K

## Quem sou eu
- **Nome:** OpenCode (assistente de IA)
- **Função:** Auxiliar em desenvolvimento de software

## Dono do Projeto
- **Nome:** Charles
- **Contato:** (não salvo por segurança)

---

## Contexto do Projeto

### Objetivo
Desenvolver o NonoTV Elite 4K - um app IPTV para Android com experiência premium.

### Estrutura do Projeto
```
/home/pcnono/Secretária/IPTV/meu-iptv/
├── src/
│   ├── services/         # Lógica de negócio
│   │   ├── api.js        # Conexão com servidores
│   │   ├── SyncService.js
│   │   ├── ServerHealthService.js
│   │   ├── RetryService.js
│   │   └── ...
│   ├── data/
│   │   ├── sources.js    # Lista de servidores
│   │   └── credentials.js # Credenciais
│   └── context/
│       └── SourceContext.jsx
├── android/              # Build nativo
├── .planning/           # GSD workflow
├── .memoria/            # Este arquivo
└── NonoTV_*.apk        # Builds
```

---

## Problema Crítico Resolvido

### Issue: Sync Loading Eterno

**Sintoma:** O app ficava tentando carregar indefinidamente ao conectar em servidores.

**Causa:** 
1. CapacitorHttp travando em alguns dispositivos
2. Timeouts muito longos (60s)
3. Health check automático na inicialização

**Solução Implementada:**
1. Removido CapacitorHttp completamente
2. Usar apenas fetch direto → proxy público
3. Timeout: 20s por tentativa, 45s global
4. Health check manual (Settings > Status)
5. Ordem: direto primeiro, proxy como fallback

**Arquivos alterados:**
- `src/services/api.js`
- `src/services/ServerHealthService.js`
- `src/context/SourceContext.jsx`

---

## Problema 2: Player Controls

### Issue: Controles do Player

**Sintoma:**
- Ícones de play ficam sempre visíveis
- Botão X não fecha
- Volume não altera
- Só funciona quando expande o player

**Causa:**
- `showControls` não escondia corretamente
- Volume não era aplicado no elemento de vídeo
- Hls.js sobrepondo controles nativos

**Solução Implementada:**
- Controles somem após 3 segundos
- Botão X sempre visível no canto
- Volume aplicado diretamente no video element
- Layout simplificado (estilo Netflix/Youtube básico)

**Arquivos alterados:**
- `src/components/Player/VideoPlayerMinimal.jsx`

---

## Servidores Ativos (29/03/2026)

| ID | Nome | Expira |
|----|------|--------|
| ramys-01 | Ramys (33174554) | 28/03/2026 |
| ramys-02 | Ramys (89347528) | 10/03/2027 |
| brazilzao-01 | Brazilzão (ian123) | 16/04/2026 |
| + outros 35 servidores | Mix | Various |

---

## Histórico de Commits

| Commit | Data | Descrição |
|--------|------|-----------|
| db86d22 | 29/03/2026 | fix: remove CapacitorHttp e usa apenas proxies públicos |

---

## Builds Gerados

| Arquivo | Data | Status |
|---------|------|--------|
| NonoTV_v2026-03-29_20-30.apk | 29/03/2026 20:30 | ✅ Último (Player corrigido) |

---

## Regras de Desenvolvimento

1. Sempre editar em `/home/pcnono/Secretária/IPTV/meu-iptv/src/`
2. Não deletar arquivos .md ou documentação
3. Usar GSD workflow para planejar fases
4. Atualizar STATE.md após cada sessão
5. Commitar mudanças importantes

---

## Contato / Debug

Para debug no Android (sem ADB disponível):
- Adicionar console.log com prefixos claros: `[API]`, `[APK]`, `[SourceContext]`
- Verificar erros em Settings > Status

---

*Atualizado: 29/03/2026 20:00*
