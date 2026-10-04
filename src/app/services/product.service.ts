import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { Product } from '../models/product';
import { ProductFilter } from '../models/product-filter';
import { BackendUri } from '../app.settings';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private _backendUri = inject(BackendUri);
  private _http = inject(HttpClient);

  getProducts(filter: ProductFilter | null = null): Observable<Product[]> {
    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~|
    | Pink Path                                                        |
    |~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~|
    | Pide al servidor que te retorne los productos ordenados de más   |
    | reciente a menos, teniendo en cuenta su fecha de publicación.    |
    |                                                                  |
    | En la documentación de 'JSON Server' tienes detallado cómo hacer |
    | la ordenación de los datos en tus peticiones, pero te ayudo      |
    | igualmente. La querystring debe tener estos parámetros:          |
    |                                                                  |
    |   _sort=publishedDate&_order=DESC                                |
    |~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    let params = new HttpParams().set('_sort', 'publishedDate').set('_order', 'DESC');

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~|
    | Red Path                                                         |
    |~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~|
    | Pide al servidor que te retorne los productos filtrados por      |
    | texto y/ por categoría.                                          |
    |                                                                  |
    | En la documentación de 'JSON Server' tienes detallado cómo       |
    | filtrar datos en tus peticiones, pero te ayudo igualmente. La    |
    | querystring debe tener estos parámetros:                         |
    |                                                                  |
    |   - Búsqueda por texto:                                          |
    |       q=x (siendo x el texto)                                    |
    |   - Búsqueda por categoría:                                      |
    |       category.id=x (siendo x el identificador de la categoría)  |
    |~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    // Los campos sin valor (undefined o null) no se envían, igual que hacía
    // URLSearchParams.append() de @angular/http. HttpParams, en cambio, los
    // serializaría como "q=undefined" o "category.id=null".
    if (filter) {
      if (filter.text != null) {
        params = params.append('q', filter.text);
      }
      if (filter.category != null) {
        params = params.append('category.id', filter.category);
      }

      /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~|
      | Yellow Path                                                      |
      |~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~|
      | Pide al servidor que te retorne los productos filtrados por      |
      | estado.                                                          |
      |                                                                  |
      | En la documentación de 'JSON Server' tienes detallado cómo       |
      | filtrar datos en tus peticiones, pero te ayudo igualmente. La    |
      | querystring debe tener estos parámetros:                         |
      |                                                                  |
      |   - Búsqueda por estado:                                         |
      |       state=x (siendo x el estado)                               |
      |~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

      if (filter.state != null) {
        params = params.append('state', filter.state);
      }
    }

    return this._http
      .get<unknown[]>(`${this._backendUri}/products`, { params })
      .pipe(map((data: unknown[]): Product[] => Product.fromJsonToList(data)));
  }

  getProduct(productId: number): Observable<Product> {
    return this._http
      .get<unknown>(`${this._backendUri}/products/${productId}`)
      .pipe(map((data: unknown): Product => Product.fromJson(data)));
  }

  buyProduct(productId: number): Observable<Product> {
    let body: any = { state: 'sold' };
    return this._http
      .patch<unknown>(`${this._backendUri}/products/${productId}`, body)
      .pipe(map((data: unknown): Product => Product.fromJson(data)));
  }

  setProductAvailable(productId: number): Observable<Product> {
    let body: any = { state: 'selling' };
    return this._http
      .patch<unknown>(`${this._backendUri}/products/${productId}`, body)
      .pipe(map((data: unknown): Product => Product.fromJson(data)));
  }
}
