# 🎯 Missões de Desenvolvimento - NonoTV v4.2+

Estes prompts são projetados para IA de codificação e desenvolvedores. Use-os para iniciar tarefas específicas.

---

### 🛡️ Auditoria de Impacto (AI) - MANDATÓRIO
> "Sempre que uma instrução solicitar mudanças nas configurações estruturais ou de design do projeto IPTV, devo realizar a seguinte Auditoria de Impacto (AI):
> 1. Evolução vs. Legado: O que exatamente melhora na percepção do usuário final?
> 2. Custo de Recurso: Qual o impacto em RAM, CPU e Tempo de Carregamento? (Trazer estimativas).
> 3. Risco de Colapso: Quais as 3 principais formas dessa mudança quebrar o app em hardware limitado (TV Boxes)?
> 4. Variáveis de Reversão: Como voltamos ao estado anterior se a implementação falhar em produção?
> 5. Conflito de Design System: A mudança respeita a hierarquia visual (Live 16:9, VOD 2:3, Glassmorphism)?
> A implementação só deve prosseguir após o detalhamento desses pontos."

---

### 🚀 Missão: Virtualização de Grid (Alta Prioridade)
> "Siga o plano de otimização de performance. Implemente a biblioteca `react-window` ou `react-virtuoso` no componente `ChannelGrid.jsx`. 
> **Desafio:** A grid deve suportar colunas dinâmicas (responsividade) e dois tipos de layouts de card (16:9 p/ Live e 2:3 p/ VOD) sem quebrar o cálculo de altura dos itens virtualizados.
> **Objetivo:** Scroll fluído (60fps) em listas de 50.000+ canais."

---

### 🔍 Missão: Debug de Memory Leak (Estabilidade)
> "Realize uma auditoria profunda no componente `ChannelCard.jsx`. Verifique se as instâncias do `hls.js` estão sendo corretamente destruídas quando o card sai do viewport ou quando o player principal é aberto.
> **Ação:** Adicione logs detalhados no `useEffect` de cleanup e teste a navegação rápida para observar se o heap de memória cresce indefinidamente."

---

### 🎨 Missão: Skeletons Adaptativos (UI/UX)
> "Refine o componente `src/components/UI/Skeleton.jsx`. Atualmente ele é genérico.
> **Tarefa:** Crie `ChannelCardSkeletonLive` (16:9) e `ChannelCardSkeletonVod` (2:3). Integre-os no `ChannelGrid.jsx` para que o usuário sinta a estrutura da página antes mesmo das imagens carregarem."
