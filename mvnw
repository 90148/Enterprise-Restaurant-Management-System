#!/bin/sh
set -eu

DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR/backend"

if [ -f "./mvnw" ]; then
  chmod +x ./mvnw
  exec ./mvnw "$@"
elif command -v mvn >/dev/null 2>&1; then
  exec mvn "$@"
else
  echo "Error: Maven is required but was not found on PATH, and no wrapper was found." >&2
  exit 1
fi
