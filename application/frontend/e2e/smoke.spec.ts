import { test, expect } from '@playwright/test';

const MOCK_OFFICER_SESSION = {
  id: 'usr_offi_smoke_test',
  name: 'Ramesh Chandra',
  email: 'ramesh@nhai.gov.in',
  organization: 'National Highways Authority of India',
  role: 'OFFICER',
  ministry: 'Ministry of Road Transport & Highways',
  createdAt: '2026-01-01T00:00:00.000Z',
};

test.describe('Frontend Baseline Smoke Suite', () => {
  test('1. Landing Page renders header and gateway access', async ({ page }) => {
    await page.goto('/');

    // Check Landing Page Header / Wordmark
    await expect(page.getByText(/ManakAI/i).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: /Zero-Defect Public Procurement/i })).toBeVisible();

    // Check Gateway Action Buttons
    const officerGatewayBtn = page.getByRole('button', { name: /Tender Authority & Officer Gateway/i });
    await expect(officerGatewayBtn).toBeVisible();
  });

  test('2. Authenticated Workspace mounting & Sidebar navigation', async ({ page }) => {
    // Inject officer session so page loads workspace
    await page.addInitScript((session) => {
      localStorage.setItem('manakai_user_session', JSON.stringify(session));
    }, MOCK_OFFICER_SESSION);

    await page.goto('/app/projects');

    // Sidebar navigation (aside element) visible
    const sidebar = page.getByRole('complementary');
    await expect(sidebar).toBeVisible();

    // Test sidebar collapse and expand
    const collapseBtn = page.getByRole('button', { name: /Collapse sidebar/i });
    await expect(collapseBtn).toBeVisible();
    await collapseBtn.click();

    // Verify collapsed state and top expand button presence
    const expandBtn = page.getByRole('button', { name: /Expand sidebar/i }).first();
    await expect(expandBtn).toBeVisible();
    await expandBtn.click();

    // Verify sidebar expanded back
    await expect(collapseBtn).toBeVisible();

    // Projects view should be present
    await expect(page.getByText(/Projects & Tenders/i).first()).toBeVisible();

    // Switch to Standards Explorer
    const explorerBtn = page.getByRole('button', { name: /Standards Explorer/i }).first();
    await expect(explorerBtn).toBeVisible();
    await explorerBtn.click();

    // Verify search or query stage rendered
    await expect(page.getByText(/Standards Explorer/i).first()).toBeVisible();
  });

  test('3. Command Palette opens and closes with trigger button and Escape', async ({ page }) => {
    await page.addInitScript((session) => {
      localStorage.setItem('manakai_user_session', JSON.stringify(session));
    }, MOCK_OFFICER_SESSION);

    await page.goto('/app/projects');
    await expect(page.getByText(/Projects & Tenders/i).first()).toBeVisible();

    // Trigger Command Palette via header search button
    const cmdTrigger = page.getByTitle(/Quick find standards and tools/i);
    await expect(cmdTrigger).toBeVisible();
    await cmdTrigger.click();

    // Verify modal input is visible
    const paletteInput = page.getByPlaceholder(/Type a command, standard/i);
    await expect(paletteInput).toBeVisible();

    // Close with Escape
    await page.keyboard.press('Escape');
    await expect(paletteInput).not.toBeVisible();
  });

  test('4. Theme switcher toggles theme tokens', async ({ page }) => {
    await page.goto('/');

    const themeButton = page.locator('button.theme-switcher-btn').first();
    await expect(themeButton).toBeVisible();

    const initialTitle = await themeButton.getAttribute('title');
    await themeButton.click();

    // Verify theme toggle updated state
    const newTitle = await themeButton.getAttribute('title');
    expect(newTitle).not.toBe(initialTitle);
  });

  test('5. Authority Drawer opens and closes inside workspace', async ({ page }) => {
    await page.addInitScript((session) => {
      localStorage.setItem('manakai_user_session', JSON.stringify(session));
    }, MOCK_OFFICER_SESSION);

    await page.goto('/app/projects');

    // Find and click the Authority AI Assistant trigger button in workspace
    const authorityTrigger = page.getByTitle(/Open BIS Authority AI Assistant/i).first();
    await expect(authorityTrigger).toBeVisible();
    await authorityTrigger.click();

    // Verify Authority Drawer title is visible
    const drawerTitle = page.getByText(/BIS Authority & Legal Assistant/i);
    await expect(drawerTitle).toBeVisible();

    // Close the drawer using Escape
    await page.keyboard.press('Escape');
  });

  test('6. Baseline Screenshot Capture (Landing & Workspace in Light and Dark)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    // 1. Landing Page (Light)
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'e2e/screenshots/baseline-landing-light.png', fullPage: true });

    // 2. Landing Page (Dark)
    const themeBtn = page.locator('button.theme-switcher-btn').first();
    if (await themeBtn.isVisible()) {
      await themeBtn.click();
      await page.waitForTimeout(300);
      await page.screenshot({ path: 'e2e/screenshots/baseline-landing-dark.png', fullPage: true });
    }

    // 3. Workspace Projects (Light)
    await page.addInitScript((session) => {
      localStorage.setItem('manakai_user_session', JSON.stringify(session));
    }, MOCK_OFFICER_SESSION);

    await page.goto('/app/projects');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'e2e/screenshots/baseline-workspace-projects-light.png', fullPage: true });

    // 4. Workspace Standards Explorer (Light)
    const explorerBtn = page.getByRole('button', { name: /Standards Explorer/i }).first();
    if (await explorerBtn.isVisible()) {
      await explorerBtn.click();
      await page.waitForTimeout(300);
      await page.screenshot({ path: 'e2e/screenshots/baseline-workspace-explorer-light.png', fullPage: true });
    }

    // 5. Workspace Standards Explorer (Dark)
    const wsThemeBtn = page.locator('button.theme-switcher-btn').first();
    if (await wsThemeBtn.isVisible()) {
      await wsThemeBtn.click();
      await page.waitForTimeout(300);
      await page.screenshot({ path: 'e2e/screenshots/baseline-workspace-explorer-dark.png', fullPage: true });
    }
  });
});
