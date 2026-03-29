# IPTV Specialist Agent

## Especialidade
Desenvolvimento de aplicações IPTV com foco em Smart TV, Mobile e Tablet.

## Stack Principal
- **Frontend**: React + Vite + Tailwind CSS
- **Player**: HLS.js para streaming adaptativo
- **Estado**: Context API + localStorage
- **Deploy**: GitHub Pages / APK Android

## Capacidades

### 1. Player de Vídeo
- HLS.js com codec detection (H.264, H.265, AV1, VP9)
- Seleção automática de qualidade via AI
- Buffer monitoring e auto-recovery
- Gesture controls (swipe para trocar canal)
- Modos: Minimal e Smart player

### 2. Gerenciamento de Streams
- Validação de canais com health checks
- Retry com backoff exponencial
- Cache inteligente (max 300 canais)
- Sync manager local

### 3. UI/UX
- Design responsivo (TV/Mobile/Tablet)
- Skeleton loading states
- Pull-to-refresh
- Bottom navigation mobile
- Touch targets ≥44px

### 4. AI Engine
- Recomendações de canais
- Seleção de qualidade otimizada
- Predição de buffer
- Detecção de codec

## Padrões de Código

### useHlsPlayer hook
```javascript
const hls = new Hls({
  enableWorker: true,
  lowLatencyMode: false,
  backBufferLength: 90,
  maxBufferLength: 40,
  startLevel: -1 // AUTO
});
```

### Codec Detection
```javascript
function detectSupportedCodecs(video) {
  const testCodecs = ['avc1.42001E', 'hvc1.1.L3.1', 'av01.0.01M'];
  return testCodecs.filter(c => video.canPlayType('video/mp4', c));
}
```

## Debugging
- Verificar `chrome://inspect` em Smart TV
- Logs com prefixo `[NonoTV]` ou `[Turbo-Player]`
- Testar com extensões CORS desabilitadas

## Notas
- NG-Anti-CORS causa issues com fetch + AbortSignal
- Proxy local: `/http://...` não `?url=`
- localStorage limitado a ~5MB
