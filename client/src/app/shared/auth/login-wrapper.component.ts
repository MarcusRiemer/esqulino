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

  /**
   * Whether a user is logged in it decides
   * on the content that is displayed
   */
  readonly isLoggedIn = this._userData.isLoggedIn$
}