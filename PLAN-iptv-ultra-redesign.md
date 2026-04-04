# 📑 Plano de Redesign: IPTV Elite v8.0+

## 🎯 Objetivo
Manter a experiência "Ultra 4K" com foco em **Semântica de Conteúdo**. O design agora diferencia visualmente TV Ao Vivo de Cinema VOD, usando layouts especializados para cada tipo de DNA técnico.

---

## 🏗️ Arquitetura de Design (Semântica Elite)
- **Live Mode:** Aspect Ratio 16:9 (Widescreen). Foco em logos, nomes de canais e informações de "Agora no Ar".
- **Cinema Mode:** Aspect Ratio 2:3 (Pôster). Foco em capas de filmes, sinopses e barra de progresso imersiva.
- **Glassmorphism:** Mantido o uso de `backdrop-filter: blur(25px)` com bordas douradas (#F59E0B) para foco ativo.

---

## 📅 Cronograma e Acompanhamento

### ✅ Fase 1: Fundação e Estilo Global
- [x] Variáveis de cor (Dourado Elite) e efeitos de vidro no `index.css`.
- [x] Tipografia `Plus Jakarta Sans` integrada.
- [x] Gradientes de profundidade no fundo.

### ✅ Fase 2: Navegação "Premium Hybrid"
- [x] **Sidebar Vertical:** Ícones minimalistas com suporte D-Pad.
- [x] **Top Navbar:** Tabs inteligentes por categoria técnica.
- [x] **Responsividade:** Layout 6 colunas para TV e adaptativo para Mobile.

### ✅ Fase 3: Home & VOD (Experiência Cinema)
- [x] `HeroSection` com posters dinâmicos.
- [x] `ChannelCarousel` horizontal para grupos.
- [x] **CinemaPlayer:** Player com Timeline e controles de 15s.

### ✅ Fase 4: Live TV & EPG (Experiência Cabo)
- [x] **LivePlayer:** Ambiente de baixa latência com Zapping ativo.
- [x] `EPGService` integrado (básico).
- [x] Diferenciação visual entre canais e arquivos.

### 🚧 Fase 5: Refino Inteligente (PRÓXIMA SPRINT)
- [ ] **AI Metadata Enrichment:** Posters e descrições via Gemini para falhas de sintonização.
- [ ] **Spatial Navigation 2.0:** Refinar o foco em grids virtualizadas.
- [ ] **Pre-flight Stitcher:** Preparação de buffer em background.

---

## ✅ Critérios de Aceitação v8.0+
1. Interface reflete o "DNA" do conteúdo (16:9 vs 2:3).
2. Transição entre canais e filmes sem crash de codec.
3. Navegação fluida via Controle Remoto em 100% da UI.
4. Fallback de Grid ativo para resiliência máxima.

---
*Atualizado em 03/04/2026 - Status: Design System v8.0 Integrado*
