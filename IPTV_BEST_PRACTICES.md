# IPTV Connection Best Practices - NonoTV

> Guidelines para conexão robusta com servidores IPTV  
> Atualizado: 02/04/2026

---

## 1. Connection Architecture

### Multi-Layer Fallback Strategy

```
┌─────────────────────────────────────────────────────────┐
│                    REQUISITION FLOW                      │
├─────────────────────────────────────────────────────────┤
│  APK (Nativo):                                           │
│     1. Fetch Direto (25s timeout)                        │
│     2. Proxies Públicos (fallback)                        │
│                                                          │
│  Web:                                                     │
│     1. Proxies Públicos                                  │
│     2. Fetch Direto (fallback)                            │
│                                                          │
│  DEV:                                                     │
│     1. Proxy Local (localhost:3131)                      │
│     2. Fetch Direto                                      │
│     3. Proxies Públicos                                 │
└─────────────────────────────────────────────────────────┘
```

### Timeout Configuration

| Layer | Timeout | Retry |
|-------|----------|-------|
| Fetch Direto | 25s | Sequencial via proxies |
| Public Proxy | 25s | 2x |
| Proxy Local | 25s | 1x |

### Public Proxies (CORS Bypass)

```javascript
const PUBLIC_PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?'
];
```

---

## 2. Health Check Strategy

### Sequential Testing

```javascript
// Testar direto primeiro, depois proxy
async function testSource(source) {
  const directResult = await tryDirect(source.url);
  if (directResult) return { online: true, method: 'direct' };
  
  const proxyResult = await tryProxy(source.url);
  if (proxyResult) return { online: true, method: 'proxy' };
  
  return { online: false };
}
```

### Cache Duration

| Check Type | Duration | Reason |
|------------|----------|--------|
| Startup | 5 min | Evitar lentidão |
| Manual | 30s | Resposta imediata |
| Background | 10 min | Não bloquear UI |

### Health Status Indicators

1. **Servidores Online** → Verde 🟢
2. **Servidores Offline** → Vermelho 🔴
3. **Não testado** → Cinza ⚪

---

## 3. Smart Server Selection

### Success Rate Tracking

```javascript
function getSuccessRate(sourceId) {
  const health = getSourceHealth(sourceId);
  const { failures = 0, successes = 0 } = health;
  const total = failures + successes;
  return total > 0 ? successes / total : 0.5;
}
```

### Ordering Criteria

1. **Taxa de sucesso** (maior primeiro)
2. **Menor número de falhas**
3. **Último acesso bem-sucedido**
4. **Data de vencimento** (mais longo primeiro)

---

## 4. Error Handling

### Error Categories

| Error | Message | Action |
|-------|---------|--------|
| TIMEOUT | "Servidor demorando..." | Fallback para próximo proxy |
| NETWORK | "Sem conexão..." | Fallback para fetch direto |
| AUTH | "Credenciais inválidas" | Marcar como inválido |
| BLOCKED | "Muitas falhas..." | Circuit Breaker |
| PARSE | "Lista vazia..." | Tentar próximo servidor |

### Retry Strategy (Sem CapacitorHttp)

```javascript
// Retry via proxies públicos sequenciais
const PUBLIC_PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?'
];

async function syncSource(url) {
  // APK: fetch direto → proxies
  // Web: proxies → fetch direto
}
```

### Circuit Breaker

```javascript
{
  threshold: 10,      // Falhas antes de bloquear
  duration: 2 * 60 * 1000,  // 2 minutos
}
```

---

## 5. Stream Optimization

### Buffer Strategy by Type

| Tipo | Buffer Min | Buffer Target | Buffer Max | Latência | Retry |
|------|------------|---------------|------------|----------|-------|
| Live | 8s | 15s | 25s | 3s | 8x (100ms) |
| Movie | 15s | 30s | 60s | 8s | 5x (500ms) |
| Series | 10s | 25s | 45s | 5s | 5x (400ms) |

### HLS Configuration

