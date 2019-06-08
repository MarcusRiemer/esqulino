import { Component, Input, Output } from '@angular/core';

import { UserService } from './user.service';
import { ResetPasswordDescription } from './auth-description';

@Component({
  selector: 'reset-password-request',
  templateUrl: './templates/reset-password-request.html'
})
export class ResetPasswordRequestComponent {
  constructor(
    private _userService: UserService
  ) {}

  public resetPasswordData: ResetPasswordDescription = {
    email: undefined
  };

  public onResetPassword(): void {
    this._userService.onResetPassword$(this.resetPasswordData).subscribe(
      () => console.log("email"),
      (err) => alert(`Error: ${err["error"]["error"]}`)
    )
  }
}