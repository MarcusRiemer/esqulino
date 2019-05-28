import { Component, OnInit } from "@angular/core";

import { UserService } from './user.service';


@Component({
  selector: 'is-logged-in',
  templateUrl: './templates/login-wrapper.html'
})
export class LoginWrapperComponent implements OnInit {
  constructor(
    private _userData: UserService
  ) {}

    ngOnInit(): void {
      this.isLoggedIn.subscribe(bol => console.log(bol))
    }

  readonly isLoggedIn = this._userData.isLoggedIn


}