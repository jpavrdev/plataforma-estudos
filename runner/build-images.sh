#!/usr/bin/env bash
# Constrói as imagens de execução dos desafios no daemon Docker do host.
# O serviço runner sobe containers a partir delas via o socket montado.
# Uso: bash runner/build-images.sh
set -euo pipefail
cd "$(dirname "$0")"

docker build -t desafio-js images/js
docker build -t desafio-python images/python

echo "==> Imagens prontas: desafio-js, desafio-python"
