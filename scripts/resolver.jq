# Emits one DTCG 2025.10 resolver document for a (product, mode) pair.
# Invoked by generate-resolvers.sh with --arg product / --arg mode.
{
  "$schema": "https://www.designtokens.org/schemas/2025.10/resolver.json",
  "name": "\($product)-\($mode)",
  "description": "Generated from config/matrix.json by scripts/generate-resolvers.sh. Do not edit by hand.",
  "version": "2025.10",
  "sets": {
    "primitive": {
      "sources": [
        { "$ref": "../tokens/primitive/color.tokens.json" },
        { "$ref": "../tokens/primitive/dimension.tokens.json" },
        { "$ref": "../tokens/primitive/typography.tokens.json" }
      ]
    },
    "semantic": {
      "sources": [
        { "$ref": "../tokens/semantic/color.\($mode).tokens.json" },
        { "$ref": "../tokens/semantic/dimension.tokens.json" },
        { "$ref": "../tokens/semantic/typography.tokens.json" },
        { "$ref": "../tokens/semantic/effect.tokens.json" }
      ]
    },
    "component": {
      "sources": [
        { "$ref": "../tokens/component/color.tokens.json" },
        { "$ref": "../tokens/component/dimension.tokens.json" },
        { "$ref": "../tokens/component/typography.tokens.json" }
      ]
    },
    "product": {
      "sources": [
        { "$ref": "../tokens/products/\($product)/overrides.tokens.json" },
        { "$ref": "../tokens/products/\($product)/overrides.\($mode).tokens.json" }
      ]
    }
  },
  "resolutionOrder": [
    { "$ref": "#/sets/primitive" },
    { "$ref": "#/sets/semantic" },
    { "$ref": "#/sets/component" },
    { "$ref": "#/sets/product" }
  ]
}