```javascript
const LIVE_CONFIG = {
  lowLatencyMode: true,
  backBufferLength: 10,
  maxBufferLength: 15,
  maxMaxBufferLength: 20,
  liveSyncDurationCount: 2,
  liveMaxLatencyDurationCount: 3,
  fragLoadingMaxRetry: 8,
  fragLoadingRetryDelay: 100
};

const VOD_CONFIG = {
  backBufferLength: 30,
  maxBufferLength: 40,
  maxMaxBufferLength: 60,
  fragLoadingMaxRetry: 3,
  fragLoadingRetryDelay: 500
};
```

### Hardware Acceleration

```javascript
// Habilitar aceleração de hardware
video.style.transform = 'translateZ(0)';
video.style.willChange = 'auto';
video.setAttribute('playsinline', '');
video.setAttribute('webkit-playsinline', 'true');
```

### Adaptive Bitrate by Network

| Network | Bitrate | Buffer | Max Level |
|---------|---------|--------|-----------|
| slow-2g | 300kbps | 10s | 0 |
| 2g | 500kbps | 15s | 1 |
| 3g | 1Mbps | 20s | 2 |
| 4g | 3Mbps | 15s | -1 (auto) |
| wifi | 5Mbps | 10s | -1 (auto) |

### Buffer Levels

| Level | Buffer | Action |
|-------|--------|--------|
| 🟢 Bom | > 15s | Alta qualidade |
| 🟡 Warning | 8-15s | Manter qualidade |
| 🔴 Critical | < 8s | Reduzir qualidade |
| ⚫ Stall | < 3s | Pausar para buffer |

### Error Recovery

```
ERRO detected
     │
     ├── bufferStalledError ──► startLoad() em 100ms
     │
     ├── timeout ──► retry em 200ms
     │
     ├── NETWORK_ERROR ──► retry (max 5x) ──► recreate player
     │
     └── MEDIA_ERROR ──► recoverMediaError()
```

---

## 6. Performance Metrics

### Key Metrics to Track

| Metric | Target | Alert |
|--------|--------|-------|
| Connection Time | < 5s | > 15s |
| Channel Load Time | < 3s | > 10s |
| Buffering Ratio | < 5% | > 15% |
| Success Rate | > 80% | < 50% |
| Fallback Success | > 90% | < 70% |

### Logging Format

```javascript
console.log('[SOURCE] Tentando servidor:', { name, attempt, timeout });
console.log('[SOURCE] Sucesso:', { method, latency, channelCount });
console.log('[SOURCE] Falha:', { error, fallback: true/false });
console.log('[CIRCUIT] Bloqueado:', { source, until });
```

---

## 7. Security Best Practices

### Credential Handling

- ✅ Usar HTTPS quando disponível
- ✅ Credenciais em variáveis de ambiente
- ✅ Não exponhar em logs
- ✅ Cache local criptografado (IndexedDB)

### Request Headers

```javascript
const headers = {
  'User-Agent': 'VLC/3.0.18 or NonoTV/4.2',
  'Accept': '*/*',
  'Accept-Language': 'pt-BR,pt;q=0.9',
  'Connection': 'keep-alive'
};
```

---

## 8. Testing Checklist

### Pre-Production Tests

- [ ] Timeout em diferentes redes (4G, WiFi, 3G)
- [ ] Fallback automático após falha
- [ ] Circuit breaker ativa após 10 falhas
- [ ] Health check paralelo não bloqueia UI
- [ ] Servidor ordenado por performance
- [ ] Buffering não causa crash
- [ ] Credenciais inválidas detectadas

### Monitoramento

```javascript
// Métricas a trackear
const metrics = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  averageLatency: 0,
  fallbackUsed: 0,
  circuitBreakerTriggered: 0
};
```

---

## 9. Implementation Files

| File | Responsibility |
|------|----------------|
| `src/services/api.js` | HTTP requests com fallback |
| `src/services/SmartServerOrchestrator.js` | Health check e ordenação |
| `src/services/RetryService.js` | Retry e circuit breaker |
| `src/context/SourceContext.jsx` | Estado global das fontes |
| `src/hooks/useHlsPlayer.js` | Player HLS otimizado |

---

## 10. Quick Reference

### Command Testing

