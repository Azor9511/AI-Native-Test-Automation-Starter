import { test, expect, type Page } from '@playwright/test';

// Fixture mínima de laboratorio: una página que hace un fetch REAL del navegador.
// page.setContent solo provee el HTML; NO simula ningún backend.
const productUrl = 'https://dummyjson.com/products/1';

const fixtureHtml = `
  <button id="load-product">Cargar producto</button>
  <p id="product-title"></p>
  <p id="error" role="alert"></p>
  <script>
    document.querySelector('#load-product').addEventListener('click', async () => {
      try {
        const response = await fetch('${productUrl}');
        if (!response.ok) throw new Error('HTTP ' + response.status);
        const product = await response.json();
        document.querySelector('#product-title').textContent = product.title;
      } catch (e) {
        document.querySelector('#error').textContent = 'Error al cargar el producto';
      }
    });
  </script>
`;

// Datos mock explícitos y distinguibles de la respuesta real de DummyJSON.
const productMock = { id: 1, title: 'Producto simulado para QA', price: 199 };

// Cabecera CORS: la fixture vive en about:blank, así que el fetch es cross-origin.
const corsHeaders = { 'access-control-allow-origin': '*' };

async function openFixture(page: Page) {
  await page.setContent(fixtureHtml);
}

test.describe('Mocking de tráfico del navegador con page.route', () => {
  test('muestra el producto desde una respuesta mock (200)', async ({ page }) => {
    const intercepted: string[] = [];

    // El handler se registra ANTES de la acción que dispara el fetch.
    await page.route(productUrl, async (route) => {
      intercepted.push(route.request().method());
      await route.fulfill({ status: 200, json: productMock, headers: corsHeaders });
    });

    await openFixture(page);
    await page.getByRole('button', { name: 'Cargar producto' }).click();

    // Efecto observable: la UI consumió el mock (auto-wait, sin esperas fijas).
    await expect(page.locator('#product-title')).toHaveText(productMock.title);
    // Prueba de interceptación: el handler recibió exactamente un GET.
    expect(intercepted).toEqual(['GET']);
  });

  test('muestra el estado de error ante un mock HTTP 500', async ({ page }) => {
    let interceptedCount = 0;

    await page.route(productUrl, async (route) => {
      interceptedCount += 1;
      await route.fulfill({
        status: 500,
        json: { message: 'Error simulado' },
        headers: corsHeaders,
      });
    });

    await openFixture(page);
    await page.getByRole('button', { name: 'Cargar producto' }).click();

    await expect(page.getByRole('alert')).toHaveText('Error al cargar el producto');
    await expect(page.locator('#product-title')).toBeEmpty();
    expect(interceptedCount).toBe(1);
  });
});
