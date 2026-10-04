import { type APIRequestContext, type Page, type Request, expect, test } from '@playwright/test';

// El diálogo de compra en Chromium, con el teclado y el <dialog> nativo de verdad.
const API = 'http://localhost:5000';
const ID = 3; // a la venta en db.json

const comprar = (page: Page) => page.getByRole('button', { name: /^Comprar por/ });
const dialogo = (page: Page) => page.getByRole('dialog');
const estado = async (request: APIRequestContext) =>
  (await (await request.get(`${API}/products/${ID}`)).json()).state;

let compras: Request[];

test.beforeEach(async ({ page, request }) => {
  // Cada prueba empieza con el producto a la venta (la API usa una copia de db.json).
  await request.patch(`${API}/products/${ID}`, { data: { state: 'selling' } });
  compras = [];
  page.on('request', (r) => r.method() === 'PATCH' && compras.push(r));
  await page.goto(`/products/${ID}`);
  await expect(comprar(page)).toBeVisible();
});

// Comprueba que no se ha enviado ninguna compra: se da tiempo a que salga una petición tardía.
const sinCompras = async (page: Page, request: APIRequestContext) => {
  await page.waitForTimeout(500);
  expect(compras).toHaveLength(0);
  expect(await estado(request)).toBe('selling');
};

test('«Comprar» abre la confirmación con el foco en «No»', async ({ page }) => {
  await comprar(page).click();

  await expect(dialogo(page)).toBeVisible();
  await expect(dialogo(page)).toHaveAccessibleName('Confirmación de compra');
  await expect(dialogo(page)).toHaveAccessibleDescription(/^Vas a comprar .+\. ¿Estás seguro\?$/);
  await expect(page.getByRole('button', { name: 'No' })).toBeFocused();
});

test('doble Enter sobre «Comprar» no compra', async ({ page, request }) => {
  await comprar(page).focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');

  await expect(dialogo(page)).toBeHidden();
  await sinCompras(page, request);
});

test('doble Espacio sobre «Comprar» no compra', async ({ page, request }) => {
  await comprar(page).focus();
  await page.keyboard.press('Space');
  await page.keyboard.press('Space');

  await expect(dialogo(page)).toBeHidden();
  await sinCompras(page, request);
});

test('Enter y Espacio mantenidos (autorrepetición) no compran', async ({ page, request }) => {
  await comprar(page).focus();
  // A partir de la segunda pulsación, keydown llega con repeat = true.
  for (let i = 0; i < 15; i++) await page.keyboard.down('Enter');
  await page.keyboard.up('Enter');
  for (let i = 0; i < 15; i++) await page.keyboard.down('Space');
  await page.keyboard.up('Space');

  await sinCompras(page, request);
});

test('Escape no compra', async ({ page, request }) => {
  await comprar(page).click();
  await expect(dialogo(page)).toBeVisible();
  await page.keyboard.press('Escape');

  await expect(dialogo(page)).toBeHidden();
  await sinCompras(page, request);
});

test('«Sí» compra una sola vez y el aviso vuelve a /products', async ({ page, request }) => {
  await comprar(page).click();
  await page.getByRole('button', { name: 'Sí' }).click();

  await expect(dialogo(page)).toContainText('Producto comprado. ¡Enhorabuena!');
  await expect(page.getByRole('button', { name: 'Sí' })).toBeFocused();
  expect(compras).toHaveLength(1);
  expect(compras[0].postDataJSON()).toEqual({ state: 'sold' });
  expect(await estado(request)).toBe('sold');

  await page.getByRole('button', { name: 'Sí' }).click();
  await expect(page).toHaveURL(/\/products$/);
  expect(compras).toHaveLength(1);
});

test('un close atrasado no vacía la confirmación siguiente', async ({ page, request }) => {
  await comprar(page).click();
  // Cerrar y volver a abrir en la misma tarea: el close encolado llega con la segunda
  // confirmación abierta. Antes la vaciaba y «Sí» dejaba de comprar.
  await page.evaluate(async () => {
    document.querySelector('dialog')!.close('accept');
    document.querySelector<HTMLButtonElement>('button.large')!.click();
    await new Promise((resolver) => setTimeout(resolver, 50));
  });

  await expect(dialogo(page)).toContainText('Vas a comprar');
  await page.getByRole('button', { name: 'Sí' }).click();
  await expect(dialogo(page)).toContainText('Producto comprado. ¡Enhorabuena!');
  expect(compras).toHaveLength(1);
  expect(await estado(request)).toBe('sold');
});
