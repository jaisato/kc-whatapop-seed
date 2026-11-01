import { Component, OnInit, inject, input, linkedSignal, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, Subject, catchError, switchMap } from 'rxjs';

import { Product } from '../../models/product';
import { ProductService } from '../../services/product.service';

@Component({
  templateUrl: './product-reset.component.html',
  styleUrl: './product-reset.component.css',
})
export class ProductResetComponent implements OnInit {
  private readonly _productService = inject(ProductService);

  // Productos vendidos del resolver de la ruta (soldProductsResolver), que
  // withComponentInputBinding() entrega como input.
  readonly products = input.required<Product[]>();
  // Sin zone.js, lo que se asigna dentro de un subscribe() solo se repinta si es un
  // signal. La lista parte de la del resolver y se actualiza al reponer cada producto.
  protected readonly _products = linkedSignal(() => this.products());
  private readonly _productStream$ = new Subject<number>();
  // Si la última reposición ha fallado; el producto sigue en la lista para reintentar.
  protected readonly _resetError = signal(false);

  constructor() {
    // switchMap, como antes. takeUntilDestroyed() deshace la suscripción, y cancela la petición
    // en curso, al destruir el componente; antes ngOnDestroy solo cerraba el Subject.
    this._productStream$
      .pipe(
        // Como en la colección: un error que llegase al stream exterior lo completaría y
        // ningún botón volvería a funcionar hasta recargar.
        switchMap((productId: number) =>
          this._productService.setProductAvailable(productId).pipe(
            catchError(() => {
              this._resetError.set(true);
              return EMPTY;
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((product: Product) => {
        this._resetError.set(false);
        this._updateProduct(product);
      });
  }

  ngOnInit(): void {
    window.scrollTo(0, 0);
  }

  private _updateProduct(product: Product): void {
    this._products.update((products: Product[]) =>
      products.filter((p: Product): boolean => p.id !== product.id),
    );
  }

  setProductAvailable(productId: number): void {
    this._productStream$.next(productId);
  }
}
