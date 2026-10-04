import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

import { Product } from '../models/product';
import { ProductService } from './product.service';

// Resolver funcional: con withComponentInputBinding() el producto llega al input
// 'product' de ProductDetailComponent.
export const productDetailResolver: ResolveFn<Product> = (route) =>
  inject(ProductService).getProduct(+route.params['productId']);
