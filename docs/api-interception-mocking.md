# Interceptación de API y mocking de respuestas (Playwright)

Guía del Increment #05B. Archivo de ejemplo real:
[starter/tests/mocking/product-browser-mock.spec.ts](../starter/tests/mocking/product-browser-mock.spec.ts).

## 1. Qué es

Playwright puede interceptar las solicitudes de red que emite **una página
del navegador** (`fetch`/XHR) y responder con datos simulados, sin que la
solicitud llegue al backend. Se usa `page.route()` (o `context.route()`) y
`route.fulfill()`.

## 2. Qué problema resuelve

Permite probar la UI con datos y estados controlados (producto específico,
error 500, respuesta vacía) sin depender de la disponibilidad ni de los datos
del backend para ese caso.

## 3. Qué NO valida

- El contrato real del backend (campos, tipos, status).
- Conectividad, autenticación ni integración end-to-end reales.

Un test con mock puede pasar con DummyJSON caído. Eso es precisamente lo que
hace al test determinista, y también lo que limita lo que prueba.

## 4. Diferencia con los tests de API reales

| | `APIRequestContext` (fixture `request`) | `page.route` / `context.route` |
|---|---|---|
| Quién emite la solicitud | El cliente API de Playwright | Una página del navegador |
| Llega al backend | Sí | No (la respuesta la fabrica el test) |
| Valida | El servicio y su contrato | La reacción de la UI a una respuesta |
| Ejemplo en el repo | [starter/tests/api/products.spec.ts](../starter/tests/api/products.spec.ts) | `starter/tests/mocking/product-browser-mock.spec.ts` |

`page.route()` **no** intercepta llamadas hechas con `request.get()`.

## 5. Cuándo usarlo / cuándo evitarlo

Usarlo: respuestas controladas, escenarios extremos, errores difíciles de
provocar (500, timeouts), UI determinista.
Evitarlo: cuando hay que demostrar que el servicio o el contrato real
funcionan. Para eso, usa el test con `APIRequestContext`.

## 6. Cómo funciona

```text
click en la página → fetch del navegador → page.route (coincide URL)
→ route.fulfill(status, json, headers) → la página consume la respuesta
→ expect(...) sobre la UI + comprobación de que el handler se ejecutó
```

## 7. Ejemplo comentado

```ts
const productMock = { id: 1, title: 'Producto simulado para QA', price: 199 };

// 1) Registrar el handler ANTES de la acción que dispara el fetch.
await page.route(productUrl, async (route) => {
  intercepted.push(route.request().method());          // prueba de interceptación
  await route.fulfill({
    status: 200,
    json: productMock,                                  // cuerpo simulado
    headers: { 'access-control-allow-origin': '*' },    // CORS: la fixture es about:blank
  });
});

// 2) La fixture HTML (page.setContent) hace un fetch real del navegador.
await openFixture(page);
await page.getByRole('button', { name: 'Cargar producto' }).click();

// 3) Efecto observable + prueba de que el handler se invocó.
await expect(page.locator('#product-title')).toHaveText(productMock.title);
expect(intercepted).toEqual(['GET']);
```

`page.setContent` solo entrega el HTML; no simula ningún backend. El segundo
test del archivo devuelve HTTP 500 y comprueba el mensaje de error que la
fixture sí implementa.

## 8. Cómo ejecutarlo

Precondiciones: `cd starter`, `npm ci`, `npx playwright install`.

```bash
npx tsc --noEmit
npx playwright test tests/mocking --project=chromium
```

El test no necesita red hacia DummyJSON. Los tests de `tests/api/` se ejecutan
aparte con `--project=api`.

## 9. Cómo agregar otro mock

1. Elige un endpoint y confirma método y URL exactos (DevTools / trace).
2. Usa un patrón estrecho; nunca `**/*`.
3. Define un JSON pequeño y distinguible del real.
4. Registra `page.route` antes de la acción; responde con `route.fulfill`.
5. Assert doble: handler invocado (método/contador) y efecto visible en la UI.
6. Mantén el alcance por test; no compartas rutas entre tests.

## 10. Depuración

| Síntoma | Causa probable |
|---|---|
| Se ve el dato real, no el mock | Patrón no coincide, o `route` registrado después del fetch |
| El mock nunca se invoca | URL/método distintos; Service Worker (probar `serviceWorkers: 'block'`) |
| `fetch` falla en la fixture | Falta `access-control-allow-origin` en el `fulfill` |
| Un test afecta a otro | Ruta registrada en `context` o compartida |
| El test pasa siempre | Assertions insuficientes: falta comprobar interceptación y UI |

## 11. Mantenimiento y límites

Preferir fixtures pequeñas; actualizar el mock si cambia el contrato real
(los mocks se vuelven obsoletos); conservar siempre el test de API real; no
incluir secretos en mocks, trazas ni capturas.

## 12. Evidencia

Se obtuvo ejecutando `npx playwright test tests/mocking --project=chromium`
(2 passed). Reporte HTML: `npx playwright show-report`. Sensibilidad
verificada: sin un `route` coincidente el test falla con el título real
(`Essence Mascara Lash Princess`).

## 13. Enlaces oficiales

- [Mock APIs](https://playwright.dev/docs/mock)
- [Network](https://playwright.dev/docs/network)
- [Route](https://playwright.dev/docs/api/class-route)
- [APIRequestContext](https://playwright.dev/docs/api/class-apirequestcontext)
