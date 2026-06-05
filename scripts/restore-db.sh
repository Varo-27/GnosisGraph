#!/usr/bin/env bash
#
# Restaura el volumen PostgreSQL desde un archivo .tar.gz.
#
# Uso:
#   ./scripts/restore-db.sh                          # busca app-db-data-*.tar.gz en ./ o ./backups/
#   ./scripts/restore-db.sh ruta/al/backup.tar.gz
#   ./scripts/restore-db.sh --force ruta/al/backup.tar.gz
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VOLUME_NAME="web-semantic-explorer_app-db-data"
FORCE=false
BACKUP_FILE=""

usage() {
  sed -n '3,8p' "$0" | sed 's/^# \?//'
  exit "${1:-0}"
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    -h | --help)
      usage 0
      ;;
    -f | --force)
      FORCE=true
      shift
      ;;
    *)
      BACKUP_FILE="$1"
      shift
      ;;
  esac
done

if ! command -v docker >/dev/null 2>&1; then
  echo "Error: Docker no está instalado o no está en el PATH." >&2
  exit 1
fi

find_backup() {
  if [[ -n "$BACKUP_FILE" ]]; then
    echo "$BACKUP_FILE"
    return
  fi

  local candidates=()
  while IFS= read -r file; do
    candidates+=("$file")
  done < <(find "$ROOT" -maxdepth 2 -name 'app-db-data-*.tar.gz' -type f 2>/dev/null | sort -r)

  if [[ ${#candidates[@]} -eq 0 ]]; then
    echo ""
    return
  fi

  echo "${candidates[0]}"
}

BACKUP_FILE="$(find_backup)"

if [[ -z "$BACKUP_FILE" || ! -f "$BACKUP_FILE" ]]; then
  echo "Error: no se encontró ningún backup app-db-data-*.tar.gz." >&2
  echo "Colócalo en la raíz del proyecto o en ./backups/ y vuelve a ejecutar." >&2
  exit 1
fi

BACKUP_FILE="$(cd "$(dirname "$BACKUP_FILE")" && pwd)/$(basename "$BACKUP_FILE")"

volume_exists() {
  docker volume inspect "$VOLUME_NAME" >/dev/null 2>&1
}

volume_has_data() {
  if ! volume_exists; then
    return 1
  fi

  local count
  count="$(
    docker run --rm \
      -v "${VOLUME_NAME}:/data:ro" \
      alpine sh -c 'find /data -mindepth 1 -print 2>/dev/null | wc -l' \
      | tr -d '[:space:]'
  )"
  [[ "${count:-0}" -gt 0 ]]
}

if volume_has_data && [[ "$FORCE" != true ]]; then
  echo "Error: el volumen ${VOLUME_NAME} ya contiene datos." >&2
  echo "Usa --force para vaciarlo y restaurar de nuevo:" >&2
  echo "  ./scripts/restore-db.sh --force \"${BACKUP_FILE}\"" >&2
  exit 1
fi

if volume_exists; then
  echo "Vaciando volumen ${VOLUME_NAME}..."
  docker run --rm \
    -v "${VOLUME_NAME}:/data" \
    alpine sh -c 'find /data -mindepth 1 -delete'
else
  echo "Creando volumen ${VOLUME_NAME}..."
  docker volume create "$VOLUME_NAME" >/dev/null
fi

echo "Restaurando desde: ${BACKUP_FILE}"
docker run --rm \
  -v "${VOLUME_NAME}:/data" \
  -v "${BACKUP_FILE}:/backup/archive.tar.gz:ro" \
  alpine tar xzf /backup/archive.tar.gz -C /data

echo "Restauración completada."
