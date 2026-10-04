import { Component, OnDestroy, OnInit, input, linkedSignal } from "@angular/core";
import { NgFor, NgIf } from "@angular/common";
import { Subject, switchMap } from "rxjs";

import { Product } from "../../models/product";
import { ProductService } from "../../services/product.service";

@Component({
    imports: [NgFor, NgIf],
    templateUrl: "./product-reset.component.html",
    styleUrl: "./product-reset.component.css"
})
export class ProductResetComponent implements OnDestroy, OnInit {

    // Productos vendidos del resolver de la ruta (soldProductsResolver), que
    // withComponentInputBinding() entrega como input.
    readonly products = input.required<Product[]>();
    // Sin zone.js, lo que se asigna dentro de un subscribe() solo se repinta si es un
    // signal. La lista parte de la del resolver y se actualiza al reponer cada producto.
    protected readonly _products = linkedSignal(() => this.products());
    private _productStream$: Subject<number> = new Subject<number>();

    constructor(private _productService: ProductService) { }

    ngOnInit(): void {
        this._productStream$
            .pipe(switchMap((productId: number) => this._productService.setProductAvailable(productId)))
            .subscribe((product: Product) => this._updateProduct(product));
        window.scrollTo(0, 0);
    }

    ngOnDestroy(): void {
        this._productStream$.unsubscribe();
    }

    private _updateProduct(product: Product): void {
        this._products.update((products: Product[]) => products.filter((p: Product): boolean => p.id !== product.id));
    }

    setProductAvailable(productId: number): void {
        this._productStream$.next(productId);
    }
}
