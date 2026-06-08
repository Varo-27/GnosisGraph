#!/usr/bin/env bash
#
# Configuración inicial de una instancia EC2 (Ubuntu) para Semantic Explorer.
# Ejecutar una sola vez en la máquina, con acceso sudo.
#
# Uso:
#   curl -fsSL ... | bash   # o clonar el repo y ejecutar:
#   ./scripts/ec2-bootstrap.sh
#   ./scripts/ec2-bootstrap.sh --repo https://github.com/Varo-27/proyectoEOM.git
#
set -euo pipefail

REPO_URL="https://github.com/Varo-27/proyectoEOM.git"
APP_DIR="/home/ubuntu/proyectoEOM"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --repo)
      REPO_URL="$2"
      shift 2
      ;;
    --dir)
      APP_DIR="$2"
      shift 2
      ;;
    -h | --help)
      sed -n '3,10p' "$0" | sed 's/^# \?//'
      exit 0
      ;;
    *)
      echo "Opción desconocida: $1" >&2
      exit 1
      ;;
  esac
done

if [[ "$(id -u)" -eq 0 ]]; then
  echo "Ejecuta este script como usuario normal (ubuntu), no como root." >&2
  exit 1
fi

echo "==> Instalando Docker..."
sudo apt-get update -qq
sudo apt-get install -y ca-certificates curl git
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" |
  sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
sudo apt-get update -qq
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo usermod -aG docker "$USER"

echo "==> Clonando repositorio en ${APP_DIR}..."
if [[ ! -d "$APP_DIR/.git" ]]; then
  git clone "$REPO_URL" "$APP_DIR"
else
  echo "El directorio ya existe; omitiendo clone."
fi

cd "$APP_DIR"
chmod +x scripts/*.sh

ENV_FILE="web-semantic-explorer/.env"
if [[ ! -f "$ENV_FILE" ]]; then
  cp web-semantic-explorer/.env.production.example "$ENV_FILE"
  echo ""
  echo "IMPORTANTE: edita ${APP_DIR}/${ENV_FILE} con valores reales antes de desplegar."
fi

echo ""
echo "Bootstrap completado. Pasos siguientes:"
echo "  1. Cierra sesión y vuelve a entrar (o ejecuta: newgrp docker)"
echo "  2. Edita ${APP_DIR}/${ENV_FILE}"
echo "  3. (Opcional) Restaura la DB: ./scripts/restore-db.sh ruta/al/backup.tar.gz"
echo "  4. Prueba el despliegue: ./scripts/deploy.sh"
echo "  5. Configura los secrets EC2_* en GitHub (ver docs/deploy-aws-ec2.md)"
