# BizScore

Hackathon demo for **alternate credit assessment**: business owners run a short verification flow in the browser; **loan officers** review saved applications in a separate dashboard.

## Quick start

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## In-app documentation

For the full walkthrough with route tables, open **`/docs`** after starting the app, or use the **Docs** link in the header.

## Who uses what

### Business owner (no login)

| Route | Purpose |
| --- | --- |
| `/` | Landing — overview and link into verification |
| `/assess` | Layer 1 — identity, shop details, optional GST, guided captures |
| `/assess/layer2` | Layer 2 — shop photos / shelf signals |
| `/assess/layer3` | Layer 3 — location context |
| `/assess/score` | Final score; completing here **saves** the application to local storage for officers |

### Loan officer (dashboard)

| Route | Purpose |
| --- | --- |
| `/dashboard/login` | Sign-in (mock frontend auth) |
| `/dashboard` | Inbox — list applications, stats, search |
| `/dashboard/applications/:id` | Case detail — scores, layers, approve / reject |

Unauthenticated visits to `/dashboard` or `/dashboard/applications/:id` redirect to `/dashboard/login`.

## Demo officer credentials

Use these on `/dashboard/login` to access the officer portal:

- **Email:** `officer@bizscore.in`
- **Password:** `demo123`

Credentials are verified in the client only (`src/services/storage.ts`) for demo purposes — not suitable for production.

## Data model (demo)

- Applications and officer decisions persist in **`localStorage`** in this browser.
- To see items in the dashboard, complete the business flow through **`/assess/score`** on the same browser profile first.

## Build

```bash
npm run build
npm run preview
```
