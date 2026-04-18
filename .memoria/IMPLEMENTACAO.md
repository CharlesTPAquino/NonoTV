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

## Atualização — 17/04/2026

### Auditoria e Limpeza de Código

#### Problema Identificado
Análise incorreta de código morto (taxa ~30-40% de acertividade).

**Erros cometidos:**
- Marquei arquivos como "mortos" que estavam em uso (HeroSection, ChannelCarousel, VodPlayer, etc)
- Não tracei corretamente as cadeias de import
- Assumi sem verificar

#### Metodologia Aplicada (Regra Clean-Code)
Seguindo a skill clean-code:
1. Rastrear TODOS os imports com `grep -r "import.*Arquivo" src/`
2. Verificar se é renderizado com `grep -r "<Arquivo" src/`
3. Testar build com `npm run build`
4. Confirmar cadeia completa (A→B→C)
5. Build passando é obrigatório para exclusão

#### Ação Corretiva — Regra registrada no AGENTS.md
Adicionada seção "REGRA DE ANÁLISE DE CÓDIGO" ao AGENTS.md:
- ❌ NUNCA sugere exclusão baseada em "acho que não usa"
- ✅ SEMPRE forneça evidência de grep com ZERO usos
- ✅ SEMPRE rode build e confirme que passa
- ✅ SE houver dúvida, pergunte antes de agir

#### Limpeza Realizada (14 arquivos removidos)

```
src/components/Player/
├── VideoPlayer.jsx       # Old, zero imports
├── UnifiedPlayer.jsx     # Não usado
├── MiniPlayer.jsx        # Zero imports
├── EPGOverlay.jsx        # Zero imports
├── EPGGrid.jsx           # Zero imports
└── VodPlayer.jsx         # Zero imports (era dependência de UnifiedPlayer)

src/components/Channels/
├── CategoryTiles.jsx     # Zero imports
├── CategorySection.jsx   # Zero imports
└── VirtualChannelGrid.jsx # Zero imports

src/components/UI/
├── StatsDashboard.jsx    # Zero imports
├── PullToRefresh.jsx     # Zero imports
├── ThemeToggle.jsx       # Zero imports
└── LockScreen.jsx        # Zero imports
```

#### Build após limpeza
✅ Build passando com sucesso

#### Arquivos Confirmados como VIVO (não removidos)
- HeroSection → ChannelGrid.jsx
- ChannelCarousel → ChannelGrid.jsx
- ChannelCard → Múltiplos usos
- ServerHealthDashboard → SettingsPanel.jsx
- DiagnosticPanel → SettingsPanel.jsx
- SyncTab → SettingsPanel.jsx
- ServerSelector → Navbar.jsx
- VideoPlayerMinimal → App.jsx

---

*Atualizado: 17/04/2026 19:30*
