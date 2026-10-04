import { Component, signal, output, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

import { Category } from '../../models/category';
import { CategoryService } from '../../services/category.service';
import { ProductFilter } from '../../models/product-filter';

@Component({
  selector: 'product-filter',
  imports: [FormsModule],
  templateUrl: './product-filter.component.html',
  styleUrl: './product-filter.component.css',
})
export class ProductFilterComponent {
  private readonly _categoryService = inject(CategoryService);

  readonly onSearch = output<ProductFilter>();
  // protected: la plantilla los lee (con strictTemplates no puede leer campos private).
  protected _productFilter: ProductFilter = {};
  // Sin zone.js, lo que se asigna dentro de un subscribe() solo se repinta si es un signal.
  protected readonly _categories = signal<Category[]>([]);

  constructor() {
    // takeUntilDestroyed() cancela la petición si el componente se destruye antes de la respuesta.
    this._categoryService
      .getCategories()
      .pipe(takeUntilDestroyed())
      .subscribe((data: Category[]) => this._categories.set(data));
  }

  notifyHost(): void {
    this.onSearch.emit(this._productFilter);
  }
}
