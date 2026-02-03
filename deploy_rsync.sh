#!/usr/bin/env bash
set -euo pipefail

# =====================================================================
# DEPLOY OPTIMIZADO CON RSYNC
# Solo transfiere los archivos que cambiaron (delta transfer)
# Después del primer deploy, típicamente sube ~10-50MB en lugar de 700MB
# =====================================================================

# ========= Config =========
REMOTE_HOST="ubuntu@ec2-3-22-211-91.us-east-2.compute.amazonaws.com"

# Detectar SO y asignar ruta del PEM
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  PEM_PATH="/Users/luispaniagua/scripts/mtservice.pem"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  # Ubuntu/Linux
  PEM_PATH="/home/luis/scripts/mtservice.pem"
else
  echo "❌ Sistema operativo no soportado: $OSTYPE"
  exit 1
fi

# Verificar que el PEM existe
if [ ! -f "$PEM_PATH" ]; then
  echo "❌ No se encontró el archivo PEM en: $PEM_PATH"
  exit 1
fi
REPO_ROOT="/home/ubuntu/multimarca"
REMOTE_PATH="$REPO_ROOT/apps/web"
TUNNEL_PORT=2222

NODE_VER="20"
NEXT_APP_NAME="next-app"

# ========= Util =========
START_TIME=$(date +%s)

handle_error() { echo "❌ Error: $1"; exit 1; }

# Convertir bytes a formato legible (funciona en macOS y Linux)
bytes_to_human() {
  local bytes=$1
  if [ -z "$bytes" ] || [ "$bytes" -eq 0 ] 2>/dev/null; then
    echo "0 B"
    return
  fi
  if [ "$bytes" -ge 1073741824 ]; then
    echo "$((bytes / 1073741824)).$((bytes % 1073741824 * 100 / 1073741824)) GB"
  elif [ "$bytes" -ge 1048576 ]; then
    echo "$((bytes / 1048576)).$((bytes % 1048576 * 100 / 1048576)) MB"
  elif [ "$bytes" -ge 1024 ]; then
    echo "$((bytes / 1024)).$((bytes % 1024 * 100 / 1024)) KB"
  else
    echo "${bytes} B"
  fi
}

cleanup() {
  # cerrar túnel si quedó abierto
  pkill -f "ssh .* -L ${TUNNEL_PORT}:localhost:22 .* ${REMOTE_HOST}" >/dev/null 2>&1 || true
}
trap cleanup EXIT

# ========= Limpiar túnel previo si existe =========
echo "🧹 Verificando túnel previo en puerto ${TUNNEL_PORT}..."
# Matar cualquier proceso SSH usando ese puerto
lsof -ti:${TUNNEL_PORT} | xargs kill -9 2>/dev/null || true
sleep 1

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

# ========= Preparar .next2 para comparación =========
echo "🔍 Preparando base para comparación..."
ssh -p "$TUNNEL_PORT" \
    -o StrictHostKeyChecking=accept-new \
    -i "$PEM_PATH" ubuntu@localhost \
    bash -l <<EOF
      cd ${REMOTE_PATH}
      # Si .next2 no existe pero .next sí, copiar .next a .next2
      # Así rsync tiene contra qué comparar (solo sube diferencias)
      if [ ! -d .next2 ] && [ -d .next ]; then
        echo '   → Copiando .next a .next2 como base (hard links, instantáneo)'
        cp -al .next .next2
      elif [ ! -d .next2 ]; then
        echo '   → Primer deploy, se subirá todo'
        mkdir -p .next2
      else
        echo '   → .next2 existe, rsync comparará contra él'
      fi
EOF

# ========= Rsync incremental por túnel =========
echo "📤 Sincronizando .next con rsync (solo cambios)..."

RSYNC_OUTPUT=$(rsync -avz --delete \
    --compress-level=9 \
    --stats \
    -e "ssh -p ${TUNNEL_PORT} -i ${PEM_PATH} -o StrictHostKeyChecking=accept-new" \
    apps/web/.next/ \
    "ubuntu@localhost:${REMOTE_PATH}/.next2/" \
    2>&1) || {
      echo "❌ Rsync falló. Output:"
      echo "$RSYNC_OUTPUT"
      exit 1
    }

# Extraer estadísticas relevantes (|| true para evitar que grep falle si no encuentra)
TOTAL_SIZE=$(echo "$RSYNC_OUTPUT" | grep "Total file size" | awk '{print $4}' || echo "0")
SENT_BYTES=$(echo "$RSYNC_OUTPUT" | grep "Total bytes sent" | awk '{print $4}' || echo "0")
FILES_TRANSFERRED=$(echo "$RSYNC_OUTPUT" | grep "Number of regular files transferred" | awk '{print $6}' || echo "0")

# Asegurar valores por defecto
TOTAL_SIZE=${TOTAL_SIZE:-0}
SENT_BYTES=${SENT_BYTES:-0}
FILES_TRANSFERRED=${FILES_TRANSFERRED:-0}

echo ""
echo "📊 Estadísticas de transferencia:"
echo "   📁 Archivos transferidos: ${FILES_TRANSFERRED}"
echo "   📤 Datos enviados: $(bytes_to_human "${SENT_BYTES}")"
echo "   💾 Tamaño total del build: $(bytes_to_human "${TOTAL_SIZE}")"
echo ""

# ========= Operaciones remotas (swap, pm2) vía túnel =========
echo "🔧 Actualizando en servidor..."
ssh -p "$TUNNEL_PORT" \
    -o StrictHostKeyChecking=accept-new \
    -i "$PEM_PATH" ubuntu@localhost \
    bash -l <<EOF || handle_error "Fallo remoto"
      set -e

      export NVM_DIR="\$HOME/.nvm"
      [ -s "\$NVM_DIR/nvm.sh" ] && . "\$NVM_DIR/nvm.sh"

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
      cp -al apps/web/.next2 apps/web/.next

      echo '🚀 Iniciando Next con PM2...'
      pm2 start npm --name ${NEXT_APP_NAME} --cwd ${REMOTE_PATH} -- run start
EOF

# ========= Fin =========
END_TIME=$(date +%s); DURATION=$((END_TIME - START_TIME))
echo ""
echo "✅ ¡Despliegue completado! ⏱️ ${DURATION}s"

# Mostrar resumen de ahorro
if [ -n "$SENT_BYTES" ] && [ -n "$TOTAL_SIZE" ] && [ "$TOTAL_SIZE" -gt 0 ] 2>/dev/null; then
  SAVINGS=$((100 - (SENT_BYTES * 100 / TOTAL_SIZE)))
  echo "💡 Ahorro rsync: ${SAVINGS}% (enviaste $(bytes_to_human ${SENT_BYTES}) de $(bytes_to_human ${TOTAL_SIZE}))"
else
  echo "💡 Tip: Los siguientes deploys serán mucho más rápidos gracias a rsync"
fi
