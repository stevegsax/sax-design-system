# Changelog

Notable changes to the SAX design tokens. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow semver (token value changes are patch/minor; renaming or removing a token is major).

## [Unreleased]

## [0.1.1] - 2026-06-10

### Added

- This changelog, shipped with the package.

### Changed

- Documented the release process in `CLAUDE.md`.

## [0.1.0] - 2026-06-10

Initial release.

### Added

- DTCG 2025.10 token source in three tiers (component → semantic → primitive) for color, dimension, and typography.
- OKLCH tonal ramps: neutral, brand, and status (success, warning, danger). The brand ramp is anchored to the SAX logo blue (`color.brand.anchor`, `#005A9C`); its chroma curve follows the sRGB gamut ceiling through the anchor.
- Semantic roles mapped per mode (light, dark) and component tokens for button, card, input, and link.
- Build pipeline: resolver generation from the product × mode matrix, ajv validation against the official DTCG schemas, hex-fallback consistency checks, and APCA contrast gates (96 checks) that fail the build on violation.
- Per-product CSS using `light-dark()` — one stylesheet per product, no separate mode artifacts — for three products: `product-home-page`, `blog-page`, `presentation`.
- Generated previews and samples: token catalog, marketing page, blog index, and a token-themed reveal.js deck.
- Git-tag release model: `dist/` is committed and prebuilt; products pin `github:stevegsax/sax-design-system#vX.Y.Z` and install with no toolchain.

[Unreleased]: https://github.com/stevegsax/sax-design-system/compare/v0.1.1...HEAD
[0.1.1]: https://github.com/stevegsax/sax-design-system/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/stevegsax/sax-design-system/releases/tag/v0.1.0
