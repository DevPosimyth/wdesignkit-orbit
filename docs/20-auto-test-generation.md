# Auto Test Generation — How Orbit Reads WDesignKit

> Orbit can point at the WDesignKit source and generate:
>   - A starter `qa.config.json` prefilled with every entry point
>   - A 50-scenario `qa-scenarios.md` test plan
>   - A draft Playwright smoke spec
>   - (With `--deep`) AI-written business-logic scenarios

---

## The Command

```bash
bash scripts/scaffold-tests.sh /path/to/wdesignkit [--deep]
```

- **Without `--deep`:** pure grep + AST extraction. 5 seconds. Always safe.
- **With `--deep`:** invokes `/orbit-scaffold-tests` Claude skill to draft human-level scenarios. 2-5 min. Requires `claude` CLI.

---

## What Orbit Extracts (Mechanical)

| Entry Point | PHP Pattern | Why It Matters |
|---|---|---|
| Admin pages | `add_menu_page`, `add_submenu_page`, `add_options_page` | Every `?page=wdesignkit-*` URL |
| Shortcodes | `add_shortcode('name', ...)` | Frontend output to test for XSS + attr handling |
| REST routes | `register_rest_route('wdesignkit/v1', ...)` | Auth + IDOR + schema targets |
| AJAX actions (auth) | `add_action('wp_ajax_wdk_foo', ...)` | Capability-check targets |
| AJAX actions (nopriv) | `add_action('wp_ajax_nopriv_wdk_foo', ...)` | Public attack surface |
| Cron hooks | `wp_schedule_event(..., 'wdk_hook')` | Activation/deactivation lifecycle |
| Gutenberg blocks | `block.json` files | Block deprecation + render path checks |
| Custom post types | `register_post_type(...)` | Archive URLs, capability mapping |
| Custom DB tables | `$wpdb->prefix . 'wdk_*'` | Uninstall cleanup targets |
| Elementor usage | `Elementor\Widget_Base` references | Triggers Elementor-specific project |
| Gutenberg usage | `registerBlockType` references | Triggers block testing |
| Bricks usage | `Bricks\Element` references | Triggers Bricks-specific project |

---

## Generated Output

### `scaffold-out/wdesignkit/qa.config.json`

```json
{
  "plugin": {
    "name": "wdesignkit",
    "slug": "wdesignkit",
    "type": "cross-builder-toolkit",
    "prefix": "wdk",
    "text_domain": "wdesignkit",
    "admin_slug": "wdesignkit",
    "admin_slugs": ["wdesignkit", "wdesignkit-widgets", "wdesignkit-cloud"],
    "rest_routes": ["wdesignkit/v1", "wdesignkit/v1/widgets", "wdesignkit/v1/cloud"],
    "ajax_actions": {
      "authenticated": ["wdk_save_widget", "wdk_sync_cloud"],
      "unauthenticated": []
    },
    "cron_hooks": ["wdk_cloud_sync", "wdk_cleanup_tmp"],
    "custom_tables": ["wdk_widgets", "wdk_widget_meta"],
    "supported_builders": ["elementor", "gutenberg", "bricks"]
  }
}
```

### `scaffold-out/wdesignkit/qa-scenarios.md`

Structured test plan covering:
- **Smoke** (S-01 to S-03): activation, deactivation, uninstall
- **Admin pages** (A-10+): one per detected admin page
- **REST** (R-30+): auth behavior across roles
- **AJAX** (AJ-40+): auth vs nopriv coverage
- **Cron** (C-50+): registration/removal lifecycle
- **Blocks** (B-60+): insert → save → reload without validation errors
- **Builder integration** (BI-70+): per-builder widget conversion paths
- **Cross-cutting**: memory, a11y, RTL, conflict matrix, uninstall cleanup

Typical output: 40-80 scenarios for WDesignKit.

### Starter Playwright spec

`tests/wdesignkit/scaffold-smoke.spec.js` — minimal spec showing Orbit's helper patterns
(`attachConsoleErrorGuard`, `assertPageReady`) so you can copy the pattern for real tests.

### (With `--deep`) AI Scenarios

`scaffold-out/wdesignkit/ai-scenarios.md` includes:
- One-paragraph plain-English description of what WDesignKit does
- 3-7 core user flows (Who / Trigger / Success / Failure-modes)
- 15-30 business-logic scenarios specific to WDesignKit
- Edge cases mechanical scaffolder missed
- Playwright spec drafts with PLACEHOLDER markers
- Required fixtures
- file:line refs to the PHP code being tested

---

## What Orbit Can't Know From Code Alone

| Area | Why not | Fill the gap by |
|---|---|---|
| Primary admin page | Code registers all; humans decide primary | Edit `admin_slug` in qa.config.json |
| Widget preview output | Depends on fixtures + builder context | Write actual assertions in custom spec |
| Business rules (e.g. "Pro widget threshold") | Not discoverable from structure alone | Write business-logic specs |
| User intent | Lives in PRDs not code | You write the "why" of scenarios |
| Visual baseline | No reference of "correct" | First release: designer commits baselines |
| Cloud API contracts | Lives on API side | Mock with `page.route()` |

---

## Under the Hood

Grep-based, not PHP-AST:
- **Fast** (5s on 100k LOC)
- **Works on broken code**
- **No dependencies** beyond `grep` + `python3`

Tradeoff: dynamic registration like `foreach ($slugs as $slug) { add_menu_page(...) }` not resolved.

---

## Workflow Loop

```
1. scaffold-tests.sh wdesignkit
2. Review & edit qa.config.json + qa-scenarios.md
3. Write business-logic Playwright specs using helpers
4. gauntlet.sh --plugin wdesignkit --mode full
5. Review reports/index.html
6. New feature → re-run scaffold-tests → diff scenarios
```

---

## Related

- `docs/19-business-logic-guide.md` — writing WDesignKit-specific scenarios
- `docs/18-release-checklist.md` — what must pass before tagging
- `docs/02-configuration.md` — full qa.config.json reference
