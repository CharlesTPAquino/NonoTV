import React, { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown, Play, Folder, Tv } from 'lucide-react';

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
      <div className="flex items-center gap-4 mb-6">
        <Tv size={28} className="text-emerald-500" />
        <h2 className="text-2xl md:text-3xl font-black text-white">Séries</h2>
        <span className="text-gray-500 text-sm font-medium">({channels.length} episódios)</span>
      </div>

      <div className="space-y-4">
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
            <div
              key={showName}
              className="bg-[#1a1c25] rounded-2xl border border-gray-800 overflow-hidden"
            >
              <button
                onClick={() => toggleShow(showName)}
                className="w-full flex items-center justify-between p-4 hover:bg-[#252833] transition-colors"
              >
                <div className="flex items-center gap-4">
                  {show.logo ? (
                    <img
                      src={show.logo}
                      alt={showName}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-emerald-600/20 flex items-center justify-center">
                      <Tv size={24} className="text-emerald-500" />
                    </div>
                  )}
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-white">{showName}</h3>
                    <p className="text-gray-500 text-sm">
                      {seasons.length} {seasons.length === 1 ? 'temporada' : 'temporadas'} •{' '}
                      {totalEpisodes} episódios
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  {isShowExpanded ? <ChevronDown size={24} /> : <ChevronRight size={24} />}
                </div>
              </button>

              {isShowExpanded && (
                <div className="border-t border-gray-800">
                  {seasons.map(season => {
                    const episodes = show.seasons[season];
                    const seasonKey = `${showName}-${season}`;
                    const isSeasonExpanded = expandedSeasons[seasonKey];

                    return (
                      <div key={season} className={season > 1 ? 'border-t border-gray-800' : ''}>
                        <button
                          onClick={() => toggleSeason(showName, season)}
                          className="w-full flex items-center justify-between p-4 pl-8 hover:bg-[#252833]/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Folder size={18} className="text-emerald-400" />
                            <span className="text-white font-medium">Temporada {season}</span>
                            <span className="text-gray-500 text-sm">({episodes.length} eps)</span>
                          </div>
                          <ChevronRight
                            size={18}
                            className={`text-gray-500 transition-transform ${isSeasonExpanded ? 'rotate-90' : ''}`}
                          />
                        </button>

                        {isSeasonExpanded && (
                          <div className="border-t border-gray-800/50">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 p-4">
                              {episodes.map(episode => (
                                <button
                                  key={episode.id}
                                  onClick={() => onPlay(episode)}
                                  className="
                                    relative flex flex-col bg-[#0a0b0f] rounded-xl overflow-hidden 
                                    border border-gray-800 hover:border-emerald-500/50 
                                    transition-all hover:scale-[1.02] hover:shadow-lg
                                    text-left group
                                  "
                                >
                                  {episode.logo ? (
                                    <img
                                      src={episode.logo}
                                      alt={episode.name}
                                      className="w-full aspect-video object-cover"
                                    />
                                  ) : (
                                    <div className="w-full aspect-video bg-emerald-900/30 flex items-center justify-center">
                                      <span className="text-emerald-500/30 text-2xl font-black">
                                        E{episode.episodeNumber}
                                      </span>
                                    </div>
                                  )}
                                  <div className="p-2">
                                    <p className="text-white text-xs font-medium truncate">
                                      Ep {episode.episodeNumber}
                                    </p>
                                    <p className="text-gray-500 text-[10px] truncate">
                                      {episode.name}
                                    </p>
                                  </div>
                                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/60">
                                    <Play size={24} fill="white" className="text-white" />
                                  </div>
                                </button>
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
