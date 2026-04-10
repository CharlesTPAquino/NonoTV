import React, { useMemo } from 'react';
import { 
  Clock, TrendingUp, Star, Tv, Calendar, 
  Play, Pause, BarChart3, Target
} from 'lucide-react';

export default function StatsDashboard({ history = [], channels = [] }) {
  const stats = useMemo(() => {
    if (!history.length) {
      return {
        totalWatched: 0,
        totalTime: 0,
        topChannels: [],
        topCategories: [],
        peakHours: [],
        avgSessionLength: 0,
        streak: 0,
        favoriteTimeSlot: ''
      };
    }

    const totalWatched = history.length;
    
    const totalTime = history.reduce((acc, h) => acc + (h.watchTime || 0), 0);
    
    const channelCounts = {};
    history.forEach(h => {
      const name = h.name || 'Unknown';
      channelCounts[name] = (channelCounts[name] || 0) + 1;
    });
    
    const topChannels = Object.entries(channelCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => {
        const channel = channels.find(c => c.name === name);
        return { name, count, logo: channel?.logo };
      });

    const categoryCounts = {};
    history.forEach(h => {
      const group = h.group || 'Sem categoria';
      categoryCounts[group] = (categoryCounts[group] || 0) + 1;
    });
    
    const topCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    const hourCounts = {};
    history.forEach(h => {
      if (h.lastWatched) {
        const hour = new Date(h.lastWatched).getHours();
        const slot = hour < 12 ? 'Manhã' : hour < 18 ? 'Tarde' : 'Noite';
        hourCounts[slot] = (hourCounts[slot] || 0) + 1;
      }
    });
    
    const peakHours = Object.entries(hourCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([slot, count]) => ({ slot, count }));

    const avgSessionLength = totalTime / totalWatched;

    const sortedByDate = [...history].sort((a, b) => b.lastWatched - a.lastWatched);
    let streak = 1;
    for (let i = 1; i < sortedByDate.length; i++) {
      const diff = sortedByDate[i-1].lastWatched - sortedByDate[i].lastWatched;
      const daysDiff = diff / (1000 * 60 * 60 * 24);
      if (daysDiff <= 1) streak++;
      else break;
    }

    const favoriteTimeSlot = peakHours[0]?.slot || '';

    return {
      totalWatched,
      totalTime,
      topChannels,
      topCategories,
      peakHours,
      avgSessionLength,
      streak,
      favoriteTimeSlot
    };
  }, [history, channels]);

  const formatTime = (minutes) => {
    if (minutes < 60) return `${Math.round(minutes)}min`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}min`;
  };

  const getTimeSlotIcon = (slot) => {
    switch (slot) {
      case 'Manhã': return <span className="text-yellow-400">☀️</span>;
      case 'Tarde': return <span className="text-orange-400">🌤️</span>;
      case 'Noite': return <span className="text-blue-400">🌙</span>;
      default: return <Clock size={14} />;
    }
  };

  if (history.length === 0) {
    return (
      <div className="p-8 text-center">
        <Tv size={48} className="text-white/20 mx-auto mb-4" />
        <h3 className="text-white font-black text-lg uppercase">Sem dados ainda</h3>
        <p className="text-white/40 text-sm mt-2">
          Assista alguns canais para ver estatísticas
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 text-white/50 mb-2">
            <Tv size={16} />
            <span className="text-[10px] font-black uppercase tracking-wider">Canais</span>
          </div>
          <p className="text-2xl font-black text-white">{stats.totalWatched}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 text-white/50 mb-2">
            <Clock size={16} />
            <span className="text-[10px] font-black uppercase tracking-wider">Tempo Total</span>
          </div>
          <p className="text-2xl font-black text-white">{formatTime(stats.totalTime)}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 text-white/50 mb-2">
            <Calendar size={16} />
            <span className="text-[10px] font-black uppercase tracking-wider">Sequência</span>
          </div>
          <p className="text-2xl font-black text-white">{stats.streak} dias</p>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 text-white/50 mb-2">
            <TrendingUp size={16} />
            <span className="text-[10px] font-black uppercase tracking-wider">Média/Sessão</span>
          </div>
          <p className="text-2xl font-black text-white">{formatTime(stats.avgSessionLength)}</p>
        </div>
      </div>

      {/* Top Channels */}
      <div>
        <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-white/60 mb-3">
          <Star size={14} className="text-white/50" />
          Canais Mais Assistidos
        </h3>
        <div className="space-y-2">
          {stats.topChannels.slice(0, 5).map((channel, idx) => (
            <div 
              key={channel.name}
              className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5"
            >
              <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white/50 text-xs font-black">
                {idx + 1}
              </span>
              {channel.logo ? (
                <img src={channel.logo} alt={channel.name} className="w-8 h-8 rounded-lg object-contain bg-white/10" />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <Tv size={14} className="text-white/40" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm truncate">{channel.name}</p>
                <p className="text-white/40 text-[10px]">{channel.count} visualizações</p>
              </div>
              <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full"
                  style={{ width: `${(channel.count / stats.topChannels[0].count) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Categories & Time */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-white/60 mb-3">
            <Target size={14} className="text-white/50" />
            Categorias
          </h3>
          <div className="space-y-2">
            {stats.topCategories.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between p-2">
                <span className="text-white/70 text-sm truncate">{cat.name}</span>
                <span className="text-white/50 text-xs font-black">{cat.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-white/60 mb-3">
            <Clock size={14} className="text-white/50" />
            Horários
          </h3>
          <div className="space-y-2">
            {stats.peakHours.map(({ slot, count }) => (
              <div key={slot} className="flex items-center gap-2 p-2">
                {getTimeSlotIcon(slot)}
                <span className="text-white/70 text-sm">{slot}</span>
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white rounded-full"
                    style={{ width: `${(count / stats.peakHours[0].count) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
