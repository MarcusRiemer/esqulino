import { CanActivate, Router } from '@angular/router';
import { Injectable } from '@angular/core';

import { UserService } from '../auth/user.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private _userService: UserService,
    private router: Router
  ) {}

  private _userStatus: Promise<boolean> = new Promise<boolean>((resolve, reject) => {
    this._userService.isLoggedIn$.subscribe(
      loggedIn => resolve(loggedIn),
      _ => reject(false)
    )
  });

  public async canActivate() {
    const loggedIn = await this._userStatus;
    if (!loggedIn)
      return this.router.parseUrl("/");

    return true;
  }
}