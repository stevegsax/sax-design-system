#!/bin/sh
# Generates resolvers/<situation>.<mode>.resolver.json for every cell of the
# situation x mode matrix in config/matrix.json, plus base.<mode>.resolver.json
# (the shared resolution with no situation set — the diff baseline for the
# per-situation delta blocks in dist/tokens.css).
set -eu
cd "$(dirname "$0")/.."

rm -f resolvers/*.resolver.json
for situation in base $(jq -r '.situations[]' config/matrix.json); do
  for mode in $(jq -r '.modes[]' config/matrix.json); do
    jq -n --arg situation "$situation" --arg mode "$mode" \
      -f scripts/resolver.jq > "resolvers/$situation.$mode.resolver.json"
    echo "resolvers/$situation.$mode.resolver.json"
  done
done
