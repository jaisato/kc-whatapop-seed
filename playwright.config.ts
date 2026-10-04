import { defineConfig, devices } from '@playwright/test';

// Pruebas E2E del diálogo de compra en Chromium contra la aplicación (`ng serve`) y la API
// (server.mjs) sobre una copia de db.json, para que las compras no modifiquen el original.
//
//   npm run e2e                                  (descarga antes Chromium: npx playwright install)
//   CHROME_PATH=/ruta/a/chrome npm run e2e       (con un Chrome ya instalado)
export default defineConfig({
  testDir: 'e2e',
  testMatch: '**/*.e2e.ts',
  // Las pruebas comparten la API y cambian el estado de los productos.
  workers: 1,
  forbidOnly: !!process.env['CI'],
  reporter: process.env['CI'] ? [['list'], ['github']] : 'list',
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: { executablePath: process.env['CHROME_PATH'] || undefined },
      },
    },
  ],
  webServer: [
    {
      command: 'node e2e/copiar-db.mjs && node server.mjs tmp/e2e/db.json',
      url: 'http://localhost:5000/products/3',
      // Nunca la API de desarrollo, que guarda en db.json.
      reuseExistingServer: false,
    },
    {
      command: 'npx ng serve --port 4200',
      url: 'http://localhost:4200',
      reuseExistingServer: !process.env['CI'],
      timeout: 180_000,
    },
  ],
});
