import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Clock, Tv, RefreshCw, Play, Calendar, ArrowLeft, ArrowRight } from 'lucide-react';
import { 
  getProgramsForChannel, 
  getProgramProgress, 
  isProgramLive, 
  isProgramUpcoming,
  formatTime,
  formatDuration,
  getChannelByName,
  refreshEPG,
  buildCatchupUrl,
  getCatchupDaysAvailable
} from '../../services/EPGService';

export default function EPGOverlay({ channel, epgData, onClose, onPlayChannel, allChannels }) {
  const [selectedChannelId, setSelectedChannelId] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [catchupDays, setCatchupDays] = useState(0);

  useEffect(() => {
    if (epgData && channel && !selectedChannelId) {
      const matchedChannel = getChannelByName(epgData, channel.name);
      if (matchedChannel) {
        setSelectedChannelId(matchedChannel.id);
      } else {
        const firstChannelWithEPG = Object.keys(epgData.channelPrograms || {})[0];
        if (firstChannelWithEPG) setSelectedChannelId(firstChannelWithEPG);
      }
    }
  }, [epgData, channel, selectedChannelId]);

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

  const programs = selectedChannelId && epgData 
    ? getProgramsForChannel(epgData, selectedChannelId, 6)
    : [];

  const currentChannel = selectedChannelId && epgData?.channelMap?.[selectedChannelId];

  const navigateChannels = (direction) => {
    if (!epgData?.channelPrograms) return;
    const channelIds = Object.keys(epgData.channelPrograms);
    const currentIdx = channelIds.indexOf(selectedChannelId);
    if (currentIdx === -1) return;
    
    const newIdx = direction === 'next' 
      ? (currentIdx + 1) % channelIds.length
      : (currentIdx - 1 + channelIds.length) % channelIds.length;
    
    setSelectedChannelId(channelIds[newIdx]);
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

  const playCatchup = (program) => {
    if (!channel?.url || !channel?.streamId) return;
    
    const catchupUrl = buildCatchupUrl(channel.url, channel.streamId, program.start, 120);
    if (catchupUrl) {
      onPlayChannel({
        ...channel,
        url: catchupUrl.timeshiftUrl,
        isCatchup: true,
        programTitle: program.title
      });
    }
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  if (!epgData) {
    return (
      <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
            <Tv size={32} className="text-white/30" />
          </div>
          <h3 className="text-white font-black text-xl uppercase tracking-tight mb-2">Guia Indisponível</h3>
          <p className="text-white/40 text-sm mb-6">Este servidor não fornece programação EPG</p>
          <button onClick={onClose} className="px-8 py-3 bg-white text-black font-black text-xs uppercase tracking-wider rounded-xl">
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all">
            <X size={20} />
          </button>
          <div>
            <h2 className="text-white font-black text-2xl uppercase tracking-tight flex items-center gap-3">
              <Tv size={24} className="text-white/50" />
              Guia de Programação
            </h2>
            <p className="text-white/40 text-xs font-black uppercase tracking-widest">
              {currentChannel?.name || channel?.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {catchupDays > 0 && (
            <div className="flex items-center gap-1 mr-4 px-3 py-1 bg-white/10 border border-white/20/20 rounded-full">
              <Calendar size={12} className="text-white/50" />
              <span className="text-white/50 text-[10px] font-black uppercase">{catchupDays} dias</span>
            </div>
          )}
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white/60 text-xs font-black uppercase tracking-wider hover:bg-white/10 transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            Atualizar
          </button>
        </div>
      </div>

      {/* Date Navigation */}
      {catchupDays > 0 && (
        <div className="flex items-center justify-center gap-4 py-3 bg-white/5 border-b border-white/5">
          <button 
            onClick={() => navigateDate(-1)}
            className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all focus:ring-2 focus:ring-white/50 focus:outline-none"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2 px-4 py-1 bg-white/5 rounded-xl">
            <Calendar size={14} className="text-white/50" />
            <span className="text-white font-black text-sm">
              {selectedDate.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}
            </span>
          </div>
          <button 
            onClick={() => navigateDate(1)}
            disabled={isToday}
            className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed focus:ring-2 focus:ring-white/50 focus:outline-none"
          >
            <ArrowRight size={20} />
          </button>
        </div>
      )}

      {/* Channel Navigation */}
      <div className="flex items-center justify-between px-6 py-3 bg-white/5 border-b border-white/5">
        <button 
          onClick={() => navigateChannels('prev')}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-white/40 text-xs font-black uppercase tracking-wider hover:bg-white/10 hover:text-white transition-all"
        >
          <ChevronLeft size={16} />
          Anterior
        </button>
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-white/50" />
          <span className="text-white/60 text-xs font-black uppercase tracking-widest">
            {programs.length} programas • {formatDuration(new Date(), new Date(Date.now() + 6 * 60 * 60 * 1000))}
          </span>
        </div>
        <button 
          onClick={() => navigateChannels('next')}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-white/40 text-xs font-black uppercase tracking-wider hover:bg-white/10 hover:text-white transition-all"
        >
          Próximo
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Programs List */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {programs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Tv size={48} className="text-white/20 mb-4" />
            <p className="text-white/40 font-black uppercase tracking-widest text-sm">Sem Programação</p>
          </div>
        ) : (
          <div className="space-y-3">
            {programs.map((program, idx) => {
              const progress = getProgramProgress(program);
              const isLive = isProgramLive(program);
              const isUpcoming = isProgramUpcoming(program);
              
              return (
                <div
                  key={idx}
                  className={`relative group p-5 rounded-2xl border transition-all duration-300 overflow-hidden ${
                    isLive 
                      ? 'bg-white/10 border-white/15 ' 
                      : isUpcoming
                        ? 'bg-white/5 border-white/10 hover:bg-white/10'
                        : 'bg-white/5 border-white/5 opacity-60'
                  }`}
                >
                  {/* Progress Bar */}
                  {isLive && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-white/10">
                      <div 
                        className="h-full bg-white " 
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                  
                  <div className="flex items-start gap-5">
                    {/* Time Column */}
                    <div className="w-20 shrink-0">
                      <div className="flex items-center gap-1 text-white/50 mb-1">
                        {isLive && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                        {isLive && <span className="text-[9px] font-black uppercase tracking-wider">AO VIVO</span>}
                      </div>
                      <p className={`font-black text-sm ${isLive ? 'text-white/50' : 'text-white/60'}`}>
                        {formatTime(program.start)}
                      </p>
                      <p className="text-white/30 text-xs">
                        {formatDuration(program.start, program.stop)}
                      </p>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-black text-base uppercase tracking-tight truncate ${
                        isLive ? 'text-white' : 'text-white/80'
                      }`}>
                        {program.title}
                      </h3>
                      {program.category && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-white/10 rounded text-[9px] font-black uppercase tracking-wider text-white/40">
                          {program.category}
                        </span>
                      )}
                      {program.description && (
                        <p className="text-white/40 text-xs mt-2 line-clamp-2">
                          {program.description}
                        </p>
                      )}
                    </div>

                    {/* Play Button */}
                    {isLive ? (
                      <button 
                        onClick={() => onPlayChannel && onPlayChannel(channel)}
                        className="shrink-0 w-12 h-12 rounded-full bg-white flex items-center justify-center text-black hover:scale-110 transition-all "
                      >
                        <Play size={18} fill="currentColor" className="ml-0.5" />
                      </button>
                    ) : catchupDays > 0 && !isUpcoming && (
                      <button 
                        onClick={() => playCatchup(program)}
                        className="shrink-0 flex items-center gap-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 text-[10px] font-black uppercase tracking-wider hover:bg-white hover:text-black hover:border-white/20 transition-all"
                      >
                        <Clock size={12} />
                        Rewind
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 bg-black/40">
        <div className="flex items-center justify-center gap-6 text-[10px] font-black uppercase tracking-widest text-white/30">
          <span className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-white/30" />
            Ao Vivo
          </span>
          <span className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-white/10" />
            Em Breve
          </span>
          <span className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-white/5" />
            Passado
          </span>
        </div>
      </div>
    </div>
  );
}
