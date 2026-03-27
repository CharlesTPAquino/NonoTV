import React from 'react';
import { usePlayer } from '../../context/PlayerContext';
import VideoPlayer from './VideoPlayer';
import VodPlayer from './VodPlayer';

/**
 * Unified Player - Routes to correct player based on content type
 * 
 * Live TV (HLS) → VideoPlayer (with hls.js)
 * Movies (MP4/MKV) → VodPlayer (native)
 * Series (MP4) → VodPlayer (native)
 */
export default function UnifiedPlayer({ channel, channels, onClose }) {
  const { activeChannel } = usePlayer();

  const contentType = channel?.type || 'live';

  console.log('[UnifiedPlayer] Renderizando tipo:', contentType, channel?.name);

  switch (contentType) {
    case 'movie':
    case 'series':
      return (
        <VodPlayer 
          channel={channel} 
          channels={channels} 
          onClose={onClose} 
        />
      );
    
    case 'live':
    default:
      return (
        <VideoPlayer 
          channel={channel} 
          channels={channels} 
          onClose={onClose} 
        />
      );
  }
}