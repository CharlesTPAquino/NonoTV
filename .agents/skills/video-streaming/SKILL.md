# Video Streaming Skill

Habilidade especializada em streaming de vídeo com HLS.js e otimização de performance.

## Quando Usar
- Implementação de player de vídeo
- Problemas com streaming HLS
- Otimização de buffer e qualidade
- Detecção de codecs

## Comandos Úteis
```bash
npm run dev      # Dev server
npm run build    # Build produção
npm run lint     # ESLint
```

## Padrões HLS.js

### Configuração Ótima
```javascript
const hls = new Hls({
  enableWorker: true,
  lowLatencyMode: false,
  backBufferLength: 90,
  maxBufferLength: 40,
  maxMaxBufferLength: 90,
  manifestLoadingMaxRetry: 10,
  levelLoadingMaxRetry: 10,
  fragLoadingMaxRetry: 10,
  startLevel: -1,
  abrEwmaDefaultEstimate: 5000000
});
```

### Events Importantes
```javascript
hls.on(Hls.Events.MANIFEST_PARSED, ...)
hls.on(Hls.Events.ERROR, ...)
hls.on(Hls.Events.FRAG_BUFFERED, ...)
```

### Codec Detection
```javascript
video.canPlayType('video/mp4', 'avc1.42001E')
// Returns: 'probably', 'maybe', ou ''
```

## Troubleshooting

| Problema | Solução |
|----------|---------|
| CORS error | Usar proxy ou extensão |
| Buffer stalls | Aumentar `maxBufferLength` |
| Quality fixed | `hls.currentLevel = -1` para auto |
| Not playing | Verificar `video.play()` |

## Performance
- Lazy load HLS.js (~522KB)
- Code splitting por rota
- Memoização de componentes
- Skeleton loading states
