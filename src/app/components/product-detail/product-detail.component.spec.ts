import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { MockInstance } from 'vitest';

import { BackendUri } from '../../app.settings';
import { Product } from '../../models/product';
import { API, productoJson, usuarioJson } from '../../testing/datos';
import { simularDialogo, siguienteTarea } from '../../testing/dialogo';
import { ProductDetailComponent } from './product-detail.component';

describe('ProductDetailComponent', () => {
  let fixture: ComponentFixture<ProductDetailComponent>;
  let elemento: HTMLElement;
  let http: HttpTestingController;
  let navegar: MockInstance<Router['navigate']>;
  const dialogo = () => elemento.querySelector('dialog')!;
  const mensaje = () => dialogo().querySelector('p')?.textContent;
  const botonesDelDialogo = () =>
    Array.from(dialogo().querySelectorAll('.botones button'), (b) => b.textContent?.trim());
  const pulsar = async (texto: string) => {
    Array.from(elemento.querySelectorAll<HTMLButtonElement>('button'))
      .find((b) => b.textContent?.trim().startsWith(texto) || b.ariaLabel === texto)!
      .click();
    await fixture.whenStable();
  };
  const compra = () => http.match((req) => req.method === 'PATCH');

  beforeAll(simularDialogo);

  beforeEach(async () => {
    // El detalle sube al principio de la página (jsdom no lo implementa).
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: BackendUri, useValue: API },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    fixture = TestBed.createComponent(ProductDetailComponent);
    elemento = fixture.nativeElement;
    // Lo que en la aplicación entrega productDetailResolver vía withComponentInputBinding().
    fixture.componentRef.setInput('product', Product.fromJson(productoJson(7)));
    await fixture.whenStable();
    // El perfil del vendedor.
    http.expectOne(`${API}/users/1`).flush(usuarioJson);
    await fixture.whenStable();
  });

  afterEach(() => {
    http.verify();
    vi.restoreAllMocks();
  });

  it('pinta el producto, con un espacio entre la categoría y la fecha de publicación', () => {
    expect(elemento.querySelector('h3')?.textContent).toBe('Producto 7');
    const etiqueta = elemento.querySelector('p > span.label.info')!;
    expect(etiqueta.textContent?.trim()).toBe('Videojuegos');
    expect(etiqueta.nextElementSibling?.textContent).toMatch(/^Publicado hace \d+ años$/);
    // La etiqueta es inline-block: el espacio que se ve entre las dos es el nodo de texto en
    // blanco de la plantilla, que solo se conserva con preserveWhitespaces.
    const entreMedias = etiqueta.nextSibling!;
    expect(entreMedias.nodeType).toBe(Node.TEXT_NODE);
    expect(entreMedias.textContent).toMatch(/^\s+$/);
    expect(elemento.querySelector('user-profile')?.textContent).toContain('John McClane');
  });

  it('«Sí» compra con PATCH {state: sold}, avisa y el aviso vuelve a /products', async () => {
    await pulsar('Comprar por 59.90 €');
    expect(dialogo().open).toBe(true);
    expect(mensaje()).toBe('Vas a comprar Producto 7. ¿Estás seguro?');

    await pulsar('Sí');
    const [req] = compra();
    expect(req.request.url).toBe(`${API}/products/7`);
    expect(req.request.body).toEqual({ state: 'sold' });
    req.flush(productoJson(7, { state: 'sold' }));
    await fixture.whenStable();

    expect(dialogo().open).toBe(true);
    expect(mensaje()).toBe('Producto comprado. ¡Enhorabuena!');
    expect(botonesDelDialogo()).toEqual(['Sí']);
    expect(navegar).not.toHaveBeenCalled();

    await pulsar('Sí');
    expect(navegar).toHaveBeenCalledExactlyOnceWith(['/products']);
  });

  it('«No» no compra', async () => {
    await pulsar('Comprar');
    await pulsar('No');
    await siguienteTarea();

    expect(compra()).toEqual([]);
    expect(dialogo().open).toBe(false);
  });

  it('Escape no compra', async () => {
    await pulsar('Comprar');
    // Escape cierra el <dialog> desde el navegador, sin pasar por los botones.
    dialogo().close();
    await siguienteTarea();
    await fixture.whenStable();

    expect(compra()).toEqual([]);
    expect(dialogo().open).toBe(false);
  });

  it('la «X» del aviso de compra lo cierra sin volver a /products, como en PrimeNG', async () => {
    await pulsar('Comprar');
    await pulsar('Sí');
    compra()[0].flush(productoJson(7, { state: 'sold' }));
    await fixture.whenStable();

    await pulsar('Cerrar');
    await siguienteTarea();

    expect(dialogo().open).toBe(false);
    expect(navegar).not.toHaveBeenCalled();
  });
});
