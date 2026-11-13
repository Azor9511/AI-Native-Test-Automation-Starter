import { test, expect } from '@playwright/test';
import { ProductsApi } from '../../api/products-api';
import { productId, type Product } from '../../test-data/products';

test('GET /products/{id} returns the requested product', async ({ request }) => {
  const productsApi = new ProductsApi(request);

  const response = await productsApi.getProduct(productId);

  // Protocol and representation.
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('application/json');

  // Identity: the resource we asked for, not another one.
  const product = (await response.json()) as Product;
  expect(product.id).toBe(productId);

  // Contract: fields consumers rely on exist with the right runtime types.
  expect(typeof product.title).toBe('string');
  expect(product.title).not.toBe('');
  expect(typeof product.category).toBe('string');
  expect(product.category).not.toBe('');
  expect(typeof product.price).toBe('number');
  expect(typeof product.stock).toBe('number');

  // Business-relevant data.
  expect(product.price).toBeGreaterThan(0);
  expect(product.stock).toBeGreaterThanOrEqual(0);
});
