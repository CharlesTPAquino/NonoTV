---
description: Como iniciar o NonoTV em modo desenvolvimento
---

# /preview - Iniciar Desenvolvimento Local

## Pré-requisitos
- Node.js 18+
- NPM instalado

## Passos

### 1. Matar processos antigos
```bash
pkill -f 'proxy-local.cjs' 2>/dev/null
pkill -f 'vite' 2>/dev/null
```

### 2. Iniciar Proxy + Vite
```bash
cd /home/pcnono/Secretária/IPTV/meu-iptv
node proxy-local.cjs &
npm run dev
```

### 3. Verificar no Browser
1. Abra `http://localhost:5173`
2. Faça `Ctrl+Shift+R` para limpar cache
3. O console deve mostrar:
   - `[DEV] Usando proxy local para:` ✅
   - `[EPGService] EPG carregado: XXXXX programas` ✅
   - **SEM** `[Validator]` logs (desabilitado em DEV)
   - **SEM** CORS errors nos streams

### 4. Troubleshooting
- Se o proxy não sobe: `lsof -i :3131` e kill o PID
- Se Vite sobe em porta diferente: não importa, o proxy sempre é `localhost:3131`
- Extensão NG-Anti-CORS: **DESABILITE** — ela causa erros em arquivos >64MB

## Arquitetura de Rede (DEV)

```
Browser (localhost:5173)
  ├── api.js syncSource() → localhost:3131/?url=... → Servidor IPTV
  ├── EPGService.js → localhost:3131/?url=... → XML EPG
  └── HLS.js xhrSetup → localhost:3131/?url=... → Stream .ts
```

## Notas
- O Validador de canais é **desabilitado em DEV** (CORS impede fetch de streams)
- O proxy segue redirecionamentos automaticamente
- URLs usam IP direto (185.66.90.170) para bypassar bloqueio DNS do provedor
