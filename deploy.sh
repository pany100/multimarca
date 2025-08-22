#!/bin/bash

# Variables
REMOTE_HOST="ubuntu@ec2-3-22-211-91.us-east-2.compute.amazonaws.com"
PEM_PATH="/Users/luispaniagua/scripts/mtservice.pem"
REPO_ROOT="/home/ubuntu/multimarca"
REMOTE_PATH="$REPO_ROOT/apps/web"   # <- ahora apuntamos a apps/web
START_TIME=$(date +%s)

handle_error() {
  echo "❌ Error: $1"
  exit 1
}

# Cargar NVM local y build
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
echo "🚀 Iniciando despliegue"
nvm use 18.17.0 || handle_error "Falló NVM"
echo "📦 Build local (apps/web)"
yarn --cwd apps/web build || handle_error "Falló el build local"

echo "📤 Copiando .next a servidor..."
scp -i "$PEM_PATH" -r apps/web/.next "$REMOTE_HOST:$REMOTE_PATH/.next2" \
  || handle_error "Falló la copia de .next"

echo "🔄 Actualizando en servidor..."
ssh -i "$PEM_PATH" $REMOTE_HOST << 'EOF'
  set -e

  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

  # Asegurar Node/PM2
  nvm use 18.17.0
  npm list -g pm2 >/dev/null 2>&1 || npm install -g pm2

  # Actualizar código
  git -C /home/ubuntu/multimarca pull

  # Ir a apps/web para todo lo demás
  cd /home/ubuntu/multimarca/apps/web

  echo "🛑 Deteniendo PM2..."
  pm2 stop next-app || true
  pm2 delete next-app || true

  echo "🔄 Migraciones Prisma..."
  npx prisma migrate deploy
  echo "⚙️  Generando Prisma client..."
  npx prisma generate

  echo "🏗️  Prebuild (si existe)..."
  npm run prebuild || true

  echo "📦 Switcheando .next..."
  rm -rf .next
  mv .next2 .next

  echo "🚀 Iniciando Next con PM2..."
  pm2 start npm --name "next-app" -- run start
EOF

[ $? -ne 0 ] && handle_error "Fallo remoto"

echo "✅ ¡Despliegue completado!"
END_TIME=$(date +%s); DURATION=$((END_TIME - START_TIME)); echo "⏱️ ${DURATION}s"