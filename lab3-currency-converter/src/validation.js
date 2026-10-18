export function validateAmount(value) {
  const normalizedValue = String(value ?? "").trim();

  if (!normalizedValue) {
    return { valid: false, message: "Введите сумму для конвертации." };
  }

  if (!/^[+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)$/.test(normalizedValue)) {
    return { valid: false, message: "Введите корректное числовое значение." };
  }

  const amount = Number(normalizedValue.replace(",", "."));

  if (!Number.isFinite(amount)) {
    return { valid: false, message: "Введите корректное числовое значение." };
  }

  if (amount <= 0) {
    return { valid: false, message: "Сумма должна быть больше нуля." };
  }

  return { valid: true, amount };
}
