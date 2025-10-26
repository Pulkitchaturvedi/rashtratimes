#!/usr/bin/env bash
set -euo pipefail

OUTPUT=${1:-backup-$(date +%Y%m%d%H%M).sql}
: "${DATABASE_URL:?DATABASE_URL is required}"

pg_dump "$DATABASE_URL" > "$OUTPUT"
echo "Backup written to $OUTPUT"
