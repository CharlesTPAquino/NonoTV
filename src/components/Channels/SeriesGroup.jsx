import React, { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown, Play, Film, Tv, Calendar, Hash } from 'lucide-react';

const SEASON_REGEX = /(?:S\d+|T\d+|Season|Temporada|EP?|E\d+)/i;

function extractSeasonInfo(title) {
  const match = title.match(/(?:S(\d+)|T(\d+)|Season\s*(\d+)|Temporada\s*(\d+))/i);
  if (match) {
    return parseInt(match[1] || match[2] || match[3] || match[4]) || 1;
  }
  return 1;
}

function extractEpisodeInfo(title) {
  const match = title.match(/(?:EP?|E)(\d+)/i);
  if (match) {
    return parseInt(match[1]) || 1;
  }
  const epMatch = title.match(/(\d+)[°º]/);
  return parseInt(epMatch?.[1]) || 1;
}

function getGroupName(title, group) {
  if (group) return group;
  const cleanTitle = title.replace(SEASON_REGEX, '').trim();
  return cleanTitle.substring(0, 30) || 'Sem Categoria';
}

function groupSeriesByShow(channels) {
  const groups = {};

  channels.forEach(channel => {
    const showName = getGroupName(channel.name, channel.group);

    if (!groups[showName]) {
      groups[showName] = {
        name: showName,
        logo: channel.logo,
        seasons: {},
      };
    }

    const season = extractSeasonInfo(channel.name);
    if (!groups[showName].seasons[season]) {
      groups[showName].seasons[season] = [];
    }

    groups[showName].seasons[season].push({
      ...channel,
      episodeNumber: extractEpisodeInfo(channel.name),
    });
  });

  Object.keys(groups).forEach(showName => {
    Object.keys(groups[showName].seasons).forEach(season => {
      groups[showName].seasons[season].sort((a, b) => a.episodeNumber - b.episodeNumber);
    });
  });

  return groups;
}

function ShowCard({ showName, show, onToggle, isExpanded, totalEpisodes, seasonCount }) {
  const hue = showName.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;

  return (
    <button
      onClick={onToggle}
      className="w-full group cursor-pointer"
    >
      <div className="relative flex items-stretch gap-0 rounded-2xl overflow-hidden border border-white/5 bg-[#1C1C1F] hover:border-[#F7941D]/30 transition-all duration-300 hover:shadow-xl hover:shadow-[#F7941D]/5">
        {/* Poster/Logo */}
        <div 
          className="relative w-28 md:w-36 shrink-0 overflow-hidden"
          style={{ background: `linear-gradient(135deg, hsl(${hue}, 40%, 18%), hsl(${(hue + 40) % 360}, 50%, 10%))` }}
        >
          {show.logo ? (
            <img
              src={show.logo}
              alt={showName}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center min-h-[120px]">
              <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Film size={24} className="text-white/30" />
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#1C1C1F]" />
        </div>

        {/* Info */}
        <div className="flex-1 flex items-center justify-between p-5 min-h-[120px]">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-[9px] font-black uppercase tracking-wider">
                Série
              </span>
            </div>
            <h3 className="text-lg md:text-xl font-black text-white group-hover:text-[#F7941D] transition-colors leading-tight line-clamp-2">
              {showName}
            </h3>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-white/30">
                <Calendar size={12} />
                <span className="text-[11px] font-bold">
                  {seasonCount} {seasonCount === 1 ? 'temporada' : 'temporadas'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-white/30">
                <Hash size={12} />
                <span className="text-[11px] font-bold">
                  {totalEpisodes} episódios
                </span>
              </div>
            </div>
          </div>

          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
            isExpanded 
              ? 'bg-[#F7941D] text-black rotate-0' 
              : 'bg-white/5 text-white/40 group-hover:bg-white/10'
          }`}>
            {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </div>
        </div>
      </div>
    </button>
  );
}

function EpisodeCard({ episode, onPlay }) {
  const hue = episode.name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;

  return (
    <button
      onClick={() => onPlay(episode)}
      className="group relative flex flex-col w-full text-left rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-black/40 focus-visible:ring-2 focus-visible:ring-[#F7941D] outline-none"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden rounded-xl">
        {episode.logo ? (
          <img
            src={episode.logo}
            alt={episode.name}
            loading="lazy"
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-75"
          />
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, hsl(${hue}, 35%, 15%), hsl(${(hue + 50) % 360}, 40%, 8%))` }}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Play size={20} className="text-white/20 ml-0.5" />
              </div>
              <span className="text-white/15 text-xs font-black uppercase tracking-wider">
                EP {episode.episodeNumber}
              </span>
            </div>
          </div>
        )}

        {/* Episode Number Badge */}
        <div className="absolute top-2 left-2 z-10">
          <span className="bg-black/70 backdrop-blur-sm text-white text-[10px] font-black px-2 py-0.5 rounded-md">
            E{String(episode.episodeNumber).padStart(2, '0')}
          </span>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        {/* Play Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="relative">
            <div className="absolute inset-0 bg-[#F7941D] rounded-full blur-lg opacity-40" />
            <div className="relative w-12 h-12 rounded-full bg-[#F7941D] flex items-center justify-center shadow-xl border-2 border-white/20">
              <Play size={18} fill="white" className="text-white ml-0.5" />
            </div>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="absolute bottom-2 left-2 right-2 z-10">
          <p className="text-white text-[11px] font-bold truncate drop-shadow-lg">
            Episódio {episode.episodeNumber}
          </p>
        </div>
      </div>

      {/* Episode Name */}
      <div className="mt-2 px-0.5">
        <p className="text-white/60 text-[11px] font-medium truncate group-hover:text-white/90 transition-colors">
          {episode.name}
        </p>
      </div>
    </button>
  );
}

