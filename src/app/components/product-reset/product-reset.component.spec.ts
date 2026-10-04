import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BackendUri } from '../../app.settings';
import { Product } from '../../models/product';
import { API, productoJson } from '../../testing/datos';
import { ProductResetComponent } from './product-reset.component';

const vendido = (id: number) =>
  Product.fromJson(productoJson(id, { state: 'sold', name: `Vendido ${id}` }));

describe('ProductResetComponent', () => {
  let fixture: ComponentFixture<ProductResetComponent>;
  let elemento: HTMLElement;
  let http: HttpTestingController;
  const botones = () =>
    Array.from(elemento.querySelectorAll<HTMLButtonElement>('li button'), (b) =>
      b.textContent?.trim(),
    );
  const pulsar = (indice: number) =>
    elemento.querySelectorAll<HTMLButtonElement>('li button')[indice].click();

  beforeEach(async () => {
    // El reset sube al principio de la página (jsdom no lo implementa).
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: BackendUri, useValue: API },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ProductResetComponent);
    elemento = fixture.nativeElement;
    // Lo que en la aplicación entrega soldProductsResolver vía withComponentInputBinding().
    fixture.componentRef.setInput('products', [vendido(3), vendido(5)]);
    await fixture.whenStable();
  });

  afterEach(() => {
    http.verify();
    vi.restoreAllMocks();
  });

  it('lista los productos vendidos con un botón para ponerlos a la venta', () => {
    expect(botones()).toEqual(['Poner Vendido 3 a la venta', 'Poner Vendido 5 a la venta']);
  });

  it('repone un producto con PATCH {state: selling} y lo quita de la lista', async () => {
    pulsar(0);

    const req = http.expectOne(`${API}/products/3`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ state: 'selling' });
    req.flush(productoJson(3));
    await fixture.whenStable();

    expect(botones()).toEqual(['Poner Vendido 5 a la venta']);
  });

  it('cuando no queda ninguno, indica que todos están a la venta', async () => {
    fixture.componentRef.setInput('products', [vendido(3)]);
    await fixture.whenStable();
    pulsar(0);
    http.expectOne(`${API}/products/3`).flush(productoJson(3));
    await fixture.whenStable();

    expect(botones()).toEqual([]);
    expect(elemento.textContent).toContain('Todos los productos están a la venta.');
  });

  it('con switchMap, un segundo clic antes de la respuesta cancela la primera petición', async () => {
    pulsar(0);
    pulsar(1);

    const [primera, segunda] = http.match((req) => req.method === 'PATCH');
    expect(primera.cancelled).toBe(true);
    segunda.flush(productoJson(5));
    await fixture.whenStable();

    expect(botones()).toEqual(['Poner Vendido 3 a la venta']);
  });
});
