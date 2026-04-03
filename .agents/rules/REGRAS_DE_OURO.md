# 🏆 Regras de Ouro de Codificação - NonoTV Elite 4K

> Este documento é o fundamento de todas as sessões de desenvolvimento. Ele integra o **Antigravity Kit 2.0**, o protocolo **GSD** e a **Auditoria de Impacto (AI)**.

---

## 🛑 MANDATÓRIO: ANTES DE QUALQUER MUDANÇA

Antes de escrever uma única linha de código, a IA deve seguir este fluxo **MODAL**:

### 1. Fase de Consciência (Antigravity Kit)
- **Leitura de Contexto:** Ler `SESSION_CONTEXT.md` e `EXECUTION_PROMPTS.md`.
- **Roteamento:** Anunciar qual agente está aplicando (ex: `🤖 Applying knowledge of @frontend-specialist...`).
- **Socratic Gate:** Confirmar o entendimento com o usuário e prever efeitos colaterais.

### 2. Fase de Segurança (Auditoria de Impacto - AI)
Realizar a Auditoria de 5 pontos (obrigatória para IPTV em TV Box):
1. **Evolução vs. Legado:** O que melhora?
2. **Custo de Recurso:** Impacto em RAM/CPU/Load Time.
3. **Risco de Colapso:** 3 formas de quebrar o app em hardware limitado.
4. **Variáveis de Reversão:** Como voltamos se falhar?
5. **Conflito de Design System:** Respeita a hierarquia (Live 16:9, VOD 2:3)?

### 3. Fase de Execução (GSD - Get Shit Done)
- **Executar, Não Descrever:** Nunca diga "Vou criar o arquivo", FAÇA a chamada `write_file` ou `replace`.
- **Validação Real:** Rodar comandos reais (lint, build, testes) e mostrar o output real.
- **Surgical Edits:** Usar `replace` em vez de `write_file` em arquivos grandes para evitar perda de contexto.

---

## 🛠️ Padrões de Código Elite 4K

1. **Clean Code (P0):** Código conciso, sem sobre-engenharia, autodotumentado.
2. **Performance (P0):** Todo componente de card deve usar `React.memo` e garantir `hls.destroy()` no cleanup.
3. **Design Semântico:** 
   - Live = 16:9 (Landscape) + `pulse-glow`.
   - VOD = 2:3 (Portrait) estilo Cinema.
4. **Sync Progressivo:** Nunca travar a UI para listas > 2000 itens. Carregar em chunks.
5. **Bypass de DNS/CORS:** Sempre utilizar os proxies blindados e IPs diretos quando necessário.

---

## 🚩 PROTOCOLO DE ERRO
Se um build falhar ou um teste quebrar:
1. **STOP:** Não tente corrigir "no escuro".
2. **READ:** Leia o log de erro real.
3. **REPLAN:** Volte à Auditoria de Impacto (Ponto 4: Reversão) se o risco for alto.

---

*Este ecossistema modal é a garantia de que o NonoTV Elite 4K continuará sendo o melhor app IPTV do mercado.*
