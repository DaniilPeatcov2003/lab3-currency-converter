export function convertAmount({ amount, fromCurrency, toCurrency, rate, date = null }) {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new RangeError("Amount must be a finite positive number.");
  }

  if (
    typeof fromCurrency !== "string" ||
    typeof toCurrency !== "string" ||
    !/^[A-Z]{3}$/.test(fromCurrency) ||
    !/^[A-Z]{3}$/.test(toCurrency)
  ) {
    throw new TypeError("Currency codes must be three uppercase letters.");
  }

  if (!Number.isFinite(rate) || rate <= 0) {
    throw new RangeError("Rate must be a finite positive number.");
  }

  const convertedAmount = amount * rate;

  if (!Number.isFinite(convertedAmount)) {
    throw new RangeError("Converted amount is outside the supported numeric range.");
  }

  return {
    amount,
    fromCurrency,
    toCurrency,
    rate,
    date,
    convertedAmount,
  };
}
