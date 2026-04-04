# 🎯 Missões de Desenvolvimento - NonoTV v6.0+

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

### ✅ Missão Concluída: Virtualização de Grid (v6.0)
> **Status:** Concluído com sucesso e estabilizado (Fallback Integrado).
> **Legado:** O `VirtualChannelGrid.jsx` já suporta 50.000+ canais via `react-window` e `AutoSizer`.

---

### 🧠 Missão: AI Metadata Enrichment (Prioridade Alta)
> "Inicie a implementação do enriquecimento de metadados via IA Generativa (Gemini).
> **Tarefa:** No componente `ChannelCard.jsx` (ou em um HOC), ative a função `enrichMetadata` quando o canal for focado ou quando o EPG estiver vazio.
> **Desafio:** Garantir que as requisições para a IA sejam cacheadas via `IndexedDB` e aplicadas com debounce para não estourar os limites de requisições da API.
> **Objetivo:** Ter sinopses dinâmicas para VODs e TV Ao Vivo sem depender de XMLTVs externos."

---

### 🎥 Missão: Validação Stitcher & DAI (Estabilidade)
> "Retome a integração do Google Video Stitcher no `streamService.js`.
> **Tarefa:** Ative a costura de streams VOD (MP4/MKV) no `useHlsPlayer` de forma assíncrona, MAS fora do ciclo de montagem crítica (utilize pre-flight check).
> **Objetivo:** Adicionar suporte a Dynamic Ad Insertion (DAI) sem causar resets de sintonização ou falhas de watchdog."

---

### 🔍 Missão: Debug de Memory Leak (Estabilidade)
> "Realize uma auditoria profunda no componente `ChannelCard.jsx`. Verifique se as instâncias do `hls.js` estão sendo corretamente destruídas quando o card sai do viewport ou quando o player principal é aberto.
> **Ação:** Adicione logs detalhados no `useEffect` de cleanup e teste a navegação rápida para observar se o heap de memória cresce indefinidamente."

---

### 🎨 Missão: Skeletons Adaptativos (UI/UX)
> "Refine o componente `src/components/UI/Skeleton.jsx`. Atualmente ele é genérico.
> **Tarefa:** Crie `ChannelCardSkeletonLive` (16:9) e `ChannelCardSkeletonVod` (2:3). Integre-os no `ChannelGrid.jsx` para que o usuário sinta a estrutura da página antes mesmo das imagens carregarem."
