# ClawBot Deploy - Security Testing Checklist

**Status:** ⏸️ Pending feature development  
**Last Updated:** 2026-02-10

---

## 1. Authentication Security

### Password Handling
- [ ] Passwords hashed with bcrypt (cost factor ≥10) or Argon2
- [ ] No password stored in plaintext anywhere
- [ ] No password logged anywhere
- [ ] Password requirements enforced (min length, complexity)
- [ ] Rate limiting on login attempts
- [ ] Account lockout after N failed attempts
- [ ] Lockout notification sent to user email

### Session Management
- [ ] Session tokens are cryptographically random
- [ ] Session tokens rotated after login
- [ ] Session tokens expire after inactivity
- [ ] Session invalidated on logout
- [ ] Session invalidated on password change
- [ ] No session fixation vulnerability
- [ ] Secure cookie flags (HttpOnly, Secure, SameSite)

### OAuth/SSO (if implemented)
- [ ] State parameter used to prevent CSRF
- [ ] Token validated with provider
- [ ] Only trusted OAuth providers allowed
- [ ] No token leakage in URLs/logs

---

## 2. Azure Credential Security

### Storage
- [ ] Credentials encrypted at rest (AES-256 or equivalent)
- [ ] Encryption keys stored separately from data
- [ ] Encryption keys rotated periodically
- [ ] No credentials in environment variables of user-accessible processes
- [ ] Credentials stored in dedicated secrets manager

### Transmission
- [ ] All credential input over HTTPS
- [ ] No credentials in URL parameters
- [ ] No credentials logged by any system
- [ ] TLS 1.2+ enforced

### Access Control
- [ ] Credentials accessible only to owning user
- [ ] Admin cannot view user credentials (zero-knowledge)
- [ ] Credential access logged (audit trail)
- [ ] Credential deletion verifiable

### UI Security
- [ ] Credential fields use type="password"
- [ ] No autocomplete on sensitive fields
- [ ] No credentials visible in page source
- [ ] Copy-paste disabled on credential confirmation fields

---

## 3. API Security

### Authentication
- [ ] All API endpoints require authentication (except public)
- [ ] API tokens are cryptographically random
- [ ] API tokens expire appropriately
- [ ] Refresh token rotation implemented
- [ ] Invalid tokens return 401, not error details

### Authorization
- [ ] Users can only access their own resources
- [ ] Resource ownership verified on every request
- [ ] No IDOR (Insecure Direct Object Reference) vulnerabilities
- [ ] Admin actions require elevated privileges

### Input Validation
- [ ] All input validated server-side
- [ ] Input type checking (string, number, etc.)
- [ ] Input length limits enforced
- [ ] Allowlist validation where possible
- [ ] No SQL injection (parameterized queries)
- [ ] No command injection (no shell=True with user input)

### Rate Limiting
- [ ] Rate limits on all endpoints
- [ ] Stricter limits on sensitive endpoints (login, deploy)
- [ ] Rate limit headers returned to client
- [ ] Graceful handling of rate-limited requests

---

## 4. Cloud Security (Azure)

### Credential Scope
- [ ] Service principal has minimum required permissions
- [ ] No Owner or Contributor at subscription level
- [ ] Permissions scoped to specific resource groups
- [ ] Audit log of all Azure API calls

### VM Security
- [ ] VMs deployed with NSG (Network Security Group)
- [ ] NSG rules follow least privilege
- [ ] Only necessary ports open (22 SSH, specific app ports)
- [ ] No public IP unless required
- [ ] SSH key authentication preferred over password

### Resource Management
- [ ] Resource cleanup on deployment failure
- [ ] No orphaned resources (disks, NICs, IPs)
- [ ] Resource tagging for tracking
- [ ] Budget alerts configured

---

## 5. Application Security

### XSS Prevention
- [ ] All user input escaped in HTML output
- [ ] Content-Security-Policy header set
- [ ] No dangerouslySetInnerHTML with user input
- [ ] SVG uploads sanitized

### CSRF Prevention
- [ ] CSRF tokens on all state-changing forms
- [ ] SameSite cookie attribute set
- [ ] Origin/Referer header validation

### Other Injection
- [ ] No path traversal in file operations
- [ ] No template injection
- [ ] No XML injection (if applicable)
- [ ] No LDAP injection (if applicable)

---

## 6. Infrastructure Security

### HTTPS
- [ ] TLS 1.2+ enforced
- [ ] Strong cipher suites only
- [ ] HSTS header with long max-age
- [ ] HSTS preload submitted

### Headers
- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff
- [ ] X-XSS-Protection: 1; mode=block
- [ ] Referrer-Policy: strict-origin-when-cross-origin
- [ ] Permissions-Policy set appropriately

### Secrets Management
- [ ] No secrets in code repository
- [ ] No secrets in client-side code
- [ ] Environment variables not exposed to client
- [ ] Secrets rotatable without code deployment

---

## 7. Error Handling

### Error Messages
- [ ] No stack traces in production errors
- [ ] No internal paths revealed
- [ ] No database query details revealed
- [ ] No version information revealed
- [ ] Generic error messages for auth failures

### Logging
- [ ] Sensitive data not logged (passwords, tokens, credentials)
- [ ] Log injection prevented
- [ ] Logs stored securely
- [ ] Log retention policy defined

---

## 8. Dependency Security

### Package Management
- [ ] npm audit shows no critical vulnerabilities
- [ ] Dependencies locked (package-lock.json)
- [ ] Automated dependency updates (Dependabot/Renovate)
- [ ] No packages with known security issues

### Supply Chain
- [ ] Package integrity verified (checksum/signature)
- [ ] No typosquatting risks in dependencies
- [ ] Build process reproducible

---

## 9. Pre-Launch Security Tasks

### Manual Testing
- [ ] Attempted SQL injection on all forms
- [ ] Attempted XSS on all input fields
- [ ] Attempted CSRF on state-changing actions
- [ ] Attempted privilege escalation
- [ ] Attempted unauthorized resource access

### Automated Scanning
- [ ] OWASP ZAP scan completed
- [ ] No critical findings
- [ ] Medium findings reviewed and accepted/fixed
- [ ] Scan results documented

### Penetration Testing (if budget allows)
- [ ] Third-party pentest scheduled
- [ ] Findings remediated
- [ ] Retest completed

---

## 10. Compliance Considerations

### Data Protection
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] User data deletion capability
- [ ] Data export capability (GDPR)

### Payment (if applicable)
- [ ] PCI DSS compliance considered
- [ ] No card data stored locally
- [ ] Payment processor handles sensitive data

---

## Sign-Off

| Area | Reviewer | Date | Status |
|------|----------|------|--------|
| Authentication | | | Pending |
| Azure Credentials | | | Pending |
| API Security | | | Pending |
| Cloud Security | | | Pending |
| Application Security | | | Pending |
| Infrastructure | | | Pending |
| Error Handling | | | Pending |
| Dependencies | | | Pending |

**Overall Security Status:** ⏸️ NOT ASSESSED (no code to assess)
