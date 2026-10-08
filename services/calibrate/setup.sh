#!/usr/bin/env bash
# Tạo .venv và cài torch CPU + GeoCalib + transformers (Grounding DINO) + FastAPI (cần uv: https://docs.astral.sh/uv/).
set -euo pipefail
cd "$(dirname "$0")"
uv venv -q .venv --python 3.12
uv pip install -q --python .venv/bin/python -r requirements.txt --extra-index-url https://download.pytorch.org/whl/cpu
