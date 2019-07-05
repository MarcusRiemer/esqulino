import { CanActivate, Router, UrlTree } from '@angular/router';
import { Injectable } from '@angular/core';

import { UserService } from '../auth/user.service';
import { take } from 'rxjs/operators';

@Injectable()
export class LoggedInGuard implements CanActivate {
  constructor(
    private _userService: UserService,
    private _router: Router
  ) { }

  public async canActivate(): Promise<true| UrlTree> {
    console.log(`LoggedIn Guard -> ?`);
    const loggedIn = await this._userService.isLoggedIn$
                                            .pipe(take(1))
                                            .toPromise()

    console.log(`LoggedIn Guard -> ${loggedIn}`);

    if (!loggedIn)
      return this._router.parseUrl("/");

    return true;
  }
}