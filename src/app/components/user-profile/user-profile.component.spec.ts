import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BackendUri } from '../../app.settings';
import { API, usuarioJson } from '../../testing/datos';
import { UserProfileComponent } from './user-profile.component';

const arya = {
  ...usuarioJson,
  id: 2,
  name: 'Arya Stark',
  nick: 'stickthemwiththepointyend',
  avatar: 'images/arya.jpg',
};

describe('UserProfileComponent', () => {
  let fixture: ComponentFixture<UserProfileComponent>;
  let elemento: HTMLElement;
  let http: HttpTestingController;
  const texto = () => elemento.querySelector('p')?.textContent?.replace(/\s+/g, ' ').trim();
  const fijarUsuario = async (userId: number | undefined) => {
    fixture.componentRef.setInput('userId', userId);
    await fixture.whenStable();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: BackendUri, useValue: API },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(UserProfileComponent);
    elemento = fixture.nativeElement;
  });

  afterEach(() => http.verify());

  it('sin userId no pide nada', async () => {
    await fijarUsuario(undefined);

    http.expectNone(() => true);
    expect(texto()).toBe('|');
  });

  it('pide el usuario de userId y pinta su nombre, su nick y su avatar', async () => {
    await fijarUsuario(1);
    http.expectOne(`${API}/users/1`).flush(usuarioJson);
    await fixture.whenStable();

    expect(texto()).toBe('John McClane | yippeekiyay');
    expect(elemento.querySelector('img')?.getAttribute('src')).toBe(usuarioJson.avatar);
  });

  it('si cambia userId, cancela la petición anterior y pinta el usuario nuevo', async () => {
    await fijarUsuario(1);
    const anterior = http.expectOne(`${API}/users/1`);
    await fijarUsuario(2);

    expect(anterior.cancelled).toBe(true);
    http.expectOne(`${API}/users/2`).flush(arya);
    await fixture.whenStable();
    expect(texto()).toBe('Arya Stark | stickthemwiththepointyend');
  });
});
