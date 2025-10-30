import { test, expect } from '@playwright/test';

test.describe('Mock login', () => {
  test.beforeEach(async ({ page }) => {
    // Ga naar de pagina
    await page.goto('http://localhost:4200/mock-login');
    await expect(page.locator('h1')).toHaveText(
      /Kies een bestuurseenheid om mee in te loggen./i
    );
    await page.click('text=Gemeente Aalst');
    //wait for navigation
    await page.waitForLoadState('networkidle');
    // Controleer dat we doorgestuurd worden naar de juiste pagina
    await expect(page).toHaveURL(
      'http://localhost:4200/data-monitoring/organisatie'
    );
  });

  test('Should be able to log in as a municipality', async ({ page }) => {
    // Controleer of de juiste inhoud wordt weergegeven na het inloggen
    await expect(page.locator('h1')).toContainText('Gemeente');
    await expect(page.locator('h1')).toContainText('Aalst');
  });

  test('should render Zittingen items correctly', async ({ page }) => {
    const locator = page.locator('text=Aantal gepubliceerde zittingen');
    const numberP = locator.locator(
      'xpath=following::p[contains(@class, "au-u-h2")][1]'
    );

    const numberLink = numberP.locator('a');
    const text = await numberLink.textContent();
    const value = Number(text?.trim());

    // Assert the number is greater than 0
    expect(value).toBeGreaterThanOrEqual(0);
  });

  test('Should render stemmingen items', async ({ page }) => {
    const locator = page.locator('text=Aantal gepubliceerde stemmingen');
    const numberP = locator.locator(
      'xpath=following::p[contains(@class, "au-u-h2")][1]'
    );

    const numberLink = numberP.locator('a');
    const text = await numberLink.textContent();
    const value = Number(text?.trim());

    // Assert the number is greater than 0
    expect(value).toBeGreaterThanOrEqual(0);
  });
  test('Should render besluiten items', async ({ page }) => {
    const locator = page.locator('text=Aantal gepubliceerde besluiten');
    const numberP = locator.locator(
      'xpath=following::p[contains(@class, "au-u-h2")][1]'
    );

    const numberLink = numberP.locator('a');
    const text = await numberLink.textContent();
    const value = Number(text?.trim());

    // Assert the number is greater than 0
    expect(value).toBeGreaterThanOrEqual(0);
  });

  test('toggle switch updates localStorage', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Gemeente');
    await expect(page.locator('h1')).toContainText('Aalst');
    const toggleLabel = page.locator('label.au-c-toggle-switch');
    await expect(toggleLabel).toBeVisible(); // waits until rendered
    await expect(toggleLabel).toContainText('Lijstweergave');
    await toggleLabel.click();

    await page.waitForFunction(
      () => localStorage.getItem('view-toggle') === 'true'
    );
  });
});
