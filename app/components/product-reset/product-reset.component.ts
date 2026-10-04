import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject";
import { Subscription } from "rxjs/Subscription";
import "rxjs/add/observable/empty";
import "rxjs/add/operator/catch";
import "rxjs/add/operator/mergeMap";

import { Product } from "../../models/product";
import { ProductService } from "../../services/product.service";

@Component({
    templateUrl: "./app/components/product-reset/product-reset.component.html",
    styleUrls: ["./app/components/product-reset/product-reset.component.css"]
})
export class ProductResetComponent implements OnDestroy, OnInit {

    private _products: Product[];
    private _updateError: string;
    private _productStream$: Subject<number> = new Subject<number>();
    private _subscription: Subscription;

    constructor(
        private _productService: ProductService,
        private _route: ActivatedRoute) { }

    ngOnInit(): void {
        // mergeMap, not switchMap: each button is a different product, so a
        // second click must not cancel the first request. With switchMap the
        // first PATCH was aborted (or its response dropped) and that product
        // stayed in the list even when the server had already updated it.
        // The error is caught per request so one failure does not terminate
        // the stream and leave every other button dead.
        this._subscription = this._productStream$
            .mergeMap((productId: number) => this._productService
                .setProductAvailable(productId)
                .catch(() => {
                    this._updateError = "No se ha podido poner el producto a la venta. Inténtalo de nuevo.";
                    return Observable.empty<Product>();
                }))
            .subscribe((product: Product) => this._updateProduct(product));
        this._route.data.forEach((data: { products: Product[] }) => this._products = data.products);
        window.scrollTo(0, 0);
    }

    ngOnDestroy(): void {
        this._productStream$.complete();

        if (this._subscription) {
            this._subscription.unsubscribe();
        }
    }

    private _updateProduct(product: Product): void {
        this._updateError = null;
        this._products = this._products.filter((p: Product): boolean => p.id !== product.id);
    }

    setProductAvailable(productId: number): void {
        this._productStream$.next(productId);
    }
}
