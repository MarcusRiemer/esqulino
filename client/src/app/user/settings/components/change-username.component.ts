import { Component } from '@angular/core';

import { UserService } from '../../../shared/auth/user.service';
import { UserNameDescription } from '../../../shared/auth/user.description';
@Component({
  selector: "change-username",
  templateUrl: "./templates/change-username.html"
})
export class ChangeUsernameComponent {
  constructor(
    private _userService: UserService
  ) { }

  readonly username$ = this._userService.userDisplayName$;
  readonly userId$ = this._userService.userId$;

  public userNameData: UserNameDescription = {
    displayName: undefined,
  };

  /**
   * Changes username if something valid were typed in
   */
  public onChangeUserName(): void {
    if (this.userNameData.displayName) {
      this._userService.changeUserName$(this.userNameData)
        .subscribe()
    }
  }
}