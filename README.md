# tableau-dashboard-lineage-auditor

Board-readable Tableau dashboard lineage auditor for workbook trust, certified datasources, extract freshness, row-level security coverage, broken calculations, permission exceptions, and executive signoff.

[![ci](https://github.com/mizcausevic-dev/tableau-dashboard-lineage-auditor/actions/workflows/ci.yml/badge.svg)](https://github.com/mizcausevic-dev/tableau-dashboard-lineage-auditor/actions/workflows/ci.yml)
[![pages](https://github.com/mizcausevic-dev/tableau-dashboard-lineage-auditor/actions/workflows/pages.yml/badge.svg)](https://github.com/mizcausevic-dev/tableau-dashboard-lineage-auditor/actions/workflows/pages.yml)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](LICENSE)

## Why this exists

Executive dashboards fail quietly when the workbook looks polished but the evidence layer is weak:

- Are datasources certified?
- Is workbook lineage complete enough to defend?
- Are extracts fresh and refreshes healthy?
- Are row-level security and permissions aligned?
- Are broken calculations visible before board use?

This repo converts synthetic Tableau workbook metadata into a lineage register for executive reporting trust.

## Local run

```bash
npm install
npm run verify
npm run demo
```

## CLI

```bash
npx tableau-dashboard-lineage-auditor fixtures/tableau-lineage-sample.json --format markdown
npx tableau-dashboard-lineage-auditor fixtures/tableau-lineage-sample.json --format json
```

## Kinetic Gain fit

This adds a Tableau analytics-governance lane to the Kinetic Gain portfolio: dashboard lineage, executive reporting confidence, source certification, and board metric trust.
