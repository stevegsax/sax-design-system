# Emits one DTCG 2025.10 resolver document for a (situation, mode) cell.
# Invoked by generate-resolvers.sh with --arg situation / --arg mode.
# $situation == "base" emits the shared resolution with no situation set —
# the :root baseline that per-situation delta blocks are diffed against.
{
  "$schema": "https://www.designtokens.org/schemas/2025.10/resolver.json",
  "name": "\($situation)-\($mode)",
  "description": "Generated from config/matrix.json by scripts/generate-resolvers.sh. Do not edit by hand.",
  "version": "2025.10",
  "sets": ({
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
    }
  } + (if $situation == "base" then {} else {
    "situation": {
      "sources": [
        { "$ref": "../tokens/situations/\($situation)/overrides.tokens.json" },
        { "$ref": "../tokens/situations/\($situation)/overrides.\($mode).tokens.json" }
      ]
    }
  } end)),
  "resolutionOrder": ([
    { "$ref": "#/sets/primitive" },
    { "$ref": "#/sets/semantic" },
    { "$ref": "#/sets/component" }
  ] + (if $situation == "base" then [] else [
    { "$ref": "#/sets/situation" }
  ] end))
}
