const JMBG_PATTERN = /^\d{13}$/;

export function digitsOnly(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 13);
}

export function isCompleteJmbg(value) {
  return JMBG_PATTERN.test(String(value || ""));
}

export function jmbgChecksum(value) {
  if (!isCompleteJmbg(value)) {
    return null;
  }

  const digits = String(value).split("").map(Number);
  const sum =
    7 * (digits[0] + digits[6]) +
    6 * (digits[1] + digits[7]) +
    5 * (digits[2] + digits[8]) +
    4 * (digits[3] + digits[9]) +
    3 * (digits[4] + digits[10]) +
    2 * (digits[5] + digits[11]);
  const remainder = sum % 11;
  const control = 11 - remainder;

  if (control > 9) {
    return 0;
  }

  return control;
}

export function isValidJmbg(value) {
  if (!isCompleteJmbg(value)) {
    return false;
  }

  return jmbgChecksum(value) === Number(String(value)[12]);
}
