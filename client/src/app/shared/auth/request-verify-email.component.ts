import { Component } from '@angular/core';

import { UserEmailDescription } from './user.description';
import { UserService } from './user.service';
@Component({
  selector: 'request-verify-email',
  templateUrl: './templates/request-verify-email.html'
})
export class RequestVerifyEmailComponent {
  constructor(
    private _userService: UserService
  ) {}

  public userEmail: UserEmailDescription = {
    email: undefined
  };

  public onSendVerifyEmail(): void {
    this._userService
      .sendVerifyEmail$(this.userEmail)
      .subscribe()
  }
}