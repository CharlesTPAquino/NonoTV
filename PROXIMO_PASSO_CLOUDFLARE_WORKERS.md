# Próximo Passo: Integração Cloudflare Workers

## Contexto

O NonoTV Elite 4K tem um painel admin em Cloudflare Workers (`https://nonotv-auth.nonotv-auth.workers.dev`) que atualmente funciona apenas como interface HTML — sem APIs REST para o app consumir.

---

## Estado Atual

### Painel Admin (Cloudflare Workers)
- **URL:** https://nonotv-auth.nonotv-auth.workers.dev
- **Status:** ✅ Online e funcionando
- **Interface:** Dashboard completo com:
  - Stats de usuários (total, ativos, expirados, warning)
  - Tabela de usuários
  - Modal criar usuário
  - Badges de status
  - Ações (WhatsApp, editar, bloquear)

### App (Frontend)
- **Autenticação:** Supabase direto ✅
- **Proteção:** Multi-device via Supabase ✅
- **Check silencioso:** 60s para auth worker ✅
- **Fallback local:** Apenas offline ✅

---

## Problema Identificado

O painel admin **não expõe APIs** para o app mobile. Atualmente:
- App faz tudo via Supabase (direto)
- Auth worker só serve para acesso manual (via browser)
- Não há comunicação app ↔ auth worker

---

## O Que Precisa Ser Feito

### Opção 1: Adicionar APIs ao Auth Worker
Criar endpoints REST no Cloudflare Workers para:
- `POST /api/clients` — Criar usuário
- `PUT /api/clients/:id` — Atualizar usuário
- `PUT /api/clients/:id/block` — Bloquear usuário
- `DELETE /api/clients/:id` — Deletar usuário
- `GET /api/clients` — Listar usuários
- `POST /api/clients/:id/reset-password` — Resetar senha

### Opção 2: Manter Atual (Supabase Direto)
- App continua usando Supabase
- Auth worker apenas para acesso manual
- Sem integração necessária

---

## Decisão do Charles (Pendente)

O Charles possui o código do auth worker no Cloudflare Dashboard. Precisa decidir se:
1. Adiciona endpoints de API ao worker
2. Mantém apenas como painel manual

---

## Referências

- **Painel:** https://nonotv-auth.nonotv-auth.workers.dev
- **Cloudflare Dashboard:** https://dash.cloudflare.com/ee98f9af16d842991631ac2428f53605
- **Supabase Project:** bcifnbatqrmljfrhjwnk

---

## Tarefas para Implementação

Se decidir implementar (Opção 1):

1. Acessar Cloudflare Dashboard
2. Editar código do worker
3. Adicionar rotas de API
4. Atualizar app para usar endpoints do worker
5. Testar integração

---

*Documentado em: 17/04/2026*
*Próximo passo pendente de decisão do Charles*