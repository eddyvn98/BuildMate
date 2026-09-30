# Market Pricing Refresh

BuildMate uses market pricing to answer a homeowner question quickly:

> What is a reasonable current budget range for this townhouse?

This is intentionally different from a detailed QS/contract estimate.

## Refresh schedule

The `Refresh market prices` GitHub Actions workflow runs daily at:

- 00:15 UTC
- 07:15 Vietnam time

It can also be started manually with `workflow_dispatch`.

Local/manual refresh:

```bash
npm run refresh:prices
```

## Data model

Each source keeps:

- stable source ID
- source type
- URL
- source publication date when explicitly available
- first observed date
- last verified date
- last checked date
- last fetch/parser error
- source note

Each price observation keeps:

- product/category code
- minimum and maximum price
- unit
- source ID
- date basis
- province
- VAT metadata when known
- delivery metadata when known

## Source tiers

### Official anchor

Official/local authority construction-price publication.

Purpose:

- detect major market drift
- provide a dated public reference point
- prevent the market layer from floating without an anchor

Official anchors are not treated as exact retail prices for a homeowner on the current day.

### Contractor / turnkey market sources

Used for fast whole-house budget ranges in VND/m².

BuildMate prefers the middle/popular package when a contractor publishes several finish levels. It keeps a range instead of manufacturing false precision.

### Material market sources

Current signals for high-impact materials such as:

- reinforcement steel
- ready-mix concrete
- cement
- plaster/building sand
- concrete sand

These signals are retained separately from the turnkey m² series.

## Freshness

Default maximum ages:

- market source: 30 days
- contractor source: 45 days
- official anchor: 60 days

A source can be:

- `fresh`
- `aging`
- `stale`

For a source with an explicit publication date, freshness uses that date.

For an undated page, freshness uses `verifiedAt`, which is updated only after a successful fetch and parse. A failed fetch never makes an old price look new.

## Refresh failure behavior

Each source is independent.

If one source fails:

- keep its previous observation
- record the failed check
- do not advance `verifiedAt`
- let freshness age naturally

The refresh job refuses to write a new snapshot unless it has at least:

- 6 successfully parsed/verified sources total
- 2 successfully parsed turnkey VND/m² sources

This prevents a partial network/parser failure from replacing a healthy snapshot.

## Parser safety

The refresh process does not accept arbitrary numbers from a page.

Every adapter defines:

- marker text
- expected price range
- expected unit/category
- optional source-date pattern

Examples:

- townhouse turnkey prices must be within a plausible VND/m² band
- rebar prices must be within a plausible VND/kg band
- concrete M250 prices must be within a plausible VND/m³ band

If a page changes layout and the parser cannot confidently recover the expected value, that source fails closed.

## Runtime behavior

The generated source is:

`src/engine/market-price-live.js`

Do not edit it manually.

The calculation engine then:

1. removes stale observations;
2. groups observations by category;
3. computes a robust median and percentile-like range;
4. assigns confidence using source count, spread, date quality and freshness;
5. produces the homeowner quick estimate.

For a townhouse, the quick estimate uses an explicit converted-area assumption:

`footprint × (storeys + foundation factor + roof factor)`

The UI shows the center and range, not a fake exact contract value.

## Manual project quote override

A complete sourced project quote remains stronger than the generic market snapshot.

When the homeowner enters project-specific prices with source/date provenance, BuildMate can use that detailed price book instead of the generic quick-market estimate.
