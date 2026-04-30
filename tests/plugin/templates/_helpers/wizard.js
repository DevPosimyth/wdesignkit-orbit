// =============================================================================
// WDesignKit Templates Suite — Import Wizard Helpers
// Version: 3.0.0 — Deep inside-flow navigation
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
    const note = page.locator('.wkit-site-feature-note');
    const noteVisible = await note.isVisible({ timeout: 5000 }).catch(() => false);
    if (noteVisible) await note.click();
    await page.waitForTimeout(300);
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

async function selectMethodCard(page, type) {
  const idx = type === 'ai' ? 1 : 0;
  const card = page.locator('.wkit-method-card').nth(idx);
  if ((await card.count()) > 0) {
    await card.click({ force: true });
    await page.waitForTimeout(500);
  }
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
  await reachFeatureStep(page);
  await acceptTandC(page);
  await page.waitForTimeout(300);
  const featureNext = page.locator('button.wkit-site-feature-next.wkit-btn-class');
  if (await featureNext.isEnabled({ timeout: 5000 }).catch(() => false)) {
    await featureNext.click();
    await page.waitForTimeout(2500);
  }
  await selectMethodCard(page, 'dummy');
  const methodNext = page.locator('button.wkit-import-method-next.wkit-btn-class');
  if ((await methodNext.count()) > 0) {
    await methodNext.click();
    await page.waitForTimeout(3000);
  }
}

async function completeAIImport(page) {
  await reachFeatureStep(page);
  await acceptTandC(page);
  await page.waitForTimeout(300);
  const featureNext = page.locator('button.wkit-site-feature-next.wkit-btn-class');
  if (await featureNext.isEnabled({ timeout: 5000 }).catch(() => false)) {
    await featureNext.click();
    await page.waitForTimeout(2500);
  }
  await selectMethodCard(page, 'ai');
  const methodNext = page.locator('button.wkit-import-method-next.wkit-btn-class');
  if (await methodNext.isEnabled({ timeout: 5000 }).catch(() => false)) {
    await methodNext.click();
    await page.waitForTimeout(3000);
  }
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
