# NonoTV - Guia para Agentes de IA

## Regras de Nomenclatura de APK

### Formato Obrigatório
```
NonoTV_vYYYY-MM-DD_HH-MM.apk
```

Exemplos:
- `NonoTV_v2026-03-30_20-46.apk`
- `NonoTV_v2026-03-29_23-50_debug.apk`

### Regras
1. **Sempre** usar data e hora da mudança (não hora atual)
2. **Sempre** incluir `_debug` ou `_release` no sufixo quando aplicável
3. **Sempre** fazer upload para Drive: `gdrive:Nono+/`
4. O APK deve ser copiado para a raiz do projeto antes do upload

### Script de Build (Use este padrão)
```bash
# 1. Build e sync
cd /home/pcnono/Secretária/IPTV/meu-iptv
npm run build
npx cap sync android
cd android && ./gradlew assembleDebug

# 2. Copiar com nome correto (use a hora da mudança)
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M")
cp android/app/build/outputs/apk/debug/NonoTV-debug.apk "../NonoTV_v${TIMESTAMP}_debug.apk"

# 3. Upload para Drive
rclone copy "../NonoTV_v${TIMESTAMP}_debug.apk" "gdrive:Nono+/" -v
```

---

## Decisões de Arquitetura (29/03/2026)

### Projeto Principal
- **Diretório**: `/home/pcnono/Secretária/IPTV/meu-iptv/`
- **Versão**: Ativa/em desenvolvimento
- **Build APK**: Execute neste diretório

### Projeto Legado
- **Diretório**: `/home/pcnono/Secretária/IPTV/meu-iptv/meu-iptv/`
- **Status**: Legado - NÃO usar para desenvolvimento
- **Função**: Backup/disaster recovery apenas
- **Data de migração**: 29/03/2026

---

## Como Codificar

### Editar Código Fonte
Edite SEMPRE no projeto principal:
```
/home/pcnono/Secretária/IPTV/meu-iptv/src/
```

### Arquivos Importantes

| Arquivo | Caminho | Descrição |
|---------|---------|-----------|
| Fontes IPTV | `src/data/sources.js` | Lista de servidores (37 fontes) |
| Credenciais | `src/data/credentials.js` | Sistema de credenciais (leia de .env) |
| API Principal | `src/services/api.js` | Sistema de fallback (CapacitorHttp → proxies → fetch) |
| SyncService | `src/services/SyncService.js` | Sincronização de canais |
| ServerHealth | `src/services/ServerHealthService.js` | Verificação de saúde dos servidores |
| Context | `src/context/SourceContext.jsx` | Gerenciamento de estado das fontes |

---

## Como Buildar

### Android APK (Desenvolvimento)
```bash
cd /home/pcnono/Secretária/IPTV/meu-iptv
npm run build
npx cap sync android
npx cap run android
```

### Android APK (Produção)
```bash
cd /home/pcnono/Secretária/IPTV/meu-iptv
npm run build
npx cap sync android
cd android
./gradlew assembleRelease
# APK em: android/app/build/outputs/apk/release/
```

### Debug APK (Rápido)
```bash
cd /home/pcnono/Secretária/IPTV/meu-iptv
npx cap sync android
npx cap run android
```

---

## Estrutura de Diretórios

```
/home/pcnono/Secretária/IPTV/meu-iptv/
├── src/
│   ├── services/           # Lógica de negócio
│   │   ├── api.js          ← EDITAR AQUÍ
│   │   ├── SyncService.js
│   │   ├── ServerHealthService.js
│   │   ├── RetryService.js
│   │   ├── AIService.js
│   │   ├── AISyncService.js
│   │   ├── EPGService.js
│   │   ├── PrefetchService.js
│   │   ├── SyncManager.js
│   │   └── channelCache.js
│   ├── data/
│   │   └── sources.js      ← EDITAR AQUÍ (fontes IPTV)
│   └── context/
│       └── SourceContext.jsx
├── android/                # Build nativo
├── NonoTV_v*.apk          # APKs pré-compilados
├── package.json
└── AGENTS.md              ← Este arquivo
```

---

## Histórico de Mudanças

### 29/03/2026 - Migração de Projeto
- Projeto pai (`/meu-iptv/`) definido como principal
- Fontes do filho migradas (17 → 37 fontes)
- Filho marcado como legado
- Sistema de fallback implementado em api.js

### Antes (Legado)
- Filho tinha 35+ fontes
- Pai tinha 17 fontes
- APK anteriorbuildado do filho

---

## Regras para Agentes de IA

1. **SEMPRE** edite no projeto pai (`/meu-iptv/src/`)
2. **NUNCA** edite no projeto filho (`/meu-iptv/meu-iptv/`) - é apenas backup
3. **NUNCA** delete arquivos .md ou documentação
4. Execute `npm run build` antes de gerar APK
5. Use `npx cap sync android` após modificar código nativo
6. Teste no emulador antes de considerar 功能 completa

---

## Sistema de Credenciais

### Arquivos
- `.env.example` - Template com todas as variáveis
- `.env` - Suas credenciais (NUNCA commitar)
- `src/data/credentials.js` - Módulo que lê as credenciais

### Como usar
1. Copie `.env.example` para `.env`
2. Preencha as variáveis com suas credenciais
3. As credenciais são lidas em tempo de build

### Segurança
- As credenciais são embedadas no APK em tempo de build
- Para máxima segurança, implemente um servidor de autenticação
- Nunca commit arquivos `.env`

---

## Problemas Conhecidos

### APK não carrega canais
- Verificar `src/services/api.js` - sistema de fallback pode falhar
- Logs: Abra DevTools (ADB) e procure por `[API]` ou `[SyncService]`

### Servidor não responde
- Fontes podem ter expirado - verificar campo `expires` em `sources.js`
- Testar URLs manualmente no navegador

### Build falha
- Limpar cache: `rm -rf node_modules/.cache`
- Reinstalar deps: `rm -rf node_modules && npm install`

---

## Contato /调试

Para debugar no Android:
```bash
# Ver logs em tempo real
adb logcat | grep -i "NonoTV\|Capacitor"

# Abrir DevTools
adb forward tcp:9222 localabstract:chrome_devtools_remote
# Abra chrome://inspect no Chrome Desktop
```
