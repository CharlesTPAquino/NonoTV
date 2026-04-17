# NonoTV Elite 4K — Project Rules

> Este arquivo é lido automaticamente pelo OpenCode e injetado como contexto
> em TODOS os modelos (Elephant, Claude, GPT-4o, Gemini etc.).
> Salve como: `/home/pcnono/Secretária/IPTV/meu-iptv/AGENTS.md`

---

## Identidade do Projeto

- **Nome:** NonoTV Elite 4K — app IPTV premium para Android
- **Dono:** Charles
- **Idioma:** Responda sempre em **Português (BR)**
- **Raiz do projeto:** `/home/pcnono/Secretária/IPTV/meu-iptv/`

---

## Stack Técnica

| Camada | Tecnologia |
|---|---|
| Frontend | React (JSX) + Vite |
| Bridge nativa | Capacitor v6 |
| Android nativo | Java (plugins customizados) |
| Workers | Cloudflare Workers (off-main-thread) |
| Estilização | CSS puro — `src/index.css` |
| Build | `npm run build` → `npx cap sync android` → `./gradlew assembleDebug` |
| APK output | `android/app/build/outputs/apk/debug/app-debug.apk` (~8.4 MB) |

**Nunca sugira, introduza ou mencione:** TypeScript, Tailwind, Expo, React Native,
Kotlin, Vite plugins não listados, ou qualquer tecnologia fora desta lista —
a menos que Charles peça explicitamente.

---

## Estrutura de Arquivos

```
meu-iptv/
├── src/
│   ├── App.jsx                          ← roteamento principal
│   ├── main.jsx
│   ├── index.css
│   ├── components/
│   │   ├── Player/
│   │   │   ├── VideoPlayerMinimal.jsx   ← ARQUIVO CRÍTICO
│   │   │   ├── VodPlayer.jsx
│   │   │   ├── MiniPlayer.jsx
│   │   │   ├── EPGOverlay.jsx
│   │   │   └── EPGGrid.jsx
│   │   ├── Channels/
│   │   ├── Layout/
│   │   ├── Settings/
│   │   ├── Podcast/
│   │   └── UI/
│   ├── hooks/
│   ├── services/
│   │   ├── api.js                       ← fetch direto + proxy (SEM CapacitorHttp)
│   │   ├── SyncService.js
│   │   ├── ServerHealthService.js
│   │   └── RetryService.js
│   ├── context/
│   │   └── SourceContext.jsx
│   ├── data/
│   │   ├── sources.js
│   │   └── credentials.js
│   └── constants/
├── android/                             ← projeto Android nativo
├── .agents/                             ← Antigravity Kit (20 agentes, 36 skills)
├── .memoria/                            ← IMPLEMENTACAO.md, CHARLES.md
├── .planning/                           ← GSD workflow
├── cloudflare-workers/
├── releases/                            ← APKs estáveis salvos manualmente
├── vite.config.js
└── deploy.sh
```

---

## Git — Estado Atual

| Branch | Estado |
|---|---|
| `main` | ✅ Estável — última versão consolidada |
| `tv-performance-experimental` | ✅ Branch de trabalho ativa (restaurada) |

- **Commit estável:** `a571852` — *"feat(player): stabilize channel tuning and refine UI with sharp-edge design"* (12/04/2026)
- **Tag:** `stable-2026-04-15-0940`

---

## Decisões Técnicas Permanentes

Estas decisões já foram tomadas e validadas. **Não reverta, não questione, não "otimize" sem ser solicitado.**

1. **Sem CapacitorHttp** — removido. Use apenas `fetch` direto com fallback para proxy público.
2. **Barreira de montagem no player** — `VideoPlayerMinimal.jsx` tem uma barreira entre montagem do componente e renderização da lista. Ela resolve uma race condition. Não remova.
3. **Layout full-screen** — as propriedades de posicionamento do player estão calibradas. Não altere sem aprovação.
4. **Health check é manual** — fica em Settings > Status. Não adicione health check automático na inicialização.
5. **Timeouts:** 20s por tentativa, 45s global. Não altere.
6. **Workers off-main-thread** — não mova lógica de volta para a main thread.

---

## Regras de Comportamento

### Antes de editar qualquer arquivo

- Leia o arquivo **completo** antes de propor mudanças.
- Nunca edite mais de um arquivo por vez sem listar todos e pedir confirmação.
- Se a tarefa exigir mudanças em 3+ arquivos, apresente o plano e aguarde aprovação.

### Nunca faça sem confirmação explícita de Charles

- Renomear ou deletar arquivos/pastas
- Alterar `vite.config.js`, `capacitor.config.json` ou configs de build
- Modificar qualquer coisa dentro de `android/`
- Operações git: `commit`, `reset`, `push`, `merge`, `rebase`
- `npm install` ou alterações em `package.json`
- Editar `.memoria/`, `.planning/` ou `AGENTS.md`

### Ao encontrar um problema

1. Descreva o problema claramente.
2. Proponha **uma solução** — não listas de alternativas.
3. Aguarde aprovação antes de implementar.
4. Se for ambíguo, pergunte antes de agir.

### Proibido em qualquer circunstância

- Sugerir refatorações não solicitadas ("aproveitando, poderíamos também…")
- Introduzir TypeScript em arquivos `.jsx`
- Alterar paleta de cores ou design system sem pedido
- Executar o build por conta própria
- Reescrever lógica que já funciona com o objetivo de "melhorar"

---

## Debug (sem ADB disponível)

Use `console.log` com prefixos padronizados:

```js
console.log('[API] ...')
console.log('[Player] ...')
console.log('[SourceContext] ...')
console.log('[SyncService] ...')
```

Erros em produção: **Settings > Status** dentro do app.

---

## Workflow de Build

Execute sempre nesta ordem, um de cada vez:

```bash
npm run build
npx cap sync android
cd android && ./gradlew assembleDebug
```

Se qualquer passo falhar: **pare e reporte o erro completo.** Não tente corrigir sozinho.

---

## Backup Antes de Mudanças em Arquivos Críticos

Antes de tocar em `VideoPlayerMinimal.jsx`, `App.jsx`, `api.js` ou `SourceContext.jsx`:

```bash
git add -A && git commit -m "backup: antes de [descrição]"
```

---

## Contexto de Sessão

Ao iniciar uma nova sessão, leia:

1. `.memoria/IMPLEMENTACAO.md` — histórico técnico e problemas resolvidos
2. `.memoria/CHARLES.md` — perfil e preferências do dono
3. `RESUMO_TECNICO_FINAL.md` — estado mais recente

Se esses arquivos não estiverem acessíveis, **pergunte a Charles antes de agir.**

---

*AGENTS.md — NonoTV Elite 4K — atualizado em 17/04/2026*