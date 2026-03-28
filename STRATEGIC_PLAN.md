# Plano Estratégico de Correções - NonoTV IPTV

## Visão Geral

Este documento detalha o plano estratégico para correção de todos os problemas identificados na auditoria completa do projeto NonoTV. O plano utiliza os agentes especializados do diretório `.agent` e segue uma priorização baseada em severidade e dependências.

---

## Matriz de Agentes por Tipo de Implementação

| Tipo de Implementação | Agente Principal | Agentes de Suporte | Skills Carregadas |
|----------------------|-------------------|---------------------|-------------------|
| **Segurança** | `security-auditor` | `penetration-tester` | vulnerability-scanner, red-team-tactics |
| **Frontend/UI** | `frontend-specialist` | `mobile-developer` | react-best-practices, tailwind-patterns, frontend-design |
| **Performance** | `performance-optimizer` | `frontend-specialist` | performance-profiling, react-best-practices |
| **Testes** | `test-engineer` | `qa-automation-engineer` | testing-patterns, tdd-workflow, webapp-testing |
| **SEO/A11y** | `seo-specialist` | `frontend-specialist` | seo-fundamentals, geo-fundamentals |
| **Code Quality** | `code-archaeologist` | `frontend-specialist` | clean-code, code-review-checklist |
| **Orquestração** | `orchestrator` | `project-planner` | parallel-agents, behavioral-modes |

---

## Fase 1: Correções Críticas de Segurança

### Task 1.1: Remover Credenciais Hardcoded

**Agente:** `security-auditor`  
**Skills:** vulnerability-scanner, clean-code  
**Ferramentas:** Read, Grep, Edit, Write

**Descrição:** Remover todas as credenciais expostas no arquivo `src/data/sources.js`

**Steps:**
1. Identificar todas as URLs com credenciais expostas
2. Criar sistema de variáveis de ambiente para credenciais
3. Implementar sistema de seleção de fonte que não exponha credenciais na UI
4. Adicionar validação para garantir que nenhuma credencial seja commitada

**Arquivos Alvo:**
- `src/data/sources.js`
- `src/services/api.js`
- Criar `.env.example` e `.env.local`

**Critério de Aceite:**
- Nenhuma credencial visível no código-fonte
- Sistema de variáveis de ambiente funcionando
- ESLint configurado para detectar secrets

---

### Task 1.2: Configurar ESLint + Prettier

**Agente:** `frontend-specialist`  
**Skills:** lint-and-validate, clean-code  
**Ferramentas:** Read, Write, Bash

**Descrição:** Configurar ESLint e Prettier para garantir qualidade de código consistente

**Steps:**
1. Criar arquivo `.eslintrc.cjs` com regras apropriadas para React
2. Criar arquivo `.prettierrc` para formatação consistente
3. Configurar script no package.json para validação automática
4. Adicionar configuração para detectar hardcoded secrets

**Dependencies:**
- Task 1.1 deve estar completa

**Arquivos Alvo:**
- `.eslintrc.cjs`
- `.prettierrc`
- `package.json`

**Critério de Aceite:**
- `npm run lint` executa sem erros
- Prettier formata código automaticamente
- Regras de segurança aplicadas

---

## Fase 2: Infraestrutura e Qualidade de Código

### Task 2.1: Configurar TypeScript

**Agente:** `frontend-specialist`  
**Skills:** react-best-practices, clean-code  
**Ferramentas:** Read, Write, Glob

**Descrição:** Adicionar TypeScript ao projeto para melhor type safety

**Steps:**
1. Instalar dependências TypeScript
2. Criar arquivo `tsconfig.json`
3. Converter arquivos gradualmente (JSX → TSX)
4. Adicionar tipos para principais interfaces

**Arquivos Alvo:**
- `package.json`
- `tsconfig.json`
- Componentes principais

**Critério de Aceite:**
- TypeScript compila sem erros
- Tipos definidos para Channel, Source, Player

---

### Task 2.2: Criar Constantes Centralizadas

**Agente:** `code-archaeologist`  
**Skills:** clean-code, code-review-checklist  
**Ferramentas:** Read, Edit, Write

**Descrição:** Extrair números mágicos e strings hardcoded para constantes nomeadas

**Steps:**
1. Criar arquivo `src/constants/index.js`
2. Migrar regex de filtro adulto para constantes
3. Migrar números mágicos do spatialNavigation
4. Adicionar JSDoc para todas as constantes

