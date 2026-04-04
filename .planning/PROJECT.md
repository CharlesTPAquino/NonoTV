# NonoTV Elite 4K

## What This Is

Aplicação IPTV/Android para streaming de canais de TV com EPG, AI Hub e temas personalizáveis. Desenvolvida com React + Vite + Capacitor para Android.

## Core Value

Fornecer acesso confiável a streams IPTV com experiência premium de visualização em TV e mobile.

## Requirements

### Validated ✅

- Sistema de fallback de APIs (CapacitorHttp → proxies → fetch)
- EPG com Catch-up TV
- AI Hub com Gemini
- Sistema de temas (dark, cinema, kids, light)
- Design System com tokens consistentes
- Splash Screen cinematográfica
- Parallax no Hero Banner
- Skeleton Shimmer nos placeholders
- Badge 4K em Electric Blue (#00E5FF)
- Staggered Entry animation com will-change
- Navegação unificada (sidebar desktop + bottom nav mobile)
- Server Tech Profiler (detecção automática de tecnologia)
- Cards sem sobreposição (info bar sólida)
- Grid responsivo (6 colunas para live, 6 para poster)

### Active ⏳

- [ ] Video preview otimizado com IntersectionObserver
- [ ] Shared Element Transition (card → player)
- [ ] AI Metadata Enrichment (batch Gemini)
- [ ] Auto-quality selector
- [ ] Google Video Stitcher

### Out of Scope

- Servidor de autenticação próprio — dependemos das credenciais dos provedores
- Downloads offline — complexidade de storage
- Multi-perfil — complexidade de gestão

## Context

- **Stack**: React + Vite + Capacitor + Tailwind
- **37 fontes IPTV** configuradas
- **Projeto pai** (`/meu-iptv/`) como principal após migração
- **Último APK**: `NonoTV_v2026-04-04_11-37.apk`
- **Último commit**: `4c219a4`

## Constraints

- **Stack**: React + Vite + Capacitor — não mudar
- **APK**: Android only por enquanto
- **Credenciais**: Variáveis de ambiente — não commitar

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Projeto pai como principal | Migração de 17→37 fontes | ✅ Bom |
| Variáveis de ambiente para credenciais | Segurança | ✅ Bom |
| Design tokens via Tailwind | Consistência | ✅ Bom |
| Navegação unificada (sidebar/bottom nav) | Menus não coexistem | ✅ Bom |
| Sem video preview no hover | Mi Stick não aguenta | ✅ Bom |
| Info bar sólida nos cards | Zero sobreposição | ✅ Bom |
| Grid 6 colunas para live | Melhor navegação em TV | ✅ Bom |

## Histórico de Versões

| Versão | Data | Descrição |
|--------|------|-----------|
| v4.9 | 29/03/2026 | Design System + migração de projeto |
| v8.6.0 | 04/04/2026 | Debug crítico (P0-P2) |
| v8.7.0 | 04/04/2026 | Motor de vídeo + AI |
| v8.7.4 | 04/04/2026 | Restauração v4.9 + Server Tech Profiler |
| v4.9+UI | 04/04/2026 | Melhorias de UI (Splash, Parallax, Shimmer, etc.) |

---

*Last updated: 04/04/2026 after UI improvements*
