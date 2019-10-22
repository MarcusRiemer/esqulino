import { Component, OnInit } from "@angular/core";
import { Subscription } from 'rxjs';

import { UserService } from './user.service';
@Component({
  selector: 'is-logged-in',
  templateUrl: './templates/login-wrapper.html'
})
export class LoginWrapperComponent implements OnInit {
  constructor(
    private _userData: UserService
  ) {}

  /**
   * Whether a user is logged in it decides
   * on the content that is displayed
   */
  readonly isLoggedIn = this._userData.isLoggedIn$
  private sub: Subscription;

  ngOnInit() {
    this.sub = this._userData._cachedUserData
      .subscribe(val => console.log("Subscription: "+ JSON.stringify(val)))
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}