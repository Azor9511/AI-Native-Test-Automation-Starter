import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login-page';
import { InventoryPage } from '../../pages/inventory-page';
import { standardUser } from '../../test-data/users';

test('standard user can log in and see the product catalog', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const inventoryPage = new InventoryPage(page);

  await loginPage.goto();
  await loginPage.logIn(standardUser);

  // Expects to land on the inventory page with the catalog rendered.
  await expect(page).toHaveURL(/\/inventory\.html$/);
  await expect(inventoryPage.title).toHaveText('Products');
  await expect(inventoryPage.items).toHaveCount(6);
});

test('standard user can add Sauce Labs Backpack to the cart', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const inventoryPage = new InventoryPage(page);

  await loginPage.goto();
  await loginPage.logIn(standardUser);

  await inventoryPage.addToCart('Sauce Labs Backpack');

  // Expects the cart badge to count the added product.
  await expect(inventoryPage.cartBadge).toHaveText('1');

  await inventoryPage.openCart();

  // Expects the cart to contain exactly the backpack.
  await expect(page).toHaveURL(/\/cart\.html$/);
  const cartItems = page.locator('[data-test="inventory-item"]');
  await expect(cartItems).toHaveCount(1);
  await expect(cartItems.locator('[data-test="inventory-item-name"]')).toHaveText('Sauce Labs Backpack');
});
