#!/bin/bash
# Script to launch ManakAI Temporal Ingestion Worker
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$DIR"

echo "=================================================="
echo "🤖 Launching ManakAI Temporal Ingestion Worker..."
echo "=================================================="

# Activate virtualenv if present
if [ -d "venv" ]; then
    source venv/bin/activate
fi

python -m application.temporal.worker "$@"
