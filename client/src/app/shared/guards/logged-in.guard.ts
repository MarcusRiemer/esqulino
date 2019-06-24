import { CanActivate, Router } from '@angular/router';
import { Injectable } from '@angular/core';

import { UserService } from '../auth/user.service';

@Injectable()
export class LoggedInGuard implements CanActivate {
  constructor(
    private _userService: UserService,
    private _router: Router
  ) { }

  // TODO: find out why this is not the same as
  //       this._userService.isLoggedIn$.toPromise();
  private _userStatus: Promise<boolean> = new Promise<boolean>((resolve, reject) => {
    this._userService.isLoggedIn$.subscribe(
      loggedIn => resolve(loggedIn),
      _ => reject(false)
    )
  });

  public async canActivate() {
    console.log(`LoggedIn Guard -> ?`);
    const loggedIn = await this._userStatus;
    console.log(`LoggedIn Guard -> ${loggedIn}`);

    if (!loggedIn)
      return this._router.parseUrl("/");

    return true;
  }
}