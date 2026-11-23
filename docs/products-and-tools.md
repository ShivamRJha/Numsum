# Products, tools and enquiries

## Pages
- `/products/iris` — IRIS product page with demo / quotation form.
- `/tools/investment-planner` — goal planner, allocation and fund screener.
- `/contact`, `/privacy`, `/terms` — company pages. `/contact?topic=iris_demo` pre-selects a topic.

## Enquiries (leads)
- Public forms write to Firestore `enquiries` (create-only for the public, validated by `validEnquiry()` in `firestore.rules`).
- Admins manage them at **Admin › Sales › Enquiries** (status, internal note, CSV export).
- Set `NEXT_PUBLIC_CONTACT_EMAIL` in Vercel to show a public e-mail address.

## Market data
- `scripts/refresh-market-data.ts` downloads the AMFI NAV file and NAV history (api.mfapi.in), scores direct-plan growth funds within each bucket (`lib/invest/buckets.ts`) and writes:
  - `market_funds/{schemeCode}` — every scored fund,
  - `market_meta/fund_summary` — top 25 per bucket + medians (the planner reads only this document),
  - `market_meta/refresh_status` — last run result (shown at **Admin › Sales › Market Data**).
- Runs nightly via `.github/workflows/refresh-market-data.yml` (00:40 IST) with the `FIREBASE_SERVICE_ACCOUNT_JSON` secret and `FIREBASE_PROJECT_ID` variable. Run it manually from the Actions tab to refresh now.
- Local dry run: `npx tsx scripts/refresh-market-data.ts --dry-run --limit=40`.
- Tests: `npx tsx tests/invest/market-data.test.ts && npx tsx tests/invest/planner.test.ts`.

## Data hygiene
- `listCollection` / `getRecord` skip `__schema` sentinel documents; `updateRecord` refuses to publish them.
- Public pages no longer fall back to demo content; empty sections show an honest empty state or are hidden.
