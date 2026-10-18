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
- `date`: ISO-8601 calendar date published by the provider
- `cached`: boolean indicating the quote was read from persistent local storage after a provider failure

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
- Each successful provider quote is persisted per currency pair across browser restarts.
- A cached quote can be used only for its exact source/target pair and must always be labeled with its saved date.
- If neither a valid provider quote nor a valid cached quote exists, the result is not shown and a user-facing error is displayed.

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
