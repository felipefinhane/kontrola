// Server-side password strength rule — shared by Sign Up (#2) and, per
// docs/TASKS.md #14, Change Password too. Grilling decision recorded in
// #2: the Stitch hint text ("8 chars, a number, a symbol") stops being
// just UI copy and becomes this actual check. Deliberately binary
// (pass/fail), not a graduated strength meter — there's only one rule.
export const PASSWORD_MIN_LENGTH = 8;

export function isPasswordStrong(password: string): boolean {
  if (password.length < PASSWORD_MIN_LENGTH) return false;
  if (!/[0-9]/.test(password)) return false;
  if (!/[^A-Za-z0-9]/.test(password)) return false;
  return true;
}

// Deliberately simple — not RFC 5322. Good enough to catch typos/garbage
// before it reaches the DB; the real proof an address works is that the
// user can log in with it, since Sign Up has no email verification (#2
// grilling decision, MVP scope).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email);
}
