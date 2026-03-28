# NonoTV - Guia de Uso do Sistema de Agentes AI

> Documentação completa para utilização do `.agent` com OpenRouter e Groq

---

## 📋 Visão Geral

Este documento descreve como utilizar o sistema de agentes AI disponível no diretório `.agent` para desenvolvimento, auditoria e melhoria do projeto NonoTV IPTV.

### Stack de IA Utilizada

| Serviço | Modelo | Uso Principal |
|---------|--------|---------------|
| **OpenRouter** | Claude 3.5 Sonnet, GPT-4 | Análise profunda, código complexo |
| **Groq** | LLaMA 3, Mixtral | Processamento rápido, inferência |

---

## 🏗️ Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER REQUEST                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AGENT SELECTION                            │
│  (Baseado em palavras-chave do pedido)                         │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│  AGENTS (20)  │    │  SKILLS (36)  │    │ WORKFLOWS (11)│
│               │    │               │    │               │
│ - frontend    │    │ - frontend    │    │ /brainstorm   │
│ - backend     │    │ - security    │    │ /create       │
│ - security    │    │ - testing     │    │ /debug        │
│ - testing     │    │ - performance │    │ /deploy       │
│ - etc...      │    │ - design      │    │ /enhance      │
└───────────────┘    └───────────────┘    └───────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    OPENROUTER / GROQ                            │
│              (Execução com modelos AI)                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🤖 Guia de Agentes

### Agentes Disponíveis e Seus Usos

#### 1. **frontend-specialist**
**Quando usar:** Trabalhos em UI/UX, componentes React, estilização, design systems.

```markdown
Exemplo de prompt:
"Preciso criar um componente de cards para listar canais de TV.
Use o design system existente (Tailwind + tokens customizados).
Requisitos: hover effects, tipografia Premium, responsivo."
```

**Skills carregadas:**
- `react-best-practices`
- `frontend-design`
- `tailwind-patterns`

---

#### 2. **security-auditor**
**Quando usar:** Auditorias de segurança, vulnerabilidades, análise de dependências.

```markdown
Exemplo de prompt:
"Faça uma auditoria de segurança no código.
Verifique:
- Credenciais expostas
- Injeções (XSS, SQL)
- Dependências vulneráveis
- Configurações inseguras

Retorne um relatório comseveridade e correção."
```

**Skills carregadas:**
- `vulnerability-scanner`
- `red-team-tactics`
- `clean-code`

---

#### 3. **performance-optimizer**
**Quando usar:** Otimização de performance, bundle size, Core Web Vitals.

```markdown
Exemplo de prompt:
"O bundle JS está em 745KB (acima do recomendado).
Analise o código e sugira:
- Code splitting
- Lazy loading
- Memoização
- Tree shaking

Implemente as melhorias no vite.config.js"
```

**Skills carregadas:**
- `performance-profiling`
- `react-best-practices`

---

#### 4. **test-engineer**
**Quando usar:** Criação de testes, cobertura, estratégias de testing.

```markdown
Exemplo de prompt:
"Crie testes unitários para o componente Sidebar.
Use Vitest + React Testing Library.
Cubra:
- Renderização
- Interações (clicks)
- Estados (active category)
- Acessibilidade"
```

**Skills carregadas:**
- `testing-patterns`
- `tdd-workflow`
- `webapp-testing`

---

#### 5. **seo-specialist**
**Quando usar:** SEO técnico, meta tags, sitemap, acessibilidade.

```markdown
Exemplo de prompt:
"Improve SEO for this React app.
Add:
- Meta tags (og, twitter)
- Sitemap.xml
- Robots.txt
- Schema markup
- Aria labels

Language is pt-BR"
```

**Skills carregadas:**
- `seo-fundamentals`
- `geo-fundamentals`

---

#### 6. **code-archaeologist**
**Quando usar:** Refatoração, code review, identificação de code smells.

