import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

import { Product } from '../models/product';
import { ProductService } from './product.service';
import { ProductFilter } from '../models/product-filter';

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~|
| Yellow Path                                                      |
|~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~|
| Aquí toca hacer varias cosas:                                    |
|                                                                  |
| 1. Debemos hacer que soldProductsResolver resuelva datos durante |
|    la naveación de la ruta '/reset', por tanto, haz lo que creas |
|    oportuno para ello. Como pista te diré: ResolveFn<T>.         |
|                                                                  |
| 2. Debemos resolver la colección de productos vendidos. Toca ir  |
|    a servidor a través de ProductService, que tendrás que        |
|    inyectar como dependencia. Además, debes crear un nuevo       |
|    ProductFilter que contemple el filtro a aplicar en servidor.  |
|    Fíjate en qué se diferencia un producto a la venta de uno     |
|    ya vendido; quizá te ayude con este punto.                    |
|~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

export const soldProductsResolver: ResolveFn<Product[]> = () => {
  let filter: ProductFilter = {};
  filter.state = 'sold';

  return inject(ProductService).getProducts(filter);
};
