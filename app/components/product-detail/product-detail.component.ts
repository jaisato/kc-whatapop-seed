import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs/Subscription";

import { ConfirmationService } from "primeng/primeng";

import { Product } from "../../models/product";
import { ProductService } from "../../services/product.service";

@Component({
    templateUrl: "./app/components/product-detail/product-detail.component.html",
    styleUrls: ["./app/components/product-detail/product-detail.component.css"]
})
export class ProductDetailComponent implements OnDestroy, OnInit {

    private _product: Product;
    private _productSubscription: Subscription;

    constructor(
        private _productService: ProductService,
        private _route: ActivatedRoute,
        private _router: Router,
        private _confirmationService: ConfirmationService) { }

    ngOnInit(): void {
        this._route.data.forEach((data: { product: Product }) => this._product = data.product);
        window.scrollTo(0, 0);
    }

    ngOnDestroy(): void {
        if (this._productSubscription !== undefined) {
            this._productSubscription.unsubscribe();
        }
    }

    private _buyProduct(): void {
        // Without an error callback a failed PATCH was rethrown as an
        // uncaught error and the user got no answer at all to "Comprar".
        this._productSubscription = this._productService
                                        .buyProduct(this._product.id)
                                        .subscribe(
                                            () => this._showPurchaseConfirmation(),
                                            () => this._showPurchaseError());
    }

    private _showPurchaseError(): void {
        this._confirmationService.confirm({
            rejectVisible: false,
            message: "No se ha podido completar la compra. Inténtalo de nuevo."
        });
    }

    private _showPurchaseConfirmation(): void {
        this._confirmationService.confirm({
            rejectVisible: false,
            message: "Producto comprado. ¡Enhorabuena!",
            accept: () => this._router.navigate(["/products"])
        });
    }
    
    getImageSrc(): string {
        return this._product && this._product.photos.length > 0 ? this._product.photos[0] : "";
    }

    showPurchaseWarning(): void {
        // rejectVisible is explicit because p-confirmDialog keeps the last
        // value it was given: after the error dialog (no reject button) a
        // retry would otherwise ask "¿Estás seguro?" with no way to say no.
        this._confirmationService.confirm({
            rejectVisible: true,
            message: `Vas a comprar ${this._product.name}. ¿Estás seguro?`,
            accept: () => this._buyProduct()
        });
    }

    goBack(): void {
        window.history.back();
    }
}
