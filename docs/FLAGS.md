# Flag assets

`scripts/build-flags.mjs` generates `flags/css/flags.css`, `flags/css/flags.min.css`, and `flags/scss/flags.scss` from the SVGs in `flags/svg/`. The SVGs themselves are never modified, and the whole `flags/` directory publishes from the package root.

`flags/svg/` is the source of truth. The stylesheets aren't, so don't edit them.

## Add or replace a flag

1. Add the SVG to `flags/svg/`, named after the lowercase ISO 3166-1 alpha-2 code.
2. Run `npm run build`.

The build fails if a flag has no matching country, or a country has no flag. The test suite asserts the same in both directions.

The generated `css/` and `svg/` directories must stay siblings, because the rules reference images as `url('../svg/ad.svg')`.

`flags.scss` declares `$flag-width` and `$flag-height` as `!default` variables, so consumers can change the 40×30 sizing without forking the file. Image URLs are written literally rather than interpolated, because no bundler can statically rebase an interpolated `url()`.

## Why the SVGs aren't minified

The flag SVGs are 4.84 MB of an 8.32 MB package, so minifying them is the obvious saving. It was measured and rejected.

Each candidate was rendered against its original with librsvg through ImageMagick at a forced 400×300, then compared by normalised RMSE. Rendering was confirmed deterministic first: the same file rendered twice scores exactly 0. Three flags — `gs`, `gu`, and `sm` — contain `<text>` and can't render without the referenced font. The measurement excluded those three, and also `io`, which was dropped in error and contains no text. The figures below therefore cover 246 of the 247 renderable flags.

Results across the 246 flags measured:

| Configuration | Size | Visually identical, RMSE below 0.01 |
| --- | --- | --- |
| Original | 4.62 MB | — |
| SVGO, metadata plugins only | 4.34 MB | 245 of 246 |
| SVGO, conservative preset | 2.81 MB | 186 of 246 |
| SVGO, adaptive float precision | 1.93 MB | 180 of 246 |

The conservative and aggressive configurations break the same flags to almost the same degree. Aruba scores 0.4128 under both, so reduced coordinate precision isn't the cause. SVGO's structural transforms are. Bisecting the plugin list found a single cause for one flag only: South Korea, fixed by disabling `convertShapeToPath`. For Aruba, Niue, Myanmar, Benin, and Serbia, disabling any individual plugin changed nothing.

Worst affected: `aw` 0.413, `nu` 0.339, `kr` 0.276, `mm` 0.254, `bj` 0.254, `hk` 0.198, `nr` 0.170, `ck` 0.159, `rs` 0.153, `ls` 0.145.

Minifying only the files that verify identical was also measured: 180 minified, 70 originals, 3.74 MB total. That's a 19% saving rather than the 58% the headline number suggests, because the flags that break are the large ones. Maintaining it would need a committed allowlist and a rendering step in CI.

Even the metadata-only pass, which removes `<metadata>`, comments, and editor namespaces — none of which render — changed the output of `do.svg`, for a 6% saving.

## Why the CDN files aren't used instead

flagcdn serves Serbia at 29 KB against 884 KB locally, and the United States at 765 bytes against 24.7 KB.

Licensing permits it. Flagpedia states its flags are "completely free for commercial and non-commercial use (public domain)", based on Wikimedia Commons vectors, and asks for a courtesy backlink. flag-icons is MIT.

Aspect ratio is the blocker. flagcdn serves each flag in its official ratio: the United States at 1235×650, the United Kingdom at 1200×600, and Vatican City at 1000×1000. This package's set is uniformly 4:3, and `flags.css` sizes `.flag` at 40×30 with `background-size: cover`. Mixed ratios in that grid crop some flags and letterbox others. flagcdn publishes no 4:3 SVG endpoint; `/4x3/us.svg` returns 404, and its PNGs are native ratio too.

flag-icons does publish 4:3 at 640×480, matching this package, and is much smaller:

| Flag | This package | flag-icons 4:3 | flagcdn, native ratio |
| --- | --- | --- | --- |
| `rs` | 884 KB | 182 KB | 29 KB |
| `do` | 661 KB | 40 KB | 148 KB |
| `es` | 229 KB | 81 KB | 153 KB |
| `af` | 136 KB | 19 KB | 222 KB |

Rendered against this package's versions, they score RMSE 0.08 to 0.37. That's different artwork, drawn independently with simplified heraldry, not a smaller encoding of the same drawing. Adopting it changes how those flags look, which is a decision about the project's assets rather than a build optimisation.

Consumers can already choose either CDN at runtime through `flagUrl({ source })`, without changing what the package ships.

## What would reduce the size

Three files hold 1.77 MB, 37% of all flag bytes:

| File | Size |
| --- | --- |
| `rs.svg` | 884 KB |
| `do.svg` | 661 KB |
| `es.svg` | 229 KB |

All three are Inkscape exports of detailed coats of arms, with editor metadata still in the header. The median flag is 2.5 KB.

Redrawing those three with simplified heraldry, as `country-flag-icons` does by capping every flag at 5.3 KB, would save over a megabyte with no tooling risk. That needs a person to judge the result.

## Known issue: font-dependent flags

`gs`, `gu`, and `sm` render text with a `font-family` that isn't embedded. On a machine without that font they fall back to another face, or don't render the text at all. This predates v2. Converting the text to paths fixes it.
