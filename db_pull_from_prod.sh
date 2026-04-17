#!/usr/bin/env bash
set -euo pipefail

# =====================================================================
# DB PULL FROM PROD
# 1. SSH al server y mysqldump de mtservice (pass leído del .env del server)
# 2. Trae el dump.sql a la máquina local
# 3. Drop + create de la DB local mtservice y restore del dump
# =====================================================================

# ========= Config =========
REMOTE_HOST="ubuntu@18.188.190.154"
REMOTE_ENV="/home/ubuntu/multimarca/apps/web/.env"
REMOTE_DUMP="/home/ubuntu/dump.sql"
LOCAL_DUMP="$(dirname "$0")/dump.sql"
LOCAL_ENV="$(dirname "$0")/.env"

# Detectar SO y asignar ruta del PEM (mismo patrón que deploy_rsync.sh)
if [[ "$OSTYPE" == "darwin"* ]]; then
  PEM_PATH="/Users/luispaniagua/scripts/mtservice.pem"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  PEM_PATH="/home/luis/scripts/mtservice.pem"
else
  echo "❌ Sistema operativo no soportado: $OSTYPE"
  exit 1
fi

[ -f "$PEM_PATH" ] || { echo "❌ No se encontró el PEM en: $PEM_PATH"; exit 1; }
[ -f "$LOCAL_ENV" ] || { echo "❌ No se encontró .env local en: $LOCAL_ENV"; exit 1; }

# ========= Helpers =========
read_env_var() {
  # read_env_var <file> <var-name>
  grep -E "^$2=" "$1" | head -n1 | cut -d'=' -f2- | sed -E 's/^"(.*)"$/\1/'
}

START_TIME=$(date +%s)

# ========= 1+2. Dump en el server =========
echo "📦 Generando dump en el server..."
ssh -i "$PEM_PATH" "$REMOTE_HOST" bash <<EOF
  set -euo pipefail
  if [ ! -f "$REMOTE_ENV" ]; then
    echo "❌ No se encontró .env del server en: $REMOTE_ENV" >&2
    exit 1
  fi
  DB_PASS=\$(grep -E '^DATABASE_PASSWORD=' "$REMOTE_ENV" | head -n1 | cut -d'=' -f2- | sed -E 's/^"(.*)"\$/\1/')
  DB_NAME=\$(grep -E '^DATABASE_NAME=' "$REMOTE_ENV" | head -n1 | cut -d'=' -f2- | sed -E 's/^"(.*)"\$/\1/')
  DB_USER=\$(grep -E '^DATABASE_USER=' "$REMOTE_ENV" | head -n1 | cut -d'=' -f2- | sed -E 's/^"(.*)"\$/\1/')
  DB_USER=\${DB_USER:-root}
  DB_NAME=\${DB_NAME:-mtservice}
  echo "   → mysqldump \$DB_NAME (user=\$DB_USER) → $REMOTE_DUMP"
  MYSQL_PWD="\$DB_PASS" mysqldump -h 127.0.0.1 -P 3306 -u "\$DB_USER" \\
    --single-transaction --quick --routines --triggers --events \\
    "\$DB_NAME" > "$REMOTE_DUMP"
  echo "   ✅ dump generado (\$(du -h "$REMOTE_DUMP" | cut -f1))"
EOF

# ========= 3. Traer dump =========
echo "⬇️  Descargando dump a $LOCAL_DUMP..."
scp -i "$PEM_PATH" "$REMOTE_HOST:$REMOTE_DUMP" "$LOCAL_DUMP"
echo "   ✅ dump local: $(du -h "$LOCAL_DUMP" | cut -f1)"

# ========= 4+5+6. Restore local =========
LOCAL_DB_PASS=$(read_env_var "$LOCAL_ENV" DATABASE_PASSWORD)
LOCAL_DB_NAME=$(read_env_var "$LOCAL_ENV" DATABASE_NAME)
LOCAL_DB_USER=$(read_env_var "$LOCAL_ENV" DATABASE_USER)
LOCAL_DB_USER=${LOCAL_DB_USER:-root}
LOCAL_DB_NAME=${LOCAL_DB_NAME:-mtservice}

LOCAL_DB_HOST="${LOCAL_DB_HOST:-127.0.0.1}"
LOCAL_DB_PORT="${LOCAL_DB_PORT:-3306}"

echo "🗑️  Dropeando y recreando DB local '$LOCAL_DB_NAME' (en $LOCAL_DB_HOST:$LOCAL_DB_PORT)..."
MYSQL_PWD="$LOCAL_DB_PASS" mysql -h "$LOCAL_DB_HOST" -P "$LOCAL_DB_PORT" --protocol=TCP -u "$LOCAL_DB_USER" -e "DROP DATABASE IF EXISTS \`$LOCAL_DB_NAME\`; CREATE DATABASE \`$LOCAL_DB_NAME\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

echo "📥 Importando dump en '$LOCAL_DB_NAME'..."
MYSQL_PWD="$LOCAL_DB_PASS" mysql -h "$LOCAL_DB_HOST" -P "$LOCAL_DB_PORT" --protocol=TCP -u "$LOCAL_DB_USER" "$LOCAL_DB_NAME" < "$LOCAL_DUMP"

# ========= Fin =========
END_TIME=$(date +%s); DURATION=$((END_TIME - START_TIME))
echo ""
echo "✅ DB pull completado en ${DURATION}s"
echo "   Dump local: $LOCAL_DUMP"
