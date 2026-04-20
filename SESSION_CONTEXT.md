# NonoTV IPTV - Contexto da Sessão

> Última atualização: 20/04/2026 às 12:20
> Status: Aspect ratio 2:3 aplicado para movies e series

---

## 📍 De Onde Viemos
- **18/04:** Sistema restaurado após reversão / Cloudflare Worker novo
- **19/04:** -
- **20/04:** Correção do aspect ratio dos cards

## 🛠️ Onde Estamos (18/04/2026)

### 1. Cloudflare Worker Recriado ✅
- **URL:** https://nonotv-auth.nonotv-auth.workers.dev
- **APIs:** login, validate, CRUD clientes
- **Dados:** KV Namespace (Cloudflare)

### 2. Servidores Restaurados ✅
- **Principal:** Ramys (ethertwo.sbs) - FUNCIONANDO
- **GPAmigos:** 6 contas (d.plmv.site)
- **Outros:** +90 servidores

### 3. APK Gerado ✅
- **Build:** NonoTV_v2026-04-18_16-54_debug.apk
- **Tamanho:** 11 MB

---

## ⚠️ Pendências

1. **KV vazio** - Clientes precisam ser recadastrados
2. **Teste em device** - Verificar APK
3. **Limpeza** - Remover contas expiradas

---

## 🎯 Para Onde Vamos

### Prioridade 1: Teste em Produção
> Verificar se APK conecta nos servidores

### Prioridade 2: Migração de Clientes
> Transferir dados do Supabase para KV ou usar Supabase direto

### Prioridade 3: Limpeza de Expirados
> Remover contas com expiry vencido

---

## 📁 Arquivos Importantes

| Arquivo | Descrição |
|---------|----------|
| `AGENTS.md` | Regras do projeto |
| `REGISTRO_SESSAO_18-04-2026.md` | Registro completo |
| `src/data/sources.js` | Lista servidores |
| `src/data/credentials.js` | Credenciais |
| `cloudflare-workers/nonotv-auth/` | Worker |

---

## 🔧 Comandos Úteis

```bash
# Build APK
npm run build && npx cap sync android && cd android && ./gradlew assembleDebug

# Teste servidor
curl "http://d.plmv.site:80/get.php?username=y6kgH8yo5U&password=rvYx1tzezU&type=m3u_plus"

# Deploy Worker
cd cloudflare-workers/nonotv-auth && wrangler deploy
```