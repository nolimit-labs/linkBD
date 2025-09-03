## Backend Security Re‑Audit (apps/server)
Date: 2025-08-25

### Executive Summary
- **Critical risks**: None found.
- **Overall posture**: Low-to-Medium risk. Strong improvements in CORS, rate limiting, and validation. Remaining items mainly concern uploads security, production hardening, and CSRF assurances.

### Current Risks by Severity

#### High
- None identified.

#### Medium
- File upload antivirus scanning is not implemented.
  - Evidence: `apps/server/src/routes/storage.ts` generates presigned upload URLs without post‑upload scanning; only MIME whitelist and size cap.
  - Impact: Potential malware upload if clients bypass MIME enforcement.
  - Action: Add AV scan step on upload completion (e.g., ClamAV/Lambda/Worker), quarantine on fail.

- Rate limiter uses in‑memory store.
  - Evidence: `apps/server/src/index.ts` builds limiter without external store.
  - Impact: Ineffective in multi‑instance deployments; burst limits not shared; potential header spoofing if proxy trust isn’t enforced.
  - Action: Use Redis/Upstash store; ensure trusted proxy headers or server IP are used.

- CSRF protections are implicit, not explicit.
  - Evidence: Cookie‑based auth with `credentials: true` CORS; no CSRF tokens observed in mutating routes.
  - Impact: With any origin misconfiguration or permissive cookies, CSRF risk increases.
  - Action: Ensure SameSite=Lax/Strict on cookies in prod, or add anti‑CSRF tokens for state‑changing routes.

- CORS allows all headers.
  - Evidence: `allowHeaders: ['*']` in `apps/server/src/index.ts`.
  - Impact: Broader surface area for preflight approvals.
  - Action: Restrict to known headers (e.g., `Content-Type`, `Authorization`, `x-api-key`).

#### Low
- TLS verification disabled for DB client with comment.
  - Evidence: `rejectUnauthorized: false` in `apps/server/src/db/index.ts` with Railway private networking note.
  - Impact: Acceptable in current infra; risky if topology changes.
  - Action: Gate by env var and enable strict TLS for public networks.

- Some endpoints lack param/body validators on PATCH/DELETE paths (most core ones are validated).
  - Evidence: e.g., `PATCH /api/posts/:id/like` uses params without schema.
  - Impact: Minor—handled values are simple; still good hygiene to validate.
  - Action: Add `zValidator` for params where missing.

### Resolved / Good Practices Confirmed
- CORS origins are properly parsed from `CORS_ORIGINS` and applied.
  - Evidence: `apps/server/src/index.ts` and `apps/server/src/auth.ts` parse comma‑separated origins.

- Advanced rate limiting implemented and integrated globally.
  - Evidence: `apps/server/src/index.ts` with key strategy (userId > API key > IP), OPTIONS bypass, standard rate headers.

- Secure headers middleware enabled globally.
  - Evidence: `secureHeaders()` in `apps/server/src/index.ts`.

- Input validation widely used.
  - Evidence: Extensive `zValidator` usage across `routes/*` (users, posts, organizations, admin, storage).

- Storage path sanitization and constraints.
  - Evidence: `generateStoragePath` replaces unsafe chars; upload size cap (10MB) and MIME whitelist (images) in `routes/storage.ts`.

- Production logging level reduced for Better Auth.
  - Evidence: `logger.level` set to `error` in production in `apps/server/src/auth.ts`.

### Recommendations (Actionable)
- Implement post‑upload antivirus scanning and metadata validation before marking a file active.
- Move rate limiting to a shared store (Redis/Upstash) and ensure trusted proxy configuration for client IP.
- Lock down CORS `allowHeaders` to a minimal, explicit set.
- Verify Better Auth cookies use `Secure` and `SameSite=Lax/Strict` in production; add CSRF tokens for state‑changing routes if cookies can be sent cross‑site.
- Add param validators to remaining PATCH/DELETE routes.
- Make DB TLS strict by default, with an explicit env flag for private networks.

### Scope
Reviewed files include (non‑exhaustive): `apps/server/src/index.ts`, `auth.ts`, `middleware/auth.ts`, `routes/{user,posts,organizations,search,storage,admin}.ts`, `lib/storage.ts`, `models/storage.ts`, `db/index.ts`.


