import type { Locator, Page } from '@playwright/test';

export class InventoryPage {
  readonly title: Locator;
  readonly items: Locator;
  readonly cartBadge: Locator;

  constructor(private readonly page: Page) {
    this.title = page.locator('[data-test="title"]');
    this.items = page.locator('[data-test="inventory-item"]');
    this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
  }

  async addToCart(productName: string): Promise<void> {
    // Scopes the action to the product's own card.
    const card = this.items.filter({ has: this.page.getByText(productName, { exact: true }) });
    await card.getByRole('button', { name: 'Add to cart' }).click();
  }

  async openCart(): Promise<void> {
    // The cart icon's accessible name changes with its contents ("Cart, empty", "Cart, 1 items").
    await this.page.getByRole('button', { name: /^Cart,/ }).click();
  }
}
