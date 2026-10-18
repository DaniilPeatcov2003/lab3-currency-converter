# Exchange Rates Contract

## Purpose

Defines the exchange-rate service and the normalized response used by the converter.

## Provider Request

The app requests `https://api.frankfurter.dev/v1/latest?base={SOURCE}&symbols={TARGET}` for the
selected currency pair.

## Provider Response

```json
{
  "amount": 1.0,
  "base": "USD",
  "date": "2026-10-16",
  "rates": {
    "EUR": 0.88865
  }
}
```

## Rules

- The response base must match the requested source currency.
- The response date must be an ISO-8601 calendar date.
- The requested target must be present in `rates`.
- Rate values must be finite numbers greater than zero.
- Same-currency conversion uses a rate of `1` and does not require a provider request.
- Each validated quote is stored locally by source and target currency and remains available after restart.
- If the API fails or returns an invalid response, a valid saved quote for the exact pair is used and identified as cached.
- The `/latest` endpoint returns the provider's latest published working-day rate; the returned date is shown so weekend and holiday data is not mistaken for a same-day publication.

## Error Handling

If the data source is unavailable, returns an unsuccessful response, or provides incomplete or
malformed data, the app uses an exact-pair cached quote when one is valid. Otherwise, the UI MUST
show an explanatory error and MUST NOT display a misleading amount. Hard-coded fallback rates MUST
NOT be used. Cached results MUST identify their original publication date.
