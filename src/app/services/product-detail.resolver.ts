import { inject } from '@angular/core';
import { RedirectCommand, ResolveFn, Router } from '@angular/router';
import { catchError, of } from 'rxjs';

import { Product } from '../models/product';
import { ProductService } from './product.service';

// Resolver funcional: con withComponentInputBinding() el producto llega al input
// 'product' de ProductDetailComponent.
//
// Si el producto no se puede cargar (un id que no existe o que no es un número, la API caída)
// se vuelve al listado. Un error en un resolver cancela la navegación: entrando por un enlace
// directo a /products/999 la aplicación se quedaba con la cabecera y nada debajo.
export const productDetailResolver: ResolveFn<Product> = (route) => {
  const router = inject(Router);
  const alListado = () => new RedirectCommand(router.parseUrl('/products'));

  const productId = Number(route.params['productId']);
  if (!Number.isSafeInteger(productId) || productId < 1) {
    return alListado();
  }

  return inject(ProductService)
    .getProduct(productId)
    .pipe(catchError(() => of(alListado())));
};
