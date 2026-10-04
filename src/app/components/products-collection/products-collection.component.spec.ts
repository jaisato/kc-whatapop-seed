import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { BackendUri } from '../../app.settings';
import { API, categoriasJson, productoJson } from '../../testing/datos';
import { ProductsCollectionComponent } from './products-collection.component';

const ORDEN = '_sort=publishedDate&_order=DESC';

// Sin zone.js, lo único que repinta la colección cuando llega la respuesta de los productos
// es que se guarden en un signal. Para comprobarlo, cada prueba responde a los productos sin
// ninguna otra detección de cambios pendiente: las categorías del filtro (componente hijo)
// se responden al final, porque su signal también repintaría al padre y lo ocultaría.
describe('ProductsCollectionComponent', () => {
  let fixture: ComponentFixture<ProductsCollectionComponent>;
  let elemento: HTMLElement;
  let http: HttpTestingController;
  const botones = () =>
    Array.from(elemento.querySelectorAll('product button'), (b) =>
      b.textContent?.replace(/\s+/g, ' ').trim(),
    );
  const responderCategorias = async () => {
    http.expectOne(`${API}/categories`).flush(categoriasJson);
    await fixture.whenStable();
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: BackendUri, useValue: API },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ProductsCollectionComponent);
    elemento = fixture.nativeElement;
    await fixture.whenStable();
  });

  afterEach(() => http.verify());

  it('pinta los productos al llegar la respuesta', async () => {
    http
      .expectOne(`${API}/products?${ORDEN}`)
      .flush([productoJson(2), productoJson(1, { state: 'sold', price: 4.5 })]);
    await fixture.whenStable();

    expect(botones()).toEqual(['Comprar por 59.90 €', 'Ver detalles']);

    await responderCategorias();
    expect(
      Array.from(elemento.querySelectorAll('product-filter option'), (o) => o.textContent?.trim()),
    ).toEqual(['Videojuegos', 'Películas', 'Libros']);
  });

  it('vuelve a pedir los productos con el filtro al pulsar Buscar', async () => {
    http.expectOne(`${API}/products?${ORDEN}`).flush([productoJson(1)]);
    await fixture.whenStable();

    const texto = elemento.querySelector<HTMLInputElement>('product-filter input')!;
    texto.value = 'uncharted';
    texto.dispatchEvent(new Event('input'));
    elemento.querySelector<HTMLButtonElement>('product-filter button')!.click();
    // Se deja pasar la detección de cambios del clic antes de responder.
    await fixture.whenStable();
    http.expectOne(`${API}/products?${ORDEN}&q=uncharted`).flush([]);
    await fixture.whenStable();

    expect(botones()).toEqual([]);
    expect(elemento.textContent).toContain('No se han encontrado productos.');
    await responderCategorias();
  });

  it('navega al detalle del producto en el que se hace clic (Green Path)', async () => {
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    http.expectOne(`${API}/products?${ORDEN}`).flush([productoJson(2), productoJson(1)]);
    await fixture.whenStable();

    elemento.querySelectorAll<HTMLButtonElement>('product button')[1].click();

    expect(navegar).toHaveBeenCalledWith(['/products', 1]);
    await responderCategorias();
  });
});
