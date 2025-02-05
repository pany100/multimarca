#!/bin/bash

# Variables
REMOTE_HOST="ubuntu@ec2-3-22-211-91.us-east-2.compute.amazonaws.com"
PEM_PATH="/Users/luispaniagua/scripts/mtservice.pem"
REMOTE_PATH="/home/ubuntu/multimarca"

# Función para manejar errores
handle_error() {
    echo "❌ Error: $1"
    exit 1
}

echo "🚀 Iniciando proceso de despliegue..."
echo "📦 Construyendo la aplicación localmente..."
npm run build || handle_error "Falló el build local"

echo "\n🔄 Conectando al servidor remoto..."
echo "⏳ Ejecutando secuencia de comandos en el servidor..."
ssh -i "$PEM_PATH" $REMOTE_HOST << 'EOF'
  set -e  # Esto hará que el script se detenga si cualquier comando falla
  cd multimarca || exit 1
  
  echo "🛑 Deteniendo aplicación actual..."
  pm2 stop next-app || exit 1
  
  echo "🗑️  Eliminando instancia anterior de PM2..."
  pm2 delete next-app || exit 1
  
  echo "📌 Cambiando a Node.js 18.17.0..."
  nvm use 18.17.0 || exit 1
  
  echo "⬇️  Actualizando código desde Git..."
  git pull || exit 1
  
  echo "🔄 Ejecutando migraciones de Prisma..."
  npx prisma migrate deploy || exit 1
  
  echo "⚙️  Generando cliente Prisma..."
  npx prisma generate || exit 1
  
  echo "🏗️  Ejecutando prebuild..."
  npm run prebuild || exit 1
EOF

if [ $? -ne 0 ]; then
    handle_error "Falló la ejecución de comandos en el servidor"
fi

echo "\n📤 Copiando archivos de build al servidor..."
echo "⏳ Esto puede tomar unos minutos dependiendo del tamaño..."
scp -i "$PEM_PATH" -r ../multimarca/.next $REMOTE_HOST:$REMOTE_PATH || handle_error "Falló la copia de archivos al servidor"

echo "\n🔄 Iniciando la aplicación en el servidor..."
ssh -i "$PEM_PATH" $REMOTE_HOST << 'EOF'
  set -e
  cd multimarca || exit 1
  
  echo "📌 Cambiando a Node.js 18.17.0..."
  nvm use 18.17.0 || exit 1
  
  echo "🚀 Iniciando aplicación con PM2..."
  pm2 start npm --name "next-app" -- run start || exit 1
EOF

if [ $? -ne 0 ]; then
    handle_error "Falló el inicio de la aplicación en el servidor"
fi

echo "\n✅ ¡Despliegue completado exitosamente!"
echo "🌐 La aplicación debería estar disponible en unos momentos."
