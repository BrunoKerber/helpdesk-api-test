export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

export function isValidName(name) {
  return /^[A-Za-zÀ-ÿ\s'-]+$/.test(name);
}