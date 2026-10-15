# CardWise

CardWise is a local, single-user credit-card rewards prototype: a React dashboard, a Chrome Manifest V3 extension, and a shared Express/TypeScript API with PostgreSQL-compatible persistence.

It evaluates **configured category cashback rates**. It is not connected to banks, card issuers, card networks, or payment processors. Portfolio labels, transactions, and reward terms are fictional demo inputs.

## Launch the interview demo

Use Node.js 20+ and npm 9+. From the repository root:

```powershell
npm ci
npm run typecheck
npm test
npm run build
npm run verify:compiled
npm run verify:disk
```

The compiled smoke check uses a disposable in-memory database, starts the compiled server on an ephemeral port, and checks its health, cards, and recommendation HTTP endpoints. It does not alter saved demo data.

In terminal 1:

```powershell
npm --workspace=backend run start:demo
```

In terminal 2:

```powershell
npm run start:dashboard
```

Open the dashboard at http://localhost:5173 and the simulated checkout at http://localhost:3001/demo-store. The standard build copies `schema.sql` into `backend/dist/db/`, so the compiled backend does not require a separate copy step.

If dependencies are already installed, begin with `npm run build`. The interview launcher uses a separate disk-backed PGlite database in `backend/data/interview-pg`, seeded from the existing fictional fixtures on first launch. It does not recover or overwrite `backend/data/cardwise-pg`. Normal `npm --workspace=backend start` still selects `cardwise-pg`; `PGLITE_DATA_DIR` can select another directory. `DATABASE_URL` selects external PostgreSQL; a failed connection currently falls back to PGlite with a warning. Tests always use in-memory PGlite, including when `DATABASE_URL` is set.

For the local demo, leave `DATABASE_URL` unset and use port 3001; dashboard and extension URLs are currently fixed to localhost. The backend loads `.env` from its working directory. When launching through the backend npm workspace, that is `backend/`, so set environment variables explicitly if you need non-default configuration.

## Extension preparation — manual Chrome check required

1. Run `npm run build:extension`.
2. Open `chrome://extensions`, enable Developer mode, and choose **Load unpacked**.
3. Select the repository's `extension/dist` directory.
4. Inspect extension load errors and service-worker errors before presenting.
5. Open or reload http://localhost:3001/demo-store after loading the extension.
6. Change merchant tabs and amounts. The local lab supplies an allowlisted merchant/category context; real retailer adapters continue to use the actual page hostname.
7. Stop the backend to check that the overlay/popup reports unavailable rather than displaying a fabricated recommendation; restart it and choose Retry/Recalculate.

Automated tests use synthetic DOMs and mocked Chrome APIs. Build checks verify assets and classic-script syntax, **not Chrome runtime behavior or current retailer compatibility**. Retailer host permissions are optional in the manifest; this pass does not implement a retailer-permission onboarding flow. The interview demonstration should use the local lab, not depend on live retail websites.

## Suggested five-minute walkthrough

- Explain dashboard → shared API → configured rules → persistence, and extension → worker → same API.
- Show cards and reward rules. New cards receive an explicitly disclosed 1.5% **demo** general rule; this is not an issuer lookup. Delete/recreate that rule to configure a different rate.
- With the unchanged seed portfolio, calculate Amazon $100 and Best Buy $100. Both estimate $5, from different configured cards. If the portfolio has been edited, outputs can differ.
- Show local merchant switching and amount changes only after manually rehearsing the extension in Chrome.
- Show manually logged purchases and recommendation activity as separate concepts. Refresh the dashboard after extension activity.

## Supported model and limitations

- Category-specific rules override general rules. Duplicate applicable rules use the highest configured rate, then rule ID for deterministic selection.
- With no matching rule, a card receives a 0% estimate; the service does not invent a reward rate.
- Equal-rate cards are ranked by configured credit limit. This is a deterministic tie-breaker, not a check of available funds.
- **Spending caps are metadata only.** No billing-period tracking, remaining-cap calculation, issuer eligibility, points valuation, or enrollment logic is implemented. Calculations and UI disclose this limitation.
- Merchant-specific issuer restrictions are not modeled; the seed's product names are illustrative, not authoritative reward terms.
- The popup's Active Tab amount is manually entered; it does not retrieve the content script's detected subtotal.
- Checkout recommendations do not prove a purchase occurred. The simulator's checkout button displays an alert. Only the dashboard's manual purchase form writes a transaction.
- Analytics aggregate seeded/manual historical estimates over all stored transactions. They are not verified issuer earnings or live bank feeds. Existing stored history is not recalculated when rules change.
- Fresh databases include the corrected Target fixture. Previously saved demo history is preserved; its original estimates may differ from the current rules. This pass does not rewrite saved transactions.
- Single-user demo only: no authentication, tenant isolation, or production deployment claim. Run locally with fictional inputs; do not expose the API as a financial service.
- Offline recommendations are unavailable. Cached wallet labels may be displayed with an explicit offline notice; they are not used to fabricate recommendations.

## Source map

- `backend/src/routes/api.ts`: Zod validation and REST handlers.
- `backend/src/services/rewardRules.ts`: shared rule selection and model disclosure.
- `backend/src/services/recommendationEngine.ts`: ranking, explanations, recommendation logs.
- `backend/src/db/index.ts`: PostgreSQL/PGlite adapter and existing demo seed implementation.
- `backend/src/db/schema.sql`: profiles, cards, rules, merchants, transactions, recommendation logs.
- `dashboard/src/api.ts`: checked HTTP responses and render-data validation.
- `dashboard/src/App.tsx`: shared state, loading, refresh, mutation notifications.
- `extension/src/content/adapters/`: retailer-specific extraction; Walmart and local adapters live in `targetAdapter.ts`.
- `extension/src/content/checkoutContext.ts`: local-lab merchant allowlist.
- `extension/src/content/contentScript.ts`: detection, stale-response suppression, manual amount, retry states.
- `extension/src/content/ui/shadowContainer.ts`: isolated recommendation panel.
- `extension/src/background/serviceWorker.ts`: runtime message bridge and wallet cache.
- `extension/src/popup/popup.ts`: text-only rendering and explicit unavailable states.

## Checks and packaging

`npm test` runs backend, extension, and dashboard tests. `npm run typecheck` includes application and test sources. `npm run build` builds all workspaces. `npm run verify:compiled` verifies backend startup and HTTP behavior after compilation.

CI runs these checks; it does not deploy the project. Docker Compose describes PostgreSQL plus the backend; the dashboard runs separately. Docker execution and Chrome runtime need their own environment-specific verification.

## Database startup recovery

If the saved cluster fails with `Aborted()` / an invalid checkpoint, do not delete it or its WAL files. Use `npm --workspace=backend run start:demo` for a separate persistent interview dataset, and retain the original directory for recovery. The new dataset is the existing seed fixtures, not recovered history. Unset `DATABASE_URL` before using this embedded-demo launcher. Stop the backend with Ctrl+C and wait for `Database closed cleanly` before restarting; avoid running two backends against the same embedded directory. `npm run verify:disk` tests a compiled server against temporary disk storage, writes a test marker, closes the database, reopens it and checks persistence.

## Engineering guarantees

See [engineering decisions](docs/engineering-decisions.md) for the implemented atomic card/rule write, request contracts, correlated/redacted API errors, database readiness check, index choices and their regression evidence. These are local prototype guarantees, not a production-readiness claim. No additional services or setup are required.
