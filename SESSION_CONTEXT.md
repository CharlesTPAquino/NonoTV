# NonoTV IPTV - Contexto da Sessão

> Documento de contexto para continuidade entre sessões
> Última atualização: 28/03/2026

---

## 📍 Onde Estávamos

- Projeto **NonoTV Elite 4K** - Aplicativo IPTV para Smart TVs/Android
- Localizado em: `/home/pcnono/Secretária/IPTV/meu-iptv`
- Repositório Git com histórico de commits
- Tentando restaurar interface da versão v19-26 que estava funcionando

---

## ✅ O Que Fizemos

### 1. Restauração da Interface TV UI / 10-foot Experience
Após problemas com a versão que causava tela preta, restauramos o design seguindo os prompts de Redesign:

#### CSS - Design System TV UI (`src/index.css`)
Adicionadas novas variáveis para experiência 10-foot:
- `--tv-bg-primary: #000000`
- `--tv-bg-secondary: rgba(20, 20, 20, 0.85)`
- `--tv-text-primary: #FFFFFF`
- `--tv-text-secondary: #B3B3B3`
- `--tv-focus-border: 3px solid #FFFFFF`
- `--tv-focus-bg: rgba(255, 255, 255, 0.2)`
- `--tv-accent: #E50914`

Novos componentes CSS:
- `.tv-focus` - Estado de foco para navegação via controle remoto
- `.tv-sidebar` - Sidebar expansível (72px → 256px ao focar)
- `.pill-button` - Botões estilo Netflix
- `.hero-gradient` - Gradiente para banners
- `.channel-card` - Efeito scale + borda branca no hover
- `.epg-row` - Linhas do guia de programação
- `.player-control` - Controles circulares do player
- `.channel-list-overlay` - Overlay de lista de canais

#### Sidebar (`src/components/Layout/Sidebar.jsx`)
- Layout responsivo: Desktop/TV + Mobile
- Botão de lista de canais (ícone List)
- Botão de configurações
- Sidebar expansível ao focar (efeito TV 10-foot)
- Categorias: Início, Ao Vivo, Filmes, Séries

#### Navbar (`src/components/Layout/Navbar.jsx`)
- **Pill Buttons** - Abas estilo Netflix
- Campo de busca
- Botões de ação: Lista Canais, Servidor, Configurações, Sair
- Indicador de status de sincronização
- Categorias: Recomendado, Filmes e Séries, Ao Vivo, Séries

#### App.jsx (`src/App.jsx`)
- Layout completo com background reflexivo
- ChannelListOverlay integrado com estados
- Sidebar com props `onOpenSettings` e `onOpenChannelList`
- Navbar com props para abrir overlays
- Estados de erro e carregamento
- Sync Status floating tab

### 2. Servidores IPTV Atualizados (`src/data/sources.js`)
Servidores testados e funcionando (28/03/2026):

| # | Nome | URL Base | Status |
|---|------|----------|--------|
| 1 | 123TV Premium | 123.123tv.to:8080 | ✅ OK |
| 2 | MeuServidor Top #1 | meusrv.top | ✅ OK |
| 3 | MeuServidor Top #2 | meusrv.top | ✅ OK |
| 4 | MeuServidor Top #3 | meusrv.top | ✅ OK |
| 5 | MeuServidor Top #4 | meusrv.top | ✅ OK |

Fontes abertas mantidas:
- IPTV-ORG (Global)
- Kazing Premium
- ZeroUm Filmes
- PlusTV (HLS)

### 3. Correções Técnicas
- **Tela preta**: Problema causado por imports incompletos no SourceContext
- **Integração ChannelListOverlay**: Adicionado ao App.jsx com estados necessários
- **Testes**: Barra de testes temporariamente desabilitada no deploy.sh

---

## 📂 Estrutura de Arquivos Principais

```
src/
├── App.jsx                          # App principal com UI TV
├── index.css                        # CSS com variáveis TV UI
├── context/
│   ├── SourceContext.jsx           # Gerenciamento de fontes
│   └── PlayerContext.jsx           # Player + EPG
├── services/
│   ├── SyncManager.js              # Favoritos, histórico, cache
│   ├── RetryService.js             # Retry + Circuit Breaker
│   ├── EPGService.js               # Guia de programação
│   └── streamService.js            # Streams
├── components/
│   ├── Layout/
│   │   ├── Sidebar.jsx             # TV Sidebar expansível
│   │   ├── Navbar.jsx              # Pill tabs Netflix
│   │   └── ServerSelector.jsx      # Dropdown fontes
│   ├── Channels/
│   │   ├── HeroSection.jsx         # Banner destaque
│   │   ├── ChannelCard.jsx         # Posters 2:3
│   │   ├── ChannelListOverlay.jsx  # Menu canais
│   │   └── ChannelGrid.jsx         # Grid canais
│   ├── Player/
│   │   ├── VideoPlayer.jsx         # Player principal
│   │   ├── EPGOverlay.jsx          # Guia programação
│   │   └── VodPlayer.jsx           # Player VOD
│   └── Settings/
│       └── SettingsPanel.jsx       # Painel config
└── data/
    └── sources.js                   # Servidores IPTV
```

---

## 🔧 Comandos Úteis

```bash
# Build + Deploy completo
./deploy.sh

# Apenas build web
npm run build

# Testes
npm test

# Sincronizar Android
npx cap sync android

# Iniciar proxy local (para desenvolvimento)
node proxy-local.cjs &
```

---

## 🎯 Para Onde Vamos

### Pendências Identificadas:
1. ✅ ChannelListOverlay integrado
2. ✅ Sidebar com botão de lista de canais
3. ✅ Servidores atualizados e funcionando
4. ✅ Interface TV UI restaurada

### Próximos Passos Sugeridos:
1. Verificar se APK está funcionando corretamente
2. Testar todos os servidores
3. Implementar sistema de health check (sem causar tela preta)
4. Adicionar mais validações de stream

---

## 📋 Notas Importantes

- **Proxy**: Em desenvolvimento usa `localhost:3131` para evitar CORS
- **Fontes**: 5 funcionando (123TV + 4 MeuServidor) + 4 abertas
- **Cache**: localStorage com TTL configurável
- **Interface**: TV UI / 10-foot Experience com glassmorphism

---

## 🔗 Links e Referências

- Deploy: `/home/pcnono/Desktop/NonoTV/NonoTV_latest.apk`
- Google Drive: Pasta Nono+ (ID: 1Xd5pLMdsikeEYGOTXEa0NTDzlreaseuv)
- Documentação servidores: `SERVIDORES_IPTV.md`
- APK de referência: `NonoTV_v2026-03-28_19-26.apk` (versão que funcionava)

---

*Este documento deve ser atualizado a cada sessão significativa de trabalho.*
