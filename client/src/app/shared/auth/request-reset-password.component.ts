import { Component } from '@angular/core';

import { UserEmailDescription } from './user.description';
import { UserService } from './user.service';
@Component({
  selector: 'request-reset-password',
  templateUrl: './templates/request-reset-password.html'
})
export class RequestResetPasswordComponent {
  constructor(
    private _userService: UserService
  ) { }

  public userEmail: UserEmailDescription = {
    email: undefined
  };

  public onPasswordResetRequest(): void {
    this._userService
      .passwordResetRequest$(this.userEmail)
      .subscribe()
  }
}