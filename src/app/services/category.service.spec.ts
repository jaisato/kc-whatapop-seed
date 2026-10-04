import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { BackendUri } from '../app.settings';
import { Category } from '../models/category';
import { User } from '../models/user';
import { API, categoriasJson, usuarioJson } from '../testing/datos';
import { CategoryService } from './category.service';
import { UserService } from './user.service';

describe('CategoryService y UserService', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: BackendUri, useValue: API },
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('CategoryService pide las categorías y las convierte en Category', () => {
    let categorias: Category[] | undefined;
    TestBed.inject(CategoryService)
      .getCategories()
      .subscribe((respuesta) => (categorias = respuesta));

    const req = http.expectOne(`${API}/categories`);
    expect(req.request.method).toBe('GET');
    req.flush(categoriasJson);

    expect(categorias).toEqual(categoriasJson.map((c) => new Category(c.id, c.name)));
  });

  it('UserService pide un usuario por su id y lo convierte en User', () => {
    let usuario: User | undefined;
    TestBed.inject(UserService)
      .getUser(1)
      .subscribe((respuesta) => (usuario = respuesta));

    const req = http.expectOne(`${API}/users/1`);
    expect(req.request.method).toBe('GET');
    req.flush(usuarioJson);

    expect(usuario).toBeInstanceOf(User);
    expect(usuario).toMatchObject({ id: 1, name: 'John McClane', nick: 'yippeekiyay' });
  });
});
