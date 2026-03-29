# Video Streaming Skill

## Quando Usar
- Implementação de players de vídeo
- Streaming HLS/DASH
- Otimização de buffer
- Detecção e seleção de codec
- Qualidade adaptativa (ABR)

## Conceitos Fundamentais

### HLS (HTTP Live Streaming)
- Formato: .m3u8 playlist
- Segmentos: .ts files
- Adaptive Bitrate: múltiplas qualidades

### Codecs de Vídeo
| Codec | Suporte | Qualidade |
|-------|---------|------------|
| H.264 | Universal | Boa |
| H.265/HEVC | Moderno | Excelente |
| VP9 | Chrome/Firefox | Boa |
| AV1 | Experimental | Excelente |

## Implementação com HLS.js

### Configuração Básica
```javascript
const hls = new Hls({
  enableWorker: true,
  lowLatencyMode: true,
  backBufferLength: 90,
  maxBufferLength: 40
});
hls.loadSource(url);
hls.attachMedia(video);
```

### Detecção de Codecs Suportados
```javascript
function detectSupportedCodecs(video) {
  const codecs = [];
  ['avc1.42001E', 'hvc1.1.L3.1', 'vp9'].forEach(codec => {
    if (video.canPlayType('video/mp4', codec)) {
      codecs.push(codec);
    }
  });
  return codecs;
}
```

### Seleção Automática de Qualidade
```javascript
function selectOptimalQuality(levels, networkSpeed, bufferLevel) {
  if (bufferLevel < 10) return levels[0]; // Baixa
  if (bufferLevel > 30) return levels[levels.length - 1]; // Alta
  // Média baseada na rede
  return levels.find(l => l.bitrate <= networkSpeed * 0.7);
}
```

## Métricas Importantes

| Métrica | Bom | Ruim |
|---------|-----|-------|
| Buffer | > 20s | < 5s |
| Latência | < 2s | > 5s |
| Bitrate | Auto | Fixado |
| Falhas retry | 0-2 | > 5 |

## Patterns Recomendados

### 1. Retry com Backoff
```javascript
async function retryWithBackoff(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (e) {
      await sleep(1000 * Math.pow(2, i));
    }
  }
}
```

### 2. Circuit Breaker
```javascript
let failures = 0;
const THRESHOLD = 10;
function call() {
  if (failures >= THRESHOLD) throw new Error('Circuit open');
  try {
    failures = 0;
    return doCall();
  } catch {
    failures++;
    throw;
  }
}
```

### 3. Prefetch de Canais
```javascript
function prefetchNext(currentIndex, channels) {
  const next = channels[currentIndex + 1];
  if (next) preloadChannel(next.url);
}
```

## Erros Comuns

1. **CORS bloqueando stream** - Usar proxy local ou modo no-cors
2. **Buffer underrun** - Aumentar maxBufferLength
3. **Codec incompatível** - Implementar fallback para H.264
4. **Memória vazando** - Destruir HLS instance ao mudar canal

## Recursos Adicionais
- Documentação HLS.js: https://github.com/video-dev/hls.js
- Teste de streams: https://test-streams.mux.dev/
- Detecção de codec: caniuse.com/#feat=video-alt-src
