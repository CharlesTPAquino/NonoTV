#!/bin/bash

# ============================================================
#  NonoTV Deploy Script v1.0
#  Autor: NonoTV Build System
#  Uso: ./deploy.sh [--drive] [--local]
#  - Compila o APK de debug e copia para pastas configuradas
# ============================================================

# --- Configurações ---
PROJECT_DIR="/home/pcnono/Secretária/IPTV/meu-iptv"
APK_SOURCE="$PROJECT_DIR/android/app/build/outputs/apk/debug/NonoTV-debug.apk"
APK_NAME="NonoTV-debug.apk"

# Pasta local de destino (fácil de encontrar)
LOCAL_DEST="$HOME/Desktop/NonoTV"

# Detecta o Google Drive montado pelo GNOME (gvfs)
GDRIVE_MOUNT=$(ls "$HOME/.gvfs/" 2>/dev/null | grep -i "google\|drive" | head -1)
if [ -z "$GDRIVE_MOUNT" ]; then
  # Tenta via /run/user (sistemas mais novos)
  GDRIVE_MOUNT=$(ls /run/user/$(id -u)/gvfs/ 2>/dev/null | grep -i "google\|drive" | head -1)
  if [ -n "$GDRIVE_MOUNT" ]; then
    GDRIVE_PATH="/run/user/$(id -u)/gvfs/$GDRIVE_MOUNT/NonoTV-APK"
  fi
else
  GDRIVE_PATH="$HOME/.gvfs/$GDRIVE_MOUNT/NonoTV-APK"
fi

# Se não encontrar GVFS, usa rclone (se instalado)
USE_RCLONE=false
if command -v rclone &> /dev/null; then
  USE_RCLONE=true
fi

# --- Cores no terminal ---
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     📺  NonoTV Deploy Script v1.0       ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════╝${NC}"
echo ""

# === PASSO 1: Build do Vite ===
echo -e "${YELLOW}[1/4] Compilando o bundle web (Vite)...${NC}"
cd "$PROJECT_DIR" || { echo -e "${RED}❌ Pasta do projeto não encontrada!${NC}"; exit 1; }
npm run build
if [ $? -ne 0 ]; then echo -e "${RED}❌ Falha no build Vite!${NC}"; exit 1; fi
echo -e "${GREEN}✅ Web build concluído!${NC}"

# BARREIRA DE TESTES: Novo!
echo -e "${YELLOW}[1.5/4] Executando Testes de Qualidade...${NC}"
npm test -- --run
if [ $? -ne 0 ]; then 
  echo -e "${RED}❌ ALERTA: OS TESTES FALHARAM!${NC}"
  echo -e "${RED}🛑 Deploy interrompido para evitar downgrade no APK.${NC}"
  exit 1 
fi
echo -e "${GREEN}✅ Qualidade validada!${NC}"

# === PASSO 1.8: Sincronização de Ícones Premium ===
echo -e "${YELLOW}[1.8/4] Sincronizando Ícones e Logos Premium...${NC}"
ICON_SRC="/home/pcnono/.gemini/antigravity/brain/844a8088-4b19-4d2a-b4c6-c5aa1ffb23ae/media__1774209584735.png"
if [ -f "$ICON_SRC" ]; then
  # Sincroniza logos da Web
  cp "$ICON_SRC" "$PROJECT_DIR/public/logo.png"
  cp "$ICON_SRC" "$PROJECT_DIR/public/icon.png"
  
  # Sincroniza Ícones Android (Mipmaps)
  MIPMAP_DIR="$PROJECT_DIR/android/app/src/main/res"
  cp "$ICON_SRC" "$MIPMAP_DIR/mipmap-mdpi/ic_launcher.png"
  cp "$ICON_SRC" "$MIPMAP_DIR/mipmap-hdpi/ic_launcher.png"
  cp "$ICON_SRC" "$MIPMAP_DIR/mipmap-xhdpi/ic_launcher.png"
  cp "$ICON_SRC" "$MIPMAP_DIR/mipmap-xxhdpi/ic_launcher.png"
  cp "$ICON_SRC" "$MIPMAP_DIR/mipmap-xxxhdpi/ic_launcher.png"
  
  # Sincroniza Round Icons (opcional mas recomendado)
  cp "$ICON_SRC" "$MIPMAP_DIR/mipmap-mdpi/ic_launcher_round.png"
  cp "$ICON_SRC" "$MIPMAP_DIR/mipmap-hdpi/ic_launcher_round.png"
  cp "$ICON_SRC" "$MIPMAP_DIR/mipmap-xhdpi/ic_launcher_round.png"
  cp "$ICON_SRC" "$MIPMAP_DIR/mipmap-xxhdpi/ic_launcher_round.png"
  cp "$ICON_SRC" "$MIPMAP_DIR/mipmap-xxxhdpi/ic_launcher_round.png"
  
  echo -e "   ${GREEN}✅ Ícones e Logos Atualizados!${NC}"
else
  echo -e "   ${RED}⚠️  Fonte do ícone não encontrada. Pulando...${NC}"
fi

# === PASSO 2: Sync do Capacitor ===
echo ""
echo -e "${YELLOW}[2/4] Sincronizando com o Android (Capacitor)...${NC}"
npx cap sync android
if [ $? -ne 0 ]; then echo -e "${RED}❌ Falha no cap sync!${NC}"; exit 1; fi
echo -e "${GREEN}✅ Capacitor sincronizado!${NC}"

