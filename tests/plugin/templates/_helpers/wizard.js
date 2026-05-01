// =============================================================================
// WDesignKit Templates Suite — Import Wizard Helpers
// Version: 3.1.0 — Deep inside-flow navigation + bug fixes
// =============================================================================

async function fillBusinessName(page, name) {
  const nameInput = page.locator('input.wkit-site-name-inp');
  const visible = await nameInput.isVisible({ timeout: 10000 }).catch(() => false);
  if (visible) {
    await nameInput.fill(name);
    await page.waitForTimeout(400);
    return true;
  }
  return false;
}

/**
 * Navigate to the global_data panel (Step 1, panel 2).
 * Fills business name → clicks Next once → lands on global_data if template
 * has global colors/typography; otherwise lands on Feature step.
 */
async function reachGlobalDataPanel(page) {
  const nameInput = page.locator('input.wkit-site-name-inp');
  if (await nameInput.isVisible({ timeout: 12000 }).catch(() => false)) {
    await nameInput.fill('QA Global Data Test');
    await page.waitForTimeout(400);
  }
  const nextBtn = page.locator('button.wkit-next-btn.wkit-btn-class');
  if (await nextBtn.isEnabled({ timeout: 8000 }).catch(() => false)) {
    await nextBtn.click();
    await page.waitForTimeout(2500);
  }
  // Returns regardless — caller checks which panel we ended up on
}

/**
 * Fully navigate to the Feature step (Step 2).
 * Handles both templates with and without a global_data panel.
 * site_info → [global_data?] → Feature
 */
async function reachFeatureStep(page) {
  // Fill business name
  const nameInput = page.locator('input.wkit-site-name-inp');
  if (await nameInput.isVisible({ timeout: 12000 }).catch(() => false)) {
    await nameInput.fill('QA Feature Test');
    await page.waitForTimeout(400);
  }

  // First Next click — goes to global_data or Feature
  const nextBtn = page.locator('button.wkit-next-btn.wkit-btn-class');
  if (await nextBtn.isEnabled({ timeout: 8000 }).catch(() => false)) {
    await nextBtn.click();
    await page.waitForTimeout(2500);
  }

  // If still not on Feature step (global_data panel appeared), click Next again
  const featureStep = page.locator('.wkit-import-temp-feature');
  const onFeature = await featureStep.isVisible({ timeout: 3000 }).catch(() => false);
  if (!onFeature) {
    if (await nextBtn.isEnabled({ timeout: 6000 }).catch(() => false)) {
      await nextBtn.click();
      await page.waitForTimeout(2500);
    }
  }
}

async function acceptTandC(page) {
  const checkbox = page.locator('#wkit-plugin-confirmation-id');
  const checked = await checkbox.isChecked().catch(() => false);
  if (!checked) {
    // Prefer clicking the label — clicking the note text doesn't toggle the checkbox
    const label = page.locator('label[for="wkit-plugin-confirmation-id"]');
    const labelVisible = await label.isVisible({ timeout: 5000 }).catch(() => false);
    if (labelVisible) {
      await label.click({ force: true });
    } else {
      // Fallback 1: click the note area
      const note = page.locator('.wkit-site-feature-note');
      const noteVisible = await note.isVisible({ timeout: 3000 }).catch(() => false);
      if (noteVisible) await note.click({ force: true });
      else {
        // Fallback 2: direct checkbox click
        await checkbox.click({ force: true }).catch(() => {});
      }
    }
    await page.waitForTimeout(300);
    // Verify the checkbox is now checked; force via JS if still not
    const nowChecked = await checkbox.isChecked().catch(() => false);
    if (!nowChecked) {
      await checkbox.evaluate(el => {
        el.checked = true;
        el.dispatchEvent(new Event('change', { bubbles: true }));
        el.dispatchEvent(new Event('input',  { bubbles: true }));
      }).catch(() => {});
      await page.waitForTimeout(200);
    }
  }
}

async function acceptTermsAndConditions(page) {
  return acceptTandC(page);
}

async function reachMethodStep(page) {
  await reachFeatureStep(page);
  const feature = page.locator('.wkit-import-temp-feature');
  const featureVisible = await feature.isVisible({ timeout: 15000 }).catch(() => false);
  if (featureVisible) {
    await acceptTandC(page);
    await page.waitForTimeout(300);
    const featureNext = page.locator('button.wkit-site-feature-next.wkit-btn-class');
    if (await featureNext.isEnabled({ timeout: 5000 }).catch(() => false)) {
      await featureNext.click();
      await page.waitForTimeout(2500);
    }
  }
}

/**
 * Selects a method card (dummy = 0, ai = 1).
 * Returns true if the card was found and clicked, false otherwise.
 */
async function selectMethodCard(page, type) {
  const idx = type === 'ai' ? 1 : 0;
  const count = await page.locator('.wkit-method-card').count().catch(() => 0);
  if (count === 0 || count <= idx) return false;
  const card = page.locator('.wkit-method-card').nth(idx);
  // AI card may be pointer-events:none when not available
  if (type === 'ai') {
    const pe = await card.evaluate(el => getComputedStyle(el).pointerEvents).catch(() => 'none');
    if (pe === 'none') return false;
  }
  await card.click({ force: true });
  await page.waitForTimeout(500);
  return true;
}

/**
 * Navigate to the AI content_media step (Step 4).
 * Requires that the AI card is accessible (ai_compatible template + authenticated user).
 */
async function reachAIContentStep(page) {
  await reachMethodStep(page);
  const methodMain = page.locator('.wkit-import-method-main');
  const onMethod = await methodMain.isVisible({ timeout: 12000 }).catch(() => false);
  if (!onMethod) return false;

  // Select AI card if it is accessible
  const aiCard = page.locator('.wkit-method-card').nth(1);
  if ((await aiCard.count()) > 0) {
    const pe = await aiCard.evaluate(el => getComputedStyle(el).pointerEvents).catch(() => 'none');
    if (pe === 'none') return false; // AI not available
    await aiCard.click({ force: true });
    await page.waitForTimeout(500);
  }

  const nextBtn = page.locator('button.wkit-import-method-next.wkit-btn-class');
  if (await nextBtn.isEnabled({ timeout: 6000 }).catch(() => false)) {
    await nextBtn.click();
    await page.waitForTimeout(3000);
    return true;
  }
  return false;
}

async function completeDummyImport(page) {
  // Use reachMethodStep so acceptTandC + feature Next are handled consistently
  await reachMethodStep(page);
  await selectMethodCard(page, 'dummy');
  const methodNext = page.locator('button.wkit-import-method-next.wkit-btn-class');
  if (await methodNext.isEnabled({ timeout: 5000 }).catch(() => false)) {
    await methodNext.click();
    await page.waitForTimeout(3000);
  }
}

async function completeAIImport(page) {
  // Use reachMethodStep so acceptTandC + feature Next are handled consistently
  await reachMethodStep(page);
  const selected = await selectMethodCard(page, 'ai');
  if (!selected) return false; // AI not available for this template
  const methodNext = page.locator('button.wkit-import-method-next.wkit-btn-class');
  if (await methodNext.isEnabled({ timeout: 5000 }).catch(() => false)) {
    await methodNext.click();
    await page.waitForTimeout(3000);
    return true;
  }
  return false;
}

module.exports = {
  fillBusinessName,
  reachGlobalDataPanel,
  reachFeatureStep,
  reachMethodStep,
  reachAIContentStep,
  acceptTandC,
  acceptTermsAndConditions,
  selectMethodCard,
  completeDummyImport,
  completeAIImport,
};
