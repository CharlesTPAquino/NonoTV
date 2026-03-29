import React from 'react';
import { usePlayer } from '../../context/PlayerContext';
import VideoPlayer from './VideoPlayer';

export default function UnifiedPlayer({ channel, channels, onClose }) {
  const { activeChannel } = usePlayer();

  console.log('[UnifiedPlayer] Renderizando player para:', channel?.name, channel?.type);

  return (
    <VideoPlayer 
      channel={channel} 
      channels={channels} 
      onClose={onClose} 
    />
  );
}