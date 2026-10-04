import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { BackendUri } from '../app.settings';
import { Category } from '../models/category';
import { Product } from '../models/product';
import { API, productoJson } from '../testing/datos';
import { ProductService } from './product.service';

const ORDEN = '_sort=publishedDate&_order=DESC';

describe('ProductService', () => {
  let service: ProductService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: BackendUri, useValue: API },
      ],
    });
    service = TestBed.inject(ProductService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('usa por defecto el json-server local del puerto 5000', () => {
    TestBed.resetTestingModule();
    expect(TestBed.inject(BackendUri)).toBe('http://localhost:5000');
  });

  it('pide los productos ordenados por fecha de publicación y los convierte en Product', () => {
    let productos: Product[] | undefined;
    service.getProducts().subscribe((respuesta) => (productos = respuesta));

    const req = http.expectOne(`${API}/products?${ORDEN}`);
    expect(req.request.method).toBe('GET');
    req.flush([productoJson(2), productoJson(1, { state: 'sold' })]);

    expect(productos?.map((p) => [p.id, p.state])).toEqual([
      [2, 'selling'],
      [1, 'sold'],
    ]);
    expect(productos?.[0]).toBeInstanceOf(Product);
    expect(productos?.[0].category).toEqual(new Category(1, 'Videojuegos'));
  });

  it('filtra por texto, categoría y estado (Red y Yellow Path)', () => {
    service.getProducts({ text: 'uncharted', category: '1', state: 'sold' }).subscribe();

    http.expectOne(`${API}/products?${ORDEN}&q=uncharted&category.id=1&state=sold`).flush([]);
  });

  it('no envía los filtros sin valor, como URLSearchParams de @angular/http', () => {
    service.getProducts({}).subscribe();
    service.getProducts({ text: undefined, category: undefined, state: undefined }).subscribe();
    service.getProducts(null).subscribe();

    const reqs = http.match(`${API}/products?${ORDEN}`);
    expect(reqs.length).toBe(3);
    reqs.forEach((req) => req.flush([]));
  });

  it('pide un producto por su id', () => {
    let producto: Product | undefined;
    service.getProduct(7).subscribe((respuesta) => (producto = respuesta));

    http.expectOne(`${API}/products/7`).flush(productoJson(7));

    expect(producto?.id).toBe(7);
    expect(producto?.name).toBe('Producto 7');
  });

  it('compra un producto con PATCH {state: sold}', () => {
    let producto: Product | undefined;
    service.buyProduct(7).subscribe((respuesta) => (producto = respuesta));

    const req = http.expectOne(`${API}/products/7`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ state: 'sold' });
    req.flush(productoJson(7, { state: 'sold' }));

    expect(producto?.state).toBe('sold');
  });

  it('vuelve a poner un producto a la venta con PATCH {state: selling}', () => {
    service.setProductAvailable(7).subscribe();

    const req = http.expectOne(`${API}/products/7`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ state: 'selling' });
    req.flush(productoJson(7));
  });
});
