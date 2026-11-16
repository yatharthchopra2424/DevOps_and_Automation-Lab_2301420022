#!/bin/bash
# init-vault.sh — Store and retrieve secrets from Vault dev server

export VAULT_ADDR='http://localhost:8200'
export VAULT_TOKEN='root-token'

echo "=== Vault Init & Secret Management ==="
echo ""

# Wait for vault to be ready
sleep 2

# Check vault status
echo "--- Vault Status ---"
vault status

echo ""
echo "--- Enabling KV secrets engine ---"
vault secrets enable -path=secret kv-v2 2>/dev/null || echo "KV already enabled"

echo ""
echo "--- Storing database credentials ---"
vault kv put secret/lab4/db \
  username="lab4user" \
  password="SuperSecret123" \
  host="db.lab4.local"

echo ""
echo "--- Retrieving secret ---"
vault kv get secret/lab4/db

echo ""
echo "--- Storing API key ---"
vault kv put secret/lab4/api api_key="lab4-api-key-abc123xyz"

echo ""
echo "--- Retrieving API key ---"
vault kv get secret/lab4/api

echo ""
echo "=== Secret management demo complete ==="