```bash
# Testar servidor
curl -s "http://servidor:80/get.php?username=X&password=Y&type=m3u_plus" | head -5

# Verificar se retorna M3U
# Sucesso: #EXTM3U
# Falha: HTML error ou timeout
```

### Debug Mode

```javascript
// Ativar logs detalhados
localStorage.setItem('debug', 'true');

// Ver no console:
// [API] syncSource chamada para: ...
// [SOURCE] Tentando servidor: ...
// [CIRCUIT] Bloqueado: ...
```

---

## 11. Stream Optimization (Live/VOD/Series)

### Buffer Strategy by Type

| Tipo | Buffer Min | Buffer Target | Buffer Max | Latência |
|------|------------|---------------|------------|----------|
| Live | 8s | 15s | 25s | 3s |
| Movie | 15s | 30s | 60s | 8s |
| Series | 10s | 25s | 45s | 5s |

### HLS.js Optimization

```javascript
const LIVE_CONFIG = {
  lowLatencyMode: true,
  backBufferLength: 10,
  maxBufferLength: 15,
  maxMaxBufferLength: 20,
  liveSyncDurationCount: 2,
  liveMaxLatencyDurationCount: 3,
  fragLoadingMaxRetry: 8,
  fragLoadingRetryDelay: 100
};

const VOD_CONFIG = {
  backBufferLength: 30,
  maxBufferLength: 40,
  maxMaxBufferLength: 60,
  fragLoadingMaxRetry: 3,
  fragLoadingRetryDelay: 500
};
```

### Hardware Acceleration

```javascript
// Habilitar aceleração de hardware
video.style.transform = 'translateZ(0)';
video.style.willChange = 'auto';
video.setAttribute('playsinline', '');
video.setAttribute('webkit-playsinline', 'true');

// Detectar suporte
function detectHardwareCapabilities() {
  return {
    isMobile: /Android|webOS|iPhone|iPad/i.test(navigator.userAgent),
    isAndroid: /Android/i.test(navigator.userAgent),
    isChrome: /Chrome/i.test(navigator.userAgent),
    hasHardwareAcceleration: true // Android/Chrome
  };
}
```

### Retry Logic Optimized

```javascript
// Retry rápido para streams
const RETRY_CONFIG = {
  maxRetries: 8,
  baseDelay: 100,
  maxDelay: 2000,
  exponentialBackoff: true
};

// Em caso de erro:
// 1. Timeout/abort → retry imediato (100ms)
// 2. Buffer stall → recoveryMediaError()
// 3. Network error → restartLoad() com 300ms delay
// 4. Após 5 falhas → recreate player em 1s
```

### Network Detection

```javascript
const NETWORK_CONDITIONS = {
  'slow-2g': { bitrate: 300000, maxLevel: 0, buffer: 10 },
  '2g': { bitrate: 500000, maxLevel: 1, buffer: 15 },
  '3g': { bitrate: 1000000, maxLevel: 2, buffer: 20 },
  '4g': { bitrate: 3000000, maxLevel: -1, buffer: 15 },
  'wifi': { bitrate: 5000000, maxLevel: -1, buffer: 10 }
};

// Usar navigator.connection para detectar
const connection = navigator.connection;
const effectiveType = connection.effectiveType; // slow-2g, 2g, 3g, 4g
const downlink = connection.downlink; // Mbps
const rtt = connection.rtt; // ms
```

### Performance Metrics

| Métrica | Bom | Ruim |
|---------|-----|------|
| Buffer Level | > 15s | < 5s |
| Network Score | > 70% | < 40% |
| Retry Count | < 3 | > 5 |
| Latência | < 5s | > 10s |

### Error Recovery Flow

```
ERRO detected
     │
     ├── bufferStalledError ──► startLoad() em 100ms
     │
     ├── timeout/abort ──► retry em 200ms
     │
     ├── NETWORK_ERROR ──► retry (max 5x) ──► recreate player
     │
     └── MEDIA_ERROR ──► recoverMediaError()
```

---

*Documento atualizado em 02/04/2026*
*Projeto: NonoTV Elite 4K v4.2*
