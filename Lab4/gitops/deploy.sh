#!/bin/bash
# deploy.sh — GitOps reconciliation wrapper (shell version)
# In a real GitOps setup: git pull && python deploy.py runs on a cron/controller
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=== GitOps Deploy ==="
echo "Pulling latest desired state from Git..."
echo "(Simulated: using local desired-state.yml as the source of truth)"
echo ""

python deploy.py
