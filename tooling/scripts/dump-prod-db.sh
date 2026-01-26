#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
ENV_FILE="$PROJECT_ROOT/.env.prod"

if [ ! -f "$ENV_FILE" ]; then
  echo "Error: .env.prod not found at $ENV_FILE"
  exit 1
fi

DB_URL=$(grep '^DATABASE_CONNECTION_POOLER_URL=' "$ENV_FILE" | cut -d '=' -f2-)

if [ -z "$DB_URL" ]; then
  echo "Error: DATABASE_CONNECTION_POOLER_URL not found in .env.prod"
  exit 1
fi

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DUMP_DIR="$PROJECT_ROOT/backups/$TIMESTAMP"
mkdir -p "$DUMP_DIR"

echo "Dumping production database to $DUMP_DIR"
echo ""

echo "1/3 Dumping roles..."
supabase db dump --db-url "$DB_URL" -f "$DUMP_DIR/roles.sql" --role-only
echo "     -> roles.sql"

echo "2/3 Dumping schema..."
supabase db dump --db-url "$DB_URL" -f "$DUMP_DIR/schema.sql"
echo "     -> schema.sql"

echo "3/3 Dumping data..."
supabase db dump --db-url "$DB_URL" -f "$DUMP_DIR/data.sql" --use-copy --data-only
echo "     -> data.sql"

echo ""
echo "Done! Backup saved to: $DUMP_DIR"
