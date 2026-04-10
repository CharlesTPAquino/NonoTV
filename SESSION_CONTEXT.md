# NonoTV IPTV - Contexto da Sessão (v8.7.0 Elite Alpha - AI & Premium UI)

> Última atualização: 04/04/2026 às 22:30
> Status: Interface Premium Estabilizada / AI Injecting Ativo

---

## 📍 De Onde Viemos (O Passado)
- **Legado v4.1 - v5.9:** Um player unificado que tentava processar tudo na Main Thread.
- **Problemas Crônicos:** Travamentos de 15s em listas grandes. Player engasgava em aparelhos Mi Stick, e a UI não parecia premium.

## 🛠️ Onde Estamos (O Hoje - v8.7.0)

### 1. AI Hardware Neural Enhancement (Sucesso ✅)
- **Injeção de Imagem:** Filtros `contrast`, `saturate` e algoritmos de sharpening de bordas injetados via GPU ao rodar os canais pelo `<VideoPlayerMinimal>`.
- **Zapping Preditivo:** Implementado `prefetchService` que pré-carrega o manifesto `.m3u8` ao focar (hover/focus) em um card por mais de 800ms.

### 2. Interface Elite "Deep Layering" (Sucesso ✅)
- **Hero Section Cinemático:** Reescrita completa do Hero com poster flutuante nítido à direita, sombras pesadas e glow (efeito neon), mantendo fundo embaçado (Glassmorphism). Funciona em TVs (modo paisagem) via responsividade focada.
- **Categorização Fina (M3U):** Extração de marcas (HBO, Telecine, Premiere, SporTV, ESPN, 4K) agrupando-as automaticamente na UI.

### 3. Voice Control Semântico (Sucesso ✅)
- **Web Speech + Gemini:** Inserido microfone na barra de busca. A IA capta fala natural (ex: "quero ver esportes"), processa a intenção e filtra o app via busca semântica assíncrona.

## 🎯 Para Onde Vamos (O Futuro)

### Prioridade 1: EPG Generativo e Completude de Grades
> Utilizar a IA para criar um `EPGService` inteligente, que preencha as grades de canais faltantes, sem pesar no motor de renderização.

### Prioridade 2: Perfis de Usuário & Sincronização em Nuvem (Supabase)
> Criar a infraestrutura de login/sessão para manter os Favoritos, Histórico e Progresso de "Continue Assistindo" persistentes em qualquer dispositivo.
