#!/usr/bin/env bash
set -euo pipefail

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
TMP_TAR="/tmp/next_temp.tar.gz" #esto queda en /tmp! no en el folder del proyecto

handle_error() { echo "❌ Error: $1"; exit 1; }

cleanup() {
  # borrar paquete temporal
  rm -f "$TMP_TAR" 2>/dev/null || true
  # cerrar túnel si quedó abierto
  pkill -f "ssh .* -L ${TUNNEL_PORT}:localhost:22 .* ${REMOTE_HOST}" >/dev/null 2>&1 || true
}
trap cleanup EXIT

# ========= Build local =========
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
echo "🚀 Iniciando despliegue"
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

# ========= Empaquetado y copia por túnel =========
echo "🧩 Empaquetando .next → $TMP_TAR"
tar -C apps/web -czf "$TMP_TAR" .next

echo "📤 Subiendo paquete por túnel (scp -P ${TUNNEL_PORT})..."
scp -P "$TUNNEL_PORT" \
    -o StrictHostKeyChecking=accept-new \
    -i "$PEM_PATH" \
    "$TMP_TAR" "ubuntu@localhost:${REMOTE_PATH}/" \
    || handle_error "Falló la copia de $TMP_TAR"

# ========= Operaciones remotas (extract, swap, pm2) vía túnel =========
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

      echo '🗜️  Extrayendo paquete a .next2...'
      rm -rf .next2
      mkdir -p .next2
      pwd
      tar -xzf next_temp.tar.gz -C .next2 --strip-components=1 || true
      
      rm -f next_temp.tar.gz  2>/dev/null || true
      cd ..
      cd ..
      echo '🔄 Migraciones Prisma...'
      npx prisma migrate deploy --schema=apps/web/prisma/schema.prisma
      echo '⚙️  Generando Prisma client...'
      npx prisma generate --schema=apps/web/prisma/schema.prisma

      echo '🏗️  Prebuild (si existe)...'
      yarn --cwd apps/web prebuild || true
      echo '📦 Switcheando .next...'
      rm -rf apps/web/.next
      mv apps/web/.next2 apps/web/.next

      echo '🚀 Iniciando Next con PM2...'
      pm2 start npm --name "$NEXT_APP_NAME" --cwd /home/ubuntu/multimarca/apps/web -- run start
    " || handle_error "Fallo remoto"

# ========= Fin =========
END_TIME=$(date +%s); DURATION=$((END_TIME - START_TIME))
echo "✅ ¡Despliegue completado! ⏱️ ${DURATION}s"
