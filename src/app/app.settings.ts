import { InjectionToken } from '@angular/core';

// URL base de la API: json-server sirviendo db.json (`npm run api`). Era un OpaqueToken
// registrado en AppModule con un ValueProvider; InjectionToken lleva el valor por defecto
// en su factory. Las pruebas lo sustituyen con { provide: BackendUri, useValue: ... }.
export const BackendUri = new InjectionToken<string>('BackendUri', {
  providedIn: 'root',
  factory: () => 'http://localhost:5000',
});
