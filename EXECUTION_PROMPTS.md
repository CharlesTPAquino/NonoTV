# 🚀 PROMPTS DE EXECUÇÃO: IPTV ELITE ULTRA 4K

Siga cada prompt abaixo, um por um, para implementar o plano de fidelidade visual às capturas de tela.

---

### 🎨 1. TEMA GLOBAL & FUNDO REFLEXIVO
**Prompt:**
> "No arquivo `src/index.css`, implemente um tema ultra-escuro usando a base `#050505`. Crie uma classe `.reflective-glass` que utilize `backdrop-filter: blur(25px) saturate(180%)` e um gradiente linear de 135 graus para simular o reflexo de luz em uma tela de TV de vidro. Adicione uma animação de brilho sutil (`shimmer`) no fundo do App (`App.jsx`) usando gradientes radiais que pulsam levemente, simulando a luz ambiente de uma sala de cinema refletida no painel."

---

### 📂 2. NAVEGAÇÃO HÍBRIDA (SIDEBAR & TOP TABS)
**Prompt:**
> "Refatore o componente `Sidebar.jsx` para ser um 'dock' lateral de apenas 72px de largura no desktop, contendo apenas ícones minimalistas da Lucide. No mobile, transforme-o em uma barra de navegação inferior (Bottom Nav) fixa. No `Navbar.jsx`, implemente um sistema de 'Top Tabs' similar ao da Netflix (Recomendado, Filmes, Séries, Ao Vivo), garantindo que a aba ativa tenha um indicador de brilho neon laranja (#F7941D) na parte inferior."

---

### 🎬 3. HOME & CARROSSEL VOD PREMIUM (IMAGEM 5)
**Prompt:**
> "No componente `HeroSection.jsx`, use a classe `.reflective-glass` para o container principal. O layout deve mostrar o título em fonte `Outfit Black` gigante (acima de 72px) com um leve drop-shadow e as categorias do conteúdo em uma pílula flutuante. No `ChannelCarousel.jsx`, remova o fundo dos cards e adicione uma borda sutil de 1px apenas no foco. O título da categoria (ex: 'O mais novo') deve ter uma borda lateral grossa em laranja e ser acompanhado por um contador discreto de itens."

---

### 📡 4. LIVE TV & INTEGRAÇÃO DE EPG REAL
**Prompt:**
> "Crie o arquivo `src/services/EPGService.js`. Implemente uma função `fetchEPG(sourceUrl)` que detecte o tipo de servidor (Xtream Codes/M3U) e busque o arquivo XMLTV correspondente (ex: trocando `m3u_plus` por `xmltv` na URL). No `VideoPlayer.jsx`, adicione uma barra de progresso horizontal que mostre 'Agora' e 'Próximo' para o canal atual, usando dados reais vindos desse serviço em vez de mocks."

---

### 📺 5. PLAYER CINEMATOGRÁFICO (IMAGEM 2)
**Prompt:**
> "Redesenhe o overlay de controles em `VideoPlayer.jsx`. Posicione o nome do canal em fonte negrito grande no canto inferior esquerdo. Crie uma linha de botões circulares translúcidos (`reflective-glass`) na parte inferior central contendo ícones para: Voltar, Favorito, Recarregar, EPG, Info e Tela Cheia. Inclua no topo direito um relógio digital e o placar/tempo do jogo se o canal for de esportes (detectado por palavra-chave)."

---

### 📱 6. FOCO EM ACESSIBILIDADE & TV/TABLET
**Prompt:**
> "Certifique-se de que todos os novos componentes interativos tenham um estado `:focus` que utilize `box-shadow: 0 0 0 4px rgba(247, 148, 29, 0.5)` e um leve `scale(1.1)`. Verifique a navegação espacial (`Spatial Navigation`) para garantir que o foco pule corretamente entre o Sidebar, as Top Tabs e o Grid de Canais usando as setas do controle remoto ou teclado."
