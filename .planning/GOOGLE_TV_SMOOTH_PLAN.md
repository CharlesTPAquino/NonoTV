# 🚀 NonoTV Elite: Plano de Aceleração "Nível Google TV"

**Objetivo:** Transformar o NonoTV Elite 4K em uma experiência fluida (60 FPS constantes), livre de vazamentos de memória e responsiva, com a mesma sensação premium e otimizada da interface do Google TV, garantindo estabilidade absoluta em dispositivos de entrada (Mi Stick, TV Boxes Android).

---

## 🛠️ 1. Criação do Ambiente de Testes "Hardcore" (Stress Test)

Para atingir a fluidez de Google TV, precisamos simular as piores condições possíveis que as TV Boxes apresentam.

### A. Simulação de Restrição de Hardware e Rede
*   **CPU Throttling:** Utilizaremos as devTools remotas (Chrome Inspect via `adb forward tcp:9222 localabstract:chrome_devtools_remote`) aplicando 6x de CPU slowdown para emular os processadores ARM antigos de TV Boxes.
*   **Rede PreJudicada:** Throttling na rede para perfis 3G Rápido / 4G Lento para aferir o sistema de Fallback, o HLS Buffer e a inteligência das "pontes" Proxy/Capacitor.
*   **Memory Leak Hunting:** Coleta de Heap Snapshot após ciclos pesados de navegação: *Abre App -> Rola 500 canais pro lado -> Abre Canal -> Desliga Canal -> Abre VOD -> Volta pra home (Repetir 3 vezes e medir retenção na RAM).*

### B. Módulo de Diagnóstico Remoto
*   Vamos focar no `src/components/Settings/DiagnosticPanel.jsx` (Painel Diagnóstico Visualizado).
*   **Adicionar sobreposição in-app:** Exibir FPS em tempo real, consumo quantitativo (DOM Nodes ativos), heap size, e falhas de frame. Isso permite o teste 'a olho nu' no próprio Mi Stick pelo controle remoto.

---

## 🔬 2. Avaliação de Arquitetura "Smooth" (O que falta?)

Uma avaliação franca da arquitetura atual sob a ótica de fluidez Google TV revela as seguintes lacunas:

### 🚨 Vazamento Silencioso de DOM (DOM Tree Bloat)
*   *Avaliação:* Atualmente possuímos virtualização de Grade (`react-window`), o que soluciona a lista de 50k canais. Mas e os modais (`ChannelListOverlay`, `EPGOverlay`)? Se eles são mantidos no DOM mas com `display: none` / `opacity: 0`, a TV Box continua gastando CPU para re-layout.
*   *Solução:* **Conditional Rendering Radical (`&&`).** Todos os Overlays devem sair inteiramente do DOM quando inativos, re-suspendendo memória.

### 🚨 Excesso de Threading Visual (Image Parsing)
*   *Avaliação:* O Google TV roda liso porque intercepta as imagens (posters VOD de 1080p viram miniaturas de 4kb no lado do servidor) para renderizar o carrossel. Hoje nós confiamos que os logotipos dos canais farão Lazy Load simples. 
*   *Solução:* **Decodificação Off-thread & Purgatório de Imagem.** Usar `decode="async"` em todas as tags `<img>` e o Intersection Observer não só para `src` loading, mas também para descarregar o `src` de itens que fugirem dois palmos fora da tela.

### 🚨 Aceleração por Hardware Pobre (CSS Paint)
*   *Avaliação:* Qualquer transição CSS baseada em `width`, `height`, `margin`, `top`, `left` trava a thread principal em TV Boxes.
*   *Solução:* **GPU-Only Painting.** Auditar todo tailwind e converter animações estritamente para `transform (translate3d)` e `opacity`. O uso de `translate3d(0,0,0)` empurra à força os Skeletons de interface (Prioridade Alta mapeada antes) e cartazes para a Memória da Placa Aceleradora (GPU) no Mi Stick.

---

## 🗺️ 3. O Plano de Ação: A Trilha "Google TV"

Tendo em mente a **Auditoria de Impacto de 5 Pontos** (*Risco Custo Recurso Baixo, Evolução Visual Alta*), dividiremos as tarefas.

### 🏁 Etapa 1: Profiling Base & Configuração (Hoje)
1. Conectar via ADB remotamente com DevTools ativado na aba Performance.
2. Limpar o `App.jsx` de processos de fundo (Background Syncs desnecessários) enquanto inicializa. 
3. Instrumentar o medidor de FPS/Memória no `DiagnosticPanel.jsx` para leitura tátil na TV.

### 🏁 Etapa 2: Remoção do Lixo de Renderização (Amanhã)
1. **Poda Rigorosa dos Modais Ocultos:** Analisar `ChannelListOverlay`, Modais de Configuração, e desativamentos em `PlayerOrchestrator`. Eles passarão a usar renderização por montagem (`null` -> Componente) e não por CSS (`hidden`).
2. **GPU Enforcement no CSS:** Repassar o `ChannelCard.jsx` pra trocar transições de estados focus (`:focus` - acionado por controle) para usar `scale` do react-spring/framer-motion-lite otimizado, mantendo a responsividade do toque/clique estalando a cada controle remoto.

### 🏁 Etapa 3: The Loading Illusion (Experiência Fluida de Transição da Aba V8.1)
1. Implementar o novo **Skeleton Adaptativo** mapeado (16:9 Life e 2:3 VOD), para que *antes* da requisição via Fetch voltar, o outline da renderização preencha com animações otimizadas a GPU.
2. Essa ilusão de "Loading Instantâneo" é o que domina as Smart-TVs e o Google TV (onde dados lentos não afetam o UI/D-Pad).

---

> **Aprovação Solicitada:** Com esse plano arquitetural em mente, a melhor ação agora é criarmos os utilitários de monitoramento prático e fazermos a **Limpeza e Otimização da Virtual DOM das Imagens / Overlay**. Concorda com essa trilha pra atingirmos o estado fluido do Google TV?
