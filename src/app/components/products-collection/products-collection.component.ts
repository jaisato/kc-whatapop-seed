import { Component, OnDestroy, OnInit, signal } from "@angular/core";
import { NgFor, NgIf } from "@angular/common";
import { Router, RouterLink } from "@angular/router";
import { Subject, Subscription, switchMap } from "rxjs";

import { Product } from "../../models/product";
import { ProductComponent } from "../product/product.component";
import { ProductFilter } from "../../models/product-filter";
import { ProductFilterComponent } from "../product-filter/product-filter.component";
import { ProductService } from "../../services/product.service";

@Component({
    imports: [NgFor, NgIf, ProductComponent, ProductFilterComponent, RouterLink],
    templateUrl: "./products-collection.component.html",
    styleUrl: "./products-collection.component.css"
})
export class ProductsCollectionComponent implements OnDestroy, OnInit {

    // Sin zone.js, lo que se asigna dentro de un subscribe() solo se repinta si es un signal.
    protected readonly _products = signal<Product[] | undefined>(undefined);
    private _filterStream$: Subject<ProductFilter | null> = new Subject();
    private _subscription?: Subscription;

    constructor(
        private _productService: ProductService,
        private _router: Router,
    ) { }

    ngOnInit(): void {
        // The Subscription is kept. Without it, ngOnDestroy had nothing to tear
        // down but the Subject itself, which leaves the switchMap's in-flight
        // HTTP request running and its handler holding a reference to a
        // destroyed component - and any later next() on an unsubscribed Subject
        // throws ObjectUnsubscribedError rather than being ignored.
        this._subscription = this._filterStream$
            .pipe(switchMap((filter: ProductFilter | null) => this._productService.getProducts(filter)))
            .subscribe((products: Product[]) => this._products.set(products));
        this.filterCollection(null);
    }

    ngOnDestroy(): void {
        this._filterStream$.complete();

        if (this._subscription) {
            this._subscription.unsubscribe();
        }
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
        this._router.navigate([
            '/products',
            product.id
        ]);
    }
}
