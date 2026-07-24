# Secret Scan Report — FunFinity Academy

Date: 2026-07-01

Summary:
- Automated scan found plaintext secrets and credentials in repository files (high risk). Immediate remediation is required for production safety and regulatory compliance.

High-risk findings (examples):

1) Root `.env` (committed)
- File: `.env`
- Excerpt:
  - `VITE_SUPABASE_URL=https://rwknajizufhqbcypjomj.supabase.co`
  - `VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...` (Supabase anon key in repo)
  - `VITE_ADMIN_PASSWORD=!FunFinityAcademy@77!`

Risk: Public exposure of Supabase keys and admin password can be used to access infrastructure or escalate privileges. Even anon keys can be abused when paired with other vulnerabilities.

2) `frontend/.env` (committed)
- File: `frontend/.env`
- Excerpt:
  - `VITE_SUPABASE_ANON_KEY=...` (same anon key)
  - `VITE_ADMIN_PASSWORD=!FunFinityAcademy@77!`
  - `JWT_SECRET=your_jwt_secret_here` (placeholder but sensitive if populated)
  - `R2_SECRET_ACCESS_KEY=your_secret_key` (placeholder may be configured)

Risk: Frontend environment files with secrets expose credentials in source control and in the deployed bundle if not properly handled.

3) `vercel.json` environment block
- File: `vercel.json`
- Excerpt:
  - `VITE_SUPABASE_ANON_KEY` present
  - `VITE_ADMIN_PASSWORD` present

Risk: Credentials in `vercel.json` (checked into repo) are easy to leak and should be managed via Vercel environment settings instead.

4) Hard-coded admin password in code
- File: `frontend/src/hooks/use-auth.tsx`
- Excerpt:
  - `const ADMIN_PASSWORD = "!FunFinity@77!";`

Risk: Hard-coded credentials in source code are a serious security anti-pattern and should be removed.

5) Local environment tokens
- Files: `.env.local`, `frontend/.env.local` (contain `VERCEL_OIDC_TOKEN` and other tokens)
- These files are often environment-specific but *must not* be committed. Confirm local files are removed from the repo history.

Other notes:
- Many distribution and vendor builds (`frontend/dist` files) contain references like `SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED` and token placeholders; these are probably benign JS library internals but should be assessed if they contain real tokens.

Recommended immediate remediation steps (prioritized):
1. Rotate exposed credentials immediately (Supabase keys, admin passwords, any cloud provider tokens). Treat them as compromised.
2. Remove secrets from the repository and replace with environment references accessed at runtime. Use `git filter-repo` or `git filter-branch` (or GitHub's secret scanning + removal guidance) to purge secrets from history.
3. Add all environment files to `.gitignore` (already updated for frontend/.gitignore). Ensure root `.gitignore` also ignores `.env*` and sensitive files.
4. Move environment variables into the deployment platform's secret store (Vercel project env vars, AWS Secrets Manager, etc.) and remove them from repository files.
5. Eliminate hard-coded credentials from source (`frontend/src/hooks/use-auth.tsx`) and implement admin auth via secure server-side checks.
6. Add automated secret scanning to CI (e.g., GitHub Advanced Security, TruffleHog, detect-secrets, gitleaks) to block commits containing likely secrets.
7. If any third-party keys were exposed, contact those providers to rotate or revoke keys and review access logs for suspicious activity.

Files flagged (non-exhaustive):
- .env
- frontend/.env
- frontend/.env.local
- frontend/.env.encrypted
- vercel.json
- frontend/src/hooks/use-auth.tsx
- scripts/local-test-runner.ts
- Any `dist` artifacts should be audited for leaked keys before publishing.

Next steps I can take for you (select any):
- (A) Run an automated `gitleaks` scan and produce a detailed remediation script.
- (B) Purge secrets from Git history with `git filter-repo` and prepare rotated secret instructions.
- (C) Add CI secret-scan job config (GitHub Actions) to block commits with secrets.

If you want me to proceed, pick an option or ask me to run all three in sequence. 

---

(Report generated automatically by developer assistant; verify before acting on production systems.)
