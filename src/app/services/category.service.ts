import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { Category } from '../models/category';
import { BackendUri } from '../app.settings';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private _backendUri = inject(BackendUri);
  private _http = inject(HttpClient);

  getCategories(): Observable<Category[]> {
    return this._http
      .get<unknown[]>(`${this._backendUri}/categories`)
      .pipe(map((data: unknown[]): Category[] => Category.fromJsonToList(data)));
  }
}
