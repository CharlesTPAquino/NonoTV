import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Grid } from 'react-window';
import ChannelCard from './ChannelCard';

const GRID_CONFIG = {
  sm: { columns: 2, columnWidth: 140, rowHeight: 200 },
  md: { columns: 3, columnWidth: 180, rowHeight: 240 },
  lg: { columns: 4, columnWidth: 200, rowHeight: 260 },
  xl: { columns: 5, columnWidth: 210, rowHeight: 270 },
  '2xl': { columns: 6, columnWidth: 220, rowHeight: 280 },
};

function useMediaQuery(query) {
  const getMatches = (query) => {
    if (typeof window !== 'undefined') return window.matchMedia(query).matches;
    return false;
  };
  
  const [matches, setMatches] = useState(() => getMatches(query));
  
  useEffect(() => {
    const matchMedia = window.matchMedia(query);
    const handleChange = () => setMatches(matchMedia.matches);
    
    matchMedia.addEventListener('change', handleChange);
    return () => matchMedia.removeEventListener('change', handleChange);
  }, [query]);
  
  return matches;
}

function Cell({ columnIndex, rowIndex, style, data }) {
  const { channels, columnCount, onPlay, isPlayerOpen } = data;
  const index = rowIndex * columnCount + columnIndex;
  
  if (index >= channels.length) return null;
  
  const channel = channels[index];
  
  return (
    <div style={{ 
      padding: '8px'
    }}>
      <ChannelCard 
        channel={channel} 
        onPlay={() => onPlay(channel)} 
        index={index}
        isPlayerOpen={isPlayerOpen}
      />
    </div>
  );
}

export default function VirtualChannelGrid({ 
  channels, 
  onPlay, 
  isPlayerOpen 
}) {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  const isSm = useMediaQuery('(min-width: 640px) and (max-width: 767px)');
  const isMd = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
  const isLg = useMediaQuery('(min-width: 1024px) and (max-width: 1279px)');
  const isXl = useMediaQuery('(min-width: 1280px) and (max-width: 1535px)');
  const is2xl = useMediaQuery('(min-width: 1536px)');
  
  const config = useMemo(() => {
    if (is2xl) return GRID_CONFIG['2xl'];
    if (isXl) return GRID_CONFIG.xl;
    if (isLg) return GRID_CONFIG.lg;
    if (isMd) return GRID_CONFIG.md;
    if (isSm) return GRID_CONFIG.sm;
    return GRID_CONFIG.sm;
  }, [isSm, isMd, isLg, isXl, is2xl]);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const columnCount = Math.max(1, Math.floor(dimensions.width / config.columnWidth));
  const rowCount = Math.ceil(channels.length / columnCount);

  const cellData = useMemo(() => ({
    channels,
    columnCount,
    onPlay,
    isPlayerOpen
  }), [channels, columnCount, onPlay, isPlayerOpen]);

  if (!dimensions.width || !channels.length) {
    return (
      <div ref={containerRef} className="h-[60vh] flex items-center justify-center">
        <div className="text-white/30 font-black uppercase tracking-widest text-xs">
          Carregando...
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="h-[70vh] w-full">
      <Grid
        columnCount={columnCount}
        columnWidth={dimensions.width / columnCount}
        height={dimensions.height}
        rowCount={rowCount}
        rowHeight={config.rowHeight}
        width={dimensions.width}
        overscanCount={2}
        className="scrollbar-thin"
        cellComponent={Cell}
        cellProps={cellData}
      />
    </div>
  );
}