# === PASSO 3: Compilar o APK com Gradle ===
echo ""
echo -e "${YELLOW}[3/4] Compilando o APK Android (Gradle)...${NC}"
cd "$PROJECT_DIR/android" || { echo -e "${RED}❌ Pasta android não encontrada!${NC}"; exit 1; }
./gradlew assembleDebug
if [ $? -ne 0 ]; then echo -e "${RED}❌ Falha na compilação Gradle!${NC}"; exit 1; fi
echo -e "${GREEN}✅ APK compilado com sucesso!${NC}"

# Verificar se o APK existe
if [ ! -f "$APK_SOURCE" ]; then
  echo -e "${RED}❌ APK não encontrado em: $APK_SOURCE${NC}"; exit 1
fi

APK_SIZE=$(du -sh "$APK_SOURCE" | cut -f1)
echo -e "   📦 Arquivo: ${GREEN}$APK_NAME${NC} (${APK_SIZE})"

# === PASSO 4: Distribuição ===
echo ""
echo -e "${YELLOW}[4/4] Distribuindo o APK...${NC}"

# Define o nome das versões (Latest + Histórico Data/Hora)
TIMESTAMP=$(date '+%Y-%m-%d_%H-%M')
VERSIONED_NAME="NonoTV_v$TIMESTAMP.apk"
LATEST_NAME="NonoTV_latest.apk"

# Prepara as cópias temporárias
cp "$APK_SOURCE" "/tmp/$VERSIONED_NAME"
cp "$APK_SOURCE" "/tmp/$LATEST_NAME"

# -- Cópia Local (Desktop) --
mkdir -p "$LOCAL_DEST/Historico"
cp "/tmp/$LATEST_NAME" "$LOCAL_DEST/$LATEST_NAME"
cp "/tmp/$VERSIONED_NAME" "$LOCAL_DEST/Historico/$VERSIONED_NAME"
echo -e "   ${GREEN}✅ Desktop:${NC}   $LOCAL_DEST/$LATEST_NAME"
echo -e "               ${GREEN}Histórico em:${NC} $LOCAL_DEST/Historico/"

# -- Google Drive via GVFS --
if [ -n "$GDRIVE_PATH" ]; then
  mkdir -p "$GDRIVE_PATH/Historico" 2>/dev/null
  if cp "/tmp/$LATEST_NAME" "$GDRIVE_PATH/$LATEST_NAME" 2>/dev/null && cp "/tmp/$VERSIONED_NAME" "$GDRIVE_PATH/Historico/$VERSIONED_NAME" 2>/dev/null; then
    echo -e "   ${GREEN}✅ Google Drive (GVFS):${NC} $GDRIVE_PATH/$LATEST_NAME"
  fi
fi

# -- Google Drive via rclone (alternativa profissional) --
if $USE_RCLONE; then
  echo -e "   ${YELLOW}📤 Enviando para Google Drive via rclone...${NC}"
  
  # Usando o ID da pasta específica que você enviou: 1Xd5pLMdsikeEYGOTXEa0NTDzlreaseuv
  RCLONE_REMOTE="gdrive"
  GDRIVE_FOLDER_ID="1Xd5pLMdsikeEYGOTXEa0NTDzlreaseuv"
  
  # Verifica se o remote gdrive existe
  if rclone listremotes | grep -q "^${RCLONE_REMOTE}:"; then
    echo -e "   🔄 Atualizando NonoTV_latest.apk..."
    rclone copy "/tmp/$LATEST_NAME" "${RCLONE_REMOTE}:" --drive-root-folder-id "$GDRIVE_FOLDER_ID" 2>/dev/null
    
    echo -e "   📦 Salvando backup $VERSIONED_NAME no histórico..."
    if rclone copy "/tmp/$VERSIONED_NAME" "${RCLONE_REMOTE}:Historico/" --drive-root-folder-id "$GDRIVE_FOLDER_ID" --progress 2>/dev/null; then
      echo -e "   ${GREEN}✅ Google Drive (rclone):${NC} Arquivos versionados enviados com sucesso!"
    else
      echo -e "   ${RED}❌ Falha ao enviar histórico para o Google Drive.${NC}"
    fi
  else
    echo -e "   ${YELLOW}⚠️  Acesso rclone não configurado. Rode: ${NC}rclone config"
  fi
fi

# Cleanup temporários
rm -f "/tmp/$VERSIONED_NAME" "/tmp/$LATEST_NAME"

# === Resultado Final ===
BUILD_DATE=$(date '+%d/%m/%Y às %H:%M')
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   🚀 Deploy Concluído!  $BUILD_DATE   ║${NC}"
echo -e "${GREEN}╠══════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║  Versão Principal:                       ║${NC}"
echo -e "${GREEN}║  ⭐️ NonoTV_latest.apk                    ║${NC}"
echo -e "${GREEN}║                                          ║${NC}"
echo -e "${GREEN}║  Nuvem: Salvo no Google Drive (Nono+)    ║${NC}"
echo -e "${GREEN}║  Local: Desktop/NonoTV/                  ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
echo ""
echo -e "  Instale no Mi Stick / Tablet via:"
echo -e "  ${BLUE}📁 Gerenciador de arquivos → NonoTV_latest.apk → Instalar${NC}"
echo -e "  ${BLUE}📲 Compartilhe via 'Send Files to TV' ou Google Drive${NC}"
echo ""
