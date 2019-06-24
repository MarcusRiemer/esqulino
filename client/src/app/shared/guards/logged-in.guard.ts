import { CanActivate, Router } from '@angular/router';
import { Injectable } from '@angular/core';

import { UserService } from '../auth/user.service';

@Injectable()
export class LoggedInGuard implements CanActivate {
  constructor(
    private _userService: UserService,
    private _router: Router
  ) { }

  public async canActivate() {
    return true;

    console.log(`LoggedIn Guard -> ?`);
    const loggedIn = await this._userService.isLoggedIn$.toPromise();
    console.log(`LoggedIn Guard -> ${loggedIn}`);

    if (!loggedIn)
      return this._router.parseUrl("/");

    return true;
  }
}