// Vercel / serverless-compatible parental consent stub
// This file is a minimal, server-ready stub. Replace in-memory storage with a production DB and integrate an email provider.

import { VercelRequest, VercelResponse } from '@vercel/node';

// In-memory store for demo purposes. DO NOT use in production.
const consentStore: Record<string, { childName: string; parentEmail: string; childYear: number; granted?: boolean }> = {};

function generateToken() {
  if (typeof crypto !== 'undefined' && (crypto as any).randomUUID) {
    return (crypto as any).randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'POST') {
      const { action } = req.body || req.query || {};

      if (action === 'request') {
        const { childName, parentEmail, childYear } = req.body;
        if (!parentEmail || !childName || !childYear) {
          return res.status(400).json({ error: 'Missing parameters' });
        }

        const token = generateToken();
        consentStore[token] = { childName, parentEmail, childYear };

        // TODO: send verification email to parentEmail with link to /api/parental-consent?token=xxx&action=verify
        // For production: integrate SendGrid/Postmark/SES and persist to DB.

        return res.status(200).json({ token, message: 'Parental consent request created (stub).' });
      }

      if (action === 'verify') {
        const { token } = req.body;
        if (!token || !consentStore[token]) return res.status(404).json({ error: 'Token not found' });
        consentStore[token].granted = true;
        return res.status(200).json({ ok: true });
      }
    }

    // Optionally support GET verify via query token
    if (req.method === 'GET' && req.query && req.query.token) {
      const token = String(req.query.token);
      if (consentStore[token]) {
        consentStore[token].granted = true;
        return res.status(200).send(`<html><body><h1>Parental consent verified (stub)</h1><p>You may close this window.</p></body></html>`);
      }
      return res.status(404).send('Token not found');
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).end('Method Not Allowed');
  } catch (err) {
    console.error('Parental consent handler error', err);
    return res.status(500).json({ error: 'Internal error' });
  }
}
