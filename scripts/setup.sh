#!/usr/bin/env bash
#
# Configura el entorno local en un PC nuevo: restaura la DB y levanta Docker Compose.
#
# Requisitos:
#   - Docker y Docker Compose
#   - web-semantic-explorer/.env configurado (mismas credenciales que el backup)
#   - Archivo app-db-data-*.tar.gz en la raíz del proyecto o en ./backups/
#
# Uso:
#   ./scripts/setup.sh
#   ./scripts/setup.sh ruta/al/backup.tar.gz
#   ./scripts/setup.sh --force
#   ./scripts/setup.sh --skip-up
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ROOT}/web-semantic-explorer/.env"
FORCE=false
SKIP_UP=false
BACKUP_ARGS=()

usage() {
  sed -n '3,14p' "$0" | sed 's/^# \?//'
  exit "${1:-0}"
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    -h | --help)
      usage 0
      ;;
    -f | --force)
      FORCE=true
      BACKUP_ARGS+=(--force)
      shift
      ;;
    --skip-up)
      SKIP_UP=true
      shift
      ;;
    *)
      BACKUP_ARGS+=("$1")
      shift
      ;;
  esac
done

if ! command -v docker >/dev/null 2>&1; then
  echo "Error: Docker no está instalado o no está en el PATH." >&2
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "Error: Docker Compose no está disponible (prueba 'docker compose version')." >&2
  exit 1
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Error: falta ${ENV_FILE}" >&2
  echo "Créalo con las mismas credenciales de Postgres que en el equipo del backup." >&2
  if [[ -f "${ROOT}/web-semantic-explorer/.env.example" ]]; then
    echo "Puedes copiar la plantilla:" >&2
    echo "  cp web-semantic-explorer/.env.example web-semantic-explorer/.env" >&2
  fi
  exit 1
fi

cd "$ROOT"

echo "==> Restaurando base de datos..."
"${ROOT}/scripts/restore-db.sh" "${BACKUP_ARGS[@]}"

if [[ "$SKIP_UP" == true ]]; then
  echo "==> Omitiendo docker compose up (--skip-up)."
  exit 0
fi

echo "==> Levantando servicios..."
docker compose up -d --build

echo ""
echo "Listo. Servicios disponibles en:"
echo "  Frontend: http://localhost:8080"
echo "  API docs: http://localhost:8000/docs"
echo ""
echo "Verificar tablas:"
echo "  docker compose exec db psql -U \$(grep POSTGRES_USER web-semantic-explorer/.env | cut -d= -f2) -d \$(grep POSTGRES_DB web-semantic-explorer/.env | cut -d= -f2) -c '\\dt'"