**Dependencies:**
- Task 2.1 pode ser paralelizada

**Arquivos Alvo:**
- `src/constants/index.js`
- `src/App.jsx`
- `src/utils/spatialNavigation.js`

**Critério de Aceite:**
- Nenhum número mágico no código
- Constantes documentadas

---

## Fase 3: Performance e Otimização

### Task 3.1: Implementar Code Splitting

**Agente:** `performance-optimizer`  
**Skills:** performance-profiling, react-best-practices  
**Ferramentas:** Read, Edit, Bash

**Descrição:** Dividir o bundle em chunks menores para melhorar tempo de carregamento

**Steps:**
1. Analisar composição atual do bundle
2. Configurar manualChunks no vite.config.js
3. Implementar lazy loading para hls.js
4. Implementar lazy loading para lucide-react (tree-shake)
5. Adicionar componente de Suspense para loading states

**Dependencies:**
- Task 2.1 deve estar completa

**Arquivos Alvo:**
- `vite.config.js`
- `src/App.jsx`
- `src/components/Player/VideoPlayer.jsx`

**Metas de Performance:**
- Bundle JS < 500KB (atual: 745KB)
- hls.js carregado sob demanda
- Ícones tree-shakeados

---

### Task 3.2: Otimizar Re-renders React

**Agente:** `performance-optimizer`  
**Skills:** performance-profiling, react-best-practices  
**Ferramentas:** Read, Grep, Edit

**Descrição:** Analisar e otimizar re-renders desnecessários nos componentes

**Steps:**
1. Analisar componentes com re-renders excessivos
2. Aplicar React.memo onde apropriado
3. Verificar uso de useMemo/useCallback
4. Otimizar filtros e ordenações

**Dependencies:**
- Task 3.1 pode ser paralelizada

**Arquivos Alvo:**
- `src/components/Channels/*.jsx`
- `src/context/*.jsx`

**Critério de Aceite:**
- Verificação de performance no DevTools mostra melhoria
- Componentes principais memoizados

---

### Task 3.3: Implementar Cache Inteligente

**Agente:** `performance-optimizer`  
**Skills:** performance-profiling  
**Ferramentas:** Read, Edit, Write

**Descrição:** Melhorar sistema de cache para canais e fontes

**Steps:**
1. Analisar atual implementação de cache
2. Adicionar cache para fontes (não apenas canais)
3. Implementar stale-while-revalidate
4. Adicionar métricas de cache hit rate

**Dependencies:**
- Task 2.1 deve estar completa

**Arquivos Alvo:**
- `src/services/cache.js`
- `src/hooks/useIptv.js`

---

## Fase 4: Testes e Qualidade

### Task 4.1: Expandir Cobertura de Testes

**Agente:** `test-engineer`  
**Skills:** testing-patterns, tdd-workflow  
**Ferramentas:** Read, Write, Bash

**Descrição:** Adicionar testes para componentes sem cobertura

**Steps:**
1. Mapear componentes sem testes
2. Criar testes para Sidebar, Navbar, HeroSection
3. Adicionar testes de integração para contextos
4. Implementar testes deMutation para API calls
5. Melhorar testes existentes com edge cases

**Dependencies:**
- Task 2.1 deve estar completa

**Arquivos Alvo:**
- `src/tests/`
- `src/components/Layout/Sidebar.jsx`
- `src/components/Layout/Navbar.jsx`
- `src/components/Channels/HeroSection.jsx`

**Metas:**
- Cobertura > 70%
- Todos os testes passando

---

### Task 4.2: Configurar E2E com Playwright

**Agente:** `qa-automation-engineer`  
**Skills:** webapp-testing, testing-patterns  
**Ferramentas:** Read, Write, Bash

**Descrição:** Configurar testes E2E para fluxos críticos do usuário

**Steps:**
1. Verificar configuração atual do Playwright
2. Criar testes para fluxos principais:
   - Seleção de fonte IPTV
   - Reprodução de canal
   - Navegação por categorias
   - Busca de canais
3. Configurar CI para rodar E2E

**Dependencies:**
- Task 4.1 pode ser paralelizada

**Arquivos Alvo:**
- `playwright.config.js`
- `tests/e2e/`

---

## Fase 5: SEO e Acessibilidade

