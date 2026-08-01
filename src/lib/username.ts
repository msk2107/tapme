const USERNAME_RE = /^[a-z0-9_-]{3,30}$/;

export function isValidUsername(value: string): boolean {
  return USERNAME_RE.test(value);
}

export function suggestUsername(email: string): string {
  const base = email
    .split("@")[0]
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "");
  const trimmed = base.slice(0, 24) || "user";
  return trimmed.length >= 3 ? trimmed : `${trimmed}${Math.floor(Math.random() * 900 + 100)}`;
}
