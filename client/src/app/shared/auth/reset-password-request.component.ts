import { Component, Input, Output } from '@angular/core';

import { UserEmailDescription } from './user.description';
import { UserService } from './user.service';

@Component({
  selector: 'reset-password-request',
  templateUrl: './templates/reset-password-request.html'
})
export class ResetPasswordRequestComponent {
  constructor(
    private _userService: UserService
  ) {}

  public userEmail: UserEmailDescription = {
    email: undefined
  };

  public onPasswordResetRequest(): void {
    this._userService.passwordResetRequest$(this.userEmail).subscribe(
      () => console.log("email"),
      (err) => alert(`Error: ${err["error"]["error"]}`)
    )
  }
}