export const GROUPS = [
  { id: 1, name: "All", icon: "home" },
  { id: 2, name: "TV Aberta", icon: "tv" },
  { id: 3, name: "Notícias", icon: "newspaper" },
  { id: 4, name: "Esportes", icon: "activity" },
  { id: 5, name: "Filmes e Séries", icon: "film" },
  { id: 6, name: "Infantil", icon: "baby" },
  { id: 7, name: "Documentários", icon: "scroll" },
  { id: 8, name: "Variedades", icon: "layout" },
  { id: 9, name: "Religioso", icon: "shrine" },
  { id: 10, name: "Lifestyle", icon: "coffee" }
];

export const CHANNELS = [
  // TV Aberta (Tier 1 & 2)
  { id: 1, name: "Record News", group: "TV Aberta", emoji: "📰", logo: "https://upload.wikimedia.org/wikipedia/commons/4/46/Record_News_logo_2023.svg", url: "https://stream.ads.ottera.tv/playlist.m3u8?network_id=2116" },
  { id: 2, name: "TV Cultura", group: "TV Aberta", emoji: "🎨", logo: "https://upload.wikimedia.org/wikipedia/commons/8/82/Cultura_logo_2013.svg", url: "https://player-tvcultura.stream.uol.com.br/live/tvcultura.m3u8" },
  { id: 3, name: "Rede Brasil", group: "TV Aberta", emoji: "🇧🇷", logo: "https://upload.wikimedia.org/wikipedia/commons/d/d1/Marca_rede_brasil_rgb-color.png", url: "https://video09.logicahost.com.br/redebrasiloficial/redebrasiloficial/playlist.m3u8" },
  { id: 4, name: "ISTV", group: "TV Aberta", emoji: "📺", logo: "https://upload.wikimedia.org/wikipedia/pt/b/b5/Logotipo_da_ISTV.png", url: "https://video08.logicahost.com.br/istvnacional/srt.stream/istvnacional.m3u8" },
  { id: 5, name: "TV Câmara", group: "TV Aberta", emoji: "⚖️", logo: "https://i.imgur.com/UpV2rPk.png", url: "https://stream3.camara.gov.br/tv1/manifest.m3u8" },
  { id: 6, name: "TV Brasil", group: "TV Aberta", emoji: "🇧🇷", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/TvBrasil2023.png/960px-TvBrasil2023.png", url: "https://ebclive3.akamaized.net/hls/live/2031020/tvbrasil/1/master.m3u8" },
  { id: 7, name: "SBT Interior", group: "TV Aberta", emoji: "📺", logo: "https://i.imgur.com/IkZfa4j.png", url: "https://evp.mm.uol.com.br/sbt/sbt-sorocaba/playlist.m3u8" },
  
  // Notícias
  { id: 101, name: "Jovem Pan News", group: "Notícias", emoji: "📻", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Jovem_Pan_logo_2018.svg/960px-Jovem_Pan_logo_2018.svg.png", url: "https://cdn.jovempan.com.br/jpnews/index.m3u8" },
  { id: 102, name: "BM&C News", group: "Notícias", emoji: "📈", logo: "https://i.imgur.com/pOUY2Uz.png", url: "https://stmv1.srvif.com.br/bmcnews/bmcnews/playlist.m3u8" },
  { id: 103, name: "CNN Brasil (Alternativo)", group: "Notícias", emoji: "🔴", logo: "https://upload.wikimedia.org/wikipedia/commons/6/66/CNN_Brasil_logo.svg", url: "https://cnn-brasil-live.akamaized.net/hls/live/2035255/cnn_brasil/master.m3u8" },

  // Filmes e Séries / Premium
  { id: 301, name: "HBO Brasil", group: "Filmes e Séries", emoji: "🍿", logo: "https://upload.wikimedia.org/wikipedia/commons/d/de/HBO_logo.svg", url: "https://stream.ads.ottera.tv/playlist.m3u8?network_id=2144" },
  { id: 302, name: "HBO 2", group: "Filmes e Séries", emoji: "🍿", logo: "https://upload.wikimedia.org/wikipedia/commons/d/de/HBO_logo.svg", url: "https://stream.ads.ottera.tv/playlist.m3u8?network_id=2145" },
  { id: 303, name: "Telecine Premium", group: "Filmes e Séries", emoji: "🎬", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Rede_Telecine_logo_%282022%29.svg/960px-Rede_Telecine_logo_%282022%29.svg.png", url: "https://cinalt-live.akamaized.net/hls/live/2035255/cnn_brasil/master.m3u8" },
  { id: 304, name: "Telecine Action", group: "Filmes e Séries", emoji: "🔥", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Rede_Telecine_logo_%282022%29.svg/960px-Rede_Telecine_logo_%282022%29.svg.png", url: "https://adrenalina-pura-1-br.samsung.wurl.tv/playlist.m3u8" },

  // Esportes / Premium
  { id: 201, name: "Premiere Ao Vivo", group: "Esportes", emoji: "⚽", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Premiere_Futebol_Clube_logo.svg/960px-Premiere_Futebol_Clube_logo.svg.png", url: "https://fifaplus-portuguese-1-br.samsung.wurl.tv/playlist.m3u8" },
  { id: 202, name: "Premiere 2", group: "Esportes", emoji: "⚽", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Premiere_Futebol_Clube_logo.svg/960px-Premiere_Futebol_Clube_logo.svg.png", url: "https://rbmn-live.akamaized.net/hls/live/590964/flrbmnevents/master.m3u8" },
  { id: 203, name: "SporTV", group: "Esportes", emoji: "📺", logo: "https://upload.wikimedia.org/wikipedia/commons/2/22/SporTV_logo_2021.svg", url: "https://stream.ads.ottera.tv/playlist.m3u8?network_id=2120" },
  { id: 204, name: "ESPN", group: "Esportes", emoji: "📺", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/ESPN_logo.svg/960px-ESPN_logo.svg.png", url: "https://cnalt-live.akamaized.net/hls/live/2035255/cnn_brasil/master.m3u8" },

  // Infantil
  { id: 401, name: "Gloob", group: "Infantil", emoji: "🎈", logo: "https://i.imgur.com/N1BUULh.png", url: "https://stmv1.srvif.com.br/gloob/gloob/playlist.m3u8" },
  { id: 402, name: "Nickelodeon Clássico", group: "Infantil", emoji: "🧡", logo: "https://i.imgur.com/Crip6wT.png", url: "https://service-stitcher.clusters.pluto.tv/stitch/hls/channel/5fa19db5adcf050007073286/master.m3u8?advertisingId=&appName=web&appVersion=unknown&appStoreUrl=&architecture=&buildVersion=&clientTime=0&deviceDNT=0&deviceId=unknown&deviceMake=unknown&deviceModel=web&deviceType=web&deviceVersion=unknown&includeExtendedEvents=false&sid=5c8e3e4a-5f3e-4b6e-8e4e-8e4e8e4e8e4e&userId=" },
  { id: 403, name: "Turma da Mônica", group: "Infantil", emoji: "👧", logo: "https://i.imgur.com/nrvPPrW.png", url: "https://service-stitcher.clusters.pluto.tv/stitch/hls/channel/607065996f019f0007e9c5a1/master.m3u8?advertisingId=&appName=web&appVersion=unknown&appStoreUrl=&architecture=&buildVersion=&clientTime=0&deviceDNT=0&deviceId=unknown&deviceMake=unknown&deviceModel=web&deviceType=web&deviceVersion=unknown&includeExtendedEvents=false&sid=5c8e3e4a-5f3e-4b6e-8e4e-8e4e8e4e8e4e&userId=" },

  // Lifestyle & Variedades
  { id: 501, name: "Tastemade", group: "Lifestyle", emoji: "🍳", logo: "https://i.imgur.com/FPy4zF4.png", url: "https://tastemade-portuguese-1-br.samsung.wurl.tv/playlist.m3u8" },
  { id: 502, name: "Pluto TV Natureza", group: "Lifestyle", emoji: "🌿", logo: "https://i.imgur.com/RuyQQ6M.png", url: "https://service-stitcher.clusters.pluto.tv/stitch/hls/channel/5fa19ba2f990a40007ec1499/master.m3u8?advertisingId=&appName=web&appVersion=unknown&appStoreUrl=&architecture=&buildVersion=&clientTime=0&deviceDNT=0&deviceId=unknown&deviceMake=unknown&deviceModel=web&deviceType=web&deviceVersion=unknown&includeExtendedEvents=false&sid=5c8e3e4a-5f3e-4b6e-8e4e-8e4e8e4e8e4e&userId=" },
  
  // Religioso
  { id: 601, name: "TV Aparecida", group: "Religioso", emoji: "⛪", logo: "https://i.imgur.com/kxrja0X.png", url: "https://tvaparecida-lh.akamaihd.net/i/tvaparecida_1@183578/index_1000_av-b.m3u8" },
  { id: 602, name: "TV Canção Nova", group: "Religioso", emoji: "⛪", logo: "https://i.imgur.com/OaM9hkH.png", url: "https://cnhls-lh.akamaihd.net/i/tvcnmob_1@147036/index_1_av-b.m3u8" }
];
