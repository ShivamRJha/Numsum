# Products, tools and enquiries

## Pages
- `/products/iris` — IRIS product page with demo / quotation form.
- `/tools` — investment tools hub:
  - `/tools/investment-planner` — goal planner; exclude gold / debt / mid & small caps, index-only mode, direct-stock basket.
  - `/tools/funds` — fund screener with expense ratios; compare up to four funds.
  - `/tools/stocks` — Nifty 500 screener with ready-made screens.
  - `/tools/stock-analyzer/[symbol]` — investor checklist, risk/return statistics, drawdowns, SIP back-test (any NSE symbol, live).
  - `/tools/portfolio?s=A,B,C` — correlation matrix, basket volatility, diversification ratio, risk-balanced weights.
- `/contact`, `/privacy`, `/terms` — company pages. `/contact?topic=iris_demo` pre-selects a topic.

## Enquiries (leads)
- Public forms write to Firestore `enquiries` (create-only for the public, validated by `validEnquiry()` in `firestore.rules`). Until those rules are deployed, the form falls back to `career_applications` with `kind: "enquiry"`; the admin page shows both.
- Admins manage them at **Admin › Sales › Enquiries** (status, internal note, CSV export).
- Set `NEXT_PUBLIC_CONTACT_EMAIL` in Vercel to show a public e-mail address.

## Market data
- **Admin › Sales › Market Data › Refresh now** fetches the latest data immediately: server routes under `/api/market/*` (signed-in users only, verified Firebase ID token) download and compute; the admin's browser scores and saves to Firestore with the admin's own sign-in. No server secrets are needed.
- `/api/stocks/[symbol]` is public and cached for an hour at the edge.
- Sources: AMFI NAV file, AMFI TER tracker (expense ratios, GitHub), api.mfapi.in (NAV history), eod2 dataset (NSE daily prices, GitHub), Yahoo Finance (recent prices and fundamentals, best effort).
- `scripts/refresh-market-data.ts` (nightly; shared logic in `lib/invest/`) scores direct-plan growth funds within each bucket and the Nifty 500 stocks, and writes:
  - `market_funds/{schemeCode}` — every scored fund,
  - `system_documents/market_fund_summary` — top 25 per bucket + medians (the planner reads only this document),
  - `system_documents/market_stock_summary` — every Nifty 500 stock with statistics, fundamentals and score,
  - `system_documents/market_refresh_status` — last run result (shown at **Admin › Sales › Market Data**).
- Runs nightly via `.github/workflows/refresh-market-data.yml` (00:40 IST) with the `FIREBASE_SERVICE_ACCOUNT_JSON` secret and `FIREBASE_PROJECT_ID` variable. Run it manually from the Actions tab to refresh now.
- Local dry run: `npx tsx scripts/refresh-market-data.ts --dry-run --limit=40`.
- Tests: `npx tsx tests/invest/market-data.test.ts && npx tsx tests/invest/planner.test.ts`.

## Data hygiene
- `listCollection` / `getRecord` skip `__schema` sentinel documents; `updateRecord` refuses to publish them.
- Public pages no longer fall back to demo content; empty sections show an honest empty state or are hidden.
