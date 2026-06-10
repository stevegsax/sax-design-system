#!/bin/sh
# Generates resolvers/<product>.<mode>.resolver.json for every cell of the
# product x mode matrix in config/matrix.json.
set -eu
cd "$(dirname "$0")/.."

rm -f resolvers/*.resolver.json
for product in $(jq -r '.products[]' config/matrix.json); do
  for mode in $(jq -r '.modes[]' config/matrix.json); do
    jq -n --arg product "$product" --arg mode "$mode" \
      -f scripts/resolver.jq > "resolvers/$product.$mode.resolver.json"
    echo "resolvers/$product.$mode.resolver.json"
  done
done
