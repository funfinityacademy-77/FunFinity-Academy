// Mock parental consent client for frontend-only deployment
// In production, this should connect to a real backend API

function generateToken() {
  if (typeof crypto !== 'undefined' && (crypto as any).randomUUID) {
    return (crypto as any).randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export async function requestParentalConsent(childName: string, parentEmail: string, childYear: string) {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const token = generateToken();
  
  // Store consent request in localStorage for demo purposes
  const consentRequests = JSON.parse(localStorage.getItem('parental-consent-requests') || '{}');
  consentRequests[token] = {
    childName,
    parentEmail,
    childYear,
    timestamp: Date.now(),
    granted: false
  };
  localStorage.setItem('parental-consent-requests', JSON.stringify(consentRequests));
  
  return { token, message: 'Parental consent request created (demo mode).' };
}

export async function verifyParentalConsent(token: string) {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const consentRequests = JSON.parse(localStorage.getItem('parental-consent-requests') || '{}');
  
  if (!consentRequests[token]) {
    throw new Error('Token not found');
  }
  
  consentRequests[token].granted = true;
  localStorage.setItem('parental-consent-requests', JSON.stringify(consentRequests));
  
  return { ok: true };
}
