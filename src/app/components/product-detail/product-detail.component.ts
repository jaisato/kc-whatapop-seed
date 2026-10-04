import { Component, Input, OnDestroy, OnInit, viewChild, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

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
})
export class ProductDetailComponent implements OnDestroy, OnInit {
  private _productService = inject(ProductService);
  private _router = inject(Router);

  // Producto del resolver de la ruta (productDetailResolver), que
  // withComponentInputBinding() entrega como input.
  @Input() product?: Product;
  private _productSubscription?: Subscription;
  // Sustituye a ConfirmationService y <p-confirmDialog> de PrimeNG.
  private readonly _confirmDialog = viewChild.required(ConfirmDialogComponent);

  ngOnInit(): void {
    window.scrollTo(0, 0);
  }

  ngOnDestroy(): void {
    if (this._productSubscription !== undefined) {
      this._productSubscription.unsubscribe();
    }
  }

  private _buyProduct(product: Product): void {
    this._productSubscription = this._productService
      .buyProduct(product.id)
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
    return this.product && this.product.photos.length > 0 ? this.product.photos[0] : '';
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
