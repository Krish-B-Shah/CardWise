# CardWise — Checkout Integration & Rewards Dashboard

CardWise is an integrated credit card rewards optimization platform consisting of two synchronized applications powered by a shared PostgreSQL backend:

1. **Chrome Manifest V3 Extension (`extension/`)**: Contextual recommendation assistant that provides optimal credit card suggestions directly on checkout pages using a modular, permission-controlled `MerchantAdapter` architecture.
2. **React Financial Dashboard (`dashboard/`)**: Single-page application for managing fictional cards, configuring category reward rates, tracking transactions, analyzing spending patterns, and measuring reward gaps.
3. **Shared Backend & Merchant Lab (`backend/`)**: Node.js REST API with PostgreSQL persistence (embedded PGlite out-of-the-box, or live PostgreSQL via `DATABASE_URL`) and an interactive Simulated Merchant Checkout Lab (`/demo-store`).

---

## 🔒 Security & Privacy Architecture

- **Zero Credential Inspection**: Content scripts never inspect payment fields, credit card PANs, expiration dates, CVVs, passwords, or personal billing addresses.
- **Strictly Scoped Data Transfer**: When shopping, content scripts transfer *only* the normalized domain (`amazon.com`), merchant category (`online_shopping`), and numerical purchase subtotal (`$149.99`). Full page contents or DOM trees are never sent to the backend.
- **Isolated Shadow DOM**: Recommendation panels are rendered inside an isolated Shadow DOM (`attachShadow`), avoiding CSS conflicts with retailer stylesheets and preventing duplicate widget injections.
- **Safe DOM Handling**: Webpage text is treated as untrusted and sanitized before parsing. No remote executable code or external scripts are injected.
- **Minimal Permissions**: The Chrome extension uses narrowly scoped host permissions (`localhost` and optional permissions for supported retailers).

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18 (Node 22+ recommended)
- npm >= 9

### 1. Install Dependencies
```bash
npm install
```

### 2. Run All Tests
```bash
npm run test
```
Runs 20 unit tests across backend recommendation services, merchant DOM adapters, currency parsers, privacy validators, and typed extension messaging.

### 3. Start Backend & Demo Checkout Lab
```bash
npm run start:backend
```
- API Server: `http://localhost:3001`
- Interactive Checkout Lab: `http://localhost:3001/demo-store`

### 4. Start React Dashboard
```bash
npm run start:dashboard
```
- Dashboard URL: `http://localhost:5173`

### 5. Build Chrome Extension
```bash
npm run build:extension
```
Builds the Manifest V3 extension to `extension/dist/`.

---

## 🧩 Loading the Extension in Google Chrome

1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** toggle in the top-right corner.
3. Click **Load unpacked**.
4. Select the `extension/dist` folder located in this repository:
   `c:\Users\Shahk\Documents\GitHub\CardWise\extension\dist`
5. The **CardWise — Smart Checkout Recommendations** extension will now be active in your toolbar.
6. Open `http://localhost:3001/demo-store` to test live contextual recommendations on Amazon, Best Buy, Target, and Demo Store checkout flows.

---

## 🧱 Architecture Overview

```
CardWise/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── index.ts          # PostgreSQL connection & PGlite fallback
│   │   │   ├── schema.sql        # Profiles, cards, rules, merchants, tx
│   │   │   └── seed.ts           # Demo profile & fictional card seed
│   │   ├── services/
│   │   │   └── recommendationEngine.ts # Optimal card ranking & baseline comparison
│   │   ├── routes/
│   │   │   └── api.ts            # Validated REST API endpoints
│   │   ├── demoStoreHtml.ts      # Interactive checkout simulator
│   │   └── index.ts              # Express server
│   └── tests/
│       └── recommendation.test.ts # Vitest suite
├── dashboard/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx        # Top navigation with demo badge
│   │   │   ├── AnalyticsView.tsx # KPI summary, category spend, audit logs
│   │   │   ├── CardManager.tsx   # Visual card wallet & add/delete modal
│   │   │   ├── RewardRules.tsx   # Category reward rates & caps
│   │   │   ├── TransactionsView.tsx # Reward gap analysis & purchase logging
│   │   │   └── OptimizerCalculator.tsx # Live opportunity comparator
│   │   ├── App.tsx
│   │   ├── api.ts                # Backend client
│   │   └── index.css             # Glassmorphic dark mode styling
├── extension/
│   ├── manifest.json             # Manifest V3 definition
│   ├── src/
│   │   ├── background/
│   │   │   └── serviceWorker.ts  # Typed message handler & local cache
│   │   ├── content/
│   │   │   ├── adapters/
│   │   │   │   ├── types.ts      # MerchantAdapter interface
│   │   │   │   ├── baseAdapter.ts # Currency parser & privacy guard
│   │   │   │   ├── amazonAdapter.ts
│   │   │   │   ├── bestbuyAdapter.ts
│   │   │   │   ├── targetAdapter.ts
│   │   │   │   ├── walmartAdapter.ts
│   │   │   │   └── registry.ts
│   │   │   ├── ui/
│   │   │   │   └── shadowContainer.ts # Isolated dismissible panel
│   │   │   └── contentScript.ts  # SPA navigation & throttled observer
│   │   ├── popup/
│   │   │   ├── popup.html
│   │   │   ├── popup.ts
│   │   │   └── popup.css
│   │   └── shared/
│   │       ├── messages.ts       # Typed messages & runtime validators
│   │       └── types.ts
│   └── tests/
│       ├── adapters.test.ts      # DOM adapter extraction tests
│       └── messages.test.ts      # Message schema validation tests
```

---

## 👤 Fictional Demo Profile Notice

For this single-user MVP, all data belongs to a fictional demo profile (**Alex Morgan**, `alex.demo@cardwise.local`). No real banking credentials or live card account details are stored or required.
