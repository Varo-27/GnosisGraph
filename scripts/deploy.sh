#!/usr/bin/env bash
#
# Despliegue en el servidor (EC2). Lo invoca GitHub Actions tras cada push a main.
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ROOT}/web-semantic-explorer/.env"
COMPOSE_FILE="${ROOT}/compose.prod.yml"

cd "$ROOT"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Error: falta ${ENV_FILE}" >&2
  echo "Créalo en el servidor antes del primer despliegue (ver docs/deploy-aws-ec2.md)." >&2
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "Error: Docker Compose no está disponible." >&2
  exit 1
fi

echo "==> Construyendo y levantando servicios de producción..."
docker compose -f "$COMPOSE_FILE" up -d --build --remove-orphans

echo "==> Limpiando imágenes huérfanas..."
docker image prune -f >/dev/null 2>&1 || true

echo ""
echo "Despliegue completado."
docker compose -f "$COMPOSE_FILE" ps
