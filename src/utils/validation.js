/**
 * Shared field validation rules.
 * Returns an error message string or undefined if valid.
 */

// Only letters (including accented Spanish chars), spaces, hyphens, apostrophes
const NAME_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s'\-]+$/;

// Alphanumeric, dots, underscores, hyphens — no spaces or special chars
const USERNAME_REGEX = /^[a-zA-Z0-9._\-]+$/;

// Characters forbidden in titles / descriptions (HTML/script injection risk)
const UNSAFE_CHARS_REGEX = /[<>{}[\]|\\]/;

/**
 * Validates a name field (first_name, last_name).
 * @param {string} value
 * @param {string} [label='El nombre']
 * @returns {string|undefined}
 */
export function validateName(value, label = 'El nombre') {
  if (!value || !value.trim()) return undefined; // presence checked separately
  if (!NAME_REGEX.test(value.trim())) {
    return `${label} solo puede contener letras, espacios, guiones y apóstrofes.`;
  }
  return undefined;
}

/**
 * Validates a username field.
 * @param {string} value
 * @returns {string|undefined}
 */
export function validateUsername(value) {
  if (!value) return undefined; // presence checked separately
  if (!USERNAME_REGEX.test(value)) {
    return 'El usuario solo puede contener letras, números, puntos, guiones y guiones bajos.';
  }
  return undefined;
}

/**
 * Validates a text field for unsafe/injection characters.
 * @param {string} value
 * @param {string} [label='Este campo']
 * @returns {string|undefined}
 */
export function validateSafeText(value, label = 'Este campo') {
  if (!value || !value.trim()) return undefined; // presence checked separately
  if (UNSAFE_CHARS_REGEX.test(value)) {
    return `${label} contiene caracteres no permitidos (< > { } [ ] | \\).`;
  }
  return undefined;
}

/**
 * Validates an email field format.
 * @param {string} value
 * @returns {string|undefined}
 */
export function validateEmail(value) {
  if (!value || !value.trim()) return undefined; // presence checked separately
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!EMAIL_REGEX.test(value.trim())) {
    return 'Ingresa un correo electrónico válido.';
  }
  return undefined;
}
