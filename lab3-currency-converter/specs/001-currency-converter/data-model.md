# Data Model

## Core Entities

### Currency

Represents a recognized currency code and its display metadata.

**Fields**:
- `code`: string, e.g. `USD`, `EUR`, `JPY`
- `name`: string, e.g. `US Dollar`
- `symbol`: string, optional, e.g. `$`, `€`

**Relationships**:
- Used by both the source and target side of a conversion.

### ExchangeRate

Represents the market value used to convert one unit of a source currency into another currency.

**Fields**:
- `base`: string, source currency code
- `quote`: string, target currency code
- `value`: number, conversion multiplier
- `timestamp`: ISO-8601 string, time the rate was fetched or defined

**Relationships**:
- Derived from a local rate map or external API response.
- A conversion result is produced from the rate value.

### ConversionRequest

Represents the input the user submits for conversion.

**Fields**:
- `amount`: number
- `fromCurrency`: string
- `toCurrency`: string

**Validation Rules**:
- `amount` must be a finite positive number.
- Source and target currency codes must be supported.

### ConversionResult

Represents the output shown to the user.

**Fields**:
- `fromCurrency`: string
- `toCurrency`: string
- `amount`: number
- `convertedAmount`: number
- `formattedResult`: string

**Rules**:
- Conversion is computed as `amount * exchangeRate.value`.
- If there is no valid rate, the result is not shown and a user-facing error is displayed instead.

## Rate Source Contract

The app will treat exchange data as a simple dictionary-like structure:

```json
{
  "USD": {
    "EUR": 0.92,
    "GBP": 0.79,
    "JPY": 157.2
  }
}
```

This can later be replaced by a live provider returning a similar mapping or a normalized nested object.
