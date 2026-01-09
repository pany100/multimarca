#!/usr/bin/env bash
set -euo pipefail

# =====================================================================
# DEPLOY OPTIMIZADO CON RSYNC
# Solo transfiere los archivos que cambiaron (delta transfer)
# Después del primer deploy, típicamente sube ~10-50MB en lugar de 700MB
# =====================================================================

# ========= Config =========
REMOTE_HOST="ubuntu@ec2-3-22-211-91.us-east-2.compute.amazonaws.com"
PEM_PATH="/Users/luispaniagua/scripts/mtservice.pem"
REPO_ROOT="/home/ubuntu/multimarca"
REMOTE_PATH="$REPO_ROOT/apps/web"
TUNNEL_PORT=2222

NODE_VER="20"
NEXT_APP_NAME="next-app"

# ========= Util =========
START_TIME=$(date +%s)

handle_error() { echo "❌ Error: $1"; exit 1; }

cleanup() {
  # cerrar túnel si quedó abierto
  pkill -f "ssh .* -L ${TUNNEL_PORT}:localhost:22 .* ${REMOTE_HOST}" >/dev/null 2>&1 || true
}
trap cleanup EXIT

# ========= Build local =========
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
echo "🚀 Iniciando despliegue (rsync optimizado)"
nvm install "$NODE_VER" || true
nvm use "$NODE_VER" || handle_error "Falló NVM"
echo "📦 Build local (apps/web)"
yarn --cwd apps/web build || handle_error "Falló el build local"

# ========= Túnel SSH (local 2222 -> remoto 22) =========
echo "🛣️  Abriendo túnel SSH en localhost:${TUNNEL_PORT} → ${REMOTE_HOST}:22 ..."
ssh -i "$PEM_PATH" \
  -f -N \
  -o ExitOnForwardFailure=yes \
  -o ServerAliveInterval=30 -o ServerAliveCountMax=3 \
  -L "${TUNNEL_PORT}:localhost:22" \
  "$REMOTE_HOST"

# Comprobación rápida del túnel
sleep 1
if ! nc -z localhost "$TUNNEL_PORT" 2>/dev/null; then
  handle_error "No se pudo abrir el túnel en localhost:${TUNNEL_PORT}"
fi

# ========= Rsync incremental por túnel =========
echo "📤 Sincronizando .next con rsync (solo cambios)..."
echo "   → Primera vez: ~700MB | Siguientes: ~10-50MB"

rsync -avz --delete \
    --progress \
    --compress-level=9 \
    --stats \
    -e "ssh -p ${TUNNEL_PORT} -i ${PEM_PATH} -o StrictHostKeyChecking=accept-new" \
    apps/web/.next/ \
    "ubuntu@localhost:${REMOTE_PATH}/.next2/" \
    || handle_error "Falló rsync"

# ========= Operaciones remotas (swap, pm2) vía túnel =========
echo "🔧 Actualizando en servidor..."
ssh -p "$TUNNEL_PORT" \
    -o StrictHostKeyChecking=accept-new \
    -i "$PEM_PATH" ubuntu@localhost \
    bash -lc "
      set -e

      export NVM_DIR=\"\$HOME/.nvm\"
      [ -s \"\$NVM_DIR/nvm.sh\" ] && . \"\$NVM_DIR/nvm.sh\"

      # Node y PM2
      nvm use ${NODE_VER}
      npm list -g pm2 >/dev/null 2>&1 || npm install -g pm2

      # Código al día
      git -C ${REPO_ROOT} pull

      # Entrar a apps/web
      cd ${REMOTE_PATH}

      echo '🛑 Deteniendo PM2...'
      pm2 stop ${NEXT_APP_NAME} || true
      pm2 delete ${NEXT_APP_NAME} || true

      cd ${REPO_ROOT}
      echo '🔄 Migraciones Prisma...'
      yarn --cwd apps/web prisma migrate deploy
      echo '⚙️  Generando Prisma client...'
      yarn --cwd apps/web prisma generate

      echo '🏗️  Prebuild (si existe)...'
      yarn --cwd apps/web prebuild || true
      
      echo '📦 Switcheando .next...'
      rm -rf apps/web/.next
      mv apps/web/.next2 apps/web/.next

      echo '🚀 Iniciando Next con PM2...'
      pm2 start npm --name ${NEXT_APP_NAME} --cwd ${REMOTE_PATH} -- run start
    " || handle_error "Fallo remoto"

# ========= Fin =========
END_TIME=$(date +%s); DURATION=$((END_TIME - START_TIME))
echo ""
echo "✅ ¡Despliegue completado! ⏱️ ${DURATION}s"
echo "💡 Tip: Los siguientes deploys serán mucho más rápidos gracias a rsync"
