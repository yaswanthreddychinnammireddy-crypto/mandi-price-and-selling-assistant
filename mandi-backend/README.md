# Mandi Price & Selling Assistant: Backend

Node.js + Express + SQLite. Pulls daily mandi prices from the Agmarknet dataset on data.gov.in and exposes price, trend, comparison, selling-advice, listing and alert APIs.

## Setup
```bash
npm install
cp .env.example .env     # set JWT_SECRET and DATA_GOV_API_KEY
npm run sync             # optional: first manual price pull
npm run dev
```
Prices are Rs per quintal.

## API
| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | /api/auth/register | no | `{name, phone, password, state?, district?}` |
| POST | /api/auth/login | no | `{phone, password}` -> `{user, token}` |
| GET | /api/auth/me | yes | current user |
| GET | /api/prices | no | filter: state, district, market, commodity, date, page, limit |
| GET | /api/prices/commodities?state= | no | commodity list |
| GET | /api/prices/markets?state=&commodity= | no | market list |
| GET | /api/prices/trend?commodity=&state=&market=&days= | no | daily avg modal price series |
| GET | /api/prices/compare?commodity=&state= | no | latest price per market, best first |
| GET | /api/advice/sell?commodity=&state=&market=&quantity_qtl=&expected_price= | no | SELL_NOW / HOLD_SHORT / HOLD_IF_STORABLE / NEUTRAL, stats, best markets |
| GET | /api/listings | no | browse open listings (buyers) |
| GET | /api/listings/mine | yes | my listings |
| POST | /api/listings | yes | create listing, returns a price sanity check |
| PATCH | /api/listings/:id | yes | edit / mark `sold` or `cancelled` |
| DELETE | /api/listings/:id | yes | remove |
| GET/POST/DELETE | /api/alerts | yes | price alerts (`above` / `below` a target) |

Send the token as `Authorization: Bearer <token>`.

## Notes
- Sync runs on startup and on `SYNC_CRON` (default every 6 hours) for the states in `SYNC_STATES`. Alerts are checked after each sync; the `TODO` in `src/jobs/sync.js` is where SMS/WhatsApp/push goes.
- Advice is a rule-based heuristic on the last 21 days, not a forecast.
- To move to Postgres or Supabase later, only `src/db.js` and the SQL strings need to change.
