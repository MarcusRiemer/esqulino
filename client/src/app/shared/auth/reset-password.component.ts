import { Component, Input, Output } from '@angular/core';

import { UserService } from './user.service';
import { ResetPasswordDescription } from './auth-description';

@Component({
  selector: 'reset-password',
  templateUrl: './templates/reset-password.html'
})
export class ResetPasswordComponent {
  constructor(
    private _userService: UserService
  ) {}

  public resetPasswordData: ResetPasswordDescription = {
    email: undefined
  };

  public onResetPassword(): void {
    this._userService.onResetPassword$(this.resetPasswordData).subscribe(
      () => console.log("email"),
      (err) => console.log(JSON.stringify(err))
    )
  }
}