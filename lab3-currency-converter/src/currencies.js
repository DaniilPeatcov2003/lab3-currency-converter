export const currencies = [
  { code: "USD", name: "Доллар США" },
  { code: "EUR", name: "Евро" },
  { code: "GBP", name: "Фунт стерлингов" },
  { code: "JPY", name: "Японская иена" },
  { code: "CHF", name: "Швейцарский франк" },
  { code: "CAD", name: "Канадский доллар" },
  { code: "AUD", name: "Австралийский доллар" },
  { code: "PLN", name: "Польский злотый" },
  { code: "SEK", name: "Шведская крона" },
  { code: "NOK", name: "Норвежская крона" },
];

export const currencyCodes = new Set(currencies.map(({ code }) => code));