```markdown
Exemplo de prompt:
"Review the codebase for:
- Duplicated code
- Magic numbers
- Complex functions
- Missing documentation

Suggest refactoring with priority."
```

**Skills carregadas:**
- `clean-code`
- `code-review-checklist`

---

#### 7. **mobile-developer**
**Quando usar:** Desenvolvimento mobile, Android TV, PWA.

```markdown
Exemplo de prompt:
"Convert this web app to PWA.
Add:
- manifest.json
- Service worker
- Offline support
- Install prompt
- Splash screen"
```

**Skills carregadas:**
- `mobile-design`
- `react-best-practices`

---

## 🎯 Matriz de Agentes por Tipo de Tarefa

| Tipo de Tarefa | Agente Principal | Alternativas |
|----------------|------------------|--------------|
| **Criar componente UI** | `frontend-specialist` | `mobile-developer` |
| **Auditar segurança** | `security-auditor` | `penetration-tester` |
| **Melhorar performance** | `performance-optimizer` | `frontend-specialist` |
| **Criar/adicionar testes** | `test-engineer` | `qa-automation-engineer` |
| **Refatorar código** | `code-archaeologist` | `frontend-specialist` |
| **Melhorar SEO** | `seo-specialist` | - |
| **Debugar problema** | `debugger` | `code-archaeologist` |
| **Planejar feature** | `project-planner` | `product-owner` |
| **Mobile/PWA** | `mobile-developer` | - |
| **Documentação** | `documentation-writer` | - |

---

## 🔧 Como Usar com OpenRouter/Groq

### Configuração Recomendada

Para usar os agentes com OpenRouter ou Groq, configure no seu cliente AI:

#### OpenRouter (Análise Profunda)
```json
{
  "model": "anthropic/claude-3.5-sonnet",
  "max_tokens": 4096,
  "temperature": 0.7
}
```

#### Groq (Resposta Rápida)
```json
{
  "model": "llama-3.1-70b-versatile",
  "max_tokens": 2048,
  "temperature": 0.5
}
```

### Prompting com Contexto de Agente

Para melhores resultados, inclua o agente no seu prompt:

```markdown
[AGENTE: frontend-specialist]

Preciso criar um Card component para o NonoTV.
Nosso design system tem:
- Cores: bg-primary (#0A0B0F), primary (#F7941D)
- Tipografia: Outfit (display), Inter (body)
- Border radius: 8px (md), 16px (lg), 24px (xl)

Requisitos:
- Variantes: default, glass, elevated
- Estados: default, hover, active
- Props: children, variant, padding, interactive

Retorne o componente em React + Tailwind.
```

---

## 📁 Estrutura de Arquivos do Sistema

### Agentes (`/agents`)
| Arquivo | Descrição |
|---------|-----------|
| `frontend-specialist.md` | Arquiteto Frontend sênior |
| `backend-specialist.md` | Especialista Backend/API |
| `security-auditor.md` | Auditor de segurança |
| `test-engineer.md` | Engenheiro de testes |
| `performance-optimizer.md` | Otimizador de performance |
| `seo-specialist.md` | Especialistas SEO/GEO |
| `code-archaeologist.md` | Refatorador de código |
| `mobile-developer.md` | Desenvolvedor mobile |
| `debugger.md` | Analista de bugs |
| `project-planner.md` | Planejador de tarefas |

### Skills (`/skills`)
| Arquivo | Descrição |
|---------|-----------|
| `frontend-design/` | Princípios de design UI/UX |
| `vulnerability-scanner/` | Scanner de segurança OWASP |
| `testing-patterns/` | Padrões de teste |
| `performance-profiling/` | Otimização de performance |
| `seo-fundamentals/` | SEO técnico |
| `clean-code/` | Padrões de código |

### Workflows (`/workflows`)
| Comando | Descrição |
|---------|-----------|
| `/brainstorm` | Sessão de descoberta |
| `/create` | Criar nova feature |
| `/debug` | Debugar problema |
| `/enhance` | Melhorar código existente |
| `/test` | Executar testes |
| `/plan` | Planejar tarefas |

