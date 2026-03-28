import React from 'react';
import { usePlayer } from '../../context/PlayerContext';
import VideoPlayer from './VideoPlayer';
import VodPlayer from './VodPlayer';

export default function UnifiedPlayer({ channel, channels, onClose }) {
  const { activeChannel } = usePlayer();

  const type = channel?.type || 'live';
  const isVod = type === 'movie' || type === 'series';

  if (isVod) {
    return <VodPlayer channel={channel} channels={channels} onClose={onClose} />;
  }

  return <VideoPlayer channel={channel} channels={channels} onClose={onClose} />;
}
