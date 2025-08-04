# Security Audit Prompt

## Instructions

Use this prompt to run a focused security audit of the linkBD codebase.

### 1. Prepare
- Identify and load any relevant security guidelines (OWASP Top 10, Hono.js security docs, project-specific rules such as 4_better_auth_overview).
- Skim the project structure to locate high-risk areas (authentication, authorization, database access, file uploads, secrets management, external API calls).

### 2. Scope & Inventory
- List all files that touch security-sensitive concerns:
  - `auth`, `middleware`, `routes`, `models`, `lib` dealing with crypto/storage
  - Environment config (`env.*`, `.env.example`)
  - Deployment/config files exposing headers, CORS, CSP, etc.

### 3. Systematic Review
For every scoped file, check:
1. **Authentication / Authorization**
   - Proper use of Better Auth middleware
   - No bypasses of auth checks
2. **Input Validation & Sanitization**
   - Zod or equivalent validation on all external inputs (body, query, params, headers, cookies, file uploads)
3. **Database Security**
   - Parameterized queries via Drizzle (no raw interpolated SQL)
   - Tenant isolation: data filtered by authenticated user / org
4. **Secrets & Config**
   - Secrets read only from environment variables
   - No hard-coded secrets or credentials checked into repo
5. **File & Object Storage**
   - Validate file type/size
   - Generate unique filenames
   - Enforce access controls for protected files
6. **Error Handling & Logging**
   - No leakage of stack traces or sensitive data to clients
   - Logs avoid storing PII / credentials
7. **Secure Headers & CORS**
   - Proper CORS config (origins, methods, credentials)
   - Use of standard security headers (CSP, HSTS, X-Content-Type-Options, etc.)
8. **Dependency & Package Risk**
   - Highlight outdated or vulnerable packages
   - Verify no use of known insecure libraries
9. **Cryptography**
   - Strong algorithms and key sizes
   - Nonces / IVs generated securely

### 4. Classify Findings
Label each reviewed file:
- ✅ No security issues found
- ⚠️ Minor security concern (low impact/easy fix)
- ❌ High-risk vulnerability
- 🤔 Needs clarification

### 5. Report Format
For each ⚠️/❌ item provide:
- File path & line numbers
- Vulnerability description & risk level
- Recommended remediation

### 6. Follow-up Questions
Ask about ambiguous flows, missing guidelines, or edge cases that need confirmation.

### 7. Executive Summary
- Total files reviewed & percentage with issues
- Top recurring vulnerabilities
- Highest-priority fixes
- Overall security posture score (1-5)

## Usage Template

``` 
@security-audit

Please audit all backend files in `apps/server/src/**` and auth-related frontend files in `apps/web-app/src/**` using this security audit prompt.

Focus particularly on authentication flow and secrets management.
```