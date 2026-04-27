# Code Quality Checklist
> Verify code standards, test coverage, and release readiness before tagging a release.

---

## Automated Linting & Analysis

- [ ] `bash scripts/gauntlet.sh --plugin /path/to/plugin` — zero failures
- [ ] PHP lint: zero syntax errors in all `.php` files (`php -l`)
- [ ] PHPCS: zero `ERROR` level violations against WordPress Coding Standards
- [ ] PHPStan: no level-5 type errors
- [ ] ESLint: zero errors in all `.js` / `.jsx` / `.ts` / `.tsx` files
- [ ] Stylelint: zero errors in all `.css` / `.scss` files (if applicable)

---

## Code Hygiene

- [ ] No commented-out dead code committed
- [ ] No `console.log()`, `var_dump()`, `print_r()`, or `error_log()` left in production code
- [ ] No `TODO` or `FIXME` comments without a linked issue
- [ ] No hardcoded credentials, API keys, or environment-specific values in source
- [ ] No magic numbers — constants or named variables used for meaningful values
- [ ] No unused imports or variables

---

## WordPress Standards

- [ ] No use of deprecated WordPress functions
- [ ] All database queries use `$wpdb->prepare()` — no raw interpolation
- [ ] All REST endpoints have `permission_callback`
- [ ] Hooks (actions/filters) follow `plugin-name_hook_name` naming convention
- [ ] No direct file inclusion without `ABSPATH` check
- [ ] Text domain matches the plugin slug and is applied to all translatable strings

---

## Versioning

- [ ] Version number updated in the plugin file header
- [ ] Version constant updated (e.g. `PLUGIN_NAME_VERSION`)
- [ ] `readme.txt` Stable tag updated to match the new version
- [ ] `CHANGELOG` updated with `## [X.Y.Z] - YYYY-MM-DD` section
- [ ] All 3 version locations are in sync

---

## Tests

- [ ] Playwright E2E suite: 0 failing tests (`npx playwright test`)
- [ ] PHP unit tests pass: 0 failures (if applicable)
- [ ] New features have E2E or unit test coverage for the critical path
- [ ] Tests are not skipped without a documented reason
- [ ] No test-only code merged to production (test fixtures, mock data)

---

## Pull Request Standards

- [ ] PR targets the correct base branch (`main` / `develop`)
- [ ] PR title is clear and follows the project convention
- [ ] No unrelated/accidental file changes included in the diff
- [ ] No merge conflicts left unresolved
- [ ] PR has been reviewed and approved by at least one other developer
- [ ] Branch name follows convention: `release/vX.Y.Z` or `feature/description`

---

## Build & Deployment

- [ ] GitHub Actions: all CI checks are green
- [ ] Plugin zip root folder matches the plugin slug
- [ ] Plugin zip tested: fresh install → activate → smoke test
- [ ] No dev dependencies included in the production build
- [ ] Assets are minified and sourcemaps are excluded from the zip

---

## Sign-Off

| Reviewer | Date | Status |
|---|---|---|
| | | ☐ Pass / ☐ Fail |
