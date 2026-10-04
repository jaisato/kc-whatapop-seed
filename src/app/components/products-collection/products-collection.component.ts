import { Component, signal, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { Subject, startWith, switchMap } from 'rxjs';

import { Product } from '../../models/product';
import { ProductComponent } from '../product/product.component';
import { ProductFilter } from '../../models/product-filter';
import { ProductFilterComponent } from '../product-filter/product-filter.component';
import { ProductService } from '../../services/product.service';

@Component({
  imports: [ProductComponent, ProductFilterComponent, RouterLink],
  templateUrl: './products-collection.component.html',
  styleUrl: './products-collection.component.css',
})
export class ProductsCollectionComponent {
  private readonly _productService = inject(ProductService);
  private readonly _router = inject(Router);

  // Sin zone.js, lo que se asigna dentro de un subscribe() solo se repinta si es un signal.
  protected readonly _products = signal<Product[] | undefined>(undefined);
  private readonly _filterStream$ = new Subject<ProductFilter | null>();

  constructor() {
    // La primera búsqueda, sin filtro, y después una por cada «Buscar». switchMap, como antes:
    // una búsqueda nueva cancela la anterior si sigue en curso. takeUntilDestroyed() deshace la
    // suscripción, y cancela la petición en curso, al destruir el componente.
    this._filterStream$
      .pipe(
        startWith(null),
        switchMap((filter: ProductFilter | null) => this._productService.getProducts(filter)),
        takeUntilDestroyed(),
      )
      .subscribe((products: Product[]) => this._products.set(products));
  }

  filterCollection(filter: ProductFilter | null): void {
    this._filterStream$.next(filter);
  }

  /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~|
  | Green Path                                                       |
  |~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~|
  | Maneja el evento del componente ProductComponent que indica la   |
  | selección de un producto y navega a la dirección correspondiente.|
  | Recuerda que para hacer esto necesitas inyectar como dependencia |
  | el Router de la app. La ruta a navegar es '/products', pasando   |
  | como parámetro el identificador del producto.                    |
  |~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

  goToProductDetails(product: Product): void {
    this._router.navigate(['/products', product.id]);
  }
}
