import { Component, DestroyRef, OnInit, inject, input, viewChild } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { Product } from '../../models/product';
import { ProductService } from '../../services/product.service';
import { PublicationDatePipe } from '../../pipes/publication-date.pipe';
import { UserProfileComponent } from '../user-profile/user-profile.component';

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~|
| Blue Path                                                        |
|~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~|
| No olvides importar PublicationDatePipe en el componente que lo  |
| usa (antes se declaraba en AppModule).                           |
|~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

@Component({
  imports: [ConfirmDialogComponent, DecimalPipe, PublicationDatePipe, UserProfileComponent],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css',
  // La etiqueta de la categoría y «Publicado hace…» son inline y los separa el salto de línea
  // de la plantilla, como en Angular 2. Desde Angular 6 ese espacio se elimina por defecto.
  preserveWhitespaces: true,
})
export class ProductDetailComponent implements OnInit {
  private readonly _productService = inject(ProductService);
  private readonly _router = inject(Router);
  private readonly _destroyRef = inject(DestroyRef);

  // Producto del resolver de la ruta (productDetailResolver), que
  // withComponentInputBinding() entrega como input.
  readonly product = input<Product>();
  // Sustituye a ConfirmationService y <p-confirmDialog> de PrimeNG.
  private readonly _confirmDialog = viewChild.required(ConfirmDialogComponent);

  ngOnInit(): void {
    window.scrollTo(0, 0);
  }

  private _buyProduct(product: Product): void {
    // Si se sale del detalle antes de la respuesta, se cancela y no aparece el aviso (antes lo
    // hacía ngOnDestroy con la Subscription guardada).
    this._productService
      .buyProduct(product.id)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => this._showPurchaseConfirmation());
  }

  private _showPurchaseConfirmation(): void {
    this._confirmDialog().confirm({
      rejectVisible: false,
      message: 'Producto comprado. ¡Enhorabuena!',
      accept: () => this._router.navigate(['/products']),
    });
  }

  getImageSrc(): string {
    const product = this.product();
    return product && product.photos.length > 0 ? product.photos[0] : '';
  }

  showPurchaseWarning(product: Product): void {
    this._confirmDialog().confirm({
      message: `Vas a comprar ${product.name}. ¿Estás seguro?`,
      accept: () => this._buyProduct(product),
    });
  }

  goBack(): void {
    window.history.back();
  }
}
