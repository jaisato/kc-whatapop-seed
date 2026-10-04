import { Routes } from "@angular/router";

import { ProductDetailComponent } from "./components/product-detail/product-detail.component";
import { productDetailResolver } from "./services/product-detail.resolver";
import { ProductResetComponent } from "./components/product-reset/product-reset.component";
import { ProductsCollectionComponent } from "./components/products-collection/products-collection.component";
import { soldProductsResolver } from "./services/sold-products.resolver";

export const routes: Routes = [
    {
        path: "products",
        component: ProductsCollectionComponent
    },
    {
        path: "products/:productId",
        component: ProductDetailComponent,
        resolve: {
            product: productDetailResolver
        }
    },
    {
        path: "reset",
        component: ProductResetComponent,
        resolve: {
            products: soldProductsResolver
        }
    },
    {
        path: "**",
        redirectTo: "/products"
    }
];
