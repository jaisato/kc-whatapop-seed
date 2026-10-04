import { Component, EventEmitter, OnInit, OnDestroy, Output, signal } from "@angular/core";
import { NgFor } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Subscription } from "rxjs";

import { Category } from "../../models/category";
import { CategoryService } from "../../services/category.service";
import { ProductFilter } from "../../models/product-filter";

@Component({
    selector: "product-filter",
    imports: [FormsModule, NgFor],
    templateUrl: "./product-filter.component.html",
    styleUrl: "./product-filter.component.css"
})
export class ProductFilterComponent implements OnInit, OnDestroy {

    @Output() onSearch: EventEmitter<ProductFilter> = new EventEmitter();
    // protected: la plantilla los lee (con strictTemplates no puede leer campos private).
    protected _productFilter: ProductFilter = {};
    // Sin zone.js, lo que se asigna dentro de un subscribe() solo se repinta si es un signal.
    protected readonly _categories = signal<Category[]>([]);
    private _categoriesSubscription?: Subscription;

    constructor(private _categoryService: CategoryService) { }

    ngOnInit(): void {
        this._categoriesSubscription = this._categoryService
                                           .getCategories()
                                           .subscribe((data: Category[]) => this._categories.set(data));
    }

    ngOnDestroy(): void {
        // Guarded: a component destroyed before ngOnInit completed has no
        // subscription, and unsubscribing on undefined throws out of the
        // teardown - which stops Angular running the rest of it.
        if (this._categoriesSubscription) {
            this._categoriesSubscription.unsubscribe();
        }
    }

    notifyHost(): void {
        this.onSearch.emit(this._productFilter);
    }
}
