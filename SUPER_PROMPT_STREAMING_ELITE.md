🚀 SUPER PROMPT: Engenharia de UI/UX Streaming de Alta Fidelidade
Atue como Engenheiro de Software Sênior e Lead UX Designer (Especialista em React Native / Next.js / Flutter).

OBJETIVO: Desenvolver do zero uma plataforma de streaming premium (Live TV, Filmes, Séries e Podcasts) com padrão visual "Ponta de Mercado" (estilo Apple TV+ / Netflix), focando em imersão, velocidade e micro-interações cinematográficas.

--- 1. DESIGN SYSTEM E IDENTIDADE VISUAL (HIGH-CONTRAST DARK) ---
- BACKGROUND BASE: #1C1C1E (Grafite Quente) - Evite o preto puro para permitir profundidade.
- ELEVAÇÃO E CARDS: #2C2C2E com bordas finas de 1px solid #3A3A3C para definição de arestas.
- ACENTO PRINCIPAL (ACTION): #FF8000 (Laranja Vibrante / Vivid Orange).
- ACENTO SECUNDÁRIO (QUALITY): #00E5FF (Electric Blue) para badges de 4K/UHD.
- TIPOGRAFIA: Sans-serif moderna (Inter/Montserrat). Títulos Bold (700) com letterspacing -0.5px.
- GLASSMORPHISM: Menus e Overlays com 'Backdrop-filter: blur(15px)' e 80% de opacidade.

--- 2. ARQUITETURA DE COMPONENTES E EFEITOS (MOTION DESIGN) ---
A) SPLASH SCREEN (ENTRADA):
- Animação de Logo: Escala 0.5 para 1.1 (Spring) + Opacidade 0 para 1 em 800ms.
- Transição de Fundo: Fade suave do preto para o grafite da Home.

B) SIDEBAR RETRÁTIL (SMART NAVIGATION):
- Desktop: Mini (Icons) expandindo para Full (Icons + Labels) no Hover em 300ms.
- Mobile: Tab Bar inferior com blur e indicador de aba ativa em Laranja.
- Estilo: Blur intenso de fundo e micro-animação no ícone ao ser clicado.

C) HERO BANNER (PARALLAX & DYNAMIC):
- Efeito Parallax: Imagem de fundo move-se a 0.5x da velocidade do scroll.
- Overlay: Gradiente 'Linear-to-Bottom' fundindo a arte com o background da página.
- Botões: "Assistir" (Sólido Laranja) e "Detalhes" (Glassmorphism com borda branca 1px).

D) CARDS DE CONTEÚDO (MICRO-INTERAÇÕES):
- Hover/Focus: Escala 1.05 + Glow externo laranja suave + Borda iluminada.
- Badge "LIVE": Pulsação neon (glow intermitente) em vermelho/laranja.
- Loading: Skeleton Shimmer (brilho cinza deslizante) enquanto as imagens carregam.

--- 3. REQUISITOS TÉCNICOS E UX DE ELITE ---
- ENTRADA ESCALONADA (STAGGERED): Ao carregar abas, os cards entram em cascata (Fade-in + Slide-up) com delay de 0.05s entre itens.
- SHARED ELEMENT TRANSITION: Ao clicar no card, a imagem deve se expandir suavemente para a tela de detalhes.
- PERFORMANCE: Implementar Lazy Loading agressivo e Virtualização de Listas (FlatList/VirtualGrid) para scroll 60fps.
- ACESSIBILIDADE: Contraste 4.5:1, suporte total a D-Pad (Controle Remoto) e leitores de tela.

TAREFA:
Gere o código modular, limpo e performático utilizando [SUA TECH: EX: React Native + Reanimated / Next.js + Framer Motion]. O código deve incluir a SplashScreen, a Sidebar inteligente, o Hero Banner com Parallax e o Grid de Canais/Séries com todos os efeitos de escala e brilho descritos.

---
💡 Dicas de Ouro para rodar este Super Prompt:
Defina sua Tecnologia: Antes de enviar, substitua [SUA TECH] pela sua stack real (ex: "React Native com Reanimated e Tailwind CSS").
Peça por partes se necessário: Se a resposta for muito longa e o Gemini travar, diga: "Gere primeiro o Design System e a Sidebar", depois "Agora gere o Hero Banner com o efeito Parallax".
Refinamento: Se o brilho dos cards estiver muito forte, você pode ajustar dizendo: "Diminua a intensidade do box-shadow do card para 0.2 de opacidade".