# Video Streaming - Quick Reference

## Setup HLS.js
```javascript
import Hls from 'hls.js';

const config = {
  enableWorker: true,
  lowLatencyMode: false,
  backBufferLength: 90,
  maxBufferLength: 40,
  maxMaxBufferLength: 90,
  startLevel: -1 // AUTO
};

const hls = new Hls(config);
hls.loadSource('https://example.com/stream.m3u8');
hls.attachMedia(videoElement);
```

## Events Importantes
```javascript
hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
  console.log('Qualidades disponíveis:', data.levels);
});

hls.on(Hls.Events.ERROR, (_, data) => {
  if (data.fatal) {
    switch (data.type) {
      case Hls.ErrorTypes.NETWORK_ERROR:
        hls.startLoad();
        break;
      case Hls.ErrorTypes.MEDIA_ERROR:
        hls.recoverMediaError();
        break;
    }
  }
});

hls.on(Hls.Events.FRAG_BUFFERED, () => {
  console.log('Segmento carregado');
});
```

## Qualidade Adaptativa
```javascript
// Mudar qualidade manual
hls.currentLevel = 2; // 0 = menor, -1 = auto

// Listener de mudança
hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
  console.log('Qualidade mudada para:', data.level);
});
```

## Buffer Monitor
```javascript
function getBufferLevel(video) {
  if (video.buffered.length === 0) return 0;
  const end = video.buffered.end(video.buffered.length - 1);
  return end - video.currentTime;
}
```

## Codecs
```javascript
const codecSupport = {
  h264: video.canPlayType('video/mp4', 'avc1.42001E'),
  h265: video.canPlayType('video/mp4', 'hvc1.1.L3.1'),
  vp9: video.canPlayType('video/webm', 'vp9')
};
```
