# Mandi Price & Crop Selling Assistant API

Express/MongoDB backend for verified Indian mandi-price search, comparison, trends, farmer-owned price alerts, and an AI-assisted selling analysis.

## What it does—and does not claim

- Retrieves prices only from a configured official OGD (`data.gov.in`) resource and stores the returned records with source/date metadata.
- If that source is unavailable or unconfigured, it returns only the latest stored verified records, clearly marked as potentially stale. It never generates price history or sample prices.
- The AI receives retrieved market facts and calculated values only. It is instructed not to fabricate prices, MSP, schemes, trends, transport costs, or future guarantees.
- Alert matching is implemented and recorded. Notifications are **not** sent because no SMS, WhatsApp, email, or push provider is integrated.

## Setup

1. Install Node.js 20+ and MongoDB.
2. From this directory, run `npm install`.
3. Copy `.env.example` to `.env` and set `MONGO_URI` and a strong `JWT_SECRET`.
4. Configure a current official agricultural-market resource from [data.gov.in](https://data.gov.in): set `OGD_RESOURCE_ID` and `OGD_API_KEY`. The application uses `https://api.data.gov.in/resource/<resource-id>` and rejects unusable/non-price records.
5. `OPENAI_API_KEY` is read from `../.env.local` (preferred for local secrets) or this directory's `.env`. Set `OPENAI_MODEL` as needed.
6. Start with `npm run dev`.

The server starts at `http://localhost:5000`; `GET /health` is an unauthenticated health check.

## API

| Method | Path | Authentication | Purpose |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | No | Create a farmer account and JWT |
| POST | `/api/auth/login` | No | Get a JWT |
| GET | `/api/mandi/prices?state=&district=&mandi=&crop=&date=YYYY-MM-DD` | No | Search verified prices |
| GET | `/api/mandi/compare?crop=&state=&district=&mandis=Mandi%20A,Mandi%20B` | No | Compare market records; highest modal price is flagged, not recommended |
| GET | `/api/mandi/trends?crop=&state=&mandi=&from=&to=` | No | Calculate a trend only from stored verified history |
| POST | `/api/selling/assistant` | No | Retrieve facts, calculate gross/net where possible, and request constrained AI guidance |
| POST | `/api/alerts` | Bearer token | Save a farmer's target-price alert |
| GET | `/api/alerts` | Bearer token | List the farmer's alerts |
| DELETE | `/api/alerts/:id` | Bearer token | Delete the farmer's alert |

### Example requests

```bash
curl 'http://localhost:5000/api/mandi/prices?state=Telangana&crop=Cotton'

curl -X POST http://localhost:5000/api/selling/assistant \
  -H 'Content-Type: application/json' \
  -d '{"crop":"Cotton","quantity":20,"unit":"quintal","state":"Telangana","district":"Warangal","language":"English","transportCost":500}'
```

An unavailable source returns a truthful response such as:

```json
{
  "success": true,
  "message": "No verified mandi prices are available for this search.",
  "data": [],
  "meta": { "freshness": "unavailable", "warning": "Official OGD data is not configured." }
}
```

Import `postman_collection.json` into Postman for ready-made registration, price, assistant, and alert requests.

## React integration

Set the frontend's API base URL to `http://localhost:5000`. Store the JWT in an appropriate secure client-side session strategy and send `Authorization: Bearer <token>` only for alert endpoints. Display `meta.freshness`, `meta.warning`, `priceDate`, and `dataSource` beside every price; do not present stale or unavailable data as current.

## Testing

Run `npm test`. The tests cover calculation behavior and specifically assert that a missing verified price produces no invented valuation. Add integration tests with a dedicated MongoDB test database before deployment.

## Production notes

- Use MongoDB Atlas or a secured MongoDB deployment, HTTPS, a production CORS allowlist, and a long random JWT secret.
- Do not expose `.env.local`, `OPENAI_API_KEY`, OGD keys, or JWT secrets to React/browser code.
- OGD datasets and access policies can change; verify the resource schema before enabling it. The normalizer accepts common AGMARKNET-style column names (`state`, `district`, `market`, `commodity`, `variety`, `min_price`, `max_price`, `modal_price`, `arrival_date`).
