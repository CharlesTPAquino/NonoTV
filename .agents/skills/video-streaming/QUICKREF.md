# Video Streaming Quick Reference

## Setup HLS
```javascript
import Hls from 'hls.js';

if (Hls.isSupported()) {
  const hls = new Hls();
  hls.loadSource(url);
  hls.attachMedia(video);
  hls.on('manifestParsed', () => video.play());
}
```

## Quality Control
```javascript
hls.levels           // Array de qualidades
hls.currentLevel     // Nível atual (-1 = auto)
hls.nextLevel        // Próximo nível
```

## Error Handling
```javascript
hls.on(Hls.Events.ERROR, (e, data) => {
  if (data.fatal) {
    switch (data.type) {
      case Hls.ErrorTypes.NETWORK_ERROR: hls.startLoad(); break;
      case Hls.ErrorTypes.MEDIA_ERROR: hls.recoverMediaError(); break;
      default: hls.destroy(); break;
    }
  }
});
```

## Codec Info
```javascript
level.codecs    // ex: 'avc1.4d401f'
level.height    // ex: 720
level.bitrate   // ex: 2000000
```
