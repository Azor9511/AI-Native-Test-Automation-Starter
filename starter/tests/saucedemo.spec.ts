import { test, expect, type Page } from '@playwright/test';

interface Credentials {
  username: string;
  password: string;
}

// Public demo credentials, published on the SauceDemo login page.
const standardUser: Credentials = {
  username: 'standard_user',
  password: 'secret_sauce',
};

async function logIn(page: Page, { username, password }: Credentials): Promise<void> {
  await page.getByPlaceholder('Username').fill(username);
  await page.getByPlaceholder('Password').fill(password);
  await page.getByRole('button', { name: 'Login' }).click();
}

test('standard user can log in and see the product catalog', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');

  await logIn(page, standardUser);

  // Expects to land on the inventory page with the catalog rendered.
  await expect(page).toHaveURL(/\/inventory\.html$/);
  await expect(page.locator('[data-test="title"]')).toHaveText('Products');
  await expect(page.locator('[data-test="inventory-item"]')).toHaveCount(6);
});
