# NonoTV Elite 4K

## What This Is

Aplicação IPTV/Android para streaming de canais de TV com EPG, Catch-up TV, AI Hub e temas personalizáveis. Desenvolvida com React + Vite + Capacitor para Android.

## Core Value

Fornecer acesso confiável a streams IPTV com experiência premium de visualização em TV e mobile.

## Requirements

### Validated

- Sistema de fallback de APIs (CapacitorHttp → proxies → fetch)
- EPG com Catch-up TV
- AI Hub com Ollama e MCP
- Sistema de temas (dark, cinema, kids, light)
- Design System com tokens consistentes

### Active

- [ ] Corrigir sync de servidores no APK
- [ ] Health check automático dos servidores
- [ ] Dashboard de status em tempo real
- [ ] ChannelListOverlay integrado
- [ ] Continuar assistindo

### Out of Scope

- Servidor de autenticação próprio — dependemos das credenciais dos provedores
- Downloads offline — complexidade de storage
- Multi-perfil — complexidade de gestão

## Context

- **Stack**: React + Vite + Capacitor + Tailwind
- **37 fontes IPTV** configuradas
- **Projeto pai** (`/meu-iptv/`) como principal após migração
- **APKbuildado** em: `NonoTV_v2026-03-29_16-10.apk`

## Constraints

- **Stack**: React + Vite + Capacitor — não mudar
- **APK**: Android only por enquanto
- **Credenciais**: Variáveis de ambiente — não commitar

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Projeto pai como principal | Migração de 17→37 fontes | ✓ Bom |
| Variáveis de ambiente para credenciais | Segurança | ✓ Bom |
| Design tokens via Tailwind | Consistência | ✓ Bom |

---

*Last updated: 29/03/2026 after Design System improvements*
