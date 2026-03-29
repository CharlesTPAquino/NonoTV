# Plano de Implementação - NonoTV Elite 4K

**Criado:** 29/03/2026  
**Versão:** 1.0

---

## 1. Funcionalidades por Prioridade

### 🔴 CRÍTICA (Fazer primeiro)

| # | Funcionalidade | Descrição | Arquivo(s) | Estimativa |
|---|----------------|-----------|------------|------------|
| 1 | **Corrigir credenciais expostas** | Remover senhas em texto plano do sources.js | `src/data/sources.js` | 2h |
| 2 | **Integrar ChannelListOverlay** | O componente existe mas não está integrado ao App | `src/components/ChannelListOverlay.jsx` | 4h |
| 3 | **Corrigir APK não carrega canais** | Debug e correção do sistema de sync no APK | `src/services/api.js`, `SyncService.js` | 4h |

### 🟠 ALTA (Fazer depois)

| # | Funcionalidade | Descrição | Arquivo(s) | Estimativa |
|---|----------------|-----------|------------|------------|
| 4 | **Health check automático** | Testar todas fontes em background a cada X minutos | `src/services/ServerHealthService.js` | 6h |
| 5 | **Dashboard de status** | Visualizar ping/latência de cada fonte em tempo real | Novo componente | 4h |
| 6 | **Continuar assistindo** | Mostrar últimos canais assistidos na tela inicial | `src/components/ContinueWatching.jsx` | 4h |
| 7 | **Sync de favoritos com nuvem** | Backup/restaurar favoritos via cloud (Firebase/Supabase) | Novo serviço | 8h |

### 🟡 MÉDIA (Planejado)

| # | Funcionalidade | Descrição | Arquivo(s) | Estimativa |
|---|----------------|-----------|------------|------------|
| 8 | **EPG completo** | Guia de programação integrado comCatch-up TV | `src/services/EPGService.js` | 12h |
| 9 | **Controle parental** | PIN para bloquear canais adultos | Novo componente | 6h |
| 10 | **Picture-in-Picture** | Assistir em mini-tela | Capacitor PiP plugin | 4h |
| 11 | **Downloads offline** | Baixar canais para assistir offline | Novo serviço | 16h |

### 🟢 BAIXA (Futuro)

| # | Funcionalidade | Descrição | Estimativa |
|---|----------------|-----------|------------|
| 12 | Multi-perfil (adultos, crianças) | 8h |
| 13 | Análise de velocidade de rede | 4h |
| 14 | Recomendação inteligente por IA | 20h |

---

## 2. Detalhamento das Funcionalidades Críticas

### 2.1 Corrigir Credenciais Expostas

**Problema:** Todas as senhas estão hardcoded em texto plano em `sources.js`

**Solução:** Usar variáveis de ambiente ou sistema de autenticação
```javascript
// Agora (INSECURE)
{ id: 'cdn4k-01', url: 'http://cdn4k.info/get.php?username=Evair83&password=Kshe99' }

// Futuro (SEGURO)
{ id: 'cdn4k-01', url: process.env.CDN4K_URL }
```

**Passos:**
1. Criar arquivo `.env` com todas as credenciais
2. Modificar `sources.js` para ler de variáveis de ambiente
3. Não commitar `.env` (já está no .gitignore)
4. Documentar como configurar no AGENTS.md

---

### 2.2 Integrar ChannelListOverlay

**Problema:** O componente existe em `src/components/ChannelListOverlay.jsx` mas não está sendo usado

**Solução:** Integrar ao fluxo principal do app

**Passos:**
1. Identificar onde o overlay deve ser disparado (botão de menu/canais)
2. Conectar com o SourceContext para buscar canais
3. Adicionar atalhos de teclado para TV
4. Testar no emulador

---

### 2.3 Corrigir APK não carrega canais

**Sintomas:**
- App abre mas não carrega lista de canais
- Logs mostram erros de CORS ou timeout

**Solução já implementada:**
- Sistema de fallback em `api.js` (CapacitorHttp → proxies → fetch)
- Debug logs ativados

**Verificações necessárias:**
1. Testar APK em dispositivo real
2. Verificar logs com `adb logcat | grep -i Nonotv`
3. Testar cada fonte manualmente

---

## 3. Estrutura de Serviços

```
src/services/
├── api.js                      # ✅ Fallback system (pronto)
├── SyncService.js              # ✅ Sync de canais
├── ServerHealthService.js      # ⚠️ Precisa de health check automático
├── RetryService.js             # ✅ Retry com backoff
├── AIService.js                # 🤖 AI recommendations (básico)
├── AISyncService.js            # 🤖 AI sync (básico)
├── EPGService.js              # 📺 EPG (beta)
├── PrefetchService.js         # 🚀 Pré-carregamento
├── SyncManager.js             # 🔄 Gerenciador de sync
├── channelCache.js            # 💾 Cache de canais
├── CloudSyncService.js        # ☁️ [NOVO] Sync nuvem
└── AuthService.js             # 🔐 [NOVO] Autenticação
```

---

## 4. Componentes por Tela

### Tela Inicial
- `HeroCarousel.jsx` - Carrossel de destaque
- `ContinueWatching.jsx` - [NOVO] Continuar assistindo
- `FavoriteChannels.jsx` - Canais favoritos
- `SourceSelector.jsx` - Seletor de fonte

### Player
- `VideoPlayer.jsx` - Player HLS principal
- `ChannelListOverlay.jsx` - Lista de canais (NÃO INTEGRADO)
- `EPGOverlay.jsx` - Guia de programação
- `QualitySelector.jsx` - Seletor de qualidade

### Settings
- `SettingsPanel.jsx` - Painel de configurações
- `SourceManager.jsx` - Gerenciar fontes
- `ServerStatusDashboard.jsx` - [NOVO] Status em tempo real

---

## 5. Ordens de Execução Sugeridas

### Sprint 1 (Esta semana)
- [ ] 1. Corrigir credenciais expostas (segurança)
- [ ] 2. Build e test APK com novas fontes
- [ ] 3. Integrar ChannelListOverlay

### Sprint 2 (Próxima semana)
- [ ] 4. Health check automático
- [ ] 5. Dashboard de status
- [ ] 6. Continuar assistindo

### Sprint 3 (2 semanas)
- [ ] 7. Sync de favoritos com nuvem
- [ ] 8. EPG completo + Catch-up
- [ ] 9. Controle parental

---

## 6. Como Testar Cada Funcionalidade

### Testar Fontes
```javascript
// No console do navegador
import { SOURCES } from './src/data/sources.js';
console.log('Fontes disponíveis:', SOURCES.length);
SOURCES.forEach(s => console.log(s.name, s.url));
```

### Testar Health Check
```javascript
// No console
import { ServerHealthService } from './src/services/ServerHealthService.js';
const results = await ServerHealthService.checkAllSources();
console.log(results);
```

### Testar APK (ADB)
```bash
adb logcat | grep -E "NonoTV|API|SyncService"
adb install android/app/build/outputs/apk/debug/NonoTV-debug.apk
```

---

## 7. Referências

- **AGENTS.md** - Guia para agentes de IA
- **AUDITORIA_COMPLETA.md** - Análise completa do projeto
- **CHANGELOG_V4.2.md** - Histórico de versões
- **Fontes:** `src/data/sources.js` (37 fontes ativas)
