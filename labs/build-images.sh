#!/usr/bin/env bash
# Constrói a imagem do ambiente de lab no daemon que hospeda os labs.
# Em produção, aponte para o daemon dedicado antes de rodar:
#   LAB_DOCKER_HOST=unix:///var/run/docker-labs.sock bash labs/build-images.sh
set -euo pipefail
cd "$(dirname "$0")"

if [ -n "${LAB_DOCKER_HOST:-}" ]; then
    export DOCKER_HOST="$LAB_DOCKER_HOST"
    echo "==> usando daemon $DOCKER_HOST"
fi

docker build -t lab-linux image

echo "==> Imagem pronta: lab-linux"
