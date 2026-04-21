# WDesignKit Security Checklist

> Run this checklist before every release. Focus areas: Auth, Input Handling, Data Exposure, HTTPS.

---

## 1. Authentication & Session

- [ ] Login blocks brute force — rate limiting or lockout after failed attempts
- [ ] No user enumeration on login ("email not found" vs generic error)
- [ ] No user enumeration on forgot password
- [ ] Passwords are never visible in page source or network requests
- [ ] Session tokens are invalidated on logout
- [ ] Already logged-in users cannot access login/signup pages
- [ ] Reset password tokens expire after use
- [ ] Reset password tokens expire after time limit (e.g. 1 hour)
- [ ] Weak passwords are rejected on signup and password reset

---

## 2. Input Validation

- [ ] All form inputs are validated on the server side
- [ ] Email fields reject invalid email formats
- [ ] File upload only accepts allowed file types
- [ ] File upload enforces maximum file size
- [ ] No XSS possible via input fields (scripts not executed)
- [ ] URL fields reject non-URL input
- [ ] No SQL injection possible via any input field

---

## 3. Data Exposure

- [ ] No API keys or secrets visible in page source
- [ ] No credentials visible in JS files or network requests
- [ ] No internal paths or server info exposed in error messages
- [ ] WordPress version not exposed on learn.wdesignkit.com
- [ ] No sensitive user data exposed in client-side JS
- [ ] Error pages show generic messages — not stack traces

---

## 4. HTTPS & Headers

- [ ] HTTPS enforced across all 3 properties
- [ ] HTTP requests redirect to HTTPS (301)
- [ ] No mixed content (HTTP resources on HTTPS pages)
- [ ] X-Frame-Options header present (prevents clickjacking)
- [ ] X-Content-Type-Options: nosniff header present
- [ ] Content-Security-Policy header present
- [ ] Strict-Transport-Security (HSTS) header present

---

## 5. File Uploads

- [ ] Uploaded files are validated by type — not just extension
- [ ] Uploaded files cannot be executed as scripts
- [ ] Oversized files are rejected with a clear error message
- [ ] Malicious file names are sanitized

---

## 6. API & Network

- [ ] All API endpoints require authentication where expected
- [ ] Unauthenticated requests to protected endpoints return 401/403
- [ ] No sensitive data returned in API responses unnecessarily
- [ ] CORS policy is correctly configured

---

## Sign-Off

| Reviewer | Date | Status |
|---|---|---|
| | | ☐ Approved / ☐ Issues Found |