import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from "@angular/core";
import { Subscription } from "rxjs/Rx";

import { User } from "../../models/user";
import { UserService } from "../../services/user.service";

@Component({
    selector: "user-profile",
    templateUrl: "./app/components/user-profile/user-profile.component.html",
    styleUrls: ["./app/components/user-profile/user-profile.component.css"]
})
export class UserProfileComponent implements OnChanges, OnDestroy {

    @Input() userId: number;
    user: User;
    private _userSubscription: Subscription;

    constructor(private _userService: UserService) { }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes["userId"] && changes["userId"]["currentValue"]) {
            // Drop the previous request: if userId changes while it is still
            // in flight, its late answer would overwrite the new user.
            if (this._userSubscription) {
                this._userSubscription.unsubscribe();
            }
            this._userSubscription = this._userService
                                         .getUser(this.userId)
                                         .subscribe(data => this.user = data);
        }
    }

    ngOnDestroy(): void {
        if (this._userSubscription) {
            this._userSubscription.unsubscribe();
        }
    }

    getImageSrc(): string {
        return this.user ? this.user.avatar : "";
    }
}
