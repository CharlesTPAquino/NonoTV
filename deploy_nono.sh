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

# 1. GIT SYNC
echo -e "${YELLOW}📦 Sincronizando código com GitHub...${NC}"
git add . && git commit -m "feat: NonoTV Elite v4.2 - Deployment Sync" 2>/dev/null
git push origin main 2>/dev/null || echo -e "${RED}⚠️ Push falhou (sem rede), continuando com o Offline Build...${NC}"

# 2. VITE BUILD
echo -e "${YELLOW}🌐 Compilando Bundle Web (Vite)...${NC}"
export NODE_OPTIONS="--max-old-space-size=4096"
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
./node_modules/.bin/cap sync android
if [ $? -ne 0 ]; then echo -e "${RED}❌ Falha no Capacitor!${NC}"; exit 1; fi

# 5. GRADLE BUILD (APK)
echo -e "${YELLOW}🏗️ Gerando APK NonoTV Elite...${NC}"
cd android && ./gradlew assembleDebug
if [ $? -ne 0 ]; then echo -e "${RED}❌ Falha na geração do APK!${NC}"; exit 1; fi

# FINALIZAÇÃO E ORGANIZAÇÃO
cd ..
APK_SOURCE="android/app/build/outputs/apk/debug/app-debug.apk"
TIMESTAMP=$(date '+%Y-%m-%d_%H-%M')
LATEST_NAME="NonoTV_latest.apk"
VERSIONED_NAME="NonoTV_v${TIMESTAMP}.apk"

# Configuração de Destino Local (Desktop/Nono+)
NONO_DEST="$HOME/Desktop/Nono+"
HISTORICO_DIR="$NONO_DEST/Histórico"

echo -e "${YELLOW}📂 Organizando arquivos na pasta Nono+ Local...${NC}"
mkdir -p "$HISTORICO_DIR"
cp "$APK_SOURCE" "$NONO_DEST/$LATEST_NAME"
cp "$APK_SOURCE" "$HISTORICO_DIR/$VERSIONED_NAME"

# -- GOOGLE DRIVE (Via rclone) --
RCLONE_REMOTE="gdrive"
GDRIVE_FOLDER_ID="1Xd5pLMdsikeEYGOTXEa0NTDzlreaseuv"

if command -v rclone &> /dev/null; then
    echo -e "${YELLOW}📤 Enviando para o Google Drive (Pasta Nono+)...${NC}"
    # Envia a versão mais recente
    rclone copy "$APK_SOURCE" "${RCLONE_REMOTE}:" --drive-root-folder-id "$GDRIVE_FOLDER_ID" 2>/dev/null
    # Envia pro Histórico na Nuvem
    rclone copy "$APK_SOURCE" "${RCLONE_REMOTE}:Histórico/" --drive-root-folder-id "$GDRIVE_FOLDER_ID" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo -e "   ${GREEN}✅ Google Drive Atualizado!${NC}"
    else
        echo -e "   ${RED}⚠️ Falha no rclone (Verifique a configuração)${NC}"
    fi
else
    echo -e "   ${RED}⚠️ Rclone não instalado. Pulando upload para o Drive.${NC}"
fi

echo ""
echo -e "${GREEN}✅ DEPLOY, ORGANIZAÇÃO E UPLOAD CONCLUÍDOS!${NC}"
echo -e "⭐️ Principal:   ${BLUE}$NONO_DEST/$LATEST_NAME${NC}"
echo -e "📜 Histórico:   ${BLUE}$HISTORICO_DIR/$VERSIONED_NAME${NC}"
echo -e "☁️ Nuvem:       ${BLUE}Google Drive (Nono+)${NC}"
echo ""
echo -e "📅 Data do Build: $TIMESTAMP"
echo -e "DICA: Para instalar na TV, use o arquivo ${YELLOW}NonoTV_latest.apk${NC}"
