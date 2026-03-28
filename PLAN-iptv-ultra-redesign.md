# 📑 Plano de Redesign: IPTV Ultra 4K (NonoTV)

## 🎯 Objetivo
Transformar a interface do NonoTV em uma experiência "Elite Ultra 4K", com foco em estética premium, glassmorphism reflexivo (simulando reflexos de tela real) e navegação híbrida para Smart TV e Tablets.

---

## 🏗️ Arquitetura de Design (Reflective Glass)
Para o efeito solicitado (reflexo da própria tela filmada):
- **Base:** Fundo preto profundo (#050505).
- **Overlays:** Uso de `backdrop-filter: blur(20px) saturate(180%)`.
- **Reflexos:** Gradientes lineares angulares (ex: 135deg) simulando luz batendo na quina da tela.
- **Perspectiva:** Leve inclinação `perspective(1000px) rotateY(-1deg)` em certos containers para dar profundidade.

---

## 📅 Cronograma de Implementação

### ⚫ Fase 0: Descoberta de Endpoints (PRÉ-REQUISITO)
- [ ] Mapear endpoints Xtream Codes do usuário (player_api.php, xmltv.php)
- [ ] Validar autenticidade e formato das respostas (M3U, JSON, XML)
- [ ] Documentar URLs base e credenciais no SourceContext
- [ ] Definir estratégia de fallback para dados ausentes

### 🟢 Fase 1: Fundação e Estilo Global
- [ ] Atualizar `src/index.css` com variáveis de cor e efeitos de vidro existentes.
- [ ] Implementar a tipografia `Plus Jakarta Sans` (Headings + UI).
- [ ] Configurar gradiente animado de "Luz Reflexiva" no fundo do App.
- [ ] Adicionar fallback `@supports (backdrop-filter: blur(1px))` para dispositivos legados.

### 🔵 Fase 2: Navegação "Netflix Style"
- [ ] **Novo Sidebar:** Ícones verticais ultra-minimalistas à esquerda.
- [ ] **Top Tabs Bar:** Categorias horizontais (Home, Filmes, Séries, Canais, etc.).
- [ ] **Responsividade:** Layout adaptativo para Tablets (Touch) e TVs (Remote).

### 🟡 Fase 3: Home & VOD (Imagem 5)
- [ ] Criar o componente `HeroSection` com destaque para conteúdo em alta (Kaiju No. 8 style).
- [ ] Implementar `ContentRow` (Carrossel Horizontal de Posters).
- [ ] Adicionar suporte a Posters Verticais para Filmes/Séries.

### 🔴 Fase 4: Live TV & EPG (Imagens 1 e 2)
- [ ] **Channel List:** Lista com categorias e seletor com brilho reflexivo (Premiere FC style).
- [ ] **EPG Integration:** Criar `EPGService.js` para buscar e converter XMLTV dos servidores reais.
- [ ] **Player Overlay:** Barra inferior com info do programa atual/próximo e botões de controle premium.

### 🟣 Fase 5: Refino e Performance
- [ ] Garantir `Spatial Navigation` em todos os novos componentes.
- [ ] Otimizar renderização de listas longas com virtualização se necessário.
- [ ] Teste final de brilho e reflexos.

---

## 🛠️ Atribuição de Agentes
- `frontend-specialist`: Implementação da UI e Efeitos CSS.
- `backend-specialist`: Integração de EPG real e Refatoração de Contexto.
- `project-planner`: Coordenação de fases e validação de critérios.

---

## ✅ Critérios de Aceitação
1. Interface idêntica ou superior às capturas enviadas.
2. Efeito de vidro com "reflexo de luz" visível e elegante.
3. Zero dados mockados (Canais, Filmes e EPG vindo das fontes do usuário).
4. Navegação fluida em Controle Remoto e Tablets.