---

## 🚀 Workflows Práticos

### 1. Auditoria de Segurança Completa

```markdown
# Execute com security-auditor

1. Verificar credenciais expostas
   grep -r "password\|apiKey\|secret" src/

2. Verificar dependências vulneráveis
   npm audit

3. Analisar código para XSS/injeções
   Use vulnerability-scanner skill

4. Verificar configuração (CORS, headers)
   Analise vite.config.js

5. Gerar relatório
```

### 2. Criação de Novo Componente

```markdown
# Execute com frontend-specialist

1. Definir requisitos
   - Props necessárias
   - Variantes
   - Estados
   - Acessibilidade

2. Verificar design system
   - tailwind.config.js
   - index.css (componentes)
   - constants/

3. Criar componente
   - UI/Button.jsx (base)
   - UI/Card.jsx (base)
   - Components/Channels/...

4. Adicionar testes
   - components/*.test.jsx
```

### 3. Melhoria de Performance

```markdown
# Execute com performance-optimizer

1. Analisar bundle
   npm run build
   Verificar sizes

2. Implementar code splitting
   vite.config.js → manualChunks

3. Otimizar imports
   - hls.js → lazy load
   - lucide-react → tree-shake

4. Adicionar memoização
   - React.memo em listas
   - useMemo/useCallback

5. Verificar Core Web Vitals
   Lighthouse audit
```

### 4. Refatoração de Código

```markdown
# Execute com code-archaeologist

1. Mapear code smells
   - Números mágicos
   - Funções grandes
   - Duplicação

2. Criar constantes
   src/constants/index.js

3. Extrair lógicas
   - Hooks customizados
   - Utils

4. Melhorar tipagem
   - TypeScriptgradual

5. Adicionar documentação
   - JSDoc
   - README
```

---

## 📋 Checklist de Uso

### Antes de Começar
- [ ] Entender a tarefa necessária
- [ ] Selecionar o agente correto
- [ ] Preparar contexto do projeto

### Durante a Execução
- [ ] Fornecer requisitos claros
- [ ] Referenciar design system existente
- [ ] Especificar constraints (performance, acessibilidade)

### Após a Implementação
- [ ] Verificar build (`npm run build`)
- [ ] Verificar testes (`npm test`)
- [ ] Revisar código manualmente

---

## 🔗 Referências Rápidas

| Recurso | Localização |
|---------|-------------|
| Design System | `tailwind.config.js`, `src/index.css` |
| Constantes | `src/constants/index.js` |
| Componentes UI | `src/components/UI/` |
| Testes | `src/tests/` |
| Arquitetura | `.agent/ARCHITECTURE.md` |
| Skills | `.agent/skills/*/SKILL.md` |

---

## 💡 Dicas e Melhores Práticas

### 1. Seja Específico
```markdown
# ❌ Ruim
"Crie um botão"

# ✅ Bom
"Crie um botão primary com:
- background: #F7941D
- texto white
- padding: 16px 32px
- hover: scale(1.05)
- focus: ring-2 primary"
```

### 2. Referencie o Design System
```markdown
"Use our design tokens from tailwind.config.js:
- colors.primary
- fontFamily.display
- borderRadius.lg
- shadow-glow-sm"
```

### 3. Defina Prioridades
```markdown
"Priority order:
1. Security (nenhuma credencial exposta)
2. Accessibility (ARIA labels)
3. Performance (bundle < 500KB)
4. UX (micro-interactions)"
```

### 4. Itere com Feedback
```markdown
"Make these changes:
- Remove the purple color (use gold #F7941D)
- Add more contrast for accessibility
- Simplify the border radius"
```

---

*Documento atualizado em: 2026-03-26*
*Versão: 1.0*
*Projeto: NonoTV IPTV*