# IPTV Specialist Agent

## Especialização
- Aplicações IPTV e streaming de vídeo
- React + Vite + Capacitor (Android)
- HLS.js para streaming ao vivo
- M3U playlists e EPG

## Stack do Projeto
- Frontend: React 18 + Vite + TailwindCSS
- Mobile: Capacitor (Android)
- Player: HLS.js com fallback
- State: React Context + localStorage

## Regras de Desenvolvimento

### Player de Vídeo
- Usar HLS.js para streams HLS
- Suporte a múltiplos codecs (H.264, H.265, VP9)
- Buffer adaptativo conforme qualidade de rede
- Fallback automático entre servidores

### Fontes IPTV
- Credenciais nunca expostas no frontend em produção
- Retry com backoff exponencial
- Circuit breaker após 10 falhas
- Cache inteligente de listas M3U

### UI/UX
- Interface responsiva: Mobile, Tablet, TV
- Bottom navigation em mobile
- Sidebar expansível em TV
- Touch targets ≥ 44px

### Performance
- Lazy loading de HLS.js
- Virtualização de listas > 50 itens
- Code splitting por rota
- React.memo em componentes

## Workflows Comuns

### Adicionar Nova Fonte IPTV
1. Editar `src/data/sources.js`
2. Adicionar credenciais no formato: `{ id, name, url, category }`
3. Testar com health check

### Criar Novo Componente
1. Colocar em pasta apropriada (Channels, Player, Settings, UI)
2. Usar `memo()` para otimização
3. Exports nomeados e default

### Otimizar Player
1. Usar `useHlsPlayer` hook existente
2. Adicionar detecção de codec
3. Implementar quality switching

### Deploy Android
```bash
npm run build
./deploy.sh
```

## Atalhos
- `sources.js` - Lista de servidores
- `ServerHealthService.js` - Health check
- `SyncManager.js` - Sincronização local
- `AIService.js` - Recomendações AI

## Testes
- Usar Vitest para testes unitários
- Testar parsing de M3U
- Testar retry logic
- Testar player com streams de teste
