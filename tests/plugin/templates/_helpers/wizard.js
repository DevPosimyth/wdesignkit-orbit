// =============================================================================
// WDesignKit Templates Suite — Import Wizard Helpers
// Shared wizard step helpers extracted from template-import.spec.js
// =============================================================================

async function fillBusinessName(page, name) {
  const nameInput = page.locator('.wkit-site-name-inp');
  const visible = await nameInput.isVisible({ timeout: 10000 }).catch(() => false);
  if (visible) {
    await nameInput.fill(name);
    await page.waitForTimeout(400);
    return true;
  }
  return false;
}

async function reachFeatureStep(page) {
  const nameInput = page.locator('.wkit-site-name-inp');
  const nameVisible = await nameInput.isVisible({ timeout: 10000 }).catch(() => false);
  if (nameVisible) {
    await nameInput.fill('QA Feature Test');
    await page.waitForTimeout(400);
  }
  const nextBtn = page.locator('button.wkit-next-btn.wkit-btn-class');
  const nextEnabled = await nextBtn.isEnabled({ timeout: 8000 }).catch(() => false);
  if (nextEnabled) {
    await nextBtn.click();
    await page.waitForTimeout(2500);
  }
}

async function acceptTandC(page) {
  const checkbox = page.locator('#wkit-plugin-confirmation-id');
  const checked = await checkbox.isChecked().catch(() => false);
  if (!checked) {
    const note = page.locator('.wkit-site-feature-note');
    const noteVisible = await note.isVisible({ timeout: 5000 }).catch(() => false);
    if (noteVisible) await note.click();
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
    await page.locator('button.wkit-site-feature-next.wkit-btn-class').click();
    await page.waitForTimeout(2500);
  }
}

async function selectMethodCard(page, type) {
  // type: 'dummy' (first card) or 'ai' (second card)
  const idx = type === 'ai' ? 1 : 0;
  const card = page.locator('.wkit-method-card').nth(idx);
  if ((await card.count()) > 0) {
    await card.click({ force: true });
    await page.waitForTimeout(500);
  }
}

async function completeDummyImport(page) {
  // Step 1 — fill name
  const nameInput = page.locator('.wkit-site-name-inp');
  if ((await nameInput.count()) > 0) {
    await nameInput.fill('QA Dummy Import');
    await page.waitForTimeout(300);
  }
  const step1Next = page.locator('button.wkit-next-btn.wkit-btn-class');
  if ((await step1Next.count()) > 0 && await step1Next.isEnabled()) {
    await step1Next.click();
    await page.waitForTimeout(2500);
  }
  // Step 2 — accept T&C and continue
  await acceptTandC(page);
  await page.waitForTimeout(300);
  const featureNext = page.locator('button.wkit-site-feature-next.wkit-btn-class');
  if ((await featureNext.count()) > 0 && await featureNext.isEnabled()) {
    await featureNext.click();
    await page.waitForTimeout(2500);
  }
  // Step 3 — select Dummy and click Import
  await selectMethodCard(page, 'dummy');
  const methodNext = page.locator('button.wkit-import-method-next.wkit-btn-class');
  if ((await methodNext.count()) > 0) {
    await methodNext.click();
    await page.waitForTimeout(3000);
  }
}

async function completeAIImport(page) {
  // Step 1 — fill name
  const nameInput = page.locator('.wkit-site-name-inp');
  if ((await nameInput.count()) > 0) {
    await nameInput.fill('QA AI Import');
    await page.waitForTimeout(300);
  }
  const step1Next = page.locator('button.wkit-next-btn.wkit-btn-class');
  if ((await step1Next.count()) > 0 && await step1Next.isEnabled()) {
    await step1Next.click();
    await page.waitForTimeout(2500);
  }
  // Step 2 — accept T&C and continue
  await acceptTandC(page);
  await page.waitForTimeout(300);
  const featureNext = page.locator('button.wkit-site-feature-next.wkit-btn-class');
  if ((await featureNext.count()) > 0 && await featureNext.isEnabled()) {
    await featureNext.click();
    await page.waitForTimeout(2500);
  }
  // Step 3 — select AI card
  await selectMethodCard(page, 'ai');
  const methodNext = page.locator('button.wkit-import-method-next.wkit-btn-class');
  if ((await methodNext.count()) > 0 && await methodNext.isEnabled()) {
    await methodNext.click();
    await page.waitForTimeout(3000);
  }
}

module.exports = {
  fillBusinessName,
  reachFeatureStep,
  reachMethodStep,
  acceptTandC,
  acceptTermsAndConditions,
  selectMethodCard,
  completeDummyImport,
  completeAIImport,
};
