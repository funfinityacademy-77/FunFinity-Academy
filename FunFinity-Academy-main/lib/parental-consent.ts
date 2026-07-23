// Server-side helpers for parental consent flow.
// Replace placeholders with real DB integration and email provider.

export interface ConsentRecord {
  token: string;
  childName: string;
  parentEmail: string;
  childYear: number;
  granted?: boolean;
}

const inMemoryStore: Record<string, ConsentRecord> = {};

export function createConsentRequest(childName: string, parentEmail: string, childYear: number): ConsentRecord {
  const token = (Math.random().toString(36).slice(2) + Date.now().toString(36));
  const rec: ConsentRecord = { token, childName, parentEmail, childYear, granted: false };
  inMemoryStore[token] = rec;
  // TODO: persist to DB and send email with verification link
  return rec;
}

export function markConsentGranted(token: string): boolean {
  const rec = inMemoryStore[token];
  if (!rec) return false;
  rec.granted = true;
  // TODO: persist change to DB
  return true;
}

export function getConsent(token: string): ConsentRecord | null {
  return inMemoryStore[token] || null;
}