### Task 5.1: Implementar Meta Tags e SEO Técnico

**Agente:** `seo-specialist`  
**Skills:** seo-fundamentals, geo-fundamentals  
**Ferramentas:** Read, Edit, Write

**Descrição:** Adicionar meta tags, sitemap e robôs para melhor indexação

**Steps:**
1. Corrigir lang="pt-BR" no HTML
2. Adicionar meta tags Open Graph
3. Adicionar Twitter Cards
4. Criar sitemap.xml
5. Criar robots.txt
6. Adicionar schema markup para aplicação

**Dependencies:**
- Nenhuma

**Arquivos Alvo:**
- `index.html`
- `public/sitemap.xml`
- `public/robots.txt`

---

### Task 5.2: Implementar Acessibilidade

**Agente:** `seo-specialist`  
**Skills:** seo-fundamentals, web-design-guidelines  
**Ferramentas:** Read, Edit, Grep

**Descrição:** Adicionar atributos ARIA e melhorar navegação por teclado

**Steps:**
1. Adicionar aria-labels a todos os botões
2. Adicionar aria-live regions para status
3. Melhorar contraste de cores onde necessário
4. Adicionar skip links para navegação
5. Melhorar gestão de foco

**Dependencies:**
- Task 5.1 pode ser paralelizada

**Arquivos Alvo:**
- Todos os componentes JSX

---

## Fase 6: Funcionalidades e Melhorias

### Task 6.1: Sistema de Favoritos

**Agente:** `frontend-specialist`  
**Skills:** react-best-practices, frontend-design  
**Ferramentas:** Read, Write, Grep

**Descrição:** Implementar sistema de favoritos para canais

**Steps:**
1. Criar hook useFavorites
2. Adicionar botão de favorito nos cards
3. Criar página/aba de favoritos
4. Persistir no localStorage
5. Adicionar testes

**Dependencies:**
- Task 4.1 deve estar completa

---

### Task 6.2: Histórico de Canais

**Agente:** `frontend-specialist`  
**Skills:** react-best-practices, frontend-design  
**Ferramentas:** Read, Write

**Descrição:** Implementar histórico de canais assistidos

**Steps:**
1. Criar hook useWatchHistory
2. Registrar canais assistidos automaticamente
3. Criar seção de "Continuar Assistindo"
4. Persistir no localStorage
5. Adicionar limite de histórico (últimos 20)

**Dependencies:**
- Task 6.1 pode ser paralelizada

---

### Task 6.3: Busca Avançada

**Agente:** `frontend-specialist`  
**Skills:** react-best-practices, frontend-design  
**Ferramentas:** Read, Write, Edit

**Descrição:** Melhorar sistema de busca com filtros avançados

**Steps:**
1. Adicionar filtros por gênero
2. Adicionar filtros por qualidade (HD, FHD, 4K)
3. Implementar busca fuzzy
4. Adicionar sugestões de busca
5. Melhorar performance da busca

**Dependencies:**
- Task 2.2 deve estar completa

---

## Fase 7: Mobile e Responsividade

### Task 7.1: PWA Support

**Agente:** `mobile-developer`  
**Skills:** mobile-design, react-best-practices  
**Ferramentas:** Read, Write

**Descrição:** Converter app em Progressive Web App

**Steps:**
1. Criar manifest.json
2. Adicionar service worker
3. Implementar offline support para dados em cache
4. Adicionar install prompt
5. Configurar splash screen

**Dependencies:**
- Task 5.1 deve estar completa

---

### Task 7.2: Otimização para Android TV

**Agente:** `mobile-developer`  
**Skills:** mobile-design  
**Ferramentas:** Read, Edit

**Descrição:** Melhorar experiência no Android TV

**Steps:**
1. Melhorar sistema de spatial navigation
2. Adicionar suporte a D-pad visual
3. Otimizar layouts para tela grande
4. Adicionar atalhos de controle remoto
5. Testar em diferentes resoluções (720p, 1080p, 4K)

**Dependencies:**
- Nenhuma (melhorias incrementais)

---

## Fase 8: Monitoramento e Observabilidade

### Task 8.1: Logging e Error Tracking

**Agente:** `devops-engineer`  
**Skills:** deployment-procedures, systematic-debugging  
**Ferramentas:** Read, Write

**Descrição:** Implementar sistema de monitoramento de erros

