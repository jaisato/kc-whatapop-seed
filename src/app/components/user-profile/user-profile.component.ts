import {
  Component,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  signal,
  input,
  inject,
} from '@angular/core';
import { Subscription } from 'rxjs';

import { User } from '../../models/user';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'user-profile',
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css',
})
export class UserProfileComponent implements OnChanges, OnDestroy {
  private _userService = inject(UserService);

  readonly userId = input<number | undefined>(undefined);
  // Sin zone.js, lo que se asigna dentro de un subscribe() solo se repinta si es un signal.
  readonly user = signal<User | undefined>(undefined);
  private _userSubscription?: Subscription;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userId'] && changes['userId']['currentValue']) {
      this._userSubscription = this._userService
        .getUser(changes['userId']['currentValue'])
        .subscribe((data) => this.user.set(data));
    }
  }

  ngOnDestroy(): void {
    if (this._userSubscription) {
      this._userSubscription.unsubscribe();
    }
  }

  getImageSrc(): string {
    const user = this.user();
    return user ? user.avatar : '';
  }
}
