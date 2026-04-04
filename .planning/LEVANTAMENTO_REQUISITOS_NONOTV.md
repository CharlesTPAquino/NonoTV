# 📊 Relatório de Análise e Levantamento de Requisitos: NonoTV Elite 4K

Com base na auditoria das documentações estratégicas (`SESSION_CONTEXT.md`, `EXECUTION_PROMPTS.md`, `PROJECT_HISTORY.md`, `IMPLEMENTATION_PLAN.md`, e `SPRINT_REPORT_V8.0.md`), preparei um panorama completo do ambiente de desenvolvimento.

---

## 📍 1. De Onde Viemos (O Legado e os Desafios)
Até as versões anteriores (v4.1 a v5.9), o NonoTV enfrentou desafios críticos focados principalmente na **estabilidade em hardwares limitados** (como TV Boxes/Mi Stick):
- **Conflito de Codecs e Vazamentos (Memory Leaks):** Ao usar um único player genérico, ocorria sobreposição no buffer entre transmissões HLS de canais Ao Vivo e arquivos MP4 (Cinema VOD), causando as temidas "telas pretas" e congelamento de hardware.
- **Arquitetura Visual e Classificação Defasada:** A classificação entre Live e Cinema dependia do nome de grupos, gerando ambiguidades (ex: canais de filmes 24h na aba Cinema) e forçando aspectos de UI incorretos. Os fluxos não respeitavam totalmente a hierarquia visual (16:9 vs 2:3).
- **Credenciais Expostas e Sync Frágil:** Falhas de carregamento de canais devido a regressões no `api.js` (CORS e Proxies), além de ausência de fallback robusto.

---

## 🟢 2. Onde Estamos (Sprint v8.0 Elite Alpha)
Demos um grande salto arquitetural nesta fase com o foco em **Dual-Environment Architecture** e **Code DNA Detection**, criando separações lógicas rigorosas.

### 🏛️ Arquitetura Dual-Environment (Ambientes Estritos)
Abandonamos o "Player Único" e implementamos regras de orquestração no `App.jsx` (`PlayerOrchestrator`):
*   📺 **LivePlayer.jsx (Ao Vivo):** Foco em estabilidade do HLS/TS, latência mínima, tela plana em aspecto **16:9**. Zapping ultrarrápido controlado pelo D-Pad (setas de cima/baixo).
*   🎬 **CinemaPlayer.jsx (VOD):** Interface e UX inspirada na Netflix, controle detalhado de avanço/retrocesso (± 15s), Timeline (barra de progresso) interativa, capas representadas em formato de pôster / aspecto **2:3**.

### 🧬 Detecção de Codec por DNA
Categorizamos as trilhas baseadas na extensão do URL do sinal bruto, e não em metadados arbitrários de EPG:
*   `[ .mp4, .mkv ]` -> Direciona ao CinemaPlayer (VOD).
*   `[ .m3u8, .ts ]` -> Direciona ao LivePlayer (Ao Vivo).

### 🛡️ Blindagem de Memória e Resiliência
*   **Hard Reset no motor HLS (`useHlsPlayer.js`):** Destruição completa e reconstrução das instâncias de player ao alternar fluxos, garantindo 0 sobreposição de cache e expurgo instantâneo de vazamentos.
*   **ErrorBoundary Global:** Evita fechamento abrupto em exceções subjacentes, entregando um painel de diagnóstico em caso de crash do componente.
*   **Fallback de Grid vs Virtualização:** Sistema duplo em que a `ChannelGrid` comporta até 50.000 canais via re-uso virtuais (`react-window`), mantendo Fallback de segurança CSS se hardware limitar execução dinâmica rápida.

---

## 🎯 3. Para Onde Vamos (Próximos Passos e Requisitos - v8.1+)
Estas são as **missões pendentes** mapeadas na rota de execução para o NonoTV de acordo com a documentação lida:

### Prioridades MÁXIMA / ALTA (Imediatas)
1.  **AI Metadata Enrichment (Prioridade Alta):** 
    *   *Objetivo*: Gerar atributos de catálogos onde o XMLTV for deficiente (Sinopses, Cartazes via Nono). 
    *   *Desafio Técnico*: Ativar no `ChannelCard.jsx` e implementar limites de uso rigorosos via debounce + cache `IndexedDB`, poupando tokens/requisições ao rodar o proxy da Generative AI.
2.  **Stitcher Pre-Flight / DAI (Otimização Server-Side):** 
    *   *Objetivo*: A requisição ao Stitcher em `streamService.js` não deve bloquear o ciclo de inicialização (não segurar thread no play). Transferir a comunicação de costura do proxy para um background worker.
3.  **Refatoração de Skeletons Adaptativos (UX):**
    *   *Objetivo*: Modificar `src/components/UI/Skeleton.jsx` em entidades separadas (`ChannelCardSkeletonLive` em 16:9 e `ChannelCardSkeletonVod` em 2:3), inserindo antes de load completo.
4.  **Integração do ChannelListOverlay e Credenciais:**
    *   *Objetivo*: Trazer à vida componentes estáticos desconectados, blindar senhas retirando elas textualmente dentro da pasta `/src/data/sources.js` -> para um `.env` seguro.

### Prioridades Futuras (Features)
*   Integração profunda de suporte para legendas e opções multi-áudio (especialmente para containers dual-track VOD).
*   EPG com timeshift (Catch-up).
*   Sync de perfil e dados pela nuvem (Firebase ou Supabase).

---

## ⚠️ A Regra de Ouro (Aviso Importante)
Antes de iniciar qualquer código daqui para frente com foco nos requisitos listados, lembre de seguir obrigatoriamente a nossa regra global de estabilidade:

> Toda nova feature arquitetural precisará sofrer a **Auditoria de Impacto (AI) de 5 pontos**:
> 1. Evolução vs. Legado: O real benefício ganho.
> 2. Custo de Recurso: Reflexo de estresse ram/cpu em TVs.
> 3. Risco de Colapso: Identificadores de breaking changes no App.
> 4. Variáveis de Reversão: Caminhos seguros.
> 5. Conflito de Design System: Adesão à norma 16:9 (Live) / 2:3 (Cinema).

---

**Qual destas áreas das prioridades da v8.1+ você gostaria que começássemos a implementar primeiro?** Se quiser, podemos focar no `AI Metadata Enrichment` ou reestruturar as `Skeletons` e segurança imediatamente.