**Steps:**
1. Configurar error boundary global
2. Integrar serviço de error tracking (Sentry ou similar)
3. Adicionar logging estruturado
4. Criar dashboard de métricas
5. Configurar alertas para erros críticos

**Dependencies:**
- Task 2.1 deve estar completa

---

### Task 8.2: Analytics

**Agente:** `product-owner`  
**Skills:** plan-writing  
**Ferramentas:** Read, Write

**Descrição:** Implementar analytics para entender uso do app

**Steps:**
1. Configurar analytics (não intrusive)
2. Track eventos principais:
   - Canais mais assistidos
   - Fontes mais utilizadas
   - Tempo médio de uso
   - Navegação entre categorias
3. Criar dashboard de métricas para produto

**Dependencies:**
- Task 8.1 pode ser paralelizada

---

## Dependências entre Tasks

```
Fase 1 (Crítica)
├── Task 1.1 ──────────┐
├── Task 1.2 ──────────┤
                      │
Fase 2                │
├── Task 2.1 ──► Task 2.2
├── Task 2.1 ──► Task 3.1
└── Task 2.1 ──► Task 3.3

Fase 3
├── Task 3.1 ──► Task 3.2
└── Task 3.2 ──► Task 3.3

Fase 4
├── Task 4.1 ◄── Task 2.1
└── Task 4.1 ◄── Task 4.2

Fase 5 (Paralelizável)
├── Task 5.1 ──► Task 5.2
├── Task 5.1 ──► Task 7.1
└── Task 5.2 ──► Task 7.2

Fase 6
├── Task 6.1 ◄─── Task 4.1
├── Task 6.1 ───► Task 6.2
└── Task 6.2 ◄─── Task 2.2

Fase 7 (Paralelizável com Fase 5)
├── Task 7.1 ◄─── Task 5.1
└── Task 7.2 ◄─── Task 5.2

Fase 8
├── Task 8.1 ◄─── Task 2.1
└── Task 8.2 ◄─── Task 8.1
```

---

## Priorização Final

| Fase | Task | Prioridade | Esforço | Agente Principal |
|------|------|------------|---------|------------------|
| 1 | 1.1 - Remover credenciais | **CRÍTICO** | Baixo | security-auditor |
| 1 | 1.2 - ESLint + Prettier | **ALTA** | Médio | frontend-specialist |
| 2 | 2.1 - TypeScript | ALTA | Alto | frontend-specialist |
| 2 | 2.2 - Constantes | MÉDIA | Baixo | code-archaeologist |
| 3 | 3.1 - Code Splitting | ALTA | Médio | performance-optimizer |
| 3 | 3.2 - Re-renders | MÉDIA | Médio | performance-optimizer |
| 3 | 3.3 - Cache | MÉDIA | Médio | performance-optimizer |
| 4 | 4.1 - Testes unitários | ALTA | Alto | test-engineer |
| 4 | 4.2 - E2E | MÉDIA | Alto | qa-automation-engineer |
| 5 | 5.1 - SEO técnico | ALTA | Baixo | seo-specialist |
| 5 | 5.2 - Acessibilidade | MÉDIA | Médio | seo-specialist |
| 6 | 6.1 - Favoritos | MÉDIA | Médio | frontend-specialist |
| 6 | 6.2 - Histórico | MÉDIA | Médio | frontend-specialist |
| 6 | 6.3 - Busca avançada | BAIXA | Alto | frontend-specialist |
| 7 | 7.1 - PWA | BAIXA | Médio | mobile-developer |
| 7 | 7.2 - Android TV | BAIXA | Médio | mobile-developer |
| 8 | 8.1 - Error tracking | BAIXA | Médio | devops-engineer |
| 8 | 8.2 - Analytics | BAIXA | Baixo | product-owner |

---

## Comandos Úteis

```bash
# Verificar lint
npm run lint

# Rodar testes
npm test

# Build de produção
npm run build

# Preview do build
npm run preview
```

---

## Critérios de Progresso

O projeto será considerado em bom estado quando:
1. ✅ Nenhuma credencial exposta no código
2. ✅ ESLint passando sem erros
3. ✅ Cobertura de testes > 70%
4. ✅ Bundle < 500KB
5. ✅ SEO técnico implementado
6. ✅ Acessibilidade básica implementada
7. ✅ Testes E2E configurados

---

*Documento gerado automaticamente usando agentes especializados do .agent*