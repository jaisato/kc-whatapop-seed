import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, Router } from "@angular/router";
import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/of";
import "rxjs/add/operator/catch";

import { Product } from "../models/product";
import { ProductService } from "./product.service";

@Injectable()
export class ProductDetailResolve implements Resolve<Product> {

    constructor(
        private _productService: ProductService,
        private _router: Router) { }

    resolve(route: ActivatedRouteSnapshot): Observable<Product> {
        // An unknown id (/products/999, a stale link) made json-server answer
        // 404, the resolver errored and the navigation was cancelled: a blank
        // page with an unhandled promise rejection. Fall back to the list.
        return this._productService
                   .getProduct(+route.params["productId"])
                   .catch(() => {
                       this._router.navigate(["/products"]);
                       return Observable.of(null);
                   });
    }
}
