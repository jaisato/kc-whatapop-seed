import { inject } from '@angular/core';
import { RedirectCommand, ResolveFn, Router } from '@angular/router';
import { catchError, of } from 'rxjs';

import { Product } from '../models/product';
import { ProductService } from './product.service';

// Resolver funcional: con withComponentInputBinding() el producto llega al input
// 'product' de ProductDetailComponent.
//
// Si el producto no se puede cargar (un id que no existe, como /products/9999 o /products/abc, o
// la API caída) se vuelve al listado. Sin esto el error del resolver cancelaba la navegación: al
// abrir el enlace directamente la página se quedaba en blanco, y desde el listado el clic no hacía
// nada.
export const productDetailResolver: ResolveFn<Product> = (route) => {
  const router = inject(Router);
  return inject(ProductService)
    .getProduct(+route.params['productId'])
    .pipe(catchError(() => of(new RedirectCommand(router.parseUrl('/products')))));
};
