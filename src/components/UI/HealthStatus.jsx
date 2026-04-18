import React from 'react';
import { Wifi, WifiOff, Activity } from 'lucide-react';

export default function HealthStatusBadge({ status, size = 'sm' }) {
  if (!status) return null;
  
  const { healthy, latency } = status;
  
  const iconSize = size === 'sm' ? 14 : 18;
  const containerClass = size === 'sm' 
    ? 'px-2 py-1 text-[10px]' 
    : 'px-3 py-2 text-xs';
  
  if (healthy) {
    return (
      <div className={`flex items-center gap-1.5 rounded-full bg-green-500/10 text-green-400 ${containerClass}`}>
        <Wifi size={iconSize} />
        {latency && <span>{latency}ms</span>}
      </div>
    );
  }
  
  return (
    <div className={`flex items-center gap-1.5 rounded-full bg-red-500/10 text-red-400 ${containerClass}`}>
      <WifiOff size={iconSize} />
      <span>Offline</span>
    </div>
  );
}

export function HealthSummary({ summary }) {
  if (!summary) return null;
  
  const { total, healthy, offline, lastCheck } = summary;
  
  return (
    <div className="flex items-center gap-4 px-3 py-2 bg-surface-card rounded-xl border border-border">
      <div className="flex items-center gap-2">
        <Activity size={16} className="text-white/50" />
        <span className="text-white/60 text-xs font-medium">
          Health Check
        </span>
      </div>
      
      <div className="flex items-center gap-3">
        <span className="text-green-400 text-xs font-bold">{healthy} Online</span>
        <span className="text-white/30">|</span>
        <span className="text-red-400 text-xs font-bold">{offline} Offline</span>
        <span className="text-white/30">|</span>
        <span className="text-white/40 text-xs">{total} Total</span>
      </div>
    </div>
  );
}