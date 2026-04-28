#!/bin/sh
# =============================================================================
# WDesignKit QA — WordPress Auto-Setup via WP-CLI
# Runs once inside the wpcli container on first `docker compose up`
# =============================================================================

set -e

WP_PATH="/var/www/html"
MAX_WAIT=90
WAITED=0

echo ""
echo "========================================="
echo " WDesignKit QA — WordPress Setup"
echo "========================================="

# ── Wait for WordPress files to be ready ─────────────────────────────────────
echo "Waiting for WordPress files..."
until [ -f "$WP_PATH/wp-login.php" ]; do
  sleep 3
  WAITED=$((WAITED + 3))
  if [ $WAITED -ge $MAX_WAIT ]; then
    echo "ERROR: WordPress files not ready after ${MAX_WAIT}s. Exiting."
    exit 1
  fi
done
echo "WordPress files ready."

# ── Wait for DB connection (via PHP since wp-config may not exist yet) ────────
echo "Waiting for database..."
until php -r "
  \$conn = @mysqli_connect('db', 'wpuser', 'wppassword', 'wordpress');
  if (\$conn) { mysqli_close(\$conn); exit(0); } exit(1);
" > /dev/null 2>&1; do
  sleep 3
  WAITED=$((WAITED + 3))
  echo "  ... ${WAITED}s"
  if [ $WAITED -ge $MAX_WAIT ]; then
    echo "ERROR: DB not ready after ${MAX_WAIT}s. Exiting."
    exit 1
  fi
done
echo "Database ready."

# ── Install WordPress (skip if already installed) ────────────────────────────
if wp core is-installed --path="$WP_PATH" --allow-root > /dev/null 2>&1; then
  echo "WordPress already installed — skipping core install."
else
  echo "Installing WordPress..."
  wp core install \
    --path="$WP_PATH" \
    --url="${WP_SITE_URL:-http://localhost:8881}" \
    --title="${WP_SITE_TITLE:-WDesignKit QA}" \
    --admin_user="${WP_ADMIN_USER:-admin}" \
    --admin_password="${WP_ADMIN_PASS:-admin@123}" \
    --admin_email="${WP_ADMIN_EMAIL:-admin@wdesignkit.local}" \
    --skip-email \
    --allow-root
  echo "WordPress installed."
fi

# ── Update site URL (handles port changes) ───────────────────────────────────
wp option update siteurl "${WP_SITE_URL:-http://localhost:8881}" --path="$WP_PATH" --allow-root
wp option update home    "${WP_SITE_URL:-http://localhost:8881}" --path="$WP_PATH" --allow-root

# ── Activate WDesignKit plugin ───────────────────────────────────────────────
PLUGIN_DIR="$WP_PATH/wp-content/plugins/wdesignkit"
if [ -d "$PLUGIN_DIR" ]; then
  echo "Activating WDesignKit plugin..."
  wp plugin activate wdesignkit --path="$WP_PATH" --allow-root && echo "WDesignKit plugin activated." || echo "WARNING: Plugin activation failed — check plugin files."
else
  echo "WARNING: Plugin folder not found at $PLUGIN_DIR"
  echo "Run: bash docker/install-plugin.sh /path/to/wdesignkit.x.x.x.zip"
fi

# ── Create subscriber test user ──────────────────────────────────────────────
if wp user get subscriber --path="$WP_PATH" --allow-root > /dev/null 2>&1; then
  echo "Subscriber user already exists."
else
  echo "Creating subscriber test user..."
  wp user create subscriber subscriber@wdesignkit.local \
    --role=subscriber \
    --user_pass=subscriber@123 \
    --path="$WP_PATH" \
    --allow-root
  echo "Subscriber created (subscriber / subscriber@123)."
fi

# ── Create test pages for Elementor & Gutenberg ──────────────────────────────
PAGE_COUNT=$(wp post list --post_type=page --path="$WP_PATH" --allow-root --format=count 2>/dev/null || echo "0")
if [ "$PAGE_COUNT" -lt "3" ]; then
  echo "Creating test pages..."
  wp post create \
    --post_type=page \
    --post_title="Elementor Test Page" \
    --post_status=publish \
    --post_content="Elementor test page for WDesignKit plugin QA." \
    --path="$WP_PATH" \
    --allow-root
  wp post create \
    --post_type=page \
    --post_title="Gutenberg Test Page" \
    --post_status=publish \
    --post_content="<!-- wp:paragraph --><p>Gutenberg test page for WDesignKit plugin QA.</p><!-- /wp:paragraph -->" \
    --path="$WP_PATH" \
    --allow-root
  echo "Test pages created."
fi

# ── Set permalinks ────────────────────────────────────────────────────────────
wp rewrite structure '/%postname%/' --path="$WP_PATH" --allow-root
wp rewrite flush --path="$WP_PATH" --allow-root

# ── Disable unnecessary admin notices ────────────────────────────────────────
wp option update show_on_front page --path="$WP_PATH" --allow-root > /dev/null 2>&1 || true

echo ""
echo "========================================="
echo " Setup complete!"
SITE="${WP_SITE_URL:-http://localhost:8881}"
USER="${WP_ADMIN_USER:-admin}"
PASS="${WP_ADMIN_PASS:-admin@123}"
echo " WP Admin : $SITE/wp-admin"
echo " User     : $USER"
echo " Pass     : $PASS"
echo "========================================="
echo ""
