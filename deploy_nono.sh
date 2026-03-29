#!/bin/bash
# ============================================================
#  NonoTV Elite Deploy v4.2 - High Speed Automation
# ============================================================

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🚀 Iniciando Deploy NonoTV Elite v4.2...${NC}"

# 1. GIT SYNC (Opcional - se houver algo novo)
echo -e "${YELLOW}📦 Sincronizando código com GitHub...${NC}"
git add . && git commit -m "feat: NonoTV Elite v4.2 - Deployment Sync" 2>/dev/null
git push origin main 2>/dev/null || echo -e "${RED}⚠️ Push falhou (sem rede), continuando com o Offline Build...${NC}"

# 2. VITE BUILD (Web)
echo -e "${YELLOW}🌐 Compilando Bundle Web (Vite)...${NC}"
export NODE_OPTIONS="--max-old-space-size=4096" # Previne out of memory
npm run build
if [ $? -ne 0 ]; then echo -e "${RED}❌ Falha no build Vite!${NC}"; exit 1; fi

# 3. ICON SYNC 
echo -e "${YELLOW}🖼️ Atualizando Ícones e Logos Premium...${NC}"
ICON_SRC="/home/pcnono/.gemini/antigravity/brain/844a8088-4b19-4d2a-b4c6-c5aa1ffb23ae/media__1774209584735.png"
if [ -f "$ICON_SRC" ]; then
    cp "$ICON_SRC" public/logo.png
    cp "$ICON_SRC" public/icon.png
    echo -e "   ${GREEN}✅ Ícones Sincronizados!${NC}"
fi

# 4. CAPACITOR SYNC
echo -e "${YELLOW}📲 Sincronizando com Android (Capacitor)...${NC}"
# Forçamos o uso do binário local para evitar problemas de versão do Node no terminal
./node_modules/.bin/cap sync android
if [ $? -ne 0 ]; then echo -e "${RED}❌ Falha no Capacitor!${NC}"; exit 1; fi

# 5. GRADLE BUILD (APK)
echo -e "${YELLOW}🏗️ Gerando APK NonoTV Elite...${NC}"
cd android && ./gradlew assembleDebug
if [ $? -ne 0 ]; then echo -e "${RED}❌ Falha na geração do APK!${NC}"; exit 1; fi

# FINALIZAÇÃO
APK_FINAL="app-debug.apk"
APK_PATH="app/build/outputs/apk/debug/$APK_FINAL"
TIMESTAMP=$(date '+%Y-%m-%d_%H-%M')

echo ""
echo -e "${GREEN}✅ DEPLOY CONCLUÍDO COM SUCESSO!${NC}"
echo -e "📍 Local do APK: ${BLUE}android/app/build/outputs/apk/debug/app-debug.apk${NC}"
echo -e "📅 Data: $TIMESTAMP"
echo ""
echo -e "DICA: Para instalar na TV, use o comando: ${YELLOW}adb install android/$APK_PATH${NC}"
