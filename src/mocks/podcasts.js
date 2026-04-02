/**
 * MOCKS DE PODCASTS
 * Dados fictícios de podcasts para demonstração
 */

export const SEARCHED_PODCASTS = [
  {
    id: '1',
    title: 'The 1 Hour Podcast',
    date: '2026-03-28',
    callCount: 47,
    duration: 3600,
    thumbnail: 'https://images.unsplash.com/photo-1478737270239-2f02b77ac6d5?w=400&h=300&fit=crop',
    channels: [
      {
        id: 'c1',
        name: 'TV Cultura',
        frequency: 'FM 89.1'
      },
      {
        id: 'c2',
        name: 'Jovem Pan FM',
        frequency: 'FM 92.9'
      }
    ],
    calls: [
      {
        id: 'c1',
        title: 'Entrevista com Daniel Ortiz - Politics',
        channelName: 'TV Cultura',
        duration: 2400,
        timestamp: '2026-03-28T14:30:00'
      },
      {
        id: 'c2',
        title: 'Análise da semana política',
        channelName: 'Jovem Pan FM',
        duration: 1800,
        timestamp: '2026-03-28T15:00:00'
      },
      {
        id: 'c3',
        title: 'Fechamento de mercado',
        channelName: 'TV Cultura',
        duration: 3000,
        timestamp: '2026-03-28T18:00:00'
      }
    ]
  },
  {
    id: '2',
    title: 'Flávio Augusto - Podcast',
    date: '2026-03-27',
    callCount: 23,
    duration: 4200,
    thumbnail: 'https://images.unsplash.com/photo-1589903308904-1010c2294adc?w=400&h=300&fit=crop',
    channels: [
      {
        id: 'c1',
        name: 'Mega 93.7',
        frequency: 'FM 93.7'
      }
    ],
    calls: [
      {
        id: 'c1',
        title: 'Economia do Brasil 2026',
        channelName: 'Mega 93.7',
        duration: 3600,
        timestamp: '2026-03-27T19:00:00'
      },
      {
        id: 'c2',
        title: 'Entrevista com Paulo Stein',
        channelName: 'Mega 93.7',
        duration: 600,
        timestamp: '2026-03-27T22:00:00'
      }
    ]
  },
  {
    id: '3',
    title: 'Papo de Igreja',
    date: '2026-03-26',
    callCount: 18,
    duration: 2400,
    thumbnail: 'https://images.unsplash.com/photo-1453971058244-0b1f8da8d435?w=400&h=300&fit=crop',
    channels: [
      {
        id: 'c1',
        name: 'Transamérica 99.7',
        frequency: 'FM 99.7'
      },
      {
        id: 'c2',
        name: 'Catedral 92.5',
        frequency: 'FM 92.5'
      }
    ],
    calls: [
      {
        id: 'c1',
        title: 'Temas de domingo',
        channelName: 'Transamérica 99.7',
        duration: 1200,
        timestamp: '2026-03-26T10:00:00'
      },
      {
        id: 'c2',
        title: 'Predicação de missa',
        channelName: 'Catedral 92.5',
        duration: 1200,
        timestamp: '2026-03-26T12:00:00'
      }
    ]
  },
  {
    id: '4',
    title: 'Tribuna Esportiva',
    date: '2026-03-25',
    callCount: 31,
    duration: 1800,
    thumbnail: 'https://images.unsplash.com/photo-1461896836934- voices?w=400&h=300&fit=crop',
    channels: [
      {
        id: 'c1',
        name: 'Esporte Total FM',
        frequency: 'FM 105.5'
      }
    ],
    calls: [
      {
        id: 'c1',
        title: 'Semanário esportivo',
        channelName: 'Esporte Total FM',
        duration: 1800,
        timestamp: '2026-03-25T21:00:00'
      }
    ]
  },
  {
    id: '5',
    title: 'Marketing de Voz',
    date: '2026-03-24',
    callCount: 15,
    duration: 3000,
    thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
    channels: [
      {
        id: 'c1',
        name: 'Arte FM 98.1',
        frequency: 'FM 98.1'
      }
    ],
    calls: [
      {
        id: 'c1',
        title: 'Tendências de marketing 2026',
        channelName: 'Arte FM 98.1',
        duration: 1800,
        timestamp: '2026-03-24T19:00:00'
      },
      {
        id: 'c2',
        title: 'Podcast com Christiane',
        channelName: 'Arte FM 98.1',
        duration: 1200,
        timestamp: '2026-03-24T22:00:00'
      }
    ]
  },
  {
    id: '6',
    title: 'Culinária com Ana',
    date: '2026-03-23',
    callCount: 22,
    duration: 2700,
    thumbnail: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
    channels: [
      {
        id: 'c1',
        name: 'Clube FM 98.3',
        frequency: 'FM 98.3'
      }
    ],
    calls: [
      {
        id: 'c1',
        title: 'Receitas do feriado',
        channelName: 'Clube FM 98.3',
        duration: 1800,
        timestamp: '2026-03-23T18:00:00'
      }
    ]
  },
  {
    id: '7',
    title: 'Esporte e Profissionalismo',
    date: '2026-03-22',
    callCount: 28,
    duration: 2400,
    thumbnail: 'https://images.unsplash.com/photo-1461896836934-voices?w=400&h=300&fit=crop',
    channels: [
      {
        id: 'c1',
        name: 'Europa FM 96.9',
        frequency: 'FM 96.9'
      }
    ],
    calls: [
      {
        id: 'c1',
        title: 'Carreira no esporte',
        channelName: 'Europa FM 96.9',
        duration: 2400,
        timestamp: '2026-03-22T19:00:00'
      }
    ]
  },
  {
    id: '8',
    title: 'Meio Ambiente',
    date: '2026-03-21',
    callCount: 12,
    duration: 1800,
    thumbnail: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=300&fit=crop',
    channels: [
      {
        id: 'c1',
        name: 'Green FM 104.9',
        frequency: 'FM 104.9'
      }
    ],
    calls: [
      {
        id: 'c1',
        title: 'Consciência ambiental',
        channelName: 'Green FM 104.9',
        duration: 1800,
        timestamp: '2026-03-21T14:00:00'
      }
    ]
  }
];