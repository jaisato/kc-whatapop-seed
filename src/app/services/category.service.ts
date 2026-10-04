import { Inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, map } from "rxjs";

import { Category } from "../models/category";
import { BackendUri } from "../app.settings";

@Injectable({ providedIn: "root" })
export class CategoryService {

    constructor(
        @Inject(BackendUri) private _backendUri: string,
        private _http: HttpClient) { }

    getCategories(): Observable<Category[]> {
        return this._http
                   .get<unknown[]>(`${this._backendUri}/categories`)
                   .pipe(map((data: unknown[]): Category[] => Category.fromJsonToList(data)));
    }
}
