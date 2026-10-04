import { Component, signal, input, inject } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { filter, switchMap } from 'rxjs';

import { User } from '../../models/user';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'user-profile',
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css',
})
export class UserProfileComponent {
  private readonly _userService = inject(UserService);

  readonly userId = input<number>();
  // Sin zone.js, lo que se asigna dentro de un subscribe() solo se repinta si es un signal.
  readonly user = signal<User | undefined>(undefined);

  constructor() {
    // Sustituye a ngOnChanges: cada userId (si lo hay) pide su usuario. switchMap cancela la
    // petición anterior si sigue en curso; antes quedaba suscrita y su respuesta podía llegar
    // después y pisar al usuario nuevo.
    toObservable(this.userId)
      .pipe(
        filter((userId): userId is number => !!userId),
        switchMap((userId: number) => this._userService.getUser(userId)),
        takeUntilDestroyed(),
      )
      .subscribe((data: User) => this.user.set(data));
  }

  getImageSrc(): string {
    const user = this.user();
    return user ? user.avatar : '';
  }
}
