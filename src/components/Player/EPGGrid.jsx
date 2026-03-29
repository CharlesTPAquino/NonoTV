import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Clock, Tv, RefreshCw, Play, Calendar, ArrowLeft, ArrowRight, GripVertical } from 'lucide-react';
import { 
  getAllChannelsWithEPG,
  getProgramsForChannel, 
  getProgramProgress, 
  isProgramLive, 
  isProgramUpcoming,
  formatTime,
  formatDuration,
  refreshEPG,
  buildCatchupUrl,
  getCatchupDaysAvailable
} from '../../services/EPGService';

const HOURS_TO_SHOW = 4;
const HOUR_WIDTH = 120;

export default function EPGGrid({ channel, epgData, onClose, onPlayChannel, allChannels }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [catchupDays, setCatchupDays] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showChannelList, setShowChannelList] = useState(true);
  const scrollRef = useRef(null);
  
  const channelsWithEPG = epgData ? getAllChannelsWithEPG(epgData) : [];
  const currentChannel = channel || channelsWithEPG[0];
  
  useEffect(() => {
    if (channel?.url) {
      const days = getCatchupDaysAvailable(channel.url);
      setCatchupDays(days);
    }
  }, [channel]);

  const handleRefresh = async () => {
    if (!channel?.url) return;
    setIsRefreshing(true);
    await refreshEPG(channel.url, true);
    setIsRefreshing(false);
  };

  const getProgramsForTimeRange = (channelId) => {
    if (!epgData?.channelPrograms?.[channelId]) return [];
    
    const now = new Date();
    const startOfView = new Date(selectedDate);
    startOfView.setHours(now.getHours(), 0, 0, 0);
    
    const endOfView = new Date(startOfView);
    endOfView.setHours(startOfView.getHours() + HOURS_TO_SHOW);
    
    return epgData.channelPrograms[channelId].filter(p => 
      p.stop > startOfView && p.start < endOfView
    );
  };

  const getProgramPosition = (program) => {
    const now = new Date();
    const startOfView = new Date(selectedDate);
    startOfView.setHours(now.getHours(), 0, 0, 0);
    
    const programStart = new Date(program.start);
    const programEnd = new Date(program.stop);
    
    const startOffset = (programStart - startOfView) / (1000 * 60 * 60);
    const duration = (programEnd - programStart) / (1000 * 60 * 60);
    
    return {
      left: Math.max(0, startOffset * HOUR_WIDTH),
      width: Math.max(HOUR_WIDTH * 0.25, duration * HOUR_WIDTH - 4)
    };
  };

  const navigateDate = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + direction);
    
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    if (newDate > today) return;
    if (catchupDays > 0) {
      const minDate = new Date();
      minDate.setDate(minDate.getDate() - catchupDays);
      if (newDate < minDate) return;
    }
    
    setSelectedDate(newDate);
  };

  const playCatchup = (program, ch) => {
    if (!ch?.url || !ch?.streamId) return;
    
    const catchupUrl = buildCatchupUrl(ch.url, ch.streamId, program.start, 120);
    if (catchupUrl) {
      onPlayChannel({
        ...ch,
        url: catchupUrl.timeshiftUrl,
        isCatchup: true,
        programTitle: program.title
      });
    }
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();
  
  const hours = Array.from({ length: HOURS_TO_SHOW }, (_, i) => {
    const now = new Date();
    now.setMinutes(0, 0, 0);
    now.setHours(now.getHours() + i);
    return now;
  });

  if (!epgData) {
    return (
      <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
            <Tv size={32} className="text-white/30" />
          </div>
          <h3 className="text-white font-black text-xl uppercase tracking-tight mb-2">Guia Indisponível</h3>
          <p className="text-white/40 text-sm mb-6">Este servidor não fornece programação EPG</p>
          <button onClick={onClose} className="px-8 py-3 bg-[#F7941D] text-black font-black text-xs uppercase tracking-wider rounded-xl">
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all">
            <X size={18} />
          </button>
          <div>
            <h2 className="text-white font-black text-lg uppercase tracking-tight flex items-center gap-2">
              <Tv size={18} className="text-[#F7941D]" />
              Grade de Programação
            </h2>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {catchupDays > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 bg-[#F7941D]/10 border border-[#F7941D]/20 rounded-full">
              <Calendar size={10} className="text-[#F7941D]" />
              <span className="text-[#F7941D] text-[9px] font-black uppercase">{catchupDays}d</span>
            </div>
          )}
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white/60 text-[10px] font-black uppercase tracking-wider hover:bg-white/10 transition-all disabled:opacity-50"
          >
            <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={() => setShowChannelList(!showChannelList)}
            className="flex items-center gap-1 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white/60 text-[10px] font-black uppercase tracking-wider hover:bg-white/10 transition-all"
          >
            <Tv size={12} />
            {showChannelList ? 'Ocultar' : 'Canais'}
          </button>
        </div>
      </div>

      {/* Date Navigation */}
      {catchupDays > 0 && (
        <div className="flex items-center justify-center gap-3 py-2 bg-white/5 border-b border-white/5 shrink-0">
          <button 
            onClick={() => navigateDate(-1)}
            className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all"
          >
            <ArrowLeft size={12} />
          </button>
          <div className="flex items-center gap-1 px-3 py-0.5 bg-white/5 rounded-lg">
            <Calendar size={10} className="text-[#F7941D]" />
            <span className="text-white text-xs font-bold">
              {selectedDate.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}
            </span>
          </div>
          <button 
            onClick={() => navigateDate(1)}
            disabled={isToday}
            className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all disabled:opacity-30"
          >
            <ArrowRight size={12} />
          </button>
        </div>
      )}

      {/* EPG Grid */}
      <div className="flex-1 flex overflow-hidden">
        {/* Channel List Sidebar */}
        {showChannelList && (
          <div className="w-40 shrink-0 border-r border-white/10 bg-black/40 overflow-y-auto custom-scrollbar">
            {channelsWithEPG.slice(0, 15).map((ch) => (
              <div 
                key={ch.id}
                className={`p-3 border-b border-white/5 cursor-pointer transition-all ${
                  currentChannel?.id === ch.id ? 'bg-[#F7941D]/10 border-l-2 border-l-[#F7941D]' : 'hover:bg-white/5'
                }`}
              >
                {ch.icon && <img src={ch.icon} alt={ch.name} className="w-8 h-8 object-contain mb-1" />}
                <p className="text-white text-[10px] font-bold truncate">{ch.name}</p>
              </div>
            ))}
          </div>
        )}

        {/* Time Grid */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden" ref={scrollRef}>
          <div className="min-w-max">
            {/* Time Header */}
            <div className="flex border-b border-white/10 bg-black/40 sticky top-0 z-10">
              <div className="w-10 shrink-0" />
              {hours.map((hour, i) => (
                <div 
                  key={i}
                  className="shrink-0 px-2 py-2 text-center border-l border-white/10"
                  style={{ width: HOUR_WIDTH }}
                >
                  <span className="text-white/60 text-[10px] font-black uppercase">
                    {hour.toLocaleTimeString('pt-BR', { hour: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>

            {/* Programs Row */}
            <div className="relative">
              {/* Channel Label */}
              <div className="absolute left-0 top-0 w-10 h-16 flex items-center justify-center bg-black/60 border-r border-b border-white/10 z-10">
                <GripVertical size={14} className="text-white/20" />
              </div>
              
              {/* Programs */}
              <div className="flex pl-10">
                {hours.map((hour, i) => (
                  <div 
                    key={i}
                    className="shrink-0 border-l border-white/5 h-16 relative"
                    style={{ width: HOUR_WIDTH }}
                  >
                    {getProgramsForTimeRange(currentChannel?.id).map((program, idx) => {
                      const pos = getProgramPosition(program);
                      const hourStart = new Date(selectedDate);
                      hourStart.setHours(hour.getHours(), 0, 0, 0);
                      
                      const isInThisHour = program.start < new Date(hourStart.getTime() + 60 * 60 * 1000) && 
                                         program.stop > hourStart;
                      
                      if (!isInThisHour) return null;
                      
                      const isLive = isProgramLive(program);
                      const isUpcoming = isProgramUpcoming(program);
                      
                      return (
                        <div
                          key={idx}
                          className={`absolute top-1 rounded-lg border overflow-hidden cursor-pointer transition-all hover:scale-[1.02] ${
                            isLive 
                              ? 'bg-[#F7941D]/20 border-[#F7941D]/40 z-10' 
                              : isUpcoming
                                ? 'bg-white/10 border-white/20'
                                : catchupDays > 0
                                  ? 'bg-white/5 border-white/10 hover:border-[#F7941D]'
                                  : 'bg-white/5 border-white/5 opacity-50'
                          }`}
                          style={{
                            left: pos.left - ((i) * HOUR_WIDTH) + 2,
                            width: pos.width,
                            height: 'calc(100% - 8px)'
                          }}
                          onClick={() => !isLive && catchupDays > 0 && !isUpcoming && playCatchup(program, currentChannel)}
                        >
                          <div className="p-1.5 h-full overflow-hidden">
                            <p className={`text-[9px] font-black truncate leading-tight ${
                              isLive ? 'text-[#F7941D]' : 'text-white/80'
                            }`}>
                              {program.title}
                            </p>
                            {isLive && (
                              <div className="flex items-center gap-1 mt-0.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                <span className="text-[8px] text-white/40">
                                  {Math.round(getProgramProgress(program))}% 
                                </span>
                              </div>
                            )}
                            {!isLive && !isUpcoming && catchupDays > 0 && (
                              <div className="flex items-center gap-1 mt-0.5">
                                <Clock size={8} className="text-white/30" />
                                <span className="text-[8px] text-white/30">Rewind</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-2 border-t border-white/10 bg-black/40 flex items-center justify-center gap-4 text-[9px] font-black uppercase tracking-wider text-white/30 shrink-0">
        <span className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-[#F7941D]/40" /> Ao Vivo
        </span>
        <span className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-white/20" /> Em Breve
        </span>
        {catchupDays > 0 && (
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-white/10" /> Catch-up
          </span>
        )}
      </div>
    </div>
  );
}
