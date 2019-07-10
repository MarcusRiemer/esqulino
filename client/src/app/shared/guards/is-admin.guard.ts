import { CanActivate, Router, UrlTree } from '@angular/router';
import { Injectable } from '@angular/core';

import { UserService } from './../auth/user.service';
import { take } from 'rxjs/operators';
import { Roles } from '../authorisation/roles.enum';

@Injectable()
export class IsAdminGuard implements CanActivate {
  constructor(
    private _router: Router,
    private _userService: UserService
  ) {}
  
  public async canActivate(): Promise<boolean | UrlTree> {
    const roles = await this._userService.roles$
                                        .pipe(take(1))
                                        .toPromise()

    console.log(`Current roles: ${roles}`);
    if (roles.includes(Roles.Admin)) {
      return this._router.parseUrl("/");
    }
    return true;
  }
}