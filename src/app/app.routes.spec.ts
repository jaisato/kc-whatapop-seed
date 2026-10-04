import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { BackendUri } from './app.settings';
import { routes } from './app.routes';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { ProductResetComponent } from './components/product-reset/product-reset.component';
import { API, categoriasJson, productoJson, usuarioJson } from './testing/datos';

const ORDEN = '_sort=publishedDate&_order=DESC';

describe('rutas de la aplicación', () => {
  let harness: RouterTestingHarness;
  let http: HttpTestingController;
  // Los resolvers piden los datos antes de activar la ruta, de forma asíncrona.
  const peticion = (url: string) => vi.waitFor(() => http.expectOne(url));

  beforeEach(async () => {
    // Los componentes de detalle y reset suben al principio de la página (jsdom no lo implementa).
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes, withComponentInputBinding()),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: BackendUri, useValue: API },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    harness = await RouterTestingHarness.create();
  });

  afterEach(() => {
    http.verify();
    vi.restoreAllMocks();
  });

  it('/products/:productId resuelve el producto y lo entrega como input', async () => {
    const navegacion = harness.navigateByUrl('/products/7', ProductDetailComponent);
    (await peticion(`${API}/products/7`)).flush(productoJson(7));
    const detalle = await navegacion;
    // El perfil del vendedor se carga después, desde UserProfileComponent.
    (await peticion(`${API}/users/1`)).flush(usuarioJson);
    await harness.fixture.whenStable();

    expect(detalle.product()?.id).toBe(7);
    expect(harness.routeNativeElement?.querySelector('h3')?.textContent).toBe('Producto 7');
    expect(harness.routeNativeElement?.querySelector('user-profile')?.textContent).toContain(
      'John McClane',
    );
  });

  it('/reset resuelve los productos vendidos (Yellow Path)', async () => {
    const navegacion = harness.navigateByUrl('/reset', ProductResetComponent);
    (await peticion(`${API}/products?${ORDEN}&state=sold`)).flush([
      productoJson(3, { state: 'sold', name: 'Vendido' }),
    ]);
    const reset = await navegacion;

    expect(reset.products().map((p) => p.name)).toEqual(['Vendido']);
    expect(harness.routeNativeElement?.textContent).toContain('Poner Vendido a la venta');
  });

  it('cualquier otra ruta redirige a /products', async () => {
    await harness.navigateByUrl('/no-existe');
    (await peticion(`${API}/products?${ORDEN}`)).flush([]);
    (await peticion(`${API}/categories`)).flush(categoriasJson);

    expect(TestBed.inject(Router).url).toBe('/products');
  });
});
