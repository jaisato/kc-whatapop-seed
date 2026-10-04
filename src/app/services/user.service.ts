import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { User } from '../models/user';
import { BackendUri } from '../app.settings';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly _backendUri = inject(BackendUri);
  private readonly _http = inject(HttpClient);

  getUser(userId: number): Observable<User> {
    return this._http
      .get<unknown>(`${this._backendUri}/users/${userId}`)
      .pipe(map((data: unknown): User => User.fromJson(data)));
  }
}
