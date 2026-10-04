import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { User } from '../models/user';
import { BackendUri } from '../app.settings';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(
    @Inject(BackendUri) private _backendUri: string,
    private _http: HttpClient,
  ) {}

  getUser(userId: number): Observable<User> {
    return this._http
      .get<unknown>(`${this._backendUri}/users/${userId}`)
      .pipe(map((data: unknown): User => User.fromJson(data)));
  }
}
