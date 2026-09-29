#!/bin/bash
# Script to launch Temporal Dev Server with Web UI on macOS
set -e

echo "=================================================="
echo "🚀 Starting Temporal.io Local Dev Server..."
echo "=================================================="

# Check if temporal is in PATH or Homebrew
if command -v temporal &> /dev/null; then
    TEMPORAL_BIN="temporal"
elif [ -f "/opt/homebrew/bin/temporal" ]; then
    TEMPORAL_BIN="/opt/homebrew/bin/temporal"
elif [ -f "/usr/local/bin/temporal" ]; then
    TEMPORAL_BIN="/usr/local/bin/temporal"
else
    echo "❌ Temporal CLI not found. Please install via: brew install temporal"
    exit 1
fi

mkdir -p data
DB_PATH="data/temporal_state.db"

echo "✓ Using Temporal Binary: $TEMPORAL_BIN"
echo "🌐 Temporal Web UI will be available at: http://localhost:8233"
echo "🔌 Temporal gRPC Service port: localhost:7233"
echo "💾 SQLite Persistent DB: $DB_PATH"
echo ""

$TEMPORAL_BIN server start-dev --ui-port 8233 --db-filename "$DB_PATH"

