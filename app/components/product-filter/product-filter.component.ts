import { Component, EventEmitter, OnInit, OnDestroy, Output } from "@angular/core";
import { Subscription } from "rxjs/Rx";

import { Category } from "../../models/category";
import { CategoryService } from "../../services/category.service";
import { ProductFilter } from "../../models/product-filter";

@Component({
    selector: "product-filter",
    templateUrl: "./app/components/product-filter/product-filter.component.html",
    styleUrls: ["./app/components/product-filter/product-filter.component.css"]
})
export class ProductFilterComponent implements OnInit, OnDestroy {

    @Output() onSearch: EventEmitter<ProductFilter> = new EventEmitter();
    private _productFilter: ProductFilter = {};
    private _categories: Category[];
    private _categoriesSubscription: Subscription;

    constructor(private _categoryService: CategoryService) { }

    ngOnInit(): void {
        this._categoriesSubscription = this._categoryService
                                           .getCategories()
                                           .subscribe((data: Category[]) => this._categories = data);
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
