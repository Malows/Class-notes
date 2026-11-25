#!/bin/sh
# Phase 1: apply pending migrations (never seeds). Phase 2: serve.
set -eu

: "${DATABASE_PATH:?DATABASE_PATH is required (absolute path of the SQLite file)}"

data_directory=$(dirname "$DATABASE_PATH")
if [ ! -d "$data_directory" ] || [ ! -w "$data_directory" ]; then
  echo "[entrypoint] $data_directory is not a writable directory; mount the data volume and fix its ownership (chown 1000:1000)" >&2
  exit 1
fi

node /app/build/migrate.js
exec node /app/build/index.js
