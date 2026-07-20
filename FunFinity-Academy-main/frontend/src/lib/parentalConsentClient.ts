export async function requestParentalConsent(childName: string, parentEmail: string, childYear: number) {
  const res = await fetch('/api/parental-consent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'request', childName, parentEmail, childYear }),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json?.error || 'Failed to create parental consent request');
  }
  return res.json();
}

export async function verifyParentalConsent(token: string) {
  const res = await fetch('/api/parental-consent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'verify', token }),
  });
  if (!res.ok) throw new Error('Verification failed');
  return res.json();
}
