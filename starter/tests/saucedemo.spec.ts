import { test, expect } from '@playwright/test';

test('standard user can log in and see the product catalog', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');

  // Public demo credentials, published on the SauceDemo login page.
  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');
  await page.getByRole('button', { name: 'Login' }).click();

  // Expects to land on the inventory page with the catalog rendered.
  await expect(page).toHaveURL(/\/inventory\.html$/);
  await expect(page.locator('[data-test="title"]')).toHaveText('Products');
  await expect(page.locator('[data-test="inventory-item"]')).toHaveCount(6);
});
