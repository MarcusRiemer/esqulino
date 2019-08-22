import { Component } from "@angular/core";

import { UserService } from './user.service';
@Component({
  selector: 'is-logged-in',
  templateUrl: './templates/login-wrapper.html'
})
export class LoginWrapperComponent {
  constructor(
    private _userData: UserService
  ) {}

  readonly isLoggedIn = this._userData.isLoggedIn$
}