export default function SeriesGroup({ channels, onPlay, isPlayerOpen }) {
  const [expandedShows, setExpandedShows] = useState({});
  const [expandedSeasons, setExpandedSeasons] = useState({});

  const groupedSeries = useMemo(() => groupSeriesByShow(channels), [channels]);
  const showNames = Object.keys(groupedSeries);

  const toggleShow = showName => {
    setExpandedShows(prev => ({ ...prev, [showName]: !prev[showName] }));
  };

  const toggleSeason = (showName, season) => {
    const key = `${showName}-${season}`;
    setExpandedSeasons(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (channels.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <Tv size={20} className="text-emerald-400" />
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-white">Séries</h2>
          <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest mt-0.5">
            {showNames.length} {showNames.length === 1 ? 'título' : 'títulos'} • {channels.length} episódios
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {showNames.map(showName => {
          const show = groupedSeries[showName];
          const seasons = Object.keys(show.seasons)
            .map(Number)
            .sort((a, b) => a - b);
          const isShowExpanded = expandedShows[showName];
          const totalEpisodes = Object.values(show.seasons).reduce(
            (acc, arr) => acc + arr.length,
            0
          );

          return (
            <div key={showName} className="animate-in fade-in duration-500">
              <ShowCard
                showName={showName}
                show={show}
                onToggle={() => toggleShow(showName)}
                isExpanded={isShowExpanded}
                totalEpisodes={totalEpisodes}
                seasonCount={seasons.length}
              />

              {isShowExpanded && (
                <div className="mt-2 ml-4 md:ml-8 space-y-2 animate-in slide-in-from-top-5 duration-300">
                  {seasons.map(season => {
                    const episodes = show.seasons[season];
                    const seasonKey = `${showName}-${season}`;
                    const isSeasonExpanded = expandedSeasons[seasonKey];

                    return (
                      <div key={season} className="overflow-hidden">
                        <button
                          onClick={() => toggleSeason(showName, season)}
                          className="w-full flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                              <Calendar size={14} className="text-emerald-400" />
                            </div>
                            <span className="text-white font-bold text-sm">Temporada {season}</span>
                            <span className="text-white/20 text-xs font-bold">{episodes.length} eps</span>
                          </div>
                          <ChevronRight
                            size={16}
                            className={`text-white/20 transition-transform duration-300 ${isSeasonExpanded ? 'rotate-90 text-[#F7941D]' : ''}`}
                          />
                        </button>

                        {isSeasonExpanded && (
                          <div className="mt-2 animate-in slide-in-from-top-3 duration-300">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4">
                              {episodes.map(episode => (
                                <EpisodeCard
                                  key={episode.id}
                                  episode={episode}
                                  onPlay={onPlay}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
